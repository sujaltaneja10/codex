import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

type RouteHandler = (req: NextRequest, ...args: any[]) => Promise<NextResponse>;

export function withError(handler: RouteHandler) {
  return async function (req: NextRequest, ...args: any[]) {
    try {
      return await handler(req, ...args);
    } catch (error: any) {
      console.error('Caught error : ', error);

      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: 'Invalid request data',
            details: error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return NextResponse.json(
            { error: 'The requested resource was not found.' },
            { status: 404 }
          );
        }
      }

      return NextResponse.json(
        {
          error: 'Internal server error',
        },
        { status: 500 }
      );
    }
  };
}

export function withAuth(handler: RouteHandler) {}
