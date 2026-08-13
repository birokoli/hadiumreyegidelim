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
          className="admin-modal-scrim fixed inset-0 z-40 bg-on-primary-fixed/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 h-full w-72 z-50 flex flex-col
          bg-surface-container-lowest/90 backdrop-blur-2xl text-on-surface border-r border-outline-variant/15
          overflow-y-auto transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)]
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Brand Header */}
        <div className="px-6 pt-7 pb-5 flex items-center justify-between shrink-0 border-b border-outline-variant/10">
          <Link href="/admin" className="flex items-center gap-2.5">
            {logoUrl ? (
              <Image src={logoUrl} alt="Logo" width={130} height={40} className="w-auto h-8 object-contain" priority />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary text-white rounded-lg flex items-center justify-center font-bold text-xs font-headline">HU</div>
                <span className="font-headline font-bold text-sm tracking-tight text-primary">HADI UMREYE</span>
              </div>
            )}
            <span className="text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-0.5 bg-tertiary-fixed-dim/25 text-tertiary rounded-full">
              Admin
            </span>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-full text-outline hover:text-primary hover:bg-surface-container-low transition-colors active:scale-90"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Sidebar Quick Filter Input */}
        <div className="px-4 py-3 border-b border-outline-variant/10">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px]">
              search
            </span>
            <input
              type="text"
              placeholder="Menüde ara..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full bg-surface-container-low text-xs text-on-surface placeholder:text-outline rounded-xl px-2.5 py-2 pl-9 border border-transparent focus:outline-none focus:border-primary/30 focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10 transition-all"
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
                <h4 className="text-[10.5px] font-bold tracking-[0.12em] text-outline uppercase px-3 mb-2">
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
                        data-press
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-primary text-white font-semibold shadow-[0_4px_14px_-4px_rgba(0,55,129,0.45)]"
                            : "text-on-surface-variant hover:text-primary hover:bg-primary/[0.06]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`material-symbols-outlined text-[18px] ${isActive ? "text-tertiary-fixed-dim" : "text-outline"}`}
                            style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                          >
                            {link.icon}
                          </span>
                          <span>{link.label}</span>
                        </div>

                        {badgeValue !== undefined && badgeValue > 0 && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                              isActive
                                ? "bg-white/20 text-white"
                                : link.badgeKey === "unreadLeads"
                                ? "bg-secondary text-white"
                                : "bg-surface-container text-on-surface-variant"
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
        <div className="p-4 border-t border-outline-variant/10 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="w-full py-2.5 flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-container text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm"
          >
            <span>Canlı Siteyi Gör</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
