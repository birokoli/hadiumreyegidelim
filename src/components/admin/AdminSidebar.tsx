"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAdminContext } from "./AdminContext";

type AdminPermission = "dashboard" | "orders" | "content" | "operations" | "marketing" | "settings" | "users";

const menuGroups: { title: string; links: { href: string; icon: string; label: string; exact?: boolean; permission?: AdminPermission; badgeKey?: string }[] }[] = [
  {
    title: "Genel Bakış",
    links: [
      { href: "/admin", icon: "grid_view", label: "Dashboard", exact: true, permission: "dashboard" },
    ],
  },
  {
    title: "Satış & CRM",
    links: [
      { href: "/admin/crm",                       icon: "view_kanban",    label: "CRM Komuta Merkezi", permission: "orders"   },
      { href: "/admin/fiyat-teklifleri/hesaplayici", icon: "calculate",     label: "Excel Fiyat Motoru", permission: "orders"   },
      { href: "/admin/orders",                    icon: "receipt_long",   label: "Talepler / Siparişler", permission: "orders" },
      { href: "/admin/contact",                   icon: "chat",           label: "WhatsApp & İletişim", permission: "orders", badgeKey: "unreadLeads" },
      { href: "/admin/fiyat-teklifleri",           icon: "request_quote",  label: "Fiyat Teklifleri", permission: "orders"     },
      { href: "/admin/fiyat-teklifleri/hizmetler", icon: "library_books",  label: "Hizmet Kütüphanesi", permission: "orders"   },
    ],
  },
  {
    title: "Operasyon",
    links: [
      { href: "/admin/packages", icon: "inventory_2", label: "Lüks Paketler", permission: "operations", badgeKey: "totalPackages" },
      { href: "/admin/services", icon: "mosque",      label: "Ek Hizmetler", permission: "operations"   },
      { href: "/admin/guides",   icon: "person_pin",  label: "Yerel Rehberler", permission: "operations" },
    ],
  },
  {
    title: "İçerik Stüdyosu",
    links: [
      { href: "/admin/content",    icon: "article",  label: "Blog İçerikleri", permission: "content", badgeKey: "totalPosts" },
      { href: "/admin/categories", icon: "category", label: "Kategoriler", permission: "content"     },
      { href: "/admin/authors",    icon: "badge",    label: "Yazarlar", permission: "content"        },
    ],
  },
  {
    title: "Pazarlama & Büyüme",
    links: [
      { href: "/admin/influencers", icon: "person_celebrate", label: "Influencer Yönetimi", permission: "marketing" },
      { href: "/admin/affiliate",   icon: "star",             label: "Affiliate Program", permission: "marketing" },
      { href: "/admin/campaigns",   icon: "campaign",         label: "Kampanyalar", permission: "marketing" },
      { href: "/admin/eylul-umresi", icon: "ads_click",        label: "ADS Sayfası", permission: "marketing" },
      { href: "/admin/support",     icon: "support_agent",    label: "Canlı Destek", permission: "marketing" },
      { href: "/admin/whatsapp-ai", icon: "smart_toy",        label: "WhatsApp AI", permission: "marketing" },
    ],
  },
  {
    title: "Sistem",
    links: [
      { href: "/admin/analytics", icon: "analytics",     label: "Analytics", permission: "dashboard"       },
      { href: "/admin/media",     icon: "photo_library", label: "Medya Galerisi", permission: "content"  },
      { href: "/admin/ai-logs",       icon: "memory",        label: "Yapay Zeka (AI)", permission: "dashboard" },
      { href: "/admin/ai-visibility", icon: "search_hands_free", label: "AI Görünürlük", permission: "dashboard" },
      { href: "/admin/users",     icon: "manage_accounts", label: "Kullanıcılar", permission: "users" },
      { href: "/admin/settings",  icon: "settings",      label: "Ayarlar", permission: "settings" },
    ],
  },
];

export default function AdminSidebar({ logoUrl }: { logoUrl?: string }) {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAdminContext();
  const [allowedPermissions, setAllowedPermissions] = useState<AdminPermission[] | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(true);
  const [counts, setCounts] = useState<{ unreadLeads?: number; totalPackages?: number; totalPosts?: number }>({});
  const [filterQuery, setFilterQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/me")
      .then(res => res.json())
      .then(data => {
        const admin = data.admin;
        setIsSuperAdmin(Boolean(admin?.legacy) || admin?.role === "super_admin");
        setAllowedPermissions(Array.isArray(admin?.permissions) ? admin.permissions : []);
      })
      .catch(() => {
        setIsSuperAdmin(true);
        setAllowedPermissions(null);
      });

    fetch("/api/admin/counts")
      .then(res => res.json())
      .then(data => {
        if (data.counts) setCounts(data.counts);
      })
      .catch(() => {});
  }, []);

  const canSee = (permission?: AdminPermission) => {
    if (!permission || isSuperAdmin || allowedPermissions === null) return true;
    return allowedPermissions.includes(permission);
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-full w-72 z-50 flex flex-col
          bg-white text-zinc-900 border-r border-zinc-200 shadow-none
          overflow-y-auto transition-transform duration-200 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand Header */}
        <div className="px-6 pt-7 pb-5 flex items-center justify-between shrink-0 border-b border-zinc-100">
          <Link href="/admin" className="flex items-center gap-3">
            {logoUrl ? (
              <Image src={logoUrl} alt="Logo" width={130} height={40} className="w-auto h-8 object-contain" priority />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-zinc-900 text-white rounded flex items-center justify-center font-bold text-xs">HU</div>
                <span className="font-semibold text-sm tracking-tight text-zinc-900">HADI UMREYE</span>
              </div>
            )}
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded">
              ADMIN
            </span>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Sidebar Quick Filter Input */}
        <div className="px-4 py-3 border-b border-zinc-100">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[15px]">
              search
            </span>
            <input
              type="text"
              placeholder="Menüde ara..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full bg-zinc-50 text-xs text-zinc-900 placeholder:text-zinc-400 rounded px-2.5 py-1.5 pl-8 border border-zinc-200 focus:outline-none focus:border-zinc-900"
            />
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-6">
          {menuGroups.map((group, idx) => {
            const filteredLinks = group.links
              .filter(link => canSee(link.permission))
              .filter(link => link.label.toLowerCase().includes(filterQuery.toLowerCase()));

            if (filteredLinks.length === 0) return null;

            return (
              <div key={idx}>
                <h4 className="text-[11px] font-semibold tracking-wider text-zinc-400 uppercase px-3 mb-2">
                  {group.title}
                </h4>
                <div className="space-y-0.5">
                  {filteredLinks.map(link => {
                    const isActive = link.exact
                      ? pathname === link.href
                      : pathname.startsWith(link.href);

                    const badgeValue = link.badgeKey ? (counts as any)[link.badgeKey] : undefined;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors ${
                          isActive
                            ? "bg-zinc-900 text-white font-semibold shadow-xs"
                            : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`material-symbols-outlined text-[18px] ${isActive ? "text-white" : "text-zinc-400"}`}>
                            {link.icon}
                          </span>
                          <span>{link.label}</span>
                        </div>

                        {badgeValue !== undefined && badgeValue > 0 && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              isActive
                                ? "bg-white text-zinc-900"
                                : link.badgeKey === "unreadLeads"
                                ? "bg-zinc-900 text-white"
                                : "bg-zinc-100 text-zinc-600"
                            }`}
                          >
                            {badgeValue}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer Link */}
        <div className="p-4 border-t border-zinc-100 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="w-full py-2 flex items-center justify-center gap-1.5 bg-zinc-900 text-white rounded text-xs font-medium hover:bg-zinc-800 transition-colors"
          >
            <span>Canlı Siteyi Gör</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
