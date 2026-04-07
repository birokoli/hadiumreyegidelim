"use client";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";

export default function Navbar({ links, logoUrl, ctaText }: { links?: {label: string, url: string}[], logoUrl?: string, ctaText?: string }) {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = path === "/" ? pathname === "/" : pathname?.startsWith(path);
    return isActive 
      ? "text-primary border-b-2 border-tertiary-fixed-dim pb-1 hover:text-tertiary transition-colors duration-300"
      : "text-slate-600 hover:text-tertiary transition-colors duration-300";
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0px_0px_32px_0px_rgba(0,0,0,0.04)]">
      <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
        <Link href="/" className="hover:opacity-80 transition-opacity flex items-center">
          <Image src={logoUrl || "/logo.png"} alt="Hadi Umreye" width={256} height={80} className="h-16 md:h-20 w-auto object-contain" priority />
        </Link>
        <div className="hidden md:flex items-center space-x-12 font-headline font-medium text-sm tracking-wide">
          {(links || [
            {label: "Paketler", url: "/paketler"},
            {label: "Bireysel Tasarım", url: "/bireysel-umre"},
            {label: "Rehberler & Keşifler Portalı", url: "/rehberlik"},
            {label: "Umre Vizesi", url: "/umre-vizesi"},
            {label: "Manevi Rehberlik Blogu", url: "/blog"},
            {label: "İletişim", url: "/iletisim"}
          ]).map((link, idx) => (
            <Link key={idx} className={getLinkClass(link.url)} href={link.url}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-6">
          <Link href="/profil" className="flex items-center text-primary hover:text-primary-container transition-colors">
            <span className="material-symbols-outlined text-[28px]" data-icon="account_circle" title="Kullanıcı Profili">
              account_circle
            </span>
          </Link>
          <Link href="/bireysel-umre" className="bg-primary text-on-primary px-8 py-2.5 rounded-md font-medium text-sm tracking-tight hover:bg-primary-container active:scale-95 transition-all shadow-sm">
            {ctaText || "Niyet Et"}
          </Link>
        </div>
      </div>
    </nav>
  );
}
