import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getInfluencerSession } from '@/lib/influencer-auth';

export async function GET() {
  const session = await getInfluencerSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const payments = await prisma.payment.findMany({
    where: { influencerId: session.id },
    orderBy: { createdAt: 'desc' },
    include: { sales: { include: { sale: true } } },
  });

  return NextResponse.json({ payments });
}
