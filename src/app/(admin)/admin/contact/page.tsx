export const dynamic = 'force-dynamic';

import React from 'react';
import { prisma } from '@/lib/prisma';

export default async function ContactLeadsPage() {
  const leads = await prisma.contactRequest.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary mb-2">İletişim Talepleri</h1>
          <p className="text-on-surface-variant font-medium">Siteden gelen iletişim formu doldurmaları ve WhatsApp potansiyel müşterileri.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-outline-variant/20 overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-16 text-center">
            <span className="material-symbols-outlined text-6xl text-outline mb-4">inbox</span>
            <h3 className="text-xl font-headline text-primary font-bold mb-2">Henüz Talep Yok</h3>
            <p className="text-on-surface-variant">İletişim formundan gelen kayıtlar burada listelenecektir.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/20">
                  <th className="p-5 font-bold text-xs uppercase tracking-widest text-primary">Tarih</th>
                  <th className="p-5 font-bold text-xs uppercase tracking-widest text-primary">Müşteri</th>
                  <th className="p-5 font-bold text-xs uppercase tracking-widest text-primary">Telefon</th>
                  <th className="p-5 font-bold text-xs uppercase tracking-widest text-primary">İlgilendiği Paket</th>
                  <th className="p-5 font-bold text-xs uppercase tracking-widest text-primary">Mesaj</th>
                  <th className="p-5 font-bold text-xs uppercase tracking-widest text-primary text-center">Durum</th>
                  <th className="p-5 font-bold text-xs uppercase tracking-widest text-primary text-right">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {leads.map((lead: any) => {
                  const date = new Date(lead.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                  
                  // WhatsApp format: +905551112233
                  let cleanPhone = lead.phone.replace(/[^0-9]/g, '');
                  if(cleanPhone.startsWith('0')) cleanPhone = '9' + cleanPhone;
                  if(!cleanPhone.startsWith('90')) cleanPhone = '90' + cleanPhone;

                  let waMessage = `Merhaba ${lead.name.split(' ')[0]} Bey/Hanım, Hadi Umreye Gidelim platformundan oluşturduğunuz talep üzerine size ulaşıyoruz.`;
                  if(lead.package) {
                     waMessage = `Merhaba ${lead.name.split(' ')[0]} Bey/Hanım, Hadi Umreye Gidelim platformundan oluşturduğunuz "${lead.package}" talebi üzerine size ulaşıyoruz. Yardımcı olmamı ister misiniz?`;
                  }
                  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;

                  return (
                    <tr key={lead.id} className="hover:bg-surface-container-lowest transition-colors group">
                      <td className="p-5 text-sm font-medium text-slate-500 whitespace-nowrap">{date}</td>
                      <td className="p-5 font-bold text-primary">{lead.name}</td>
                      <td className="p-5 text-sm font-mono text-secondary">{lead.phone}</td>
                      <td className="p-5">
                        {lead.package ? (
                          <span className="bg-primary/5 text-primary text-xs font-bold px-3 py-1 rounded border border-primary/10">
                            {lead.package}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">-</span>
                        )}
                      </td>
                      <td className="p-5 text-sm text-slate-600 max-w-[250px] truncate" title={lead.message || ''}>
                         {lead.message || '-'}
                      </td>
                      <td className="p-5 text-center">
                         <span className="bg-error/10 text-error text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Yeni</span>
                      </td>
                      <td className="p-5 text-right whitespace-nowrap">
                        <a 
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold text-[11px] uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-[#1DA851] active:scale-95 transition-all shadow-sm"
                        >
                          WhatsApp <span className="material-symbols-outlined text-[14px]">chat</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
