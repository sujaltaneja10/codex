import {
  ResetPasswordPayload,
  resetPasswordSchema,
} from '@/lib/validators/auth';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashToken } from '@/lib/auth';
import { config } from '@/lib/config';
import { withError } from '@/lib/api/middleware';

async function resetPasswordHandler(request: NextRequest) {
  const givenToken = request.nextUrl.searchParams.get('token');

  if (!givenToken) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 400 }
    );
  }

  const hashedToken = hashToken(givenToken);

  const dbUser = await prisma.passwordResetToken.findUnique({
    where: { hashedToken: hashedToken },
    include: { user: true },
  });

  if (!dbUser || new Date() > dbUser.expires) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 400 }
    );
  }

  const body: ResetPasswordPayload = await request.json();

  const validation = resetPasswordSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error?.issues[0].message },
      { status: 400 }
    );
  }

  const { user } = dbUser;
  const { password } = validation.data;

  const saltRounds = config.BCRYPT_ROUNDS;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
        },
      }),
      prisma.passwordResetToken.delete({
        where: { hashedToken: hashedToken },
      }),
    ]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Could not update password. Please try again.' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    message: 'Password reset. Please log in.',
  });
}

export const POST = withError(resetPasswordHandler);
