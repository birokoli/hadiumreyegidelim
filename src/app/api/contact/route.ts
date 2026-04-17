import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = rateLimit(ip, 'contact', 3, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Çok fazla istek. Lütfen 10 dakika bekleyin.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  try {
    const body = await request.json();
    const { name, phone, package: selectedPackage, message } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: 'İsim ve telefon numarası zorunludur.' },
        { status: 400 }
      );
    }

    const newContact = await prisma.contactRequest.create({
      data: {
        name,
        phone,
        package: selectedPackage || null,
        message: message || null,
      },
    });

    return NextResponse.json({ success: true, contact: newContact });
  } catch (error: any) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası. Talebiniz alınamadı.' },
      { status: 500 }
    );
  }
}
