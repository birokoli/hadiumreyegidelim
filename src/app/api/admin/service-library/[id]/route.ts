import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

async function checkAdmin() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const {
    category, name, description,
    defaultPricingType, defaultCostUsd,
    defaultVehicleType, defaultChildPercent, defaultExtraBedPrice,
    isActive,
  } = body;

  const service = await prisma.serviceLibrary.update({
    where: { id },
    data: {
      category,
      name,
      description:          description || null,
      defaultPricingType:   defaultPricingType ?? 'flat',
      defaultCostUsd:       defaultCostUsd ?? 0,
      defaultVehicleType:   defaultVehicleType || null,
      defaultChildPercent:  defaultChildPercent ?? 0,
      defaultExtraBedPrice: defaultExtraBedPrice ?? 0,
      isActive:             isActive ?? true,
    },
  });

  return NextResponse.json({ service });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { id } = await params;
  await prisma.serviceLibrary.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
