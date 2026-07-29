"use client";

import React from "react";
import Link from "next/link";

interface LeadNotification {
  id: string;
  name: string;
  phone: string;
  package?: string;
  createdAt: string;
}

interface AdminNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  unreadLeads: LeadNotification[];
}

export default function AdminNotificationDrawer({ isOpen, onClose, unreadLeads }: AdminNotificationDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-500 text-[24px]">notifications</span>
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">Bildirimler & Talepler</h2>
              {unreadLeads.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadLeads.length} Yeni
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {unreadLeads.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center text-slate-400">
                <span className="material-symbols-outlined text-5xl mb-2 opacity-30">check_circle</span>
                <p className="text-sm font-semibold">Tüm talepler okundu!</p>
                <p className="text-xs text-slate-400 mt-1">Bekleyen yeni iletişim talebi bulunmuyor.</p>
              </div>
            ) : (
              unreadLeads.map((lead) => {
                let cleanPhone = lead.phone.replace(/[^0-9]/g, "");
                if (cleanPhone.startsWith("0")) cleanPhone = "9" + cleanPhone;
                if (!cleanPhone.startsWith("90")) cleanPhone = "90" + cleanPhone;
                const waUrl = `https://wa.me/${cleanPhone}?text=Merhaba ${lead.name.split(" ")[0]}, Hadi Umreye Gidelim'den ulaşıyoruz.`;
                const timeAgo = new Date(lead.createdAt).toLocaleDateString("tr-TR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={lead.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 rounded-xl space-y-2 hover:border-[#003781] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#003781] dark:text-sky-400">Yeni Müşteri Talebi</span>
                      <span className="text-[11px] text-slate-400">{timeAgo}</span>
                    </div>

                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{lead.name}</p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{lead.phone}</p>
                    </div>

                    {lead.package && (
                      <div className="inline-block text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2.5 py-1 rounded-md">
                        {lead.package}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between border-t border-slate-200/40 dark:border-slate-700/40">
                      <Link
                        href="/admin/contact"
                        onClick={onClose}
                        className="text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                      >
                        Detayları Gör
                      </Link>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-[#25D366] text-white hover:bg-[#1faf55] px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                        WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <Link
              href="/admin/contact"
              onClick={onClose}
              className="w-full py-2.5 block text-center bg-[#003781] hover:bg-[#002f6c] text-white font-bold text-xs rounded-xl transition-colors"
            >
              Tüm Talepleri İncele (CRM)
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
