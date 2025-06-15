import { withError } from '@/lib/api/middleware';
import { NextRequest, NextResponse } from 'next/server';

async function refreshHandler(request: NextRequest) {
  return NextResponse.json({ message: '' });
}

export const POST = withError(refreshHandler);
