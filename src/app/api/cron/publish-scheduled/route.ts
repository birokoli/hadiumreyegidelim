import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: Request) {
  // Vercel cron jobs otomatik olarak Authorization: Bearer <CRON_SECRET> header'ı ekler
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();

  // scheduledAt geçmiş olan ve henüz yayınlanmamış yazıları bul ve yayınla
  const result = await prisma.post.updateMany({
    where: {
      published: false,
      scheduledAt: { lte: now, not: null },
    },
    data: {
      published: true,
    },
  });

  return NextResponse.json({
    ok: true,
    published: result.count,
    checkedAt: now.toISOString(),
  });
}
