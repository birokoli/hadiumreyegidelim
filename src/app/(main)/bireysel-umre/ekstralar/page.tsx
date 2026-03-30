'use client';

import React, { useEffect, useState } from "react";
import ConfiguratorSidebar from "@/components/layout/ConfiguratorSidebar";
import ConfiguratorSummary from "@/components/layout/ConfiguratorSummary";
import BrandImageFallback from "@/components/ui/BrandImageFallback";
import { useConfiguratorStore } from "@/store/useConfiguratorStore";

export default function ExtrasSelectionPage() {
  const { extras, toggleExtra } = useConfiguratorStore();
  const [extraServices, setExtraServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setExtraServices(data.filter((s: any) => s.type === 'EXTRA'));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const isExtraSelected = (id: string) => {
    return extras.some(e => e.id === id);
  };

  const getImageUrl = (extraData: string | null) => {
    if (!extraData) return null;
    if (extraData.startsWith('http') || extraData.startsWith('/')) return extraData;
    if (extraData.startsWith('{')) {
      try {
        const parsed = JSON.parse(extraData);
        if (parsed.images && parsed.images.length > 0) return parsed.images[0];
        if (parsed.image) return parsed.image;
      } catch { return null; }
    }
    return null;
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
              Ekstra Turlar ve Deneyimler
            </h1>
            <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed font-body border-l-4 border-tertiary/30 pl-6 italic opacity-90">
              Vize işlemlerinizden, manevi coşkunuzu artıracak çevre ziyaretleri ve turlara kadar yolculuğunuzu zenginleştiren ekstraları seçin.
            </p>
          </header>

          {/* Configurator Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Left: Navigation Steps */}
            <ConfiguratorSidebar activeStep={5} />

            {/* Center: Active Selection Canvas */}
            <div className="lg:col-span-6 space-y-12">
              
              <section className="mb-12">
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-2xl font-headline font-bold text-primary">Vize & Ekstra Geziler</h3>
                  <div className="h-px flex-1 bg-outline-variant/30"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {loading ? (
                    <div className="md:col-span-2 py-10 text-center text-outline">Ek hizmetler yükleniyor...</div>
                  ) : extraServices.length === 0 ? (
                    <div className="md:col-span-2 py-10 text-center text-outline font-medium italic opacity-75">Sistemde henüz ekstra tur veya vize kaydı bulunmamaktadır.</div>
                  ) : (
                    extraServices.map((ext: any) => {
                      const isSelected = isExtraSelected(ext.id);
                      const imageUrl = getImageUrl(ext.extraData);
                      
                      return (
                        <div 
                          key={ext.id}
                          onClick={() => toggleExtra({ id: ext.id, name: ext.name, price: ext.price, image: imageUrl, description: ext.description })}
                          className={`group relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer ${isSelected ? 'bg-surface-container-lowest shadow-xl border-2 border-primary ring-4 ring-primary/10 -translate-y-1' : 'bg-surface-container-lowest shadow-sm border border-outline-variant/10 hover:shadow-2xl hover:-translate-y-1'}`}>
                          <div className="aspect-[4/3] w-full relative overflow-hidden">
                            {imageUrl ? (
                              <img
                                alt={ext.name}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                src={imageUrl}
                              />
                            ) : (
                              <BrandImageFallback icon="tour" />
                            )}
                          </div>
                          <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className={`text-xl font-headline font-bold mb-1 transition-colors ${isSelected ? 'text-primary' : 'text-primary group-hover:text-secondary'}`}>{ext.name}</h4>
                              </div>
                              <span className="bg-surface-container-low px-3 py-1 text-[10px] font-bold tracking-widest uppercase text-tertiary border-l-2 border-tertiary">
                                {ext.price > 0 ? `+ $${ext.price}` : 'Ücretsiz'}
                              </span>
                            </div>
                            <p className="text-on-surface-variant text-sm font-body leading-relaxed mb-6 line-clamp-3">
                              {ext.description || "Bu hizmetin açıklama bilgisi bulunmamaktadır."}
                            </p>
                            <button className={`flex items-center text-sm font-bold transition-colors ${isSelected ? 'text-primary' : 'text-primary group-hover:text-secondary'}`}>
                              {isSelected ? 'Seçildi' : 'Listeme Ekle'} 
                              <span className="material-symbols-outlined text-sm ml-1 group-hover:translate-x-1 transition-transform">{isSelected ? 'check' : 'add'}</span>
                            </button>
                          </div>
                          {/* Active State Indicator */}
                          {isSelected && (
                            <div className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full shadow-md">
                              <span className="material-symbols-outlined" data-icon="check" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
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
