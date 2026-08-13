"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAdminContext } from "./AdminContext";
import AdminCommandPalette from "./AdminCommandPalette";
import AdminNotificationDrawer from "./AdminNotificationDrawer";

export default function AdminNavbar() {
  const { setSidebarOpen } = useAdminContext();
  const [data, setData] = useState<any>({ unreadLeads: [], pendingOrders: [] });
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  const quickRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (quickRef.current && !quickRef.current.contains(e.target as Node)) setShowQuickActions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const totalNotifs = (data.unreadLeads?.length ?? 0) + (data.pendingOrders?.length ?? 0);

  return (
    <>
      <header className="fixed top-0 right-0 left-0 lg:left-72 z-40 bg-surface-container-lowest/80 backdrop-blur-xl flex items-center justify-between px-6 h-14 border-b border-outline-variant/12">
        {/* Left: Mobile Toggle & Cmd+K Search Bar */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/[0.06] active:scale-90 transition-all"
            aria-label="Menüyü aç"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="hidden md:flex items-center justify-between gap-8 w-72 bg-surface-container-low hover:bg-surface-container text-on-surface-variant rounded-xl border border-transparent hover:border-primary/15 px-3 py-1.5 text-xs transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-outline">search</span>
              <span>Hızlı komut veya sayfa ara...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-surface-container-lowest text-on-surface-variant rounded-md border border-outline-variant/20">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="md:hidden p-1.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/[0.06] transition-all"
            title="Komut Arama (Cmd+K)"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          {/* Notification Drawer Button */}
          <button
            onClick={() => setShowNotificationDrawer(true)}
            className="relative p-1.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/[0.06] active:scale-90 transition-all"
            title="Bildirimler"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {totalNotifs > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-secondary rounded-full ring-2 ring-surface-container-lowest" />
            )}
          </button>

          {/* Quick Action "+ Hızlı Ekle" */}
          <div className="relative" ref={quickRef}>
            <button
              onClick={() => setShowQuickActions((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                showQuickActions
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-surface-container-lowest text-primary border-outline-variant/25 hover:border-primary/40"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span className="hidden sm:inline">Hızlı Ekle</span>
            </button>

            {showQuickActions && (
              <div className="absolute top-11 right-0 w-56 bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-xl overflow-hidden z-50 py-1.5">
                <div className="px-3.5 py-2 border-b border-outline-variant/10">
                  <h3 className="text-[10.5px] font-bold text-outline uppercase tracking-wider">Hızlı Aksiyonlar</h3>
                </div>
                {[
                  { href: "/admin/packages", icon: "inventory_2", label: "Yeni Paket Ekle" },
                  { href: "/admin/content", icon: "edit_document", label: "Yeni Blog Yazısı" },
                  { href: "/admin/fiyat-teklifleri/hesaplayici", icon: "request_quote", label: "Fiyat Teklifi Al" },
                  { href: "/admin/media", icon: "add_photo_alternate", label: "Medya Yükle" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowQuickActions(false)}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-primary/[0.06] text-xs font-medium text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-outline">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-outline-variant/25 mx-1" />

          {/* Profile User Badge */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-on-surface leading-none">Yönetici</p>
              <p className="text-[10px] text-outline mt-0.5">Yönetim Ofisi</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center font-headline shadow-sm">
              Y
            </div>
          </div>
        </div>
      </header>

      <AdminCommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />

      <AdminNotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
        unreadLeads={data.unreadLeads || []}
      />
    </>
  );
}
