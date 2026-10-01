// Planlayıcı v2 önizlemesi (Y2). Katalog dolup kullanıcı onaylayınca /bireysel-umre buraya taşınır.
// Google'a kapalı (noindex) ve sitemap'te yok.
import type { Metadata } from "next";
import { PageHero, Container } from "@/components/ui/kit";
import PlannerV2 from "@/components/planner/PlannerV2";
import { getCatalog, monthsFrom, monthLabel, paymentSettingsFrom } from "@/lib/catalog";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Bireysel umre planlayıcısı (önizleme)",
  robots: { index: false, follow: false },
};

export default async function PlannerPreviewPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const query = Object.fromEntries(Object.entries(sp).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
  const [catalog, settings] = await Promise.all([getCatalog(), getSiteSettings().catch(() => ({} as Record<string, string>))]);
  const months = monthsFrom().map((m) => ({ value: m, label: monthLabel(m) }));
  const whatsappNumber = (settings.WHATSAPP_NUMBER || "905404010038").replace("+", "");
  return (
    <main className="bg-surface pb-24 lg:pb-16">
      <PageHero
        crumbs={[{ label: "Anasayfa", href: "/" }, { label: "Bireysel umre", href: "/bireysel-umre" }, { label: "Planlayıcı" }]}
        kicker="Bireysel umre 2026"
        title="Umrenizi planlayın, fiyatı hemen görün"
        lead="Dönemi, Mekke ve Medine otelini, ulaşımı ve ekstraları seçin; o ayın güncel fiyatıyla toplamı görün. Planı gönderin, kesin teklifi ekibimiz iletsin."
      />
      <Container>
        <PlannerV2 catalog={catalog} months={months} whatsappNumber={whatsappNumber} payment={paymentSettingsFrom(settings)} query={query} />
      </Container>
    </main>
  );
}
