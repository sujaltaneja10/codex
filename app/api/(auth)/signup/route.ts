import { NextRequest, NextResponse } from 'next/server';
import { signUpSchema, SignUpPayload } from '@/lib/validators/auth';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { hashToken } from '@/lib/auth';
import sendVerificationEmail from '@/lib/email';

export async function POST(request: NextRequest) {
  // Get body from user
  const body: SignUpPayload = await request.json();

  // Add zod validation
  const validation = signUpSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: validation.error.flatten() },
      { status: 400 }
    );
  }

  // Get user details
  const { name, username, email, password } = validation.data;

  const saltRounds = process.env.BCRYPT_ROUNDS
    ? parseInt(process.env.BCRYPT_ROUNDS)
    : 10;

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create new user and return error if it violates the unique constraint
  try {
    await prisma?.user.create({
      data: { name, username, email, password: hashedPassword },
    });
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

  // Send verification email to the user
  const verificationToken = randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.verificationToken.create({
    data: {
      userEmail: email,
      hashedToken: hashToken(verificationToken),
      expires,
    },
  });

  await sendVerificationEmail(name, email, verificationToken);

  return NextResponse.json(
    {
      message:
        'Signup successful. Please check your email to verify your account.',
    },
    { status: 202 }
  );
}
