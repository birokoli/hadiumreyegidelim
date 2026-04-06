"use client";

import React, { useRef, useState } from "react";
import ConfiguratorSidebar from "@/components/layout/ConfiguratorSidebar";
import { useConfiguratorStore } from "@/store/useConfiguratorStore";
import { toJpeg } from "html-to-image";

export default function PlannerSummaryPage() {
  const { pax, flight, returnFlight, mekkeHotel, medineHotel, transfer, trains, guide, extras, getTotalUSD } = useConfiguratorStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("905404010038");

  React.useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => {
      if (Array.isArray(data)) {
        const wa = data.find((s: any) => s.key === 'whatsappNumber');
        if (wa && wa.value) {
          setWhatsappNumber(wa.value.replace('+', ''));
        }
      }
    }).catch(e => console.error(e));
  }, []);

  // Helper for JSON parsed data
  const parseExtra = (extraData?: string) => {
    if (!extraData) return {};
    if (extraData.startsWith('{')) {
      try { return JSON.parse(extraData); } catch { return {}; }
    }
    return {};
  };

  const formatDateTr = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString.split(' ')[0]);
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const mekkeHotelData = parseExtra((mekkeHotel as any)?.extraData);
  const medineHotelData = parseExtra((medineHotel as any)?.extraData);
  const transferData = parseExtra((transfer as any)?.extraData);
  // handle trains in UI

  const handleWhatsAppShare = async () => {
    if (!cardRef.current) return;
    try {
      setIsGenerating(true);
      
      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pax,
            totalUSD: getTotalUSD(),
            flight,
            mekkeHotel,
            medineHotel,
            transfer,
            guide,
            extras
          })
        });
      } catch (e) {
        console.error("Order save failed", e);
      }
      
      const dataUrl = await toJpeg(cardRef.current, { 
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = 'Manevi-Yolculuk-Plani.jpg';
      link.href = objectUrl;
      link.click();
      
      setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
      
      let depContext = "";
      if (flight && flight.code) {
         depContext = `(${flight.code} kalkışlı) `;
      }
      const text = encodeURIComponent(`Merhaba, sitenizden kendi ${depContext}özel umre planımı tasarladım. Toplam ${pax} kişi için hesaplanan ${getTotalUSD()} USD'lik (Proforma) detaylı JPEG özetini iletiyorum. Güncel net fiyatınızı alabilir miyim?`);
      window.location.href = `https://wa.me/${whatsappNumber}?text=${text}`;
    } catch (error) {
      console.error("Görsel oluşturulamadı:", error);
      alert("Planınız oluşturulurken bir hata oluştu.");
    } finally {
      setIsGenerating(false);
    }
  };

  const total = getTotalUSD();
  const formattedTotal = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 0 }).format(total);

  return (
    <main className="pt-32 pb-24 min-h-screen relative overflow-hidden bg-surface">
      {/* Background elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] -z-10 rounded-full mix-blend-multiply pointer-events-none"></div>
      
      <div className="max-w-screen-xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left: Navigation Steps */}
          <div className="lg:col-span-3">
             <ConfiguratorSidebar activeStep={5} />
          </div>

          {/* Center: Summary Canvas */}
          <div className="lg:col-span-9 space-y-12">
            
            <div className="text-center mb-8">
              <span className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary mb-4 inline-block bg-tertiary-fixed-dim/20 px-3 py-1 rounded-full">
                KİŞİSELLEŞTİRİLMİŞ ÖZET
              </span>
              <h1 className="font-headline text-4xl md:text-5xl text-primary leading-tight mb-4 font-bold tracking-tight">
                Sizin Tasarladığınız Manevi Yolculuk
              </h1>
              <p className="text-on-surface-variant text-base leading-relaxed font-body max-w-xl mx-auto italic opacity-90">
                Seçimlerinizle şekillenen bu özel ibadet planı, huzur ve güvenle tamamlanması için hazırlandı.
              </p>
            </div>

            {/* Main White Card (Target for Screenshot) */}
            <div ref={cardRef} className="bg-white rounded-3xl shadow-[0px_10px_60px_rgba(0,0,0,0.05)] border border-outline-variant/10 p-10 md:p-16 relative overflow-hidden">
              
              {/* Premium Header */}
              <div className="flex justify-between items-end border-b-2 border-primary/10 pb-8 mb-10">
                <div>
                  <h2 className="text-3xl font-headline font-bold text-primary mb-2">Umre Taslak Planı</h2>
                  <p className="text-sm text-on-surface-variant uppercase tracking-widest font-bold">Hadi Umreye Gidelim</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-outline font-bold uppercase tracking-widest mb-1">Tarih</div>
                  <div className="text-sm font-bold text-primary">{new Date().toLocaleDateString('tr-TR')}</div>
                </div>
              </div>

              {/* Timeline Layout */}
              <div className="relative border-l-2 border-primary/10 ml-6 pl-10 space-y-12 mb-12">
                
                {/* FLIGHT */}
                <div className="relative">
                  <div className="absolute -left-[51px] top-0 w-6 h-6 rounded-full bg-primary/10 border-4 border-white flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>flight</span>
                  </div>
                  <h3 className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary mb-2">1. GİDİŞ & DÖNÜŞ UÇUŞU</h3>
                  {flight ? (
                    <div>
                      <h4 className="font-headline font-bold text-primary text-xl">{flight.airline} <span className="text-sm font-normal text-outline ml-2">• {flight.code}</span></h4>
                      <p className="text-sm text-on-surface-variant leading-relaxed mt-1">{flight.name}</p>
                      {flight.departureTime && (
                        <div className="flex flex-col gap-3 mt-4">
                           <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                              <span className="text-[11px] text-tertiary font-bold tracking-widest uppercase mb-1">{formatDateTr(flight.departureTime)} • GİDİŞ</span>
                              <div className="flex items-center gap-3">
                                 <span className="text-xs font-bold bg-surface px-2 py-1 rounded text-primary">{flight.departureTime.substring(11)}</span>
                                 <span className="text-[10px] text-outline font-bold tracking-widest whitespace-nowrap">{flight.duration}</span>
                                 <span className="text-xs font-bold bg-surface px-2 py-1 rounded text-primary">{flight.arrivalTime ? flight.arrivalTime.substring(11) : '--'}</span>
                              </div>
                           </div>
                           {returnFlight && returnFlight.departureTime && (
                             <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                                <span className="text-[11px] text-secondary font-bold tracking-widest uppercase"><span className="text-outline mr-2">DÖNÜŞ (Farklı Havayolu: {returnFlight.airline})</span> <br className="hidden md:block"/> {formatDateTr(returnFlight.departureTime)} </span>
                                <div className="flex items-center gap-3 mt-1">
                                   <span className="text-xs font-bold bg-surface px-2 py-1 rounded text-secondary">{returnFlight.departureTime.substring(11)}</span>
                                   <span className="text-[10px] text-outline font-bold tracking-widest whitespace-nowrap">{returnFlight.duration}</span>
                                   <span className="text-xs font-bold bg-surface px-2 py-1 rounded text-secondary">{returnFlight.arrivalTime ? returnFlight.arrivalTime.substring(11) : '--'}</span>
                                </div>
                             </div>
                           )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 mt-2">
                      <p className="font-bold text-error">Uçuş Tercih Edilmedi</p>
                      <div className="flex items-start gap-2 bg-error/5 p-3 rounded-xl border border-error/20">
                        <span className="material-symbols-outlined text-error text-[16px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                        <p className="text-[10px] text-error font-medium leading-relaxed">
                          <strong>Önemli Bilgilendirme:</strong> Verilen fiyat bilgileri anlık olarak Google altyapısı üzerinden çekilmektedir ve havayolu firmalarının anlık değişikliklerine tabidir.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* MEKKE HOTEL */}
                <div className="relative">
                  <div className="absolute -left-[51px] top-0 w-6 h-6 rounded-full bg-primary/10 border-4 border-white flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>hotel</span>
                  </div>
                  <h3 className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary mb-2">2. MEKKE KONAKLAMA</h3>
                  {mekkeHotel ? (
                    <div>
                      <h4 className="font-headline font-bold text-primary text-xl">{mekkeHotel.name}</h4>
                      <p className="text-sm text-on-surface-variant leading-relaxed mt-1">{mekkeHotel.description}</p>
                      {mekkeHotelData.amenities && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {mekkeHotelData.amenities.split(',').map((am: string, i: number) => (
                            <span key={i} className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded">{am.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-outline italic">Mekke için tesis seçimi yapılmadı.</p>
                  )}
                </div>

                {/* MEDINE HOTEL */}
                <div className="relative mt-8">
                  <div className="absolute -left-[51px] top-0 w-6 h-6 rounded-full bg-primary/10 border-4 border-white flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>hotel_class</span>
                  </div>
                  <h3 className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary mb-2">3. MEDİNE KONAKLAMA</h3>
                  {medineHotel ? (
                    <div>
                      <h4 className="font-headline font-bold text-primary text-xl">{medineHotel.name}</h4>
                      <p className="text-sm text-on-surface-variant leading-relaxed mt-1">{medineHotel.description}</p>
                      {medineHotelData.amenities && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {medineHotelData.amenities.split(',').map((am: string, i: number) => (
                            <span key={i} className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded">{am.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-outline italic">Medine için tesis seçimi yapılmadı.</p>
                  )}
                </div>

                {/* TRANSFER */}
                <div className="relative">
                  <div className="absolute -left-[51px] top-0 w-6 h-6 rounded-full bg-primary/10 border-4 border-white flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>directions_car</span>
                  </div>
                  <h3 className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary mb-2">3. VIP TRANSFER REZERVASYONU</h3>
                  {transfer ? (
                    <div>
                      <h4 className="font-headline font-bold text-primary text-xl">{transfer.name}</h4>
                      {transferData.routes && (
                        <p className="text-xs font-bold text-secondary tracking-widest uppercase mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">route</span> {transferData.routes}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-outline italic">Ulaşım seçimi yapılmadı.</p>
                  )}
                </div>

                {/* TRAIN */}
                <div className="relative">
                  <div className="absolute -left-[51px] top-0 w-6 h-6 rounded-full bg-primary/10 border-4 border-white flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>train</span>
                  </div>
                  <h3 className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary mb-2">4. HIZLI TREN BİLETLERİ</h3>
                  {trains && trains.length > 0 ? (
                    <div className="space-y-4">
                      {trains.map((t, idx) => {
                        const tData = parseExtra((t as any).extraData);
                        return (
                          <div key={idx}>
                            <h4 className="font-headline font-bold text-primary text-xl">
                              <span className="text-secondary mr-2">•</span>{t.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-2">
                               <span className="text-xs font-bold bg-surface-container px-2 py-0.5 rounded text-outline">{tData.departure || 'İstasyon'}</span>
                               <span className="material-symbols-outlined text-[10px] text-tertiary">arrow_forward</span>
                               <span className="text-xs font-bold bg-surface-container px-2 py-0.5 rounded text-outline">{tData.arrival || 'İstasyon'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-outline italic">Tren bileti eklenmedi.</p>
                  )}
                </div>

                {/* EXTRAS */}
                <div className="relative">
                  <div className="absolute -left-[51px] top-0 w-6 h-6 rounded-full bg-primary/10 border-4 border-white flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>extension</span>
                  </div>
                  <h3 className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary mb-2">5. EKSTRA TURLAR VE DENEYİMLER</h3>
                  {extras && extras.length > 0 ? (
                    <div className="space-y-4">
                      {extras.map((extra, idx) => (
                        <div key={idx}>
                          <h4 className="font-headline font-bold text-primary text-xl">
                            <span className="text-secondary mr-2">•</span>{extra.name}
                          </h4>
                          {extra.description && (
                            <p className="text-sm text-on-surface-variant leading-relaxed mt-1 pl-4 border-l-2 border-primary/20">{extra.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-outline italic">Ekstra tur seçimi yapılmadı.</p>
                  )}
                </div>

                {/* GUIDE */}
                <div className="relative">
                  <div className="absolute -left-[51px] top-0 w-6 h-6 rounded-full bg-primary/10 border-4 border-white flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>self_improvement</span>
                  </div>
                  <h3 className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary mb-2">6. REHBERLİK & MANEVİ KEŞİFLER</h3>
                  {guide ? (
                    <div>
                      <h4 className="font-headline font-bold text-primary text-xl">{guide.title}</h4>
                      <p className="text-sm text-on-surface-variant leading-relaxed mt-1">{guide.name}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-outline italic">Rehberlik hizmeti seçilmedi.</p>
                  )}
                </div>

              </div>
              
              <div className="h-px w-full bg-outline-variant/20 mb-10"></div>

              {/* Footer Summary Grid */}
              <div className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex gap-12">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1">KATILIMCI</span>
                    <span className="font-headline text-2xl font-bold text-primary flex items-center gap-2"><span className="material-symbols-outlined text-secondary">group</span> {pax} Kişi</span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1">PAKET TÜRÜ</span>
                    <span className="font-headline text-2xl font-bold text-primary flex items-center gap-2"><span className="material-symbols-outlined text-tertiary">verified</span> Tümü Dahil</span>
                  </div>
                </div>
                
                <div className="text-right border-l-2 border-outline-variant/20 pl-12">
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1">TOPLAM YATIRIM (USD)</span>
                  <span className="font-headline text-4xl font-bold tracking-tight text-primary">${formattedTotal}</span>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-tertiary mt-1">*{pax} Kişi İçin Geçerli Toplam Fiyat</div>
                </div>
              </div>

            {/* Action Box */}
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-6" data-html2canvas-ignore="true">
                <div>
                  <h4 className="font-headline font-bold text-xl text-primary mb-1">Taslağınız Tamamlandı</h4>
                  <p className="text-sm text-on-surface-variant max-w-sm">Uzmanımız planı incelemek ve kesinleştirme için sizinle iletişime geçecektir.</p>
                </div>
                <button 
                  onClick={handleWhatsAppShare}
                  disabled={isGenerating}
                  className="bg-[#25D366] hover:bg-[#1DA851] text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-3 w-full md:w-auto active:scale-95 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <span className="material-symbols-outlined animate-spin" style={{ fontVariationSettings: "'FILL' 0" }}>progress_activity</span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                    </svg>
                  )}
                  Bu Bireysel Planı Uzmana Gönder
                </button>
              </div>

            </div>

            <div className="text-center mt-12 mb-8">
               <p className="font-headline italic text-primary opacity-70">
                 "Niyet en büyük ameldir; yolculuğunuzun her adımı bu niyetin gölgesinde huzur bulsun."
               </p>
            </div>
            
          </div>
        </div>
      </div>
    </main>
  );
}
