import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

async function isAdmin() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { id } = await params;
  const { override } = await req.json();

  await prisma.influencer.update({
    where: { id },
    data: { baseThrOverride: override === null || override === undefined ? null : Number(override) },
  });

  return NextResponse.json({ success: true });
}
