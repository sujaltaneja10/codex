import { VerificationEmail } from '@/emails/VerificationEmail';
import { Resend } from 'resend';
import { ResetPasswordEmail } from '@/emails/ResetPasswordEmail';
import { config } from '@/lib/config';

const resend = new Resend(config.RESEND_API_KEY);

export enum EmailType {
  EmailVerification,
  ResetPassword,
}

export async function sendTransactionalEmail({
  name,
  email,
  url,
  type,
}: {
  name: string;
  email: string;
  url: string;
  type: EmailType;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${config.PROJECT_NAME} <${config.RESEND_EMAIL_ADDRESS}>`,
      to: [email],
      subject:
        type === EmailType.EmailVerification
          ? `Verify your email for ${config.PROJECT_NAME}`
          : `Reset your password for ${config.PROJECT_NAME}`,
      react:
        type === EmailType.EmailVerification
          ? VerificationEmail({ name, url })
          : ResetPasswordEmail({ name, url }),
    });

    if (error) throw error;

    return data;
  } catch (error) {
    throw new Error('Failed to send email.');
  }
}
