import React from "react";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eylül Grup Umresi — 10, 15 ve 20 Günlük Programlar | HadiUmreyeGidelim",
  description:
    "15 veya 25 Eylül çıkışlı grup umresi. Kişi başı 1.250 USD'den başlayan fiyatlarla vize, uçak bileti, Kâbe'ye yürüme mesafesinde otel ve mübarek yerler turu dahil.",
  alternates: {
    canonical: "/agustos-kampanyasi",
  },
};

export const revalidate = 60;

const INCLUDED = [
  {
    icon: "flight",
    label: "Gidiş – Dönüş Uçak Bileti",
    detail: "Pakete dahil",
  },
  {
    icon: "badge",
    label: "Umre Vizesi",
    detail: "Pakete dahil",
  },
  {
    icon: "hotel",
    label: "Otel Konaklaması",
    detail: "Kâbe'ye yürüme mesafesinde",
  },
  {
    icon: "mosque",
    label: "Tüm Mübarek Yerler Turu",
    detail: "Program dahilinde",
  },
];

const PACKAGES = [
  { days: "10 Günlük Umre", double: "$1.350", triple: "$1.300", quad: "$1.250" },
  { days: "15 Günlük Umre", double: "$1.400", triple: "$1.350", quad: "$1.300" },
  { days: "20 Günlük Umre", double: "$1.500", triple: "$1.450", quad: "$1.400" },
];

const CHILD_PRICES = [
  { icon: "child_care", label: "2–11 Yaş Çocuk", price: "$1.000" },
  { icon: "baby_changing_station", label: "0–2 Yaş Çocuk", price: "$750" },
];

const FAQS = [
  {
    q: "Uçak bileti ve vize dahil mi?",
    a: "Evet. Gidiş–dönüş uçak bileti ve umre vizesi belirtilen kişi başı paket fiyatlarına dahildir.",
  },
  {
    q: "Otel Kâbe'ye ne kadar uzaklıkta?",
    a: "Konaklama yapılacak otel Kâbe'ye yürüme mesafesindedir.",
  },
  {
    q: "Fiyatlar oda başına mı, kişi başına mı?",
    a: "Bütün fiyatlar kişi başı ücretlerdir. Yetişkin fiyatı, tercih edilen program süresine ve oda tipine göre belirlenir.",
  },
  {
    q: "Kontenjan kaç kişi?",
    a: "Bu grup umresi için toplam kontenjan 35 kişidir.",
  },
];

export default async function AgustosKampanyasiPage() {
  const settingsArray = await prisma.setting.findMany();
  const settings = settingsArray.reduce(
    (acc, s) => {
      acc[s.key] = s.value;
      return acc;
    },
    {} as Record<string, string>
  );

  const whatsappNumber = settings.WHATSAPP_NUMBER
    ? settings.WHATSAPP_NUMBER.replace("+", "")
    : "905404010038";

  const waMsg = (text: string) =>
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

  const heroWa = waMsg(
    "Merhaba, 15 veya 25 Eylül çıkışlı grup umresi kampanyası hakkında bilgi almak istiyorum."
  );

  return (
    <main className="pt-20">
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=2600&auto=format&fit=crop"
            alt="Kâbe Manzarası – Eylül Grup Umresi"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/92 via-primary/75 to-[#001944]/85" />
        </div>

        <div className="relative z-10 max-w-screen-xl mx-auto px-6 md:px-8 text-center py-20 md:py-28">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 rounded-full bg-white/10 border border-white/20 text-white font-bold text-[10px] tracking-[0.3em] uppercase backdrop-blur-md shadow-xl">
            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              campaign
            </span>
            SINIRLI KONTENJAN — 15 VEYA 25 EYLÜL ÇIKIŞLI
          </div>

          <h1 className="font-headline text-5xl md:text-7xl text-white font-bold leading-[1.1] mb-4 drop-shadow-xl max-w-4xl mx-auto">
            Eylül <span className="text-[#FFD166]">Grup Umresi</span>
          </h1>

          <div className="inline-flex items-baseline gap-3 mb-6">
            <span className="text-[#FFD166] text-6xl md:text-7xl font-headline font-bold drop-shadow-lg">
              $1.250
            </span>
            <span className="text-white/80 text-xl font-headline italic">/ kişi başı</span>
          </div>

          <p className="text-white/90 text-lg md:text-xl font-headline mb-10 tracking-wide">
            📅 15 veya 25 Eylül &nbsp;·&nbsp; 10, 15 veya 20 Gün
          </p>

          <a href={heroWa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-[#25D366] text-white px-10 py-5 rounded-2xl font-bold tracking-widest text-sm uppercase shadow-2xl hover:bg-[#128C7E] active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
            WhatsApp&apos;a Yaz
          </a>

          <p className="text-white/50 text-xs mt-5 tracking-widest uppercase">
            Grup umresi · Toplam 35 kişilik kontenjan
          </p>
        </div>
      </section>

      <section className="bg-primary py-8 border-b border-white/10">
        <div className="max-w-screen-xl mx-auto px-6 md:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 text-white text-center">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#FFD166] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>flight_takeoff</span>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">1. Çıkış</p>
                <p className="font-bold text-sm">15 Eylül</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/20" />
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#FFD166] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>flight_takeoff</span>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">2. Çıkış</p>
                <p className="font-bold text-sm">25 Eylül</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/20" />
            <a href={heroWa} target="_blank" rel="noopener noreferrer" className="shrink-0 bg-[#25D366] text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#128C7E] transition-colors shadow-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
              Yer Ayırt
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface-container-lowest">
        <div className="max-w-screen-xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <span className="text-secondary font-bold tracking-widest uppercase text-[10px] block mb-3 border-l-2 border-secondary pl-3 w-fit mx-auto">Program Seçenekleri</span>
            <h2 className="font-headline text-3xl md:text-4xl text-primary font-bold">Kişi Başı Umre Fiyatları</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PACKAGES.map((item) => (
              <div key={item.days} className="bg-white rounded-2xl p-6 border border-secondary/10 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
                <h3 className="font-headline text-xl text-primary font-bold mb-5">{item.days}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4"><span className="text-on-surface-variant">2 Kişilik Oda</span><strong className="text-secondary text-lg">{item.double}</strong></div>
                  <div className="flex items-center justify-between gap-4"><span className="text-on-surface-variant">3 Kişilik Oda</span><strong className="text-secondary text-lg">{item.triple}</strong></div>
                  <div className="flex items-center justify-between gap-4"><span className="text-on-surface-variant">4 Kişilik Oda</span><strong className="text-secondary text-lg">{item.quad}</strong></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a href={heroWa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-bold tracking-widest text-sm uppercase shadow-xl hover:bg-[#128C7E] transition-all">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
              Paket Hakkında Bilgi Al
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface">
        <div className="max-w-screen-xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <span className="text-on-surface-variant font-bold tracking-widest uppercase text-[10px] block mb-3 border-l-2 border-outline-variant pl-3 w-fit mx-auto">Çocuk Fiyatları</span>
            <h2 className="font-headline text-3xl md:text-4xl text-primary font-bold">Çocuklar İçin Kişi Başı Ücretler</h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {CHILD_PRICES.map((item) => (
              <div key={item.label} className="bg-white rounded-xl px-6 py-4 border border-outline-variant/20 shadow-sm flex items-center gap-4">
                <span className="material-symbols-outlined text-outline text-[22px]">{item.icon}</span>
                <p className="text-on-surface-variant text-sm flex-1">{item.label}</p>
                <span className="text-lg text-secondary font-bold shrink-0">{item.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface-container-lowest">
        <div className="max-w-screen-xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <span className="text-secondary font-bold tracking-widest uppercase text-[10px] block mb-3 border-l-2 border-secondary pl-3 w-fit mx-auto">Pakete Dahil</span>
            <h2 className="font-headline text-3xl md:text-4xl text-primary font-bold">Her Şey Düşünüldü</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INCLUDED.map((item) => (
              <div key={item.label} className="bg-white rounded-2xl p-6 border border-secondary/10 shadow-sm flex items-start gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                <div>
                  <p className="font-bold text-primary text-sm leading-snug">{item.label}</p>
                  <p className="text-secondary text-xs mt-1 font-bold">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary/5 border-y border-primary/10">
        <div className="max-w-screen-md mx-auto px-6 md:px-8 text-center">
          <span className="material-symbols-outlined text-primary text-5xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
          <h2 className="font-headline text-2xl md:text-3xl text-primary font-bold mb-4">Fiyat ve Kontenjan Notu</h2>
          <div className="space-y-3 text-on-surface-variant text-sm leading-relaxed max-w-lg mx-auto">
            {["Bütün fiyatlar kişi başı ücrettir.", "Program grup umresidir ve toplam kontenjan 35 kişidir.", "Otel Kâbe'ye yürüme mesafesindedir."].map((note) => (
              <p key={note} className="flex items-start gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {note}
              </p>
            ))}
          </div>
          <a href={heroWa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-bold tracking-widest text-sm uppercase shadow-xl hover:bg-[#128C7E] transition-all mt-8">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
            Fiyat Hesaplat
          </a>
        </div>
      </section>

      <section className="py-20 bg-surface-container-lowest">
        <div className="max-w-screen-md mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <span className="text-secondary font-bold tracking-widest uppercase text-[10px] block mb-3 border-l-2 border-secondary pl-3 w-fit mx-auto">Sıkça Sorulan Sorular</span>
            <h2 className="font-headline text-3xl md:text-4xl text-primary font-bold">Aklınızdaki Sorular</h2>
          </div>
          <div className="space-y-5">
            {FAQS.map((faq) => (
              <div key={faq.q} className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow">
                <h3 className="font-bold text-primary mb-3 flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
                  {faq.q}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a href={heroWa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-bold tracking-widest text-sm uppercase shadow-xl hover:bg-[#128C7E] transition-all">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
              Sorunuzu Sorun
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=2600&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-screen-xl mx-auto px-6 md:px-8 text-center">
          <h2 className="font-headline text-4xl md:text-5xl font-bold mb-4">15 veya 25 Eylül Çıkışlı</h2>
          <p className="text-white/80 text-lg mb-2 max-w-xl mx-auto">
            Kişi başı <span className="text-[#FFD166] font-bold text-2xl">$1.250</span> ile manevi yolculuğunuzu şimdi planlayın.
          </p>
          <p className="text-white/50 text-xs tracking-widest uppercase mb-10">Grup umresi · Toplam 35 kişilik kontenjan</p>
          <a href={heroWa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-[#25D366] text-white px-12 py-5 rounded-2xl font-bold tracking-widest text-sm uppercase shadow-2xl hover:bg-[#128C7E] active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
            WhatsApp&apos;a Yaz
          </a>
        </div>
      </section>
    </main>
  );
}
