import { NextRequest, NextResponse } from 'next/server';
import { signUpSchema, SignUpPayload } from '@/lib/validators/auth';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { capitalizeWords } from '@/lib/utils';
import { generateEmailVerificationUrl } from '@/lib/token';
import { config } from '@/lib/config';
import { Prisma } from '@prisma/client';
import { withError } from '@/lib/api/middleware';

async function signupHandler(request: NextRequest) {
  const body: SignUpPayload = await request.json();

  const validation = signUpSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error?.issues[0].message },
      { status: 400 }
    );
  }

  const { name, username, email, password } = validation.data;

  const saltRounds = config.BCRYPT_ROUNDS;

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const capitalizedName = capitalizeWords(name);

  let userId: string;
  try {
    const user = await prisma.user.create({
      data: {
        name: capitalizedName,
        username,
        email,
        password: hashedPassword,
      },
    });

    userId = user.id;
  } catch (error: any) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const target = (error.meta?.target as string[])?.[0] || 'details';
      return NextResponse.json(
        { error: `User with this ${target} already exists` },
        { status: 409 }
      );
    }
    throw error;
  }

  try {
    await generateEmailVerificationUrl({
      name: capitalizedName,
      email,
      userId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          'Signup successful. Please try to logging in to resend email for verification.',
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      message:
        'Signup successful. Please check your email to verify your account.',
    },
    { status: 202 }
  );
}

export const POST = withError(signupHandler);
