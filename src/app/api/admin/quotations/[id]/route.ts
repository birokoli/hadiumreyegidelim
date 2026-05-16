import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

async function checkAdmin() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { id } = await params;
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  });

  if (!quotation) return NextResponse.json({ error: 'Bulunamadı.' }, { status: 404 });
  return NextResponse.json({ quotation });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const {
    customerName, customerPhone, customerEmail,
    adultsCount, childrenCount,
    travelDate, startDate, validUntil,
    margin, usdRate, notes, status, items,
  } = body;

  await prisma.quotationItem.deleteMany({ where: { quotationId: id } });

  const quotation = await prisma.quotation.update({
    where: { id },
    data: {
      customerName,
      customerPhone:  customerPhone || null,
      customerEmail:  customerEmail || null,
      adultsCount:    adultsCount ?? 1,
      childrenCount:  childrenCount ?? 0,
      travelDate:     travelDate || null,
      startDate:      startDate || null,
      validUntil:     validUntil || null,
      margin:         margin ?? 18,
      usdRate:        usdRate ?? 0,
      notes:          notes || null,
      status:         status ?? 'draft',
      items: items?.length
        ? { create: items.map(buildItemCreate) }
        : undefined,
    },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  });

  return NextResponse.json({ quotation });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { id } = await params;
  await prisma.quotation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildItemCreate(item: any, idx: number) {
  return {
    category:          item.category,
    name:              item.name,
    description:       item.description || null,
    pricingType:       item.pricingType ?? 'flat',
    unitCostUsd:       item.unitCostUsd ?? 0,
    quantity:          item.quantity ?? 1,
    childPricePercent: item.childPricePercent ?? 0,
    vehicleType:       item.vehicleType || null,
    extraBedCount:     item.extraBedCount ?? 0,
    extraBedPriceUsd:  item.extraBedPriceUsd ?? 0,
    saleTotalUsd:      item.saleTotalUsd ?? 0,
    sortOrder:         item.sortOrder ?? idx,
  };
}
