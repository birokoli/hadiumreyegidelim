"use client";
// Mobil alt sekme çubuğu (20 Ekim, kullanıcı: "mobilde kusursuz, hızlı kullanılan arayüz"). Yalnızca telefonda (md altı).
// Aşağı kaydırırken gizlenir, yukarı kaydırınca ya da sayfanın sonunda geri gelir. Ortadaki "Planla" sitenin ana işidir.
// Kendi alt çubuğu olan sayfalarda (planlayıcı, profil okuyucu, ödeme) gösterilmez.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import HugIcon, { type HugIconName } from "@/components/icons/HugIcon";
import WhatsAppIcon from "@/components/home/WhatsAppIcon";
import { whatsappLinki } from "@/lib/whatsapp-mesaj";

const SEKMELER: { href: string; label: string; icon: HugIconName; aktif: (p: string) => boolean }[] = [
  { href: "/", label: "Ana sayfa", icon: "kabe", aktif: (p) => p === "/" },
  { href: "/paketler", label: "Paketler", icon: "paket", aktif: (p) => p.startsWith("/paketler") || p.startsWith("/oteller") },
];
const SAG_SEKME = { href: "/umre-vizesi", label: "Vize", icon: "vize" as HugIconName, aktif: (p: string) => p.startsWith("/umre-vizesi") };

export function mobilCubukGizli(pathname: string | null) {
  const p = pathname ?? "/";
  // Otel ve paket sayfalarında kendi alt çubukları var (MobileActionBar)
  if (/^\/(oteller|paketler)\/[^/]+$/.test(p)) return true;
  return p === "/bireysel-umre" || p.startsWith("/bireysel-umre/") || p.startsWith("/profil") || p.startsWith("/admin") || p.includes("/checkout") || p.startsWith("/t/");
}

export default function MobileTabBar() {
  const pathname = usePathname();
  // Gizlendiği sayfa tutulur: başka sayfaya geçince çubuk yeniden görünür
  const [gizliYol, setGizliYol] = useState<string | null>(null);
  const gorunur = gizliYol !== pathname;
  const [numara, setNumara] = useState("905404010038");
  const sonY = useRef(0);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        const wa = Array.isArray(data) ? data.find((s: { key: string; value: string }) => s.key === "whatsappNumber") : null;
        if (wa?.value) setNumara(wa.value);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    sonY.current = window.scrollY;
    const kaydir = () => {
      const y = window.scrollY;
      const sonda = window.innerHeight + y >= document.documentElement.scrollHeight - 80;
      if (y < 80 || sonda) setGizliYol(null);
      else if (Math.abs(y - sonY.current) > 8) setGizliYol(y < sonY.current ? null : pathname);
      sonY.current = y;
    };
    window.addEventListener("scroll", kaydir, { passive: true });
    return () => window.removeEventListener("scroll", kaydir);
  }, [pathname]);

  if (mobilCubukGizli(pathname)) return null;
  const p = pathname ?? "/";

  const sekme = (s: (typeof SEKMELER)[number]) => {
    const aktif = s.aktif(p);
    return (
      <Link
        key={s.href}
        href={s.href}
        aria-current={aktif ? "page" : undefined}
        className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold tracking-tight transition-colors ${aktif ? "text-primary" : "text-on-surface-variant"}`}
      >
        <HugIcon name={s.icon} size={22} />
        <span>{s.label}</span>
        <span className={`h-[3px] w-5 rounded-[2px] ${aktif ? "bg-tertiary-fixed-dim" : "bg-transparent"}`} aria-hidden />
      </Link>
    );
  };

  return (
    <>
      {/* İçerik çubuğun altında kalmasın */}
      <div aria-hidden className="h-[calc(68px+env(safe-area-inset-bottom))] md:hidden" />
      <nav
        aria-label="Hızlı erişim"
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-outline-variant/30 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(0,55,129,0.06)] backdrop-blur-xl transition-transform duration-300 md:hidden ${gorunur ? "translate-y-0" : "translate-y-[calc(100%+28px)]"}`}
      >
        <div className="mx-auto flex max-w-md items-end px-2">
          {SEKMELER.map(sekme)}
          <Link
            href="/bireysel-umre"
            className="-mt-5 flex flex-1 flex-col items-center justify-end gap-1 pb-[9px] text-[11px] font-bold tracking-tight text-primary"
          >
            <span className="flex h-[52px] w-[52px] items-center justify-center rounded-[50%] bg-primary text-on-primary shadow-[0_8px_20px_rgba(0,55,129,0.35)] ring-4 ring-white">
              <HugIcon name="bireysel" size={24} />
            </span>
            <span>Umreni planla</span>
          </Link>
          {sekme(SAG_SEKME)}
          <a
            href={whatsappLinki(numara, p)}
            target="_blank"
            rel="noopener"
            className="flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold tracking-tight text-[#1a9e4b]"
          >
            <WhatsAppIcon className="h-[22px] w-[22px]" />
            <span>WhatsApp</span>
            <span className="h-[3px] w-5" aria-hidden />
          </a>
        </div>
      </nav>
    </>
  );
}
