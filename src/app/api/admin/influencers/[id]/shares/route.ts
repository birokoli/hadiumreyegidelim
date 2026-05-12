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
  const { shareId, action, rejectReason } = await req.json();

  if (!shareId || !action) return NextResponse.json({ error: 'Eksik parametre.' }, { status: 400 });

  if (action === 'approve') {
    await prisma.share.update({
      where: { id: shareId },
      data: { status: 'approved', approvedAt: new Date(), approvedBy: session.id, rejectReason: null },
    });
  } else if (action === 'reject') {
    await prisma.share.update({
      where: { id: shareId },
      data: { status: 'rejected', rejectReason: rejectReason || 'Belirtilmedi' },
    });
  }

  return NextResponse.json({ success: true });
}
