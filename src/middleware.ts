import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtKey } from '@/lib/jwt-key';

const ADMIN_PERMISSIONS = ['dashboard', 'orders', 'content', 'operations', 'marketing', 'settings', 'users'];

// Her alan adında yalnızca yöneticiye açık API'ler (tüm yöntemler)
const ADMIN_ONLY_API = ['/api/admin', '/api/ai', '/api/posts', '/api/upload', '/api/upload-sign'];
// Sitenin okuduğu ama yalnızca yöneticinin değiştirebileceği API'ler (GET dışı yöntemler)
const ADMIN_WRITE_API = ['/api/categories', '/api/authors', '/api/packages', '/api/services', '/api/guides', '/api/hotels', '/api/settings'];

const matchesPrefix = (pathname: string, prefixes: string[]) =>
  prefixes.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`));

/** Bu istek yönetici oturumu gerektiriyor mu? (giriş ve siparişin oluşturulması hariç) */
function apiNeedsAdmin(pathname: string, method: string) {
  // Giriş ve çıkış her zaman açık (çıkış, süresi dolmuş oturumu da temizleyebilmeli)
  if (pathname === '/api/admin/login' || pathname === '/api/admin/logout') return false;
  if (matchesPrefix(pathname, ADMIN_ONLY_API)) return true;
  const write = method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS';
  if (write && matchesPrefix(pathname, ADMIN_WRITE_API)) return true;
  // Sipariş listesi müşteri bilgisi içerir; siteden yalnızca POST (yeni sipariş) gelir
  if (pathname === '/api/orders' && !write) return true;
  return false;
}

function requiredAdminPermission(pathname: string) {
  if (pathname.startsWith('/admin/users') || pathname.startsWith('/api/admin/users')) return 'users';
  if (pathname.startsWith('/admin/settings') || pathname.startsWith('/api/admin/settings') || pathname.startsWith('/api/admin/company-settings')) return 'settings';
  if (pathname.startsWith('/admin/orders') || pathname.startsWith('/admin/contact') || pathname.startsWith('/admin/fiyat-teklifleri')) return 'orders';
  if (pathname.startsWith('/api/admin/orders') || pathname.startsWith('/api/admin/contact') || pathname.startsWith('/api/admin/quotations') || pathname.startsWith('/api/admin/service-library') || pathname.startsWith('/api/admin/service-prices') || pathname.startsWith('/api/admin/catalog-status')) return 'orders';
  if (pathname.startsWith('/admin/content') || pathname.startsWith('/admin/categories') || pathname.startsWith('/admin/authors') || pathname.startsWith('/admin/media')) return 'content';
  if (pathname.startsWith('/api/posts') || pathname.startsWith('/api/admin/content-pages') || pathname.startsWith('/api/categories') || pathname.startsWith('/api/authors') || pathname.startsWith('/api/admin/media')) return 'content';
  if (pathname.startsWith('/admin/packages') || pathname.startsWith('/admin/services') || pathname.startsWith('/admin/guides')) return 'operations';
  if (pathname.startsWith('/api/packages') || pathname.startsWith('/api/services') || pathname.startsWith('/api/guides')) return 'operations';
  if (pathname.startsWith('/admin/seo') || pathname.startsWith('/api/admin/seo')) return 'marketing';
  if (pathname.startsWith('/admin/influencers') || pathname.startsWith('/admin/affiliate') || pathname.startsWith('/admin/campaigns') || pathname.startsWith('/admin/support') || pathname.startsWith('/admin/whatsapp-ai')) return 'marketing';
  if (pathname.startsWith('/api/admin/influencers') || pathname.startsWith('/api/admin/affiliate') || pathname.startsWith('/api/admin/campaigns') || pathname.startsWith('/api/admin/support') || pathname.startsWith('/api/admin/loyalty') || pathname.startsWith('/api/admin/whatsapp-ai')) return 'marketing';
  if (pathname.startsWith('/admin/analytics') || pathname.startsWith('/admin/ai-logs') || pathname === '/admin' || pathname.startsWith('/api/admin/notifications')) return 'dashboard';
  return null;
}

/** İmzalı admin_token'ı doğrular; admin_session=true çerezi tek başına yetki vermez */
async function adminTokenPayload(req: NextRequest) {
  const token = req.cookies.get('admin_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, await getJwtKey());
    return payload.id && payload.email && payload.username ? payload : null;
  } catch {
    return null;
  }
}

async function hasAdminPermission(req: NextRequest, pathname: string) {
  const payload = await adminTokenPayload(req);
  if (!payload) return false;

  const required = requiredAdminPermission(pathname);
  if (!required) return true;

  const role = String(payload.role || '');
  const permissions = Array.isArray(payload.permissions) ? payload.permissions.map(String) : [];
  return role === 'super_admin' || (ADMIN_PERMISSIONS.includes(required) && permissions.includes(required));
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

  // ─── Yönetici API'leri — her alan adında ──────────────────────────────
  if (url.startsWith('/api/') && apiNeedsAdmin(url, req.method)) {
    if (!await adminTokenPayload(req)) {
      return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
    }
    if (!await hasAdminPermission(req, url)) return unauthorized(req);
    return NextResponse.next();
  }

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
    if (url.startsWith('/admin/login') || url.startsWith('/api/admin/login') || url === '/api/admin/logout') return NextResponse.next();
    if (url.startsWith('/admin') || url.startsWith('/api/admin')) {
      if (!await adminTokenPayload(req)) {
        if (url.startsWith('/api/')) return NextResponse.json({ error: 'Oturum gerekli.' }, { status: 401 });
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
    if (url.startsWith('/admin/login') || url.startsWith('/api/admin/login') || url === '/api/admin/logout') return NextResponse.next();
    if (!await adminTokenPayload(req)) {
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
