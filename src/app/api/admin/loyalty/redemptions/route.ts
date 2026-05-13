import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getAdminSession() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

export async function GET() {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const redemptions = await prisma.loyaltyRedemption.findMany({
    orderBy: { requestedAt: 'desc' },
    include: {
      account: {
        include: {
          influencer: { select: { fullName: true, email: true, bankIban: true, bankName: true } },
        },
      },
      catalogItem: true,
    },
  });

  return NextResponse.json({ redemptions });
}
