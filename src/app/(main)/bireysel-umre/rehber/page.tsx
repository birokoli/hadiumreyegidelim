'use client';

import React, { useEffect, useState } from "react";
import ConfiguratorSidebar from "@/components/layout/ConfiguratorSidebar";
import ConfiguratorSummary from "@/components/layout/ConfiguratorSummary";
import { useConfiguratorStore, ExtraOption } from "@/store/useConfiguratorStore";

export default function GuideSelectionPage() {
  const { guide, setGuide } = useConfiguratorStore();
  const [guidesList, setGuidesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/guides').then(res => res.json())
    ]).then(([guidesData]) => {
      if (Array.isArray(guidesData)) {
        setGuidesList(guidesData);
      }
      setLoading(false);
    });
  }, []);

  const handleSelectGuide = (id: string, name: string, title: string, price: number, image: string) => {
    if (guide?.id === id) {
      setGuide(null);
      return;
    }
    setGuide({ id, name, title, price, image });
  };



  return (
    <>
      <main className="pt-32 pb-24 min-h-screen relative overflow-hidden">
        {/* Visual Accents: Ethereal Gradients */}
        <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] -z-10 rounded-full mix-blend-multiply pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/10 blur-[120px] -z-10 rounded-full mix-blend-multiply pointer-events-none"></div>

        <div className="max-w-screen-xl mx-auto px-6 relative z-10">
          {/* Header Section */}
          <header className="mb-16 md:mb-20 max-w-2xl">
            <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-tertiary mb-6 block bg-tertiary-fixed-dim/20 w-fit px-4 py-1.5 rounded-full">
              Kişiselleştirilmiş İbadet
            </span>
            <h1 className="font-headline text-5xl md:text-6xl text-primary leading-tight mb-6 font-bold tracking-tight">
              Rehberini Seç
            </h1>
            <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed font-body border-l-4 border-tertiary/30 pl-6 italic opacity-90">
              Manevi yolculuğunuzun derinliğini belirleyecek, akademik birikimi ve tecrübesiyle size eşlik edecek rehberinizi belirleyin.
            </p>
          </header>

          {/* Configurator Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Left: Navigation Steps */}
            <ConfiguratorSidebar activeStep={6} />

            {/* Center: Active Selection Canvas */}
            <div className="lg:col-span-6 space-y-12">
              
              {/* Academic Guides Section */}
              <section className="mb-12">
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-2xl font-headline font-bold text-primary">Akademik Rehberler</h3>
                  <div className="h-px flex-1 bg-outline-variant/30"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {loading ? (
                    <div className="md:col-span-2 py-10 text-center text-outline">Rehberler yükleniyor...</div>
                  ) : guidesList.length === 0 ? (
                    <div className="md:col-span-2 py-10 text-center text-outline font-medium italic opacity-75">Henüz sisteme eklenmiş bir rehber bulunmamaktadır.</div>
                  ) : (
                    guidesList.map((g: any) => (
                      <div 
                        key={g.id}
                        onClick={() => handleSelectGuide(g.id, g.name, g.title, g.price, g.image || '')}
                        className={`group relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${guide?.id === g.id ? 'bg-surface-container-lowest shadow-xl border-2 border-primary ring-4 ring-primary/10 -translate-y-1' : 'bg-surface-container-lowest shadow-sm border border-outline-variant/10 hover:shadow-2xl hover:-translate-y-1'}`}>
                        <div className="aspect-[4/3] w-full bg-primary overflow-hidden relative flex flex-col items-center justify-center text-white/40 group-hover:text-white/80 transition-colors duration-500">
                          {g.image ? (
                            <img
                              alt={g.name}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              src={g.image}
                            />
                          ) : (
                            <span className="material-symbols-outlined text-6xl relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>record_voice_over</span>
                          )}
                        </div>
                        <div className="p-8">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className={`text-xl font-headline font-bold mb-1 transition-colors ${guide?.id === g.id ? 'text-primary' : 'text-primary group-hover:text-secondary'}`}>{g.title} {g.name}</h4>
                              <p className="text-sm text-secondary font-medium tracking-wide">{g.expertise || 'İslami Çalışmalar'}</p>
                            </div>
                            {g.price > 0 && (
                              <span className="bg-surface-container-low px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-tertiary border-l-2 border-tertiary">+ ${g.price}</span>
                            )}
                          </div>
                          <p className="text-on-surface-variant text-sm font-body leading-relaxed mb-6 line-clamp-3">
                            {g.biography || "İbadetlerin fıkhi derinliği ve manevi hikmetleri üzerine araştırmalar yapan, tecrübeli akademisyen ve rehberimiz."}
                          </p>
                          <button className={`flex items-center text-sm font-bold transition-colors ${guide?.id === g.id ? 'text-primary' : 'text-primary group-hover:text-secondary'}`}>
                            {guide?.id === g.id ? 'Rehberiniz' : 'Seç'} 
                            <span className="material-symbols-outlined text-sm ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                          </button>
                        </div>
                        {/* Active State Indicator */}
                        {guide?.id === g.id && (
                          <div className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full shadow-md">
                            <span className="material-symbols-outlined" data-icon="check" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>


            </div>

            {/* Right: Summary Sidebar replaced with Client Component */}
            <ConfiguratorSummary />
            
          </div>
        </div>
      </main>
    </>
  );
}
