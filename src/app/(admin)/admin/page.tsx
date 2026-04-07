export const dynamic = 'force-dynamic';

import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  // Veri Çekimi
  const [totalPackages, totalPosts, unreadLeads, recentLeads] = await Promise.all([
    prisma.package.count({ where: { published: true } }),
    prisma.post.count({ where: { published: true } }),
    prisma.contactRequest.count({ where: { status: 'UNREAD' } }),
    prisma.contactRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Karşılama Alanı */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-r from-primary to-[#002255] p-8 rounded-3xl shadow-xl text-white">
        <div>
          <span className="bg-white/20 text-white font-bold text-[10px] tracking-widest uppercase px-3 py-1 rounded-full border border-white/20 mb-4 inline-block">
            Sistem Durumu: Aktif
          </span>
          <h1 className="text-3xl md:text-5xl font-headline font-bold mb-3 tracking-tight">
            Şirket Özeti
          </h1>
          <p className="text-white/80 font-medium max-w-xl leading-relaxed">
            Hadi Umreye Gidelim platformunun anlık trafik, satış ve içerik verilerini bu panelden yönetebilirsiniz.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/contact" className="bg-[#25D366] hover:bg-[#1DA851] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center gap-2 tracking-wide">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg> WhatsApp'a Git
          </Link>
          <Link href="/bireysel-umre" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
            Siteyi Gör
          </Link>
        </div>
      </div>

      {/* İstatistik Widget'ları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-outline-variant/20 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-error/5 rounded-full transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center text-error border border-error/20">
              <span className="material-symbols-outlined">mark_email_unread</span>
            </div>
            <h3 className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Bekleyen WhatsApp Leadleri</h3>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-headline font-bold text-primary">{unreadLeads}</span>
            <span className="text-sm font-medium text-error">Yeni Form</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-outline-variant/20 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-secondary/5 rounded-full transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <h3 className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Yayındaki Lüks Paketler</h3>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-headline font-bold text-primary">{totalPackages}</span>
            <span className="text-sm font-medium text-secondary">Aktif Tur</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-outline-variant/20 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-tertiary-fixed-dim/10 rounded-full transition-transform group-hover:scale-110"></div>
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-tertiary-fixed-dim/20 flex items-center justify-center text-tertiary border border-tertiary-fixed-dim/30">
              <span className="material-symbols-outlined">article</span>
            </div>
            <h3 className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">SEO Blog & Makale</h3>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-5xl font-headline font-bold text-primary">{totalPosts}</span>
            <span className="text-sm font-medium text-tertiary">Yazı Yayında</span>
          </div>
        </div>
      </div>

      {/* Son Gelen Talepler Mini Tablosu */}
      <div className="bg-white rounded-[2rem] border border-outline-variant/20 shadow-sm p-8">
        <div className="flex justify-between items-center mb-8 border-b border-outline-variant/10 pb-6">
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-3">
             <span className="material-symbols-outlined text-secondary">recent_patient</span> Son İletişim Talepleri
          </h2>
          <Link href="/admin/contact" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-secondary flex items-center gap-1 transition-colors">
            Tümünü Gör <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
             Henüz iletişim formu doldurulmamış.
          </div>
        ) : (
          <div className="grid grid-cols-1 divide-y divide-outline-variant/10">
            {recentLeads.map((lead: any) => {
              const date = new Date(lead.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
              let cleanPhone = lead.phone.replace(/[^0-9]/g, '');
              if(cleanPhone.startsWith('0')) cleanPhone = '9' + cleanPhone;
              if(!cleanPhone.startsWith('90')) cleanPhone = '90' + cleanPhone;
              const waUrl = `https://wa.me/${cleanPhone}?text=Merhaba ${lead.name.split(' ')[0]} Bey/Hanım, Hadi Umreye Gidelim'den ulaşıyoruz...`;

              return (
                <div key={lead.id} className="py-4 flex items-center justify-between hover:bg-slate-50 -mx-4 px-4 rounded-xl transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0 border border-primary/20">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-primary">{lead.name}</p>
                      <p className="text-xs text-slate-500 font-mono tracking-wider">{lead.phone} • {date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {lead.package && (
                      <span className="hidden md:inline-block bg-surface-container text-xs font-bold px-3 py-1 rounded text-slate-600 border border-outline-variant/20 max-w-[200px] truncate">
                        {lead.package}
                      </span>
                    )}
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="bg-[#25D366]/10 text-[#00a884] hover:bg-[#25D366] hover:text-white border border-[#25D366]/20 font-bold p-2 rounded-lg transition-all" title="WhatsApp'tan Yaz">
                      <span className="material-symbols-outlined text-[20px]">chat</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
