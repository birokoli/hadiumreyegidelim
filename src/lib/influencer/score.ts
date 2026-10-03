// Uygunluk puanı: kural tabanlı ölçümler (aktiflik, etkileşim, büyüklük) + Claude ile kitle değerlendirmesi.
// Ölçüt (kullanıcı, 3 Ekim): tesettür değil, kitlenin dindar/muhafazakâr olması ve Instagram'da aktif olmak.
import { callClaude, extractJson } from "@/lib/geo-blog/claude";
import type { IgMetrics } from "@/lib/influencer/meta";

type AudienceJudgement = { religiousAudience: boolean | null; turkishAudience: boolean | null; topicFit: number; reasons: string[] };

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["religiousAudience", "turkishAudience", "topicFit", "reasons"],
  properties: {
    religiousAudience: { type: ["boolean", "null"] },
    turkishAudience: { type: ["boolean", "null"] },
    topicFit: { type: "integer" },
    reasons: { type: "array", items: { type: "string" } },
  },
};

async function judgeAudience(m: IgMetrics): Promise<AudienceJudgement | null> {
  if (!m.bio && !m.captions.length) return null;
  const { text } = await callClaude({
    feature: "other",
    effort: "low",
    maxTokens: 2000,
    schema: SCHEMA,
    system:
      "Bir umre seyahat sitesi için Instagram içerik üreticilerini değerlendiriyorsun. Yalnızca verilen biyografi ve paylaşım metinlerine dayan; tahmin yürütme, bilmediğini null bırak. " +
      "religiousAudience: içerik dindar/muhafazakâr bir kitleye mi hitap ediyor (dini sohbet, Kur'an, siyer, hac/umre, İslami yaşam, helal seyahat, dini aile içeriği). Kıyafet tek başına ölçüt değildir. " +
      "turkishAudience: paylaşımlar ağırlıkla Türkçe mi. topicFit 0-100: umre/dini seyahat tanıtımına içerik uyumu. " +
      "reasons: en fazla 4 kısa Türkçe gerekçe, her biri metinde görülen somut bir işarete dayansın.",
    prompt: `Hesap: @${m.handle}${m.name ? ` (${m.name})` : ""}\nBiyografi: ${m.bio ?? "-"}\n\nSon paylaşım metinleri:\n${m.captions.slice(0, 15).map((c, i) => `${i + 1}. ${c.replace(/\s+/g, " ")}`).join("\n")}`,
  });
  return extractJson<AudienceJudgement>(text);
}

export type FitResult = { fitScore: number; fitReasons: string[]; religiousAudience: boolean | null };

export async function scoreProspect(m: IgMetrics): Promise<FitResult> {
  const reasons: string[] = [];
  let score = 0;

  // Aktiflik (25): son 30 günde paylaşım
  const days = m.lastPostAt ? (Date.now() - m.lastPostAt.getTime()) / 864e5 : null;
  if (days == null) reasons.push("Paylaşım tarihi okunamadı.");
  else if (days <= 7) score += 25;
  else if (days <= 30) score += 15;
  else reasons.push(`Son paylaşım ${Math.round(days)} gün önce: aktif değil.`);
  reasons.push(`Son 30 günde ${m.postsLast30} paylaşım.`);

  // Etkileşim (20)
  if (m.engagementRate != null) {
    score += m.engagementRate >= 3 ? 20 : m.engagementRate >= 1.5 ? 14 : m.engagementRate >= 0.7 ? 7 : 0;
    reasons.push(`Etkileşim oranı %${m.engagementRate.toLocaleString("tr-TR")}.`);
  }

  // Büyüklük (10): mikro/orta hesaplar komisyon modeline en uygun
  if (m.followers != null) score += m.followers >= 10000 && m.followers <= 500000 ? 10 : m.followers > 500000 ? 6 : m.followers >= 3000 ? 5 : 0;

  // Kitle ve konu (45): Claude
  let religiousAudience: boolean | null = null;
  try {
    const j = await judgeAudience(m);
    if (j) {
      religiousAudience = j.religiousAudience;
      if (j.turkishAudience === false) reasons.push("Paylaşımlar ağırlıkla Türkçe değil.");
      score += j.religiousAudience ? 20 : 0;
      score += j.turkishAudience ? 10 : 0;
      score += Math.round((Math.max(0, Math.min(100, j.topicFit)) / 100) * 15);
      reasons.push(...j.reasons.slice(0, 4));
    }
  } catch (e) {
    reasons.push(`Kitle değerlendirmesi yapılamadı: ${e instanceof Error ? e.message : String(e)}`);
  }

  // Aktif olmayan hesap üst sınır
  if (days != null && days > 30) score = Math.min(score, 35);
  // audienceTR (kitlenin Türkiye payı) Meta tarafından verilmiyor; influencer kendi istatistiğinden girilir
  return { fitScore: Math.max(0, Math.min(100, score)), fitReasons: reasons, religiousAudience };
}
