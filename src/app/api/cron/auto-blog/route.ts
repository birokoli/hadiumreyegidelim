import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runBlogPipeline, getCompletedBlogsToday } from '@/lib/blog-pipeline';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  // Vercel Cron auth
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const force = new URL(request.url).searchParams.get('force') === 'true';

  // Auto-blog açık mı? (DB ayarı env var'a tercih eder)
  let autoBlogEnabled = process.env.AUTO_BLOG_ENABLED === 'true';
  try {
    const dbToggle = await prisma.setting.findUnique({ where: { key: 'AUTO_BLOG_ENABLED' } });
    if (dbToggle) autoBlogEnabled = dbToggle.value === 'true';
  } catch {}

  if (!autoBlogEnabled && !force) {
    return NextResponse.json({ success: true, message: 'Auto-blog devre dışı.' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY eksik' }, { status: 500 });
  }

  // Günlük dedup: bugün zaten yazıldıysa atla
  if (!force) {
    const todayCount = await getCompletedBlogsToday();
    if (todayCount > 0) {
      return NextResponse.json({ success: true, message: `Bugün zaten ${todayCount} blog yazıldı.` });
    }
  }

  // Çalışan pipeline varsa atla
  const running = await prisma.aILog.findFirst({
    where: { status: { notIn: ['COMPLETED', 'FAILED'] } },
    orderBy: { createdAt: 'desc' },
  });
  if (running) {
    return NextResponse.json({ status: 'ALREADY_RUNNING', logId: running.id });
  }

  // Log oluştur ve pipeline'ı başlat (cron sync bekleyebilir)
  const log = await prisma.aILog.create({
    data: { status: 'INTERNET_SEARCH', details: 'Cron tetikleme — anahtar kelime seçiliyor...' },
  });

  await runBlogPipeline(log.id);

  return NextResponse.json({ success: true, logId: log.id });
}
