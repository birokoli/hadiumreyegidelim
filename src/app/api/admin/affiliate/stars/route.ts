import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAdjustStars } from '@/lib/affiliate';

async function isAdmin() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const body = await req.json();
  const { influencerId, delta, note } = body;

  if (!influencerId || delta === undefined || !note) {
    return NextResponse.json({ error: 'influencerId, delta ve note zorunludur.' }, { status: 400 });
  }

  try {
    await adminAdjustStars(influencerId, Number(delta), 'admin', note);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Hata oluştu.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
