import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { paylasimNotYaz } from '@/lib/marketing/paylasim';

async function getAdminSession() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { id } = await params;
  const { shareId, action, rejectReason, note } = await req.json();

  if (!shareId || !action) return NextResponse.json({ error: 'Eksik parametre.' }, { status: 400 });
  // 27 Ekim: onayda da reddetmede de influencer'ın panelinde görünen ekip notu
  const not = typeof note === 'string' && note.trim() ? note.trim().slice(0, 500) : action === 'reject' ? (rejectReason || null) : null;
  await paylasimNotYaz(shareId, not);

  if (action === 'approve') {
    await prisma.share.update({
      where: { id: shareId },
      data: { status: 'approved', approvedAt: new Date(), approvedBy: 'admin', rejectReason: null },
    });
  } else if (action === 'reject') {
    await prisma.share.update({
      where: { id: shareId },
      data: { status: 'rejected', rejectReason: rejectReason || 'Belirtilmedi' },
    });
  }

  return NextResponse.json({ success: true });
}
