import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { adjustPoints } from '@/lib/loyalty';

async function getAdminSession() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

export async function GET() {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const accounts = await prisma.loyaltyAccount.findMany({
    include: {
      influencer: { select: { fullName: true, email: true, uniqueCode: true } },
    },
    orderBy: { currentBalance: 'desc' },
  });

  const totalCirculating = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  return NextResponse.json({ accounts, totalCirculating });
}

export async function POST(req: NextRequest) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { influencerId, pointsAmount, reason } = await req.json();
  if (!influencerId || pointsAmount === undefined || !reason) {
    return NextResponse.json({ error: 'Eksik parametre.' }, { status: 400 });
  }

  try {
    await adjustPoints(influencerId, pointsAmount, reason);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
