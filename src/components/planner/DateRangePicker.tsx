"use client";

import { useMemo, useState } from "react";

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const WEEKDAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function parseYmd(s: string): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const sameDay = (a: Date | null, b: Date | null) => !!a && !!b && dayKey(a) === dayKey(b);

export function nightsBetweenYmd(startStr: string, endStr: string): number {
  const a = parseYmd(startStr);
  const b = parseYmd(endStr);
  if (!a || !b || b <= a) return 0;
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export default function DateRangePicker({
  checkIn,
  checkOut,
  onChange,
}: {
  checkIn: string;
  checkOut: string;
  onChange: (checkIn: string, checkOut: string) => void;
}) {
  const today = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);

  const startDate = useMemo(() => parseYmd(checkIn), [checkIn]);
  const endDate = useMemo(() => parseYmd(checkOut), [checkOut]);

  const [view, setView] = useState(() => {
    const base = startDate ?? today;
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const [hover, setHover] = useState<Date | null>(null);

  const cells = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // Pazartesi başlangıç
    const count = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1))] as (Date | null)[];
  }, [view]);

  const rangeEnd = endDate ?? (startDate && hover && hover > startDate ? hover : null);
  const canPrev = view > new Date(today.getFullYear(), today.getMonth(), 1);

  const handlePick = (d: Date) => {
    if (!startDate || endDate || d <= startDate) {
      // Yeni başlangıç tarihi seçildi
      const defaultCheckout = new Date(d);
      defaultCheckout.setDate(d.getDate() + 9);
      onChange(formatYmd(d), formatYmd(defaultCheckout));
    } else {
      // Bitiş tarihi seçildi
      onChange(formatYmd(startDate), formatYmd(d));
    }
  };

  return (
    <div className="rounded-xl border border-outline-variant/30 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          aria-label="Önceki ay"
          disabled={!canPrev}
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
          className="w-8 h-8 rounded-full hover:bg-surface-container-low disabled:opacity-30 text-primary font-bold"
        >
          ‹
        </button>
        <p className="text-[14px] font-bold text-primary">
          {MONTHS[view.getMonth()]} {view.getFullYear()}
        </p>
        <button
          type="button"
          aria-label="Sonraki ay"
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
          className="w-8 h-8 rounded-full hover:bg-surface-container-low text-primary font-bold"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-on-surface-variant mb-1">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1">{w}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1" onMouseLeave={() => setHover(null)}>
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const past = d < today;
          const isStart = sameDay(d, startDate);
          const isEnd = sameDay(d, rangeEnd);
          const inRange = startDate && rangeEnd && d > startDate && d < rangeEnd;

          return (
            <span
              key={dayKey(d)}
              className={`flex justify-center ${inRange ? "bg-primary/10" : ""} ${
                isStart && rangeEnd ? "bg-gradient-to-r from-transparent from-50% to-primary/10 to-50%" : ""
              } ${isEnd && startDate ? "bg-gradient-to-l from-transparent from-50% to-primary/10 to-50%" : ""}`}
            >
              <button
                type="button"
                disabled={past}
                onClick={() => handlePick(d)}
                onMouseEnter={() => setHover(d)}
                className={`w-9 h-9 rounded-full text-[13px] tabular-nums transition-colors ${
                  isStart || isEnd
                    ? "bg-primary text-white font-bold"
                    : past
                    ? "text-outline-variant cursor-not-allowed"
                    : "hover:border hover:border-primary text-on-surface"
                }`}
              >
                {d.getDate()}
              </button>
            </span>
          );
        })}
      </div>
    </div>
  );
}
