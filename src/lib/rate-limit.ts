// In-memory IP-based rate limiter (resets on cold start, suitable for serverless)
type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

export function rateLimit(ip: string, key: string, maxRequests: number, windowMs: number): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const storeKey = `${key}:${ip}`;
  const entry = store.get(storeKey);

  if (!entry || now > entry.resetAt) {
    store.set(storeKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfterMs: 0 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, retryAfterMs: 0 };
}

export function getClientIp(request: Request): string {
  const headers = request.headers as any;
  return (
    headers.get?.('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get?.('x-real-ip') ||
    'unknown'
  );
}
