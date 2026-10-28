import { NextResponse } from 'next/server';
import { adminKimlikDogrula, createAdminToken } from '@/lib/admin-auth';

// ─── In-memory brute force protection ─────────────────
// { ip -> { attempts, lockedUntil } }
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

function checkRateLimit(ip: string): { blocked: boolean; remaining: number; resetAt?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (record) {
    if (record.lockedUntil > now) {
      return { blocked: true, remaining: 0, resetAt: record.lockedUntil };
    }
    // Reset expired lock
    if (record.lockedUntil > 0 && record.lockedUntil <= now) {
      loginAttempts.delete(ip);
    }
  }

  const current = loginAttempts.get(ip);
  const attempts = current?.count ?? 0;
  return { blocked: false, remaining: MAX_ATTEMPTS - attempts };
}

function recordFailure(ip: string) {
  const now = Date.now();
  const record = loginAttempts.get(ip) ?? { count: 0, lockedUntil: 0 };
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
  }
  loginAttempts.set(ip, record);
}

function recordSuccess(ip: string) {
  loginAttempts.delete(ip);
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const { blocked, remaining, resetAt } = checkRateLimit(ip);

    if (blocked) {
      const minutesLeft = Math.ceil(((resetAt ?? 0) - Date.now()) / 60000);
      return NextResponse.json(
        { success: false, error: `Çok fazla başarısız deneme. ${minutesLeft} dakika sonra tekrar deneyin.` },
        { status: 429 }
      );
    }

    const { username, password } = await request.json();
    const login = String(username || '').trim();
    const rawPassword = String(password || '');

    const oturum = await adminKimlikDogrula(login, rawPassword);
    if (oturum === 'pasif') {
      recordFailure(ip);
      return NextResponse.json({ success: false, error: 'Bu yönetici hesabı pasif durumda.' }, { status: 403 });
    }
    if (oturum) {
      recordSuccess(ip);
      const adminToken = await createAdminToken(oturum);
      const response = NextResponse.json({ success: true });
      response.cookies.set({
        name: 'admin_session',
        value: 'true',
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
      });
      response.cookies.set({
        name: 'admin_token',
        value: adminToken,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60,
      });
      return response;
    }

    recordFailure(ip);
    const newRemaining = remaining - 1;
    const message = newRemaining > 0
      ? `Hatalı kullanıcı adı veya şifre. ${newRemaining} deneme hakkınız kaldı.`
      : 'Çok fazla başarısız deneme. 15 dakika beklemeniz gerekiyor.';

    return NextResponse.json({ success: false, error: message }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: 'Sunucu hatası oluştu' }, { status: 500 });
  }
}
