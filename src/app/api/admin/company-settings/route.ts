import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

async function checkAdmin() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

async function getOrCreate() {
  const existing = await prisma.companySettings.findFirst();
  if (existing) return existing;
  return prisma.companySettings.create({ data: {} });
}

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  const settings = await getOrCreate();
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const body = await req.json();
  const { defaultMargin, defaultUsdRate } = body;

  const settings = await getOrCreate();
  const updated = await prisma.companySettings.update({
    where: { id: settings.id },
    data: {
      defaultMargin:  defaultMargin  ?? settings.defaultMargin,
      defaultUsdRate: defaultUsdRate ?? settings.defaultUsdRate,
    },
  });

  return NextResponse.json({ settings: updated });
}
