import { SignInPayload, signInSchema } from '@/lib/validators/auth';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body: SignInPayload = await request.json();

  const validation = signInSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        error: validation.error?.issues[0].message,
      },
      { status: 400 }
    );
  }

  const { identifier, password } = validation.data;

  const isEmail = identifier.includes('@');

  const user = await prisma?.user.findUnique({
    where: isEmail
      ? { email: identifier.toLowerCase() }
      : { username: identifier.toLowerCase() },
  });

  if (!user || !user.password) {
    return NextResponse.json(
      { error: 'Invalid username or password' },
      { status: 401 }
    );
  }

  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    return NextResponse.json(
      {
        error: 'Incorrect password',
      },
      { status: 401 }
    );
  }

  //   if (!user.emailVerified) {
  //     return NextResponse.json(
  //       { error: 'Please verify your email before logging in.' },
  //       { status: 403 }
  //     );
  //   }

  const accessToken = await generateAccessToken({ userId: user.id });

  const refreshToken = await generateRefreshToken({ userId: user.id });

  await prisma?.refreshToken.create({
    data: {
      userId: user.id,
      hashedToken: hashToken(refreshToken),
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Log in the user
  const response = NextResponse.json({
    message: 'User successfully logged in',
  });

  response.cookies.set('access-token', accessToken, {
    httpOnly: true, // for XSS
    secure: process.env.NODE_ENV === 'production', // HTTPS on production
    sameSite: 'strict', // CSRF
    maxAge: 60 * 15, // 15 min
    path: '/',
  });

  response.cookies.set('refresh-token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // better browser support
    path: '/',
  });

  return response;
}
