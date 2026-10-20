"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import HugIcon, { type HugIconName } from "@/components/icons/HugIcon";
import { usePathname } from "next/navigation";

export default function Navbar({ links, logoUrl, ctaText }: { links?: {label: string, url: string}[], logoUrl?: string, ctaText?: string }) {
  const pathname = usePathname();
  // Menü açıldığı sayfaya bağlıdır: başka sayfaya geçince kendiliğinden kapanır. Açıkken arka sayfa kaymaz.
  const [menuYolu, setMenuYolu] = useState<string | null>(null);
  const menu = menuYolu !== null && menuYolu === pathname;
  const setMenu = (acik: boolean) => setMenuYolu(acik ? pathname : null);
  useEffect(() => {
    document.documentElement.style.overflow = menu ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [menu]);
  const menuLinks = links || DEFAULT_LINKS;

  const getLinkClass = (path: string) => {
    const isActive = path === "/" ? pathname === "/" : pathname?.startsWith(path);
    return isActive 
      ? "text-primary border-b-2 border-tertiary-fixed-dim pb-1 hover:text-tertiary transition-colors duration-300"
      : "text-slate-600 hover:text-tertiary transition-colors duration-300";
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0px_0px_32px_0px_rgba(0,0,0,0.04)]">
      <div className="flex justify-between items-center px-4 py-2 md:px-8 md:py-4 max-w-screen-2xl mx-auto">
        <Link href="/" className="hover:opacity-80 transition-opacity flex items-center shrink-0">
          <Image src={logoUrl || "/logo.png"} alt="Hadi Umreye" width={280} height={96} sizes="(max-width: 768px) 160px, 280px" quality={80} className="h-[72px] md:h-[96px] w-auto object-contain -my-5 md:-my-6" priority />
        </Link>
        <div className="hidden md:flex items-center space-x-12 font-headline font-medium text-sm tracking-wide">
          {menuLinks.map((link, idx) => (
            <Link key={idx} className={getLinkClass(link.url)} href={link.url}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/profil" className="flex items-center text-primary hover:text-primary-container transition-colors">
            <span className="material-symbols-outlined text-[28px]" data-icon="account_circle" title="Kullanıcı Profili">
              account_circle
            </span>
          </Link>
          <Link href="/bireysel-umre" className="hidden md:inline-block bg-primary text-on-primary px-8 py-2.5 rounded-md font-medium text-sm tracking-tight hover:bg-primary-container active:scale-95 transition-all shadow-sm">
            {ctaText || "Niyet Et"}
          </Link>
          {/* Telefonda menü (20 Ekim): masaüstü bağlantıları telefonda hiç görünmüyordu */}
          <button
            type="button"
            onClick={() => setMenu(true)}
            aria-label="Menüyü aç"
            aria-expanded={menu}
            className="md:hidden flex h-11 items-center gap-2 rounded-md border border-outline-variant/40 bg-white px-3.5 text-[13px] font-semibold text-primary active:scale-95 transition-transform"
          >
            <span aria-hidden className="flex flex-col gap-[4px]">
              <span className="block h-[2px] w-[18px] rounded-[1px] bg-current" />
              <span className="block h-[2px] w-[18px] rounded-[1px] bg-current" />
              <span className="block h-[2px] w-[12px] rounded-[1px] bg-current" />
            </span>
            Menü
          </button>
        </div>
      </div>

      {/* Menü body'ye taşınır: üst çubuktaki backdrop-blur, içindeki fixed öğeleri çubuğun içine hapsediyordu */}
      {menu && createPortal(
        <div className="md:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Menü">
          <button type="button" aria-label="Menüyü kapat" className="absolute inset-0 bg-[#001944]/40 animate-in fade-in duration-200" onClick={() => setMenu(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col overflow-y-auto bg-surface shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between border-b border-outline-variant/30 px-5 py-4">
              <span className="font-headline text-lg font-bold text-primary">Menü</span>
              <button type="button" onClick={() => setMenu(false)} aria-label="Menüyü kapat" className="flex h-11 w-11 items-center justify-center rounded-[50%] text-2xl leading-none text-primary active:bg-surface-container-low">×</button>
            </div>
            <nav className="px-3 py-3">
              {menuLinks.map((link) => {
                const aktif = link.url === "/" ? pathname === "/" : pathname?.startsWith(link.url);
                return (
                  <Link key={link.url + link.label} href={link.url} className={`flex min-h-[52px] items-center justify-between rounded-lg px-3 font-headline text-[17px] ${aktif ? "bg-white font-bold text-primary shadow-sm" : "text-on-surface"}`}>
                    {link.label}
                    <span aria-hidden className="text-outline-variant">›</span>
                  </Link>
                );
              })}
            </nav>
            <div className="px-5 pb-2 pt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-primary/70">Hizmetler</div>
            <div className="grid grid-cols-3 gap-2 px-4 pb-4">
              {MENU_HIZMETLER.map((h) => (
                <Link key={h.href + h.label} href={h.href} className="flex min-h-[84px] flex-col items-center justify-center gap-2 rounded-xl border border-outline-variant/30 bg-white px-1 text-center text-[12px] font-semibold leading-tight text-on-surface active:scale-95 transition-transform">
                  <HugIcon name={h.icon} size={26} className="text-primary" />
                  {h.label}
                </Link>
              ))}
            </div>
            <div className="mt-auto border-t border-outline-variant/30 p-4">
              <Link href="/profil" className="flex min-h-[48px] items-center justify-center rounded-lg border border-primary/30 font-semibold text-primary">Hesabım</Link>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </nav>
  );
}

const DEFAULT_LINKS = [
  {label: "Paketler", url: "/paketler"},
  {label: "Bireysel Umre", url: "/bireysel-umre"},
  {label: "Rehberler & Keşifler Portalı", url: "/rehberlik"},
  {label: "Umre Vizesi", url: "/umre-vizesi"},
  {label: "Manevi Rehberlik Blogu", url: "/blog"},
  {label: "İletişim", url: "/iletisim"}
];

const MENU_HIZMETLER: { href: string; label: string; icon: HugIconName }[] = [
  { href: "/oteller", label: "Oteller", icon: "otel" },
  { href: "/hizmetler", label: "Transfer ve tren", icon: "transfer" },
  { href: "/rehberlik", label: "Rehberlik", icon: "rehber" },
  { href: "/ilk-umrem", label: "İlk umrem", icon: "ilk" },
  { href: "/hanim-umresi", label: "Hanım umresi", icon: "hanim" },
  { href: "/dua-haritasi", label: "Dua haritası", icon: "dua" },
];
