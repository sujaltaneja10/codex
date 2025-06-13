import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { config } from '@/lib/config';
import { withError } from '@/lib/api/middleware';

async function verifyEmailHandler(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 400 }
    );
  }

  const hashedToken = hashToken(token);

  const dbUser = await prisma.verificationToken.findUnique({
    where: { hashedToken },
    include: { user: true },
  });

  if (!dbUser || new Date() > dbUser.expires) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 400 }
    );
  }

  const { user } = dbUser;

  // Verify email and delete token
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    }),

    prisma.verificationToken.delete({
      where: { hashedToken },
    }),
  ]);

  const accessToken = await generateAccessToken({ userId: user.id });

  const refreshToken = await generateRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      hashedToken: hashToken(refreshToken),
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  const response = NextResponse.redirect(
    new URL('/', config.NEXT_PUBLIC_APP_URL)
  );

  response.cookies.set('access-token', accessToken, {
    httpOnly: true, // for XSS
    secure: config.NODE_ENV === 'production', // HTTPS on production
    sameSite: 'strict', // CSRF
    maxAge: 60 * 15, // 15 min
    path: '/',
  });

  response.cookies.set('refresh-token', refreshToken, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // better browser support
    path: '/',
  });

  return response;
}

export const GET = withError(verifyEmailHandler);
