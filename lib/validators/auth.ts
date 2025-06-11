import { z } from 'zod';

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
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .max(128, { message: 'Password must be maximum 128 characters long' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message:
        'Password must contain at least one lowercase letter, one uppercase letter, and one number',
    }),
});

export type SignUpPayload = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  identifier: z
    .string({ message: 'Username/email must be a string' })
    .trim()
    .toLowerCase(),
  password: z.string({ message: 'Password must be a string' }),
});

export type SignInPayload = z.infer<typeof signInSchema>;
