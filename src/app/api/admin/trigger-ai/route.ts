import { NextResponse, after } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runBlogPipeline } from '@/lib/blog-pipeline';

// Pipeline 5 dakikaya kadar çalışabilir
export const maxDuration = 300;

export async function POST() {
  try {
    // 1. Takılı kalan logları temizle
    await prisma.aILog.updateMany({
      where: { status: { notIn: ['COMPLETED', 'FAILED'] } },
      data: { status: 'FAILED', details: 'Manuel tetikleme — önceki işlem temizlendi.', completedAt: new Date() },
    });

    // 2. Log girişini HEMEN oluştur — UI bu satırı anında görür
    const log = await prisma.aILog.create({
      data: { status: 'INTERNET_SEARCH', details: 'Anahtar kelime seçiliyor...' },
    });

    // 3. Response döndükten sonra pipeline'ı direkt çağır (HTTP hop yok)
    after(async () => {
      await runBlogPipeline(log.id);
    });

    return NextResponse.json({ success: true, logId: log.id });
  } catch (err: any) {
    console.error('[trigger-ai]', err);
    return NextResponse.json({ error: 'Tetikleme başarısız.' }, { status: 500 });
  }
}
