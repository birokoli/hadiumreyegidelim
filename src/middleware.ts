import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const hostname = req.headers.get('host') || '';
  const isMarketing = hostname.startsWith('marketing.');
  const isAdmin = hostname.startsWith('admin.');
  const isLocal = hostname.includes('localhost');

  // ─── MARKETING subdomaini ─────────────────────────────────────────────
  if (isMarketing) {
    // API ve statik dosyalar geçsin
    if (url.startsWith('/api/') || url.startsWith('/_next/') || url.startsWith('/r/') || url.startsWith('/c/')) {
      return NextResponse.next();
    }
    // Influencer sayfaları zaten doğru yerde
    if (url.startsWith('/influencer')) {
      return NextResponse.next();
    }
    // Diğer her şeyi (kök dahil) influencer login'e gönder
    return NextResponse.redirect(new URL('/influencer/login', req.url));
  }

  // ─── ADMIN subdomaini ─────────────────────────────────────────────────
  if (isAdmin) {
    if (url === '/') return NextResponse.redirect(new URL('/admin', req.url));
    if (url.startsWith('/admin/login') || url.startsWith('/api/admin/login')) return NextResponse.next();
    if (url.startsWith('/admin') || url.startsWith('/api/admin')) {
      const session = req.cookies.get('admin_session');
      if (!session || session.value !== 'true') {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }
    return NextResponse.next();
  }

  // ─── Ana site — /admin koruması ───────────────────────────────────────
  if (!isLocal && url.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if (url.startsWith('/admin')) {
    if (url.startsWith('/admin/login') || url.startsWith('/api/admin/login')) return NextResponse.next();
    const session = req.cookies.get('admin_session');
    if (!session || session.value !== 'true') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // ─── B2C Profil koruması ──────────────────────────────────────────────
  if (url.startsWith('/profil')) {
    if (url === '/profil/giris' || url === '/profil/uye-ol') return NextResponse.next();
    if (!req.cookies.get('b2c_session')?.value) {
      return NextResponse.redirect(new URL('/profil/giris', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.ico).*)',
  ],
};
