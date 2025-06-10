import { z } from 'zod';

export const signUpSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name should be atleast 2 characters long' })
    .max(15, { message: 'Name must be maximum 15 characters long' }),
  email: z.string().email({ message: 'Email must be in valid format' }),
  username: z
    .string()
    .min(3, { message: 'Username must be atleast 3 characters long' })
    .max(15, { message: 'Username must be maximum 15 characters long' }),
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
