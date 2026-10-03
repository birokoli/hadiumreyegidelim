import type { Metadata } from "next";
import { formatPrice } from "@/lib/format";
import { parseTransferSlug, TRANSFER_ROUTES, TRANSFER_VEHICLES } from "@/lib/catalog/transfers";
import { getCatalog, fromPrice, type CatalogItem } from "@/lib/catalog";
import { getPageTexts } from "@/lib/page-texts";
import { Badge, ButtonLink, CardFooter, ChipLink, EmptyState, MediaCard, PageHero, Panel, PriceTag, Section, SectionHead } from "@/components/ui/kit";

export const metadata: Metadata = {
  title: "Umre Hizmetleri: Otel, Transfer, Tur ve Vize",
  description: "Mekke ve Medine otelleri, havalimanı ve şehirler arası transfer, ziyaret turları ve Suudi Arabistan e-vize. Güncel aylık fiyatlarla, planlayıcıda seçip birleştirin.",
  alternates: { canonical: "/hizmetler" },
};

// Katalog derleme anında okunamayabiliyor (boş liste önbelleğe girer); istek anında okunur, getCatalog zaten önbellekli
export const dynamic = "force-dynamic";

// Fiyat birimi: oteller 1 oda / 1 gece (en fazla 4 kişi)
const UNIT: Record<string, string> = { per_room: "/ oda · gece", per_person: "/ kişi", per_vehicle: "/ araç", flat: "" };
// Şehir veritabanında küçük harfle tutuluyor ("mekke")
const CITY: Record<string, string> = { mekke: "Mekke", medine: "Medine" };
// Planlayıcıyla aynı ayrım: kişi başı transfer kalemleri trendir
const isTrain = (i: CatalogItem) => i.pricingType === "per_person" || /tren|haramain|haremeyn/i.test(i.name);
const isCrib = (i: CatalogItem) => /beşi[kğ]|besi[kg]/i.test(i.name);

function hotelLine(i: CatalogItem) {
  const parts = [i.hotelStars ? `${i.hotelStars} yıldız` : null, i.distanceMeters != null ? `Harem'e ${i.distanceMeters.toLocaleString("tr-TR")} m` : null];
  return parts.filter(Boolean).join(" · ") || i.description || undefined;
}

function Grid({ items, hotel }: { items: CatalogItem[]; hotel?: boolean }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      {items.map((i) => {
        const p = fromPrice(i);
        return (
          <MediaCard
            key={i.id}
            href="/bireysel-umre"
            title={i.name}
            description={hotel ? hotelLine(i) : i.description ?? undefined}
            image={i.imageUrl}
            fallbackIcon={hotel ? "hotel" : i.category === "transfer" ? "directions_car" : "mosque"}
            topLeft={hotel && i.city ? <Badge>{CITY[i.city.toLowerCase()] ?? i.city}</Badge> : undefined}
            footer={<CardFooter price={p?.priceUsd} suffix={UNIT[i.pricingType]} cta="Planlayıcıda seç" />}
          />
        );
      })}
    </div>
  );
}

/** Görseli olmayan kalemler (transfer, ekstra): ad + birim fiyat, iki sütunlu sade liste */
function PriceList({ items }: { items: CatalogItem[] }) {
  return (
    <Panel className="p-0 md:p-0 overflow-hidden">
      <ul className="grid md:grid-cols-2 md:divide-x divide-outline-variant/20">
        {[items.slice(0, Math.ceil(items.length / 2)), items.slice(Math.ceil(items.length / 2))].map((col, c) => (
          <li key={c} className="divide-y divide-outline-variant/20">
            {col.map((i) => {
              const p = fromPrice(i);
              return (
                <div key={i.id} className="flex items-baseline justify-between gap-4 px-5 py-3.5">
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold text-on-surface">{i.name}</span>
                    {i.description && <span className="block mt-0.5 text-[13px] text-on-surface-variant line-clamp-1">{i.description}</span>}
                  </span>
                  {p && p.priceUsd > 0 && (
                    <span className="shrink-0 text-right">
                      <span className="font-headline text-lg font-bold text-primary">{formatPrice(p.priceUsd, "USD")}</span>
                      {UNIT[i.pricingType] && <span className="ml-1 text-[12px] text-on-surface-variant">{UNIT[i.pricingType]}</span>}
                    </span>
                  )}
                </div>
              );
            })}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export default async function ServicesPage() {
  const t = await getPageTexts("hizmetler");
  const catalog = (await getCatalog()).filter((i) => i.category !== "flight" && !isCrib(i));
  // Rota × araç kalemleri ayrı bir fiyat tablosunda gösterilir
  const routeCells = catalog.flatMap((i) => { const t = parseTransferSlug(i.slug); return t ? [{ route: t.route.key, vehicle: t.vehicle, price: fromPrice(i)?.priceUsd ?? null }] : []; });
  const matrixVehicles = TRANSFER_VEHICLES.filter((v) => routeCells.some((c) => c.vehicle === v.key));
  const matrixRoutes = TRANSFER_ROUTES.filter((r) => routeCells.some((c) => c.route === r.key));
  const cell = (r: string, v: string) => routeCells.find((c) => c.route === r && c.vehicle === v)?.price ?? null;
  const all = catalog.filter((i) => !parseTransferSlug(i.slug));
  const hotels = all.filter((i) => i.category === "hotel");
  const groups = [
    { id: "mekke", kicker: "Konaklama", title: "Mekke otelleri", items: hotels.filter((i) => i.city?.toLowerCase() === "mekke"), hotel: true },
    { id: "medine", kicker: "Konaklama", title: "Medine otelleri", items: hotels.filter((i) => i.city?.toLowerCase() === "medine"), hotel: true },
    { id: "transfer", kicker: "Ulaşım", title: "Transfer (araç)", items: all.filter((i) => i.category === "transfer" && !isTrain(i)) },
    { id: "tren", kicker: "Ulaşım", title: "Haremeyn hızlı treni", items: all.filter((i) => i.category === "transfer" && isTrain(i)) },
    { id: "tur", kicker: "Ziyaret", title: "Turlar ve rehberlik", items: all.filter((i) => i.category === "tur") },
    { id: "ekstra", kicker: "Ek hizmetler", title: "Ekstralar", items: all.filter((i) => i.category === "extra") },
  ].filter((g) => g.items.length);
  const visa = all.find((i) => i.category === "vize");
  const visaPrice = visa ? fromPrice(visa)?.priceUsd : null;

  return (
    <main>
      <PageHero
        crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Hizmetler" }]}
        kicker={t("kicker")}
        title={t("title")}
        lead={t("lead")}
        aside={
          <Panel tone="primary" className="p-6 md:p-8">
            <h2 className="font-headline text-xl font-bold">{t("aside_title")}</h2>
            <p className="mt-2 text-sm text-white/80">{t("aside_lead")}</p>
            <ButtonLink href="/bireysel-umre" tone="light" className="mt-5 w-full">{t("aside_cta")}</ButtonLink>
          </Panel>
        }
      >
        {groups.length + (matrixRoutes.length ? 1 : 0) > 1 && (
          <nav aria-label="Hizmet grupları" className="mt-6 -mx-4 px-4 flex gap-2 overflow-x-auto pb-1 md:mx-0 md:px-0 md:flex-wrap md:overflow-visible">
            {groups.map((g) => <ChipLink key={g.id} href={`#${g.id}`}>{g.title}</ChipLink>)}
            {matrixRoutes.length > 0 && <ChipLink href="#arac-transfer">Araçlı transfer</ChipLink>}
            {visa && <ChipLink href="#vize">E-vize</ChipLink>}
          </nav>
        )}
      </PageHero>

      {groups.length === 0 && !visa && !matrixRoutes.length && (
        <Section className="pt-0 md:pt-0"><EmptyState onWhite>Hizmet listesi hazırlanıyor. Bu arada planlayıcıdan ya da WhatsApp'tan bize ulaşabilirsiniz.</EmptyState></Section>
      )}

      {groups.map((g, n) => (
        <Section key={g.id} id={g.id} tone={n % 2 ? "muted" : "plain"} className={n === 0 ? "pt-0 md:pt-0" : undefined}>
          <SectionHead kicker={g.kicker} title={g.title} />
          {g.hotel || g.items.every((i) => i.imageUrl) ? <Grid items={g.items} hotel={g.hotel} /> : <PriceList items={g.items} />}
          {!g.hotel && <p className="mt-4"><ButtonLink href="/bireysel-umre" tone="secondary">Planlayıcıda seç</ButtonLink></p>}
          {g.hotel && <p className="mt-4 text-[13px] text-on-surface-variant">Fiyat 1 oda, 1 gece içindir (giriş 16.00, çıkış 11.00). Bir odada en fazla 4 kişi kalır.</p>}
        </Section>
      ))}

      {matrixRoutes.length > 0 && (
        <Section id="arac-transfer" tone="white">
          <SectionHead kicker="Ulaşım" title="Araçlı transfer ve tur fiyatları" />
          <p className="-mt-2 mb-5 text-[14px] text-on-surface-variant max-w-3xl">Fiyatlar araç başıdır (USD), kişi sayısına göre değişmez. Camry 4, GMC ve Staria 8, HiAce 12, Coaster 25, otobüs 45 yolcuya kadar.</p>
          <div className="overflow-x-auto rounded-2xl border border-outline-variant/20">
            <table className="w-full min-w-[720px] text-[14px]">
              <thead>
                <tr className="bg-surface-container-low text-left">
                  <th scope="col" className="px-4 py-3 font-semibold text-on-surface">Rota</th>
                  {matrixVehicles.map((v) => <th key={v.key} scope="col" className="px-3 py-3 text-right font-semibold text-on-surface whitespace-nowrap">{v.label.replace("Toyota ", "").replace("Hyundai ", "")}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {matrixRoutes.map((r) => (
                  <tr key={r.key}>
                    <th scope="row" className="px-4 py-3 text-left font-medium text-on-surface">{r.label}{r.note && <span className="block text-[12px] font-normal text-on-surface-variant">{r.note}</span>}</th>
                    {matrixVehicles.map((v) => { const p = cell(r.key, v.key); return <td key={v.key} className="px-3 py-3 text-right tabular-nums text-primary font-semibold whitespace-nowrap">{p ? formatPrice(p, "USD") : "–"}</td>; })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4"><ButtonLink href="/bireysel-umre" tone="secondary">Planlayıcıda araç ve rota seç</ButtonLink></p>
        </Section>
      )}

      {visa && (
        <Section id="vize" tone="white">
          <div className="md:flex md:items-center md:justify-between gap-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80">Vize</p>
              <h2 className="mt-2 font-headline text-2xl md:text-3xl font-bold text-primary">Suudi Arabistan e-vize</h2>
              <p className="mt-2 text-on-surface-variant max-w-xl">Belgeleriniz tamamsa vizeniz 2 iş saati içinde çıkar. Planlayıcıda vizeyi ekleyip çıkarabilirsiniz.</p>
            </div>
            <div className="mt-5 md:mt-0 flex items-end gap-6 shrink-0">
              <PriceTag amount={visaPrice} label="Kişi başı" />
              <ButtonLink href="/umre-vizesi" tone="secondary">Vize bilgisi</ButtonLink>
            </div>
          </div>
        </Section>
      )}
    </main>
  );
}
