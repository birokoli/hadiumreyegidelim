'use client';

import React from 'react';
import Link from 'next/link';
import { turkeyCities } from '@/lib/turkey-cities';

export default function SeoCitiesFooter() {
  return (
    <div className="w-full bg-surface-container-lowest border-t border-outline-variant/20 py-8 px-6 mt-10">
      <div className="max-w-screen-xl mx-auto">
        <details className="group cursor-pointer">
          <summary className="flex items-center justify-between text-on-surface-variant font-bold text-sm tracking-widest uppercase hover:text-primary transition-colors outline-none select-none list-none">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>public</span>
              Türkiye'den Çıkış Noktalarımız ve Özel VIP Fırsatları
            </div>
            <span className="material-symbols-outlined text-outline-variant group-open:rotate-180 transition-transform duration-300">expand_more</span>
          </summary>
          
          <div className="pt-6 pb-2 animate-in slide-in-from-top-4 fade-in duration-300">
            <p className="text-xs text-on-surface-variant/70 mb-6 italic leading-relaxed">
              * Bulunduğunuz şehre özel hazırlanmış esnek uçuş noktalarımızı ve size en yakın VIP umre bağlantılarını aşağıdan seçerek planlamanızı yapabilirsiniz.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
              {turkeyCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/${city.slug}-cikisli-bireysel-umre`}
                  className="text-xs font-medium text-on-surface hover:text-primary hover:underline underline-offset-4 transition-colors"
                  title={`${city.name} Çıkışlı VIP Umre Fırsatları`}
                >
                  {city.name} Çıkışlı Umre
                </Link>
              ))}
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
