import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    
    // ZORLA TETİKLEME: Önce askıda kalan (stuck) tüm logları FAILED durumuna çek.
    await prisma.aILog.updateMany({
      where: {
        status: { notIn: ['COMPLETED', 'FAILED'] }
      },
      data: {
        status: 'FAILED',
        details: 'Manuel tetikleme nedeniyle iptal edildi.'
      }
    });

    // Asynchronously trigger the cron job with the correct secret bypass
    fetch(`${protocol}://${host}/api/cron/auto-blog?phase=start`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET || ''}`
      }
    }).catch(e => console.error("Trigger fail:", e));

    return NextResponse.json({ success: true, message: "Askıdaki işlemler temizlendi ve AI yeniden motoru ateşledi." });
  } catch (err) {
    console.error("AI trigger route error:", err);
    return NextResponse.json({ error: "Tetikleme başarısız." }, { status: 500 });
  }
}
