"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';

export default function AdminNavbar() {
  const [data, setData] = useState<any>({ unreadLeads: [], pendingOrders: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/admin/notifications')
      .then(res => res.json())
      .then(resData => {
        if (!resData.error) setData(resData);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalNotifs = (data.unreadLeads.length || 0) + (data.pendingOrders.length || 0);

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-18rem)] z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl flex justify-between items-center px-8 h-20 shadow-[0_4px_32px_rgba(0,0,0,0.02)] border-b border-outline-variant/10">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
          <input
            type="text"
            placeholder="Panelleri, rehberleri, ayarları ara..."
            className="w-full bg-surface-container-low border-none rounded-full pl-12 pr-4 py-2.5 focus:ring-1 focus:ring-primary/20 outline-none text-sm transition-all"
          />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          <button 
            className={`text-slate-500 transition-colors relative ${showDropdown ? 'text-[#236B40]' : 'hover:text-[#236B40]'}`}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span className="material-symbols-outlined">notifications</span>
            {totalNotifs > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full outline outline-2 outline-white"></span>
            )}
          </button>
          
          {/* Notifications Dropdown */}
          {showDropdown && (
            <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-outline-variant/10 overflow-hidden flex flex-col z-50">
              <div className="p-4 bg-surface-container-low border-b border-outline-variant/10">
                <h3 className="text-sm font-bold text-primary">Bildirimler</h3>
                <p className="text-[10px] text-outline mt-0.5">Sizi bekleyen {totalNotifs} işlem var.</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {data.unreadLeads.length === 0 && data.pendingOrders.length === 0 ? (
                  <div className="p-6 text-center text-outline">
                    <span className="material-symbols-outlined text-3xl mb-2 opacity-50">notifications_paused</span>
                    <p className="text-xs">Hiç yeni bildiriminiz yok.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-outline-variant/5">
                    {data.unreadLeads.map((lead: any) => (
                      <Link href="/admin/contact" key={lead.id} onClick={() => setShowDropdown(false)} className="flex gap-3 p-4 hover:bg-slate-50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-error/10 text-error flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[16px]">person</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-primary">{lead.name}</p>
                          <p className="text-[10px] text-outline">Yeni iletişim talebi bıraktı.</p>
                        </div>
                      </Link>
                    ))}
                    {data.pendingOrders.map((order: any) => (
                      <Link href="/admin/orders" key={order.id} onClick={() => setShowDropdown(false)} className="flex gap-3 p-4 hover:bg-slate-50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[16px]">shopping_bag</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-primary">Yeni Sipariş</p>
                          <p className="text-[10px] text-outline">${order.totalUSD} • {order.pax} Kişi</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <a href="mailto:admin@hadiumreyegidelim.com" className="text-slate-500 hover:text-[#236B40] transition-colors ml-2" title="Sistem Destek Talebi">
            <span className="material-symbols-outlined">help_outline</span>
          </a>
        </div>
        <div className="h-10 w-px bg-outline-variant/20"></div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-primary">Yönetici</p>
            <p className="text-[10px] text-outline font-label tracking-widest uppercase">Sistem Yöneticisi</p>
          </div>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgh9C64Lf-9G0O4Tl1BouPnz4QvYLXWCrSOMbt88oGF_UZGkdhjI4L5hn0E3TK7kSAKIAH3Lgjy5qxrL-f7ofIG5ndNqtps0OrqkfTzL1jhTNK8brmE38QtlpSDMzFLhAmZtsKV4cyjgCbKArHTeZLreazxMMWPTzny7yvaoNAlTt1GIkzkiMl59nMrFQ7oc03KiuoMvm1LXEEherNXBF7WlwsA9GhaSkRG5VRawkwYZ9cJVEFNR4kNFbSUCI0s4tsXe1-YI7FOwg"
            alt="Admin Profile"
            className="w-10 h-10 rounded-full border-2 border-surface object-cover shadow-sm bg-surface-container-high"
          />
        </div>
      </div>
    </header>
  );
}
