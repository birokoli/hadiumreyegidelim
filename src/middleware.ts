import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const hostname = req.headers.get('host') || '';
  const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const isMarketing = hostname.startsWith('marketing.');
  const isAdmin = hostname.startsWith('admin.');

  // ─── MARKETING subdomain ───────────────────────────────
  if (isMarketing || (isLocal && url.startsWith('/influencer'))) {
    // Kök "/" → /influencer/login'e yönlendir
    if (url === '/') {
      return NextResponse.redirect(new URL('/influencer/login', req.url));
    }

    // /influencer/* rotaları serbest
    if (url.startsWith('/influencer') || url.startsWith('/api/influencer') || url.startsWith('/r/')) {
      // Auth gerektiren sayfalar için cookie kontrolü
      const publicPaths = ['/influencer/login', '/influencer/apply'];
      const isPublic = publicPaths.some(p => url.startsWith(p));

      if (!isPublic && url.startsWith('/influencer') && !url.startsWith('/influencer/dashboard') === false) {
        // layout.tsx zaten yönlendiriyor, burada tekrar kontrole gerek yok
      }
      return NextResponse.next();
    }

    // Marketing subdomaininde admin veya ana site rotalarına erişim engelle
    if (!isLocal && (url.startsWith('/admin') || url === '/')) {
      return NextResponse.redirect(new URL('/influencer/login', req.url));
    }
  }

  // ─── ADMIN subdomain ──────────────────────────────────
  if (isAdmin || (!isMarketing && url.startsWith('/admin'))) {
    if (url === '/' && isAdmin) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }

    if (!isLocal && !isAdmin && url.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    const publicAdmin = ['/admin/login', '/api/admin/login'];
    if (publicAdmin.some(p => url.startsWith(p))) return NextResponse.next();

    const session = req.cookies.get('admin_session');
    if (!session || session.value !== 'true') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // ─── B2C Profil koruması ──────────────────────────────
  if (url.startsWith('/profil')) {
    if (url === '/profil/giris' || url === '/profil/uye-ol') return NextResponse.next();
    const b2c = req.cookies.get('b2c_session');
    if (!b2c?.value) return NextResponse.redirect(new URL('/profil/giris', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/admin/:path*', '/influencer/:path*', '/api/influencer/:path*', '/profil/:path*', '/r/:path*'],
};
