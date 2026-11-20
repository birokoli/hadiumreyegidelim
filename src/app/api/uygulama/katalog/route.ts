// Müşteri uygulamasının kataloğu (19 Kasım): oteller, hizmetler, paket fiyat tabloları ve uygulama ayarları tek istekte.
// Uygulama mağazada uzun süre güncellenmeyeceği için fiyat ve içerik buradan, yani admin panelinden (Ürün ve Fiyat) gelir.
// Yalnızca okuma, herkese açık (sitede zaten yayımlanan bilgiler); alış fiyatı ve maliyet gönderilmez.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentMonth, getCatalog, monthsFrom, priceFor, type CatalogItem } from "@/lib/catalog";
import { parseTransferSlug, TRANSFER_VEHICLES } from "@/lib/catalog/transfers";
import { otelGalerisi, paketGorseli } from "@/lib/hotels/galeri";
import { netPaket, netPaketTablosu } from "@/lib/pricing/net-paket";
import { getSiteSettings } from "@/lib/site-settings";
import { KART_PAYI, KDV_ORANI } from "@/lib/satis/ortak";
import { SITE_URL } from "@/lib/seo/site";

export const revalidate = 300;

const tam = (yol: string | null | undefined) => (!yol ? null : yol.startsWith("http") ? yol : `${SITE_URL}${yol.startsWith("/") ? "" : "/"}${yol}`);
/** Önümüzdeki 13 ayın fiyatı: { "2026-11": 35, … } (fiyatı olmayan ay yazılmaz) */
const aylik = (c: CatalogItem, aylar: string[]) => Object.fromEntries(aylar.map((m) => [m, priceFor(c, m)] as const).filter(([, p]) => p != null));
/** 2/3/4 kişilik oda fiyatı ayrı girilmişse: { "2026-11": { k2: 300, k3: 320 } } */
const doluluk = (c: CatalogItem, aylar: string[]) => {
  const o: Record<string, Record<string, number>> = {};
  for (const p of c.prices) if (aylar.includes(p.month) && /^k[234]$/.test(p.variant)) (o[p.month] ??= {})[p.variant] = p.priceUsd;
  return o;
};
const dizi = (v: string | null | undefined): string[] => {
  try { const p: unknown = JSON.parse(v ?? "[]"); return Array.isArray(p) ? p.map(String).filter((s) => s.trim().length > 2) : typeof p === "string" ? p.split(/[,\n]/).map((s) => s.trim()).filter((s) => s.length > 2) : []; } catch { return []; }
};

export async function GET() {
  const aylar = monthsFrom(currentMonth(), 13);
  const [katalog, ayarlar, paketler] = await Promise.all([
    getCatalog(),
    getSiteSettings().catch(() => ({} as Record<string, string>)),
    prisma.package.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } }).catch(() => []),
  ]);
  if (!katalog.length) return NextResponse.json({ error: "Katalog şu an alınamadı." }, { status: 503 });

  const oteller = katalog.filter((c) => c.category === "hotel" && c.slug).map((c) => {
    const galeri = otelGalerisi(c.slug).map((g) => tam(g.src)).filter(Boolean) as string[];
    const kapak = tam(c.imageUrl);
    return {
      slug: c.slug!, ad: c.name, sehir: c.city ?? "Mekke", yildiz: c.hotelStars ?? 0, mesafeM: c.distanceMeters ?? null, aciklama: c.description ?? "",
      gorseller: galeri.length ? galeri : kapak ? [kapak] : [], fiyatlar: aylik(c, aylar), doluluk: doluluk(c, aylar),
    };
  }).filter((o) => Object.keys(o.fiyatlar).length > 0); // fiyatı olmayan otel gösterilmez

  // Araç başı transfer ve turlar: rota × araç
  const araclar = katalog.flatMap((c) => {
    const t = parseTransferSlug(c.slug);
    if (!t) return [];
    const f = aylik(c, aylar);
    return Object.keys(f).length ? [{ rota: t.route.key, rotaAd: t.route.label, tur: t.route.kind, not: t.route.note ?? null, arac: t.vehicle, fiyatlar: f }] : [];
  });
  // Kişi başı ve diğer hizmetler (vize, Haremeyn treni, ek hizmetler)
  const hizmetler = katalog.filter((c) => c.category !== "hotel" && !parseTransferSlug(c.slug)).map((c) => ({
    id: c.id, slug: c.slug, kategori: c.category, ad: c.name, aciklama: c.description ?? "", fiyatTuru: c.pricingType, fiyatlar: aylik(c, aylar),
  })).filter((h) => Object.keys(h.fiyatlar).length > 0);

  const paketListe = paketler.flatMap((p) => {
    const cfg = netPaket(p.slug);
    const sonuc = cfg ? netPaketTablosu(cfg, katalog) : null;
    if (!cfg || !sonuc) return []; // fiyat tablosu çıkmayan paket uygulamada gösterilmez
    return [{
      slug: p.slug, baslik: p.title, aciklama: p.description.split("|||")[0].trim(), gorsel: tam(paketGorseli(p.imageUrl, cfg.hotelSlug)),
      otelSlug: cfg.hotelSlug, geceler: cfg.geceler, kisiler: cfg.kisiler, yemek: cfg.yemek, otelNotu: cfg.otelNotu, dahil: dizi(p.includes),
      ay: sonuc.ay, tablo: sonuc.tablo.map((t) => ({ gece: t.gece, kisi: t.kisi, kisiBasiUsd: t.kisiBasiUsd, toplamUsd: t.toplamUsd })),
    }];
  });

  return NextResponse.json({
    guncellendi: new Date().toISOString(), ay: aylar[0], kdv: KDV_ORANI, kartPayi: KART_PAYI,
    oteller, araclar, aracTipleri: TRANSFER_VEHICLES, hizmetler, paketler: paketListe,
    iletisim: { whatsapp: (ayarlar.WHATSAPP_NUMBER || "905404010038").replace(/\D/g, "") },
    // Uygulama ayarları (admin → site ayarları): en düşük desteklenen sürüm ve tek satırlık duyuru; tanımlı değilse boş
    uygulama: { enAzSurum: ayarlar.UYGULAMA_EN_AZ_SURUM || null, duyuru: ayarlar.UYGULAMA_DUYURU || null },
  }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
