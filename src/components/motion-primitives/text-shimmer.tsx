'use client';
// motion-primitives (ibelick, MIT) text-shimmer bileşeninden uyarlandı:
// renkler CSS değişkeniyle verilir, reduced-motion'da düz metin döner.
import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export type TextShimmerProps = {
  children: string;
  className?: string;
  duration?: number;
  spread?: number;
  baseColor?: string;
  highlightColor?: string;
};

export function TextShimmer({
  children,
  className,
  duration = 2,
  spread = 2,
  baseColor = '#8a8578',
  highlightColor = '#16171a',
}: TextShimmerProps) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{children}</span>;

  const width = `${children.length * spread}px`;
  return (
    <motion.span
      className={`relative inline-block bg-clip-text text-transparent ${className ?? ''}`}
      initial={{ backgroundPosition: '100% center' }}
      animate={{ backgroundPosition: '0% center' }}
      transition={{ repeat: Infinity, duration, ease: 'linear' }}
      style={{
        backgroundSize: '250% 100%, auto',
        backgroundRepeat: 'no-repeat, padding-box',
        backgroundImage: `linear-gradient(90deg, transparent calc(50% - ${width}), ${highlightColor}, transparent calc(50% + ${width})), linear-gradient(${baseColor}, ${baseColor})`,
      }}
    >
      {children}
    </motion.span>
  );
}
