import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

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

// ─── Simple SHA-256 hash (no bcrypt dep needed) ────────
function hashPassword(pw: string): string {
  return crypto.createHash('sha256').update(pw + 'hug-salt-2026').digest('hex');
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

    // Check if a custom password hash exists in settings
    const customPasswordSetting = await prisma.setting.findUnique({ where: { key: 'ADMIN_PASSWORD_HASH' } }).catch(() => null);
    const customUsernameSetting = await prisma.setting.findUnique({ where: { key: 'ADMIN_USERNAME' } }).catch(() => null);

    const validUsername = customUsernameSetting?.value || 'Yasin';
    const inputHash = hashPassword(password);

    let passwordValid = false;
    if (customPasswordSetting?.value) {
      // Compare with stored hash
      passwordValid = customPasswordSetting.value === inputHash;
    } else {
      // Fallback to original hardcoded password
      passwordValid = password === 'Harun.28122017';
    }

    if (username === validUsername && passwordValid) {
      recordSuccess(ip);
      const response = NextResponse.json({ success: true });
      response.cookies.set({
        name: 'admin_session',
        value: 'true',
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
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
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Sunucu hatası oluştu' }, { status: 500 });
  }
}
