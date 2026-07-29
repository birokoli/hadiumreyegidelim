export const dynamic = 'force-dynamic';

import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const [totalPackages, totalPosts, unreadLeads, totalLeads, recentLeads] = await Promise.all([
    prisma.package.count({ where: { published: true } }),
    prisma.post.count({ where: { published: true } }),
    prisma.contactRequest.count({ where: { status: 'UNREAD' } }),
    prisma.contactRequest.count(),
    prisma.contactRequest.findMany({ take: 8, orderBy: { createdAt: 'desc' } })
  ]);

  const conversionRate = totalLeads > 0 ? Math.round(((totalLeads - unreadLeads) / totalLeads) * 100) : 100;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Komuta Merkezi</h1>
            <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sistem Aktif
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Hadi Umreye Gidelim — Kurumsal Yönetim & CRM Paneli</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/" target="_blank"
            className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-2xs">
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            Siteyi Gör
          </Link>
          <Link href="/admin/contact"
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1faf55] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">chat</span>
            WhatsApp Leadleri ({unreadLeads})
          </Link>
        </div>
      </div>

      {/* Advanced Stat Trend Cards (Inspired by AdminLTE & TailAdmin) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Bekleyen Leadler",
            value: unreadLeads,
            subText: unreadLeads > 0 ? "⚠️ İnceleme Bekliyor" : "✅ Tüm talepler yanıtlandı",
            icon: "mark_email_unread",
            color: "text-red-500",
            bg: "bg-red-50 dark:bg-red-950/30",
            badge: "+14.2% bu hafta",
            badgeColor: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
            href: "/admin/contact",
            urgent: unreadLeads > 0
          },
          {
            label: "Dönüşüm Oranı",
            value: `%${conversionRate}`,
            subText: `${totalLeads - unreadLeads} / ${totalLeads} Talep işlendi`,
            icon: "analytics",
            color: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-950/30",
            badge: "Yüksek İvme",
            badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
            href: "/admin/crm"
          },
          {
            label: "Yayındaki Paketler",
            value: totalPackages,
            subText: "Aktif Umre Paketleri",
            icon: "inventory_2",
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-950/30",
            badge: "Lüks Kategoriler",
            badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
            href: "/admin/packages"
          },
          {
            label: "Blog & İçerikler",
            value: totalPosts,
            subText: "Yayınlanan Makaleler",
            icon: "article",
            color: "text-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-950/30",
            badge: "SEO Aktif",
            badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
            href: "/admin/content"
          },
        ].map(s => (
          <Link key={s.label} href={s.href}
            className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group ${s.urgent ? 'border-red-300 dark:border-red-800' : 'border-slate-200/80 dark:border-slate-800'}`}>
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <span className={`material-symbols-outlined text-[24px] ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${s.badgeColor}`}>
                {s.badge}
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
              <p className={`text-3xl font-extrabold mt-1 ${s.urgent ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{s.subText}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent leads & Filter Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[22px] text-slate-400">inbox</span>
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Son İletişim & Fiyat Talepleri
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/contact" className="text-xs font-bold text-[#003781] dark:text-sky-400 hover:underline flex items-center gap-1">
              Tüm CRM Taleplerini Aç <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>

        {recentLeads.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-3 opacity-40">inbox</span>
            <p className="text-sm font-medium">Henüz form doldurulmamış</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentLeads.map((lead: any) => {
              let phone = lead.phone.replace(/[^0-9]/g, '');
              if (phone.startsWith('0')) phone = '9' + phone;
              if (!phone.startsWith('90')) phone = '90' + phone;
              const waUrl = `https://wa.me/${phone}?text=Merhaba ${lead.name.split(' ')[0]}, Hadi Umreye Gidelim'den ulaşıyoruz.`;
              const date = new Date(lead.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

              return (
                <div key={lead.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#003781]/10 text-[#003781] dark:bg-sky-500/20 dark:text-sky-300 font-bold flex items-center justify-center shrink-0 text-sm">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{lead.name}</p>
                        {lead.status === 'UNREAD' && (
                          <span className="text-[10px] font-extrabold bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400 px-2 py-0.5 rounded-full">
                            Yeni
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{lead.phone} · {date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {lead.package && (
                      <span className="hidden lg:block text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-lg max-w-[200px] truncate">
                        {lead.package}
                      </span>
                    )}

                    <a href={waUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#25D366] text-white hover:bg-[#1faf55] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs">
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                      WhatsApp ile Yaz
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Access Control Grid (Inspired by shadcn-admin) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { href: "/admin/crm", icon: "view_kanban", label: "CRM Komuta", desc: "Tüm talepleri yönet", color: "text-[#003781] dark:text-sky-400" },
          { href: "/admin/fiyat-teklifleri/hesaplayici", icon: "calculate", label: "Fiyat Motoru", desc: "Excel otomasyonu", color: "text-emerald-500" },
          { href: "/admin/content", icon: "edit_document", label: "Yeni Blog", desc: "İçerik yazarı", color: "text-indigo-500" },
          { href: "/admin/ai-logs", icon: "memory", label: "AI İzleme", desc: "Bot hareketleri", color: "text-purple-500" },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs p-5 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all group">
            <span className={`material-symbols-outlined text-[28px] ${item.color} group-hover:scale-110 transition-transform mb-3`}>{item.icon}</span>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white block">{item.label}</span>
              <span className="text-xs text-slate-400 block mt-0.5">{item.desc}</span>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
