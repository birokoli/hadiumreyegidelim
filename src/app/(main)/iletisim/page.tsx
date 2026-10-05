import type { Metadata } from "next";
import Link from "next/link";
import HelpLayout from "@/components/help/HelpLayout";
import FormBlock from "@/components/help/FormBlock";
import { getPageTexts } from "@/lib/page-texts";

export const metadata: Metadata = {
  title: "İletişim ve Destek",
  description: "Umre planı, vize, ödeme ya da rezervasyonunuzla ilgili sorularınız için bize yazın; WhatsApp, telefon ve e-posta ile ulaşın.",
  alternates: { canonical: "/iletisim" },
  openGraph: { images: ["/images/hero-kabe.jpg"] },
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ paket?: string; konu?: string }> }) {
  const t = await getPageTexts("iletisim");
  const { paket, konu } = await searchParams;
  const pkg = paket ? paket.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";
  // Kayıtlı eski adres (Fatih) bir kez Bakırköy olarak düzeltilir (3 Ekim, kullanıcı)
  await import("@/lib/catalog/data-fixes").then(async (m) => { await m.runDataFixesOnceC(); await m.runDataFixesOnceI(); }).catch(() => {});

  return (
    <HelpLayout
      active="/iletisim"
      crumb="Destek ve iletişim"
      kicker={t("kicker")}
      title={t("hero_title")}
      lead={t("hero_lead")}
      cta={
        <Link href="#form" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-primary">
          Mesajınızı yazın <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      }
    >
      <FormBlock title={t("form_title")} lead={t("form_lead")} defaultSubject={konu || (pkg ? "Umre planlama ve rezervasyon" : "")} initialMessage={pkg ? `${pkg} paketi hakkında bilgi almak istiyorum.` : ""} />
      <p className="text-sm text-on-surface-variant">
        Sık sorulan sorulara <Link href="/sss" className="font-semibold text-primary underline">buradan</Link> göz atabilirsiniz.
      </p>
    </HelpLayout>
  );
}
