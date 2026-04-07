import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');
    
    if (!sessionCookie || sessionCookie.value !== 'true') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });

    let csvRows = ['Sipariş ID,Oluşturulma Tarihi,Kişi Sayısı,Toplam Tutar (USD),Sipariş Durumu,Müşteri Bilgileri,Seçilen Ekstralar,Uçuş Seçimi,Otel Seçimi'];
    
    for (const order of orders) {
      const row = [
        order.id,
        new Date(order.createdAt).toLocaleDateString('tr-TR'),
        order.pax.toString(),
        order.totalUSD.toString(),
        order.status,
        `"${(order.contactInfo || '').replace(/"/g, '""')}"`,
        `"${(order.extras || '').replace(/"/g, '""')}"`,
        `"${(order.flight || '').replace(/"/g, '""')}"`,
        `"${(order.hotel || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    }

    const csvString = '\uFEFF' + csvRows.join('\n'); // BOM for valid UTF-8 Excel parsing

    return new NextResponse(csvString, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="hadiumreyegidelim_siparisler.csv"',
      },
    });
  } catch (error) {
    console.error('CSV Export Error:', error);
    return new NextResponse('Sunucu hatası', { status: 500 });
  }
}
