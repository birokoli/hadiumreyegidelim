import type { Metadata } from "next";
import HugIcon from "@/components/icons/HugIcon";
import HelpLayout from "@/components/help/HelpLayout";
import FormBlock from "@/components/help/FormBlock";
import { getPageTexts } from "@/lib/page-texts";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "İşletmenizi Kaydedin: Umre İş Ortaklığı",
  description: "Mekke ve Medine'de otel, transfer, rehberlik ya da ziyaret hizmeti veriyorsanız hizmetlerinizi ve iş birliği beklentinizi bizimle paylaşın.",
  alternates: { canonical: "/isletme-kaydi" },
};

export default async function BusinessPage() {
  const [t, c] = await Promise.all([getPageTexts("isletme-kaydi"), getPageTexts("iletisim")]);
  const types = t("types").split("\n").map((x) => x.trim()).filter(Boolean);
  return (
    <HelpLayout active="/isletme-kaydi" crumb="İşletmenizi kaydedin" kicker={t("kicker")} title={t("title")} lead={t("lead")}>
      {types.length > 0 && (
        <section className="rounded-3xl border border-outline-variant/20 bg-white p-5 md:p-8">
          <h2 className="font-headline text-2xl font-bold text-primary">Kimlerle çalışıyoruz?</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {types.map((x) => (
              <li key={x} className="flex items-start gap-3 rounded-xl bg-surface-container-low p-4 text-on-surface">
                <HugIcon name="onay" size={20} className="text-primary" />
                {x}
              </li>
            ))}
          </ul>
        </section>
      )}
      <FormBlock title={c("form_title")} lead={c("form_lead")} defaultSubject="İşletme kaydı / iş ortaklığı" extraLabel={t("extra_label")} />
    </HelpLayout>
  );
}
