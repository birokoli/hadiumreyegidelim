import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
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
