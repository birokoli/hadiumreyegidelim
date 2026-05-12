import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getInfluencerSession } from '@/lib/influencer-auth';

export async function GET() {
  const session = await getInfluencerSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const influencer = await prisma.influencer.findUnique({
    where: { id: session.id },
    include: {
      sales: { orderBy: { createdAt: 'desc' }, take: 5 },
      customers: { orderBy: { createdAt: 'desc' }, take: 5 },
      shares: { orderBy: { createdAt: 'desc' }, take: 3 },
    },
  });

  if (!influencer) return NextResponse.json({ error: 'Bulunamadı.' }, { status: 404 });

  const thisMonth = new Date();
  const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);

  const monthlySales = await prisma.sale.count({
    where: { influencerId: session.id, createdAt: { gte: monthStart } },
  });

  const monthlyClicks = await prisma.linkClick.count({
    where: { influencerId: session.id, clickedAt: { gte: monthStart } },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  return NextResponse.json({
    influencer: {
      id: influencer.id,
      fullName: influencer.fullName,
      email: influencer.email,
      avatarUrl: influencer.avatarUrl,
      tier: influencer.tier,
      status: influencer.status,
      uniqueCode: influencer.uniqueCode,
      uniqueUrl: influencer.uniqueUrl,
      instagramHandle: influencer.instagramHandle,
      instagramFollowers: influencer.instagramFollowers,
    },
    stats: {
      totalSales: influencer.totalSales,
      totalEarnings: influencer.totalEarnings,
      pendingEarnings: influencer.pendingEarnings,
      totalClicks: influencer.totalClicks,
      monthlySales,
      monthlyClicks,
    },
    links: {
      trackingUrl: `${baseUrl}/r/${influencer.uniqueUrl}`,
      couponCode: influencer.uniqueCode,
    },
    recentSales: influencer.sales,
    recentCustomers: influencer.customers.map(c => ({
      id: c.id,
      name: c.fullName.split(' ').map((w: string, i: number) => i === 0 ? w : w[0] + '.').join(' '),
      status: c.status,
      createdAt: c.createdAt,
    })),
    recentShares: influencer.shares,
    // Ücretsiz umre progress: 20 satış
    freeUmreProgress: { current: influencer.totalSales, target: 20 },
  });
}
