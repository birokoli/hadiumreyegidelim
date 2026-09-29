import { prisma } from "@/lib/prisma";
import { latestRuns, contentGaps, fanOutQueries } from "@/lib/ai-vis/metrics";
import type { AiVisConfig, Run } from "@/lib/ai-vis/types";

export type BlogOpportunity = {
  topic: string;
  source: "content_gap" | "tracked_keyword" | "fan_out_query" | "prompt";
  score: number;
  reason: string;
  competitorsMentioned?: string[];
};

const fold = (s: string) => s.toLocaleLowerCase("tr").replace(/[^\p{L}\p{N}\s']/gu, " ").trim();

/**
 * AI Görünürlük içerik boşlukları, fan-out sorguları ve SEO kelimelerinden öncelikli konu fırsatlarını döndürür.
 */
export async function getBlogOpportunities(): Promise<BlogOpportunity[]> {
  // 1. Mevcut postlar (çakışma engelleme)
  const posts = await prisma.post.findMany({
    select: { title: true, slug: true, focusKeyword: true, keywords: true },
  });

  const existingSet = new Set<string>();
  for (const p of posts) {
    if (p.title) existingSet.add(fold(p.title));
    if (p.focusKeyword) existingSet.add(fold(p.focusKeyword));
    if (p.keywords) {
      p.keywords.split(",").forEach((k) => existingSet.add(fold(k)));
    }
  }

  const opportunities: BlogOpportunity[] = [];
  const seenTopics = new Set<string>();

  const addOpp = (opp: BlogOpportunity) => {
    const folded = fold(opp.topic);
    if (!folded || folded.length < 4) return;

    // Tam çakışma veya yüksek kelime çakışması kontrolü
    for (const ex of existingSet) {
      if (ex.includes(folded) || folded.includes(ex)) return;
    }

    if (!seenTopics.has(folded)) {
      seenTopics.add(folded);
      opportunities.push(opp);
    }
  };

  // 2. AI Görünürlük verilerini oku
  try {
    const [configSetting, runsSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "AI_VIS_CONFIG" } }),
      prisma.setting.findUnique({ where: { key: "AI_VIS_RUNS" } }),
    ]);

    if (configSetting?.value) {
      const config: AiVisConfig = JSON.parse(configSetting.value);
      const cells: Record<string, Run[]> = runsSetting?.value ? JSON.parse(runsSetting.value) : {};

      const runs = latestRuns(cells, config);

      // (a) Content Gaps (Rakipler anılmış, biz yokuz)
      const gaps = contentGaps(runs, config);
      for (const g of gaps) {
        addOpp({
          topic: g.prompt.text,
          source: "content_gap",
          score: 90 + Math.min(10, g.competitors.length * 2),
          reason: `Rakipler (${g.competitors.join(", ")}) bu soruda yanıt alıyor, markamız hiç anılmıyor.`,
          competitorsMentioned: g.competitors,
        });
      }

      // (b) Fan-out sorguları (AI'ın yanıt üretirken arattığı ama bizim kaynak gösterilmediğimiz sorgular)
      const fanOuts = fanOutQueries(runs);
      for (const fo of fanOuts) {
        if (fo.ownCited === 0 && fo.count >= 2) {
          addOpp({
            topic: fo.query,
            source: "fan_out_query",
            score: 80 + Math.min(10, fo.count),
            reason: `AI yanıt üretirken bu sorguyu ${fo.count} kez arattı, sitemiz kaynak gösterilmedi.`,
          });
        }
      }

      // (c) Henüz anılmadığımız genel sorular
      for (const p of config.prompts) {
        addOpp({
          topic: p.text,
          source: "prompt",
          score: 65,
          reason: "AI Görünürlük takibinde yer alan hedef soru.",
        });
      }
    }
  } catch (e) {
    console.error("[opportunities] AI Vis verileri okunurken hata:", e);
  }

  // 3. SEO Takip Edilen Kelimeler
  try {
    const trackedSetting = await prisma.setting.findUnique({ where: { key: "SEO_TRACKED_KEYWORDS" } });
    if (trackedSetting?.value) {
      const keywords: string[] = JSON.parse(trackedSetting.value);
      for (const kw of keywords) {
        addOpp({
          topic: kw,
          source: "tracked_keyword",
          score: 75,
          reason: "SEO Masası'nda takip edilen hedef kelime.",
        });
      }
    }
  } catch (e) {
    console.error("[opportunities] SEO verileri okunurken hata:", e);
  }

  return opportunities.sort((a, b) => b.score - a.score);
}
