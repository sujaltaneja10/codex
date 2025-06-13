import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { config } from '@/lib/config';

async function handler(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  if (authorization !== `Bearer ${config.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });

    console.log(`Cron job: Pruned ${result.count} expired refresh tokens.`);
    return NextResponse.json({ success: true, prunedCount: result.count });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { error: 'Cron job failed to execute.' },
      { status: 500 }
    );
  }
}

export const GET = handler;
