"use client";
// Çerez izni ve Microsoft Clarity (18 Ekim, kullanıcı): ısı haritası ve oturum kaydı. KVKK metninde analitik açık rızaya dayandığı için
// Clarity yalnızca ziyaretçi "Kabul et" dedikten sonra yüklenir; reddederse ya da seçim yapmazsa hiç yüklenmez.
// Proje kimliği Vercel'de NEXT_PUBLIC_CLARITY_ID; yoksa bant da Clarity de görünmez. Profil sayfalarında (kişisel bilgi) çalışmaz.
// Vercel Analytics çerezsizdir, bu izinden etkilenmez.
import { useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;
const ANAHTAR = "cerez-izni"; // "evet" | "hayir"
const OLAY = "cerez-izni-degisti";
export const CEREZ_TERCIH_OLAYI = "cerez-tercih-ac";

function oku(): string | null {
  try {
    return localStorage.getItem(ANAHTAR);
  } catch {
    return null;
  }
}
function yaz(deger: string | null) {
  try {
    if (deger) localStorage.setItem(ANAHTAR, deger);
    else localStorage.removeItem(ANAHTAR);
  } catch {
    /* gizli pencere */
  }
  window.dispatchEvent(new Event(OLAY));
}
function abone(f: () => void) {
  const tercih = () => yaz(null); // footer'daki "Çerez tercihleri": seçimi sıfırlar, bant yeniden çıkar
  window.addEventListener(OLAY, f);
  window.addEventListener("storage", f);
  window.addEventListener(CEREZ_TERCIH_OLAYI, tercih);
  return () => {
    window.removeEventListener(OLAY, f);
    window.removeEventListener("storage", f);
    window.removeEventListener(CEREZ_TERCIH_OLAYI, tercih);
  };
}

type ClarityFn = ((...a: unknown[]) => void) & { q?: unknown[][] };
declare global {
  interface Window {
    clarity?: ClarityFn;
  }
}

function clarityYukle(id: string) {
  if (window.clarity) return;
  const c: ClarityFn = (...a: unknown[]) => {
    (c.q = c.q || []).push(a);
  };
  window.clarity = c;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.clarity.ms/tag/${id}`;
  document.head.appendChild(s);
  // Reklam depolaması kapalı, yalnızca analitik
  window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "granted" });
}

export default function CerezIzni() {
  const izin = useSyncExternalStore(abone, oku, () => "sunucu");
  const yol = usePathname() ?? "";
  const ozel = yol.startsWith("/profil");

  useEffect(() => {
    if (CLARITY_ID && izin === "evet" && !ozel) clarityYukle(CLARITY_ID);
    // Kabul geri çekilirse Clarity'ye bildirilir; sayfa yenilenince hiç yüklenmez
    if (izin !== "evet" && window.clarity) window.clarity("consentv2", { ad_Storage: "denied", analytics_Storage: "denied" });
  }, [izin, ozel]);

  if (!CLARITY_ID || ozel || izin !== null) return null;
  return (
    <div role="dialog" aria-label="Çerez tercihi" className="fixed inset-x-3 bottom-24 z-[60] mx-auto max-w-md rounded-2xl bg-[var(--h-blue-deep,#12295a)] p-4 text-white shadow-2xl ring-1 ring-white/10 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:mx-0">
      <p className="text-sm leading-relaxed text-white/90">
        Sitemizi nasıl kullandığınızı anlamak için, izin verirseniz Microsoft Clarity ile analitik çerezler kullanıyoruz. Formlara yazdıklarınız kaydedilmez.{" "}
        <Link href="/gizlilik-politikasi" className="underline underline-offset-2">Ayrıntılar</Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => yaz("evet")} className="rounded-xl bg-[var(--h-sand,#f2dda6)] px-4 py-2 text-sm font-bold text-[#12295a]">Kabul et</button>
        <button type="button" onClick={() => yaz("hayir")} className="rounded-xl border border-white/30 px-4 py-2 text-sm font-semibold text-white">Reddet</button>
      </div>
    </div>
  );
}
