"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function AdminSidebar({ logoUrl }: { logoUrl?: string }) {
  const pathname = usePathname();

  const menuGroups: { title: string; links: { href: string; icon: string; label: string; exact?: boolean }[] }[] = [
    {
      title: "Genel Bakış",
      links: [
        { href: "/admin", icon: "dashboard", label: "Dashboard", exact: true },
      ]
    },
    {
      title: "Satış & CRM",
      links: [
        { href: "/admin/orders", icon: "receipt_long", label: "Talepler / Siparişler" },
        { href: "/admin/contact", icon: "call", label: "WhatsApp & İletişim" },
      ]
    },
    {
      title: "Operasyon Merkezi",
      links: [
        { href: "/admin/packages", icon: "inventory_2", label: "Lüks Paketler" },
        { href: "/admin/services", icon: "mosque", label: "Ek Hizmetler" },
        { href: "/admin/guides", icon: "person_pin", label: "Yerel Rehberler" },
      ]
    },
    {
      title: "İçerik Stüdyosu",
      links: [
        { href: "/admin/content", icon: "article", label: "Blog İçerikleri" },
        { href: "/admin/categories", icon: "category", label: "Kategoriler" },
        { href: "/admin/authors", icon: "badge", label: "Yazarlar" },
      ]
    },
    {
      title: "Sistem & Ayarlar",
      links: [
        { href: "/admin/media", icon: "photo_library", label: "Medya Galerisi" },
        { href: "/admin/ai-logs", icon: "memory", label: "Yapay Zeka (AI)" },
        { href: "/admin/settings", icon: "settings", label: "Sistem Ayarları" },
      ]
    }
  ];

  return (
    <aside className="h-full w-72 fixed left-0 top-0 bg-white dark:bg-slate-950 flex flex-col py-8 z-50 border-r border-outline-variant/20 shadow-xl overflow-y-auto custom-scrollbar">
      <div className="px-8 mb-10 flex flex-col gap-3 shrink-0">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image src={logoUrl || "/logo.png"} alt="Hadi Umreye" width={160} height={56} className="w-auto h-12 object-contain" priority />
        </Link>
        <p className="text-[10px] uppercase tracking-[0.25em] text-tertiary-fixed-dim font-bold border-l-2 border-tertiary-fixed-dim pl-2">Kurumsal Yönetim</p>
      </div>
      
      <nav className="flex-1 flex flex-col space-y-6 px-4">
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-4 mb-2">
              {group.title}
            </h4>
            <div className="space-y-0.5">
              {group.links.map((link) => {
                const isActive = link.exact 
                  ? pathname === link.href 
                  : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "text-[#003781] dark:text-blue-300 font-bold bg-[#003781]/5 active:scale-[0.98] shadow-sm ring-1 ring-[#003781]/10"
                        : "text-slate-500 dark:text-slate-400 hover:text-[#003781] hover:bg-slate-50 font-medium"
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-tertiary-fixed-dim drop-shadow-sm' : ''}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{link.icon}</span>
                    <span className="text-sm">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      <div className="px-6 pb-4 mt-8 shrink-0">
        <Link href="/bireysel-umre">
          <button className="w-full py-4 flex items-center justify-center gap-2 bg-primary text-white rounded-xl font-bold tracking-wide hover:bg-primary-container hover:text-primary transition-all shadow-lg active:scale-95 text-sm ring-1 ring-primary/20">
            Platforma Dön <span className="material-symbols-outlined text-[18px]">open_in_browser</span>
          </button>
        </Link>
      </div>
    </aside>
  );
}
