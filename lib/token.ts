import { randomUUID } from 'crypto';
import { prisma } from './prisma';
import { hashToken } from './auth';
import { EmailType, sendTransactionalEmail } from './email';
import { config } from '@/lib/config';

export async function generateResetPasswordUrl({
  name,
  email,
  userId,
}: {
  name: string;
  email: string;
  userId: string;
}) {
  // Create verification token
  const verificationToken = randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const verificationUrl = `${config.NEXT_PUBLIC_APP_URL}/reset-password?token=${verificationToken}`;

  await prisma.passwordResetToken.upsert({
    where: {
      userId,
    },
    update: {
      hashedToken: hashToken(verificationToken),
      expires: expires,
    },
    create: {
      userEmail: email,
      userId,
      hashedToken: hashToken(verificationToken),
      expires: expires,
    },
  });

  await sendTransactionalEmail({
    type: EmailType.ResetPassword,
    name,
    email,
    url: verificationUrl,
  });
}

export async function generateEmailVerificationUrl({
  name,
  email,
  userId,
}: {
  name: string;
  email: string;
  userId: string;
}) {
  // Create verification token
  const verificationToken = randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const verificationUrl = `${config.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;

  await prisma.verificationToken.upsert({
    where: {
      userId,
    },
    update: {
      hashedToken: hashToken(verificationToken),
      expires: expires,
    },
    create: {
      userEmail: email,
      userId,
      hashedToken: hashToken(verificationToken),
      expires: expires,
    },
  });

  await sendTransactionalEmail({
    type: EmailType.EmailVerification,
    name,
    email,
    url: verificationUrl,
  });
}
