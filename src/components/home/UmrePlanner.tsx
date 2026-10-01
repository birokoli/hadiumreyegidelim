"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import WhatsAppIcon from "@/components/home/WhatsAppIcon";

/*
 * Ana sayfa umre planlayıcısı (Airbnb/Skyscanner tarzı arama çubuğu).
 * Müşteriye WhatsApp'ta sorulan 7 soruyu tek çubukta toplar; "Teklif al" seçimlerle
 * dolu, numaralı bir WhatsApp mesajı açar.
 */

type Panel = "dates" | "program" | "people" | "hotel" | null;
type Hotel = "yakın" | "ekonomik" | "fark etmez";

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const WEEKDAYS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];
const HOTELS: { value: Hotel; label: string; hint: string }[] = [
  { value: "yakın", label: "Harem'e yürüme mesafesi", hint: "Mescide yürüyerek gidilen oteller" },
  { value: "ekonomik", label: "Ekonomik otel", hint: "Bütçe dostu, servis ya da kısa yol" },
  { value: "fark etmez", label: "Bana en uygununu önerin", hint: "Bütçeye göre seçenek sunalım" },
];

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const sameDay = (a: Date | null, b: Date | null) => !!a && !!b && dayKey(a) === dayKey(b);
const fmt = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
const nightsBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86400000);

/* ─── Küçük parçalar ───────────────────────────────────────────── */

function Stepper({ label, hint, value, min, max, onChange }: { label: string; hint?: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-[14px] font-semibold text-on-surface">{label}</p>
        {hint && <p className="text-[12px] text-on-surface-variant">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`${label} azalt`} disabled={value <= min} onClick={() => onChange(value - 1)} className="w-8 h-8 rounded-full border border-outline-variant/60 text-primary font-bold leading-none hover:border-primary disabled:opacity-30 disabled:hover:border-outline-variant/60">−</button>
        <span className="w-5 text-center font-semibold tabular-nums">{value}</span>
        <button type="button" aria-label={`${label} artır`} disabled={value >= max} onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-full border border-outline-variant/60 text-primary font-bold leading-none hover:border-primary disabled:opacity-30">+</button>
      </div>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="w-full flex items-center justify-between gap-4 py-3 text-left">
      <span>
        <span className="block text-[14px] font-semibold text-on-surface">{label}</span>
        <span className="block text-[12px] text-on-surface-variant">{hint}</span>
      </span>
      <span className={`relative w-11 h-6 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-outline-variant/60"}`}>
        <motion.span layout transition={{ type: "spring", stiffness: 600, damping: 35 }} className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow ${checked ? "right-0.5" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function RangeCalendar({ start, end, onPick }: { start: Date | null; end: Date | null; onPick: (d: Date) => void }) {
  const today = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);
  // Ayın son haftasındaysak takvim bir sonraki aydan açılır
  const [view, setView] = useState(() => {
    const base = start ?? today;
    const monthEnd = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
    const skip = !start && monthEnd - base.getDate() < 7 ? 1 : 0;
    return new Date(base.getFullYear(), base.getMonth() + skip, 1);
  });
  const [hover, setHover] = useState<Date | null>(null);

  const cells = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // pazartesi başlangıç
    const count = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: count }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1))] as (Date | null)[];
  }, [view]);

  const rangeEnd = end ?? (start && hover && hover > start ? hover : null);
  const canPrev = view > new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button type="button" aria-label="Önceki ay" disabled={!canPrev} onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))} className="w-8 h-8 rounded-full hover:bg-surface-container-low disabled:opacity-30 text-primary">‹</button>
        <p className="text-[14px] font-bold text-primary">{MONTHS[view.getMonth()]} {view.getFullYear()}</p>
        <button type="button" aria-label="Sonraki ay" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))} className="w-8 h-8 rounded-full hover:bg-surface-container-low text-primary">›</button>
      </div>
      <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-on-surface-variant mb-1">
        {WEEKDAYS.map((w) => <span key={w} className="py-1">{w}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1" onMouseLeave={() => setHover(null)}>
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const past = d < today;
          const isStart = sameDay(d, start);
          const isEnd = sameDay(d, rangeEnd);
          const inRange = start && rangeEnd && d > start && d < rangeEnd;
          return (
            <span key={dayKey(d)} className={`flex justify-center ${inRange ? "bg-primary/10" : ""} ${isStart && rangeEnd ? "bg-gradient-to-r from-transparent from-50% to-primary/10 to-50%" : ""} ${isEnd && start ? "bg-gradient-to-l from-transparent from-50% to-primary/10 to-50%" : ""}`}>
              <button
                type="button"
                disabled={past}
                onClick={() => onPick(d)}
                onMouseEnter={() => setHover(d)}
                className={`w-9 h-9 rounded-full text-[13px] tabular-nums transition-colors ${isStart || isEnd ? "bg-primary text-white font-bold" : past ? "text-outline-variant cursor-not-allowed" : "hover:border hover:border-primary text-on-surface"}`}
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

/* ─── Planlayıcı ───────────────────────────────────────────────── */

export default function UmrePlanner({ whatsappNumber }: { whatsappNumber: string }) {
  const [open, setOpen] = useState<Panel>(null);
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [flexible, setFlexible] = useState(false);
  const [mecca, setMecca] = useState(5);
  const [medina, setMedina] = useState(4);
  const [meccaFirst, setMeccaFirst] = useState(true);
  const [adults, setAdults] = useState(2);
  const [seniors, setSeniors] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [hotel, setHotel] = useState<Hotel>("yakın");
  const [transfer, setTransfer] = useState(true);
  const [scholar, setScholar] = useState(false);
  const [visa, setVisa] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  // Dışarı tıklanınca ya da Esc ile panel kapanır
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pickDate = (d: Date) => {
    if (!start || end || d <= start) {
      setStart(d);
      setEnd(null);
    } else {
      setEnd(d);
      // Toplam gece sayısını Mekke/Medine'ye orantılı dağıt
      const n = nightsBetween(start, d);
      if (n >= 2) {
        const m = Math.max(1, Math.round((n * 5) / 9));
        setMecca(m);
        setMedina(Math.max(1, n - m));
      }
    }
  };

  const people = adults + seniors + children + infants;
  const dateText = start && end ? `${fmt(start)} – ${fmt(end)}` : start ? `${fmt(start)} – ?` : "Tarih seçin";
  const peopleParts = [
    adults && `${adults} yetişkin`,
    seniors && `${seniors} kişi 65+`,
    children && `${children} çocuk`,
    infants && `${infants} bebek`,
  ].filter(Boolean) as string[];
  const extras = [transfer && "transfer", scholar && "hoca", visa && "vize"].filter(Boolean) as string[];

  const message = (() => {
    const dates = start && end ? `${start.toLocaleDateString("tr-TR")} – ${end.toLocaleDateString("tr-TR")}` : start ? `${start.toLocaleDateString("tr-TR")} sonrası` : "Henüz belli değil";
    const ages = [seniors ? `${seniors} kişi 65 yaş üstü` : "", children ? `${children} çocuk (2–12)` : "", infants ? `${infants} bebek (0–2)` : ""].filter(Boolean).join(", ") || "Yaşlı ya da çocuk yok";
    const hotelText = HOTELS.find((h) => h.value === hotel)!.label;
    return [
      "Merhaba, bireysel umre için teklif almak istiyorum.",
      `1️⃣ Kişi sayısı: ${people} (${peopleParts.join(", ")})`,
      `2️⃣ Tarih: ${dates}${flexible ? " (tarihlerim esnek)" : ""}`,
      `3️⃣ Yaş durumu: ${ages}`,
      `4️⃣ Otel: ${hotelText}`,
      `5️⃣ Transfer: ${transfer ? "İstiyorum" : "İstemiyorum"}`,
      `6️⃣ Uzman hoca: ${scholar ? "İstiyorum" : "Gerek yok"}`,
      `7️⃣ Vize hizmeti: ${visa ? "İstiyorum" : "Gerek yok"}`,
      `Program: ${meccaFirst ? `Mekke ${mecca} gece, Medine ${medina} gece` : `Medine ${medina} gece, Mekke ${mecca} gece`}`,
    ].join("\n");
  })();

  const waHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  const segments: { id: Exclude<Panel, null>; label: string; value: string }[] = [
    { id: "dates", label: "Tarih", value: flexible && !start ? "Esnek" : dateText },
    { id: "program", label: "Mekke · Medine", value: `${mecca} + ${medina} gece` },
    { id: "people", label: "Kişiler", value: peopleParts.join(", ") || "Kişi ekleyin" },
    { id: "hotel", label: "Otel ve hizmetler", value: `${hotel === "yakın" ? "Yürüme mesafesi" : hotel === "ekonomik" ? "Ekonomik" : "Önerin"}${extras.length ? ` · ${extras.join(", ")}` : ""}` },
  ];

  const panelBody = (id: Exclude<Panel, null>) => {
    switch (id) {
      case "dates":
        return (
          <div className="w-full md:w-[340px]">
            <RangeCalendar start={start} end={end} onPick={pickDate} />
            <label className="mt-4 flex items-center gap-2 text-[13px] text-on-surface cursor-pointer">
              <input type="checkbox" checked={flexible} onChange={(e) => setFlexible(e.target.checked)} className="w-4 h-4 accent-[var(--color-primary)]" />
              Tarihlerim esnek (birkaç gün kayabilir)
            </label>
            {start && end && <p className="mt-2 text-[12px] text-on-surface-variant">{nightsBetween(start, end)} gece · Mekke ve Medine'ye dağıtıldı</p>}
          </div>
        );
      case "program":
        return (
          <div className="w-full md:w-[320px] divide-y divide-outline-variant/30">
            <Stepper label="Mekke" hint="Gece sayısı" value={mecca} min={1} max={30} onChange={setMecca} />
            <Stepper label="Medine" hint="Gece sayısı" value={medina} min={0} max={30} onChange={setMedina} />
            <div className="pt-3">
              <p className="text-[12px] font-semibold text-on-surface-variant mb-2">Program sırası</p>
              <div className="grid grid-cols-2 gap-2">
                {[true, false].map((v) => (
                  <button key={String(v)} type="button" onClick={() => setMeccaFirst(v)} className={`py-2 rounded-lg text-[13px] font-semibold border transition-colors ${meccaFirst === v ? "border-primary bg-primary/5 text-primary" : "border-outline-variant/50 text-on-surface-variant hover:border-primary/50"}`}>
                    {v ? "Önce Mekke" : "Önce Medine"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case "people":
        return (
          <div className="w-full md:w-[320px] divide-y divide-outline-variant/30">
            <Stepper label="Yetişkin" hint="13–64 yaş" value={adults} min={0} max={20} onChange={setAdults} />
            <Stepper label="65 yaş üstü" hint="Yürüme ve tekerlekli sandalye planlanır" value={seniors} min={0} max={20} onChange={setSeniors} />
            <Stepper label="Çocuk" hint="2–12 yaş" value={children} min={0} max={10} onChange={setChildren} />
            <Stepper label="Bebek" hint="0–2 yaş" value={infants} min={0} max={5} onChange={setInfants} />
          </div>
        );
      case "hotel":
        return (
          <div className="w-full md:w-[360px]">
            <p className="text-[12px] font-semibold text-on-surface-variant mb-2">Otel tercihi</p>
            <div className="space-y-2">
              {HOTELS.map((h) => (
                <button key={h.value} type="button" onClick={() => setHotel(h.value)} className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${hotel === h.value ? "border-primary bg-primary/5" : "border-outline-variant/50 hover:border-primary/50"}`}>
                  <span className={`block text-[14px] font-semibold ${hotel === h.value ? "text-primary" : "text-on-surface"}`}>{h.label}</span>
                  <span className="block text-[12px] text-on-surface-variant">{h.hint}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 divide-y divide-outline-variant/30">
              <Toggle label="Transfer" hint="Havalimanı ve şehirler arası" checked={transfer} onChange={setTransfer} />
              <Toggle label="Alanında uzman hoca" hint="İbadetlerde birebir rehberlik" checked={scholar} onChange={setScholar} />
              <Toggle label="Vize hizmeti" hint="Umre vizesi işlemleri" checked={visa} onChange={setVisa} />
            </div>
          </div>
        );
    }
  };

  return (
    <div ref={ref} className="relative w-full">
      {/* Masaüstü: tek satır çubuk; mobil: alt alta satırlar */}
      <div className="bg-white rounded-2xl md:rounded-[999px] shadow-[0_16px_40px_-18px_rgba(0,25,68,0.45)] border border-outline-variant/20 flex flex-col md:flex-row md:items-center p-2 md:p-1.5 md:pl-2">
        {segments.map((s, i) => (
          <div key={s.id} className="relative md:flex-1 min-w-0">
            {i > 0 && <span className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 h-8 w-px bg-outline-variant/40" aria-hidden="true" />}
            <button
              type="button"
              aria-expanded={open === s.id}
              onClick={() => setOpen(open === s.id ? null : s.id)}
              className={`w-full text-left px-4 md:px-5 py-2.5 rounded-xl md:rounded-[999px] transition-colors ${open === s.id ? "bg-surface-container-low" : "hover:bg-surface-container-low/70"}`}
            >
              <span className="block text-[11px] font-bold uppercase tracking-wider text-primary">{s.label}</span>
              <span className="block text-[14px] text-on-surface truncate">{s.value}</span>
            </button>
            {/* Mobil: panel satırın hemen altında açılır */}
            <AnimatePresence initial={false}>
              {open === s.id && (
                <motion.div key="m" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="md:hidden overflow-hidden">
                  <div className="px-4 pb-4 pt-1">{panelBody(s.id)}</div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Masaüstü: panel çubuğun altında kayan kart */}
            <AnimatePresence>
              {open === s.id && (
                <motion.div
                  key="d"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.16 }}
                  className={`hidden md:block absolute top-[calc(100%+14px)] z-30 bg-white rounded-2xl shadow-[0_24px_60px_-20px_rgba(0,25,68,0.45)] border border-outline-variant/20 p-5 ${i === segments.length - 1 ? "right-0" : "left-0"}`}
                >
                  {panelBody(s.id)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setOpen(null)}
          className="mt-2 md:mt-0 md:ml-1 shrink-0 inline-flex items-center justify-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white font-bold rounded-xl md:rounded-[999px] px-6 py-3.5 text-[15px] transition-colors active:scale-[0.98]"
        >
          <WhatsAppIcon className="w-5 h-5" />
          Teklif al
        </a>
      </div>
      <p className="mt-3 text-[13px] text-white/80 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span>Seçimleriniz WhatsApp mesajına hazır olarak eklenir.</span>
        <Link href="/bireysel-umre" className="font-semibold text-white underline underline-offset-4 decoration-white/40 hover:decoration-white">
          Otel ve uçuşu kendim seçeceğim
        </Link>
      </p>
    </div>
  );
}
