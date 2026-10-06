import { SITE_URL } from "@/lib/seo/site";
import HugIcon from "@/components/icons/HugIcon";
import { getPageTexts } from "@/lib/page-texts";
import React from "react";
import type { Metadata } from "next";
import { ButtonLink, PageHero, Panel, Section, SectionHead } from "@/components/ui/kit";

export const metadata: Metadata = {
  title: "Hakkımızda: Biz Kimiz?",
  description: "Hadi Umreye Gidelim, kalabalık kafilelere bağlı kalmadan ailenize özel bireysel umre deneyimi sunan platformdur.",
  alternates: {
    canonical: "/hakkimizda",
  },
  openGraph: {
    images: ["/images/hero-kabe.jpg"],
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

export default async function HakkimizdaPage() {
  // Metinler admin → Sayfa Metinleri → Hakkımızda
  const t = await getPageTexts("hakkimizda");
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Hakkımızda" }]}
        kicker={t("kicker")}
        title={t("title")}
        lead={t("lead")}
        aside={
          <Panel tone="primary" className="p-6 md:p-8">
            <h2 className="font-headline text-xl font-bold">{t("aside_title")}</h2>
            <p className="mt-3 text-sm text-white/90 leading-relaxed">
              Hadi Umreye Gidelim, MBD Tourism L.L.C. iştirakidir. MBD Tourism L.L.C., Dubai Ekonomi ve Turizm Departmanı (DTCM) tarafından lisanslı seyahat acentesidir. DTCM Lisans No: 1203162.
            </p>
            <ButtonLink href="/iletisim" tone="light" className="mt-6 w-full">
              {t("aside_cta")}
            </ButtonLink>
          </Panel>
        }
      />

      <Section tone="white">
        <div className="space-y-8 text-on-surface leading-relaxed max-w-3xl">
          <div>
            <SectionHead kicker={t("niyet_kicker")} title={t("niyet_title")} />
            <p className="text-on-surface-variant text-base leading-relaxed">
              {t("niyet_desc")}
            </p>
          </div>

          <div>
            <SectionHead kicker={t("hizmet_kicker")} title={t("hizmet_title")} />
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
                  <HugIcon name="onay" size={20} className="text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHead kicker={t("neden_kicker")} title={t("neden_title")} />
            <p className="text-on-surface-variant text-base leading-relaxed">
              {t("neden_desc1")}
            </p>
            <p className="mt-4 text-on-surface-variant text-base leading-relaxed">
              Hadi Umreye Gidelim, MBD Tourism L.L.C. iştirakidir. MBD Tourism L.L.C., Dubai Ekonomi ve Turizm Departmanı (DTCM) tarafından lisanslı seyahat acentesidir. DTCM Lisans No: 1203162.
            </p>
          </div>

          <div className="pt-4">
            <ButtonLink href="/iletisim" tone="primary">
              {t("cta")}
            </ButtonLink>
          </div>
        </div>
      </Section>
    </main>
  );
}
