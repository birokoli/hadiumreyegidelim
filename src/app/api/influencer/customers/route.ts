import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getInfluencerSession } from '@/lib/influencer-auth';

export async function GET() {
  const session = await getInfluencerSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const customers = await prisma.customer.findMany({
    where: { influencerId: session.id },
    orderBy: { createdAt: 'desc' },
    include: { sales: { select: { commissionAmount: true, commissionStatus: true } } },
  });

  // KVKK: isim maskeleme
  const masked = customers.map(c => ({
    id: c.id,
    name: c.fullName.split(' ').map((w: string, i: number) => i === 0 ? w : w[0] + '.').join(' '),
    source: c.source,
    status: c.status,
    createdAt: c.createdAt,
    commissionPending: c.sales.filter(s => s.commissionStatus === 'pending').reduce((a, s) => a + s.commissionAmount, 0),
    commissionEarned: c.sales.filter(s => s.commissionStatus === 'earned').reduce((a, s) => a + s.commissionAmount, 0),
  }));

  return NextResponse.json({ customers: masked });
}
