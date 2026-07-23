import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_PERMISSIONS = ['dashboard', 'orders', 'content', 'operations', 'marketing', 'settings', 'users'];
const adminKey = new TextEncoder().encode(process.env.JWT_SECRET || 'HADI_UMREYE_GELENE_ALLAH_RAZI_OLSUN_12345');

function requiredAdminPermission(pathname: string) {
  if (pathname.startsWith('/admin/users') || pathname.startsWith('/api/admin/users')) return 'users';
  if (pathname.startsWith('/admin/settings') || pathname.startsWith('/api/admin/settings') || pathname.startsWith('/api/admin/company-settings')) return 'settings';
  if (pathname.startsWith('/admin/orders') || pathname.startsWith('/admin/contact') || pathname.startsWith('/admin/fiyat-teklifleri')) return 'orders';
  if (pathname.startsWith('/api/admin/orders') || pathname.startsWith('/api/admin/contact') || pathname.startsWith('/api/admin/quotations') || pathname.startsWith('/api/admin/service-library')) return 'orders';
  if (pathname.startsWith('/admin/content') || pathname.startsWith('/admin/categories') || pathname.startsWith('/admin/authors') || pathname.startsWith('/admin/media')) return 'content';
  if (pathname.startsWith('/api/posts') || pathname.startsWith('/api/categories') || pathname.startsWith('/api/authors') || pathname.startsWith('/api/admin/media')) return 'content';
  if (pathname.startsWith('/admin/packages') || pathname.startsWith('/admin/services') || pathname.startsWith('/admin/guides')) return 'operations';
  if (pathname.startsWith('/api/packages') || pathname.startsWith('/api/services') || pathname.startsWith('/api/guides')) return 'operations';
  if (pathname.startsWith('/admin/influencers') || pathname.startsWith('/admin/affiliate') || pathname.startsWith('/admin/campaigns') || pathname.startsWith('/admin/support') || pathname.startsWith('/admin/whatsapp-ai')) return 'marketing';
  if (pathname.startsWith('/api/admin/influencers') || pathname.startsWith('/api/admin/affiliate') || pathname.startsWith('/api/admin/campaigns') || pathname.startsWith('/api/admin/support') || pathname.startsWith('/api/admin/loyalty') || pathname.startsWith('/api/admin/whatsapp-ai')) return 'marketing';
  if (pathname.startsWith('/admin/analytics') || pathname.startsWith('/admin/ai-logs') || pathname === '/admin' || pathname.startsWith('/api/admin/notifications')) return 'dashboard';
  return null;
}

async function hasAdminPermission(req: NextRequest, pathname: string) {
  const session = req.cookies.get('admin_session')?.value;
  if (session !== 'true') return false;

  const required = requiredAdminPermission(pathname);
  if (!required) return true;

  const token = req.cookies.get('admin_token')?.value;
  if (!token) return true;

  try {
    const { payload } = await jwtVerify(token, adminKey);
    const role = String(payload.role || '');
    const permissions = Array.isArray(payload.permissions) ? payload.permissions.map(String) : [];
    return role === 'super_admin' || permissions.includes(required) || permissions.some(permission => ADMIN_PERMISSIONS.includes(permission) && permission === required);
  } catch {
    return false;
  }
}

function unauthorized(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 });
  }
  return NextResponse.redirect(new URL('/admin', req.url));
}

export async function middleware(req: NextRequest) {
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
      if (!await hasAdminPermission(req, url)) return unauthorized(req);
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
    if (!await hasAdminPermission(req, url)) return unauthorized(req);
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
