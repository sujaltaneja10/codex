import { NextRequest, NextResponse } from 'next/server';
import { signUpSchema, SignUpPayload } from '@/lib/validators/auth';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { capitalizeWords } from '@/lib/utils';
import { generateEmailVerificationUrl } from '@/lib/token';

export async function POST(request: NextRequest) {
  const body: SignUpPayload = await request.json();

  const validation = signUpSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error?.issues[0].message },
      { status: 400 }
    );
  }

  const { name, username, email, password } = validation.data;

  const saltRoundsEnv = process.env.BCRYPT_ROUNDS;
  const saltRounds = saltRoundsEnv
    ? isNaN(parseInt(saltRoundsEnv))
      ? 10
      : parseInt(saltRoundsEnv)
    : 10;

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
    if (error.code == 'P2002') {
      const target = error.meta?.target?.[0];
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
