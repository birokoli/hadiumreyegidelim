// Kampanya brief'i (27 Ekim, marketing paneli yenilemesi): influencer'ın "ne paylaşacağım, nasıl anlatacağım" sorusunun cevabı.
// Şema değişikliği yok: brief Setting tablosunda "KAMPANYA_BRIEF:<campaignId>" anahtarıyla JSON olarak tutulur; admin'den düzenlenir.
import { prisma } from "@/lib/prisma";

export type BriefGorsel = { url: string; ad: string; format: "story" | "gonderi" | "kare" | "yatay" };

export type KampanyaBrief = {
  /** Kampanyanın tek cümlelik fikri: "Bir gün değil, bir tarih." */
  soz: string;
  /** Neden bu kampanya: takipçinin hangi derdine cevap veriyor */
  amac: string;
  /** Takipçiye söylenecek tek ana mesaj */
  anaMesaj: string;
  yap: string[];
  yapma: string[];
  /** Hazır açıklama metinleri; {kod} ve {link} paylaşımda kişinin koduyla dolar */
  aciklamalar: string[];
  hashtagler: string;
  gorseller: BriefGorsel[];
  /** Fiyat gibi doğrulanmış bilgiler; influencer yalnızca bunları söyler */
  bilgiler: string[];
  /** Görünür bitiş ya da paylaşım önerisi (serbest metin, ör. "2–8 Kasım teaser") */
  takvim?: string;
};

export const BOS_BRIEF: KampanyaBrief = { soz: "", amac: "", anaMesaj: "", yap: [], yapma: [], aciklamalar: [], hashtagler: "", gorseller: [], bilgiler: [] };

/** Her kampanyada geçerli kurallar (marka kılavuzu: yasaklı ifadeler, ibadet ve dürüstlük ilkeleri) */
export const GENEL_KURALLAR = {
  yap: [
    "Fiyatı ve dahil olanları yalnızca brief'teki ya da sitedeki haliyle söyleyin.",
    "Paylaşımda #işbirliği etiketini kullanın.",
    "Kendi deneyiminizi ve kendi cümlelerinizi kullanın; samimi olun.",
  ],
  yapma: [
    "İbadet anında (tavaf, namaz) poz vermeyin, sahnelemeyin.",
    "“Son yerler”, “kaçırmayın” gibi doğrulanmamış aciliyet kullanmayın.",
    "Şu ifadeleri kullanmayın: TÜRSAB, diyanetsiz, Harem’e sıfır, 7/24, kesintisiz, lüks, VIP, eşsiz, garanti, kapıda vize, Schengen, apart.",
    "Uçak bileti dahil demeyin; uçak bileti satılmaz.",
  ],
};

const anahtar = (campaignId: string) => `KAMPANYA_BRIEF:${campaignId}`;

function temizle(v: unknown): KampanyaBrief {
  const o = (v && typeof v === "object" ? v : {}) as Partial<KampanyaBrief>;
  const dizi = (x: unknown) => (Array.isArray(x) ? x.map((s) => String(s).trim()).filter(Boolean) : []);
  return {
    soz: String(o.soz ?? "").trim(),
    amac: String(o.amac ?? "").trim(),
    anaMesaj: String(o.anaMesaj ?? "").trim(),
    yap: dizi(o.yap),
    yapma: dizi(o.yapma),
    aciklamalar: dizi(o.aciklamalar),
    hashtagler: String(o.hashtagler ?? "").trim(),
    gorseller: Array.isArray(o.gorseller)
      ? o.gorseller.filter((g) => g && typeof g.url === "string" && g.url).map((g) => ({ url: g.url, ad: String(g.ad ?? ""), format: (["story", "gonderi", "kare", "yatay"].includes(g.format) ? g.format : "gonderi") as BriefGorsel["format"] }))
      : [],
    bilgiler: dizi(o.bilgiler),
    takvim: o.takvim ? String(o.takvim).trim() : undefined,
  };
}

export async function getBriefs(campaignIds: string[]): Promise<Record<string, KampanyaBrief>> {
  if (!campaignIds.length) return {};
  const rows = await prisma.setting.findMany({ where: { key: { in: campaignIds.map(anahtar) } } });
  const out: Record<string, KampanyaBrief> = {};
  for (const r of rows) {
    try { out[r.key.slice("KAMPANYA_BRIEF:".length)] = temizle(JSON.parse(r.value)); } catch { /* bozuk kayıt yok sayılır */ }
  }
  return out;
}

export async function getBrief(campaignId: string): Promise<KampanyaBrief | null> {
  return (await getBriefs([campaignId]))[campaignId] ?? null;
}

export async function saveBrief(campaignId: string, brief: unknown) {
  const value = JSON.stringify(temizle(brief));
  await prisma.setting.upsert({ where: { key: anahtar(campaignId) }, update: { value }, create: { key: anahtar(campaignId), value } });
}

/** Açıklama şablonundaki {kod} ve {link} yer tutucularını kişiye özel değerlerle doldurur */
export function kisisellestir(metin: string, kod: string, link: string) {
  return metin.replaceAll("{kod}", kod).replaceAll("{link}", link);
}
