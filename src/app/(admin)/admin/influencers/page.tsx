export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import AdminInfluencerActions from '@/components/admin/AdminInfluencerActions';

const tierConfig: Record<string, { label: string; color: string }> = {
  eci:     { label: 'Elçi',    color: 'bg-[#b8862f]/10 text-[#b8862f] border-[#b8862f]/25' },
  rehber:  { label: 'Rehber',  color: 'bg-primary/[0.08] text-primary border-primary/20' },
  davetci: { label: 'Davetçi', color: 'bg-surface-container-low text-on-surface-variant border-outline-variant/25' },
};

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  pending:  { label: 'Bekliyor',  color: 'text-[#b8862f] bg-[#b8862f]/10',  dot: 'bg-[#b8862f]' },
  active:   { label: 'Aktif',     color: 'text-secondary bg-secondary/10',  dot: 'bg-secondary' },
  passive:  { label: 'Pasif',     color: 'text-on-surface-variant bg-surface-container-low',    dot: 'bg-outline-variant' },
  rejected: { label: 'Reddedildi', color: 'text-error bg-error/10',     dot: 'bg-error' },
};

export default async function AdminInfluencersPage() {
  const influencers = await prisma.influencer.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { shares: true, customers: true } } },
  });

  const pending = influencers.filter(i => i.status === 'pending');
  const active  = influencers.filter(i => i.status === 'active');

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-2xl font-bold text-primary">Influencer Yönetimi</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">Toplam {influencers.length} influencer · {pending.length} bekliyor · {active.length} aktif</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Bekleyen Başvuru', value: pending.length,  icon: 'schedule',       color: 'text-[#b8862f]',  bg: 'bg-[#b8862f]/10' },
          { label: 'Aktif',            value: active.length,   icon: 'check_circle',   color: 'text-secondary',  bg: 'bg-secondary/10' },
          { label: 'Toplam Satış',     value: influencers.reduce((a, i) => a + i.totalSales, 0), icon: 'shopping_bag', color: 'text-primary', bg: 'bg-primary/[0.08]' },
          { label: 'Bekleyen Ödeme',   value: `₺${influencers.reduce((a, i) => a + i.pendingEarnings, 0).toLocaleString('tr-TR')}`, icon: 'payments', color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-outline-variant/15 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <span className={`material-symbols-outlined text-[22px] ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant">{s.label}</p>
              <p className="text-2xl font-bold text-on-surface">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending başvurular */}
      {pending.length > 0 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-[#b8862f]/20 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#b8862f]/15 bg-[#b8862f]/[0.06] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#b8862f]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
            <h2 className="font-semibold text-on-surface">Onay Bekleyen Başvurular</h2>
            <span className="ml-auto bg-[#b8862f] text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {pending.map(inf => (
              <div key={inf.id} className="px-6 py-4 flex items-center gap-4 flex-wrap">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003781]/10 to-[#003781]/5 flex items-center justify-center shrink-0">
                  <span className="text-[13px] font-bold text-[#003781]">{inf.fullName[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-on-surface">{inf.fullName}</p>
                  <p className="text-[12px] text-outline">{inf.email} · {inf.phone}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {inf.instagramHandle && (
                      <span className="text-[11px] text-error bg-error/10 px-2 py-0.5 rounded-full font-medium">@{inf.instagramHandle} · {(inf.instagramFollowers || 0).toLocaleString("en-US")} takipçi</span>
                    )}
                    {inf.tiktokHandle && (
                      <span className="text-[11px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full font-medium">TikTok: @{inf.tiktokHandle}</span>
                    )}
                  </div>
                </div>
                <p className="text-[12px] text-outline shrink-0">{new Date(inf.createdAt).toLocaleDateString('tr-TR')}</p>
                <AdminInfluencerActions influencerId={inf.id} currentStatus={inf.status} currentTier={inf.tier} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All influencers table */}
      <div className="bg-white rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/15">
          <h2 className="font-semibold text-on-surface">Tüm Influencerlar</h2>
        </div>
        {influencers.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-outline">
            <span className="material-symbols-outlined text-5xl mb-3 opacity-40" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            <p className="text-sm font-medium">Henüz influencer yok</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-outline uppercase tracking-wide">İsim</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-outline uppercase tracking-wide">Katman</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-outline uppercase tracking-wide">Durum</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-outline uppercase tracking-wide">Satış</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-outline uppercase tracking-wide">Kazanç</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-outline uppercase tracking-wide">Tıklanma</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-outline uppercase tracking-wide">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {influencers.map(inf => {
                  const tier = tierConfig[inf.tier] || tierConfig.davetci;
                  const st = statusConfig[inf.status] || statusConfig.pending;
                  return (
                    <tr key={inf.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#003781]/10 to-[#003781]/5 flex items-center justify-center shrink-0">
                            <span className="text-[12px] font-bold text-[#003781]">{inf.fullName[0]}</span>
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-on-surface">{inf.fullName}</p>
                            <p className="text-[11px] text-outline">{inf.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${tier.color}`}>{tier.label}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${st.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-[13px] font-semibold text-on-surface">{inf.totalSales}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-[13px] font-semibold text-secondary">₺{inf.totalEarnings.toLocaleString('tr-TR')}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-[13px] text-on-surface-variant">{inf.totalClicks}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link href={`/admin/influencers/${inf.id}`}
                          className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#003781] hover:underline">
                          Detay
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
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
