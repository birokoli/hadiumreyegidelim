import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

function generateCode(name: string): string {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8);
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${clean}${suffix}`;
}

function generateUrl(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${clean}${suffix}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, password, phone, instagramHandle, instagramFollowers, tiktokHandle, youtubeHandle } = body;

    if (!fullName || !email || !password || !phone) {
      return NextResponse.json({ error: 'Ad, email, şifre ve telefon zorunlu.' }, { status: 400 });
    }

    const exists = await prisma.influencer.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (exists) {
      return NextResponse.json({ error: 'Bu email zaten kayıtlı.' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);

    // Unique code & url oluştur
    let uniqueCode = generateCode(fullName);
    let uniqueUrl = generateUrl(fullName);

    // Çakışma kontrolü
    let attempts = 0;
    while (await prisma.influencer.findUnique({ where: { uniqueCode } })) {
      uniqueCode = generateCode(fullName);
      if (++attempts > 10) uniqueCode = `INF${Date.now()}`;
    }
    attempts = 0;
    while (await prisma.influencer.findUnique({ where: { uniqueUrl } })) {
      uniqueUrl = generateUrl(fullName);
      if (++attempts > 10) uniqueUrl = `inf${Date.now()}`;
    }

    await prisma.influencer.create({
      data: {
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        password: hashed,
        phone: phone.trim(),
        instagramHandle: instagramHandle?.trim() || null,
        instagramFollowers: instagramFollowers ? parseInt(instagramFollowers) : 0,
        tiktokHandle: tiktokHandle?.trim() || null,
        youtubeHandle: youtubeHandle?.trim() || null,
        uniqueCode,
        uniqueUrl,
        status: 'pending',
        tier: 'davetci',
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}
