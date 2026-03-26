'use client';

import React, { useState, useEffect } from 'react';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ConfiguratorSummary() {
  const store = useConfiguratorStore();
  const pathname = usePathname() || '';
  
  const [exchangeRates, setExchangeRates] = useState<{ try: number; sar: number }>({ try: 30.5, sar: 3.75 });
  const [ratesLoading, setRatesLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates && data.rates.TRY) {
          setExchangeRates(prev => ({ ...prev, try: data.rates.TRY }));
        }
        setRatesLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch exchange rates", err);
        setRatesLoading(false);
      });
  }, []);

  const totalUSD = store.getTotalUSD();
  const totalTRY = totalUSD * exchangeRates.try;
  const totalSAR = totalUSD * exchangeRates.sar;
  
  // Decide next path
  let nextPath = '/bireysel-umre';
  let buttonLabel = 'Sonraki Adım';
  if (pathname === '/bireysel-umre') {
    nextPath = '/bireysel-umre/konaklama';
    buttonLabel = 'Konaklamaya Geç';
  } else if (pathname === '/bireysel-umre/konaklama') {
    nextPath = '/bireysel-umre/transfer';
    buttonLabel = 'Transfer Seçimi';
  } else if (pathname === '/bireysel-umre/transfer') {
    nextPath = '/bireysel-umre/tren';
    buttonLabel = 'Tren Seçimi';
  } else if (pathname === '/bireysel-umre/tren') {
    nextPath = '/bireysel-umre/ekstralar';
    buttonLabel = 'Ekstralara Geç';
  } else if (pathname === '/bireysel-umre/ekstralar') {
    nextPath = '/bireysel-umre/rehber';
    buttonLabel = 'Rehber Seçimi';
  } else if (pathname === '/bireysel-umre/rehber') {
    nextPath = '/bireysel-umre/ozet'; // hypothetical checkout/summary page
    buttonLabel = 'Özete Geç';
  }
  
  if (!mounted) return <aside className="lg:col-span-3 space-y-8 mt-10 lg:mt-0 opacity-0"></aside>;

  return (
    <aside className="lg:col-span-3 space-y-8 mt-10 lg:mt-0">
      <div className="bg-[#001944] text-white p-10 rounded-3xl shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/40 rounded-full blur-2xl -translate-y-10 translate-x-10 group-hover:bg-primary/60 transition-colors"></div>
        
        <h4 className="text-xs font-bold uppercase tracking-widest text-primary-fixed-dim/70 mb-10 flex items-center border-b border-white/10 pb-4">
          <span className="material-symbols-outlined mr-3 text-lg" data-icon="receipt_long">receipt_long</span>
          Maliyet Özeti
        </h4>
        
        <div className="space-y-8 mb-12">
          <div className="flex justify-between items-end border-b border-white/10 pb-5">
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] text-secondary font-bold tracking-widest uppercase mb-1">Ortalama Toplam Tutar</span>
              <span className="text-4xl font-headline font-bold text-white drop-shadow-md">
                ${totalUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>
            <span className="text-[10px] bg-white/10 px-3 py-1.5 rounded-full text-white/90 font-bold backdrop-blur-sm tracking-widest uppercase mb-1">
              ${(totalUSD / store.pax).toLocaleString('en-US', { maximumFractionDigits: 0 })} <span className="opacity-60 font-medium normal-case">/kişi</span>
            </span>
          </div>
          
          <div className="flex justify-between items-end pb-2">
            <div className="flex flex-col">
              <span className="text-[10px] text-white/50 mb-1 uppercase tracking-wider font-bold">Türk Lirası (TRY)</span>
              <span className="text-xl font-headline font-medium text-white/90 flex items-center gap-2">
                ₺{ratesLoading ? '...' : totalTRY.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                {ratesLoading && <span className="material-symbols-outlined text-[12px] animate-spin text-white/50" style={{ fontVariationSettings: "'FILL' 0" }}>sync</span>}
              </span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-white/50 mb-1 uppercase tracking-wider font-bold">Riyal (SAR)</span>
              <span className="text-xl font-headline font-medium text-white/90">
                ﷼{totalSAR.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 relative z-10">
          <Link href={nextPath} className="flex justify-center items-center gap-2 w-full bg-tertiary-fixed text-on-tertiary-fixed py-4 px-2 rounded-xl font-bold text-xs sm:text-sm tracking-widest sm:tracking-widest transition-colors shadow-lg active:scale-95 uppercase break-keep">
            <span className="truncate">{buttonLabel}</span>
            <span className="material-symbols-outlined text-lg shrink-0">arrow_forward</span>
          </Link>
          <div className="text-center text-[10px] text-white/70 mt-4 font-body leading-relaxed border-t border-white/10 pt-4 bg-white/5 p-3 rounded-xl backdrop-blur-sm">
            <p className="mb-1">Bu fiyatlar anlık kurlarla hesaplanan <strong>ortalama</strong> tutarlardır ve değişebilir.</p>
            <p>Seçimleriniz sonucunda <strong>nihai ücret</strong> müşteri temsilcimiz tarafından belirlenip tarafınıza iletilecektir.</p>
          </div>
        </div>
      </div>
      
      <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/15 shadow-sm space-y-4">
        <h5 className="font-headline text-lg font-bold text-primary mb-6 flex items-center border-b border-outline-variant/20 pb-4">
          <span className="material-symbols-outlined mr-3 text-secondary" data-icon="auto_stories">auto_stories</span>
          Seçimleriniz
        </h5>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="block text-[10px] uppercase tracking-widest text-outline mb-1 font-bold">Niyet & Kişi</span>
            <p className="font-body font-bold text-on-surface text-sm">Umre, {store.pax} Yetişkin</p>
          </div>
          <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
        </div>

        {/* Flight */}
        {store.flight ? (
          <div className="bg-surface p-4 rounded-xl border border-secondary/20 relative overflow-hidden group mb-4">
            <div className="absolute top-0 right-0 w-1 bg-secondary h-full"></div>
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] uppercase tracking-widest text-secondary font-bold">01 Uçuş</p>
              <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
            </div>
            <p className="font-headline font-bold text-sm text-on-surface mb-1">{store.flight.airline} ({store.flight.name})</p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-primary/20 bg-primary/5 p-4 rounded-xl mb-4 opacity-50">
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">01 Uçuş Seçilmedi</p>
          </div>
        )}

        {/* Mekke Hotel */}
        {store.mekkeHotel ? (
          <div className="bg-surface p-4 rounded-xl border border-secondary/20 relative overflow-hidden group mb-4">
            <div className="absolute top-0 right-0 w-1 bg-secondary h-full"></div>
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] uppercase tracking-widest text-secondary font-bold">02 Mekke Konaklama</p>
              <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
            </div>
            <p className="font-headline font-bold text-sm text-on-surface mb-1">{store.mekkeHotel.name}</p>
            <p className="text-xs text-on-surface-variant/70 font-bold tracking-wide">{store.mekkeHotel.nights} Gece, {store.mekkeHotel.description}</p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-primary/20 bg-primary/5 p-4 rounded-xl mb-4 opacity-50">
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">02 Mekke Kon. Seçilmedi</p>
          </div>
        )}

        {/* Medine Hotel */}
        {store.medineHotel ? (
          <div className="bg-surface p-4 rounded-xl border border-secondary/20 relative overflow-hidden group mb-4">
            <div className="absolute top-0 right-0 w-1 bg-secondary h-full"></div>
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] uppercase tracking-widest text-secondary font-bold">03 Medine Konaklama</p>
              <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
            </div>
            <p className="font-headline font-bold text-sm text-on-surface mb-1">{store.medineHotel.name}</p>
            <p className="text-xs text-on-surface-variant/70 font-bold tracking-wide">{store.medineHotel.nights} Gece, {store.medineHotel.description}</p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-primary/20 bg-primary/5 p-4 rounded-xl mb-4 opacity-50">
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">03 Medine Kon. Seçilmedi</p>
          </div>
        )}

        {/* Transfer */}
        {store.transfer ? (
          <div className="bg-surface p-4 rounded-xl border border-secondary/20 relative overflow-hidden group mb-4">
            <div className="absolute top-0 right-0 w-1 bg-secondary h-full"></div>
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] uppercase tracking-widest text-secondary font-bold">04 Transfer</p>
              <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
            </div>
            <p className="font-headline font-bold text-sm text-on-surface mb-1">{store.transfer.name}</p>
            <p className="text-xs text-on-surface-variant/70 font-bold tracking-wide">{store.transfer.isRoundTrip ? 'Gidiş-Dönüş' : 'Tek Yön'}</p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-primary/20 bg-primary/5 p-4 rounded-xl mb-4 opacity-50">
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">04 Transfer Seçilmedi</p>
          </div>
        )}
        
        {/* Train */}
        {store.train ? (
          <div className="bg-surface p-4 rounded-xl border border-secondary/20 relative overflow-hidden group mb-4">
            <div className="absolute top-0 right-0 w-1 bg-secondary h-full"></div>
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] uppercase tracking-widest text-secondary font-bold">05 Tren</p>
              <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
            </div>
            <p className="font-headline font-bold text-sm text-on-surface mb-1">{store.train.name}</p>
            <p className="text-xs text-on-surface-variant/70 font-bold tracking-wide">{store.train.isRoundTrip ? 'Gidiş-Dönüş' : 'Tek Yön'}</p>
          </div>
        ) : (
          <div className="border-2 border-dashed border-primary/20 bg-primary/5 p-4 rounded-xl mb-4 opacity-50">
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold">05 Tren Seçilmedi</p>
          </div>
        )}

        {/* Extras */}
        {store.extras.length > 0 && (
          <div className="bg-surface p-4 rounded-xl border border-secondary/20 relative overflow-hidden group mb-4">
            <div className="absolute top-0 right-0 w-1 bg-secondary h-full"></div>
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] uppercase tracking-widest text-secondary font-bold">06 Ekstralar</p>
              <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
            </div>
            {store.extras.map(e => (
               <p key={e.id} className="font-headline font-bold text-sm text-on-surface mb-1">
                 <span className="text-secondary mr-2">•</span>{e.name}
               </p>
            ))}
          </div>
        )}

        {/* Guide */}
        {store.guide && (
          <div className="bg-surface p-4 rounded-xl border border-secondary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1 bg-secondary h-full"></div>
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] uppercase tracking-widest text-secondary font-bold">07 Rehber</p>
              <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
            </div>
            <p className="font-headline font-bold text-sm text-on-surface mb-1">{store.guide.name}</p>
            <p className="text-xs text-on-surface-variant/70 font-bold tracking-wide">{store.guide.title}</p>
          </div>
        )}
      </div>

      <div className="bg-secondary-container/50 border border-secondary/20 p-6 rounded-2xl flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
        <div className="bg-secondary p-3 rounded-full text-white shadow-inner">
          <span className="material-symbols-outlined text-xl" data-icon="support_agent">support_agent</span>
        </div>
        <div>
          <h4 className="font-bold text-on-secondary-container text-sm">Yardıma mı ihtiyacınız var?</h4>
          <p className="text-xs text-on-secondary-container/80 mt-1">Rehberlerimiz 7/24 yanınızda.</p>
        </div>
      </div>
    </aside>
  );
}
