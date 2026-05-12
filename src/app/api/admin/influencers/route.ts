import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getAdminSession() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

export async function GET() {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const influencers = await prisma.influencer.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, fullName: true, email: true, phone: true,
      instagramHandle: true, instagramFollowers: true,
      tiktokHandle: true, youtubeHandle: true,
      tier: true, status: true, uniqueCode: true, uniqueUrl: true,
      totalSales: true, totalEarnings: true, pendingEarnings: true, totalClicks: true,
      createdAt: true,
      _count: { select: { shares: true, customers: true } },
    },
  });

  return NextResponse.json({ influencers });
}
