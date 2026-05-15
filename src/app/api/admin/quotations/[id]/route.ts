import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

async function checkAdmin() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

// GET — tek teklifi getir
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

// PUT — teklifi güncelle
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { customerName, customerPhone, customerEmail, pax, travelDate, validUntil, margin, notes, status, items } = body;

  // Önce eski item'ları sil, yenilerini ekle
  await prisma.quotationItem.deleteMany({ where: { quotationId: id } });

  const quotation = await prisma.quotation.update({
    where: { id },
    data: {
      customerName,
      customerPhone: customerPhone || null,
      customerEmail: customerEmail || null,
      pax: pax ?? 1,
      travelDate: travelDate || null,
      validUntil: validUntil || null,
      margin: margin ?? 20,
      notes: notes || null,
      status: status ?? 'draft',
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
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  });

  return NextResponse.json({ quotation });
}

// DELETE — teklifi sil
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { id } = await params;
  await prisma.quotation.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
