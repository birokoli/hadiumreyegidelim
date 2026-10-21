// Sunucu: paketin "… $'dan başlayan" fiyatı ve paket sayfası otel seçicisinin verisi (katalog + ödeme ayarları).
import { getCatalog, monthsFrom, monthLabel, paymentSettingsFrom, type CatalogItem } from "@/lib/catalog";
import { paketGorseli } from "@/lib/hotels/galeri";
import { getSiteSettings } from "@/lib/site-settings";
import { packageHotels, packagePreset, type PackagePreset } from "@/lib/pricing/package";
import { parseTransferSlug } from "@/lib/catalog/transfers";
import { uyeFiyati, uyeKurali, uyeKurallari, type UyeKural } from "@/lib/pricing/uye";
import { netPaket, netPaketTablosu } from "@/lib/pricing/net-paket";

/** Net fiyatlı pakette kartta gösterilen fiyat: tablodaki en düşük kişi başı fiyat ($, vize, KDV ve kart payı dahil) */
async function netBaslangic(slug: string): Promise<number | null> {
  const cfg = netPaket(slug);
  if (!cfg) return null;
  const sonuc = netPaketTablosu(cfg, await getCatalog());
  return sonuc ? Math.min(...sonuc.tablo.map((t) => t.kisiBasiUsd)) : null;
}

export type PackagePricing = { preset: PackagePreset; catalog: CatalogItem[]; month: string; monthLabel: string; packagePercent: number; fromPrice: number; uyeKural: UyeKural | null };

export async function getPackagePricing(slug: string): Promise<PackagePricing | null> {
  const preset = packagePreset(slug);
  if (!preset) return null;
  const [catalog, settings] = await Promise.all([getCatalog(), getSiteSettings().catch(() => ({} as Record<string, string>))]);
  const { packagePercent } = paymentSettingsFrom(settings);
  // İstemciye yalnızca gereken kalemler: o şehrin otelleri ve paket rotaları
  const subset = catalog.filter((c) => (c.category === "hotel" && c.city?.toLowerCase() === preset.city) || preset.routes.includes(parseTransferSlug(c.slug)?.route.key ?? ""));
  for (const month of monthsFrom(undefined, 4)) {
    const list = packageHotels(preset, subset, month, packagePercent);
    if (!list.length) continue;
    const own = list.find((x) => x.hotel.slug === preset.hotelSlug);
    return { preset, catalog: subset, month, monthLabel: monthLabel(month), packagePercent, fromPrice: (own ?? list[0]).quote!.perPersonUsd, uyeKural: uyeKurali(settings, slug) };
  }
  return null;
}

/** Liste ve ana sayfa kartları için: şablonlu paketlerde hesaplanan başlangıç fiyatı, diğerlerinde kayıtlı fiyat; pakete üye fiyatı tanımlıysa yanında */
export async function packageDisplayPrices<T extends { slug: string; price: number }>(pkgs: T[]): Promise<(T & { uyePrice: number | null })[]> {
  const kurallar = uyeKurallari(await getSiteSettings().catch(() => ({} as Record<string, string>)));
  return Promise.all(pkgs.map(async (p) => {
    const net = await netBaslangic(p.slug).catch(() => null);
    const pr = net == null ? await getPackagePricing(p.slug).catch(() => null) : null;
    const price = net ?? (pr ? pr.fromPrice : p.price);
    // Paket görseli yoksa paketin otelinin fotoğrafı (19 Ekim)
    const gorsel = "imageUrl" in p ? { imageUrl: paketGorseli((p as { imageUrl?: string | null }).imageUrl, packagePreset(p.slug)?.hotelSlug) } : {};
    return { ...p, ...gorsel, price, uyePrice: uyeFiyati(price, kurallar[p.slug]) };
  }));
}
