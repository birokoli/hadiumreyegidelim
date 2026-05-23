import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getConfig } from '@/lib/affiliate';
import { prisma } from '@/lib/prisma';

async function isAdmin() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  const cfg = await getConfig();
  return NextResponse.json({ config: cfg });
}

export async function PUT(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const body = await req.json();

  const allowed = [
    'baseThreshold', 'referralReduction', 'minThreshold',
    'startRate', 'maxRate', 'weightCvr', 'weightVolume', 'weightCtr',
    'starToTry', 'minWithdrawTry', 'refundWindowDays', 'attributionWindowDays',
  ] as const;

  // Filter only allowed fields
  const data: Record<string, number> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      data[key] = Number(body[key]);
    }
  }

  // Ensure config exists
  await getConfig();

  const updated = await prisma.programConfig.update({
    where: { id: 1 },
    data,
  });

  return NextResponse.json({ success: true, config: updated });
}
