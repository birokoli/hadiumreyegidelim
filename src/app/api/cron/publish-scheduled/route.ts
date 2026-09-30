import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { connectMeasurement } from '@/lib/geo-blog/publish';

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

  // scheduledAt geçmiş olan ve henüz yayınlanmamış yazıları yayınla ve ölçüme bağla
  // (odak kelime sıra takibine, sorusu AI Görünürlük'e)
  const due = await prisma.post.findMany({
    where: { published: false, scheduledAt: { lte: now, not: null } },
    select: { id: true },
  });

  let published = 0;
  for (const { id } of due) {
    const post = await prisma.post.update({ where: { id }, data: { published: true, createdAt: new Date() } });
    published++;
    await connectMeasurement(post).catch((e) => console.error('[publish-scheduled] ölçüm bağlantısı', e));
  }

  return NextResponse.json({
    ok: true,
    published,
    checkedAt: now.toISOString(),
  });
}
