import { signUpSchema } from '@/lib/validators/auth';
import { publicProcedure, router } from '../trpc';

export const authRouter = router({
  signUp: publicProcedure.input(signUpSchema).mutation(async ({ input }) => {}),
});
