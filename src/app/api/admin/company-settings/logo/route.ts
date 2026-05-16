import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

async function checkAdmin() {
  const store = await cookies();
  return store.get('admin_session')?.value === 'true';
}

const ALLOWED_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
  if (!await checkAdmin()) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('logo') as File | null;

  if (!file) return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Sadece SVG, PNG veya JPG yükleyebilirsiniz.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Dosya 2MB sınırını aşıyor.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // SVG için temel XSS koruması: script tag'i ve on* event attribute'larını temizle
  let content: string | Buffer = buffer;
  if (file.type === 'image/svg+xml') {
    let svgText = buffer.toString('utf-8');
    svgText = svgText
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '');
    content = Buffer.from(svgText, 'utf-8');
  }

  const ext = file.type === 'image/svg+xml' ? 'svg' : file.name.split('.').pop() ?? 'png';
  const filename = `company-logo.${ext}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads');

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), content);

  const logoPath = `/uploads/${filename}`;

  const existing = await prisma.companySettings.findFirst();
  if (existing) {
    await prisma.companySettings.update({ where: { id: existing.id }, data: { logoPath } });
  } else {
    await prisma.companySettings.create({ data: { logoPath } });
  }

  return NextResponse.json({ logoPath });
}
