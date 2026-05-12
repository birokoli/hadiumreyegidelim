import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function getAdminSession() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { id } = await params;
  const { action, tier, rejectReason } = await req.json();
  // action: 'approve' | 'reject' | 'passive' | 'change_tier'

  if (action === 'approve') {
    await prisma.influencer.update({
      where: { id },
      data: { status: 'active', tier: tier || 'davetci', rejectReason: null },
    });
  } else if (action === 'reject') {
    await prisma.influencer.update({
      where: { id },
      data: { status: 'rejected', rejectReason: rejectReason || 'Belirtilmedi' },
    });
  } else if (action === 'passive') {
    await prisma.influencer.update({ where: { id }, data: { status: 'passive' } });
  } else if (action === 'change_tier') {
    await prisma.influencer.update({ where: { id }, data: { tier } });
  } else {
    return NextResponse.json({ error: 'Geçersiz işlem.' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
