import React from 'react';
import { Metadata } from "next";
import ContactFormClient from '@/components/features/ContactFormClient';
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "İletişim & Randevu | Hadi Umre'ye Gidelim",
  description: "Manevi yolculuğunuza ilk adımı birlikte atıyoruz. Umre danışmanlarımızla hemen iletişime geçin, size özel VIP Umre planınızı oluşturalım.",
  alternates: {
    canonical: "/iletisim"
  }
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ paket?: string }> }) {
  const { paket } = await searchParams;
  const selectedPackage = paket ? paket.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';

  let settings: Record<string, string> = {};
  try {
    const settingsArray = await prisma.setting.findMany();
    settings = settingsArray.reduce((acc, s) => { acc[s.key] = s.value; return acc; }, {} as Record<string, string>);
  } catch (e) {
    console.error("Contact settings fetch error", e);
  }

  const contactTitle = settings.CONTACT_TITLE || "İletişim & Rezervasyon";
  const contactDesc = settings.CONTACT_DESC || "Manevi yolculuğunuza ilk adımı birlikte atıyoruz. Formu doldurun, umre danışmanlarımız müsaitlik ve detaylar için en kısa sürede sizi arasın.";
  const contactEmail = settings.CONTACT_EMAIL || "info@hadiumreye.com";
  const contactAddress = settings.CONTACT_ADDRESS || "Fatih, İstanbul";
  const whatsappNumber = settings.WHATSAPP_NUMBER || "905404010038";

  return (
    <main className="pt-32 pb-24 bg-surface-container-lowest min-h-screen">
      <div className="max-w-3xl mx-auto px-8">
        <header className="text-center mb-16">
          <span className="text-tertiary font-label text-xs tracking-[0.3em] font-bold uppercase mb-4 block">Size Ulaşalım</span>
          <h1 className="font-headline text-5xl md:text-6xl text-primary font-bold mb-6 tracking-tight">{contactTitle}</h1>
          <p className="text-on-surface-variant font-light text-lg">{contactDesc}</p>
        </header>

        <section className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl shadow-primary/5 border border-outline-variant/10">
          <ContactFormClient initialPackage={selectedPackage} />
        </section>

        <div className="mt-20 text-center grid grid-cols-1 md:grid-cols-3 gap-10">
           <div className="flex flex-col items-center">
             <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-secondary">call</span>
             </div>
             <p className="font-bold text-primary text-lg">+{whatsappNumber}</p>
             <p className="text-xs text-outline font-medium tracking-wide mt-1">7/24 Çağrı Merkezi</p>
           </div>
           <div className="flex flex-col items-center">
             <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-secondary">mail</span>
             </div>
             <p className="font-bold text-primary text-lg">{contactEmail}</p>
             <p className="text-xs text-outline font-medium tracking-wide mt-1">Kurumsal İletişim</p>
           </div>
           <div className="flex flex-col items-center">
             <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-secondary">location_on</span>
             </div>
             <p className="font-bold text-primary text-lg">{contactAddress}</p>
             <p className="text-xs text-outline font-medium tracking-wide mt-1">Merkez Ofis</p>
           </div>
        </div>
      </div>
    </main>
  );
}
