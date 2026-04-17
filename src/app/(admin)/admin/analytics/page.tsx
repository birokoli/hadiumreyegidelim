export const dynamic = 'force-dynamic';

import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

function StatCard({ label, value, icon, color, bg, sub }: any) {
  return (
    <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        <span className={`material-symbols-outlined text-[24px] ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalOrders, totalLeads, totalPosts, totalPackages,
    totalGuides, totalAuthors,
    recentOrders, recentLeads,
    unreadLeads, contactedLeads, resolvedLeads,
    publishedPosts, draftPosts,
    activePkgs, popularPkgs,
    aiLogs, recentAiLogs,
    weeklyLeads, monthlyLeads,
    weeklyPosts, monthlyPosts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.contactRequest.count(),
    prisma.post.count(),
    prisma.package.count(),
    prisma.guide.count(),
    prisma.author.count(),
    prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.contactRequest.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.contactRequest.count({ where: { status: 'UNREAD' } }),
    prisma.contactRequest.count({ where: { status: 'CONTACTED' } }),
    prisma.contactRequest.count({ where: { status: 'RESOLVED' } }),
    prisma.post.count({ where: { published: true } }),
    prisma.post.count({ where: { published: false } }),
    prisma.package.count({ where: { published: true } }),
    prisma.package.count({ where: { isPopular: true } }),
    prisma.aILog.count({ where: { status: 'COMPLETED' } }),
    prisma.aILog.findMany({ take: 8, orderBy: { createdAt: 'desc' } }),
    prisma.contactRequest.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.contactRequest.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.post.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.post.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
  ]);

  const leadConversionRate = totalLeads > 0
    ? Math.round((resolvedLeads / totalLeads) * 100)
    : 0;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary block mb-1">Canlı Veri</span>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Gerçek zamanlı platform metrikleri · Son güncelleme: {new Date().toLocaleString('tr-TR')}</p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard label="Toplam Lead" value={totalLeads} icon="inbox" color="text-blue-600" bg="bg-blue-50" sub={`+${monthlyLeads} bu ay`} />
        <StatCard label="Toplam Sipariş" value={totalOrders} icon="shopping_bag" color="text-indigo-600" bg="bg-indigo-50" sub={`+${recentOrders} bu ay`} />
        <StatCard label="Yayındaki Blog" value={publishedPosts} icon="article" color="text-emerald-600" bg="bg-emerald-50" sub={`${draftPosts} taslak`} />
        <StatCard label="Aktif Paket" value={activePkgs} icon="inventory_2" color="text-amber-600" bg="bg-amber-50" sub={`${popularPkgs} popüler`} />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Lead funnel */}
        <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/10">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-slate-400">funnel</span>
              Lead Hunisi
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: "Yeni (Okunmamış)", value: unreadLeads, total: totalLeads, color: "bg-red-500" },
              { label: "Ulaşıldı", value: contactedLeads, total: totalLeads, color: "bg-amber-500" },
              { label: "Çözüldü / Dönüşüm", value: resolvedLeads, total: totalLeads, color: "bg-green-500" },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{item.label}</span>
                  <span className="font-bold text-slate-900">{item.value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%' }} />
                </div>
              </div>
            ))}
            <div className="pt-3 border-t border-outline-variant/10 flex justify-between items-center">
              <span className="text-sm text-slate-500">Dönüşüm Oranı</span>
              <span className="text-lg font-bold text-green-600">%{leadConversionRate}</span>
            </div>
          </div>
        </div>

        {/* Content metrics */}
        <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/10">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-slate-400">bar_chart</span>
              Aktivite (Hafta / Ay)
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Yeni Lead (7 gün)", value: weeklyLeads, icon: "person_add", color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Yeni Lead (30 gün)", value: monthlyLeads, icon: "groups", color: "text-blue-400", bg: "bg-blue-50" },
                { label: "Yeni Blog (7 gün)", value: weeklyPosts, icon: "edit_note", color: "text-emerald-600", bg: "bg-emerald-50" },
                { label: "Yeni Blog (30 gün)", value: monthlyPosts, icon: "menu_book", color: "text-emerald-400", bg: "bg-emerald-50" },
              ].map(m => (
                <div key={m.label} className={`${m.bg} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`material-symbols-outlined text-[18px] ${m.color}`}>{m.icon}</span>
                    <span className="text-xs font-medium text-slate-600">{m.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{m.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-outline-variant/10 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-purple-600">{aiLogs}</p>
                <p className="text-xs text-slate-500 mt-0.5">AI Blog Üretimi</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-700">{totalGuides}</p>
                <p className="text-xs text-slate-500 mt-0.5">Aktif Rehber</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-700">{totalAuthors}</p>
                <p className="text-xs text-slate-500 mt-0.5">Yazar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Activity log */}
      <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-purple-500">smart_toy</span>
            AI Blog Aktivite
          </h2>
          <Link href="/admin/ai-logs" className="text-xs font-semibold text-primary hover:underline">Tümünü Gör →</Link>
        </div>
        {recentAiLogs.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-sm">Henüz AI aktivitesi yok</div>
        ) : (
          <div className="divide-y divide-outline-variant/5">
            {recentAiLogs.map((log: any) => {
              const statusMap: Record<string, { color: string; label: string }> = {
                COMPLETED: { color: "bg-green-100 text-green-700", label: "Tamamlandı" },
                FAILED:    { color: "bg-red-100 text-red-700",   label: "Başarısız"  },
                WRITING_CONTENT:   { color: "bg-blue-100 text-blue-700",   label: "Yazıyor" },
                GENERATING_IMAGES: { color: "bg-purple-100 text-purple-700", label: "Görsel" },
              };
              const s = statusMap[log.status] ?? { color: "bg-slate-100 text-slate-600", label: log.status };
              return (
                <div key={log.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-800 truncate max-w-sm">{log.topic || 'Konu belirsiz'}</p>
                    <p className="text-xs text-slate-400">{new Date(log.createdAt).toLocaleString('tr-TR')}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${s.color}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/admin/contact",  icon: "inbox",         label: "Leadlere Git",   color: "text-blue-500"   },
          { href: "/admin/content",  icon: "edit_document", label: "Blog Yaz",        color: "text-emerald-500" },
          { href: "/admin/ai-logs",  icon: "smart_toy",     label: "AI İzle",         color: "text-purple-500" },
          { href: "/admin/packages", icon: "inventory_2",   label: "Paketler",        color: "text-amber-500"  },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-all">
            <span className={`material-symbols-outlined text-[22px] ${item.color}`}>{item.icon}</span>
            <span className="text-sm font-semibold text-slate-700">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
