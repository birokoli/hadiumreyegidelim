// Üyelerimize özel paket fiyatı (Profil 2, 14 Ekim; kullanıcı: "hepsine değil, benim eklediğim fiyatlarda açılsın").
// Yalnızca admin'de üye fiyatı tanımlanan paketlerde görünür. Kural paket başına: kişi başı yüzde ya da kişi başı tutar ($)
// indirimi; otel seçicideki her otelin fiyatına aynı kural uygulanır. Ayar: Setting "UYE_PAKET_FIYATLARI" = { slug: kural }.
export const UYE_PAKET_KEY = "UYE_PAKET_FIYATLARI";

export type UyeKural = { tip: "yuzde" | "tutar"; deger: number };

/** Ayardaki bütün paket kuralları (bozuk ya da sıfır olanlar atlanır). */
export function uyeKurallari(settings: Record<string, string | undefined>): Record<string, UyeKural> {
  try {
    const ham = JSON.parse(settings[UYE_PAKET_KEY] ?? "{}") as Record<string, UyeKural>;
    return Object.fromEntries(Object.entries(ham).filter(([, k]) => k && (k.tip === "yuzde" || k.tip === "tutar") && Number(k.deger) > 0));
  } catch {
    return {};
  }
}

export const uyeKurali = (settings: Record<string, string | undefined>, slug: string): UyeKural | null => uyeKurallari(settings)[slug] ?? null;

/** Kişi başı üye fiyatı (tam dolar, aşağı yuvarlanır); kural yoksa null. Yüzde en fazla %50, fiyat sıfırın altına inmez. */
export function uyeFiyati(fiyat: number | null | undefined, k: UyeKural | null | undefined): number | null {
  if (!fiyat || fiyat <= 0 || !k) return null;
  const sonuc = k.tip === "yuzde" ? fiyat * (1 - Math.min(50, k.deger) / 100) : fiyat - k.deger;
  const t = Math.floor(sonuc);
  return t > 0 && t < fiyat ? t : null;
}

/** Kısa açıklama: "%8" ya da "kişi başı 40 $" */
export const kuralMetni = (k: UyeKural) => (k.tip === "yuzde" ? `%${k.deger}` : `kişi başı ${k.deger.toLocaleString("tr-TR")} $`);
