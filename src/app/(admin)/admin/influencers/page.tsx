export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import AdminInfluencerActions from '@/components/admin/AdminInfluencerActions';

const tierConfig: Record<string, { label: string; color: string }> = {
  eci:     { label: 'Elçi',    color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  rehber:  { label: 'Rehber',  color: 'bg-blue-50 text-blue-700 border-blue-200' },
  davetci: { label: 'Davetçi', color: 'bg-gray-50 text-gray-600 border-gray-200' },
};

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  pending:  { label: 'Bekliyor',  color: 'text-amber-700 bg-amber-50',  dot: 'bg-amber-400' },
  active:   { label: 'Aktif',     color: 'text-green-700 bg-green-50',  dot: 'bg-green-500' },
  passive:  { label: 'Pasif',     color: 'text-gray-500 bg-gray-50',    dot: 'bg-gray-400' },
  rejected: { label: 'Reddedildi', color: 'text-red-600 bg-red-50',     dot: 'bg-red-500' },
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
          <h1 className="text-2xl font-bold text-slate-900">Influencer Yönetimi</h1>
          <p className="text-sm text-slate-500 mt-0.5">Toplam {influencers.length} influencer · {pending.length} bekliyor · {active.length} aktif</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Bekleyen Başvuru', value: pending.length,  icon: 'schedule',       color: 'text-amber-500',  bg: 'bg-amber-50' },
          { label: 'Aktif',            value: active.length,   icon: 'check_circle',   color: 'text-green-600',  bg: 'bg-green-50' },
          { label: 'Toplam Satış',     value: influencers.reduce((a, i) => a + i.totalSales, 0), icon: 'shopping_bag', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Bekleyen Ödeme',   value: `₺${influencers.reduce((a, i) => a + i.pendingEarnings, 0).toLocaleString('tr-TR')}`, icon: 'payments', color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <span className={`material-symbols-outlined text-[22px] ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pending başvurular */}
      {pending.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-50 bg-amber-50/50 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
            <h2 className="font-semibold text-slate-900">Onay Bekleyen Başvurular</h2>
            <span className="ml-auto bg-amber-400 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
          </div>
          <div className="divide-y divide-slate-50">
            {pending.map(inf => (
              <div key={inf.id} className="px-6 py-4 flex items-center gap-4 flex-wrap">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003781]/10 to-[#003781]/5 flex items-center justify-center shrink-0">
                  <span className="text-[13px] font-bold text-[#003781]">{inf.fullName[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-slate-900">{inf.fullName}</p>
                  <p className="text-[12px] text-slate-400">{inf.email} · {inf.phone}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {inf.instagramHandle && (
                      <span className="text-[11px] text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full font-medium">@{inf.instagramHandle} · {(inf.instagramFollowers || 0).toLocaleString()} takipçi</span>
                    )}
                    {inf.tiktokHandle && (
                      <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full font-medium">TikTok: @{inf.tiktokHandle}</span>
                    )}
                  </div>
                </div>
                <p className="text-[12px] text-slate-400 shrink-0">{new Date(inf.createdAt).toLocaleDateString('tr-TR')}</p>
                <AdminInfluencerActions influencerId={inf.id} currentStatus={inf.status} currentTier={inf.tier} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All influencers table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Tüm Influencerlar</h2>
        </div>
        {influencers.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-3 opacity-40" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            <p className="text-sm font-medium">Henüz influencer yok</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">İsim</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Katman</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Durum</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Satış</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Kazanç</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Tıklanma</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wide">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {influencers.map(inf => {
                  const tier = tierConfig[inf.tier] || tierConfig.davetci;
                  const st = statusConfig[inf.status] || statusConfig.pending;
                  return (
                    <tr key={inf.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#003781]/10 to-[#003781]/5 flex items-center justify-center shrink-0">
                            <span className="text-[12px] font-bold text-[#003781]">{inf.fullName[0]}</span>
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-slate-900">{inf.fullName}</p>
                            <p className="text-[11px] text-slate-400">{inf.email}</p>
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
                        <span className="text-[13px] font-semibold text-slate-900">{inf.totalSales}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-[13px] font-semibold text-emerald-600">₺{inf.totalEarnings.toLocaleString('tr-TR')}</span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-[13px] text-slate-600">{inf.totalClicks}</span>
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
