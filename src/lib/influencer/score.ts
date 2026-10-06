// Uygunluk puanı: kural tabanlı ölçümler (aktiflik, etkileşim, büyüklük) + Claude ile kitle değerlendirmesi.
// Ölçüt (kullanıcı, 3 Ekim): tesettür değil, kitlenin dindar/muhafazakâr olması ve Instagram'da aktif olmak.
import { callClaude, extractJson } from "@/lib/geo-blog/claude";
import type { IgMetrics } from "@/lib/influencer/meta";

export type AccountType = "influencer" | "isletme" | "din_adami" | "sayfa" | "diger";
type AudienceJudgement = { accountType: AccountType; religiousAudience: boolean | null; turkishAudience: boolean | null; topicFit: number; reasons: string[] };

const NOT_INFLUENCER: Record<Exclude<AccountType, "influencer">, string> = {
  isletme: "Acente, firma ya da kurumsal hesap: influencer değil.",
  din_adami: "Klasik hoca/vaaz hesabı: influencer gibi içerik üretmiyor.",
  sayfa: "Fan, alıntı ya da haber sayfası: kişisel influencer değil.",
  diger: "Kişisel influencer hesabı olduğu anlaşılamadı.",
};
// Hedef (kullanıcı, 6 Ekim): 10–50 bin takipçili mikro influencer; 60 bine kadar tolerans
export const MIN_FOLLOWERS = 10000;
export const MAX_FOLLOWERS = 60000;
export const inRange = (f: number | null | undefined) => f != null && f >= MIN_FOLLOWERS && f <= MAX_FOLLOWERS;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["accountType", "religiousAudience", "turkishAudience", "topicFit", "reasons"],
  properties: {
    accountType: { type: "string", enum: ["influencer", "isletme", "din_adami", "sayfa", "diger"] },
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
      "Bir umre seyahat sitesi için deneyimli bir influencer pazarlamacısı gibi Instagram hesaplarını değerlendiriyorsun. Yalnızca verilen biyografi ve paylaşım metinlerine dayan; tahmin yürütme, bilmediğini null bırak. " +
      "accountType: influencer = kişisel marka kuran içerik üreticisi (yaşam tarzı, tesettür modası, aile/anne, gezi, manevi motivasyon vb.); isletme = turizm acentesi, umre/hac firması, otel, mağaza, dernek/vakıf, kurum; din_adami = yalnızca vaaz/sohbet kesitleri paylaşan klasik hoca/imam; sayfa = fan, alıntı, derleme, haber sayfası; diger = anlaşılamayan. " +
      "religiousAudience: içerik dindar/muhafazakâr bir kitleye mi hitap ediyor (dini sohbet, Kur'an, siyer, hac/umre, İslami yaşam, helal seyahat, dini aile içeriği). Kıyafet tek başına ölçüt değildir. " +
      "turkishAudience: paylaşımlar ağırlıkla Türkçe mi. topicFit 0-100: umre/dini seyahat tanıtımına içerik uyumu. " +
      "reasons: en fazla 4 kısa Türkçe gerekçe, her biri metinde görülen somut bir işarete dayansın.",
    prompt: `Hesap: @${m.handle}${m.name ? ` (${m.name})` : ""}\nBiyografi: ${m.bio ?? "-"}\n\nSon paylaşım metinleri:\n${m.captions.slice(0, 15).map((c, i) => `${i + 1}. ${c.replace(/\s+/g, " ")}`).join("\n")}`,
  });
  return extractJson<AudienceJudgement>(text);
}

export type FitResult = { fitScore: number; fitReasons: string[]; religiousAudience: boolean | null; accountType: AccountType | null };

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

  // Büyüklük (10): 30 bin – 1 milyon en uygun; 20 binin altı influencer sayılmaz
  if (m.followers != null) {
    score += m.followers >= MIN_FOLLOWERS && m.followers <= 50000 ? 15 : m.followers <= MAX_FOLLOWERS && m.followers > 50000 ? 8 : 0;
    reasons.push(`${m.followers.toLocaleString("tr-TR")} takipçi.`);
  }

  // Kitle ve konu (45): Claude
  let religiousAudience: boolean | null = null;
  let accountType: AccountType | null = null;
  try {
    const j = await judgeAudience(m);
    if (j) {
      religiousAudience = j.religiousAudience;
      accountType = j.accountType;
      if (j.accountType !== "influencer") reasons.unshift(NOT_INFLUENCER[j.accountType] ?? NOT_INFLUENCER.diger);
      if (j.turkishAudience === false) reasons.push("Paylaşımlar ağırlıkla Türkçe değil.");
      score += j.religiousAudience ? 20 : 0;
      score += j.turkishAudience ? 10 : 0;
      score += Math.round((Math.max(0, Math.min(100, j.topicFit)) / 100) * 15);
      reasons.push(...j.reasons.slice(0, 4));
    }
  } catch (e) {
    reasons.push(`Kitle değerlendirmesi yapılamadı: ${e instanceof Error ? e.message : String(e)}`);
  }

  // Üst sınırlar: aktif olmayan 35; influencer olmayan (acente, hoca, sayfa) ve 10 binin altı 15; 60 binin üstü 20
  if (days != null && days > 30) score = Math.min(score, 35);
  if (accountType && accountType !== "influencer") score = Math.min(score, 15);
  if (m.followers != null && m.followers < MIN_FOLLOWERS) {
    score = Math.min(score, 15);
    reasons.unshift(`Takipçi ${MIN_FOLLOWERS.toLocaleString("tr-TR")}'in altında: influencer ölçeğinde değil.`);
  }
  if (m.followers != null && m.followers > MAX_FOLLOWERS) {
    score = Math.min(score, 20);
    reasons.unshift(`Hedef dışı: ${m.followers.toLocaleString("tr-TR")} takipçi (hedef 10–50 bin mikro influencer).`);
  }
  // audienceTR (kitlenin Türkiye payı) Meta tarafından verilmiyor; influencer kendi istatistiğinden girilir
  return { fitScore: Math.max(0, Math.min(100, score)), fitReasons: reasons, religiousAudience, accountType };
}
