import { VerificationEmail } from '@/emails/VerificationEmail';
import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendVerificationEmail(
  name: string,
  email: string,
  verificationUrl: string
) {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error('NEXT_PUBLIC_APP_URL environment variable is required');
  }

  if (!process.env.RESEND_EMAIL_ADDRESS) {
    throw new Error('RESEND_EMAIL_ADDRESS environment variable is required');
  }

  if (!process.env.PROJECT_NAME) {
    throw new Error('PROJECT_NAME environment variable is required');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.PROJECT_NAME} <${process.env.RESEND_EMAIL_ADDRESS}>`,
      to: [email],
      subject: `Verify your email for ${process.env.PROJECT_NAME}`,
      react: VerificationEmail({ name, verificationUrl }),
    });

    if (error) throw error;

    return data;
  } catch (error) {
    throw new Error('Failed to send verification email.');
  }
}
