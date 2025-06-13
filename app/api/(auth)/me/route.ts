import { AuthenticatedUser, withAuth, withError } from '@/lib/api/middleware';
import { NextRequest, NextResponse } from 'next/server';

const meHandler = async (
  request: NextRequest,
  { user }: { user: AuthenticatedUser }
) => {
  return NextResponse.json(user);
};

export const GET = withError(withAuth(meHandler));
