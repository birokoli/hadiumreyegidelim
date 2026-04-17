import { NextResponse, after } from 'next/server';
import { prisma } from '@/lib/prisma';

// after() Vercel'de response gönderildikten sonra arka planda çalışmaya devam eder.
// Bu olmadan Vercel fonksiyon return'de process kill eder, pipeline hiç başlamaz.
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

    // Askıda kalan tüm logları FAILED yap
    await prisma.aILog.updateMany({
      where: { status: { notIn: ['COMPLETED', 'FAILED'] } },
      data: {
        status: 'FAILED',
        details: 'Manuel tetikleme nedeniyle önceki işlem iptal edildi.',
        completedAt: new Date(),
      },
    });

    // after() ile pipeline'ı ateşle — response döndükten SONRA çalışır, kesilmez
    after(async () => {
      try {
        await fetch(`${protocol}://${host}/api/cron/auto-blog?force=true`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${process.env.CRON_SECRET || ''}`,
          },
        });
      } catch (e) {
        console.error('[trigger-ai] Pipeline tetiklenemedi:', e);
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Pipeline ateşlendi. AI Logs sayfasından ilerlemeyi takip edebilirsiniz.',
    });
  } catch (err: any) {
    console.error('[trigger-ai] Hata:', err);
    return NextResponse.json({ error: 'Tetikleme başarısız.' }, { status: 500 });
  }
}
