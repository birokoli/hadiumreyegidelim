import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { approveRedemption, rejectRedemption } from '@/lib/loyalty';

async function getAdminSession() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { id } = await params;
  const { action, reason } = await req.json();

  try {
    if (action === 'approve') {
      await approveRedemption(id, 'admin');
    } else if (action === 'reject') {
      await rejectRedemption(id, 'admin', reason || 'Belirtilmedi');
    } else {
      return NextResponse.json({ error: 'Geçersiz aksiyon.' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
