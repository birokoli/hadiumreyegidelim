'use client';

import { useState } from 'react';

const TIER_LABELS: Record<string, string> = {
  baslangic: 'Başlangıç',
  hizli: 'Hızlı',
  uretken: 'Üretken',
  sampiyon: 'Şampiyon',
  yolcu: 'Yolcu',
  haci_adayi: 'Hacı Adayı',
  haci: 'Hacı',
  veli: 'Veli',
};

const REDEMPTION_TYPE_LABELS: Record<string, string> = {
  cash: 'Nakit Çekim',
  free_umrah: 'Ücretsiz Umre',
  hybrid_umrah: 'Karma Umre',
  gift_item: 'Hediye',
  customer_discount: 'Müşteri İndirimi',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Bekliyor',    color: 'bg-amber-50 text-amber-700' },
  approved:  { label: 'Onaylandı',   color: 'bg-blue-50 text-blue-700' },
  completed: { label: 'Tamamlandı',  color: 'bg-green-50 text-green-700' },
  rejected:  { label: 'Reddedildi',  color: 'bg-red-50 text-red-600' },
  cancelled: { label: 'İptal',       color: 'bg-gray-50 text-gray-500' },
};

export default function AdminInfluencerLoyaltyPanel({
  influencerId,
  loyaltyAccount,
  redemptions,
}: {
  influencerId: string;
  loyaltyAccount: any;
  redemptions: any[];
}) {
  const [adjustForm, setAdjustForm] = useState({ points: '', reason: '' });
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustMsg, setAdjustMsg] = useState('');
  const [redemptionList, setRedemptionList] = useState(redemptions);
  const [actionLoading, setActionLoading] = useState('');

  async function handleAdjust() {
    setAdjustLoading(true);
    setAdjustMsg('');
    const res = await fetch('/api/admin/loyalty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        influencerId,
        pointsAmount: Number(adjustForm.points),
        reason: adjustForm.reason,
      }),
    });
    const json = await res.json();
    if (json.error) setAdjustMsg(json.error);
    else {
      setAdjustMsg(`${Number(adjustForm.points) > 0 ? '+' : ''}${adjustForm.points} puan uygulandı.`);
      setAdjustForm({ points: '', reason: '' });
    }
    setAdjustLoading(false);
  }

  async function handleRedemption(redemptionId: string, action: 'approve' | 'reject', reason?: string) {
    setActionLoading(redemptionId + action);
    const res = await fetch(`/api/admin/loyalty/redemptions/${redemptionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason }),
    });
    const json = await res.json();
    if (json.success) {
      setRedemptionList(redemptionList.map(r =>
        r.id === redemptionId ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r
      ));
    }
    setActionLoading('');
  }

  if (!loyaltyAccount) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[20px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          <h2 className="font-semibold text-slate-900">Yıldız Hesabı</h2>
        </div>
        <p className="text-[13px] text-slate-400">Bu influencer henüz yıldız hesabına sahip değil. İlk satış tamamlandığında otomatik oluşturulur.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bakiye kartı */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-[20px] text-yellow-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          <h2 className="font-semibold text-slate-900">Yıldız Hesabı</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Güncel Bakiye',     value: `${loyaltyAccount.currentBalance.toLocaleString('tr-TR')} ⭐`, sub: `≈ ₺${(loyaltyAccount.currentBalance / 10).toLocaleString('tr-TR')}` },
            { label: 'Toplam Kazanılan',  value: `${loyaltyAccount.lifetimeEarned.toLocaleString('tr-TR')} ⭐` },
            { label: 'Toplam Harcanan',   value: `${loyaltyAccount.lifetimeRedeemed.toLocaleString('tr-TR')} ⭐` },
            { label: 'Aylık Satış',       value: loyaltyAccount.currentMonthSalesCount, sub: TIER_LABELS[loyaltyAccount.currentMonthlyTier] },
          ].map(s => (
            <div key={s.label} className="bg-slate-50 rounded-xl p-4">
              <p className="text-[11px] text-slate-400 font-medium">{s.label}</p>
              <p className="text-[18px] font-bold text-slate-900 mt-1">{s.value}</p>
              {s.sub && <p className="text-[11px] text-slate-400 mt-0.5">{s.sub}</p>}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-[13px] text-slate-500 mb-1">
          <span>Yıllık Onur: <strong className="text-slate-800">{TIER_LABELS[loyaltyAccount.currentHonorTier]}</strong> ({loyaltyAccount.yearlySalesCount} satış)</span>
        </div>

        {/* Manuel puan ayarı */}
        <div className="mt-5 pt-5 border-t border-slate-50">
          <p className="text-[13px] font-semibold text-slate-700 mb-3">Manuel Puan Ayarı</p>
          <div className="flex gap-2 flex-wrap">
            <input
              type="number"
              placeholder="Örn: 5000 veya -1000"
              value={adjustForm.points}
              onChange={e => setAdjustForm({ ...adjustForm, points: e.target.value })}
              className="border border-slate-200 rounded-xl px-3 py-2 text-[13px] w-44 focus:outline-none focus:ring-2 focus:ring-[#003781]/20"
            />
            <input
              placeholder="Sebep (zorunlu)"
              value={adjustForm.reason}
              onChange={e => setAdjustForm({ ...adjustForm, reason: e.target.value })}
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20"
            />
            <button
              onClick={handleAdjust}
              disabled={adjustLoading || !adjustForm.points || !adjustForm.reason}
              className="bg-[#003781] text-white text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-[#002a63] transition-colors disabled:opacity-50"
            >
              {adjustLoading ? '...' : 'Uygula'}
            </button>
          </div>
          {adjustMsg && (
            <p className={`text-[12px] mt-2 ${adjustMsg.includes('uygulandı') ? 'text-green-600' : 'text-red-500'}`}>{adjustMsg}</p>
          )}
        </div>
      </div>

      {/* Harcama talepleri */}
      {redemptionList.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-slate-400">redeem</span>
            <h2 className="font-semibold text-slate-900">Harcama Talepleri</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {redemptionList.map((r: any) => {
              const st = STATUS_LABELS[r.status] || STATUS_LABELS.pending;
              return (
                <div key={r.id} className="px-6 py-4 flex items-start gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-[13px] font-semibold text-slate-900">{REDEMPTION_TYPE_LABELS[r.redemptionType]}</p>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                    </div>
                    <p className="text-[13px] font-bold text-[#003781]">{r.pointsUsed.toLocaleString('tr-TR')} ⭐ = ₺{r.cashValue.toLocaleString('tr-TR')}</p>
                    {r.bankIban && <p className="text-[12px] text-slate-500 mt-0.5">IBAN: {r.bankIban}</p>}
                    {r.targetFullName && <p className="text-[12px] text-slate-500 mt-0.5">Hedef: {r.targetFullName} ({r.targetUser})</p>}
                    {r.umrePackageName && <p className="text-[12px] text-slate-500 mt-0.5">Paket: {r.umrePackageName}</p>}
                    {r.discountCouponCode && <p className="text-[12px] text-slate-500 mt-0.5">Kupon: {r.discountCouponCode}</p>}
                    {r.notes && <p className="text-[12px] text-slate-400 mt-0.5">{r.notes}</p>}
                    <p className="text-[11px] text-slate-300 mt-1">{new Date(r.requestedAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleRedemption(r.id, 'approve')}
                        disabled={actionLoading === r.id + 'approve'}
                        className="bg-emerald-600 text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === r.id + 'approve' ? '...' : 'Onayla'}
                      </button>
                      <button
                        onClick={() => handleRedemption(r.id, 'reject', 'Admin tarafından reddedildi')}
                        disabled={actionLoading === r.id + 'reject'}
                        className="bg-red-50 text-red-600 text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        Reddet
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
