"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAdminContext } from "./AdminContext";

const menuGroups: { title: string; links: { href: string; icon: string; label: string; exact?: boolean }[] }[] = [
  {
    title: "Genel Bakış",
    links: [
      { href: "/admin", icon: "dashboard", label: "Dashboard", exact: true },
    ],
  },
  {
    title: "Satış & CRM",
    links: [
      { href: "/admin/orders",  icon: "receipt_long", label: "Talepler / Siparişler" },
      { href: "/admin/contact", icon: "call",          label: "WhatsApp & İletişim"  },
    ],
  },
  {
    title: "Operasyon Merkezi",
    links: [
      { href: "/admin/packages", icon: "inventory_2", label: "Lüks Paketler"  },
      { href: "/admin/services", icon: "mosque",      label: "Ek Hizmetler"   },
      { href: "/admin/guides",   icon: "person_pin",  label: "Yerel Rehberler" },
    ],
  },
  {
    title: "İçerik Stüdyosu",
    links: [
      { href: "/admin/content",    icon: "article",  label: "Blog İçerikleri" },
      { href: "/admin/categories", icon: "category", label: "Kategoriler"     },
      { href: "/admin/authors",    icon: "badge",    label: "Yazarlar"        },
    ],
  },
  {
    title: "Sistem & Ayarlar",
    links: [
      { href: "/admin/analytics", icon: "analytics",     label: "Analytics"       },
      { href: "/admin/media",     icon: "photo_library", label: "Medya Galerisi"  },
      { href: "/admin/ai-logs",   icon: "memory",        label: "Yapay Zeka (AI)" },
      { href: "/admin/settings",  icon: "settings",      label: "Sistem Ayarları" },
    ],
  },
];

export default function AdminSidebar({ logoUrl }: { logoUrl?: string }) {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAdminContext();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full w-72 z-50 flex flex-col
          bg-white dark:bg-slate-950 border-r border-outline-variant/20 shadow-xl
          overflow-y-auto transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo + close button */}
        <div className="px-6 pt-7 pb-6 flex items-start justify-between shrink-0">
          <div className="flex flex-col gap-2">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Image
                src={logoUrl || "/logo.png"}
                alt="Hadi Umreye"
                width={160}
                height={56}
                className="w-auto h-11 object-contain"
                priority
              />
            </Link>
            <p className="text-[10px] uppercase tracking-[0.25em] text-tertiary-fixed-dim font-bold border-l-2 border-tertiary-fixed-dim pl-2">
              Kurumsal Yönetim
            </p>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors mt-1"
            aria-label="Menüyü kapat"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col space-y-5 px-4">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold px-4 mb-1.5">
                {group.title}
              </h4>
              <div className="space-y-0.5">
                {group.links.map(link => {
                  const isActive = link.exact
                    ? pathname === link.href
                    : pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "text-[#003781] font-bold bg-[#003781]/8 shadow-sm ring-1 ring-[#003781]/10"
                          : "text-slate-500 hover:text-[#003781] hover:bg-slate-50 font-medium"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] ${isActive ? "text-tertiary-fixed-dim" : ""}`}
                        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                      >
                        {link.icon}
                      </span>
                      <span className="text-sm">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom CTA */}
        <div className="px-5 py-5 mt-4 shrink-0">
          <Link href="/" target="_blank">
            <button className="w-full py-3.5 flex items-center justify-center gap-2 bg-primary text-white rounded-xl font-bold text-sm hover:bg-[#002f6c] transition-all shadow-md active:scale-[0.98]">
              Siteye Git
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            </button>
          </Link>
        </div>
      </aside>
    </>
  );
}
