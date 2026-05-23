'use client';

import { useState } from 'react';

interface StarEntry {
  id: string;
  delta: number;
  reason: string;
  note: string | null;
  createdBy: string | null;
  createdAt: Date | string;
}

interface PerfScore {
  id: string;
  period: string;
  score: number;
  commissionRate: number;
  ctr: number;
  cvr: number;
  volume: number;
}

interface ReferralMade {
  id: string;
  qualified: boolean;
  qualifiedPeriod: string | null;
  invited: { fullName: string; uniqueCode: string; status: string } | null;
}

interface ReferralReceived {
  referrer: { fullName: string; uniqueCode: string } | null;
  qualified: boolean;
}

interface Props {
  influencerId: string;
  programUnlocked: boolean;
  baseThrOverride: number | null;
  starLedgerEntries: StarEntry[];
  perfScores: PerfScore[];
  referralsMade: ReferralMade[];
  referralReceived: ReferralReceived | null;
}

const REASON_LABELS: Record<string, { label: string; color: string }> = {
  commission:     { label: 'Komisyon',        color: 'bg-emerald-50 text-emerald-700' },
  admin_adjust:   { label: 'Admin Düzeltme',  color: 'bg-blue-50 text-blue-700' },
  withdraw:       { label: 'Para Çekme',      color: 'bg-red-50 text-red-600' },
  gift_redeem:    { label: 'Hediye',          color: 'bg-purple-50 text-purple-700' },
  referral_bonus: { label: 'Referral Bonus',  color: 'bg-yellow-50 text-yellow-700' },
  reversal:       { label: 'İptal',           color: 'bg-gray-50 text-gray-600' },
};

export default function AdminInfluencerAffiliatePanel({
  influencerId,
  programUnlocked,
  baseThrOverride,
  starLedgerEntries,
  perfScores,
  referralsMade,
  referralReceived,
}: Props) {
  const [thrInput, setThrInput] = useState(String(baseThrOverride ?? ''));
  const [thrSaving, setThrSaving] = useState(false);
  const [thrMsg, setThrMsg] = useState('');

  const [starDelta, setStarDelta] = useState('');
  const [starNote, setStarNote] = useState('');
  const [starSaving, setStarSaving] = useState(false);
  const [starMsg, setStarMsg] = useState('');

  const starBalance = starLedgerEntries.reduce((sum, e) => sum + e.delta, 0);

  const saveThr = async () => {
    setThrSaving(true);
    setThrMsg('');
    const res = await fetch(`/api/admin/influencers/${influencerId}/affiliate/threshold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ override: thrInput === '' ? null : Number(thrInput) }),
    });
    const json = await res.json();
    setThrMsg(res.ok ? 'Kaydedildi.' : json.error || 'Hata.');
    setThrSaving(false);
  };

  const addStar = async (e: React.FormEvent) => {
    e.preventDefault();
    setStarSaving(true);
    setStarMsg('');
    const res = await fetch('/api/admin/affiliate/stars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ influencerId, delta: Number(starDelta), note: starNote }),
    });
    const json = await res.json();
    if (res.ok) {
      setStarMsg('Yıldız güncellendi. Sayfayı yenileyin.');
      setStarDelta('');
      setStarNote('');
    } else {
      setStarMsg(json.error || 'Hata.');
    }
    setStarSaving(false);
  };

  return (
    <div className="space-y-5">
      {/* Başlık + Özet */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#236B40]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <h2 className="font-semibold text-slate-900">Affiliate Program</h2>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${programUnlocked ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-500'}`}>
            {programUnlocked ? 'Aktif' : 'Kilitli'}
          </span>
        </div>

        <div className="px-6 py-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Yıldız Bakiye</p>
            <p className="text-[22px] font-black text-slate-900 mt-0.5">
              {starBalance.toLocaleString('tr-TR')}
              <span className="text-[13px] font-normal text-slate-400 ml-1">yıldız</span>
            </p>
            <p className="text-[12px] text-slate-400">≈ ₺{(starBalance * 0.10).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Eşik Override</p>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={thrInput}
                onChange={e => setThrInput(e.target.value)}
                placeholder="Varsayılan"
                className="w-24 border border-gray-200 rounded-xl px-3 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20"
              />
              <button
                onClick={saveThr}
                disabled={thrSaving}
                className="text-[12px] font-semibold bg-[#003781] text-white px-3 py-1.5 rounded-xl hover:bg-[#002a63] disabled:opacity-50 transition-all"
              >
                {thrSaving ? '...' : 'Kaydet'}
              </button>
            </div>
            {thrMsg && <p className={`text-[11px] mt-1 ${thrMsg === 'Kaydedildi.' ? 'text-emerald-600' : 'text-red-500'}`}>{thrMsg}</p>}
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Davet</p>
            <p className="text-[16px] font-bold text-slate-900 mt-0.5">
              {referralsMade.length} kişi davet etti
            </p>
            {referralReceived?.referrer && (
              <p className="text-[11px] text-slate-400">{referralReceived.referrer.fullName} tarafından davet edildi</p>
            )}
          </div>
        </div>
      </div>

      {/* Yıldız Ekle/Çıkar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-[14px] font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-[#003781]">edit</span>
          Yıldız Düzeltme
        </h3>
        <form onSubmit={addStar} className="flex items-end gap-3 flex-wrap">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Delta (+ veya -)</label>
            <input
              type="number"
              value={starDelta}
              onChange={e => setStarDelta(e.target.value)}
              placeholder="örn: 1000"
              required
              className="w-32 border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20"
            />
          </div>
          <div className="flex-1 min-w-40">
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Açıklama (zorunlu)</label>
            <input
              type="text"
              value={starNote}
              onChange={e => setStarNote(e.target.value)}
              placeholder="Anlaşma bonusu..."
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20"
            />
          </div>
          <button
            type="submit"
            disabled={starSaving}
            className="flex items-center gap-1.5 bg-[#003781] hover:bg-[#002a63] disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-xl text-[13px] transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">star</span>
            {starSaving ? '...' : 'Uygula'}
          </button>
          {starMsg && <p className={`w-full text-[12px] font-medium ${starMsg.includes('güncellendi') ? 'text-emerald-600' : 'text-red-500'}`}>{starMsg}</p>}
        </form>
      </div>

      {/* Yıldız Geçmişi */}
      {starLedgerEntries.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50">
            <h3 className="text-[14px] font-bold text-slate-900">Yıldız Hareketi (Son 30)</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {starLedgerEntries.map(e => {
              const r = REASON_LABELS[e.reason] || { label: e.reason, color: 'bg-gray-50 text-gray-600' };
              return (
                <div key={e.id} className="px-6 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${r.color}`}>{r.label}</span>
                    {e.note && <p className="text-[12px] text-slate-500 truncate max-w-xs">{e.note}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-[14px] font-bold ${e.delta > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {e.delta > 0 ? '+' : ''}{e.delta.toLocaleString('tr-TR')}
                    </p>
                    <p className="text-[11px] text-slate-400">{new Date(e.createdAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Performans Skorları */}
      {perfScores.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50">
            <h3 className="text-[14px] font-bold text-slate-900">Performans Skorları</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Dönem', 'Skor', 'Komisyon', 'CTR', 'CVR', 'Hacim'].map(h => (
                    <th key={h} className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-6 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {perfScores.map(s => (
                  <tr key={s.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-6 py-2.5 font-mono text-slate-600">{s.period}</td>
                    <td className="px-6 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full font-semibold ${
                        s.score >= 75 ? 'bg-emerald-50 text-emerald-700' :
                        s.score >= 40 ? 'bg-yellow-50 text-yellow-700' :
                        'bg-gray-50 text-gray-600'
                      }`}>{s.score}</span>
                    </td>
                    <td className="px-6 py-2.5 font-semibold text-[#003781]">%{s.commissionRate}</td>
                    <td className="px-6 py-2.5 text-slate-600">{(s.ctr * 100).toFixed(2)}%</td>
                    <td className="px-6 py-2.5 text-slate-600">{(s.cvr * 100).toFixed(2)}%</td>
                    <td className="px-6 py-2.5 text-slate-600">{s.volume}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Davet Ettikleri */}
      {referralsMade.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50">
            <h3 className="text-[14px] font-bold text-slate-900">Davet Ettikleri ({referralsMade.length})</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {referralsMade.map(r => (
              <div key={r.id} className="px-6 py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">{r.invited?.fullName}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{r.invited?.uniqueCode} · {r.invited?.status}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${r.qualified ? 'bg-emerald-50 text-emerald-700' : 'bg-yellow-50 text-yellow-700'}`}>
                    {r.qualified ? 'Aktif' : 'Bekliyor'}
                  </span>
                  {r.qualifiedPeriod && <p className="text-[10px] text-slate-400 mt-0.5">{r.qualifiedPeriod}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
