import { NextResponse, after } from 'next/server';
import { prisma } from '@/lib/prisma';

export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

    // 1. Askıda kalan tüm logları temizle
    await prisma.aILog.updateMany({
      where: { status: { notIn: ['COMPLETED', 'FAILED'] } },
      data: {
        status: 'FAILED',
        details: 'Manuel tetikleme nedeniyle önceki işlem iptal edildi.',
        completedAt: new Date(),
      },
    });

    // 2. Log girişini HEMEN oluştur — UI bunu anında görür
    const log = await prisma.aILog.create({
      data: {
        status: 'INTERNET_SEARCH',
        topic: null,
        details: 'Manuel tetikleme — anahtar kelime seçiliyor...',
      },
    });

    // 3. after(): response döndükten SONRA pipeline'ı başlat
    // fetch() awaited değil — sadece isteği Vercel'e ilet, yanıtı bekleme.
    // Vercel auto-blog'u ayrı bir fonksiyon olarak başlatır (kendi 300s timeout'u ile).
    after(async () => {
      try {
        const url = `${protocol}://${host}/api/cron/auto-blog?force=true&logId=${log.id}`;
        const ctrl = new AbortController();
        // 10 saniye içinde bağlantı kurulamazsa abort — auto-blog zaten bağımsız çalışır
        const timer = setTimeout(() => ctrl.abort(), 10_000);
        await fetch(url, {
          method: 'GET',
          headers: { Authorization: `Bearer ${process.env.CRON_SECRET || ''}` },
          signal: ctrl.signal,
        }).finally(() => clearTimeout(timer));
      } catch {
        // AbortError veya ağ hatası — auto-blog yine de Vercel tarafında başlamış olabilir
      }
    });

    return NextResponse.json({
      success: true,
      logId: log.id,
      message: 'Pipeline başlatıldı.',
    });
  } catch (err: any) {
    console.error('[trigger-ai] Hata:', err);
    return NextResponse.json({ error: 'Tetikleme başarısız.' }, { status: 500 });
  }
}
