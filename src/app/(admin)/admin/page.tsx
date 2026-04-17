export const dynamic = 'force-dynamic';

import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const [totalPackages, totalPosts, unreadLeads, recentLeads] = await Promise.all([
    prisma.package.count({ where: { published: true } }),
    prisma.post.count({ where: { published: true } }),
    prisma.contactRequest.count({ where: { status: 'UNREAD' } }),
    prisma.contactRequest.findMany({ take: 6, orderBy: { createdAt: 'desc' } })
  ]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Hadi Umreye Gidelim — yönetim merkezi</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" target="_blank"
            className="flex items-center gap-2 border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors">
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            Siteyi Gör
          </Link>
          <Link href="/admin/contact"
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1faf55] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">chat</span>
            WhatsApp Leadleri
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Bekleyen Lead", value: unreadLeads, icon: "mark_email_unread", color: "text-red-500", bg: "bg-red-50", href: "/admin/contact", urgent: unreadLeads > 0 },
          { label: "Aktif Paket",   value: totalPackages, icon: "inventory_2",       color: "text-blue-600", bg: "bg-blue-50",  href: "/admin/packages" },
          { label: "Yayındaki Blog", value: totalPosts,   icon: "article",           color: "text-emerald-600", bg: "bg-emerald-50", href: "/admin/content" },
        ].map(s => (
          <Link key={s.label} href={s.href}
            className={`bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow group ${s.urgent ? 'border-red-200' : 'border-slate-100'}`}>
            <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <span className={`material-symbols-outlined text-[24px] ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{s.label}</p>
              <p className={`text-3xl font-bold mt-0.5 ${s.urgent ? 'text-red-600' : 'text-slate-900'}`}>{s.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent leads */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-slate-400">inbox</span>
            Son İletişim Talepleri
          </h2>
          <Link href="/admin/contact" className="text-xs font-semibold text-[#003781] hover:underline flex items-center gap-1">
            Tümünü Gör <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-3 opacity-40">inbox</span>
            <p className="text-sm font-medium">Henüz form doldurulmamış</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentLeads.map((lead: any) => {
              let phone = lead.phone.replace(/[^0-9]/g, '');
              if (phone.startsWith('0')) phone = '9' + phone;
              if (!phone.startsWith('90')) phone = '90' + phone;
              const waUrl = `https://wa.me/${phone}?text=Merhaba ${lead.name.split(' ')[0]}, Hadi Umreye Gidelim'den ulaşıyoruz.`;
              const date = new Date(lead.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

              return (
                <div key={lead.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#003781]/10 text-[#003781] font-bold flex items-center justify-center shrink-0 text-sm">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{lead.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{lead.phone} · {date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    {lead.package && (
                      <span className="hidden md:block text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-lg max-w-[180px] truncate">
                        {lead.package}
                      </span>
                    )}
                    {lead.status === 'UNREAD' && (
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Okunmadı" />
                    )}
                    <a href={waUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#25D366]/10 text-[#1a9e50] hover:bg-[#25D366] hover:text-white border border-[#25D366]/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all">
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                      Yaz
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/admin/content",  icon: "edit_document",  label: "Yeni Blog",      color: "text-indigo-500" },
          { href: "/admin/packages", icon: "inventory_2",    label: "Yeni Paket",     color: "text-blue-500"   },
          { href: "/admin/ai-logs",  icon: "memory",         label: "AI İzleme",      color: "text-purple-500" },
          { href: "/admin/settings", icon: "settings",       label: "Site Ayarları",  color: "text-slate-500"  },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 hover:shadow-md hover:border-slate-200 transition-all group">
            <span className={`material-symbols-outlined text-[22px] ${item.color} group-hover:scale-110 transition-transform`}>{item.icon}</span>
            <span className="text-sm font-semibold text-slate-700">{item.label}</span>
          </Link>
        ))}
      </div>

    </div>
  );
}
