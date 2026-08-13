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
      <div className="fixed inset-0 bg-on-primary-fixed/30 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-container-lowest border-l border-outline-variant/15 shadow-2xl flex flex-col">

          <div className="p-5 border-b border-outline-variant/12 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">notifications</span>
              <h2 className="font-bold text-sm text-on-surface">Bildirimler & Talepler</h2>
              {unreadLeads.length > 0 && (
                <span className="bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadLeads.length} YENİ
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-outline hover:text-primary hover:bg-primary/[0.06] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {unreadLeads.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center text-outline">
                <span className="material-symbols-outlined text-4xl mb-2 text-secondary/50">check_circle</span>
                <p className="text-xs font-bold text-on-surface-variant">Tüm talepler okundu!</p>
                <p className="text-[11px] text-outline mt-1">Bekleyen yeni iletişim talebi bulunmuyor.</p>
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
                    className="p-4 bg-surface-container-low border border-outline-variant/15 rounded-2xl space-y-2 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider text-secondary uppercase">Yeni Talep</span>
                      <span className="text-[10px] text-outline font-mono">{timeAgo}</span>
                    </div>

                    <div>
                      <p className="font-bold text-on-surface text-xs">{lead.name}</p>
                      <p className="text-[11px] text-outline font-mono mt-0.5">{lead.phone}</p>
                    </div>

                    {lead.package && (
                      <div className="inline-block text-[10px] font-bold bg-primary/[0.08] text-primary px-2 py-0.5 rounded-full">
                        {lead.package}
                      </div>
                    )}

                    <div className="pt-2 flex items-center justify-between border-t border-outline-variant/12">
                      <Link
                        href="/admin/contact"
                        onClick={onClose}
                        className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors"
                      >
                        Detaylar
                      </Link>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-[#25D366] hover:bg-[#1fb958] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors active:scale-95"
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

          <div className="p-4 border-t border-outline-variant/12 bg-surface-container-low">
            <Link
              href="/admin/contact"
              onClick={onClose}
              className="w-full py-2.5 block text-center bg-primary hover:bg-primary-container text-white font-bold text-xs rounded-xl transition-all active:scale-95"
            >
              Tüm Talepleri Yönet (CRM)
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
