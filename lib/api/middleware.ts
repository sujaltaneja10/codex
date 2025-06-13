import { Prisma, User } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { verifyJwt } from '../auth';
import { prisma } from '@/lib/prisma';

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

export type AuthenticatedUser = Omit<User, 'password'>;

type AuthenticatedRouteHandler = (
  req: NextRequest,
  context: { user: AuthenticatedUser }
) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedRouteHandler) {
  return async function (request: NextRequest) {
    // Get access token from cookies
    const token = request.cookies.get('access-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const decodedPayload = await verifyJwt(token);

      const { userId } = decodedPayload;

      if (!userId || typeof userId !== 'string') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      let user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          id: true,
          email: true,
          username: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      return await handler(request, { user });
    } catch (error) {
      console.error('Authentication error in withAuth HOF:', { error });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  };
}
