"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAdminContext } from "./AdminContext";

export default function AdminNavbar() {
  const { setSidebarOpen } = useAdminContext();
  const [data, setData] = useState<any>({ unreadLeads: [], pendingOrders: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setShowQuickActions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const totalNotifs = (data.unreadLeads?.length ?? 0) + (data.pendingOrders?.length ?? 0);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl flex items-center justify-between px-5 lg:px-8 h-16 border-b border-outline-variant/10 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">

      {/* Left: Hamburger (mobile) + Page breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-primary transition-colors active:scale-95"
          aria-label="Menüyü aç"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Search — desktop only */}
        <div className="relative hidden md:block">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Panelde ara..."
            className="w-64 bg-slate-100 border-none rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
            readOnly
            title="Yakında aktif olacak"
          />
        </div>
      </div>

      {/* Right: Actions + Profile */}
      <div className="flex items-center gap-2">

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(v => !v)}
            className={`relative p-2.5 rounded-xl transition-colors ${showDropdown ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-slate-100 hover:text-primary"}`}
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {totalNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showDropdown && (
            <div className="absolute top-14 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-primary">Bildirimler</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {totalNotifs > 0 ? `${totalNotifs} yeni işlem var` : "Tümü okundu"}
                  </p>
                </div>
                <span className={`w-2 h-2 rounded-full ${totalNotifs > 0 ? "bg-red-500 animate-pulse" : "bg-emerald-400"}`} />
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {totalNotifs === 0 ? (
                  <div className="py-8 flex flex-col items-center text-slate-400">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-40">notifications_paused</span>
                    <p className="text-xs font-medium">Yeni bildirim yok</p>
                  </div>
                ) : (
                  <>
                    {data.unreadLeads.map((l: any) => (
                      <Link key={l.id} href="/admin/contact" onClick={() => setShowDropdown(false)}
                        className="flex gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px]">person</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-primary truncate">{l.name}</p>
                          <p className="text-[11px] text-slate-500">Yeni iletişim talebi</p>
                        </div>
                      </Link>
                    ))}
                    {data.pendingOrders.map((o: any) => (
                      <Link key={o.id} href="/admin/orders" onClick={() => setShowDropdown(false)}
                        className="flex gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-primary">Yeni Sipariş</p>
                          <p className="text-[11px] text-slate-500">${o.totalUSD} · {o.pax} Kişi</p>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="relative" ref={quickRef}>
          <button
            onClick={() => setShowQuickActions(v => !v)}
            className={`p-2.5 rounded-xl transition-colors ${showQuickActions ? "bg-primary/10 text-primary" : "text-slate-500 hover:bg-slate-100 hover:text-primary"}`}
            title="Hızlı Aksiyonlar"
          >
            <span className="material-symbols-outlined text-[22px]">add_circle</span>
          </button>

          {showQuickActions && (
            <div className="absolute top-14 right-0 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                <h3 className="text-xs font-bold text-primary">Hızlı Kısayollar</h3>
              </div>
              <div className="p-2 flex flex-col gap-0.5">
                {[
                  { href: "/admin/content",  icon: "edit_document",       label: "Yeni Blog Yaz",      color: "text-indigo-600" },
                  { href: "/admin/packages", icon: "inventory_2",          label: "Yeni Paket",         color: "text-blue-600"   },
                  { href: "/admin/media",    icon: "add_photo_alternate",  label: "Fotoğraf Yükle",     color: "text-emerald-600"},
                  { href: "/admin/ai-logs",  icon: "memory",               label: "AI İzleme",          color: "text-purple-600" },
                ].map(item => (
                  <Link key={item.href} href={item.href} onClick={() => setShowQuickActions(false)}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700 transition-colors">
                    <span className={`material-symbols-outlined text-[20px] ${item.color}`}>{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
                <div className="h-px bg-slate-100 my-1" />
                <Link href="/" target="_blank" onClick={() => setShowQuickActions(false)}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700 transition-colors">
                  <span className="material-symbols-outlined text-[20px] text-slate-500">visibility</span>
                  Siteyi Önizle
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200 mx-1" />

        {/* Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-primary leading-none mb-0.5">Yönetici</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Sistem Yöneticisi</p>
          </div>
          {/* Initials avatar — no external dependency */}
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-md select-none">
            Y
          </div>
        </div>
      </div>
    </header>
  );
}
