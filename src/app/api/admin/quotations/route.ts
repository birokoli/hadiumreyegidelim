import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

async function checkAdmin() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

function generateQuotationNo(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `TKF-${year}-${rand}`;
}

export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const quotations = await prisma.quotation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: { select: { saleTotalUsd: true } },
    },
  });

  return NextResponse.json({ quotations });
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const body = await req.json();
  const {
    customerName, customerPhone, customerEmail,
    adultsCount, childrenCount,
    travelDate, startDate, validUntil,
    margin, usdRate, notes, items,
  } = body;

  if (!customerName) return NextResponse.json({ error: 'Müşteri adı zorunlu.' }, { status: 400 });

  let quotationNo = generateQuotationNo();
  for (let i = 0; i < 5; i++) {
    const existing = await prisma.quotation.findUnique({ where: { quotationNo } });
    if (!existing) break;
    quotationNo = generateQuotationNo();
  }

  const quotation = await prisma.quotation.create({
    data: {
      quotationNo,
      customerName,
      customerPhone: customerPhone || null,
      customerEmail: customerEmail || null,
      adultsCount: adultsCount ?? 1,
      childrenCount: childrenCount ?? 0,
      travelDate: travelDate || null,
      startDate: startDate || null,
      validUntil: validUntil || null,
      margin: margin ?? 18,
      usdRate: usdRate ?? 0,
      notes: notes || null,
      items: items?.length
        ? { create: items.map(buildItemCreate) }
        : undefined,
    },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  });

  return NextResponse.json({ quotation }, { status: 201 });
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
