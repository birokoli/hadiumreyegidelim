// Instagram Business Discovery (Meta Graph API, Facebook girişi). Başka bir işletme/içerik üreticisi
// hesabının herkese açık sayılarını getirir. Kitle ülkesi ve sahte takipçi oranı bu API'de yok.
// Gerekli: META_ACCESS_TOKEN (sistem kullanıcısı), IG_BUSINESS_ACCOUNT_ID.
const GRAPH = "https://graph.facebook.com/v23.0";

export function metaConfigured() {
  return Boolean(process.env.META_ACCESS_TOKEN && process.env.IG_BUSINESS_ACCOUNT_ID);
}

type Media = { caption?: string; like_count?: number; comments_count?: number; view_count?: number; timestamp?: string; media_product_type?: string };
type Discovery = { username: string; name?: string; biography?: string; followers_count?: number; media_count?: number; media?: { data?: Media[] } };

export type IgMetrics = {
  handle: string;
  name: string | null;
  bio: string | null;
  followers: number | null;
  mediaCount: number | null;
  avgViews: number | null;
  avgLikes: number | null;
  avgComments: number | null;
  engagementRate: number | null;
  lastPostAt: Date | null;
  postsLast30: number;
  captions: string[];
};

export class MetaError extends Error {}

async function graph<T>(path: string): Promise<T> {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new MetaError("META_ACCESS_TOKEN tanımlı değil.");
  const res = await fetch(`${GRAPH}/${path}${path.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(token)}`, { cache: "no-store", signal: AbortSignal.timeout(20000) });
  const body = (await res.json().catch(() => null)) as { error?: { message?: string; code?: number } } | null;
  if (!res.ok || body?.error) {
    const e = body?.error;
    // 110 / 2207013 benzeri: hesap bulunamadı ya da kişisel (işletme değil) hesap
    throw new MetaError(e?.message ? `Meta: ${e.message}${e.code ? ` (#${e.code})` : ""}` : `Meta HTTP ${res.status}`);
  }
  return body as T;
}

const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);

/** Kullanıcı adından son 25 paylaşıma göre ölçümler */
export async function fetchIgMetrics(handle: string): Promise<IgMetrics> {
  const igId = process.env.IG_BUSINESS_ACCOUNT_ID;
  if (!igId) throw new MetaError("IG_BUSINESS_ACCOUNT_ID tanımlı değil.");
  const user = handle.replace(/^@/, "").trim().toLowerCase();
  if (!/^[a-z0-9._]{1,30}$/.test(user)) throw new MetaError("Geçersiz Instagram kullanıcı adı.");
  const fields = (withViews: boolean) =>
    `business_discovery.username(${user}){username,name,biography,followers_count,media_count,media.limit(25){caption,like_count,comments_count,timestamp,media_product_type${withViews ? ",view_count" : ""}}}`;
  let d: Discovery;
  try {
    d = (await graph<{ business_discovery: Discovery }>(`${igId}?fields=${encodeURIComponent(fields(true))}`)).business_discovery;
  } catch (e) {
    // view_count bazı sürümlerde desteklenmiyor; onsuz bir kez daha dene
    if (!(e instanceof MetaError) || !/view_count|#100\)/.test(e.message)) throw e;
    d = (await graph<{ business_discovery: Discovery }>(`${igId}?fields=${encodeURIComponent(fields(false))}`)).business_discovery;
  }
  const media = d.media?.data ?? [];
  const followers = d.followers_count ?? null;
  const likes = media.map((m) => m.like_count ?? 0);
  const comments = media.map((m) => m.comments_count ?? 0);
  const views = media.filter((m) => m.media_product_type === "REELS" && typeof m.view_count === "number").map((m) => m.view_count!);
  const times = media.map((m) => (m.timestamp ? new Date(m.timestamp).getTime() : 0)).filter(Boolean);
  const monthAgo = Date.now() - 30 * 864e5;
  const avgLikes = avg(likes);
  const avgComments = avg(comments);
  return {
    handle: user,
    name: d.name ?? null,
    bio: d.biography ?? null,
    followers,
    mediaCount: d.media_count ?? null,
    avgViews: avg(views),
    avgLikes,
    avgComments,
    engagementRate: followers && avgLikes != null ? Math.round((((avgLikes ?? 0) + (avgComments ?? 0)) / followers) * 10000) / 100 : null,
    lastPostAt: times.length ? new Date(Math.max(...times)) : null,
    postsLast30: times.filter((t) => t > monthAgo).length,
    captions: media.map((m) => (m.caption ?? "").slice(0, 400)).filter(Boolean),
  };
}

/** Admin "bağlantıyı test et": kendi hesabımızın adı ve takipçisi */
export async function testMetaConnection(): Promise<{ ok: true; username: string; followers: number | null } | { ok: false; error: string }> {
  if (!metaConfigured()) return { ok: false, error: "META_ACCESS_TOKEN veya IG_BUSINESS_ACCOUNT_ID tanımlı değil." };
  try {
    const me = await graph<{ username: string; followers_count?: number }>(`${process.env.IG_BUSINESS_ACCOUNT_ID}?fields=username,followers_count`);
    return { ok: true, username: me.username, followers: me.followers_count ?? null };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
