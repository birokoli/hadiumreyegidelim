// Fiyatsız otel sayfası (7 Ekim): Paximum'dan satılan oteller. Fiyat yerine WhatsApp'tan hazır mesajla fiyat sorulur.
import Link from "next/link";
import { SITE_URL } from "@/lib/seo/site";
import { getSiteSettings } from "@/lib/site-settings";
import { DISTRICTS, kaabaText, nearbyHotels, type DirectoryHotel } from "@/lib/catalog/hotel-directory";
import { ButtonLink, PageHero, Section } from "@/components/ui/kit";
import HotelMap from "@/components/hotels/HotelMap";

const CITY = { mekke: "Mekke", medine: "Medine" } as const;

export default async function DirectoryHotelPage({ h }: { h: DirectoryHotel }) {
  const city = CITY[h.city];
  const district = DISTRICTS[h.district] ?? h.district;
  const kaaba = kaabaText(h.kaabaMeters);
  const wa = ((await getSiteSettings()).WHATSAPP_NUMBER || "905404010038").replace(/\D/g, "");
  const message = `Merhaba, ${h.name} (${city}) için fiyat almak istiyorum.\nTarih: \nKişi sayısı: \nOda tipi: `;
  const waHref = `https://wa.me/${wa}?text=${encodeURIComponent(message)}`;
  const nearby = nearbyHotels(h);

  const facts: [string, string | null][] = [
    ["Bölge", `${district}, ${city}`],
    ["Yıldız", h.stars ? `${h.stars} yıldız` : null],
    ["Kâbe'ye kuş uçuşu", kaaba],
    ["Harem'e yürüyüş", h.walkMinutes ? `yaklaşık ${h.walkMinutes} dk` : null],
    ["Harem servisi", h.shuttle === "var" ? "Var" : h.shuttle === "yok" ? "Yok" : null],
    ["Yemek seçenekleri", h.meals.length ? h.meals.join(", ") : null],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: h.name,
    url: `${SITE_URL}/oteller/${h.slug}`,
    ...(h.description ? { description: h.description } : {}),
    address: { "@type": "PostalAddress", addressLocality: city, addressRegion: district, addressCountry: "SA" },
    geo: { "@type": "GeoCoordinates", latitude: h.lat, longitude: h.lon },
    ...(h.stars ? { starRating: { "@type": "Rating", ratingValue: h.stars } } : {}),
  };

  const faq = h.faq ?? [];
  const faqLd = faq.length
    ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }
    : null;

  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      <PageHero
        crumbs={[{ label: "Anasayfa", href: "/" }, { label: "Oteller", href: "/oteller" }, { label: h.name }]}
        kicker={`${city} · ${district}`}
        title={h.name}
        lead={[h.stars ? `${h.stars} yıldızlı` : "", kaaba ? `Kâbe'ye ${kaaba} kuş uçuşu` : "", `${district} bölgesi`].filter(Boolean).join(" · ")}
      />
      <Section tone="muted">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="space-y-6">
            {h.description ? (
              <div>
                <h2 className="mb-3 font-headline text-xl font-bold text-primary">{h.name} nerede, Harem&apos;e ne kadar uzak?</h2>
                <p className="text-base leading-relaxed text-on-surface whitespace-pre-line">{h.description}</p>
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-outline-variant/50 bg-white p-4 text-[14px] text-on-surface-variant">
                Otel açıklaması hazırlanıyor (yalnızca yerelde görünür; açıklaması olmayan otel canlıda yayınlanmaz).
              </p>
            )}
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {facts.filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-outline-variant/20 bg-white p-4">
                  <dt className="text-[12px] text-on-surface-variant">{k}</dt>
                  <dd className="mt-1 font-semibold text-on-surface">{v}</dd>
                </div>
              ))}
            </dl>
            {h.roomTypes.length > 0 && (
              <div className="rounded-2xl border border-outline-variant/20 bg-white p-5">
                <h2 className="font-semibold text-on-surface">Oda tipleri</h2>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {h.roomTypes.map((r) => (
                    <li key={r} className="rounded-full bg-surface-container-low px-3 py-1 text-[13px] text-on-surface">{r}</li>
                  ))}
                </ul>
              </div>
            )}
            {faq.length > 0 && (
              <section className="space-y-4">
                <h2 className="font-headline text-xl font-bold text-primary">{h.name} hakkında sık sorulanlar</h2>
                {faq.map((f) => (
                  <div key={f.q} className="rounded-2xl border border-outline-variant/20 bg-white p-5">
                    <h3 className="font-semibold text-on-surface">{f.q}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-on-surface-variant">{f.a}</p>
                  </div>
                ))}
              </section>
            )}
            <HotelMap name={h.name} lat={h.lat} lon={h.lon} city={h.city} distanceLabel={kaaba} />
          </div>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-outline-variant/20 bg-white p-5 lg:sticky lg:top-24">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80">Fiyat</p>
              <p className="mt-2 text-[15px] leading-relaxed text-on-surface">
                Bu otelin fiyatı tarihe, oda tipine ve yemek seçeneğine göre değişir. Tarihinizi ve kişi sayınızı yazın, güncel fiyatı size iletelim.
              </p>
              <ButtonLink href={waHref} tone="whatsapp" className="mt-4 w-full">Bu otelin fiyatını sorun</ButtonLink>
              <Link href="/bireysel-umre" className="mt-3 block text-center text-[14px] font-semibold text-primary hover:underline">Umrenizi baştan planlayın</Link>
            </div>
            {nearby.length > 0 && (
              <div className="rounded-2xl border border-outline-variant/20 bg-white p-5">
                <p className="font-semibold text-on-surface">Yakındaki oteller</p>
                <ul className="mt-3 space-y-2">
                  {nearby.map((o) => (
                    <li key={o.slug} className="flex items-baseline justify-between gap-3">
                      <Link href={`/oteller/${o.slug}`} className="text-primary hover:underline">{o.name}</Link>
                      <span className="shrink-0 text-[12px] text-on-surface-variant">{DISTRICTS[o.district] ?? o.district}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Section>
    </main>
  );
}
