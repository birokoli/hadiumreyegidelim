import React from 'react';

interface BrandImageFallbackProps {
  icon: string;
  className?: string;
  iconSize?: number; // size in rem, default 4 (64px)
}

export default function BrandImageFallback({ icon, className = "", iconSize = 4 }: BrandImageFallbackProps) {
  return (
    <div className={`relative flex w-full h-full flex-col items-center justify-center bg-primary text-white/40 group-hover:text-white/80 transition-all duration-500 overflow-hidden ${className}`}>
      {/* Authentic Logo Watermark - Pure White, Faded, Large */}
      <div 
        className="absolute inset-0 bg-center bg-no-repeat group-hover:scale-105 transition-transform duration-700 pointer-events-none"
        style={{ 
            backgroundImage: "url('/logo.png')", 
            backgroundSize: "150%",
            filter: "brightness(0) invert(1) opacity(0.08)",
            mixBlendMode: "overlay"
        }}
        aria-hidden="true"
      />
      
      {/* Central Identity Icon */}
      <span 
        className="material-symbols-outlined relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-md" 
        style={{ fontSize: `${iconSize}rem`, fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      
      {/* Subtle Gradient Overlay to ensure icon pops over the watermark */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent pointer-events-none mix-blend-multiply" />
    </div>
  );
}
