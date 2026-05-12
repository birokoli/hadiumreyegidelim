'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const statusLabel: Record<string, { label: string; color: string }> = {
  clicked:       { label: 'Linke Tıkladı',     color: 'bg-blue-50 text-blue-600' },
  contacted:     { label: 'Arandı',             color: 'bg-yellow-50 text-yellow-700' },
  in_discussion: { label: 'Görüşüyor',          color: 'bg-orange-50 text-orange-600' },
  contracted:    { label: 'Sözleşme İmzaladı',  color: 'bg-purple-50 text-purple-600' },
  paid:          { label: 'Ödeme Yaptı',         color: 'bg-green-50 text-green-600' },
  completed:     { label: 'Umre Tamamlandı',     color: 'bg-emerald-50 text-emerald-600' },
  cancelled:     { label: 'İptal',               color: 'bg-red-50 text-red-500' },
};

const tierLabel: Record<string, { label: string; color: string; icon: string }> = {
  eci:     { label: 'Elçi',    color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: 'military_tech' },
  rehber:  { label: 'Rehber',  color: 'bg-blue-50 text-blue-700 border-blue-200',       icon: 'verified' },
  davetci: { label: 'Davetçi', color: 'bg-gray-50 text-gray-600 border-gray-200',       icon: 'person' },
};

export default function InfluencerDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/influencer/dashboard')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#003781]/20 border-t-[#003781] rounded-full animate-spin" />
          <p className="text-[14px] text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.influencer) return null;

  const { influencer, stats, links, recentCustomers, freeUmreProgress } = data;
  const tier = tierLabel[influencer.tier] || tierLabel.davetci;
  const progressPct = Math.min((freeUmreProgress.current / freeUmreProgress.target) * 100, 100);
  const remaining = Math.max(freeUmreProgress.target - freeUmreProgress.current, 0);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900 tracking-tight">
            Merhaba, {influencer.fullName.split(' ')[0]} 👋
          </h1>
          <p className="text-[14px] text-gray-400 mt-0.5">Marketing panelinize hoş geldiniz</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border ${tier.color}`}>
          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{tier.icon}</span>
          {tier.label}
        </span>
      </div>

      {/* Pending banner */}
      {influencer.status === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-500 text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
          <div>
            <p className="text-[14px] font-semibold text-amber-800">Başvurunuz İnceleniyor</p>
            <p className="text-[13px] text-amber-600 mt-0.5">Onaylandığında linkleriniz ve komisyonlarınız aktif olacak.</p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Bu Ay Satış',    value: stats.monthlySales,                                     icon: 'shopping_bag',           color: 'text-[#003781]',  bg: 'bg-[#003781]/5' },
          { label: 'Toplam Kazanç', value: `₺${stats.totalEarnings.toLocaleString('tr-TR')}`,     icon: 'account_balance_wallet', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Bekleyen Ödeme', value: `₺${stats.pendingEarnings.toLocaleString('tr-TR')}`, icon: 'pending',                color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Bu Ay Tıklanma', value: stats.monthlyClicks,                                   icon: 'ads_click',              color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <span className={`material-symbols-outlined text-[22px] ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <p className="text-[12px] text-gray-400 font-medium">{s.label}</p>
            <p className="text-[22px] font-bold text-gray-900 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Ücretsiz Umre Progress */}
      <div className="bg-gradient-to-br from-[#003781] to-[#001f4d] rounded-2xl p-6 text-white shadow-lg shadow-[#003781]/20">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[13px] text-white/60 font-medium">Ücretsiz Umre Ödülü</p>
            <p className="text-[24px] font-bold mt-1">
              {freeUmreProgress.current} / {freeUmreProgress.target} <span className="text-[15px] font-normal text-white/60">satış</span>
            </p>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px] text-yellow-300" style={{ fontVariationSettings: "'FILL' 1" }}>mosque</span>
          </div>
        </div>
        <div className="bg-white/20 rounded-full h-2 mb-3 overflow-hidden">
          <div className="bg-yellow-300 h-2 rounded-full transition-all duration-1000" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="text-[13px] text-white/60">
          {remaining > 0 ? `${remaining} satış daha yaparsanız ücretsiz umre hakkı kazanırsınız 🕋` : '🎉 Tebrikler! Ücretsiz umre hakkı kazandınız!'}
        </p>
      </div>

      {/* Quick actions + Recent customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Quick link card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#003781]">link</span>
            Takip Linkim
          </h3>
          <div className="space-y-2 mb-4">
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-[11px] text-gray-400 mb-0.5">Link</p>
              <p className="text-[12px] font-medium text-gray-700 truncate">{links.trackingUrl}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-gray-400 mb-0.5">Kupon</p>
                <p className="text-[16px] font-black text-[#003781] tracking-widest">{links.couponCode}</p>
              </div>
              <button onClick={() => navigator.clipboard.writeText(links.couponCode)}
                className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-[12px] font-semibold px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-all">
                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                Kopyala
              </button>
            </div>
          </div>
          <Link href="/influencer/links"
            className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-[14px] hover:bg-gray-50 transition-all">
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Tüm Link Araçları
          </Link>
        </div>

        {/* Recent customers */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-[15px] font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#003781]">people</span>
            Son Müşteriler
          </h3>
          {recentCustomers.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-300">
              <span className="material-symbols-outlined text-4xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>person_search</span>
              <p className="text-[13px] text-gray-400">Henüz müşteri yok</p>
              <p className="text-[12px] text-gray-300 mt-0.5">Linkinizi paylaşın!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentCustomers.slice(0, 5).map((c: any) => {
                const s = statusLabel[c.status] || { label: c.status, color: 'bg-gray-50 text-gray-500' };
                return (
                  <div key={c.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#003781]/10 to-[#003781]/5 rounded-xl flex items-center justify-center">
                        <span className="text-[12px] font-bold text-[#003781]">{c.name[0]}</span>
                      </div>
                      <p className="text-[13px] font-medium text-gray-800">{c.name}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${s.color}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          )}
          <Link href="/influencer/customers"
            className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl text-[14px] hover:bg-gray-50 transition-all mt-4">
            Tüm Müşteriler
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
