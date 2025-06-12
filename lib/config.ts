import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url({ message: 'DATABASE_URL must be a valid URL' }),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PROJECT_NAME: z.string().min(1, { message: 'PROJECT_NAME cannot be empty' }),

  JWT_ACCESS_SECRET: z
    .string()
    .min(32, { message: 'JWT_ACCESS_SECRET must be at least 32 characters' }),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, { message: 'JWT_REFRESH_SECRET must be at least 32 characters' }),

  BCRYPT_ROUNDS: z.string().transform((val, ctx) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'BCRYPT_ROUNDS must be a number string',
      });

      return z.NEVER;
    }
    return parsed;
  }),

  RESEND_API_KEY: z
    .string()
    .min(1, { message: 'RESEND_API_KEY cannot be empty' }),
  RESEND_EMAIL_ADDRESS: z
    .string()
    .email({ message: 'RESEND_EMAIL_ADDRESS must be a valid email' }),

  NEXT_PUBLIC_APP_URL: z
    .string()
    .url({ message: 'NEXT_PUBLIC_APP_URL must be a valid URL' }),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    'Invalid environment variables:',
    parsedEnv.error.flatten().fieldErrors
  );

  throw new Error(
    'Invalid environment variables. Check the console for details.'
  );
}

export const config = parsedEnv.data;
