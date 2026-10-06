import React from 'react';
import HugIcon, { type HugIconName } from '@/components/icons/HugIcon';

interface BrandImageFallbackProps {
  icon: string;
  className?: string;
  iconSize?: number; // size in rem, default 4 (64px)
}

const HUG_FALLBACK_MAP: Record<string, HugIconName> = {
  mosque: "medine",
  menu_book: "rehber",
  hotel: "otel",
  apartment: "otel",
  flight: "ucak",
  luggage: "paket",
  verified: "guven",
  star: "yorum",
};

export default function BrandImageFallback({ icon, className = "", iconSize = 4 }: BrandImageFallbackProps) {
  const hugName = HUG_FALLBACK_MAP[icon];
  const pixelSize = Math.round(iconSize * 16);

  return (
    <div className={`relative flex w-full h-full flex-col items-center justify-center bg-primary text-white/40 group-hover:text-white/80 transition-all duration-500 overflow-hidden ${className}`}>
      {/* Authentic Logo Watermark */}
      <div 
        className="absolute inset-0 bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-700 pointer-events-none"
        style={{ 
            backgroundImage: "url('/logo.webp')", 
            backgroundSize: "150%",
            filter: "brightness(0) invert(1) opacity(0.08)",
            mixBlendMode: "overlay"
        }}
        aria-hidden="true"
      />
      
      {/* Central Identity Icon */}
      {hugName ? (
        <HugIcon name={hugName} size={pixelSize} className="relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-md text-white/40 group-hover:text-white/80" />
      ) : (
        <span 
          className="material-symbols-outlined relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-md" 
          style={{ fontSize: `${iconSize}rem`, fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      )}
      
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent pointer-events-none mix-blend-multiply" />
    </div>
  );
}
