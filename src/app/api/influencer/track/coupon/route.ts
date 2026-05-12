import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { couponCode } = await req.json();
    if (!couponCode) return NextResponse.json({ valid: false }, { status: 400 });

    const influencer = await prisma.influencer.findUnique({
      where: { uniqueCode: couponCode.toUpperCase().trim() },
      select: { id: true, fullName: true, status: true, uniqueCode: true },
    });

    if (!influencer || influencer.status !== 'active') {
      return NextResponse.json({ valid: false, error: 'Geçersiz kupon kodu.' });
    }

    return NextResponse.json({
      valid: true,
      influencer: { id: influencer.id, name: influencer.fullName, code: influencer.uniqueCode },
    });
  } catch {
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
