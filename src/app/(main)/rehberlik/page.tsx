import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manevi Rehberler & Gizli Mücevherler",
  description: "Kutsal topraklardaki her adımınızı ilim ve hikmetle taçlandıran akademik rehberlerimiz ve kalabalıkların ötesindeki gizli ziyaret noktaları.",
  alternates: {
    canonical: "/rehberlik"
  }
};

export const dynamic = "force-dynamic";

export default async function RehberlikHubPage() {
  const guides = await prisma.guide.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="pt-32 pb-24 min-h-screen">
      {/* Section 1: Rehberlerimiz (Academic Guides) */}
      <section className="max-w-screen-2xl mx-auto px-8 mb-40">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="font-label text-xs uppercase tracking-[0.3em] text-tertiary font-bold mb-4 block bg-tertiary-fixed-dim/20 w-fit px-4 py-1.5 rounded-full">
              Gönül Dostları
            </span>
            <h1 className="font-headline text-5xl md:text-6xl text-primary font-bold leading-tight">Manevi Rehberlerimiz</h1>
            <p className="mt-6 text-xl text-on-surface-variant leading-relaxed font-body border-l-4 border-tertiary/30 pl-5 italic opacity-90">
              Kutsal topraklardaki her adımınızı ilim ve hikmetle taçlandıran, ruhunuza ayna tutan akademik rehberlerimizle tanışın.
            </p>
          </div>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          
          {guides.length > 0 ? (
            guides.map((guide) => (
              <div key={guide.id} className="group relative bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/15 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                <div className="aspect-[4/5] overflow-hidden rounded-2xl mb-8 relative">
                  <img
                    alt={guide.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    src={guide.image && guide.image.length > 0 ? guide.image : "https://lh3.googleusercontent.com/aida-public/AB6AXuCdrw9jPAjnvHooTHizJVVXgc_bUUyvN6__LuXiUTjfNjmNqzBwiTrPumMRtMHehPIKwlw8M7wr0ChQqPsmo_Umvyb-NoPrGZgRTi5cZVEs47gPsTk72OJdThLyqYiPAOtJfGObp_r9Al4ovuwJpo5lESFb3c3G-zsLpdDfJxe9OOMTDeJ4fZfo7uIZYdJX2oBdv4OvbjQE6IPnS8LaELCt-XWMjHm1T7hxbC1iOz4HOj8EC08Q3A-7KKcvbcmzB5Vvwk5xcpKP8fI"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-tertiary font-label text-[10px] uppercase tracking-widest bg-tertiary/10 font-bold px-3 py-1.5 rounded-full">
                      {guide.title || "Rehber"}
                    </span>
                    <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                  <h3 className="font-headline text-3xl font-bold text-primary group-hover:text-secondary transition-colors">
                    {guide.name}
                  </h3>
                  <p className="text-sm text-on-surface-variant/80 font-body leading-relaxed italic border-l-2 border-outline-variant/30 pl-3">
                    "Kutsal topraklardaki yolculuğunuzda manevi rehberiniz..."
                  </p>
                  <div className="pt-6 flex items-center justify-between border-t border-outline-variant/15">
                    <button className="flex items-center gap-2 text-primary font-bold hover:text-tertiary transition-colors group/btn bg-primary/5 px-4 py-2 rounded-lg hover:bg-primary/10">
                      <span>Profili İncele</span>
                      <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                    {guide.price > 0 && (
                      <span className="text-[10px] font-label font-bold text-outline uppercase tracking-widest bg-surface px-2 py-1 rounded-md">
                        {guide.price} $
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-on-surface-variant">
              <p>Henüz kayıtlı bir rehber bulunmamaktadır.</p>
            </div>
          )}
          
        </div>
      </section>

      {/* Section 2: Gizli Mücevherler (Hidden Gems) */}
      <section className="bg-surface-container-low py-32 rounded-3xl mx-6 md:mx-12 shadow-inner border border-outline-variant/10">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="text-center mb-20 text-primary">
            <span className="font-label text-xs uppercase tracking-[0.4em] text-secondary font-bold mb-4 block bg-secondary/10 w-fit mx-auto px-5 py-2 rounded-full">Sessiz Keşifler</span>
            <h2 className="font-headline text-5xl md:text-6xl font-bold mb-6">Gizli Mücevherler</h2>
            <div className="w-24 h-2 rounded-full bg-tertiary/50 mx-auto mb-8"></div>
            <p className="max-w-2xl mx-auto text-on-surface-variant font-body text-xl font-light italic leading-relaxed">
              Kalabalıkların ötesinde, huzurun sessizce beklediği saklı duraklar. Bir dua derinliğinde, bir rüya berraklığında.
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 md:grid-rows-2 gap-8 h-auto md:h-[800px]">
            {/* Large Feature Card: Kuba at Dawn */}
            <div className="md:col-span-7 md:row-span-2 relative group overflow-hidden rounded-3xl bg-surface shadow-md hover:shadow-2xl transition-shadow border border-outline-variant/20">
              <img
                alt="Kuba Mescidi Gün Doğumu"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj-NsKddUcMae4xCcnsB82UKJG9A1-rz0xrkp3vRvmfj03Tp3h7OBCplJODBBP57xh3dIgBJtrQWuj1LjIUCHyr7LWkqMqzFXEk4Cuviz7XGD6kvU1VnU5jqW73G6EBxDNlZ8e-11sPxR3tVmRmhPcLxhoI4xblU4IwdOxkjQ530NDSp-W0fAj1xwSMSRK2ZdgM0FlXoq12h1P78gbP4_Fw6--rKFnx1TLWBTLMLKP0eG5W7N7DzUbaoQaDWo3HBws8oaUGq5GJlA"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-12 w-full">
                <span className="font-label text-xs font-bold uppercase tracking-[0.3em] text-tertiary-fixed-dim bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-md mb-6 inline-block border border-white/10">
                  İlk Mescit
                </span>
                <h3 className="font-headline text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-md">
                  Şafak Vakti Kuba
                </h3>
                <p className="text-white/90 font-body text-lg font-medium leading-relaxed max-w-lg mb-8 drop-shadow-sm">
                  Sabahın ilk ışıkları beyaz minarelere vurduğunda, dünya susar ve sadece kalbiniz konuşur. Huzurun ilk adresi.
                </p>
                <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase hover:bg-white hover:text-primary transition-all shadow-xl active:scale-95 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">add</span> Planıma Ekle
                </button>
              </div>
            </div>

            {/* Small Card 1: Hendek Battlefield */}
            <div className="md:col-span-5 md:row-span-1 relative group overflow-hidden rounded-3xl bg-surface shadow-md hover:shadow-2xl transition-shadow border border-outline-variant/20">
              <img
                alt="Hendek Meydanı"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWt9pmOK793pTJN-HlTBtqNJ0JTxx8uJ5wcVWewdSdPeLjFlBeSqiIkxKI0iFrLRklDwLfxb2ND8mUKB5HF7y9s1_eNMHvPD6KP5DJ1amiIwjP_HnxZerDhs0qMhHLZoWWzYkGAXYvr7P3Xm9VNUrhgzx6ZvVn0v3OXu-KgOxy5Ts-qoABqIvh08HxmitX87M6nDNxeHWsizazoOJO3xjTmvOWPvAUTUoEP22u0pYjlj646ILdJNkzDxu-uKi2CyDQhszN7CQ3kX0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#001944]/90 via-[#001944]/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="font-headline text-3xl font-bold text-white mb-3 drop-shadow-md">Hendek'in Sessizliği</h3>
                <p className="text-white/80 text-sm font-body font-medium mb-6 leading-relaxed max-w-md drop-shadow-sm">
                  Stratejinin imana dönüştüğü, dağların destan anlattığı o mukaddes meydan.
                </p>
                <button className="flex items-center gap-2 text-white font-label font-bold text-xs uppercase tracking-widest border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white hover:text-[#001944] transition-colors w-fit">
                  <span className="material-symbols-outlined text-[16px]">add</span> Planıma Ekle
                </button>
              </div>
            </div>

            {/* Small Card 2: Date Farms */}
            <div className="md:col-span-5 md:row-span-1 relative group overflow-hidden rounded-3xl bg-surface shadow-md hover:shadow-2xl transition-shadow border border-outline-variant/20">
              <img
                alt="Medine Hurma Bahçeleri"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdzGynzVzPg6Ktm6_jJ-qEAhvRZ8IgAD3hNn73kyO5DclpubTs7AORLIRhGr4mEr4wOeoufWAxzQNLU2kyolZv0ykD6rUdJJ8H5Al9PFx-6w0kbf6N4S6K8ytAhqbIPIdy6-PPatV09ZWMvq5FCJqzOLZq3_27RPawDvvZ_GDK7Xr0WXUcxBwJD0JPNmVy35QN4i9YQO8Jreg6PKa6h0AAvHVgCB3NhFxwu5EWNoMyofuhy0GqI7LJH0SHR_dOZJ4SNwOTZNN7_2I"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="font-headline text-3xl font-bold text-white mb-3 drop-shadow-md">Vaha Esintisi</h3>
                <p className="text-white/80 text-sm font-body font-medium mb-6 leading-relaxed max-w-md drop-shadow-sm">
                  Medine'nin bereketli topraklarında, hurma gölgeleri altında manevi bir dinlence.
                </p>
                <button className="flex items-center gap-2 text-white font-label font-bold text-xs uppercase tracking-widest border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white hover:text-secondary transition-colors w-fit">
                  <span className="material-symbols-outlined text-[16px]">add</span> Planıma Ekle
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 max-w-6xl mx-auto px-8 text-center">
        <div className="p-16 md:p-24 rounded-[3rem] bg-primary text-white relative overflow-hidden shadow-2xl">
          {/* Abstract Design Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          
          <h2 className="font-headline font-bold text-4xl md:text-5xl lg:text-6xl mb-8 relative z-10 drop-shadow-md">
            Sizin Manevi Yolunuz <br />
            <span className="italic text-tertiary-fixed-dim font-light">Nasıl Olsun?</span>
          </h2>
          <p className="text-white/80 text-xl md:text-2xl mb-12 font-body font-light max-w-2xl mx-auto relative z-10 leading-relaxed">
            Rehberlerimizi ve rotalarımızı kişisel niyetinize göre harmanlayalım. Ekranda değil, kalbinizde iz bırakan bir umre.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
            <Link href="/bireysel-umre" className="bg-tertiary-fixed text-on-tertiary-fixed px-12 py-5 rounded-2xl font-bold text-xl tracking-wide transition-all active:scale-95 hover:bg-white hover:text-primary shadow-xl">
              Hemen Planla
            </Link>
            <button className="border-2 border-white/30 bg-white/5 backdrop-blur-md hover:bg-white/20 px-12 py-5 rounded-2xl font-bold text-xl tracking-wide transition-all shadow-xl">
              Tüm Rotalar
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
