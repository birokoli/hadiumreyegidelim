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
      <div className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-zinc-200 shadow-2xl flex flex-col">
          
          <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-zinc-900 text-[20px]">notifications</span>
              <h2 className="font-semibold text-sm text-zinc-900">Bildirimler & Talepler</h2>
              {unreadLeads.length > 0 && (
                <span className="bg-zinc-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  {unreadLeads.length} YENİ
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {unreadLeads.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center text-zinc-400">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-30">check_circle</span>
                <p className="text-xs font-semibold text-zinc-700">Tüm talepler okundu!</p>
                <p className="text-[11px] text-zinc-400 mt-1">Bekleyen yeni iletişim talebi bulunmuyor.</p>
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
                    className="p-4 bg-zinc-50 border border-zinc-200 rounded space-y-2 hover:border-zinc-900 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">YENİ TALEP</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{timeAgo}</span>
                    </div>

                    <div>
                      <p className="font-semibold text-zinc-900 text-xs">{lead.name}</p>
                      <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{lead.phone}</p>
                    </div>

                    {lead.package && (
                      <div className="inline-block text-[10px] font-medium bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                        {lead.package}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between border-t border-zinc-200/60">
                      <Link
                        href="/admin/contact"
                        onClick={onClose}
                        className="text-xs font-semibold text-zinc-600 hover:text-zinc-900"
                      >
                        Detaylar
                      </Link>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-zinc-900 text-white hover:bg-zinc-800 px-2.5 py-1 rounded text-xs font-medium transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-zinc-200 bg-zinc-50">
            <Link
              href="/admin/contact"
              onClick={onClose}
              className="w-full py-2 block text-center bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded transition-colors"
            >
              Tüm Talepleri Yönet (CRM)
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
