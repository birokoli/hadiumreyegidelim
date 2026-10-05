// Otel sayfaları (3 Ekim, kullanıcı): menüde ve blogda yok, site haritasında ve paket sayfasındaki otel listesinde var.
// "anjum hotel" gibi otel adı aramalarına girmek için. İçerik katalogdaki otel kaydından gelir.
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fromPrice, getCatalog, monthLabel, type CatalogItem } from "@/lib/catalog";
import { packagePreset } from "@/lib/pricing/package";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo/site";
import { pageTitle } from "@/lib/seo/meta";
import { PageHero, Section } from "@/components/ui/kit";
import { hotelLongText } from "@/lib/catalog/hotel-texts";

// Next 16: boş generateStaticParams olmadan dinamik yol her istekte yeniden oluşturulur (no-store); boş liste
// sayfayı ilk istekte üretip önbelleğe alır (ISR). 6 Ekim denetimi: blog sayfaları 1,6–4,3 sn.
export async function generateStaticParams() {
  return [];
}


export const revalidate = 3600;

const CITY: Record<string, string> = { mekke: "Mekke", medine: "Medine" };
const cityName = (c: string | null) => (c ? CITY[c.toLowerCase()] ?? c : "");

async function findHotel(slug: string): Promise<CatalogItem | null> {
  const catalog = await getCatalog();
  return catalog.find((c) => c.category === "hotel" && c.slug === slug) ?? null;
}

function distanceText(m: number | null) {
  if (m == null) return null;
  return m < 1000 ? `${m} metre` : `${(m / 1000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} km`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const h = await findHotel(slug);
  if (!h) return { title: "Otel bulunamadı", robots: { index: false } };
  const city = cityName(h.city);
  const dist = distanceText(h.distanceMeters);
  return {
    title: pageTitle(`${h.name}: Konum ve Fiyat`),
    description: `${h.name} (${city}${h.hotelStars ? `, ${h.hotelStars} yıldız` : ""})${dist ? `: Harem'e ${dist}` : ""}. Umre paketlerinde bu oteli seçip kişi başı fiyatı anında görün.`,
    alternates: { canonical: `/oteller/${slug}` },
    openGraph: { images: [{ url: h.imageUrl ?? "/images/hero-kabe.jpg" }] },
  };
}

export default async function HotelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const h = await findHotel(slug);
  if (!h) notFound();
  const city = cityName(h.city);
  const dist = distanceText(h.distanceMeters);
  const price = fromPrice(h);
  const long = await hotelLongText(h);
  const packages = (await prisma.package.findMany({ where: { published: true }, select: { slug: true, title: true, duration: true } }).catch(() => [])).filter(
    (p) => packagePreset(p.slug)?.city === h.city?.toLowerCase(),
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: h.name,
    url: `${SITE_URL}/oteller/${slug}`,
    ...(h.imageUrl ? { image: h.imageUrl } : {}),
    ...(long ?? h.description ? { description: long ?? h.description } : {}),
    address: { "@type": "PostalAddress", addressLocality: city, addressCountry: "SA" },
    ...(h.hotelStars ? { starRating: { "@type": "Rating", ratingValue: h.hotelStars } } : {}),
  };

  return (
    <main id="main-content">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        crumbs={[{ label: "Anasayfa", href: "/" }, { label: "Oteller", href: "/oteller" }, { label: h.name }]}
        kicker={`${city} oteli`}
        title={h.name}
        lead={[h.hotelStars ? `${h.hotelStars} yıldızlı` : "", dist ? `Harem'e ${dist}` : "", city].filter(Boolean).join(" · ")}
      />
      <Section tone="muted">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="space-y-6">
            {h.imageUrl && (
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-surface-container-low">
                <Image src={h.imageUrl} alt={h.name} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" priority />
              </div>
            )}
            {h.description && <p className="text-base font-semibold text-on-surface">{h.description}</p>}
            {long && <p className="text-base leading-relaxed text-on-surface whitespace-pre-line">{long}</p>}
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ["Şehir", city],
                ["Yıldız", h.hotelStars ? `${h.hotelStars} yıldız` : null],
                ["Harem'e mesafe", dist],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-outline-variant/20 bg-white p-4">
                  <dt className="text-[12px] text-on-surface-variant">{k}</dt>
                  <dd className="mt-1 font-semibold text-on-surface">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-outline-variant/20 bg-white p-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80">Fiyat</p>
              {price ? (
                <>
                  <p className="mt-2 font-headline text-3xl font-bold text-primary">{Math.round(price.priceUsd).toLocaleString("tr-TR")} $&apos;dan</p>
                  <p className="mt-1 text-[13px] text-on-surface-variant">Oda başı gecelik, odada en fazla 4 kişi · {monthLabel(price.month)} fiyatı. Giriş 16:00, çıkış 11:00.</p>
                </>
              ) : (
                <p className="mt-2 text-[14px] text-on-surface-variant">Bu otelin güncel fiyatı için WhatsApp&apos;tan bize yazın.</p>
              )}
              <Link href="/bireysel-umre" className="mt-4 flex w-full items-center justify-center rounded-xl bg-primary px-5 py-3 font-bold text-white hover:opacity-90">Bu otelle umre planla</Link>
            </div>
            {packages.length > 0 && (
              <div className="rounded-2xl border border-outline-variant/20 bg-white p-5">
                <p className="font-semibold text-on-surface">Bu oteli seçebileceğiniz paketler</p>
                <ul className="mt-3 space-y-2">
                  {packages.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/paketler/${p.slug}`} className="text-primary hover:underline">{p.title}</Link>
                      {p.duration && <span className="text-[13px] text-on-surface-variant"> · {p.duration}</span>}
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
