import React from "react";
import type { Metadata } from "next";
import ContactFormClient from "@/components/features/ContactFormClient";
import { getSiteSettings } from "@/lib/site-settings";
import { ButtonLink, PageHero, Panel, Section } from "@/components/ui/kit";

export const metadata: Metadata = {
  title: "İletişim & Umre Danışmanlığı",
  description: "Manevi yolculuğunuza ilk adımı birlikte atıyoruz. Umre danışmanlarımızla hemen iletişime geçin, umre planınızı oluşturalım.",
  alternates: {
    canonical: "/iletisim"
  }
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ paket?: string }> }) {
  const { paket } = await searchParams;
  const selectedPackage = paket ? paket.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "";

  // Kayıtlı eski adres (Fatih) bir kez Bakırköy olarak düzeltilir (3 Ekim, kullanıcı)
  await import("@/lib/catalog/data-fixes").then((m) => m.runDataFixesOnceC()).catch(() => {});
  const settings = await getSiteSettings();

  const contactTitle = settings.CONTACT_TITLE || "İletişim";
  const contactDesc = settings.CONTACT_DESC || "Formu doldurun, umre danışmanlarımız müsaitlik ve detaylar için en kısa sürede sizi arasın.";
  const contactEmail = settings.CONTACT_EMAIL || "info@hadiumreye.com";
  const contactAddress = (settings.CONTACT_ADDRESS || "Bakırköy, İstanbul").replace(/Fatih/i, "Bakırköy");
  const whatsappNumber = settings.WHATSAPP_NUMBER || "905404010038";

  return (
    <main>
      <PageHero
        crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "İletişim" }]}
        kicker="İletişim"
        title={contactTitle}
        lead={contactDesc}
        aside={
          <Panel tone="white" className="p-6 md:p-8">
            <ContactFormClient initialPackage={selectedPackage} />
          </Panel>
        }
      />

      <Section tone="muted">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Panel tone="white" className="flex flex-col items-center text-center p-6">
            <span className="material-symbols-outlined text-3xl text-primary mb-3">call</span>
            <p className="font-headline font-bold text-primary text-lg">+{whatsappNumber}</p>
            <p className="text-xs text-on-surface-variant font-medium mt-1 mb-4">Çağrı Merkezi & WhatsApp</p>
            <ButtonLink href={`https://wa.me/${whatsappNumber}`} tone="whatsapp" className="w-full mt-auto">
              WhatsApp'tan Yazın
            </ButtonLink>
          </Panel>

          <Panel tone="white" className="flex flex-col items-center text-center p-6">
            <span className="material-symbols-outlined text-3xl text-primary mb-3">mail</span>
            <p className="font-headline font-bold text-primary text-lg">{contactEmail}</p>
            <p className="text-xs text-on-surface-variant font-medium mt-1 mb-4">E-posta İletişimi</p>
            <ButtonLink href={`mailto:${contactEmail}`} tone="secondary" className="w-full mt-auto">
              E-posta Gönderin
            </ButtonLink>
          </Panel>

          <Panel tone="white" className="flex flex-col items-center text-center p-6">
            <span className="material-symbols-outlined text-3xl text-primary mb-3">location_on</span>
            <p className="font-headline font-bold text-primary text-lg">{contactAddress}</p>
            <p className="text-xs text-on-surface-variant font-medium mt-1 mb-4">Merkez Ofis</p>
            <ButtonLink href="/hakkimizda" tone="secondary" className="w-full mt-auto">
              Hakkımızda
            </ButtonLink>
          </Panel>
        </div>
      </Section>
    </main>
  );
}
