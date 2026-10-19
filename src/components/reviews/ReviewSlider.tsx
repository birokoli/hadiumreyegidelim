"use client";
// Ana sayfa yorum şeridi (19 Ekim, kullanıcı: "yorumlar dönmeli, böyle görünmemeli"). Kartlar aynı boyda yan yana kayar;
// 5 sn'de bir sonraki karta geçer, sona gelince başa döner. Üzerine gelince, dokununca ya da klavyeyle odaklanınca durur.
// "Hareketi azalt" açık ziyaretçide kendiliğinden kaymaz; ileri/geri düğmeleri ve kaydırma her zaman çalışır.
import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const ARALIK_MS = 5000;

export default function ReviewSlider({ children }: { children: ReactNode }) {
  const iz = useRef<HTMLDivElement>(null);
  const [durdu, setDurdu] = useState(false);
  const ogeler = Children.toArray(children);

  const kaydir = useCallback((yon: 1 | -1) => {
    const el = iz.current;
    if (!el) return;
    const kart = el.firstElementChild as HTMLElement | null;
    const adim = kart ? kart.getBoundingClientRect().width + 16 : el.clientWidth;
    const sonda = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
    const basta = el.scrollLeft <= 8;
    if (yon === 1 && sonda) el.scrollTo({ left: 0, behavior: "smooth" });
    else if (yon === -1 && basta) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: adim * yon, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (durdu || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => {
      if (document.visibilityState === "visible") kaydir(1);
    }, ARALIK_MS);
    return () => clearInterval(t);
  }, [durdu, kaydir]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setDurdu(true)}
      onMouseLeave={() => setDurdu(false)}
      onFocusCapture={() => setDurdu(true)}
      onBlurCapture={() => setDurdu(false)}
      onTouchStart={() => setDurdu(true)}
      aria-roledescription="carousel"
      aria-label="Misafir yorumları"
    >
      <div
        ref={iz}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {ogeler.map((oge, i) => (
          <div key={i} className="w-[85%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]" role="group" aria-roledescription="slide" aria-label={`${i + 1} / ${ogeler.length}`}>
            {oge}
          </div>
        ))}
      </div>
      {ogeler.length > 1 && (
        <div className="mt-5 flex items-center justify-end gap-2">
          <button type="button" onClick={() => kaydir(-1)} aria-label="Önceki yorum" className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/40 bg-white text-primary transition hover:border-primary">
            <span aria-hidden>←</span>
          </button>
          <button type="button" onClick={() => kaydir(1)} aria-label="Sonraki yorum" className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/40 bg-white text-primary transition hover:border-primary">
            <span aria-hidden>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
