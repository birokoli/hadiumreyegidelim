import React from "react";
import type { EylulCampaignConfig } from "@/lib/eylul-campaign";

export default function AdsCampaignLanding({ campaign, whatsappNumber }: { campaign: EylulCampaignConfig; whatsappNumber: string }) {
  const packages = campaign.packages;
  const childPrices = [
    { icon: "child_care", label: campaign.childTwoToElevenLabel, price: campaign.childTwoToEleven },
    { icon: "baby_changing_station", label: campaign.childZeroToTwoLabel, price: campaign.childZeroToTwo },
  ];

  const waMsg = (text: string) =>
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;

  const heroWa = waMsg(campaign.whatsappMessage);

  return (
    <main className="pt-20">
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={campaign.heroImage}
            alt={`${campaign.title} ${campaign.highlightedTitle}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/92 via-primary/75 to-[#001944]/85" />
        </div>

        <div className="relative z-10 max-w-screen-xl mx-auto px-6 md:px-8 text-center py-20 md:py-28">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 mb-8 rounded-full bg-white/10 border border-white/20 text-white font-bold text-[10px] tracking-[0.3em] uppercase backdrop-blur-md shadow-xl">
            <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              campaign
            </span>
            {campaign.badgeText}
          </div>

          <h1 className="font-headline text-5xl md:text-7xl text-white font-bold leading-[1.1] mb-4 drop-shadow-xl max-w-4xl mx-auto">
            {campaign.title} <span className="text-[#c9a96e]">{campaign.highlightedTitle}</span>
          </h1>

          <div className="inline-flex items-baseline gap-3 mb-6">
            <span className="text-[#c9a96e] text-6xl md:text-7xl font-headline font-bold drop-shadow-lg">
              {campaign.startingPrice}
            </span>
            <span className="text-white/80 text-xl font-headline italic">{campaign.priceSuffix}</span>
          </div>

          <p className="text-white/90 text-lg md:text-xl font-headline mb-10 tracking-wide">
            📅 {campaign.dateSummary}
          </p>

          <a href={heroWa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-[#25D366] text-white px-10 py-5 rounded-2xl font-bold tracking-widest text-sm uppercase shadow-2xl hover:bg-[#128C7E] active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
            {campaign.heroButton}
          </a>

          <p className="text-white/50 text-xs mt-5 tracking-widest uppercase">
            {campaign.heroNote}
          </p>
        </div>
      </section>

      <section className="bg-primary py-8 border-b border-white/10">
        <div className="max-w-screen-xl mx-auto px-6 md:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 text-white text-center">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#c9a96e] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>flight_takeoff</span>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">{campaign.departureOneLabel}</p>
                <p className="font-bold text-sm">{campaign.departureOne}</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/20" />
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#c9a96e] text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>flight_takeoff</span>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest text-white/60 font-bold">{campaign.departureTwoLabel}</p>
                <p className="font-bold text-sm">{campaign.departureTwo}</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-white/20" />
            <a href={heroWa} target="_blank" rel="noopener noreferrer" className="shrink-0 bg-[#25D366] text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-[#128C7E] transition-colors shadow-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
              {campaign.reserveButton}
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface-container-lowest">
        <div className="max-w-screen-xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <span className="text-secondary font-bold tracking-widest uppercase text-[10px] block mb-3 border-l-2 border-secondary pl-3 w-fit mx-auto">{campaign.packagesKicker}</span>
            <h2 className="font-headline text-3xl md:text-4xl text-primary font-bold">{campaign.packagesTitle}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {packages.map((item) => (
              <div key={item.days} className="bg-white rounded-2xl p-6 border border-secondary/10 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all">
                <h3 className="font-headline text-xl text-primary font-bold mb-5">{item.days}</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4"><span className="text-on-surface-variant">{campaign.roomDoubleLabel}</span><strong className="text-secondary text-lg">{item.double}</strong></div>
                  <div className="flex items-center justify-between gap-4"><span className="text-on-surface-variant">{campaign.roomTripleLabel}</span><strong className="text-secondary text-lg">{item.triple}</strong></div>
                  <div className="flex items-center justify-between gap-4"><span className="text-on-surface-variant">{campaign.roomQuadLabel}</span><strong className="text-secondary text-lg">{item.quad}</strong></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a href={heroWa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-bold tracking-widest text-sm uppercase shadow-xl hover:bg-[#128C7E] transition-all">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
              {campaign.packagesButton}
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 bg-surface">
        <div className="max-w-screen-xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <span className="text-on-surface-variant font-bold tracking-widest uppercase text-[10px] block mb-3 border-l-2 border-outline-variant pl-3 w-fit mx-auto">{campaign.childKicker}</span>
            <h2 className="font-headline text-3xl md:text-4xl text-primary font-bold">{campaign.childTitle}</h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {childPrices.map((item) => (
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
            <span className="text-secondary font-bold tracking-widest uppercase text-[10px] block mb-3 border-l-2 border-secondary pl-3 w-fit mx-auto">{campaign.includedKicker}</span>
            <h2 className="font-headline text-3xl md:text-4xl text-primary font-bold">{campaign.includedTitle}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {campaign.includedItems.map((item) => (
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
          <h2 className="font-headline text-2xl md:text-3xl text-primary font-bold mb-4">{campaign.notesTitle}</h2>
          <div className="space-y-3 text-on-surface-variant text-sm leading-relaxed max-w-lg mx-auto">
            {campaign.notes.map((note) => (
              <p key={note} className="flex items-start gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {note}
              </p>
            ))}
          </div>
          <a href={heroWa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-bold tracking-widest text-sm uppercase shadow-xl hover:bg-[#128C7E] transition-all mt-8">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
            {campaign.notesButton}
          </a>
        </div>
      </section>

      <section className="py-20 bg-surface-container-lowest">
        <div className="max-w-screen-md mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <span className="text-secondary font-bold tracking-widest uppercase text-[10px] block mb-3 border-l-2 border-secondary pl-3 w-fit mx-auto">{campaign.faqKicker}</span>
            <h2 className="font-headline text-3xl md:text-4xl text-primary font-bold">{campaign.faqTitle}</h2>
          </div>
          <div className="space-y-5">
            {campaign.faqs.map((faq) => (
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
              {campaign.faqButton}
            </a>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={campaign.footerImage} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-screen-xl mx-auto px-6 md:px-8 text-center">
          <h2 className="font-headline text-4xl md:text-5xl font-bold mb-4">{campaign.footerTitle}</h2>
          <p className="text-white/80 text-lg mb-2 max-w-xl mx-auto">{campaign.footerDescription}</p>
          <p className="text-white/50 text-xs tracking-widest uppercase mb-10">{campaign.footerNote}</p>
          <a href={heroWa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-[#25D366] text-white px-12 py-5 rounded-2xl font-bold tracking-widest text-sm uppercase shadow-2xl hover:bg-[#128C7E] active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
            {campaign.footerButton}
          </a>
        </div>
      </section>
    </main>
  );
}
