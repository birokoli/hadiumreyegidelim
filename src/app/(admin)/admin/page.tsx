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
    prisma.contactRequest.findMany({ take: 6, orderBy: { createdAt: 'desc' } })
  ]);

  const conversionRate = totalLeads > 0 ? Math.round(((totalLeads - unreadLeads) / totalLeads) * 100) : 100;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 bg-white min-h-screen">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-zinc-900">Dashboard</h1>
          <p className="text-xs text-zinc-500 mt-1">Hadi Umreye Gidelim — Kurumsal Yönetim Merkezi</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/" target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded border border-zinc-200 text-zinc-900 hover:border-zinc-900 text-xs font-medium transition-colors">
            <span>Siteyi Gör</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </Link>
          <Link href="/admin/contact"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition-colors">
            <span className="material-symbols-outlined text-[16px]">chat</span>
            <span>WhatsApp Leadleri ({unreadLeads})</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards - Swiss Minimalist Precision */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Bekleyen Leadler",
            value: unreadLeads,
            subText: unreadLeads > 0 ? "İnceleme bekliyor" : "Tüm talepler okundu",
            badge: "AKSIYON GEREKLI",
            urgent: unreadLeads > 0,
            href: "/admin/contact"
          },
          {
            label: "Dönüşüm Oranı",
            value: `%${conversionRate}`,
            subText: `${totalLeads - unreadLeads} / ${totalLeads} Talep işlendi`,
            badge: "CANLI RISK",
            href: "/admin/crm"
          },
          {
            label: "Yayındaki Paketler",
            value: totalPackages,
            subText: "Aktif Umre Paketleri",
            badge: "LÜKS KATEGORI",
            href: "/admin/packages"
          },
          {
            label: "Blog & İçerikler",
            value: totalPosts,
            subText: "Yayınlanan Makaleler",
            badge: "SEO AKTIF",
            href: "/admin/content"
          },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`p-5 rounded border bg-zinc-50/50 hover:bg-white hover:border-zinc-900 transition-all flex flex-col justify-between ${
              s.urgent ? 'border-zinc-900' : 'border-zinc-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">{s.badge}</span>
              <span className="material-symbols-outlined text-zinc-400 text-[18px]">arrow_forward</span>
            </div>

            <div>
              <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
              <p className="text-3xl font-light text-zinc-900 tracking-tight mt-1">{s.value}</p>
              <p className="text-[11px] text-zinc-400 mt-1">{s.subText}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Leads Table */}
      <div className="border border-zinc-200 rounded overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <h2 className="text-sm font-semibold text-zinc-900">Son İletişim & Fiyat Talepleri</h2>
          <Link href="/admin/contact" className="text-xs text-zinc-600 hover:text-zinc-900 font-medium flex items-center gap-1">
            <span>Tümünü Gör</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 text-xs font-medium">
            Henüz doldurulmuş bir form bulunmuyor.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {recentLeads.map((lead: any) => {
              let phone = lead.phone.replace(/[^0-9]/g, '');
              if (phone.startsWith('0')) phone = '9' + phone;
              if (!phone.startsWith('90')) phone = '90' + phone;
              const waUrl = `https://wa.me/${phone}?text=Merhaba ${lead.name.split(' ')[0]}, Hadi Umreye Gidelim'den ulaşıyoruz.`;
              const date = new Date(lead.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

              return (
                <div key={lead.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-zinc-900 truncate">{lead.name}</p>
                        {lead.status === 'UNREAD' && (
                          <span className="text-[9px] font-bold bg-zinc-900 text-white px-1.5 py-0.2 rounded">OKUNMADI</span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{lead.phone} · {date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {lead.package && (
                      <span className="hidden sm:block text-[11px] font-medium text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded max-w-[180px] truncate">
                        {lead.package}
                      </span>
                    )}

                    <a href={waUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-medium transition-colors">
                      <span className="material-symbols-outlined text-[14px]">chat</span>
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/admin/crm", icon: "view_kanban", label: "CRM Komuta", desc: "Tüm talepleri yönet" },
          { href: "/admin/fiyat-teklifleri/hesaplayici", icon: "calculate", label: "Fiyat Motoru", desc: "Excel otomasyonu" },
          { href: "/admin/content", icon: "edit_document", label: "Yeni Blog", desc: "İçerik yazarı" },
          { href: "/admin/ai-logs", icon: "memory", label: "AI İzleme", desc: "Bot hareketleri" },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="p-4 rounded border border-zinc-200 bg-white hover:border-zinc-900 transition-colors flex items-center gap-3 group">
            <span className="material-symbols-outlined text-zinc-400 group-hover:text-zinc-900 transition-colors text-[22px]">{item.icon}</span>
            <div>
              <span className="text-xs font-semibold text-zinc-900 block">{item.label}</span>
              <span className="text-[10px] text-zinc-400 block">{item.desc}</span>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
