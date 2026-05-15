import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

async function checkAdmin() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

// GET — tüm hizmet şablonlarını listele
export async function GET() {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const services = await prisma.serviceLibrary.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
  });

  return NextResponse.json({ services });
}

// POST — yeni hizmet şablonu ekle
export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const body = await req.json();
  const { category, name, description, defaultCost, currency, unit } = body;

  if (!category || !name) return NextResponse.json({ error: 'Kategori ve isim zorunlu.' }, { status: 400 });

  const service = await prisma.serviceLibrary.create({
    data: {
      category,
      name,
      description: description || null,
      defaultCost: defaultCost ?? 0,
      currency: currency ?? 'USD',
      unit: unit || null,
    },
  });

  return NextResponse.json({ service }, { status: 201 });
}
