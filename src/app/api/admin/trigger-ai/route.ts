import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

    // Askıda kalan tüm logları FAILED yap, böylece yeni pipeline başlayabilir
    await prisma.aILog.updateMany({
      where: { status: { notIn: ['COMPLETED', 'FAILED'] } },
      data: {
        status: 'FAILED',
        details: 'Manuel tetikleme nedeniyle önceki işlem iptal edildi.',
        completedAt: new Date(),
      },
    });

    // Pipeline'ı ateşle (fire-and-forget — Vercel fonksiyon zaman aşımını beklemiyoruz)
    fetch(`${protocol}://${host}/api/cron/auto-blog`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET || ''}`,
      },
    }).catch(e => console.error('[trigger-ai] Pipeline tetiklenemedi:', e));

    return NextResponse.json({
      success: true,
      message: 'Pipeline ateşlendi. AI Logs sayfasından ilerlemeyi takip edebilirsiniz.',
    });
  } catch (err: any) {
    console.error('[trigger-ai] Hata:', err);
    return NextResponse.json({ error: 'Tetikleme başarısız.' }, { status: 500 });
  }
}
