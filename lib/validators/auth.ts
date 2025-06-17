import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

const sanitize = (text: string) =>
  sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  });

const passwordField = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(128, { message: 'Password must be maximum 128 characters long' })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one lowercase letter, one uppercase letter, and one number',
  });

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name should be atleast 2 characters long' })
    .max(15, { message: 'Name must be maximum 15 characters long' })
    .trim(),
  email: z
    .string()
    .email({ message: 'Email must be in valid format' })
    .trim()
    .toLowerCase(),
  username: z
    .string()
    .min(3, { message: 'Username must be atleast 3 characters long' })
    .max(15, { message: 'Username must be maximum 15 characters long' })
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_]+$/, {
      message:
        'Username can only contain lowercase letters, numbers, and underscores.',
    }),
  password: passwordField,
});

export type SignUpPayload = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  identifier: z
    .string({ message: 'Username/email must be a string' })
    .min(3, { message: 'Username/email must be atleast 3 characters long' })
    .trim()
    .toLowerCase(),
  password: passwordField,
});

export type SignInPayload = z.infer<typeof signInSchema>;

export const forgotPasswordSchema = signInSchema.pick({ identifier: true });

export type ForgotPasswordPayload = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: passwordField,
  token: z.string(),
});

export type ResetPasswordPayload = z.infer<typeof resetPasswordSchema>;
