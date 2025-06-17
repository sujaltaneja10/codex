import { initTRPC } from '@trpc/server';
import { type CreateNextContextOptions } from '@trpc/server/adapters/next';

export const createTRPCContext = async ({
  req,
  res,
}: CreateNextContextOptions) => {
  return {
    req,
    res,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
