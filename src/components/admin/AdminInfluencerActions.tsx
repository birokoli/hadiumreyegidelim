'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const REJECT_REASONS = [
  'Engagement oranı düşük',
  'Hedef kitle uygun değil',
  'Hesap doğrulanamadı',
  'Takipçi sayısı yetersiz',
  'İçerik kalitesi yetersiz',
  'Diğer',
];

const TIERS = [
  { value: 'eci',     label: 'Elçi' },
  { value: 'rehber',  label: 'Rehber' },
  { value: 'davetci', label: 'Davetçi' },
];

export default function AdminInfluencerActions({
  influencerId,
  currentStatus,
  currentTier,
}: {
  influencerId: string;
  currentStatus: string;
  currentTier: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState(REJECT_REASONS[0]);
  const [tier, setTier] = useState(currentTier);

  const doAction = async (action: string, extra?: object) => {
    setLoading(action);
    await fetch(`/api/admin/influencers/${influencerId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, tier, ...extra }),
    });
    setLoading('');
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {currentStatus === 'pending' && (
        <>
          <select value={tier} onChange={e => setTier(e.target.value)}
            className="border border-slate-200 text-[12px] text-slate-700 px-2 py-1.5 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003781]/20">
            {TIERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <button onClick={() => doAction('approve')} disabled={!!loading}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-60">
            {loading === 'approve' ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span className="material-symbols-outlined text-[15px]">check</span>}
            Onayla
          </button>
          <button onClick={() => setShowReject(true)}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all border border-red-100">
            <span className="material-symbols-outlined text-[15px]">close</span>
            Reddet
          </button>
        </>
      )}
      {currentStatus === 'active' && (
        <button onClick={() => doAction('passive')} disabled={!!loading}
          className="text-[12px] font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-all">
          Pasife Al
        </button>
      )}
      {currentStatus === 'passive' && (
        <button onClick={() => doAction('approve')} disabled={!!loading}
          className="text-[12px] font-semibold text-green-600 hover:text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-all">
          Aktife Al
        </button>
      )}

      {/* Reject modal */}
      {showReject && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowReject(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-[16px] font-bold text-slate-900 mb-4">Red Sebebi Seçin</h3>
            <select value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              className="w-full border border-slate-200 text-[13px] text-slate-700 px-3 py-2.5 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-[#003781]/20">
              {REJECT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setShowReject(false)}
                className="flex-1 border border-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl text-[13px] hover:bg-slate-50 transition-all">
                İptal
              </button>
              <button onClick={() => { setShowReject(false); doAction('reject', { rejectReason }); }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl text-[13px] transition-all">
                Reddet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
