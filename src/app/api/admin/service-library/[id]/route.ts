import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

async function checkAdmin() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

// PUT — güncelle
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { category, name, description, defaultCost, currency, unit, isActive } = body;

  const service = await prisma.serviceLibrary.update({
    where: { id },
    data: {
      category,
      name,
      description: description || null,
      defaultCost: defaultCost ?? 0,
      currency: currency ?? 'USD',
      unit: unit || null,
      isActive: isActive ?? true,
    },
  });

  return NextResponse.json({ service });
}

// DELETE — sil
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const { id } = await params;
  await prisma.serviceLibrary.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
