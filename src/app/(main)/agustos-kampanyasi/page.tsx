import React from "react";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "9 Günlük Bireysel Umre — 10–19 Ağustos 2025 | HadiUmreyeGidelim",
  description:
    "Kişi başı $360'tan başlayan fiyatlarla 10–19 Ağustos 2025 tarihleri arasında 9 günlük bireysel umre. Al Hidayah Towers Mekke + Sedra Global Hotel Medine, hızlı tren ve transferler dahil.",
  alternates: {
    canonical: "/agustos-kampanyasi",
  },
};

export const revalidate = 60;

const INCLUDED = [
  {
    icon: "hotel",
    label: "Al Hidayah Towers – Mekke Oteli",
    detail: "Servisli, Kahvaltılı",
  },
  {
    icon: "hotel",
    label: "Sedra Global Hotel – Medine Oteli",
    detail: "Servisli, Kahvaltılı",
  },
  {
    icon: "train",
    label: "Cidde Hav. → Mekke Hızlı Tren Bileti",
    detail: "",
  },
  {
    icon: "train",
    label: "Mekke ↔ Medine Hızlı Tren Bileti",
    detail: "",
  },
  {
    icon: "directions_car",
    label: "Tren İstasyonu ↔ Otel Transferleri",
    detail: "Eco VIP",
  },
  {
    icon: "directions_car",
    label: "Medine Havalimanı ↔ Medine Oteli Transferi",
    detail: "",
  },
];

const NOT_INCLUDED = [
  {
    icon: "flight",
    label: "Uçak bileti",
    detail: "Talep halinde +₺22.347/kişi",
  },
  { icon: "badge", label: "Vize", detail: "" },
  { icon: "auto_stories", label: "Dini rehber", detail: "" },
  { icon: "restaurant", label: "Akşam yemekleri", detail: "" },
  {
    icon: "swap_horiz",
    label: "Cidde Hav. Terminaller Arası Transfer",
    detail: "",
  },
];

const FAQS = [
  {
    q: "Uçak bileti dahil mi?",
    a: "Hayır, ayrıca eklenebilir. Kişi başı ₺22.347'den başlayan fiyatlarla İstanbul–Cidde/Medine–İstanbul rotası için WhatsApp'tan bilgi alabilirsiniz.",
  },
  {
    q: "Vize nasıl çıkarılır?",
    a: "Vize pakete dahil değildir. Vize işlemleri için WhatsApp'tan destek alabilirsiniz.",
  },
  {
    q: "Farklı otel tercih edebilir miyim?",
    a: "Evet, fiyat farkı hesaplanarak bilgi verilir.",
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
    "Merhaba, 10–19 Ağustos 2025 bireysel umre kampanyası hakkında bilgi almak istiyorum."
  );
  const generalWa = waMsg(
    "Merhaba, Ağustos 2025 umre kampanyası hakkında bilgi almak istiyorum."
  );

  return (
    <main className="pt-20">
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1564769625905-50e93615e769?q=80&w=2600&auto=format&fit=crop"
            alt="Kabe Manzarası – Ağustos 2025 Bireysel Umre"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/92 via-primary/75 to-[#001944]/85" />
        </div>

        <div className="relative z-10 max-w-screen-xl mx-auto px-6 md:px-8 text-center py-20 md:py-28">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 rounded-full bg-white/10 border border-white/20 text-white font-bold text-[10px] tracking-[0.3em] uppercase backdrop-blur-md shadow-xl">
            <span
              className="material-symbols-outlined text-[13px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              campaign
            </span>
            ÖZEL KAMPANYA — 10–19 AĞUSTOS 2025
          </div>

          <h1 className="font-headline text-5xl md:text-7xl text-white font-bold leading-[1.1] mb-4 drop-shadow-xl max-w-4xl mx-auto">
            9 Günlük{" "}
            <span className="text-[#FFD166]">Bireysel Umre</span>
          </h1>

          {/* Fiyat */}
          <div className="inline-flex items-baseline gap-3 mb-6">
            <span className="text-[#FFD166] text-6xl md:text-7xl font-headline font-bold drop-shadow-lg">
              $360
            </span>
            <span className="text-white/80 text-xl font-headline italic">
              / kişi başı
            </span>
          </div>

          {/* Tarih */}
          <p className="text-white/90 text-lg md:text-xl font-headline mb-10 tracking-wide">
            📅 10 – 19 Ağustos 2025 &nbsp;·&nbsp; 9 Gün / 9 Gece
          </p>

          {/* CTA */}
          <a
            href={heroWa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] text-white px-10 py-5 rounded-2xl font-bold tracking-widest text-sm uppercase shadow-2xl hover:bg-[#128C7E] active:scale-95 transition-all"
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              chat
            </span>
            WhatsApp&apos;a Yaz
          </a>

          <p className="text-white/50 text-xs mt-5 tracking-widest uppercase">
            Minimum 2 kişi · Fiyat dolar bazlıdır
          </p>
        </div>
      </section>

      {/* ── PROGRAM ─────────────────────────────────────────────────── */}
      <section className="bg-primary py-8 border-b border-white/10">
        <div className="max-w-screen-xl mx-auto px-6 md:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 text-white text-center">
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined text-[#FFD166] text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                mosque
              </span>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">
                  Mekke
                </p>
                <p className="font-bold text-sm">10–16 Ağustos · 6 gece</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/20" />
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined text-[#FFD166] text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                place
              </span>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">
                  Medine
                </p>
                <p className="font-bold text-sm">16–19 Ağustos · 3 gece</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/20" />
            <a
              href={generalWa}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 bg-[#25D366] text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#128C7E] transition-colors shadow-lg flex items-center gap-2"
            >
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                chat
              </span>
              Yer Ayırt
            </a>
          </div>
        </div>
      </section>

      {/* ── DAHİL OLANLAR ────────────────────────────────────────────── */}
      <section className="py-20 bg-surface-container-lowest">
        <div className="max-w-screen-xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <span className="text-secondary font-bold tracking-widest uppercase text-[10px] block mb-3 border-l-2 border-secondary pl-3 w-fit mx-auto">
              Pakete Dahil
            </span>
            <h2 className="font-headline text-3xl md:text-4xl text-primary font-bold">
              Her Şey Düşünüldü
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INCLUDED.map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-2xl p-6 border border-secondary/10 shadow-sm flex items-start gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all"
              >
                <div className="shrink-0 w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <span
                    className="material-symbols-outlined text-[22px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {item.icon}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-primary text-sm leading-snug">
                    {item.label}
                  </p>
                  {item.detail && (
                    <p className="text-secondary text-xs mt-1 font-bold">
                      {item.detail}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp CTA */}
          <div className="mt-10 text-center">
            <a
              href={generalWa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-bold tracking-widest text-sm uppercase shadow-xl hover:bg-[#128C7E] transition-all"
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                chat
              </span>
              Paket Hakkında Bilgi Al
            </a>
          </div>
        </div>
      </section>

      {/* ── DAHİL OLMAYANLAR ─────────────────────────────────────────── */}
      <section className="py-20 bg-surface">
        <div className="max-w-screen-xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <span className="text-on-surface-variant font-bold tracking-widest uppercase text-[10px] block mb-3 border-l-2 border-outline-variant pl-3 w-fit mx-auto">
              Pakete Dahil Değil
            </span>
            <h2 className="font-headline text-3xl md:text-4xl text-primary font-bold">
              Ayrıca Hesaplanır
            </h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            {NOT_INCLUDED.map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-xl px-6 py-4 border border-outline-variant/20 shadow-sm flex items-center gap-4"
              >
                <span
                  className="material-symbols-outlined text-outline text-[22px]"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <p className="text-on-surface-variant text-sm flex-1">
                  {item.label}
                </p>
                {item.detail && (
                  <span className="text-xs text-outline font-bold shrink-0">
                    {item.detail}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* WhatsApp CTA */}
          <div className="mt-10 text-center">
            <a
              href={waMsg(
                "Merhaba, uçak bileti fiyatı ve Ağustos 2025 kampanyası hakkında bilgi almak istiyorum."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-bold tracking-widest text-sm uppercase shadow-xl hover:bg-[#128C7E] transition-all"
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                chat
              </span>
              Uçak Bileti İçin Fiyat Al
            </a>
          </div>
        </div>
      </section>

      {/* ── FİYAT NOTU ──────────────────────────────────────────────── */}
      <section className="py-16 bg-primary/5 border-y border-primary/10">
        <div className="max-w-screen-md mx-auto px-6 md:px-8 text-center">
          <span
            className="material-symbols-outlined text-primary text-5xl mb-4 block"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            info
          </span>
          <h2 className="font-headline text-2xl md:text-3xl text-primary font-bold mb-4">
            Fiyat Notu
          </h2>
          <div className="space-y-3 text-on-surface-variant text-sm leading-relaxed max-w-lg mx-auto">
            <p className="flex items-start gap-2">
              <span
                className="material-symbols-outlined text-secondary text-[18px] mt-0.5 shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              Fiyat <strong>dolar bazlıdır</strong>; ödeme günkü kura göre
              hesaplanır.
            </p>
            <p className="flex items-start gap-2">
              <span
                className="material-symbols-outlined text-secondary text-[18px] mt-0.5 shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
              Minimum <strong>2 kişi</strong> şartı vardır.
            </p>
          </div>

          <a
            href={generalWa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-bold tracking-widest text-sm uppercase shadow-xl hover:bg-[#128C7E] transition-all mt-8"
          >
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              chat
            </span>
            Fiyat Hesaplat
          </a>
        </div>
      </section>

      {/* ── SSS ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-surface-container-lowest">
        <div className="max-w-screen-md mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <span className="text-secondary font-bold tracking-widest uppercase text-[10px] block mb-3 border-l-2 border-secondary pl-3 w-fit mx-auto">
              Sıkça Sorulan Sorular
            </span>
            <h2 className="font-headline text-3xl md:text-4xl text-primary font-bold">
              Aklınızdaki Sorular
            </h2>
          </div>

          <div className="space-y-5">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-primary mb-3 flex items-start gap-2">
                  <span
                    className="material-symbols-outlined text-secondary text-[20px] mt-0.5 shrink-0"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    help
                  </span>
                  {faq.q}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed pl-7">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          {/* WhatsApp CTA */}
          <div className="mt-10 text-center">
            <a
              href={waMsg(
                "Merhaba, Ağustos 2025 umre kampanyası hakkında sorularım var."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-bold tracking-widest text-sm uppercase shadow-xl hover:bg-[#128C7E] transition-all"
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                chat
              </span>
              Sorunuzu Sorun
            </a>
          </div>
        </div>
      </section>

      {/* ── SON CTA BANNER ──────────────────────────────────────────── */}
      <section className="py-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=2600&auto=format&fit=crop"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-screen-xl mx-auto px-6 md:px-8 text-center">
          <h2 className="font-headline text-4xl md:text-5xl font-bold mb-4">
            10–19 Ağustos 2025
          </h2>
          <p className="text-white/80 text-lg mb-2 max-w-xl mx-auto">
            Kişi başı{" "}
            <span className="text-[#FFD166] font-bold text-2xl">$360</span>{" "}
            ile manevi yolculuğunuzu şimdi planlayın.
          </p>
          <p className="text-white/50 text-xs tracking-widest uppercase mb-10">
            Minimum 2 kişi · Sınırlı kontenjan
          </p>
          <a
            href={heroWa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] text-white px-12 py-5 rounded-2xl font-bold tracking-widest text-sm uppercase shadow-2xl hover:bg-[#128C7E] active:scale-95 transition-all"
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              chat
            </span>
            WhatsApp&apos;a Yaz
          </a>
        </div>
      </section>
    </main>
  );
}
