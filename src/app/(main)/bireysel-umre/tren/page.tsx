'use client';

import React, { useEffect, useState } from "react";
import ConfiguratorSidebar from "@/components/layout/ConfiguratorSidebar";
import ConfiguratorSummary from "@/components/layout/ConfiguratorSummary";
import BrandImageFallback from "@/components/ui/BrandImageFallback";
import { useConfiguratorStore } from "@/store/useConfiguratorStore";
import Link from "next/link";

export default function TrainSelectionPage() {
  const { trains: selectedTrains, toggleTrain } = useConfiguratorStore();
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(() => {
                      const groupedTrains = trains.reduce((acc, t) => {
                        const parsedData = (() => {
                          if (!t.extraData) return {};
                          if (t.extraData.startsWith('{')) {
                            try { return JSON.parse(t.extraData); } catch { return {}; }
                          }
                          return {};
                        })();
                        
                        const departure = parsedData.departure || "Bilinmiyor";
                        const arrival = parsedData.arrival || "Bilinmiyor";
                        const stops = parsedData.stops || 0;
                        
                        const groupKey = `${departure}-${arrival}-${stops}`;
                        
                        if (!acc[groupKey]) {
                          acc[groupKey] = {
                            id: groupKey,
                            departure,
                            arrival,
                            stops,
                            economy: null,
                            business: null
                          };
                        }
                        
                        if (t.name.toLowerCase().includes('economy')) {
                          acc[groupKey].economy = t;
                        } else if (t.name.toLowerCase().includes('business')) {
                          acc[groupKey].business = t;
                        } else {
                          if (!acc[groupKey].economy) acc[groupKey].economy = t;
                        }
                        
                        return acc;
                      }, {} as Record<string, any>);

                      const routes = Object.values(groupedTrains);

                      return routes.map((route: any) => {
                        const isEconomySelected = route.economy ? selectedTrains.some((tr) => tr.id === route.economy.id) : false;
                        const isBusinessSelected = route.business ? selectedTrains.some((tr) => tr.id === route.business.id) : false;
                        const isAnySelected = isEconomySelected || isBusinessSelected;

                        const handleClassSelect = (selectedClassOption: any, otherClassOption: any) => {
                          if (selectedTrains.some(t => t.id === selectedClassOption.id)) {
                             toggleTrain(selectedClassOption);
                          } else {
                             if (otherClassOption && selectedTrains.some(t => t.id === otherClassOption.id)) {
                                toggleTrain(otherClassOption); 
                             }
                             toggleTrain({...selectedClassOption, type: 'train'});
                          }
                        };

                        return (
                          <div key={route.id} className={`bg-surface-container-lowest rounded-[2rem] p-6 border transition-all relative overflow-hidden group ${isAnySelected ? 'border-primary ring-4 ring-primary/10 shadow-xl -translate-y-1' : 'border-outline-variant/20 shadow-sm hover:shadow-2xl hover:-translate-y-1 hover:border-tertiary/50'}`}>
                            {isAnySelected ? (
                               <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-secondary"></div>
                            ) : (
                               <div className="absolute top-0 left-0 w-full h-1.5 bg-outline-variant/20 group-hover:bg-tertiary/40 transition-colors"></div>
                            )}

                            {/* Route Header */}
                            <div className="flex justify-between items-start mb-6 mt-2">
                              <div>
                                <h3 className="text-xl md:text-2xl font-headline font-bold text-primary mb-2 flex items-center flex-wrap gap-2">
                                  {route.departure} <span className="material-symbols-outlined text-tertiary text-[20px]">arrow_right_alt</span> {route.arrival}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-full">
                                    <span className="material-symbols-outlined text-[14px]">directions_railway</span>
                                    {route.stops === 0 ? 'Non-Stop (Kesintisiz)' : `${route.stops} Duraklı Sefer`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Class Selection Grid */}
                            <div className="space-y-3 mt-8">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-outline pl-1">Bilet Sınıfı Seçin</p>
                              <div className="grid grid-cols-2 gap-3">
                                {/* Economy Button */}
                                {route.economy && (
                                  <button 
                                    onClick={() => handleClassSelect(route.economy, route.business)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${isEconomySelected ? 'border-primary bg-primary text-white shadow-lg' : 'border-outline-variant/20 bg-surface text-on-surface hover:border-primary/40 hover:bg-primary/5'}`}
                                  >
                                    <span className={`material-symbols-outlined text-2xl mb-2 ${isEconomySelected ? 'text-white' : 'text-primary'}`}>airline_seat_recline_normal</span>
                                    <span className={`text-[10px] tracking-widest uppercase font-bold mb-1 ${isEconomySelected ? 'text-white/80' : 'text-outline'}`}>Economy</span>
                                    <span className="text-lg font-headline font-bold">${Math.round(route.economy.price)}</span>
                                  </button>
                                )}

                                {/* Business Button */}
                                {route.business && (
                                  <button 
                                    onClick={() => handleClassSelect(route.business, route.economy)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${isBusinessSelected ? 'border-secondary bg-secondary text-white shadow-lg' : 'border-outline-variant/20 bg-surface text-on-surface hover:border-secondary/40 hover:bg-secondary/5'}`}
                                  >
                                    <span className={`material-symbols-outlined text-2xl mb-2 ${isBusinessSelected ? 'text-white' : 'text-secondary'}`}>airline_seat_recline_extra</span>
                                    <span className={`text-[10px] tracking-widest uppercase font-bold mb-1 ${isBusinessSelected ? 'text-white/80' : 'text-outline'}`}>Business</span>
                                    <span className="text-lg font-headline font-bold">${Math.round(route.business.price)}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                            
                          </div>
                        );
                      });
                    })()}
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
