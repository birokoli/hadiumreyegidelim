import { SITE_URL } from "@/lib/seo/site";
import React from "react";
import type { Metadata } from "next";
import { ButtonLink, PageHero, Panel, Section, SectionHead } from "@/components/ui/kit";

export const metadata: Metadata = {
  title: "Hakkımızda: Biz Kimiz?",
  description: "Hadi Umreye Gidelim, kalabalık kafilelere bağlı kalmadan ailenize özel bireysel umre deneyimi sunan platformdur.",
  alternates: {
    canonical: "/hakkimizda",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "Hakkımızda — Hadi Umreye Gidelim",
  "url": `${SITE_URL}/hakkimizda`,
  "description": "Hadi Umreye Gidelim hakkında bilgi edinin.",
  "publisher": {
    "@type": "Organization",
    "name": "Hadi Umreye Gidelim",
    "url": SITE_URL,
  },
};

export default function HakkimizdaPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Hakkımızda" }]}
        kicker="Biz Kimiz"
        title="Hadi Umreye Gidelim"
        lead="Kalabalık kafilelere ve standart programlara bağlı kalmadan, ailenize özel bireysel umre deneyimi sunan bir organizasyon platformuyuz."
        aside={
          <Panel tone="primary" className="p-6 md:p-8">
            <h2 className="font-headline text-xl font-bold">Kurumsal Bilgi</h2>
            <p className="mt-3 text-sm text-white/90 leading-relaxed">
              Hadi Umreye Gidelim, MBD Tourism L.L.C. iştirakidir. MBD Tourism L.L.C., Dubai Ekonomi ve Turizm Departmanı (DTCM) tarafından lisanslı seyahat acentesidir. DTCM Lisans No: 1203162.
            </p>
            <ButtonLink href="/iletisim" tone="light" className="mt-6 w-full">
              İletişime Geçin
            </ButtonLink>
          </Panel>
        }
      />

      <Section tone="white">
        <div className="space-y-8 text-on-surface leading-relaxed max-w-3xl">
          <div>
            <SectionHead kicker="Yaklaşımımız" title="Niyetimiz" />
            <p className="text-on-surface-variant text-base leading-relaxed">
              Her ailenin umre ihtiyacı farklıdır. Kalabalık programlardan bağımsız olarak, sizi ve ailenizi Kutsal Topraklar'a huzurlu, konforlu ve manevi açıdan verimli şekilde ulaştırmak için çalışıyoruz.
            </p>
          </div>

          <div>
            <SectionHead kicker="Hizmetlerimiz" title="Ne Sunuyoruz" />
            <ul className="grid sm:grid-cols-2 gap-3 mt-4">
              {[
                "Mekke ve Medine otel rezervasyonu",
                "Suudi Arabistan e-vize başvurusu",
                "Özel transfer organizasyonu",
                "Rehberlik desteği",
                "Haremeyn hızlı treni bileti",
                "WhatsApp danışmanlık desteği",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 bg-surface-container-low p-3.5 rounded-xl text-sm font-medium text-on-surface">
                  <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHead kicker="Avantajlarımız" title="Neden Biz?" />
            <p className="text-on-surface-variant text-base leading-relaxed">
              Suudi Arabistan'ın uyguladığı esnek umre politikaları sayesinde, bireysel umre yapmak artık hem yasal hem de çok daha erişilebilir. Biz bu imkânı herkesin kolayca kullanabilmesi için teknoloji ve deneyimlerimizi bir araya getiriyoruz.
            </p>
            <p className="mt-4 text-on-surface-variant text-base leading-relaxed">
              Hadi Umreye Gidelim, MBD Tourism L.L.C. iştirakidir. MBD Tourism L.L.C., Dubai Ekonomi ve Turizm Departmanı (DTCM) tarafından lisanslı seyahat acentesidir. DTCM Lisans No: 1203162.
            </p>
          </div>

          <div className="pt-4">
            <ButtonLink href="/iletisim" tone="primary">
              Danışmanlık Alın
            </ButtonLink>
          </div>
        </div>
      </Section>
    </main>
  );
}
