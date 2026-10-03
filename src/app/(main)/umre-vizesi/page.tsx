import { SITE_URL } from "@/lib/seo/site";
import React from "react";
import type { Metadata } from "next";
import { PageTrust, webPageJsonLd } from "@/components/seo/PageTrust";
import { ButtonLink, Faq, faqJsonLd, PageHero, Panel, Section, SectionHead } from "@/components/ui/kit";

export const metadata: Metadata = {
  title: { absolute: "Bireysel Umre Vizesi Nasıl Alınır? Suudi Arabistan E-Vize" },
  description: "Umre vizesi 2026: Suudi Arabistan turist e-vizesiyle umre yapılır. Vize hizmetimiz kişi başı 140 USD, belgeler tamamsa 2 iş saatinde çıkar.",
  keywords: ["umre vizesi", "bireysel umre vizesi", "bireysel umre vizesi nasıl alınır", "suudi arabistan e vize umre", "umre vize fiyatları 2026", "turistik umre vizesi", "bireysel umre"],
  alternates: {
    canonical: `${SITE_URL}/umre-vizesi`,
  }
};

const VISA_FAQ = [
  {
    q: "Umre vizesi ne kadar sürede çıkar?",
    a: "Hadi Umreye Gidelim üzerinden yapılan umre vizesi başvurusunda, belgeleriniz eksiksiz ulaştıktan sonra vize 2 iş saati içinde çıkar.",
  },
  {
    q: "Umre vizesi ücreti ne kadar?",
    a: "Umre vizesi hizmetimizin ücreti kişi başı 140 USD'dir. Başvuruyu online vize başvuru formumuzdan başlatabilirsiniz.",
  },
  {
    q: "Umre için hangi vize gerekir?",
    a: "Türkiye'den umreye gidenler Suudi Arabistan'ın elektronik turist vizesiyle (e-vize) umre yapabilir. Ayrı bir \"bireysel umre vizesi\" türü yoktur; turist vizesi umre yapmaya izin verir.",
  },
  {
    q: "Suudi Arabistan turist vizesi ne kadar geçerlidir?",
    a: "Turist e-vizesi genellikle 1 yıl (365 gün) geçerli ve çok girişli verilir. Vize süresi boyunca Suudi Arabistan'da toplam en fazla 90 gün kalınabilir.",
  },
  {
    q: "Vize başvurusu için pasaport ne kadar geçerli olmalı?",
    a: "Pasaportun Suudi Arabistan'a giriş tarihinden itibaren en az 6 ay (yaklaşık 180 gün) geçerli olması gerekir. Vize işlemlerini pasaport bilgilerinizle biz yürütüyoruz.",
  },
];

const visaJsonLd = [
  faqJsonLd(VISA_FAQ),
  webPageJsonLd({ url: `${SITE_URL}/umre-vizesi`, name: "Bireysel Umre Vizesi Nasıl Alınır?" }),
];

export default function UmreVizesiPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(visaJsonLd) }} />

      <PageHero
        crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Umre Vizesi" }]}
        kicker="Vize İşlemleri"
        title="Bireysel Umre Vizesi Nedir?"
        lead="Kalabalık gruplara ve katı kurallara bağlı kalmak zorunda değilsiniz. Kendi ailenizle, bağımsız bir umre deneyimi için gereken vize süreci oldukça kolaydır."
        aside={
          <Panel tone="primary" className="p-6 md:p-8">
            <h2 className="font-headline text-xl font-bold">Vize Hizmeti</h2>
            <p className="mt-2 text-2xl font-bold text-white">140 USD <span className="text-sm font-normal text-white/80">/ kişi başı</span></p>
            <p className="mt-2 text-sm text-white/80">Belgeleriniz tamamsa vizeniz 2 iş saati içinde hazır olur.</p>
            <ButtonLink href="/umre-vizesi/basvuru" tone="light" className="mt-6 w-full">
              Online Vize Başvurusu Yap
            </ButtonLink>
          </Panel>
        }
      >
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/umre-vizesi/basvuru" tone="primary">
            Online Vize Başvurusu →
          </ButtonLink>
          <ButtonLink href="/bireysel-umre" tone="secondary">
            Umrenizi Planlayın
          </ButtonLink>
        </div>
      </PageHero>

      <Section tone="white">
        <div className="max-w-3xl space-y-10">
          <div>
            <SectionHead kicker="Vize Türü" title="Resmi Vize Statüsü" />
            <div className="prose prose-lg prose-slate text-on-surface-variant leading-relaxed space-y-4">
              <p>
                Resmi olarak ayrı bir vize türü yoktur. Suudi Arabistan'ın sunduğu <strong>Suudi Arabistan E-Turizm Vizesi</strong> (Elektronik Turistik Vize) başvurusu sırasında <em>"Umre de yapmak istiyorum"</em> seçeneğini işaretlemek yeterlidir.
              </p>
              <div className="p-5 bg-surface-container-low rounded-xl border border-outline-variant/30 text-on-surface font-medium">
                Suudi Arabistan'a turistik giriş vizesi alırsınız; bu vize kapsamında kendi başınıza umre yapmanıza yasal olarak izin verilir.
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Panel tone="muted" className="p-6">
              <h3 className="font-headline text-lg font-bold text-primary mb-3">Avantajları</h3>
              <ul className="space-y-2.5 text-sm text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-base mt-0.5">check</span>
                  Genellikle 1 yıllık ve "Çok Girişli" verilir.
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-base mt-0.5">check</span>
                  Mekke, Medine ve tüm şehirleri gezme hakkı tanır.
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-base mt-0.5">check</span>
                  Gruplarla aynı otelde kalmak zorunda değilsiniz.
                </li>
              </ul>
            </Panel>

            <Panel tone="muted" className="p-6">
              <h3 className="font-headline text-lg font-bold text-primary mb-3">Nasıl Alınır?</h3>
              <ol className="space-y-3 text-sm text-on-surface-variant">
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white">1</span>
                  <span>Otel rezervasyonunuzu ve gidiş-dönüş uçak biletinizi WhatsApp&apos;tan bize gönderin.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white">2</span>
                  <span>Pasaportunuzun ön yüzünün fotoğrafını ve her yolcu için birer biyometrik fotoğraf gönderin.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white">3</span>
                  <span>Vize ücretini ödeyin (kişi başı 140 USD).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white">4</span>
                  <span>Belgeleriniz tamamsa vizeniz 2 saat içinde Hadi Umreye Gidelim tarafından size iletilir.</span>
                </li>
              </ol>
            </Panel>
          </div>

          <div>
            <SectionHead kicker="Yasal Bilgi" title="Vize İşlemleri Hakkında" />
            <p className="text-on-surface-variant leading-relaxed">
              Bireysel Umre, kişisel seyahatinizdir. Uçak biletinizi alıp E-Turizm Vizenizle yola çıktığınızda ek onay ihtiyacınız yoktur. Bizler bu süreçte sadece vize başvurunuzu hızlıca sonuçlandırmanız ve konaklama/transferinizi kolayca planlamanız için danışmanlık hizmeti sunuyoruz.
            </p>
          </div>

          <div>
            <SectionHead kicker="Merak Edilenler" title="Umre vizesi hakkında sık sorulanlar" />
            <Faq items={VISA_FAQ} />
          </div>

          <PageTrust className="mt-8" />
        </div>
      </Section>

      <Section tone="muted">
        <Panel tone="primary" className="p-8 md:p-12 text-center">
          <h2 className="font-headline text-2xl md:text-4xl font-bold text-white">Vize Başvurunuzu Hemen Başlatın</h2>
          <p className="mt-3 text-white/80 max-w-xl mx-auto text-sm md:text-base">
            Elektronik turizm vizeniz kişi başı 140 USD'dir. Belgeleriniz eksiksiz ulaştığında 2 iş saati içinde başvurunuz tamamlanır.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <ButtonLink href="/umre-vizesi/basvuru" tone="light">
              Vize Başvurusu Yap
            </ButtonLink>
            <ButtonLink href="/bireysel-umre" tone="secondary">
              Umrenizi Tasarlayın
            </ButtonLink>
            <ButtonLink href="/iletisim" tone="secondary">
              Bize Ulaşın
            </ButtonLink>
          </div>
        </Panel>
      </Section>
    </main>
  );
}
