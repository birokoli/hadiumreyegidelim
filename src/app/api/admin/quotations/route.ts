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

// GET — tüm teklifleri listele
export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const quotations = await prisma.quotation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: { select: { salePrice: true, quantity: true, currency: true } },
    },
  });

  return NextResponse.json({ quotations });
}

// POST — yeni teklif oluştur
export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const body = await req.json();
  const { customerName, customerPhone, customerEmail, pax, travelDate, validUntil, margin, notes, items } = body;

  if (!customerName) return NextResponse.json({ error: 'Müşteri adı zorunlu.' }, { status: 400 });

  let quotationNo = generateQuotationNo();
  // Çakışma ihtimaline karşı
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
      pax: pax ?? 1,
      travelDate: travelDate || null,
      validUntil: validUntil || null,
      margin: margin ?? 20,
      notes: notes || null,
      items: items?.length
        ? {
            create: items.map((item: {
              category: string; name: string; description?: string;
              costPrice: number; salePrice: number; currency?: string;
              quantity?: number; unit?: string; sortOrder?: number;
            }, idx: number) => ({
              category: item.category,
              name: item.name,
              description: item.description || null,
              costPrice: item.costPrice,
              salePrice: item.salePrice,
              currency: item.currency ?? 'USD',
              quantity: item.quantity ?? 1,
              unit: item.unit || null,
              sortOrder: item.sortOrder ?? idx,
            })),
          }
        : undefined,
    },
    include: { items: true },
  });

  return NextResponse.json({ quotation }, { status: 201 });
}
