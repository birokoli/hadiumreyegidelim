"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import WhatsAppIcon from "@/components/home/WhatsAppIcon";

const CITIES = ["İstanbul", "Ankara", "İzmir", "Antalya", "Bursa", "Konya", "Kayseri", "Adana", "Gaziantep", "Trabzon", "Samsun", "Diyarbakır", "Diğer"];
const DURATIONS = [7, 10, 15, 21];
const MONTHS_TR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

/** Önümüzdeki 6 ay (içinde bulunulan ay dahil) */
function upcomingMonths() {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, short: MONTHS_TR[d.getMonth()].slice(0, 3), label: `${MONTHS_TR[d.getMonth()]} ${d.getFullYear()}` };
  });
}

function ChipGroup<T extends string | number>({
  id,
  options,
  value,
  onChange,
  render,
}: {
  id: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
  render: (v: T) => React.ReactNode;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none]" role="radiogroup">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={String(opt)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt)}
            className={`relative shrink-0 px-3.5 py-2 text-[13px] font-semibold rounded-lg transition-colors ${active ? "text-white" : "text-on-surface-variant hover:text-primary hover:bg-primary/5"}`}
          >
            {active && <motion.span layoutId={`${id}-pill`} className="absolute inset-0 rounded-lg bg-primary" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
            <span className="relative">{render(opt)}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function HeroPlanner({ whatsappNumber }: { whatsappNumber: string }) {
  const months = useMemo(() => upcomingMonths(), []);
  const [city, setCity] = useState("İstanbul");
  const [month, setMonth] = useState(months[1]?.key ?? months[0].key);
  const [days, setDays] = useState(10);
  const [people, setPeople] = useState(2);

  const monthLabel = months.find((m) => m.key === month)?.label ?? "";
  const summary = `${city === "Diğer" ? "Kalkış şehri sonra belirlenecek" : `${city} çıkışlı`} · ${monthLabel} · ${days} gün · ${people} kişi`;
  const message = `Merhaba, bireysel umre için teklif almak istiyorum.\nKalkış: ${city}\nTarih: ${monthLabel}\nSüre: ${days} gün\nKişi sayısı: ${people}`;
  const waHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="w-full min-w-0 max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_30px_80px_-30px_rgba(0,25,68,0.6)] border border-white/60 p-6 md:p-7">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/70">Umreni planla</p>
      <p className="mt-1 font-headline text-2xl font-bold text-primary">Birkaç seçimle teklif al</p>

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="planner-city" className="block text-xs font-semibold text-on-surface-variant mb-2">Nereden çıkış?</label>
          <div className="relative">
            <select
              id="planner-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full appearance-none bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-[15px] font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-on-surface-variant mb-2">Hangi ay?</p>
          <ChipGroup id="month" options={months.map((m) => m.key)} value={month} onChange={setMonth} render={(k) => months.find((m) => m.key === k)?.short} />
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-end">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-on-surface-variant mb-2">Kaç gün?</p>
            <ChipGroup id="days" options={DURATIONS} value={days} onChange={setDays} render={(d) => d} />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant mb-2">Kişi</p>
            <div className="flex items-center gap-1 bg-surface-container-low rounded-lg p-1">
              <button type="button" aria-label="Kişi azalt" onClick={() => setPeople((p) => Math.max(1, p - 1))} className="w-8 h-8 rounded-md text-primary font-bold hover:bg-white transition-colors disabled:opacity-30" disabled={people <= 1}>−</button>
              <span className="w-7 text-center font-bold text-primary tabular-nums" aria-live="polite">{people}</span>
              <button type="button" aria-label="Kişi artır" onClick={() => setPeople((p) => Math.min(20, p + 1))} className="w-8 h-8 rounded-md text-primary font-bold hover:bg-white transition-colors">+</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 min-h-[2.75rem] rounded-xl bg-primary/[0.04] border border-primary/10 px-4 py-3 text-[13px] text-primary font-medium overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p key={summary} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            {summary}
          </motion.p>
        </AnimatePresence>
      </div>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2.5 w-full bg-[#25D366] hover:bg-[#1fb857] text-white font-bold rounded-xl py-4 text-[15px] shadow-lg shadow-[#25D366]/25 transition-colors active:scale-[0.98]"
      >
        <WhatsAppIcon className="w-5 h-5" />
        WhatsApp&apos;tan teklif al
      </a>
      <Link href="/bireysel-umre" className="mt-3 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-primary hover:underline">
        Otel ve uçuşu kendim seçeyim
        <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="w-4 h-4"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.64l-3.22-3.22a.75.75 0 111.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.22-3.22H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
      </Link>
    </div>
  );
}
