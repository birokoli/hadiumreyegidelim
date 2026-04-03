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
    // 1. GİZLİLİK VE GÜVENLİK (Tamamen Kapatma): 
    // Eğer ana duman üzerinden /admin yazılırsa, onlara admin subdomain'ini gösterme! Direkt anasayfaya fırlat.
    if (!hostname.includes('localhost') && !hostname.startsWith('admin.')) {
      const homeUrl = new URL('/', req.url);
      return NextResponse.redirect(homeUrl);
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

  // B2C Müşteri Profili Koruması
  if (url.startsWith('/profil')) {
    // Login ve Register sayfalarını serbest bırak
    if (url === '/profil/giris' || url === '/profil/uye-ol') {
      return NextResponse.next();
    }

    const b2cCookie = req.cookies.get('b2c_session');
    if (!b2cCookie?.value) {
      return NextResponse.redirect(new URL('/profil/giris', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  // Admin ve Profil rotalarında çalışsın
  matcher: ['/', '/admin/:path*', '/profil/:path*'],
};
