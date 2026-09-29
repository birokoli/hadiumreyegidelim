// Oturum token'larını (admin, influencer, B2C) imzalayan ortak anahtar.
// JWT_SECRET tanımlıysa o kullanılır. Tanımlı değilse anahtar, depoda görünmeyen
// sunucu sırrından (DATABASE_URL) türetilir; böylece kaynak koddaki sabit bir
// değerle token taklit edilemez. Web Crypto kullanır: middleware'de de çalışır.

let cached: Promise<Uint8Array> | null = null;

async function derive(): Promise<Uint8Array> {
  const secret = process.env.JWT_SECRET?.trim();
  if (secret) return new TextEncoder().encode(secret);

  const base = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!base) throw new Error('JWT_SECRET ya da DATABASE_URL tanımlı olmalı.');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`hug-session-key:${base}`));
  return new Uint8Array(digest);
}

export function getJwtKey(): Promise<Uint8Array> {
  cached ??= derive();
  return cached;
}

export const jwtSecretConfigured = () => Boolean(process.env.JWT_SECRET?.trim());
