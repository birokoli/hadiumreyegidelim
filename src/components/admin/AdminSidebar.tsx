"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function AdminSidebar({ logoUrl }: { logoUrl?: string }) {
  const pathname = usePathname();

  const links = [
    { href: "/admin/orders", icon: "receipt_long", label: "Siparişler" },
    { href: "/admin/contact", icon: "call", label: "İletişim Talepleri" },
    { href: "/admin/packages", icon: "inventory_2", label: "Paketler" },
    { href: "/admin/services", icon: "mosque", label: "Ek Hizmetler" },
    { href: "/admin/guides", icon: "person_pin", label: "Rehberler" },
    { href: "/admin/authors", icon: "badge", label: "Yazarlar" },
    { href: "/admin/categories", icon: "category", label: "Kategoriler" },
    { href: "/admin/content", icon: "article", label: "İçerikler (Blog)" },
    { href: "/admin/ai-logs", icon: "memory", label: "Yapay Zeka İzleme" },
    { href: "/admin/media", icon: "photo_library", label: "Medya" },
    { href: "/admin/settings", icon: "settings", label: "Ayarlar" },
  ];

  return (
    <aside className="h-full w-64 fixed left-0 top-0 bg-white dark:bg-slate-950 flex flex-col py-8 z-50 border-r border-outline-variant/10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="px-8 mb-12 flex flex-col gap-2">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <Image src={logoUrl || "/logo.png"} alt="Hadi Umreye" width={140} height={50} className="w-auto h-10 object-contain" priority />
        </Link>
        <p className="text-[10px] uppercase tracking-[0.2em] text-tertiary-fixed-dim mt-2 font-bold">Yönetim Paneli</p>
      </div>
      <nav className="flex-1 flex flex-col space-y-1">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-6 py-4 transition-all duration-200 ${
                isActive
                  ? "text-[#003781] dark:text-blue-300 font-bold border-l-4 border-[#4E3700] bg-[#F9F9F9] dark:bg-slate-900 active:scale-[0.98]"
                  : "text-slate-500 dark:text-slate-400 hover:text-[#003781] hover:bg-[#F3F3F3] dark:hover:bg-slate-800 font-medium"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-6 mt-auto text-center">
        <Link href="/bireysel-umre">
          <button className="w-full py-4 bg-primary text-on-primary rounded font-bold tracking-wide hover:bg-primary-container transition-colors shadow-lg shadow-primary/20">
            Niyet Et
          </button>
        </Link>
      </div>
    </aside>
  );
}
