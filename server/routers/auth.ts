import {
  forgotPasswordSchema,
  ResetPasswordPayload,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from '@/lib/validators/auth';
import { publicProcedure, router } from '../trpc';
import { config } from '@/lib/config';
import bcrypt from 'bcryptjs';
import { capitalizeWords } from '@/lib/utils';
import {
  generateEmailVerificationUrl,
  generateResetPasswordUrl,
} from '@/lib/token';
import { prisma } from '@/lib/prisma';
import { TRPCError } from '@trpc/server';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from '@/lib/auth';
import { setAuthCookies } from '@/lib/cookies';

export const authRouter = router({
  register: publicProcedure.input(signUpSchema).mutation(async ({ input }) => {
    const { name, username, email, password } = input;

    const userFound = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (userFound) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: `User with this ${
          userFound.email === email ? 'email' : 'username'
        } already exists.`,
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, config.BCRYPT_ROUNDS);
      const capitalizedName = capitalizeWords(name);

      const user = await prisma.user.create({
        data: {
          name: capitalizedName,
          username,
          email,
          password: hashedPassword,
        },
      });

      try {
        await generateEmailVerificationUrl({
          name: capitalizedName,
          email,
          userId: user.id,
        });
      } catch (error) {
        console.error('Failed to send verification email : ' + email);

        return {
          success: true,
          message:
            'Signup successful, but we failed to send a verification email. Please try logging in to resend it.',
        };
      }

      return {
        success: true,
        message:
          'Signup successful. Please check your email to verify your account.',
      };
    } catch (error) {
      console.error('Unexpected signup error:', error);

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred. Please try again.',
      });
    }
  }),
  login: publicProcedure
    .input(signInSchema)
    .mutation(async ({ input, ctx }) => {
      const { identifier, password } = input;

      const isEmail = identifier.includes('@');

      const user = await prisma.user.findUnique({
        where: isEmail
          ? { email: identifier.toLowerCase() }
          : { username: identifier.toLowerCase() },
      });

      if (!user || !user.password) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials.',
        });
      }

      const matchPassword = await bcrypt.compare(password, user.password);

      if (!matchPassword) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Invalid credentials.',
        });
      }

      if (!user.emailVerified) {
        await generateEmailVerificationUrl({
          name: user.name,
          email: user.email,
          userId: user.id,
        });

        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Please check your email to verify your account and log in.',
        });
      }

      const accessToken = await generateAccessToken({ userId: user.id });

      const refreshToken = await generateRefreshToken({ userId: user.id });

      await prisma.refreshToken.create({
        data: {
          userId: user.id,
          hashedToken: hashToken(refreshToken),
          expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      setAuthCookies(ctx.res, accessToken, refreshToken);
      return { success: true, accessToken };
    }),
  forgotPassword: publicProcedure
    .input(forgotPasswordSchema)
    .mutation(async ({ input }) => {
      const { identifier } = input;

      const isEmail = identifier.includes('@');

      const user = await prisma.user.findUnique({
        where: isEmail ? { email: identifier } : { username: identifier },
      });

      if (user) {
        try {
          await generateResetPasswordUrl({
            name: user.name,
            email: user.email,
            userId: user.id,
          });
        } catch (error) {
          console.error('Failed to send password reset email:', error);

          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Please try again.',
          });
        }
      }

      return {
        success: true,
        message: 'If the account exists, a password reset e-mail will be sent.',
      };
    }),
  resetPassword: publicProcedure
    .input(resetPasswordSchema)
    .mutation(async ({ input }) => {
      const { token, password } = input;

      if (!token) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired token',
        });
      }

      const hashedToken = hashToken(token);

      const dbUser = await prisma.passwordResetToken.findUnique({
        where: { hashedToken: hashedToken },
        include: { user: true },
      });

      if (!dbUser || new Date() > dbUser.expires) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Invalid or expired token',
        });
      }

      const { user } = dbUser;

      const hashedPassword = await bcrypt.hash(password, config.BCRYPT_ROUNDS);

      try {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
          }),
          prisma.passwordResetToken.delete({
            where: { hashedToken: hashedToken },
          }),
          prisma.refreshToken.deleteMany({
            where: { userId: user.id },
          }),
        ]);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not update password. Please try again.',
        });
      }

      return {
        success: true,
        message: 'Password reset. Please log in.',
      };
    }),
});
