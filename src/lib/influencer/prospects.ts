// Influencer aday havuzu: ekleme, Instagram ölçümleriyle zenginleştirme + puanlama, keşif, davet.
import type { InfluencerProspect } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { ensureProspectSchema } from "@/lib/influencer/schema";
import { fetchIgMetrics, metaConfigured } from "@/lib/influencer/meta";
import { scoreProspect } from "@/lib/influencer/score";
import { dfsPost, isDataforseoConfigured } from "@/lib/seo/dataforseo";
import { DFS_LANGUAGE_CODE, DFS_LOCATION_CODE, SITE_URL } from "@/lib/seo/site";

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
    const fit = await scoreProspect(m);
    return toDto(
      await prisma.influencerProspect.update({
        where: { id },
        data: {
          name: m.name ?? p.name,
          bio: m.bio,
          followers: m.followers,
          mediaCount: m.mediaCount,
          avgViews: m.avgViews,
          avgLikes: m.avgLikes,
          avgComments: m.avgComments,
          engagementRate: m.engagementRate,
          lastPostAt: m.lastPostAt,
          postsLast30: m.postsLast30,
          fitScore: fit.fitScore,
          fitReasons: fit.fitReasons,
          religiousAudience: fit.religiousAudience,
          metricsAt: new Date(),
          metricsError: null,
        },
      }),
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Kişisel (işletme/içerik üreticisi olmayan) hesaplar Business Discovery'de görünmez
    const hint = /#110|cannot be found|2207013|Invalid user id/i.test(msg) ? " Hesap kişisel olabilir; yalnızca işletme/içerik üreticisi hesapları okunabilir." : "";
    return toDto(await prisma.influencerProspect.update({ where: { id }, data: { metricsError: msg + hint, metricsAt: new Date() } }));
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

/**
 * Keşif: Google'da (DataForSEO) "site:instagram.com <arama>" sonuçlarından profil adlarını çıkarır,
 * yenileri havuza ekler. En fazla `enrich` tanesi hemen ölçülür; kalanlar haftalık yenilemede ölçülür.
 */
export async function discoverProspects(query: string, platform: Platform, enrich = 6) {
  await ensureProspectSchema();
  if (!isDataforseoConfigured()) throw new Error("DataForSEO tanımlı değil.");
  const site = platform === "instagram" ? "instagram.com" : platform === "tiktok" ? "tiktok.com" : "youtube.com";
  const { result, cost } = await dfsPost<{ items?: { type: string; url?: string; title?: string }[] }>(
    "/v3/serp/google/organic/live/advanced",
    [{ keyword: `site:${site} ${query}`, location_code: DFS_LOCATION_CODE, language_code: DFS_LANGUAGE_CODE, depth: 50 }],
    { timeoutMs: 45000 },
  );
  const found = new Map<string, string | undefined>();
  for (const it of result?.items ?? []) {
    if (it.type !== "organic" || !it.url) continue;
    const h = normalizeHandle(platform, it.url);
    if (h && !found.has(h)) found.set(h, it.title?.split(/[(•|@]/)[0]?.trim() || undefined);
  }
  const existing = await prisma.influencerProspect.findMany({ where: { platform, handle: { in: [...found.keys()] } }, select: { handle: true } });
  const known = new Set(existing.map((e) => e.handle));
  const fresh = [...found].filter(([h]) => !known.has(h));
  if (fresh.length) {
    await prisma.influencerProspect.createMany({
      data: fresh.map(([handle, name]) => ({ platform, handle, url: PROFILE_URL[platform](handle), name: name ?? null, source: `keşif: ${query}`.slice(0, 120) })),
      skipDuplicates: true,
    });
  }
  const toEnrich = await prisma.influencerProspect.findMany({ where: { platform, handle: { in: fresh.slice(0, enrich).map(([h]) => h) } }, select: { id: true } });
  for (const r of toEnrich) await refreshProspect(r.id);
  return { found: found.size, added: fresh.length, enriched: toEnrich.length, cost };
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
  return { item: toDto(p), inviteUrl: `${SITE_URL}/influencer/apply?${params}` };
}

/** Haftalık: 7 günden eski (ya da hiç ölçülmemiş) Instagram adaylarını yeniler. */
export async function refreshStale(limit = 15) {
  await ensureProspectSchema();
  const weekAgo = new Date(Date.now() - 7 * 864e5);
  const rows = await prisma.influencerProspect.findMany({
    where: { platform: "instagram", stage: { not: "red" }, OR: [{ metricsAt: null }, { metricsAt: { lt: weekAgo } }] },
    orderBy: { metricsAt: { sort: "asc", nulls: "first" } },
    take: limit,
    select: { id: true },
  });
  for (const r of rows) await refreshProspect(r.id);
  return rows.length;
}
