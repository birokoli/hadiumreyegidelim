import { prisma } from "@/lib/prisma";
import { contentGaps, fanOutQueries, latestRuns } from "@/lib/ai-vis/metrics";
import { loadCells, loadConfig } from "@/lib/ai-vis/store";
import { readJson, SEO_KEYS } from "@/lib/seo/store";
import type { TrackedKeyword } from "@/lib/seo/types";
import { findBannedTerms } from "@/lib/geo-blog/external-policy";

export type BlogOpportunity = {
  topic: string;
  source: "content_gap" | "tracked_keyword" | "fan_out_query" | "prompt";
  score: number;
  reason: string;
  competitorsMentioned?: string[];
};

const STOP = new Set(["ve", "ile", "için", "bir", "bu", "mi", "mı", "mu", "mü", "ne", "nasıl", "nedir", "hangi", "en", "da", "de", "2025", "2026", "2027"]);
const words = (s: string) =>
  new Set(
    s
      .toLocaleLowerCase("tr")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );

function similarity(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const w of a) if (b.has(w)) inter++;
  return inter / Math.min(a.size, b.size);
}

/**
 * Yazı fırsatları, öncelik sırasıyla:
 * 1) rakiplerin anılıp markanın anılmadığı AI soruları (içerik boşluğu)
 * 2) AI'ın yanıt öncesi en az iki kez arattığı ama sitemizi kaynak göstermediği aramalar
 * 3) takip edilen, ilk 10'da olmayan SEO kelimeleri
 * 4) markanın hiçbir motorda anılmadığı AI soruları
 * Mevcut bir yazının başlığı/odak kelimesiyle büyük ölçüde örtüşen konular elenir.
 */
export async function getBlogOpportunities(): Promise<BlogOpportunity[]> {
  const posts = await prisma.post.findMany({ select: { title: true, focusKeyword: true } }).catch(() => []);
  const existing = posts.flatMap((p) => [p.title, p.focusKeyword].filter((x): x is string => Boolean(x)).map(words));

  const out: BlogOpportunity[] = [];
  const seen: Set<string>[] = [];
  const add = (opp: BlogOpportunity) => {
    // Yasaklı kelime (TÜRSAB, diyanetsiz) içeren konu yazılmaz
    if (findBannedTerms(opp.topic).length) return;
    const w = words(opp.topic);
    if (w.size < 2) return;
    // Konu, mevcut bir yazının kelimelerinin çoğunu zaten kapsıyorsa yazılmış say
    if (existing.some((e) => similarity(w, e) >= 0.75)) return;
    if (seen.some((s) => similarity(w, s) >= 0.8)) return;
    seen.push(w);
    out.push(opp);
  };

  try {
    const [config, cells] = await Promise.all([loadConfig(), loadCells()]);
    const runs = latestRuns(cells, config);

    for (const g of contentGaps(runs, config)) {
      add({
        topic: g.prompt.text,
        source: "content_gap",
        score: 90 + Math.min(10, g.competitors.length * 2),
        reason: `Rakipler (${g.competitors.join(", ")}) bu soruya verilen AI yanıtlarında anılıyor, marka anılmıyor.`,
        competitorsMentioned: g.competitors,
      });
    }

    for (const fo of fanOutQueries(runs)) {
      if (fo.ownCited === 0 && fo.count >= 2) {
        add({ topic: fo.query, source: "fan_out_query", score: 80 + Math.min(10, fo.count), reason: `AI yanıt öncesi bu aramayı ${fo.count} kez yaptı; sitemiz kaynak gösterilmedi.` });
      }
    }

    // Markalı olmayan ve hiçbir motorda markanın anılmadığı sorular
    for (const p of config.prompts) {
      const pr = runs.filter((r) => r.promptId === p.id && r.a.countable);
      if (pr.length && !pr.some((r) => r.a.brandMentioned)) {
        add({ topic: p.text, source: "prompt", score: 70, reason: `${pr.length} AI yanıtının hiçbirinde marka anılmıyor.` });
      }
    }
  } catch (e) {
    console.error("[opportunities] AI Görünürlük verisi okunamadı:", e);
  }

  try {
    const tracked = await readJson<TrackedKeyword[]>(SEO_KEYS.tracked, []);
    for (const t of tracked) {
      const pos = t.history.at(-1)?.position ?? null;
      if (pos !== null && pos <= 10) continue;
      add({
        topic: t.keyword,
        source: "tracked_keyword",
        score: pos === null ? 76 : 74,
        reason: pos === null ? (t.history.length ? "Takip edilen kelime; Google'da ilk 50'de yok." : "Takip edilen kelime; henüz sıra kontrolü yapılmadı.") : `Takip edilen kelime; Google'da ${pos}. sırada.`,
      });
    }
  } catch (e) {
    console.error("[opportunities] SEO kelimeleri okunamadı:", e);
  }

  return out.sort((a, b) => b.score - a.score);
}
