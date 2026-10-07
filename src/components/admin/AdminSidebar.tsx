"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAdminContext } from "./AdminContext";

type AdminPermission = "dashboard" | "orders" | "content" | "operations" | "marketing" | "settings" | "users";

interface SidebarLink {
  href: string;
  icon: string;
  label: string;
  exact?: boolean;
  match?: string[];
  permission?: AdminPermission;
  badgeKey?: string;
}

const menuGroups: { title: string; links: SidebarLink[] }[] = [
  {
    title: "Genel Bakış",
    links: [
      { href: "/admin", icon: "grid_view", label: "Dashboard", exact: true, permission: "dashboard" },
    ],
  },
  {
    title: "Satış",
    links: [
      {
        href: "/admin/contact",
        icon: "inbox",
        label: "Gelen Kutusu",
        match: ["/admin/contact", "/admin/orders", "/admin/crm", "/admin/fiyat-teklifleri"],
        permission: "orders",
        badgeKey: "unreadLeads",
      },
      {
        href: "/admin/packages",
        icon: "inventory_2",
        label: "Ürün ve Fiyat",
        match: ["/admin/packages", "/admin/fiyat-teklifleri/hizmetler", "/admin/fiyat-teklifleri/hizmetler/fiyatlar", "/admin/services", "/admin/guides", "/admin/otel-rehberi"],
        permission: "operations",
        badgeKey: "totalPackages",
      },
    ],
  },
  {
    title: "İçerik",
    links: [
      {
        href: "/admin/content",
        icon: "article",
        label: "Blog",
        match: ["/admin/content", "/admin/blog-kuyrugu", "/admin/categories", "/admin/authors"],
        permission: "content",
        badgeKey: "totalPosts",
      },
      {
        href: "/admin/sayfa-metinleri",
        icon: "edit_note",
        label: "Site Metinleri",
        match: ["/admin/sayfa-metinleri", "/admin/yardim-merkezi", "/admin/content/rehber", "/admin/eylul-umresi"],
        permission: "content",
      },
      {
        href: "/admin/yorumlar",
        icon: "reviews",
        label: "Yorumlar",
        permission: "marketing",
      },
    ],
  },
  {
    title: "Büyüme",
    links: [
      {
        href: "/admin/influencer-adaylari",
        icon: "person_celebrate",
        label: "Influencer",
        match: ["/admin/influencer-adaylari", "/admin/influencers", "/admin/affiliate", "/admin/campaigns"],
        permission: "marketing",
      },
      {
        href: "/admin/seo",
        icon: "travel_explore",
        label: "Görünürlük",
        match: ["/admin/seo", "/admin/ai-visibility", "/admin/analytics"],
        permission: "marketing",
      },
      {
        href: "/admin/support",
        icon: "forum",
        label: "Sohbetler",
        match: ["/admin/support", "/admin/whatsapp-ai"],
        permission: "marketing",
      },
    ],
  },
  {
    title: "Sistem",
    links: [
      {
        href: "/admin/settings",
        icon: "settings",
        label: "Ayarlar",
        match: ["/admin/settings", "/admin/users", "/admin/media"],
        permission: "settings",
      },
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
  const DEFAULT_OPEN = ["Genel Bakış", "Satış", "İçerik"];
  const [openGroups, setOpenGroups] = useState<string[]>(DEFAULT_OPEN);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin-open-groups");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- tarayıcıda kayıtlı tercih ilk yüklemede okunur
      if (saved) setOpenGroups(JSON.parse(saved));
    } catch { /* kayıt yoksa varsayılan */ }
  }, []);

  const toggleGroup = (title: string) =>
    setOpenGroups((prev) => {
      const next = prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title];
      try { localStorage.setItem("admin-open-groups", JSON.stringify(next)); } catch { /* yok sayılır */ }
      return next;
    });

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

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/admin/login";
  };

  const canSee = (permission?: AdminPermission) => {
    if (!permission || isSuperAdmin || allowedPermissions === null) return true;
    return allowedPermissions.includes(permission);
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  // En uzun eşleşen yol kazanır: /admin/content/rehber "Site Metinleri"ne, /admin/fiyat-teklifleri/hizmetler
  // "Ürün ve Fiyat"a ait olur (kısa önekleri olan Blog / Gelen Kutusu aynı anda aktif görünmez)
  const matchLength = (link: SidebarLink) => {
    const paths = link.match && link.match.length > 0 ? link.match : [link.href];
    let best = -1;
    for (const m of paths) {
      const hit = pathname === m || (!link.exact && m !== "/admin" && pathname.startsWith(m + "/"));
      if (hit) best = Math.max(best, m.length);
    }
    return best;
  };
  const allLinks = menuGroups.flatMap((g) => g.links);
  const bestLength = Math.max(-1, ...allLinks.map(matchLength));
  const isLinkActive = (link: SidebarLink) => bestLength >= 0 && matchLength(link) === bestLength;

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
        <nav className="flex-1 px-3 py-4 space-y-4">
          {menuGroups.map((group, idx) => {
            const filteredLinks = group.links
              .filter(link => canSee(link.permission))
              .filter(link => link.label.toLowerCase().includes(filterQuery.toLowerCase()));

            if (filteredLinks.length === 0) return null;
            const hasActive = filteredLinks.some((l) => isLinkActive(l));
            const isOpen = Boolean(filterQuery) || hasActive || openGroups.includes(group.title);
            const groupBadge = filteredLinks.reduce((sum, l) => sum + (l.badgeKey === "unreadLeads" ? (counts.unreadLeads ?? 0) : 0), 0);

            return (
              <div key={idx}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.title)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between text-[10.5px] font-bold tracking-[0.12em] text-outline uppercase px-3 mb-2 hover:text-primary transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {group.title}
                    {!isOpen && groupBadge > 0 && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-secondary text-white normal-case tracking-normal">{groupBadge}</span>}
                    {!isOpen && <span className="normal-case tracking-normal font-medium text-outline/70">· {filteredLinks.length}</span>}
                  </span>
                  <span className={`material-symbols-outlined text-[16px] transition-transform ${isOpen ? "rotate-180" : ""}`}>expand_more</span>
                </button>
                {isOpen && <div className="space-y-0.5">
                  {filteredLinks.map(link => {
                    const isActive = isLinkActive(link);
                    const badgeValue = link.badgeKey ? (counts as Record<string, number>)[link.badgeKey] : undefined;

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
                </div>}
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
          <button
            type="button"
            onClick={logout}
            className="mt-2 w-full py-2.5 flex items-center justify-center gap-1.5 border border-outline-variant/40 text-on-surface-variant hover:text-primary hover:border-primary/40 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[14px]">logout</span>
            <span>Çıkış yap</span>
          </button>
        </div>
      </aside>
    </>
  );
}
