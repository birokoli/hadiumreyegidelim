import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSessionCookie } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Lütfen tüm zorunlu alanları doldurun.' }, { status: 400 });
    }

    // Email format check
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Geçersiz e-posta formatı.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Şifreniz en az 6 karakter olmalıdır.' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Bu e-posta adresi ile zaten bir hesap oluşturulmuş.' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
      },
    });

    // Generate JWT token
    const token = await createSessionCookie({ id: newUser.id, email: newUser.email, name: newUser.name });

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

    return NextResponse.json({ success: true, message: 'Hesap başarıyla oluşturuldu.' });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Kayıt sırasında bir hata oluştu.' }, { status: 500 });
  }
}
