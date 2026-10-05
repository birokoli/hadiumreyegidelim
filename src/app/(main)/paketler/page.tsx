import { SITE_URL } from "@/lib/seo/site";
import { packageDisplayPrices } from "@/lib/pricing/package-server";
import React from "react";
export const revalidate = 300;
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { getPageTexts } from "@/lib/page-texts";
import { PageTrust, webPageJsonLd } from "@/components/seo/PageTrust";
import {
  Badge,
  CardFooter,
  EmptyState,
  Faq,
  faqJsonLd,
  MediaCard,
  PageHero,
  Section,
} from "@/components/ui/kit";

export const metadata: Metadata = {
  // 3 Ekim (Açıklar analizi): "umre fiyatları 2026" aramasında Google fiyatlı paket listesi gösteriyor
  title: "Umre Fiyatları 2026 ve Umre Paketleri",
  description: "2026 umre paketleri ve kişi başı başlangıç fiyatları. Fiyat seçtiğiniz otele, kişi sayısına ve tarihe göre anında hesaplanır; otel ve transferler dahildir.",
  alternates: {
    canonical: "/paketler"
  }
};

export default async function PackagesPage() {
  const t = await getPageTexts("paketler");
  // Şablonlu paketlerde gösterilen fiyat otel ve araç fiyatlarından hesaplanan "başlayan" fiyattır
  const packages = await packageDisplayPrices(await prisma.package.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' }
  }).catch(() => []));

  // SSS, yayındaki paketlerin gerçek verisinden üretilir (süre aralığı, ortak hizmetler)
  const days = packages.map((p) => parseInt(String(p.duration).match(/\d+/)?.[0] ?? "", 10)).filter((n) => Number.isFinite(n) && n > 0);
  const includeCounts = new Map<string, number>();
  for (const p of packages) {
    try {
      for (const item of JSON.parse(p.includes ?? "[]") as string[]) includeCounts.set(item, (includeCounts.get(item) ?? 0) + 1);
    } catch {}
  }
  const common = [...includeCounts.entries()].filter(([, c]) => c >= Math.ceil(packages.length / 2)).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k]) => k);
  const priced = packages.filter((p) => p.price > 0).sort((a, b) => a.price - b.price);
  const usd = (n: number) => `${Math.round(n).toLocaleString("tr-TR")} $`;
  const faq = [
    priced.length > 0 && {
      q: "Umre fiyatları 2026'da ne kadar?",
      a: `Yayındaki paketlerimizde kişi başı fiyatlar ${usd(priced[0].price)}'dan başlıyor. Fiyat sabit değildir: seçtiğiniz otele, odadaki kişi sayısına ve seyahat ayına göre paket sayfasında anında hesaplanır. Uçak bileti fiyata dahil değildir, umre vizesi ayrıca alınır.`,
    },
    days.length > 0 && {
      q: "Umre paketleri kaç gün sürer?",
      a: `Şu anda yayında ${packages.length} paket var; süreler ${Math.min(...days)} gün ile ${Math.max(...days)} gün arasında değişir. Her paketin günlük programı kendi sayfasında yer alır.`,
    },
    common.length > 0 && {
      q: "Umre paketlerine neler dahil?",
      a: `Paketlerin çoğunda şunlar dahildir: ${common.join(", ")}. Dahil olan ve olmayan hizmetlerin tam listesi her paketin sayfasındaki listede açıklanmıştır.`,
    },
    {
      q: "Hazır paket yerine kendi programımı yapabilir miyim?",
      a: "Evet. Tarihi, oteli ve Mekke–Medine gün sayısını kendiniz seçmek için bireysel umre tasarlayıcısını kullanabilirsiniz; seçimlerinize göre hazırlanan teklif WhatsApp'tan iletilir.",
    },
  ].filter(Boolean) as { q: string; a: string }[];

  const jsonLd = [
    faqJsonLd(faq),
    webPageJsonLd({ url: `${SITE_URL}/paketler`, name: "Umre Fiyatları 2026 ve Umre Paketleri" }),
  ];

  const popularPackageId = packages.find((p) => p.isPopular)?.id;

  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        crumbs={[{ label: "Anasayfa", href: "/" }, { label: "Umre Paketleri" }]}
        kicker={t("kicker")}
        title={t("title")}
        lead={t("lead")}
      />

      <Section tone="muted">
        <div className="text-center mb-10 md:mb-12">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80 mb-2">{t("tours_kicker")}</p>
          <p className="text-on-surface-variant max-w-2xl mx-auto text-sm md:text-base">{t("tours_lead")}</p>
        </div>

        {packages.length === 0 ? (
          <EmptyState onWhite>{t("empty_state")}</EmptyState>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {packages.map((pkg) => (
              <MediaCard
                key={pkg.id}
                href={`/paketler/${pkg.slug}`}
                title={pkg.title}
                description={pkg.description ? pkg.description.split('|||ITINERARY|||')[0] : undefined}
                image={pkg.imageUrl}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                topLeft={pkg.duration ? <Badge tone="light">{pkg.duration}</Badge> : undefined}
                topRight={pkg.id === popularPackageId ? <Badge tone="primary">En çok tercih edilen</Badge> : undefined}
                footer={<CardFooter price={pkg.price} currency={pkg.currency} cta="Turu İncele" />}
              />
            ))}
          </div>
        )}

        {priced.length > 0 && (
          <div className="max-w-screen-md mx-auto mt-16 md:mt-20">
            <h2 className="font-headline text-xl md:text-2xl font-bold text-primary text-center mb-2">Umre fiyatları 2026: paketlere göre başlangıç fiyatları</h2>
            <p className="text-center text-sm text-on-surface-variant mb-6">Kişi başı, 2 kişilik oda için en uygun otelle hesaplanan fiyat. Paketi açıp otelinizi ve kişi sayınızı seçince fiyat güncellenir.</p>
            <div className="overflow-x-auto rounded-2xl border border-outline-variant/20 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-[12px] uppercase tracking-wider text-on-surface-variant">
                    <th className="px-4 py-3 font-semibold">Paket</th>
                    <th className="px-4 py-3 font-semibold">Süre</th>
                    <th className="px-4 py-3 font-semibold text-right">Kişi başı</th>
                  </tr>
                </thead>
                <tbody>
                  {priced.map((p) => (
                    <tr key={p.id} className="border-b border-outline-variant/10 last:border-0">
                      <td className="px-4 py-3"><a href={`/paketler/${p.slug}`} className="font-semibold text-primary hover:underline">{p.title}</a></td>
                      <td className="px-4 py-3 text-on-surface-variant">{p.duration}</td>
                      <td className="px-4 py-3 text-right font-bold text-primary whitespace-nowrap">{usd(p.price)}&apos;dan</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {faq.length > 0 && (
          <div className="max-w-screen-md mx-auto mt-16 md:mt-20">
            <h2 className="font-headline text-xl md:text-2xl font-bold text-primary text-center mb-6">Sık sorulanlar</h2>
            <Faq items={faq} />
            <PageTrust className="mt-8 text-center" />
          </div>
        )}
      </Section>
    </main>
  );
}
