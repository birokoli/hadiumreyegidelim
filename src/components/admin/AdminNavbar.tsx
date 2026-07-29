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
      <header className="fixed top-0 right-0 left-0 lg:left-72 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl flex items-center justify-between px-5 lg:px-8 h-16 border-b border-slate-200/80 dark:border-slate-800/80 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        {/* Left: Hamburger (mobile) + Cmd+K Search trigger */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary transition-colors active:scale-95"
            aria-label="Menüyü aç"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>

          {/* Cmd+K Search trigger button */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="hidden md:flex items-center justify-between gap-6 w-64 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full px-4 py-2 text-sm transition-all border border-slate-200/50 dark:border-slate-700/50 group"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-[#003781] dark:group-hover:text-sky-400">
                search
              </span>
              <span>Arama yapın...</span>
            </div>
            <kbd className="px-2 py-0.5 text-[10px] font-mono font-bold bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions + Profile */}
        <div className="flex items-center gap-2">
          {/* Cmd+K Mobile Button */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="md:hidden p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            title="Komut Arama (Cmd+K)"
          >
            <span className="material-symbols-outlined text-[22px]">search</span>
          </button>

          {/* Notifications Drawer Toggle */}
          <button
            onClick={() => setShowNotificationDrawer(true)}
            className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-primary transition-colors"
            title="Bildirimler"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {totalNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Quick Actions "+ Yeni Ekle" */}
          <div className="relative" ref={quickRef}>
            <button
              onClick={() => setShowQuickActions((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                showQuickActions
                  ? "bg-[#003781] text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
              title="Hızlı Ekle"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="hidden sm:inline">Hızlı Ekle</span>
            </button>

            {showQuickActions && (
              <div className="absolute top-12 right-0 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-[#003781] dark:text-sky-400">Hızlı Aksiyonlar</h3>
                </div>
                <div className="p-2 flex flex-col gap-0.5">
                  {[
                    { href: "/admin/packages", icon: "inventory_2", label: "Yeni Paket Ekle", color: "text-blue-600 dark:text-blue-400" },
                    { href: "/admin/content", icon: "edit_document", label: "Yeni Blog Ekle", color: "text-indigo-600 dark:text-indigo-400" },
                    { href: "/admin/fiyat-teklifleri/hesaplayici", icon: "request_quote", label: "Fiyat Hesapla", color: "text-emerald-600 dark:text-emerald-400" },
                    { href: "/admin/media", icon: "add_photo_alternate", label: "Medya Yükle", color: "text-purple-600 dark:text-purple-400" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setShowQuickActions(false)}
                      className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <span className={`material-symbols-outlined text-[20px] ${item.color}`}>{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-primary dark:text-sky-400 leading-none mb-0.5">Yönetici</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Sistem Yöneticisi</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#003781] text-white font-bold text-sm shadow-md flex items-center justify-center select-none">
              Y
            </div>
          </div>
        </div>
      </header>

      {/* Command Palette Modal */}
      <AdminCommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
      />

      {/* Notification Drawer */}
      <AdminNotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
        unreadLeads={data.unreadLeads || []}
      />
    </>
  );
}
