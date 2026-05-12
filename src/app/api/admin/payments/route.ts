import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getAdminSession() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

export async function GET() {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      influencer: { select: { fullName: true, email: true, bankIban: true, bankName: true } },
      sales: { include: { sale: true } },
    },
  });

  return NextResponse.json({ payments });
}

export async function POST(req: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { paymentId, action } = await req.json();
  if (!paymentId || !action) return NextResponse.json({ error: 'Eksik parametre.' }, { status: 400 });

  if (action === 'approve') {
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'approved', approvedBy: 'admin', approvedAt: new Date() },
    });
    // Influencer pendingEarnings güncelle
    await prisma.influencer.update({
      where: { id: payment.influencerId },
      data: { pendingEarnings: { decrement: payment.netAmount } },
    });
  } else if (action === 'paid') {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'paid', paidAt: new Date() },
    });
  } else if (action === 'cancel') {
    await prisma.payment.update({ where: { id: paymentId }, data: { status: 'cancelled' } });
  }

  return NextResponse.json({ success: true });
}
