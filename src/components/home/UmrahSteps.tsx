"use client";

import { useEffect, useState } from "react";
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
    <div className="grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-6 lg:gap-12 items-center">
      <div role="tablist" aria-label="Umre adımları" className="relative">
        <div className="absolute left-[19px] top-8 bottom-8 w-px bg-outline-variant/40" aria-hidden="true" />
        <motion.div
          className="absolute left-[19px] top-8 w-px bg-primary origin-top"
          animate={{ height: active * 64 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          aria-hidden="true"
        />
        <ul>
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
                  className={`relative w-full flex items-center gap-4 rounded-2xl px-0 py-3 h-16 text-left transition-colors ${on ? "" : "opacity-70 hover:opacity-100"}`}
                >
                  <span
                    className={`relative z-10 w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-[15px] transition-colors duration-300 ${on ? "bg-primary text-white shadow-lg shadow-primary/30" : done ? "bg-primary/10 text-primary" : "bg-white text-on-surface-variant border border-outline-variant/40"}`}
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className={`block font-headline text-lg font-bold ${on ? "text-primary" : "text-on-surface"}`}>{s.name}</span>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">{s.place}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="relative min-h-[230px] rounded-2xl bg-primary text-white p-6 md:p-8 overflow-hidden" role="tabpanel" aria-live="polite">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full border border-white/10" aria-hidden="true" />
        <div className="absolute -right-4 -top-4 w-40 h-40 rounded-full border border-white/10" aria-hidden="true" />
        <AnimatePresence mode="wait">
          <motion.div key={step.name} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }} className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Adım {active + 1} / {STEPS.length}</p>
            <h3 className="mt-2 font-headline text-2xl md:text-3xl font-bold">{step.name}</h3>
            <p className="mt-3 text-white/85 text-[15px] leading-relaxed max-w-xl">{step.text}</p>
          </motion.div>
        </AnimatePresence>
        <div className="relative mt-6 flex items-center justify-between gap-4">
          <div className="flex gap-1.5" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span key={s.name} className={`h-1 rounded-full transition-all duration-500 ${i === active ? "w-8 bg-white" : "w-3 bg-white/30"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
