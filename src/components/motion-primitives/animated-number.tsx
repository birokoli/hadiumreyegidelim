'use client';
// motion-primitives (ibelick, MIT) animated-number bileşeninden uyarlandı:
// cn bağımlılığı kaldırıldı, reduced-motion'da doğrudan değer gösterilir.
import { motion, type SpringOptions, useReducedMotion, useSpring, useTransform } from 'motion/react';
import { useEffect } from 'react';

export type AnimatedNumberProps = {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
};

export function AnimatedNumber({ value, className, springOptions }: AnimatedNumberProps) {
  const reduce = useReducedMotion();
  const spring = useSpring(reduce ? value : 0, springOptions);
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString('tr-TR'));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  if (reduce) return <span className={`tabular-nums ${className ?? ''}`}>{value.toLocaleString('tr-TR')}</span>;
  return <motion.span className={`tabular-nums ${className ?? ''}`}>{display}</motion.span>;
}
