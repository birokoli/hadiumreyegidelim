'use client';

import React, { useEffect, useState } from "react";
import ConfiguratorSidebar from "@/components/layout/ConfiguratorSidebar";
import ConfiguratorSummary from "@/components/layout/ConfiguratorSummary";
import { useConfiguratorStore } from "@/store/useConfiguratorStore";

export default function TransferSelectionPage() {
  const { transfer, setTransfer, pax } = useConfiguratorStore();
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  useEffect(() => {
    fetch(`/api/services?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTransfers(data.filter((s: any) => s.type === 'TRANSFER'));
        }
        setLoading(false);
      });
  }, []);

  const handleSelectTransfer = (s: any, tType: string, tTypeLabel: string) => {
    const isRoundTrip = tType === 'ROUNDTRIP';
    if (transfer?.id === s.id) {
      setTransfer(null);
      return;
    }
    setTransfer({
      id: s.id,
      name: s.name,
      price: s.price,
      isRoundTrip,
      type: 'vip'
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
              Kişiselleştirilmiş İbadet
            </span>
            <h1 className="font-headline text-5xl md:text-6xl text-primary leading-tight mb-6 font-bold tracking-tight">
              Menzile Vuslat
            </h1>
            <p className="text-on-surface-variant text-lg md:text-xl leading-relaxed font-body border-l-4 border-tertiary/30 pl-6 italic opacity-90">
              Mukaddes beldeler arasındaki intikallerinizde, huzurunuzu ve sükunetinizi muhafaza edecek VIP ulaşım seçeneklerini tercih edebilirsiniz.
            </p>
          </header>

          {/* Configurator Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Left: Navigation Steps */}
            <ConfiguratorSidebar activeStep={3} />

            {/* Center: Active Selection Canvas */}
            <div className="lg:col-span-6 space-y-12">
              
              {/* Transfer Options Section */}
              <section className="mb-12">
                <div className="flex justify-between items-end mb-8 border-b border-outline-variant/30 pb-4">
                  <h3 className="font-headline text-2xl font-bold text-on-surface">Ulaşım ve Transfer Seçenekleri</h3>
                </div>
                
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2 hide-scrollbar">
                  {[
                    { id: 'ALL', label: 'Tüm Araçlar' },
                    { id: 'ECO_VIP', label: 'Eco VIP' },
                    { id: 'VIP', label: 'VIP' },
                    { id: 'VIP_PLUS', label: 'VIP+' }
                  ].map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => setFilterCategory(cat.id)}
                      className={`px-5 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-colors whitespace-nowrap ${
                        filterCategory === cat.id 
                          ? "bg-primary text-white shadow-md shadow-primary/20" 
                          : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                
                {loading ? (
                  <div className="text-primary font-bold">Transfer seçenekleri yükleniyor...</div>
                ) : transfers.length === 0 ? (
                  <div className="text-outline">Şu anda uygun transfer veya ulaşım seçeneği bulunmamaktadır.</div>
                ) : (() => {
                  const filteredTransfers = transfers.filter(t => {
                    const parsed = (() => {
                      if (!t.extraData) return {};
                      if (t.extraData.startsWith('{')) {
                        try { return JSON.parse(t.extraData); } catch { return {}; }
                      }
                      return {};
                    })();
                    const tCat = parsed.transferCategory || "VIP";
                    const tCap = parsed.transferCapacity || 4;
                    
                    if (filterCategory !== 'ALL' && tCat !== filterCategory) return false;
                    if (tCap < pax) return false; // Filter out if vehicle is too small for the user's pax count
                    
                    return true;
                  });
                  
                  if (filteredTransfers.length === 0) {
                     return <div className="text-outline bg-surface-container p-6 rounded-2xl border border-outline-variant/20 italic">Seçili kategori veya kişi sayınıza ({pax} Kişi) uygun araç bulunamadı. Lütfen başka bir kategori seçiniz.</div>;
                  }
                  
                  return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredTransfers.map(t => {
                      const isSelected = transfer?.id === t.id;
                      const parsedData = (() => {
                        if (!t.extraData) return {};
                        if (t.extraData.startsWith('{')) {
                          try { return JSON.parse(t.extraData); } catch { return {}; }
                        }
                        return { image: t.extraData, transferType: "SINGLE", routes: "" }; 
                      })();

                      const imageUrl = parsedData.image || (t.extraData && (t.extraData.startsWith('http') || t.extraData.startsWith('/')) ? t.extraData : null);
                      const tType = parsedData.transferType || "SINGLE";
                      const routes = parsedData.routes || "Cidde - Mekke - Medine";

                      const TTYPE_LABELS: Record<string, string> = {
                        "SINGLE": "Tek Yön",
                        "ROUNDTRIP": "Çift Yön",
                        "MULTI": "Çoklu Rota"
                      };
                      const tTypeLabel = TTYPE_LABELS[tType] || "Transfer";

                      const transferCategory = parsedData.transferCategory || "VIP";
                      const transferCapacity = parsedData.transferCapacity || 4;
                      
                      const CAT_LABELS: Record<string, string> = { "ECO_VIP": "Eco VIP", "VIP": "VIP", "VIP_PLUS": "VIP+" };
                      const catLabel = CAT_LABELS[transferCategory] || "VIP";

                      return (
                        <div key={t.id} className={`group rounded-2xl overflow-hidden transition-all flex flex-col ${isSelected ? 'bg-surface-container-lowest shadow-xl border-2 border-primary ring-4 ring-primary/10 -translate-y-1' : 'bg-surface-container-lowest shadow-sm hover:shadow-2xl border border-outline-variant/10 hover:border-tertiary hover:-translate-y-1'}`}>
                            <div className="h-48 overflow-hidden relative bg-primary flex flex-col items-center justify-center text-white/40 group-hover:text-white/80 transition-colors duration-500">
                              {imageUrl ? (
                                <img alt={t.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={imageUrl} />
                              ) : (
                                <span className="material-symbols-outlined text-6xl relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
                              )}
                              {isSelected && (
                                <div className="absolute top-4 right-4 bg-primary text-white p-2 rounded-full shadow-md z-10">
                                  <span className="material-symbols-outlined text-sm" data-icon="check" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                                </div>
                              )}
                            </div>
                          <div className="p-6 flex flex-col flex-1 relative">
                            <div className="flex flex-col gap-2 mt-2 mb-6">
                              <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-primary/5 text-primary group-hover:bg-primary/10'}`}>
                                  <span className="material-symbols-outlined text-2xl">directions_car</span>
                                </div>
                                <div className="flex-1">
                                  <h4 className={`text-xl font-headline font-bold transition-colors ${isSelected ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}>{t.name}</h4>
                                  <div className="flex items-center flex-wrap gap-2 mt-1">
                                    <span className="text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">{tTypeLabel}</span>
                                    <span className="text-xs text-secondary font-bold tracking-widest uppercase">{catLabel} Araç</span>
                                    <span className="text-[9px] uppercase tracking-wider font-bold bg-surface-container text-outline px-2 py-0.5 rounded flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">group</span> Maks {transferCapacity} Kişi</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-[10px] font-bold tracking-widest uppercase text-tertiary mt-2 flex items-center bg-surface-container w-fit px-3 py-1 rounded-full border border-outline-variant/10">
                                <span className="material-symbols-outlined text-[12px] mr-1.5">route</span>
                                {routes}
                              </p>
                            </div>
                            <div className="text-sm text-on-surface-variant font-body leading-relaxed mb-8 flex-1 border-l-2 border-primary/20 pl-3 bg-primary/5 py-2 pr-2 rounded-r-lg">
                              {t.description || "Güvenli ve konforlu ulaşım hizmeti."}
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-surface-container gap-2">
                              <span className="text-xl font-bold text-primary">${Math.round(t.price)} <span className="text-xs font-normal text-outline">/ Araç</span></span>
                              <button 
                                onClick={() => handleSelectTransfer(t, tType, tTypeLabel)}
                                className={`px-6 py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-lg transition-colors ${isSelected ? 'bg-primary text-white shadow-lg' : 'bg-surface-container text-on-surface-variant hover:bg-primary/20'}`}>
                                {isSelected ? 'Seçildi' : 'Seç'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  );
                })()}
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
