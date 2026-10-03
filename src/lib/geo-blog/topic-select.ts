// Blog motoru v2: konu seçimi (docs/BLOG-MOTORU.md). Hedef: yamyamlık yok, kümeler arasında dönüş,
// satış sayfalarının baş aramaları korunur, gerçek talep (Search Console) öne çıkar.
import { prisma } from "@/lib/prisma";
import { getBlogOpportunities, similarity, words, type BlogOpportunity } from "@/lib/geo-blog/opportunities";
import { CLUSTERS, clusterOf, reservedHead } from "@/lib/geo-blog/clusters";
import { findBannedTerms } from "@/lib/geo-blog/external-policy";
import { gscConfigured, resolveSite, searchAnalytics } from "@/lib/seo/gsc";

export type TopicCandidate = BlogOpportunity & { cluster: string; finalScore: number; note?: string };
export type UpdateSuggestion = { topic: string; postSlug: string; postTitle: string; reason: string; at: string };

const QUEUE_KEY = "BLOG_TOPIC_QUEUE";
const UPDATES_KEY = "BLOG_UPDATE_SUGGESTIONS";
const BLOCK_KEY = "BLOG_TOPIC_BLOCK";
const PIN_KEY = "BLOG_TOPIC_PIN";
const SIM_SAME = 0.5; // aynı kümede bu benzerlikte yazı varsa yeni yazı yok
const WEEK_LIMIT = 2; // bir kümeye 7 günde en fazla taslak

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const row = await prisma.setting.findUnique({ where: { key } }).catch(() => null);
  try {
    return row ? (JSON.parse(row.value) as T) : fallback;
  } catch {
    return fallback;
  }
}
const writeJson = (key: string, v: unknown) => prisma.setting.upsert({ where: { key }, update: { value: JSON.stringify(v) }, create: { key, value: JSON.stringify(v) } });

/** Search Console: son 28 günde gösterim alan, bizim en iyi sıramızın 10'dan kötü olduğu aramalar */
async function gscCandidates(): Promise<{ topics: BlogOpportunity[]; top10: Set<string> }> {
  const top10 = new Set<string>();
  if (!gscConfigured()) return { topics: [], top10 };
  try {
    const site = await resolveSite();
    const end = new Date(Date.now() - 2 * 864e5);
    const start = new Date(end.getTime() - 28 * 864e5);
    const ymd = (d: Date) => d.toISOString().slice(0, 10);
    const rows = await searchAnalytics(site, { startDate: ymd(start), endDate: ymd(end), dimensions: ["query"], rowLimit: 500 });
    const topics: BlogOpportunity[] = [];
    for (const r of rows) {
      const q = r.keys[0];
      if (r.position <= 10) {
        top10.add(q);
        continue;
      }
      if (r.impressions < 10 || q.split(/\s+/).length < 3) continue; // uzun kuyruk, gerçek talep
      topics.push({ topic: q, source: "tracked_keyword", score: 60 + Math.min(30, Math.round(Math.log10(r.impressions) * 10)), reason: `Search Console: 28 günde ${r.impressions} gösterim, ortalama sıra ${r.position.toFixed(1)}.` });
    }
    return { topics, top10 };
  } catch (e) {
    console.error("[topic-select] Search Console okunamadı", e);
    return { topics: [], top10 };
  }
}

/**
 * Sıradaki konuları seçer. n: kaç konu (her biri farklı kümeden). Kuyruk ve güncelleme önerileri Setting'e yazılır.
 */
export async function pickTopics(n = 1): Promise<TopicCandidate[]> {
  const [posts, base, gsc, blocked, pinned] = await Promise.all([
    prisma.post.findMany({ select: { slug: true, title: true, focusKeyword: true, published: true, createdAt: true } }),
    getBlogOpportunities().catch(() => [] as BlogOpportunity[]),
    gscCandidates(),
    readJson<string[]>(BLOCK_KEY, []),
    readJson<string[]>(PIN_KEY, []),
  ]);

  const existing = posts.map((p) => ({ ...p, w: words(`${p.title} ${p.focusKeyword ?? ""} ${p.slug.replace(/-/g, " ")}`), cluster: clusterOf(`${p.title} ${p.focusKeyword ?? ""}`)?.id ?? null }));
  const weekAgo = Date.now() - 7 * 864e5;
  const recentByCluster = new Map<string, number>();
  const totalByCluster = new Map<string, number>();
  for (const p of existing) {
    if (!p.cluster) continue;
    totalByCluster.set(p.cluster, (totalByCluster.get(p.cluster) ?? 0) + 1);
    if (p.createdAt.getTime() > weekAgo) recentByCluster.set(p.cluster, (recentByCluster.get(p.cluster) ?? 0) + 1);
  }
  const maxTotal = Math.max(1, ...totalByCluster.values());

  const seeds: BlogOpportunity[] = CLUSTERS.flatMap((c) => c.seeds.map((s) => ({ topic: s, source: "prompt" as const, score: 55, reason: `${c.label} kümesi tohum konusu.` })));
  const pins: BlogOpportunity[] = pinned.map((t) => ({ topic: t, source: "prompt" as const, score: 200, reason: "Admin'de öne alındı." }));
  const all = [...pins, ...base, ...gsc.topics, ...seeds];

  const blockedW = blocked.map(words);
  const suggestions: UpdateSuggestion[] = [];
  const accepted: TopicCandidate[] = [];
  const queue: TopicCandidate[] = [];
  const usedClusters = new Set<string>();
  const seenTopics: Set<string>[] = [];

  for (const o of all) {
    const topic = o.topic.trim();
    if (!topic || findBannedTerms(topic).length) continue;
    const w = words(topic);
    if (w.size < 2 || seenTopics.some((s) => similarity(w, s) >= 0.8)) continue;
    seenTopics.push(w);
    if (blockedW.some((b) => similarity(w, b) >= 0.8)) continue;
    const cluster = clusterOf(topic);
    if (!cluster) continue;
    if (reservedHead(topic)) continue; // baş arama: satış sayfasının
    if ([...gsc.top10].some((q) => similarity(w, words(q)) >= 0.8)) continue; // zaten ilk 10'dayız

    const clash = existing.find((p) => similarity(w, p.w) >= SIM_SAME && (!p.cluster || p.cluster === cluster.id));
    if (clash) {
      if (clash.published) suggestions.push({ topic, postSlug: clash.slug, postTitle: clash.title, reason: `"${topic}" bu yazıyla aynı niyette; yeni yazı yerine güncellenmeli.`, at: new Date().toISOString() });
      continue;
    }
    const freshness = 1 + (maxTotal - (totalByCluster.get(cluster.id) ?? 0)) / maxTotal; // az yazılı küme öne
    const cand: TopicCandidate = { ...o, topic, cluster: cluster.id, finalScore: Math.round(o.score * freshness) };
    queue.push(cand);
  }

  queue.sort((a, b) => b.finalScore - a.finalScore);
  for (const c of queue) {
    if (accepted.length >= n) break;
    if (usedClusters.has(c.cluster)) continue;
    if ((recentByCluster.get(c.cluster) ?? 0) >= WEEK_LIMIT) continue;
    accepted.push(c);
    usedClusters.add(c.cluster);
  }

  // Admin kuyruğu ve güncelleme önerileri (son 30, aynı yazı için tek öneri)
  const prev = await readJson<UpdateSuggestion[]>(UPDATES_KEY, []);
  const merged = [...suggestions, ...prev].filter((s, i, arr) => arr.findIndex((x) => x.postSlug === s.postSlug) === i).slice(0, 30);
  await Promise.all([writeJson(QUEUE_KEY, queue.slice(0, 15)), writeJson(UPDATES_KEY, merged)]).catch(() => {});
  if (accepted.some((a) => a.score === 200)) {
    await writeJson(PIN_KEY, pinned.filter((t) => !accepted.some((a) => a.topic === t))).catch(() => {});
  }
  return accepted;
}

export const TOPIC_KEYS = { QUEUE_KEY, UPDATES_KEY, BLOCK_KEY, PIN_KEY };
