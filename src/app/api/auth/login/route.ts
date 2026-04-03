import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSessionCookie } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Lütfen tüm alanları doldurun.' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'E-posta veya şifre hatalı.' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'E-posta veya şifre hatalı.' }, { status: 401 });
    }

    // Generate JWT token
    const token = await createSessionCookie({ id: user.id, email: user.email, name: user.name });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'b2c_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({ success: true, message: 'Giriş başarılı.' });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Giriş sırasında bir hata oluştu.' }, { status: 500 });
  }
}
