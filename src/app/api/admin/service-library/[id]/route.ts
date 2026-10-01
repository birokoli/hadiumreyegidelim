import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { ensureCatalogSchema } from '@/lib/catalog/schema';
import { catalogFields } from '@/lib/catalog/admin-fields';
import { revalidateCatalog } from '@/lib/catalog';

// Yetki middleware'de ("orders"); burada ayrıca imzalı oturum aranır
async function checkAdmin() {
  if (!(await getAdminSession())) return false;
  await ensureCatalogSchema();
  return true;
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
      ...catalogFields(body),
    },
  });
  revalidateCatalog();

  return NextResponse.json({ service });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { id } = await params;
  await prisma.serviceLibrary.delete({ where: { id } });
  revalidateCatalog();
  return NextResponse.json({ ok: true });
}
