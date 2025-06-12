import { NextRequest, NextResponse } from 'next/server';
import {
  ForgotPasswordPayload,
  forgotPasswordSchema,
} from '@/lib/validators/auth';
import { prisma } from '@/lib/prisma';
import { generateResetPasswordUrl } from '@/lib/token';

export async function POST(request: NextRequest) {
  const body: ForgotPasswordPayload = await request.json();

  const validation = forgotPasswordSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error?.issues[0].message },
      { status: 400 }
    );
  }

  const { identifier } = validation.data;

  const isEmail = identifier.includes('@');

  const user = await prisma.user.findUnique({
    where: isEmail ? { email: identifier } : { username: identifier },
  });

  if (user) {
    try {
      await generateResetPasswordUrl({
        name: user.name,
        email: user.email,
        userId: user.id,
      });
    } catch (error) {
      return NextResponse.json(
        {
          message: 'Could not send email for password reset. Please try again.',
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    {
      message: 'If the account exists, a password reset e-mail will be sent.',
    },
    { status: 200 }
  );
}
