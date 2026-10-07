// /oteller: yayındaki bütün oteller (3 Ekim, kullanıcı). Menüde yok; site haritasında ve otel sayfalarının ekmek kırıntısında.
import type { Metadata } from "next";
import { fromPrice, getCatalog } from "@/lib/catalog";
import { SITE_URL } from "@/lib/seo/site";
import { getPageTexts } from "@/lib/page-texts";
import { DISTRICTS, directoryHotels, kaabaText } from "@/lib/catalog/hotel-directory";
import { Badge, CardFooter, EmptyState, MediaCard, PageHero, Section } from "@/components/ui/kit";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Umre Otelleri: Harem'e Mesafe ve Fiyat",
  description: "Umre için Mekke ve Medine otelleri: yıldız, Harem'e mesafe ve oda başı gecelik başlangıç fiyatı. Oteli seçin, umre planınızı fiyatıyla görün.",
  alternates: { canonical: "/oteller" },
  openGraph: { images: [{ url: "/images/hero-kabe.jpg" }] },
};

const CITY: Record<string, string> = { mekke: "Mekke", medine: "Medine" };
const dist = (m: number | null) => (m == null ? null : m < 1000 ? `Harem'e ${m} m` : `Harem'e ${(m / 1000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} km`);

export default async function HotelsPage() {
  const t = await getPageTexts("oteller");
  const hotels = (await getCatalog()).filter((c) => c.category === "hotel" && c.slug);
  // Fiyatsız rehber otelleri (7 Ekim): katalogda olmayanlar, bölgeye göre
  const catalogSlugs = new Set(hotels.map((h) => h.slug));
  const directory = directoryHotels().filter((d) => !catalogSlugs.has(d.slug)).sort((a, b) => (a.kaabaMeters ?? 99999) - (b.kaabaMeters ?? 99999));
  const districts = Object.keys(DISTRICTS).filter((k) => directory.some((d) => d.district === k));
  const cities = [...new Set(hotels.map((h) => (h.city ?? "").toLowerCase()))].sort((a, b) => (a === "mekke" ? -1 : b === "mekke" ? 1 : a.localeCompare(b)));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Mekke ve Medine otelleri",
    itemListElement: [...hotels.map((h) => ({ slug: h.slug, name: h.name })), ...directory.map((d) => ({ slug: d.slug, name: d.name }))].map((h, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/oteller/${h.slug}`, name: h.name })),
  };

  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        crumbs={[{ label: "Anasayfa", href: "/" }, { label: "Oteller" }]}
        kicker={t("kicker")}
        title={t("title")}
        lead={t("lead")}
      />
      <Section tone="muted">
        {hotels.length === 0 ? (
          <EmptyState onWhite>{t("empty_state")}</EmptyState>
        ) : (
          <div className="space-y-14">
            {cities.map((city) => {
              const list = hotels
                .filter((h) => (h.city ?? "").toLowerCase() === city)
                .sort((a, b) => (a.distanceMeters ?? 99999) - (b.distanceMeters ?? 99999));
              return (
                <div key={city}>
                  <h2 className="mb-6 font-headline text-2xl font-bold text-primary">{CITY[city] ?? city} otelleri</h2>
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {list.map((h) => {
                      const p = fromPrice(h);
                      return (
                        <MediaCard
                          key={h.id}
                          href={`/oteller/${h.slug}`}
                          title={h.name}
                          description={[dist(h.distanceMeters) ?? "", h.description ?? ""].filter(Boolean).join(" · ")}
                          image={h.imageUrl}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          topLeft={h.hotelStars ? <Badge tone="light">{h.hotelStars} yıldız</Badge> : undefined}
                          footer={<CardFooter price={p ? Math.round(p.priceUsd) : null} currency="USD" suffix="/ gece" cta="Oteli incele" />}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {districts.length > 0 && (
              <div>
                <h2 className="font-headline text-2xl font-bold text-primary">Mekke otelleri: bölgelere göre</h2>
                <p className="mt-2 max-w-2xl text-[14px] text-on-surface-variant">Bu otellerin fiyatı tarihe ve oda tipine göre değiştiği için sayfada yazmıyor; oteli seçip fiyatını WhatsApp&apos;tan sorabilirsiniz.</p>
                <div className="mt-8 space-y-10">
                  {districts.map((k) => (
                    <div key={k}>
                      <h3 className="mb-4 font-headline text-lg font-bold text-on-surface">{DISTRICTS[k]}</h3>
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {directory.filter((d) => d.district === k).map((d) => (
                          <MediaCard
                            key={d.slug}
                            href={`/oteller/${d.slug}`}
                            title={d.name}
                            description={kaabaText(d.kaabaMeters) ? `Kâbe'ye kuş uçuşu ${kaabaText(d.kaabaMeters)}` : undefined}
                            fallbackIcon="hotel"
                            aspect="aspect-[16/7]"
                            topLeft={d.stars ? <Badge tone="light">{d.stars} yıldız</Badge> : undefined}
                            footer={<CardFooter price={null} cta="Fiyatını sorun" />}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <p className="text-center text-[13px] text-on-surface-variant">{t("footnote")}</p>
          </div>
        )}
      </Section>
    </main>
  );
}
