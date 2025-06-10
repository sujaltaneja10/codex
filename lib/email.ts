import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendVerificationEmail(
  name: string,
  email: string,
  verificationToken: string
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-email?token=${verificationToken}`;

  try {
    const { data, error } = await resend.emails.send({
      from: `Codex <${process.env.RESEND_EMAIL_ADDRESS}>`,
      to: [email],
      subject: 'Verify your email for Codex',
      html: `<p>Dear ${name}, this is the link to verify your email: <a href="${verificationUrl}">${verificationUrl}</a></p>`,
    });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email.');
  }
}
