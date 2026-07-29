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
      <header className="fixed top-0 right-0 left-0 lg:left-72 z-40 bg-white flex items-center justify-between px-6 h-14 border-b border-zinc-200">
        {/* Left: Mobile Toggle & Cmd+K Search Bar */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            aria-label="Menüyü aç"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>

          {/* Search Trigger (Apple/Swiss style) */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="hidden md:flex items-center justify-between gap-8 w-72 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 rounded border border-zinc-200 px-3 py-1.5 text-xs transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-zinc-400">search</span>
              <span>Hızlı komut veya sayfa ara...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium bg-white text-zinc-500 rounded border border-zinc-200">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="md:hidden p-1.5 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            title="Komut Arama (Cmd+K)"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>

          {/* Notification Drawer Button */}
          <button
            onClick={() => setShowNotificationDrawer(true)}
            className="relative p-1.5 rounded text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            title="Bildirimler"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {totalNotifs > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-zinc-900 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Quick Action "+ Hızlı Ekle" */}
          <div className="relative" ref={quickRef}>
            <button
              onClick={() => setShowQuickActions((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium transition-colors ${
                showQuickActions
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-900 border-zinc-200 hover:border-zinc-900"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span className="hidden sm:inline">Hızlı Ekle</span>
            </button>

            {showQuickActions && (
              <div className="absolute top-10 right-0 w-52 bg-white rounded border border-zinc-200 shadow-lg overflow-hidden z-50 py-1">
                <div className="px-3 py-2 border-b border-zinc-100">
                  <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Hızlı Aksiyonlar</h3>
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
                    className="flex items-center gap-2.5 px-3 py-2 hover:bg-zinc-50 text-xs text-zinc-700 hover:text-zinc-900 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px] text-zinc-400">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-zinc-200 mx-1" />

          {/* Profile User Badge */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-zinc-900 leading-none">Yönetici</p>
              <p className="text-[10px] text-zinc-400">Yönetim Ofisi</p>
            </div>
            <div className="w-7 h-7 rounded bg-zinc-900 text-white font-bold text-xs flex items-center justify-center">
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
