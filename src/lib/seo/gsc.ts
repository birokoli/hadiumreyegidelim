// Google Search Console API (salt okuma). Servis hesabı anahtarı Vercel'de GSC_SERVICE_ACCOUNT_JSON ortam değişkeninde;
// koda ve depoya girmez. Servis hesabı Search Console'da mülke "Kısıtlı" kullanıcı olarak eklenmiş olmalı.
import { createSign } from "crypto";
import { SITE_DOMAIN } from "./site";

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const API = "https://searchconsole.googleapis.com/webmasters/v3";

export class GscError extends Error {
  constructor(message: string, public status = 502) {
    super(message);
  }
}

type ServiceAccount = { client_email: string; private_key: string; token_uri?: string };

function account(): ServiceAccount | null {
  const raw = process.env.GSC_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;
  try {
    // Düz JSON ya da base64 kabul edilir
    const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    const sa = JSON.parse(json) as ServiceAccount;
    if (!sa.client_email || !sa.private_key) return null;
    return { ...sa, private_key: sa.private_key.replace(/\\n/g, "\n") };
  } catch {
    return null;
  }
}

export const gscConfigured = () => account() !== null;
export const gscServiceEmail = () => account()?.client_email ?? null;

let cachedToken: { value: string; exp: number } | null = null;

async function accessToken(): Promise<string> {
  const sa = account();
  if (!sa) throw new GscError("Search Console bağlı değil (GSC_SERVICE_ACCOUNT_JSON yok ya da hatalı).", 412);
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.exp - 60 > now) return cachedToken.value;

  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const tokenUri = sa.token_uri || "https://oauth2.googleapis.com/token";
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({ iss: sa.client_email, scope: SCOPE, aud: tokenUri, iat: now, exp: now + 3600 })}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(sa.private_key).toString("base64url");

  const res = await fetch(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${signature}` }),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error_description?: string };
  if (!res.ok || !json.access_token) throw new GscError(`Google girişi başarısız: ${json.error_description ?? res.status}`, 401);
  cachedToken = { value: json.access_token, exp: now + (json.expires_in ?? 3600) };
  return json.access_token;
}

async function gsc<T>(path: string, body?: unknown): Promise<T> {
  const token = await accessToken();
  const res = await fetch(`${API}${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  const json = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } };
  if (!res.ok) {
    const msg = json.error?.message ?? `HTTP ${res.status}`;
    throw new GscError(res.status === 403 ? `Search Console izni yok: servis hesabını mülke kullanıcı olarak ekleyin (${msg})` : `Search Console: ${msg}`, res.status);
  }
  return json;
}

/** Erişilebilir mülklerden siteye ait olanı seçer: önce GSC_SITE_URL, sonra alan adı mülkü, sonra adres mülkleri */
export async function resolveSite(): Promise<string> {
  if (process.env.GSC_SITE_URL?.trim()) return process.env.GSC_SITE_URL.trim();
  const { siteEntry = [] } = await gsc<{ siteEntry?: { siteUrl: string; permissionLevel: string }[] }>("/sites");
  const ours = siteEntry.filter((s) => s.siteUrl.includes(SITE_DOMAIN) && s.permissionLevel !== "siteUnverifiedUser");
  const pick = ours.find((s) => s.siteUrl === `sc-domain:${SITE_DOMAIN}`) ?? ours.find((s) => s.siteUrl === `https://${SITE_DOMAIN}/`) ?? ours[0];
  if (!pick) throw new GscError(`Servis hesabının erişebildiği ${SITE_DOMAIN} mülkü yok. Search Console → Ayarlar → Kullanıcılar ve izinler'den ekleyin.`, 403);
  return pick.siteUrl;
}

export type GscRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };

export async function searchAnalytics(site: string, body: { startDate: string; endDate: string; dimensions?: string[]; rowLimit?: number; dimensionFilterGroups?: unknown[] }) {
  const res = await gsc<{ rows?: GscRow[] }>(`/sites/${encodeURIComponent(site)}/searchAnalytics/query`, { type: "web", dataState: "all", ...body });
  return res.rows ?? [];
}
