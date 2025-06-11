import { hashToken } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh-token')?.value;

  if (refreshToken) {
    const hashedToken = hashToken(refreshToken);

    try {
      await prisma.refreshToken.delete({
        where: { hashedToken },
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Could not delete refresh token during logout' },
        { status: 500 }
      );
    }
  }

  const response = NextResponse.json(
    { message: 'User logged out' },
    { status: 200 }
  );

  response.cookies.set('access-token', '', { maxAge: 0, path: '/' });
  response.cookies.set('refresh-token', '', { maxAge: 0, path: '/' });

  return response;
}
