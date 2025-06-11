import { randomUUID } from 'crypto';
import { prisma } from './prisma';
import { hashToken } from './auth';
import sendVerificationEmail from './email';

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
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-email?token=${verificationToken}`;

  await prisma.verificationToken.upsert({
    where: {
      userEmail: email,
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

  await sendVerificationEmail(name, email, verificationUrl);
}
