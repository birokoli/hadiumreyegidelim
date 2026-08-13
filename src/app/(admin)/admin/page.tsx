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

  const accentClasses: Record<string, { border: string; text: string; iconBg: string }> = {
    error:     { border: 'border-error/30 hover:border-error',       text: 'text-error',     iconBg: 'bg-error/10' },
    primary:   { border: 'border-outline-variant/15 hover:border-primary/40',  text: 'text-primary',   iconBg: 'bg-primary/10' },
    gold:      { border: 'border-outline-variant/15 hover:border-[#b8862f]/50', text: 'text-[#b8862f]', iconBg: 'bg-[#b8862f]/10' },
    secondary: { border: 'border-outline-variant/15 hover:border-secondary/40', text: 'text-secondary', iconBg: 'bg-secondary/10' },
  };

  const stats = [
    {
      label: "Bekleyen Leadler",
      value: unreadLeads,
      subText: unreadLeads > 0 ? "İnceleme bekliyor" : "Tüm talepler okundu",
      badge: "AKSİYON GEREKLİ",
      accent: unreadLeads > 0 ? "error" : "primary",
      icon: "priority_high",
      href: "/admin/contact"
    },
    {
      label: "Dönüşüm Oranı",
      value: `%${conversionRate}`,
      subText: `${totalLeads - unreadLeads} / ${totalLeads} Talep işlendi`,
      badge: "CANLI TAKİP",
      accent: "primary",
      icon: "trending_up",
      href: "/admin/crm"
    },
    {
      label: "Yayındaki Paketler",
      value: totalPackages,
      subText: "Aktif Umre Paketleri",
      badge: "LÜKS KATEGORİ",
      accent: "gold",
      icon: "inventory_2",
      href: "/admin/packages"
    },
    {
      label: "Blog & İçerikler",
      value: totalPosts,
      subText: "Yayınlanan Makaleler",
      badge: "SEO AKTİF",
      accent: "secondary",
      icon: "article",
      href: "/admin/content"
    },
  ] as const;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 bg-surface min-h-screen">

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/15">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-primary">Dashboard</h1>
          <p className="text-xs text-on-surface-variant mt-1.5">Hadi Umreye Gidelim — Kurumsal Yönetim Merkezi</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/" target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-outline-variant/25 text-primary hover:border-primary text-xs font-bold transition-all active:scale-95">
            <span>Siteyi Gör</span>
            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
          </Link>
          <Link href="/admin/contact"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all active:scale-95 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">chat</span>
            <span>WhatsApp Leadleri ({unreadLeads})</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const accent = accentClasses[s.accent];
          return (
            <Link
              key={s.label}
              href={s.href}
              className={`p-5 rounded-2xl border bg-surface-container-lowest hover:shadow-[0_8px_24px_-12px_rgba(0,55,129,0.18)] transition-all flex flex-col justify-between ${accent.border}`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-bold tracking-widest uppercase ${accent.text}`}>{s.badge}</span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center ${accent.iconBg}`}>
                  <span className={`material-symbols-outlined text-[16px] ${accent.text}`}>{s.icon}</span>
                </span>
              </div>

              <div>
                <p className="text-xs text-on-surface-variant font-medium">{s.label}</p>
                <p className="font-headline text-3xl font-bold text-on-surface tracking-tight mt-1">{s.value}</p>
                <p className="text-[11px] text-outline mt-1">{s.subText}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Leads Table */}
      <div className="border border-outline-variant/15 rounded-2xl overflow-hidden bg-surface-container-lowest">
        <div className="px-6 py-4 border-b border-outline-variant/15 flex items-center justify-between bg-surface-container-low">
          <h2 className="text-sm font-bold text-on-surface">Son İletişim & Fiyat Talepleri</h2>
          <Link href="/admin/contact" className="text-xs text-primary hover:text-primary-container font-bold flex items-center gap-1">
            <span>Tümünü Gör</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="py-16 text-center text-outline text-xs font-medium">
            Henüz doldurulmuş bir form bulunmuyor.
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {recentLeads.map((lead: any) => {
              let phone = lead.phone.replace(/[^0-9]/g, '');
              if (phone.startsWith('0')) phone = '9' + phone;
              if (!phone.startsWith('90')) phone = '90' + phone;
              const waUrl = `https://wa.me/${phone}?text=Merhaba ${lead.name.split(' ')[0]}, Hadi Umreye Gidelim'den ulaşıyoruz.`;
              const date = new Date(lead.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

              return (
                <div key={lead.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-primary/[0.03] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary text-white font-bold text-xs flex items-center justify-center shrink-0 font-headline">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-on-surface truncate">{lead.name}</p>
                        {lead.status === 'UNREAD' && (
                          <span className="text-[9px] font-bold bg-error text-white px-1.5 py-0.5 rounded-full">OKUNMADI</span>
                        )}
                      </div>
                      <p className="text-[11px] text-outline font-mono mt-0.5">{lead.phone} · {date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {lead.package && (
                      <span className="hidden sm:block text-[11px] font-bold text-primary bg-primary/[0.08] px-2.5 py-1 rounded-full max-w-[180px] truncate">
                        {lead.package}
                      </span>
                    )}

                    <a href={waUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#25D366] text-white hover:bg-[#1fb958] text-xs font-bold transition-all active:scale-95">
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
            className="p-4 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest hover:border-primary/40 hover:shadow-sm transition-all flex items-center gap-3 group">
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[22px]">{item.icon}</span>
            <div>
              <span className="text-xs font-bold text-on-surface block">{item.label}</span>
              <span className="text-[10px] text-outline block">{item.desc}</span>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}
