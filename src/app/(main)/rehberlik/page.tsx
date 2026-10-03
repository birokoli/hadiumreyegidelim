import React from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ButtonLink, EmptyState, MediaCard, PageHero, Panel, Section, SectionHead } from "@/components/ui/kit";
import { getPageTexts } from "@/lib/page-texts";

export const metadata: Metadata = {
  title: "Umre Rehberliği: Mekke ve Medine",
  description: "Mekke ve Medine'deki bireysel umre ziyaretleriniz için ilahiyatçı Türkçe rehberlik hizmeti. Manevi rehberler eşliğinde ibadet ve ziyaret planlama.",
  alternates: {
    canonical: "/rehberlik"
  }
};

export const revalidate = 300;

export default async function RehberlikHubPage() {
  const t = await getPageTexts("rehberlik");
  const guides = await prisma.guide.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main>
      <PageHero
        crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Rehberlik" }]}
        kicker={t("kicker")}
        title={t("title")}
        lead={t("lead")}
        aside={
          <Panel tone="primary" className="p-6 md:p-8">
            <h2 className="font-headline text-xl font-bold">{t("aside_title")}</h2>
            <p className="mt-2 text-sm text-white/80 leading-relaxed">
              {t("aside_desc")}
            </p>
            <ButtonLink href="/bireysel-umre" tone="light" className="mt-6 w-full">
              {t("aside_cta")}
            </ButtonLink>
          </Panel>
        }
      />

      <Section tone="white">
        <SectionHead kicker={t("team_kicker")} title={t("team_title")} />
        
        {guides.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <Panel key={guide.id} tone="white" className="flex flex-col p-5">
                <MediaCard
                  href="/bireysel-umre"
                  title={guide.name}
                  description={guide.title || "Umre Rehberi"}
                  image={guide.image && guide.image.length > 0 ? guide.image : null}
                  fallbackIcon="mosque"
                  aspect="aspect-[4/3]"
                  className="mb-4"
                />
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-outline-variant/20">
                  <ButtonLink href="/bireysel-umre" tone="secondary" className="px-4 py-2 text-xs">
                    Rehberi Seç
                  </ButtonLink>
                  {guide.price > 0 && (
                    <span className="font-headline font-bold text-primary text-base">
                      {guide.price} $
                    </span>
                  )}
                </div>
              </Panel>
            ))}
          </div>
        ) : (
          <EmptyState onWhite>
            Rehber kadromuz güncelleniyor. Planlayıcı üzerinden rehberlik hizmeti ekleyebilirsiniz.
          </EmptyState>
        )}
      </Section>

      <Section tone="muted">
        <SectionHead kicker={t("spots_kicker")} title={t("spots_title")} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Panel tone="white" className="p-6 flex flex-col">
            <h3 className="font-headline text-lg font-bold text-primary mb-2">Şafak Vakti Kuba</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
              Kuba Mescidi'nde sabahın ilk ışıklarında huzurlu bir ibadet ve ziyaret tecrübesi.
            </p>
            <ButtonLink href="/bireysel-umre" tone="secondary" className="mt-auto w-full">
              Planlayıcıya Ekle
            </ButtonLink>
          </Panel>

          <Panel tone="white" className="p-6 flex flex-col">
            <h3 className="font-headline text-lg font-bold text-primary mb-2">Hendek Meydanı</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
              İslam tarihinin önemli dönüm noktalarından Hendek Savaşı bölgesinde anlatımlı ziyaret.
            </p>
            <ButtonLink href="/bireysel-umre" tone="secondary" className="mt-auto w-full">
              Planlayıcıya Ekle
            </ButtonLink>
          </Panel>

          <Panel tone="white" className="p-6 flex flex-col">
            <h3 className="font-headline text-lg font-bold text-primary mb-2">Medine Hurma Bahçeleri</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
              Medine'nin bereketli hurma bahçelerini ziyaret ederek manevi dinlence olanağı.
            </p>
            <ButtonLink href="/bireysel-umre" tone="secondary" className="mt-auto w-full">
              Planlayıcıya Ekle
            </ButtonLink>
          </Panel>
        </div>
      </Section>

      <Section tone="white">
        <Panel tone="primary" className="p-8 md:p-12 text-center">
          <h2 className="font-headline text-2xl md:text-4xl font-bold text-white">Sizin Manevi Yolunuz</h2>
          <p className="mt-3 text-white/80 max-w-xl mx-auto text-sm md:text-base">
            Rehberlerimizi ve ziyaret rotalarınızı planlayıcımız üzerinden kendi niyetinize göre belirleyin.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <ButtonLink href="/bireysel-umre" tone="light">
              Hemen Planla
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
