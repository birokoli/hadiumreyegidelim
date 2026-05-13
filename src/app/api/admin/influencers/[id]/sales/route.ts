import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { awardPointsForSale, reversePointsForRefund } from '@/lib/loyalty';

async function getAdminSession() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

// Satış fiyatına göre komisyon oranı belirle
function getCommissionRate(saleAmount: number): number {
  if (saleAmount < 18000) return 0.015;
  if (saleAmount < 28000) return 0.018;
  if (saleAmount < 45000) return 0.020;
  return 0.025;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { id: influencerId } = await params;
  const body = await req.json();
  const { customerName, customerPhone, umrePackage, saleAmount, notes, customCommissionRate } = body;

  if (!customerName || !customerPhone || !saleAmount) {
    return NextResponse.json({ error: 'Eksik parametre.' }, { status: 400 });
  }

  const commissionRate = customCommissionRate ?? getCommissionRate(Number(saleAmount));
  const commissionAmount = Number(saleAmount) * commissionRate;

  // Müşteri oluştur veya bul
  let customer = await prisma.customer.findFirst({
    where: { phone: customerPhone, influencerId },
  });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        fullName: customerName,
        phone: customerPhone,
        influencerId,
        source: 'manual_phone',
        status: 'contracted',
      },
    });
  }

  const sale = await prisma.sale.create({
    data: {
      customerId: customer.id,
      influencerId,
      umrePackage,
      saleAmount: Number(saleAmount),
      commissionRate,
      commissionAmount,
      lockedCommissionRate: commissionRate,
      commissionStatus: 'pending',
      notes,
      refundDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({ success: true, sale });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { id: influencerId } = await params;
  const { saleId, action } = await req.json();

  if (!saleId || !action) return NextResponse.json({ error: 'Eksik parametre.' }, { status: 400 });

  const sale = await prisma.sale.findUnique({ where: { id: saleId } });
  if (!sale || sale.influencerId !== influencerId) {
    return NextResponse.json({ error: 'Satış bulunamadı.' }, { status: 404 });
  }

  if (action === 'complete') {
    await prisma.sale.update({
      where: { id: saleId },
      data: { commissionStatus: 'earned', completionDate: new Date() },
    });
    // Puan ver
    await awardPointsForSale(saleId);
    // Influencer istatistiklerini güncelle
    await prisma.influencer.update({
      where: { id: influencerId },
      data: {
        totalSales: { increment: 1 },
        totalEarnings: { increment: sale.commissionAmount },
        pendingEarnings: { increment: sale.commissionAmount },
      },
    });
  } else if (action === 'refund') {
    await prisma.sale.update({
      where: { id: saleId },
      data: { commissionStatus: 'refunded' },
    });
    await reversePointsForRefund(saleId);
    await prisma.influencer.update({
      where: { id: influencerId },
      data: {
        totalSales: { decrement: 1 },
        totalEarnings: { decrement: sale.commissionAmount },
        pendingEarnings: { decrement: sale.commissionAmount },
      },
    });
  }

  return NextResponse.json({ success: true });
}
