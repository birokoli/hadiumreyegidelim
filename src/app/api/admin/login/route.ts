import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (username === 'Yasin' && password === 'Harun.28122017') {
      const response = NextResponse.json({ success: true });
      
      // HttpOnly, Secure, 30 günlük oturum çerezi
      response.cookies.set({
        name: 'admin_session',
        value: 'true',
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60, // 30 Gün
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Hatalı kullanıcı adı veya şifre' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Sunucu hatası oluştu' },
      { status: 500 }
    );
  }
}
