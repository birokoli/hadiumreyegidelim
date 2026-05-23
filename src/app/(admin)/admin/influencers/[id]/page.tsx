export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdminInfluencerActions from '@/components/admin/AdminInfluencerActions';
import AdminInfluencerSalesPanel from '@/components/admin/AdminInfluencerSalesPanel';
import AdminInfluencerLoyaltyPanel from '@/components/admin/AdminInfluencerLoyaltyPanel';
import AdminInfluencerAffiliatePanel from '@/components/admin/AdminInfluencerAffiliatePanel';

const tierConfig: Record<string, { label: string; color: string }> = {
  eci:     { label: 'Elçi',    color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  rehber:  { label: 'Rehber',  color: 'bg-blue-50 text-blue-700 border-blue-200' },
  davetci: { label: 'Davetçi', color: 'bg-gray-50 text-gray-600 border-gray-200' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Bekliyor',   color: 'bg-amber-50 text-amber-700' },
  active:   { label: 'Aktif',      color: 'bg-green-50 text-green-700' },
  passive:  { label: 'Pasif',      color: 'bg-gray-50 text-gray-500' },
  rejected: { label: 'Reddedildi', color: 'bg-red-50 text-red-600' },
};

const shareStatusConfig: Record<string, { label: string; color: string }> = {
  pending:  { label: 'İnceleniyor', color: 'bg-yellow-50 text-yellow-700' },
  approved: { label: 'Onaylı',      color: 'bg-green-50 text-green-700' },
  rejected: { label: 'Reddedildi',  color: 'bg-red-50 text-red-600' },
};

const customerStatusConfig: Record<string, { label: string; color: string }> = {
  clicked:       { label: 'Tıkladı',         color: 'bg-blue-50 text-blue-600' },
  contacted:     { label: 'Arandı',           color: 'bg-yellow-50 text-yellow-700' },
  in_discussion: { label: 'Görüşüyor',        color: 'bg-orange-50 text-orange-600' },
  contracted:    { label: 'Sözleşme',         color: 'bg-purple-50 text-purple-600' },
  paid:          { label: 'Ödedi',            color: 'bg-green-50 text-green-700' },
  completed:     { label: 'Tamamlandı',       color: 'bg-emerald-50 text-emerald-700' },
  cancelled:     { label: 'İptal',            color: 'bg-red-50 text-red-500' },
};

export default async function AdminInfluencerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const inf = await prisma.influencer.findUnique({
    where: { id },
    include: {
      shares: { orderBy: { createdAt: 'desc' } },
      customers: { orderBy: { createdAt: 'desc' } },
      sales: { orderBy: { createdAt: 'desc' } },
      payments: { orderBy: { createdAt: 'desc' } },
      campaigns: { include: { campaign: true } },
      loyaltyAccount: {
        include: {
          redemptions: { orderBy: { requestedAt: 'desc' }, take: 20 },
        },
      },
      starLedgerEntries: { orderBy: { createdAt: 'desc' }, take: 30 },
      perfScores: { orderBy: { period: 'desc' }, take: 12 },
      referralsMade: { include: { invited: { select: { fullName: true, uniqueCode: true, status: true } } } },
      referralReceived: { include: { referrer: { select: { fullName: true, uniqueCode: true } } } },
    },
  });

  if (!inf) notFound();

  const tier = tierConfig[inf.tier] || tierConfig.davetci;
  const st = statusConfig[inf.status] || statusConfig.pending;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hadiumreyegidelim.com';

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Geri */}
      <Link href="/admin/influencers" className="inline-flex items-center gap-1.5 text-[13px] text-slate-500 hover:text-slate-800 font-medium transition-colors">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Influencer Listesine Dön
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#003781]/15 to-[#003781]/5 flex items-center justify-center text-2xl font-black text-[#003781]">
              {inf.fullName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{inf.fullName}</h1>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${tier.color}`}>{tier.label}</span>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
              </div>
              <p className="text-[13px] text-slate-400 mt-0.5">{inf.email} · {inf.phone}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {inf.instagramHandle && (
                  <span className="text-[12px] text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full font-medium">@{inf.instagramHandle} · {(inf.instagramFollowers || 0).toLocaleString('tr-TR')} takipçi</span>
                )}
                {inf.tiktokHandle && <span className="text-[12px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">TikTok: @{inf.tiktokHandle}</span>}
                {inf.youtubeHandle && <span className="text-[12px] bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-medium">YouTube: {inf.youtubeHandle}</span>}
              </div>
            </div>
          </div>
          <AdminInfluencerActions influencerId={inf.id} currentStatus={inf.status} currentTier={inf.tier} />
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-50">
          {[
            { label: 'Toplam Satış',    value: inf.totalSales,                                       icon: 'shopping_bag',           color: 'text-blue-600',    bg: 'bg-blue-50' },
            { label: 'Toplam Kazanç',   value: `₺${inf.totalEarnings.toLocaleString('tr-TR')}`,     icon: 'account_balance_wallet', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Bekleyen Ödeme',  value: `₺${inf.pendingEarnings.toLocaleString('tr-TR')}`,  icon: 'pending',               color: 'text-orange-500',  bg: 'bg-orange-50' },
            { label: 'Toplam Tıklanma', value: inf.totalClicks,                                      icon: 'ads_click',             color: 'text-purple-600',  bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <span className={`material-symbols-outlined text-[18px] ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">{s.label}</p>
                <p className="text-[16px] font-bold text-slate-900">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Link bilgileri */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-5 border-t border-slate-50">
          <div className="bg-slate-50 rounded-xl px-4 py-3">
            <p className="text-[11px] text-slate-400 mb-1">Takip Linki</p>
            <p className="text-[13px] font-medium text-slate-700 truncate">{baseUrl}/r/{inf.uniqueUrl}</p>
          </div>
          <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 mb-1">Kupon Kodu</p>
              <p className="text-[18px] font-black text-[#003781] tracking-widest">{inf.uniqueCode}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kampanyaları */}
      {inf.campaigns.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-slate-400" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
            <h2 className="font-semibold text-slate-900">Katıldığı Kampanyalar</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {inf.campaigns.map(p => (
              <div key={p.id} className="px-6 py-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-slate-900">{p.campaign.title}</p>
                  <p className="text-[12px] text-slate-400 mt-0.5">Katıldı: {new Date(p.joinedAt).toLocaleDateString('tr-TR')}</p>
                </div>
                <div className="text-center">
                  <p className="text-[18px] font-black text-[#003781] tracking-widest">{p.uniqueCode}</p>
                  <p className="text-[11px] text-slate-400">{p.usageCount} kullanım</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paylaşımlar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-slate-400">photo_camera</span>
            <h2 className="font-semibold text-slate-900">Paylaşımlar</h2>
          </div>
          <span className="text-[12px] text-slate-400">{inf.shares.length} paylaşım</span>
        </div>
        {inf.shares.length === 0 ? (
          <div className="py-10 text-center text-slate-300">
            <span className="material-symbols-outlined text-4xl">photo_camera</span>
            <p className="text-sm mt-2 text-slate-400">Henüz paylaşım yok</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {inf.shares.map(s => {
              const ss = shareStatusConfig[s.status] || shareStatusConfig.pending;
              return (
                <div key={s.id} className="px-6 py-3.5 flex items-center gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-slate-800 capitalize">{s.platform.replace('_', ' ')}</p>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ss.color}`}>{ss.label}</span>
                    </div>
                    <p className="text-[12px] text-slate-400 mt-0.5">{s.shareDate} · {s.clickCount} tıklanma · {s.saleCount} satış</p>
                    {s.shareUrl && <a href={s.shareUrl} target="_blank" className="text-[12px] text-[#003781] hover:underline">Paylaşımı Gör</a>}
                    {s.rejectReason && <p className="text-[12px] text-red-500 mt-0.5">Red: {s.rejectReason}</p>}
                  </div>
                  {s.status === 'pending' && (
                    <div className="flex gap-2">
                      <form action={`/api/admin/influencers/${inf.id}/shares`} method="POST">
                        <input type="hidden" name="shareId" value={s.id} />
                        <input type="hidden" name="action" value="approve" />
                        <button className="bg-green-600 hover:bg-green-700 text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all">Onayla</button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Satışlar */}
      <AdminInfluencerSalesPanel influencerId={inf.id} initialSales={inf.sales} />

      {/* Yıldız Hesabı */}
      <AdminInfluencerLoyaltyPanel
        influencerId={inf.id}
        loyaltyAccount={inf.loyaltyAccount}
        redemptions={inf.loyaltyAccount?.redemptions ?? []}
      />

      {/* Affiliate Paneli */}
      <AdminInfluencerAffiliatePanel
        influencerId={inf.id}
        programUnlocked={inf.programUnlocked}
        baseThrOverride={inf.baseThrOverride}
        starLedgerEntries={inf.starLedgerEntries}
        perfScores={inf.perfScores}
        referralsMade={inf.referralsMade}
        referralReceived={inf.referralReceived}
      />

      {/* Müşteriler */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-slate-400">people</span>
            <h2 className="font-semibold text-slate-900">Müşteriler</h2>
          </div>
          <span className="text-[12px] text-slate-400">{inf.customers.length} müşteri</span>
        </div>
        {inf.customers.length === 0 ? (
          <div className="py-10 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-200">person_search</span>
            <p className="text-sm mt-2 text-slate-400">Henüz müşteri yok</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {inf.customers.map(c => {
              const cs = customerStatusConfig[c.status] || customerStatusConfig.clicked;
              return (
                <div key={c.id} className="px-6 py-3.5 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-slate-800">{c.fullName}</p>
                    <p className="text-[12px] text-slate-400">{c.phone} {c.email ? `· ${c.email}` : ''}</p>
                    <p className="text-[12px] text-slate-400 mt-0.5">Kaynak: {c.source} · {new Date(c.createdAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${cs.color}`}>{cs.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
