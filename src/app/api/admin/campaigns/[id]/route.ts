import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getAdmin() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      participants: {
        include: { influencer: { select: { fullName: true, email: true, instagramHandle: true } }, codeUsages: true },
      },
      codeUsages: { orderBy: { usedAt: 'desc' }, take: 20 },
    },
  });

  if (!campaign) return NextResponse.json({ error: 'Bulunamadı.' }, { status: 404 });
  return NextResponse.json({ campaign });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json();

  await prisma.campaign.update({ where: { id }, data: { status } });
  return NextResponse.json({ success: true });
}
