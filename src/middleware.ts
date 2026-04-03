import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const hostname = req.headers.get('host') || '';

  // Eğer doğrudan admin.hadiumreyegidelim.com yazılıp kök dizine (/) gelindiyse, /admin'e yönlendir
  if (url === '/' && hostname.startsWith('admin.')) {
    return NextResponse.redirect(`https://admin.hadiumreyegidelim.com/admin`);
  }

  // Sadece /admin ile başlayan istekleri kontrol et
  if (url.startsWith('/admin')) {
    // 1. ZORUNLU YÖNLENDİRME: Eğer hadiumreyegidelim.com/admin girildiyse, admin.hadiumreyegidelim.com/admin'e şutla
    if (!hostname.includes('localhost') && !hostname.startsWith('admin.')) {
      return NextResponse.redirect(`https://admin.hadiumreyegidelim.com${url}`);
    }

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

export const config = {
  // Sadece kök dizin ve /admin rotalarında çalışsın
  matcher: ['/', '/admin/:path*'],
};
