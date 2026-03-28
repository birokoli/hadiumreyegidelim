'use client';

import React, { useEffect, useState } from "react";
import ConfiguratorSidebar from "@/components/layout/ConfiguratorSidebar";
import ConfiguratorSummary from "@/components/layout/ConfiguratorSummary";
import { useConfiguratorStore } from "@/store/useConfiguratorStore";

interface HotelData {
  id: string;
  name: string;
  price: number;
  stars: number;
  description: string;
  images: string[];
  distanceMeters: number;
  distanceText: string;
}

export default function AccommodationSelectionPage() {
  const { mekkeHotel, setMekkeHotel, medineHotel, setMedineHotel, departureDate, returnDate } = useConfiguratorStore();
  const [hotels, setHotels] = useState<HotelData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeCity, setActiveCity] = useState<'Mekke' | 'Medine'>('Mekke');
  const [visibleCount, setVisibleCount] = useState(6);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="pt-32 pb-24 min-h-screen flex items-center justify-center bg-surface">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 0" }}>progress_activity</span>
      </div>
    );
  }

  const handleSearchHotels = async () => {
    setLoading(true);
    setHasSearched(true);
    setVisibleCount(6); // reset pagination
    try {
      const cityQuery = activeCity === 'Mekke' ? "Mekke (Makkah)" : "Medine (Al Madinah)";
      const res = await fetch(`/api/hotels?city=${cityQuery}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setHotels(data);
      } else {
        setHotels([]);
      }
    } catch {
      setHotels([]);
    }
    setLoading(false);
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const handleSelectHotel = (id: string, name: string, price: number, desc: string, images: string[]) => {
    const msPerDay = 1000 * 60 * 60 * 24;
    // Default to 1 night if dates are undefined
    const d1 = departureDate ? new Date(departureDate) : new Date();
    const d2 = returnDate ? new Date(returnDate) : new Date(Date.now() + msPerDay);
    const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / msPerDay));

    const selectedHotelData = {
      id,
      name,
      pricePerNight: price,
      nights: nights,
      description: desc,
      extraData: JSON.stringify({ images })
    };

    if (activeCity === 'Mekke') {
      if (mekkeHotel?.id === id) {
         setMekkeHotel(null);
      } else {
         setMekkeHotel(selectedHotelData);
      }
    } else {
      if (medineHotel?.id === id) {
         setMedineHotel(null);
      } else {
         setMedineHotel(selectedHotelData);
      }
    }
  };

  const handleSkipHotel = () => {
    if (activeCity === 'Mekke') {
       setMekkeHotel(null);
       if (!medineHotel) {
         setActiveCity('Medine');
         setHasSearched(false);
         setHotels([]);
       }
    } else {
       setMedineHotel(null);
    }
  };

  const visibleHotelsData = hotels.slice(0, visibleCount);
  const currentSelectedHotel = activeCity === 'Mekke' ? mekkeHotel : medineHotel;

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
              Kişiselleştirilmiş İbadet
            </span>
            <h1 className="font-headline text-5xl md:text-6xl text-primary leading-tight mb-6 font-bold tracking-tight">
              Konaklama Seçimi
            </h1>
            <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed font-body border-l-4 border-tertiary/30 pl-6 italic opacity-90">
              Ruhunuzun dinleneceği, Kabe'nin ve Mescid-i Nebevi'nin manevi iklimine en yakın seçkin otellerimizden birini tercih edin.
            </p>
          </header>

          {/* Configurator Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Left: Navigation Steps (Unified Layout) */}
            <ConfiguratorSidebar activeStep={2} />

            {/* Center: Active Selection Canvas */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* Hotel Search Widget */}
              <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl border border-outline-variant/15 shadow-sm">
                
                {/* City Selection Tabs */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button 
                    onClick={() => { setActiveCity('Mekke'); setHotels([]); setHasSearched(false); }} 
                    className={`flex-1 py-4 px-2 rounded-xl font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${activeCity === 'Mekke' ? 'bg-primary text-white shadow-lg' : 'bg-surface-container text-on-surface-variant hover:bg-primary/20'}`}>
                    <span className="material-symbols-outlined text-lg">mosque</span> Mekke Otelleri
                  </button>
                  <button 
                    onClick={() => { setActiveCity('Medine'); setHotels([]); setHasSearched(false); }} 
                    className={`flex-1 py-4 px-2 rounded-xl font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${activeCity === 'Medine' ? 'bg-secondary text-white shadow-lg' : 'bg-surface-container text-on-surface-variant hover:bg-secondary/20'}`}>
                    <span className="material-symbols-outlined text-lg">location_city</span> Medine Otelleri
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-6 border-b border-outline-variant/20 pb-4">
                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                     <span className="material-symbols-outlined text-primary">search</span>
                   </div>
                   <h2 className="font-headline text-2xl font-bold text-primary tracking-tight">{activeCity} Otellerinde Arama Yap</h2>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4 p-4 rounded-xl bg-surface-container/30 border border-outline-variant/20">
                     <span className="material-symbols-outlined text-tertiary">calendar_month</span>
                     <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Planlanan Genel Konaklama</span>
                        <span className="text-sm font-bold text-primary">
                          {departureDate ? departureDate.split('-').reverse().join('.') : "Belirtilmedi"} - {returnDate ? returnDate.split('-').reverse().join('.') : "Belirtilmedi"}
                        </span>
                     </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mt-2">
                    <button 
                      onClick={handleSearchHotels} 
                      disabled={loading} 
                      className="flex-[2] bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-sm flex justify-center items-center gap-2 active:scale-95 disabled:opacity-70 text-sm">
                      {loading ? (
                        <span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: "'FILL' 0" }}>progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>search</span>
                      )}
                      {loading ? 'Yükleniyor...' : 'Otelleri Listele'}
                    </button>

                    <button 
                      onClick={handleSkipHotel} 
                      className="flex-1 bg-surface border border-outline-variant/40 hover:bg-error/10 hover:text-error hover:border-error text-on-surface-variant font-bold py-4 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2 active:scale-95 text-[11px] uppercase tracking-wider">
                      Otel İstemiyorum
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Hotel Group */}
              {hasSearched && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="font-label text-sm uppercase tracking-widest text-on-surface-variant mb-6 flex items-center font-bold">
                     <span className="w-10 h-px bg-outline-variant/50 mr-4"></span>
                     {activeCity} İçin Seçenekler
                  </h2>
                  
                  {loading ? (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto mb-4 animate-pulse">
                        <span className="material-symbols-outlined">hotel_class</span>
                      </div>
                      <p className="text-primary font-bold">Gerçek zamanlı otel verileri alınıyor...</p>
                    </div>
                  ) : hotels.length === 0 ? (
                    <div className="bg-error/5 border border-error/20 p-6 rounded-2xl text-center">
                      <p className="text-error font-bold mb-1">Otel Bulunamadı</p>
                      <p className="text-sm text-on-surface-variant">Bu tarihler arası {activeCity} için uygun otel verisi çekilemedi.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {visibleHotelsData.map((h) => {
                          const isSelected = currentSelectedHotel?.id === h.id;
                          const images = h.images && h.images.length > 0 ? h.images : ["https://images.unsplash.com/photo-1542314831-c6a4d40409a5?auto=format&fit=crop&q=80&w=600"];

                          return (
                            <div 
                              key={h.id}
                              onClick={() => handleSelectHotel(h.id, h.name, h.price, h.description || "", images)}
                              className={`group relative aspect-[3/4] flex flex-col rounded-3xl overflow-hidden transition-all duration-300 transform cursor-pointer ${isSelected ? 'bg-surface-container-lowest shadow-2xl border-primary ring-2 ring-primary/20 -translate-y-2' : 'bg-surface-container-lowest shadow-md hover:shadow-2xl border border-outline-variant/30 hover:border-tertiary/50 hover:-translate-y-2'}`}>
                              
                              {/* Top Half: Photo (55%) */}
                              <div className="relative h-[55%] w-full bg-surface-container overflow-hidden">
                                <img 
                                  src={images[0]} 
                                  alt={h.name} 
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                />
                                {/* Stars Widget */}
                                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white border border-white/20 text-xs font-bold px-2.5 py-1.5 rounded-md shadow-md z-10 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[12px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                  {h.stars}
                                </div>
                                {/* Location Badge Overlay */}
                                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md text-primary text-[11px] tracking-wide font-extrabold px-3 py-2 rounded-xl shadow-sm z-10 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[14px] text-tertiary">location_on</span>
                                  <span className="truncate max-w-[200px]">{h.distanceText}</span>
                                </div>
                                {/* Selected Check Overlay */}
                                {isSelected && (
                                  <div className="absolute inset-0 bg-primary/20 z-20 flex items-center justify-center backdrop-blur-[1px]">
                                    <div className="bg-primary text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center animate-in zoom-in duration-300">
                                      <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'wght' 600" }}>check</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {/* Bottom Half: Card Details (45%) */}
                              <div className="h-[45%] p-6 flex flex-col justify-between relative z-30 bg-surface-container-lowest">
                                <div>
                                  <h3 className={`font-headline text-lg font-bold truncate transition-colors ${isSelected ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`} title={h.name}>
                                    {h.name}
                                  </h3>
                                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed line-clamp-3 mt-2" title={h.description}>
                                    {h.description}
                                  </p>
                                </div>
                                
                                <div className="flex justify-between items-end pt-3 border-t border-outline-variant/15 mt-3">
                                  <div className="flex flex-col">
                                    <span className="text-[8px] uppercase tracking-widest text-on-surface-variant mb-1 font-bold">Kişi Başı / Gece</span>
                                    <div className="bg-primary/5 px-2.5 py-1 rounded-xl border border-primary/10 w-fit">
                                      <span className="text-xl font-headline font-black text-primary tracking-tight">${h.price}</span>
                                    </div>
                                  </div>
                                  <span className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${isSelected ? 'bg-primary text-white shadow-md' : 'bg-surface-container text-primary border border-primary/20 group-hover:bg-primary/10'}`}>
                                    {isSelected ? 'Seçili' : 'Seç'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Load More Button */}
                      {visibleCount < hotels.length && (
                        <div className="flex justify-center mt-4">
                          <button 
                            onClick={loadMore}
                            className="bg-surface-container-high hover:bg-surface-container-highest text-primary font-bold text-xs uppercase tracking-widest px-8 py-3 rounded-full border border-outline-variant/30 transition-all active:scale-95 shadow-sm flex items-center gap-2"
                          >
                            <span className="material-symbols-outlined text-[16px]">expand_more</span>
                            Daha Fazla Otel Yükle ({hotels.length - visibleCount} Kaldı)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Right: Premium Summary Sidebar */}
            <ConfiguratorSummary />
            
          </div>
        </div>
      </main>
    </>
  );
}
