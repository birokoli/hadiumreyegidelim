"use client";
// Normal fiyat ve "Üyelerimize özel" fiyat yan yana (Profil 2, 14 Ekim). Üye fiyatı daha belirgin; üye olmayana bulanık
// ve rakamları gizli gösterilir (sayfa önbellekli olduğu için oturum istemcide, bir kez sorulur). Giriş yapmış üyeye net açılır.
import { useSyncExternalStore } from "react";
import { formatPrice } from "@/lib/format";

type Durum = { uye: boolean; email?: string } | null;
let durum: Durum = null;
let istek: Promise<void> | null = null;
const dinleyiciler = new Set<() => void>();

function abone(f: () => void) {
  dinleyiciler.add(f);
  istek ??= fetch("/api/profil/durum")
    .then((r) => r.json())
    .then((d: Durum) => {
      durum = d;
      dinleyiciler.forEach((x) => x());
    })
    .catch(() => {
      durum = { uye: false };
      dinleyiciler.forEach((x) => x());
    });
  return () => {
    dinleyiciler.delete(f);
  };
}

/** Sayfadaki bütün fiyat kutuları tek isteği paylaşır. null: henüz bilinmiyor. */
export function useUyeDurumu(): Durum {
  return useSyncExternalStore(abone, () => durum, () => null);
}

const KILIT = (
  <svg aria-hidden width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

/** Rakamları gizli, aynı genişlikte yer tutucu: "431 $" → "888 $" */
const gizle = (s: string) => s.replace(/\d/g, "8");

export default function UyeFiyat({ normal, uye, para = "USD", boyut = "kart", etiket = "Başlangıç" }: { normal: number; uye: number; para?: string; boyut?: "kart" | "satir" | "buyuk"; etiket?: string }) {
  const d = useUyeDurumu();
  const acik = !!d?.uye;
  const uyeMetin = formatPrice(uye, para);
  const buyuk = boyut === "buyuk";
  const satir = boyut === "satir";
  return (
    <span className={`flex items-stretch gap-2 ${satir ? "justify-end" : ""}`}>
      <span className="flex flex-col justify-center">
        <span className="whitespace-nowrap text-[11px] leading-tight text-on-surface-variant">{satir ? "Normal" : etiket}</span>
        <span className={`font-headline font-bold leading-tight text-on-surface-variant ${buyuk ? "text-lg" : "text-[15px]"}`}>{formatPrice(normal, para)}</span>
      </span>
      <span className={`flex flex-col justify-center rounded-xl bg-[#fbf4e1] ring-1 ring-[#f2dda6] ${buyuk ? "px-4 py-2" : "px-3 py-1.5"}`}>
        <span className="flex items-center gap-1 whitespace-nowrap text-[10px] font-bold uppercase leading-tight tracking-wide text-[#8a6a1c]">
          {!acik && KILIT}
          Üyelerimize özel
        </span>
        <span
          className={`font-headline font-bold leading-tight text-primary transition-[filter] duration-300 ${buyuk ? "text-2xl" : satir ? "text-lg" : "text-xl"} ${acik ? "" : "select-none blur-[5px]"}`}
          aria-label={acik ? uyeMetin : "Üye fiyatı, görmek için giriş yapın"}
        >
          {acik ? uyeMetin : gizle(uyeMetin)}
        </span>
      </span>
    </span>
  );
}

/** Tablo hücresi gibi dar yerler için yalnızca üye fiyatı metni: üyeye net, değilse bulanık ve rakamları gizli. */
export function UyeFiyatMetin({ uye, para = "USD", ek = "" }: { uye: number; para?: string; ek?: string }) {
  const d = useUyeDurumu();
  const metin = formatPrice(uye, para) + ek;
  if (d?.uye) return <>{metin}</>;
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-[#8a6a1c]">{KILIT}</span>
      <span className="select-none blur-[4px]" aria-label="Üye fiyatı, görmek için giriş yapın">{gizle(metin)}</span>
    </span>
  );
}
