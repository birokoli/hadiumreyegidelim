import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyInfluencerToken } from '@/lib/influencer-auth';
import { buildAccountSummary } from '@/lib/loyalty';
import { cookies } from 'next/headers';

async function getSession() {
  const store = await cookies();
  const token = store.get('influencer_session')?.value;
  if (!token) return null;
  return verifyInfluencerToken(token);
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  let account = await prisma.loyaltyAccount.findUnique({
    where: { influencerId: session.id },
  });

  if (!account) {
    const now = new Date();
    account = await prisma.loyaltyAccount.create({
      data: {
        influencerId: session.id,
        currentMonthYear: now.getFullYear(),
        currentMonthNumber: now.getMonth() + 1,
        currentYear: now.getFullYear(),
      },
    });
  }

  const summary = buildAccountSummary(account);

  // Son 10 işlem
  const transactions = await prisma.loyaltyTransaction.findMany({
    where: { accountId: account.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Bekleyen talepler
  const pendingRedemptions = await prisma.loyaltyRedemption.findMany({
    where: { accountId: account.id, status: 'pending' },
    orderBy: { requestedAt: 'desc' },
  });

  return NextResponse.json({ account: summary, transactions, pendingRedemptions });
}
