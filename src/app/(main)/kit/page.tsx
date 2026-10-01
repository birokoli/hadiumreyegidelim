// Tasarım kiti vitrini: yalnızca yerel geliştirmede açılır (canlıda 404). docs/TASARIM-DILI.md
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  Badge, ButtonLink, CardFooter, Container, EmptyState, Faq, MediaCard, PageHero, Panel, PostCard, PriceTag, Section, SectionHead, Steps,
} from "@/components/ui/kit";

export const metadata: Metadata = { title: "Tasarım kiti", robots: { index: false, follow: false } };

const IMG = "https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=1200&auto=format&fit=crop";

export default function KitPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main className="bg-surface">
      <PageHero
        crumbs={[{ label: "Anasayfa", href: "/" }, { label: "Tasarım kiti" }]}
        kicker="PageHero"
        title="Tasarım kiti vitrini"
        lead="Herkese açık sayfalar yalnızca bu parçalarla kurulur. Kurallar: docs/TASARIM-DILI.md"
        aside={<Panel><p className="font-semibold">aside</p><p className="text-sm text-on-surface-variant">Form ya da görsel buraya gelir.</p></Panel>}
      >
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/bireysel-umre">Birincil düğme</ButtonLink>
          <ButtonLink href="/paketler" tone="secondary">İkincil düğme</ButtonLink>
          <ButtonLink href="https://wa.me/905404010038" tone="whatsapp">WhatsApp</ButtonLink>
        </div>
      </PageHero>

      <Section>
        <SectionHead kicker="SectionHead" title="MediaCard (paket, otel, hizmet)" href="/paketler" linkLabel="Tümü" />
        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          <MediaCard href="#" title="Kutlu Rota: İbadet ve Keşif" description="Mekke ve Medine'de 12 gece, Harem'e yürüme mesafesinde oteller." image={IMG} topLeft={<Badge>12 gece</Badge>} topRight={<Badge tone="primary">En çok tercih edilen</Badge>} footer={<CardFooter price={1250} currency="USD" />} />
          <MediaCard href="#" title="Görselsiz kart" description="Görsel yoksa marka yedeği görünür." footer={<CardFooter price={0} />} />
          <MediaCard href="#" title="Otel kartı" description="Mekke · Harem'e 250 m · 5 yıldız" image={IMG} topLeft={<Badge tone="gold">Ekim fiyatı</Badge>} footer={<CardFooter price={95} currency="USD" cta="Bu otelle planla" />} />
        </div>
      </Section>

      <Section tone="muted">
        <SectionHead kicker="PostCard" title="Blog kartları" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          <PostCard href="#" title="Umre vizesi nasıl alınır?" description="Belgeler, süre ve ücret." image={IMG} date="2026-10-01" author="Yasin" />
          <PostCard href="#" title="Görselsiz yazı" description="Yedek görsel." date="2026-09-28" />
        </div>
      </Section>

      <Section tone="white">
        <SectionHead kicker="Steps" title="Numaralı adımlar" />
        <Steps items={[{ title: "Tasarla", text: "Tarih ve otel." }, { title: "Teklif al", text: "WhatsApp'tan." }, { title: "Yola çık", text: "Yanınızdayız." }]} />
      </Section>

      <Section>
        <div className="grid md:grid-cols-3 gap-4">
          <Panel><SectionHead title="Panel (beyaz)" /><PriceTag amount={140} label="Kişi başı" /></Panel>
          <Panel tone="muted"><p className="font-semibold">Panel (gri)</p></Panel>
          <Panel tone="primary"><p className="font-semibold">Panel (lacivert)</p></Panel>
        </div>
        <div className="mt-6"><EmptyState>EmptyState: henüz kayıt yok.</EmptyState></div>
      </Section>

      <Container narrow className="pb-16">
        <SectionHead title="Faq" />
        <Faq items={[{ q: "Umre vizesi ne kadar sürede çıkar?", a: "Belgeler tamamsa 2 iş saati içinde." }, { q: "Ücret ne kadar?", a: "Kişi başı 140 USD." }]} />
      </Container>
    </main>
  );
}
