// /oteller: yayındaki bütün oteller (3 Ekim, kullanıcı). Menüde yok; site haritasında ve otel sayfalarının ekmek kırıntısında.
import type { Metadata } from "next";
import { fromPrice, getCatalog } from "@/lib/catalog";
import { SITE_URL } from "@/lib/seo/site";
import { Badge, CardFooter, EmptyState, MediaCard, PageHero, Section } from "@/components/ui/kit";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Mekke ve Medine Otelleri: Harem'e Mesafe ve Fiyat",
  description: "Umre için Mekke ve Medine otelleri: yıldız, Harem'e mesafe ve oda başı gecelik başlangıç fiyatı. Oteli seçin, umre planınızı fiyatıyla görün.",
  alternates: { canonical: "/oteller" },
};

const CITY: Record<string, string> = { mekke: "Mekke", medine: "Medine" };
const dist = (m: number | null) => (m == null ? null : m < 1000 ? `Harem'e ${m} m` : `Harem'e ${(m / 1000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} km`);

export default async function HotelsPage() {
  const hotels = (await getCatalog()).filter((c) => c.category === "hotel" && c.slug);
  const cities = [...new Set(hotels.map((h) => (h.city ?? "").toLowerCase()))].sort((a, b) => (a === "mekke" ? -1 : b === "mekke" ? 1 : a.localeCompare(b)));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Mekke ve Medine otelleri",
    itemListElement: hotels.map((h, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/oteller/${h.slug}`, name: h.name })),
  };

  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        crumbs={[{ label: "Anasayfa", href: "/" }, { label: "Oteller" }]}
        kicker="Umre otelleri"
        title="Mekke ve Medine otelleri"
        lead="Yıldızı, Harem'e mesafesi ve oda başı gecelik başlangıç fiyatıyla otellerimiz. Bir otele tıklayıp ayrıntılarını görün ya da umre planınıza ekleyin."
      />
      <Section tone="muted">
        {hotels.length === 0 ? (
          <EmptyState onWhite>Şu an yayında otel bulunmuyor.</EmptyState>
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
            <p className="text-center text-[13px] text-on-surface-variant">Fiyatlar oda başı gecelik başlangıç fiyatıdır; odada en fazla 4 kişi kalabilir. Kesin fiyat tarih ve müsaitliğe göre belirlenir.</p>
          </div>
        )}
      </Section>
    </main>
  );
}
