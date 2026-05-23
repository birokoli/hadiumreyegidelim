import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getInfluencerSession } from '@/lib/influencer-auth';
import {
  starBalance,
  effectiveThreshold,
  validSalesCount,
  currentRate,
  currentPeriod,
} from '@/lib/affiliate';

export async function GET() {
  const session = await getInfluencerSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const influencerId = session.id;
  const period = currentPeriod();

  const [balance, threshold, validSales, rate, influencer] = await Promise.all([
    starBalance(influencerId),
    effectiveThreshold(influencerId, period),
    validSalesCount(influencerId),
    currentRate(influencerId, period),
    prisma.influencer.findUnique({
      where: { id: influencerId },
      select: {
        programUnlocked: true,
        uniqueCode: true,
        referralsMade: {
          select: {
            id: true,
            invited: { select: { fullName: true, uniqueCode: true } },
            qualified: true,
            qualifiedPeriod: true,
          },
        },
        referralReceived: {
          select: {
            referrer: { select: { fullName: true, uniqueCode: true } },
            qualified: true,
          },
        },
      },
    }),
  ]);

  // Current period performance score
  const perfScore = await prisma.performanceScore.findUnique({
    where: {
      influencerId_period: { influencerId, period },
    },
    select: { score: true, commissionRate: true },
  });

  return NextResponse.json({
    starBalance: balance,
    starBalanceTry: balance * 0.10,
    effectiveThreshold: threshold,
    validSalesCount: validSales,
    programUnlocked: influencer?.programUnlocked ?? false,
    currentRate: rate,
    currentPeriodScore: perfScore?.score ?? null,
    currentPeriodCommissionRate: perfScore?.commissionRate ?? rate,
    referralCode: influencer?.uniqueCode ?? '',
    referralsMade: influencer?.referralsMade ?? [],
    referralReceived: influencer?.referralReceived ?? null,
    period,
  });
}
