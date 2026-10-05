import type { Metadata } from "next";
import HelpLayout from "@/components/help/HelpLayout";
import FormBlock from "@/components/help/FormBlock";
import { getPageTexts } from "@/lib/page-texts";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Grup Umresi Talepleri: Aile ve Grup",
  description: "Ailenizle ya da grubunuzla umre için kişi sayınızı ve tarihlerinizi iletin; otel, transfer ve rehberlik dahil programı birlikte planlayalım.",
  alternates: { canonical: "/grup-talepleri" },
};

export default async function GroupPage() {
  const [t, c] = await Promise.all([getPageTexts("grup-talepleri"), getPageTexts("iletisim")]);
  return (
    <HelpLayout active="/grup-talepleri" crumb="Grup talepleri" kicker={t("kicker")} title={t("title")} lead={t("lead")}>
      <section className="rounded-3xl border border-outline-variant/20 bg-white p-5 md:p-8">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-primary/80">Grubunuza göre</p>
        <h2 className="mt-1 font-headline text-2xl font-bold text-primary">Tek plan, herkesin ihtiyacı.</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3 md:divide-x md:divide-outline-variant/20">
          {[1, 2, 3].map((n) => (
            <div key={n} className={n > 1 ? "md:pl-6" : ""}>
              <h3 className="font-semibold text-on-surface text-lg">{t(`card${n}_title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{t(`card${n}_text`)}</p>
            </div>
          ))}
        </div>
      </section>
      <FormBlock title={c("form_title")} lead={c("form_lead")} defaultSubject="Grup talebi" extraLabel={t("extra_label")} />
    </HelpLayout>
  );
}
