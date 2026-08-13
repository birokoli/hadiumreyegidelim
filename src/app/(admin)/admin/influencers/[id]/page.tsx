export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AdminInfluencerActions from '@/components/admin/AdminInfluencerActions';
import AdminInfluencerSalesPanel from '@/components/admin/AdminInfluencerSalesPanel';
import AdminInfluencerLoyaltyPanel from '@/components/admin/AdminInfluencerLoyaltyPanel';
import AdminInfluencerAffiliatePanel from '@/components/admin/AdminInfluencerAffiliatePanel';

const tierConfig: Record<string, { label: string; color: string }> = {
  eci:     { label: 'Elçi',    color: 'bg-[#b8862f]/10 text-[#b8862f] border-[#b8862f]/25' },
  rehber:  { label: 'Rehber',  color: 'bg-primary/[0.08] text-primary border-primary/20' },
  davetci: { label: 'Davetçi', color: 'bg-surface-container-low text-on-surface-variant border-outline-variant/25' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Bekliyor',   color: 'bg-[#b8862f]/10 text-[#b8862f]' },
  active:   { label: 'Aktif',      color: 'bg-secondary/10 text-secondary' },
  passive:  { label: 'Pasif',      color: 'bg-surface-container-low text-on-surface-variant' },
  rejected: { label: 'Reddedildi', color: 'bg-error/10 text-error' },
};

const shareStatusConfig: Record<string, { label: string; color: string }> = {
  pending:  { label: 'İnceleniyor', color: 'bg-[#b8862f]/10 text-[#b8862f]' },
  approved: { label: 'Onaylı',      color: 'bg-secondary/10 text-secondary' },
  rejected: { label: 'Reddedildi',  color: 'bg-error/10 text-error' },
};

const customerStatusConfig: Record<string, { label: string; color: string }> = {
  clicked:       { label: 'Tıkladı',         color: 'bg-primary/[0.08] text-primary' },
  contacted:     { label: 'Arandı',           color: 'bg-[#b8862f]/10 text-[#b8862f]' },
  in_discussion: { label: 'Görüşüyor',        color: 'bg-orange-50 text-orange-600' },
  contracted:    { label: 'Sözleşme',         color: 'bg-purple-50 text-purple-600' },
  paid:          { label: 'Ödedi',            color: 'bg-secondary/10 text-secondary' },
  completed:     { label: 'Tamamlandı',       color: 'bg-secondary/10 text-secondary' },
  cancelled:     { label: 'İptal',            color: 'bg-error/10 text-error' },
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
      <Link href="/admin/influencers" className="inline-flex items-center gap-1.5 text-[13px] text-on-surface-variant hover:text-on-surface font-medium transition-colors">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Influencer Listesine Dön
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-outline-variant/15 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#003781]/15 to-[#003781]/5 flex items-center justify-center text-2xl font-black text-[#003781]">
              {inf.fullName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-headline text-xl font-bold text-primary">{inf.fullName}</h1>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${tier.color}`}>{tier.label}</span>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
              </div>
              <p className="text-[13px] text-outline mt-0.5">{inf.email} · {inf.phone}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {inf.instagramHandle && (
                  <span className="text-[12px] text-error bg-error/10 px-2.5 py-1 rounded-full font-medium">@{inf.instagramHandle} · {(inf.instagramFollowers || 0).toLocaleString('tr-TR')} takipçi</span>
                )}
                {inf.tiktokHandle && <span className="text-[12px] bg-surface-container text-on-surface-variant px-2.5 py-1 rounded-full font-medium">TikTok: @{inf.tiktokHandle}</span>}
                {inf.youtubeHandle && <span className="text-[12px] bg-error/10 text-error px-2.5 py-1 rounded-full font-medium">YouTube: {inf.youtubeHandle}</span>}
              </div>
            </div>
          </div>
          <AdminInfluencerActions influencerId={inf.id} currentStatus={inf.status} currentTier={inf.tier} />
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-outline-variant/10">
          {[
            { label: 'Toplam Satış',    value: inf.totalSales,                                       icon: 'shopping_bag',           color: 'text-primary',    bg: 'bg-primary/[0.08]' },
            { label: 'Toplam Kazanç',   value: `₺${inf.totalEarnings.toLocaleString('tr-TR')}`,     icon: 'account_balance_wallet', color: 'text-secondary', bg: 'bg-secondary/10' },
            { label: 'Bekleyen Ödeme',  value: `₺${inf.pendingEarnings.toLocaleString('tr-TR')}`,  icon: 'pending',               color: 'text-orange-500',  bg: 'bg-orange-50' },
            { label: 'Toplam Tıklanma', value: inf.totalClicks,                                      icon: 'ads_click',             color: 'text-purple-600',  bg: 'bg-purple-50' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center shrink-0`}>
                <span className={`material-symbols-outlined text-[18px] ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
              </div>
              <div>
                <p className="text-[11px] text-outline font-medium">{s.label}</p>
                <p className="text-[16px] font-bold text-on-surface">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Link bilgileri */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-5 border-t border-outline-variant/10">
          <div className="bg-surface-container-low rounded-xl px-4 py-3">
            <p className="text-[11px] text-outline mb-1">Takip Linki</p>
            <p className="text-[13px] font-medium text-on-surface truncate">{baseUrl}/r/{inf.uniqueUrl}</p>
          </div>
          <div className="bg-surface-container-low rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-outline mb-1">Kupon Kodu</p>
              <p className="text-[18px] font-black text-[#003781] tracking-widest">{inf.uniqueCode}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Kampanyaları */}
      {inf.campaigns.length > 0 && (
        <div className="bg-white rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-outline" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
            <h2 className="font-semibold text-on-surface">Katıldığı Kampanyalar</h2>
          </div>
          <div className="divide-y divide-outline-variant/10">
            {inf.campaigns.map(p => (
              <div key={p.id} className="px-6 py-4 flex items-center gap-4 flex-wrap">
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-on-surface">{p.campaign.title}</p>
                  <p className="text-[12px] text-outline mt-0.5">Katıldı: {new Date(p.joinedAt).toLocaleDateString('tr-TR')}</p>
                </div>
                <div className="text-center">
                  <p className="text-[18px] font-black text-[#003781] tracking-widest">{p.uniqueCode}</p>
                  <p className="text-[11px] text-outline">{p.usageCount} kullanım</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paylaşımlar */}
      <div className="bg-white rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-outline">photo_camera</span>
            <h2 className="font-semibold text-on-surface">Paylaşımlar</h2>
          </div>
          <span className="text-[12px] text-outline">{inf.shares.length} paylaşım</span>
        </div>
        {inf.shares.length === 0 ? (
          <div className="py-10 text-center text-outline-variant">
            <span className="material-symbols-outlined text-4xl">photo_camera</span>
            <p className="text-sm mt-2 text-outline">Henüz paylaşım yok</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {inf.shares.map(s => {
              const ss = shareStatusConfig[s.status] || shareStatusConfig.pending;
              return (
                <div key={s.id} className="px-6 py-3.5 flex items-center gap-4 flex-wrap">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-on-surface capitalize">{s.platform.replace('_', ' ')}</p>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ss.color}`}>{ss.label}</span>
                    </div>
                    <p className="text-[12px] text-outline mt-0.5">{s.shareDate} · {s.clickCount} tıklanma · {s.saleCount} satış</p>
                    {s.shareUrl && <a href={s.shareUrl} target="_blank" className="text-[12px] text-[#003781] hover:underline">Paylaşımı Gör</a>}
                    {s.rejectReason && <p className="text-[12px] text-error mt-0.5">Red: {s.rejectReason}</p>}
                  </div>
                  {s.status === 'pending' && (
                    <div className="flex gap-2">
                      <form action={`/api/admin/influencers/${inf.id}/shares`} method="POST">
                        <input type="hidden" name="shareId" value={s.id} />
                        <input type="hidden" name="action" value="approve" />
                        <button className="bg-secondary hover:bg-secondary/85 text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all">Onayla</button>
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
      <div className="bg-white rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-outline">people</span>
            <h2 className="font-semibold text-on-surface">Müşteriler</h2>
          </div>
          <span className="text-[12px] text-outline">{inf.customers.length} müşteri</span>
        </div>
        {inf.customers.length === 0 ? (
          <div className="py-10 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-200">person_search</span>
            <p className="text-sm mt-2 text-outline">Henüz müşteri yok</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/10">
            {inf.customers.map(c => {
              const cs = customerStatusConfig[c.status] || customerStatusConfig.clicked;
              return (
                <div key={c.id} className="px-6 py-3.5 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-on-surface">{c.fullName}</p>
                    <p className="text-[12px] text-outline">{c.phone} {c.email ? `· ${c.email}` : ''}</p>
                    <p className="text-[12px] text-outline mt-0.5">Kaynak: {c.source} · {new Date(c.createdAt).toLocaleDateString('tr-TR')}</p>
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
