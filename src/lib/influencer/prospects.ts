// Influencer aday havuzu: ekleme, Instagram ölçümleriyle zenginleştirme + puanlama, keşif, davet.
import type { InfluencerProspect } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { ensureProspectSchema } from "@/lib/influencer/schema";
import { fetchIgMetrics, metaConfigured, type IgMetrics } from "@/lib/influencer/meta";
import { researchInfluencers } from "@/lib/influencer/research";
import { MIN_FOLLOWERS, scoreProspect } from "@/lib/influencer/score";
import { dfsPost, isDataforseoConfigured } from "@/lib/seo/dataforseo";
import { DFS_LANGUAGE_CODE, DFS_LOCATION_CODE } from "@/lib/seo/site";

// Influencer başvurusu pazarlama alt alan adında (kullanıcı, 3 Ekim)
const MARKETING_URL = "https://marketing.hadiumreyegidelim.com";

export const PLATFORMS = ["instagram", "tiktok", "youtube"] as const;
export type Platform = (typeof PLATFORMS)[number];
export const STAGES = ["bulundu", "uygun", "mesaj", "yanit", "anlasildi", "red"] as const;
export type Stage = (typeof STAGES)[number];

export function toDto(p: InfluencerProspect) {
  return {
    id: p.id,
    platform: p.platform as Platform,
    handle: p.handle,
    url: p.url,
    name: p.name ?? p.handle,
    bio: p.bio,
    followers: p.followers,
    avgViews: p.avgViews,
    avgLikes: p.avgLikes,
    avgComments: p.avgComments,
    engagementRate: p.engagementRate,
    lastPostAt: p.lastPostAt?.toISOString() ?? null,
    postsLast30: p.postsLast30,
    audienceTR: p.audienceTR,
    fitScore: p.fitScore,
    fitReasons: p.fitReasons,
    religiousAudience: p.religiousAudience,
    stage: p.stage as Stage,
    source: p.source,
    note: p.note,
    metricsAt: p.metricsAt?.toISOString() ?? null,
    metricsError: p.metricsError,
    invitedAt: p.invitedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

const PROFILE_URL: Record<Platform, (h: string) => string> = {
  instagram: (h) => `https://www.instagram.com/${h}/`,
  tiktok: (h) => `https://www.tiktok.com/@${h}`,
  youtube: (h) => `https://www.youtube.com/@${h}`,
};

/** "@ad", "instagram.com/ad/", tam bağlantı → "ad" */
export function normalizeHandle(platform: Platform, input: string): string | null {
  let h = input.trim();
  const m =
    platform === "instagram" ? h.match(/instagram\.com\/([A-Za-z0-9._]+)/) : platform === "tiktok" ? h.match(/tiktok\.com\/@([A-Za-z0-9._]+)/) : h.match(/youtube\.com\/@([A-Za-z0-9._-]+)/);
  if (m) h = m[1];
  h = h.replace(/^@/, "").toLowerCase();
  const reserved = ["p", "reel", "reels", "explore", "stories", "tv", "accounts", "about", "developer", "legal", "directory", "watch", "channel", "c", "shorts", "tag", "discover"];
  if (!h || reserved.includes(h)) return null;
  return /^[a-z0-9._-]{2,30}$/.test(h) ? h : null;
}

export async function listProspects(f: { stage?: string; q?: string; minScore?: number }) {
  await ensureProspectSchema();
  const rows = await prisma.influencerProspect.findMany({
    where: {
      ...(f.stage && STAGES.includes(f.stage as Stage) ? { stage: f.stage } : {}),
      ...(f.q ? { OR: [{ handle: { contains: f.q, mode: "insensitive" } }, { name: { contains: f.q, mode: "insensitive" } }, { note: { contains: f.q, mode: "insensitive" } }] } : {}),
      ...(f.minScore ? { fitScore: { gte: f.minScore } } : {}),
    },
    orderBy: [{ fitScore: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    take: 500,
  });
  const counts = await prisma.influencerProspect.groupBy({ by: ["stage"], _count: true });
  return { items: rows.map(toDto), counts: Object.fromEntries(counts.map((c) => [c.stage, c._count])) };
}

export async function getProspect(id: string) {
  await ensureProspectSchema();
  const p = await prisma.influencerProspect.findUnique({ where: { id } });
  return p ? toDto(p) : null;
}

/** IgMetrics → tablo alanları */
function metricsData(m: IgMetrics) {
  return {
    name: m.name,
    bio: m.bio,
    followers: m.followers,
    mediaCount: m.mediaCount,
    avgViews: m.avgViews,
    avgLikes: m.avgLikes,
    avgComments: m.avgComments,
    engagementRate: m.engagementRate,
    lastPostAt: m.lastPostAt,
    postsLast30: m.postsLast30,
    metricsAt: new Date(),
    metricsError: null,
  };
}

/** Puanı yazar. Keşifle gelen aday influencer değilse (acente, hoca, sayfa, küçük hesap) otomatik "red"e alınır. */
async function saveScore(p: { id: string; source: string; stage: string }, m: IgMetrics) {
  const fit = await scoreProspect(m);
  const notFit = (fit.accountType !== null && fit.accountType !== "influencer") || (m.followers ?? 0) < MIN_FOLLOWERS;
  const autoRed = p.source !== "manuel" && p.stage === "bulundu" && notFit;
  return prisma.influencerProspect.update({
    where: { id: p.id },
    data: { fitScore: fit.fitScore, fitReasons: fit.fitReasons, religiousAudience: fit.religiousAudience, ...(autoRed ? { stage: "red" } : {}) },
  });
}

const metaHint = (msg: string) => (/#110|cannot be found|2207013|Invalid user id/i.test(msg) ? " Hesap kişisel olabilir; yalnızca işletme/içerik üreticisi hesapları okunabilir." : "");

/** Instagram ölçümlerini çeker ve puanlar. Hata kaydı satıra yazılır, istisna fırlatılmaz. */
export async function refreshProspect(id: string) {
  await ensureProspectSchema();
  const p = await prisma.influencerProspect.findUnique({ where: { id } });
  if (!p) throw new Error("Aday bulunamadı.");
  if (p.platform !== "instagram") {
    return toDto(await prisma.influencerProspect.update({ where: { id }, data: { metricsError: "Otomatik ölçüm şimdilik yalnızca Instagram için var.", metricsAt: new Date() } }));
  }
  if (!metaConfigured()) {
    return toDto(await prisma.influencerProspect.update({ where: { id }, data: { metricsError: "Meta bağlantısı tanımlı değil (META_ACCESS_TOKEN, IG_BUSINESS_ACCOUNT_ID)." } }));
  }
  try {
    const m = await fetchIgMetrics(p.handle);
    await prisma.influencerProspect.update({ where: { id }, data: { ...metricsData(m), name: m.name ?? p.name } });
    return toDto(await saveScore(p, m));
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return toDto(await prisma.influencerProspect.update({ where: { id }, data: { metricsError: msg + metaHint(msg), metricsAt: new Date() } }));
  }
}

export async function addProspect(input: { platform: Platform; handle: string; name?: string; note?: string; source?: string }) {
  await ensureProspectSchema();
  const handle = normalizeHandle(input.platform, input.handle);
  if (!handle) throw new Error("Kullanıcı adı ya da bağlantı geçersiz.");
  const existing = await prisma.influencerProspect.findUnique({ where: { platform_handle: { platform: input.platform, handle } } });
  if (existing) return { item: toDto(existing), created: false };
  const row = await prisma.influencerProspect.create({
    data: { platform: input.platform, handle, url: PROFILE_URL[input.platform](handle), name: input.name || null, note: input.note || null, source: input.source ?? "manuel" },
  });
  return { item: await refreshProspect(row.id), created: true };
}

async function inBatches<T, R>(xs: T[], size: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < xs.length; i += size) out.push(...(await Promise.all(xs.slice(i, i + size).map(fn))));
  return out;
}

async function googleCandidates(query: string, platform: Platform) {
  if (!isDataforseoConfigured()) throw new Error("DataForSEO tanımlı değil.");
  const site = platform === "instagram" ? "instagram.com" : platform === "tiktok" ? "tiktok.com" : "youtube.com";
  const { result } = await dfsPost<{ items?: { type: string; url?: string; title?: string }[] }>(
    "/v3/serp/google/organic/live/advanced",
    [{ keyword: `site:${site} ${query}`, location_code: DFS_LOCATION_CODE, language_code: DFS_LANGUAGE_CODE, depth: 50 }],
    { timeoutMs: 45000 },
  );
  const found = new Map<string, { name?: string; why?: string }>();
  for (const it of result?.items ?? []) {
    if (it.type !== "organic" || !it.url) continue;
    const h = normalizeHandle(platform, it.url);
    if (h && !found.has(h)) found.set(h, { name: it.title?.split(/[(•|@]/)[0]?.trim() || undefined });
  }
  return found;
}

export type DiscoverMode = "ai" | "google";

/**
 * Keşif. "ai" (varsayılan): Claude influencer pazarlamacısı gibi web'de araştırıp aday önerir.
 * "google": Google'da "site:instagram.com <arama>" taraması. Her iki yolda da Instagram adayları Meta'dan gerçek
 * sayılarla doğrulanır; okunamayan ve 20 binin altındaki hesaplar havuza hiç eklenmez. İlk `score` tanesi hemen
 * puanlanır, kalanlar günlük yenilemede puanlanır.
 */
export async function discoverProspects(query: string, platform: Platform, mode: DiscoverMode = "ai", score = 6) {
  await ensureProspectSchema();
  const existing = await prisma.influencerProspect.findMany({ where: { platform }, select: { handle: true } });
  const known = new Set(existing.map((e) => e.handle));

  let found: Map<string, { name?: string; why?: string }>;
  if (mode === "ai" && platform === "instagram") {
    const list = await researchInfluencers(query, [...known]);
    found = new Map();
    for (const c of list) {
      const h = normalizeHandle("instagram", c.handle);
      if (h && !found.has(h)) found.set(h, { name: c.name, why: c.why });
    }
  } else {
    found = await googleCandidates(query, platform);
  }
  const fresh = [...found].filter(([h]) => !known.has(h));
  const source = `${mode === "ai" ? "araştırma" : "google"}: ${query}`.slice(0, 120);
  const summary = { found: found.size, alreadyKnown: found.size - fresh.length, added: 0, tooSmall: 0, unreadable: 0, scored: 0 };

  // TikTok / YouTube: ölçüm yok, yalnızca listeye eklenir
  if (platform !== "instagram" || !metaConfigured()) {
    if (fresh.length) {
      await prisma.influencerProspect.createMany({
        data: fresh.map(([handle, c]) => ({ platform, handle, url: PROFILE_URL[platform](handle), name: c.name ?? null, note: c.why ?? null, source })),
        skipDuplicates: true,
      });
    }
    summary.added = fresh.length;
    return summary;
  }

  // Instagram: önce doğrula, sonra ekle
  const verified = await inBatches(fresh, 5, async ([handle, c]) => {
    try {
      return { handle, c, m: await fetchIgMetrics(handle) };
    } catch {
      return { handle, c, m: null };
    }
  });
  const kept: { handle: string; c: { name?: string; why?: string }; m: IgMetrics }[] = [];
  for (const v of verified) {
    if (!v.m) summary.unreadable++;
    else if ((v.m.followers ?? 0) < MIN_FOLLOWERS) summary.tooSmall++;
    else kept.push({ handle: v.handle, c: v.c, m: v.m });
  }
  kept.sort((a, b) => (b.m.engagementRate ?? 0) - (a.m.engagementRate ?? 0));
  const rows = await inBatches(kept, 5, ({ handle, c, m }) =>
    prisma.influencerProspect.create({ data: { platform, handle, url: PROFILE_URL.instagram(handle), source, note: c.why ?? null, ...metricsData(m), name: m.name ?? c.name ?? null } }),
  );
  summary.added = rows.length;
  await inBatches(rows.slice(0, score).map((r, i) => ({ r, m: kept[i].m })), 3, async ({ r, m }) => {
    try {
      await saveScore(r, m);
      summary.scored++;
    } catch (e) {
      console.error("[influencer] puanlama", r.handle, e);
    }
  });
  return summary;
}

export async function setStage(id: string, stage: Stage) {
  await ensureProspectSchema();
  return toDto(await prisma.influencerProspect.update({ where: { id }, data: { stage } }));
}

export async function setNote(id: string, note: string, audienceTR?: number | null) {
  await ensureProspectSchema();
  return toDto(
    await prisma.influencerProspect.update({
      where: { id },
      data: { note: note.trim() || null, ...(audienceTR !== undefined ? { audienceTR: audienceTR == null ? null : Math.max(0, Math.min(100, audienceTR)) } : {}) },
    }),
  );
}

/** Başvuru sayfasına aday bilgisiyle giden bağlantı; aday "mesaj" aşamasına geçer */
export async function createInvite(id: string) {
  await ensureProspectSchema();
  const p = await prisma.influencerProspect.update({
    where: { id },
    data: { invitedAt: new Date(), stage: "mesaj" },
  });
  const params = new URLSearchParams({ davet: p.id, [p.platform]: p.handle });
  return { item: toDto(p), inviteUrl: `${MARKETING_URL}/influencer/apply?${params}` };
}

/** Günlük: puanlanmamış ya da 7 günden eski ölçümlü Instagram adaylarını yeniler. */
export async function refreshStale(limit = 15) {
  await ensureProspectSchema();
  const weekAgo = new Date(Date.now() - 7 * 864e5);
  const rows = await prisma.influencerProspect.findMany({
    where: { platform: "instagram", stage: { not: "red" }, OR: [{ metricsAt: null }, { fitScore: null }, { metricsAt: { lt: weekAgo } }] },
    orderBy: { metricsAt: { sort: "asc", nulls: "first" } },
    take: limit,
    select: { id: true },
  });
  for (const r of rows) await refreshProspect(r.id);
  return rows.length;
}

/** Admin "yeniden puanla": ölçümü en eski 12 Instagram adayını (red hariç) yeniler; tıklama başına bir parti. */
export async function rescoreBatch(limit = 12) {
  await ensureProspectSchema();
  const rows = await prisma.influencerProspect.findMany({
    where: { platform: "instagram", stage: { not: "red" } },
    orderBy: { metricsAt: { sort: "asc", nulls: "first" } },
    take: limit,
    select: { id: true },
  });
  await inBatches(rows, 3, (r) => refreshProspect(r.id));
  return rows.length;
}
