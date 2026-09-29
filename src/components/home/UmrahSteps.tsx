"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

const STEPS = [
  {
    name: "İhram",
    place: "Mikat sınırı",
    text: "Mikat sınırını geçmeden ihrama girilir: umreye niyet edilir ve telbiye getirilir. Erkekler dikişsiz iki parça beyaz örtü giyer, kadınlar tesettüre uygun gündelik kıyafetleriyle ihrama girer.",
  },
  {
    name: "Tavaf",
    place: "Mescid-i Haram",
    text: "Kâbe'nin etrafında, Hacerülesved hizasından başlanarak yedi şavt dönülür. Tavafın ardından Makam-ı İbrahim'in arkasında ya da uygun bir yerde iki rekât tavaf namazı kılınır.",
  },
  {
    name: "Sa'y",
    place: "Safa ile Merve arası",
    text: "Safa tepesinden başlanarak Safa ile Merve arasında yedi kez yürünür; dördü gidiş, üçü dönüştür ve sa'y Merve'de tamamlanır.",
  },
  {
    name: "Tıraş",
    place: "İhramdan çıkış",
    text: "Erkekler saçlarını tıraş eder ya da kısaltır, kadınlar saç uçlarından bir miktar keser. Böylece ihramdan çıkılır ve umre tamamlanmış olur.",
  },
];

/** Umrenin dört adımı: tıklanabilir sekmeler; kullanıcı dokunana kadar kendiliğinden ilerler */
export default function UmrahSteps() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => setActive((a) => (a + 1) % STEPS.length), 6000);
    return () => clearInterval(t);
  }, [auto]);

  const choose = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  const step = STEPS[active];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-10 lg:gap-16 items-center">
      <div role="tablist" aria-label="Umre adımları" className="relative">
        <div className="absolute left-[23px] top-6 bottom-6 w-px bg-outline-variant/40" aria-hidden="true" />
        <motion.div
          className="absolute left-[23px] top-6 w-px bg-primary origin-top"
          animate={{ height: active * 80 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          aria-hidden="true"
        />
        <ul className="space-y-2">
          {STEPS.map((s, i) => {
            const on = i === active;
            const done = i < active;
            return (
              <li key={s.name}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => choose(i)}
                  className={`relative w-full flex items-center gap-5 rounded-2xl px-0 py-3 text-left transition-colors ${on ? "" : "opacity-70 hover:opacity-100"}`}
                >
                  <span
                    className={`relative z-10 w-12 h-12 shrink-0 rounded-full flex items-center justify-center font-headline text-lg font-bold transition-colors duration-300 ${on ? "bg-primary text-white shadow-lg shadow-primary/30" : done ? "bg-primary/10 text-primary" : "bg-white text-on-surface-variant border border-outline-variant/40"}`}
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className={`block font-headline text-xl md:text-2xl font-bold ${on ? "text-primary" : "text-on-surface"}`}>{s.name}</span>
                    <span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mt-0.5">{s.place}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="relative min-h-[260px] rounded-3xl bg-primary text-white p-8 md:p-12 overflow-hidden" role="tabpanel" aria-live="polite">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full border border-white/10" aria-hidden="true" />
        <div className="absolute -right-4 -top-4 w-40 h-40 rounded-full border border-white/10" aria-hidden="true" />
        <AnimatePresence mode="wait">
          <motion.div key={step.name} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Adım {active + 1} / {STEPS.length}</p>
            <h3 className="mt-3 font-headline text-3xl md:text-4xl font-bold">{step.name}</h3>
            <p className="mt-5 text-white/85 text-base md:text-lg leading-relaxed max-w-xl">{step.text}</p>
          </motion.div>
        </AnimatePresence>
        <div className="relative mt-8 flex items-center justify-between gap-4">
          <div className="flex gap-1.5" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span key={s.name} className={`h-1 rounded-full transition-all duration-500 ${i === active ? "w-8 bg-white" : "w-3 bg-white/30"}`} />
            ))}
          </div>
          <Link href="/ilk-umrem" className="text-sm font-semibold text-white/90 hover:text-white underline-offset-4 hover:underline">
            İlk umrem rehberi
          </Link>
        </div>
      </div>
    </div>
  );
}
