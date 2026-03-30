'use client';

import React, { useEffect, useState } from "react";
import ConfiguratorSidebar from "@/components/layout/ConfiguratorSidebar";
import ConfiguratorSummary from "@/components/layout/ConfiguratorSummary";
import { useConfiguratorStore } from "@/store/useConfiguratorStore";
import Link from "next/link";

export default function TrainSelectionPage() {
  const { train, setTrain } = useConfiguratorStore();
  const [trains, setTrains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTrains(data.filter((s: any) => s.type === 'TRAIN'));
        }
        setLoading(false);
      });
  }, []);

  const handleSelectTrain = (s: any, isRoundTrip: boolean) => {
    if (train?.id === s.id && train?.isRoundTrip === isRoundTrip) {
      setTrain(null);
      return;
    }
    setTrain({
      id: s.id,
      name: s.name + (isRoundTrip ? ' (Gidiş-Dönüş)' : ' (Tek Yön)'),
      price: isRoundTrip ? s.price * 1.8 : s.price,
      isRoundTrip,
      type: 'train'
    });
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
            <span className="font-label text-xs font-bold uppercase tracking-[0.3em] text-tertiary mb-6 block bg-tertiary-fixed-dim/20 w-fit px-4 py-1.5 rounded-full">
              Hızlı & Konforlu
            </span>
            <h1 className="font-headline text-5xl md:text-6xl text-primary leading-tight mb-6 font-bold tracking-tight">
              Haremeyn Treni
            </h1>
            <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed font-body border-l-4 border-tertiary/30 pl-6 italic opacity-90">
              Mekke ile Medine arasındaki mesafeyi modern, hızlı ve güvenli Haremeyn treni ile birkaç saate düşürün.
            </p>
          </header>

          {/* Configurator Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Left: Navigation Steps */}
            <ConfiguratorSidebar activeStep={4} />

            {/* Center: Active Selection Canvas */}
            <div className="lg:col-span-6 space-y-12">
              <section>
                <div className="flex justify-between items-end mb-8 border-b border-outline-variant/30 pb-4">
                  <div>
                    <h2 className="text-2xl font-headline font-bold text-primary">Hızlı Tren Biletleri</h2>
                    <span className="text-tertiary block text-xs font-bold font-body tracking-[0.2em] mt-2 uppercase opacity-80">Mekke - Medine Hattı</span>
                  </div>
                </div>

                {loading ? (
                  <div className="text-primary font-bold">Tren seferleri yükleniyor...</div>
                ) : trains.length === 0 ? (
                  <div className="text-outline">Tren seferi bulunmamaktadır.</div>
                ) : (
                  <div className="space-y-6">
                    {trains.map((t) => {
                      const isSelected = train?.id === t.id;
                      const parsedData = (() => {
                        if (!t.extraData) return {};
                        if (t.extraData.startsWith('{')) {
                          try { return JSON.parse(t.extraData); } catch { return {}; }
                        }
                        return { image: t.extraData };
                      })();
                      
                      const imageUrl = parsedData.image || (t.extraData && (t.extraData.startsWith('http') || t.extraData.startsWith('/')) ? t.extraData : null);
                      const departure = parsedData.departure || "Mekke";
                      const arrival = parsedData.arrival || "Medine";
                      const stops = parsedData.stops || 0;
                      
                      return (
                        <div key={t.id} className={`group rounded-2xl overflow-hidden transition-all flex flex-col ${isSelected ? 'bg-surface-container-lowest shadow-xl border-2 border-primary ring-4 ring-primary/10 -translate-y-1' : 'bg-surface-container-lowest shadow-sm hover:shadow-2xl border border-outline-variant/10 hover:border-tertiary hover:-translate-y-1'}`}>
                            <div className="h-48 overflow-hidden relative bg-primary flex flex-col items-center justify-center text-white/40 group-hover:text-white/80 transition-colors duration-500">
                              {imageUrl ? (
                                <img alt={t.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={imageUrl} />
                              ) : (
                                <span className="material-symbols-outlined text-6xl relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>train</span>
                              )}
                              {isSelected && (
                                <div className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full shadow-md z-10">
                                  <span className="material-symbols-outlined text-sm" data-icon="check" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                </div>
                              )}
                            </div>
                          <div className="p-6 flex flex-col flex-1 relative">
                            <div className="flex items-center gap-4 mb-4 mt-2">
                              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-primary/5 text-primary group-hover:bg-primary/10'}`}>
                                <span className="material-symbols-outlined text-2xl">train</span>
                              </div>
                              <div className="flex-1">
                                <h4 className={`text-xl font-headline font-bold transition-colors ${isSelected ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}>{t.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] uppercase tracking-wider font-bold bg-surface-container px-2 py-0.5 rounded text-outline">{departure}</span>
                                  <span className="material-symbols-outlined text-[10px] text-tertiary">arrow_forward</span>
                                  <span className="text-[10px] uppercase tracking-wider font-bold bg-surface-container px-2 py-0.5 rounded text-outline">{arrival}</span>
                                </div>
                              </div>
                            </div>
                            
                            {stops > 0 && (
                              <p className="text-[10px] font-bold tracking-widest uppercase text-tertiary mb-3 flex items-center">
                                <span className="material-symbols-outlined text-[13px] mr-1">directions_railway</span>
                                {stops} Duraklı Sefer
                              </p>
                            )}
                            
                            {t.description && (
                              <div className="text-sm text-on-surface-variant font-body leading-relaxed mb-6 flex-1 border-l-2 border-primary/20 pl-3 bg-primary/5 py-2 pr-2 rounded-r-lg">
                                {t.description}
                              </div>
                            )}

                            <div className="flex flex-col gap-2 mt-auto">
                              <div className="flex gap-2 w-full">
                                <button 
                                  onClick={() => handleSelectTrain(t, false)}
                                  className={`flex-1 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-lg transition-colors ${isSelected && !train?.isRoundTrip ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-primary/20'}`}>
                                  Tek Yön (${Math.round(t.price)})
                                </button>
                                <button 
                                  onClick={() => handleSelectTrain(t, true)}
                                  className={`flex-1 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-lg transition-colors ${isSelected && train?.isRoundTrip ? 'bg-secondary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-secondary/20'}`}>
                                  Çift Yön (${Math.round(t.price * 1.8)})
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>

            {/* Right: Summary Sidebar */}
            <ConfiguratorSummary />
            
          </div>
        </div>
      </main>
    </>
  );
}
