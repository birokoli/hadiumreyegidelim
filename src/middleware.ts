import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;

  // Sadece /admin ile başlayan istekleri kontrol et
  if (url.startsWith('/admin')) {
    // Login sayfasını ve API endpointlerini hariç tut
    if (url === '/admin/login' || url.startsWith('/api/admin/login')) {
      return NextResponse.next();
    }

    const sessionCookie = req.cookies.get('admin_session');
    
    // Cookie yoksa veya geçersizse login sayfasına yönlendir
    if (!sessionCookie || sessionCookie.value !== 'true') {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Geçerli session varsa devam et
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Sadece /admin ve alt rotalarında çalışır
export const config = {
  matcher: ['/admin/:path*'],
};
