import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createInfluencerSession } from '@/lib/influencer-auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email ve şifre zorunlu.' }, { status: 400 });
    }

    const influencer = await prisma.influencer.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!influencer) {
      return NextResponse.json({ error: 'Email veya şifre hatalı.' }, { status: 401 });
    }

    if (influencer.status === 'rejected') {
      return NextResponse.json({ error: 'Başvurunuz reddedildi.' }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, influencer.password);
    if (!valid) {
      return NextResponse.json({ error: 'Email veya şifre hatalı.' }, { status: 401 });
    }

    const token = await createInfluencerSession({
      id: influencer.id,
      email: influencer.email,
      fullName: influencer.fullName,
      uniqueCode: influencer.uniqueCode,
    });

    const response = NextResponse.json({ success: true, status: influencer.status });
    response.cookies.set('influencer_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Sunucu hatası.' }, { status: 500 });
  }
}
