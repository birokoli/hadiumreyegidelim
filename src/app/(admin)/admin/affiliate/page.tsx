'use client';

import { useEffect, useState } from 'react';

interface ProgramConfig {
  id: number;
  baseThreshold: number;
  referralReduction: number;
  minThreshold: number;
  startRate: number;
  maxRate: number;
  weightCvr: number;
  weightVolume: number;
  weightCtr: number;
  starToTry: number;
  minWithdrawTry: number;
  refundWindowDays: number;
  attributionWindowDays: number;
}

interface ScoreRow {
  influencerId: string;
  score: number;
  commissionRate: number;
  influencer?: { fullName: string; uniqueCode: string } | null;
}

export default function AdminAffiliatePage() {
  const [config, setConfig] = useState<ProgramConfig | null>(null);
  const [configForm, setConfigForm] = useState<Partial<ProgramConfig>>({});
  const [configSaving, setConfigSaving] = useState(false);
  const [configMsg, setConfigMsg] = useState('');

  const [computePeriod, setComputePeriod] = useState('');
  const [computing, setComputing] = useState(false);
  const [computeResult, setComputeResult] = useState<{ period?: string; count?: number } | null>(null);

  const [starInfluencerId, setStarInfluencerId] = useState('');
  const [starDelta, setStarDelta] = useState('');
  const [starNote, setStarNote] = useState('');
  const [starSaving, setStarSaving] = useState(false);
  const [starMsg, setStarMsg] = useState('');

  const [scores, setScores] = useState<ScoreRow[]>([]);
  const [scoresLoading, setScoresLoading] = useState(false);

  // Load config
  const loadConfig = async () => {
    const res = await fetch('/api/admin/affiliate/config');
    if (res.ok) {
      const data = await res.json();
      setConfig(data.config);
      setConfigForm(data.config);
    }
  };

  useEffect(() => { loadConfig(); }, []);

  const setF = (k: string, v: string) =>
    setConfigForm(f => ({ ...f, [k]: v === '' ? undefined : Number(v) }));

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaving(true);
    setConfigMsg('');
    const res = await fetch('/api/admin/affiliate/config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(configForm),
    });
    const data = await res.json();
    if (res.ok) {
      setConfig(data.config);
      setConfigMsg('Kaydedildi.');
    } else {
      setConfigMsg(data.error || 'Hata oluştu.');
    }
    setConfigSaving(false);
  };

  const handleCompute = async (e: React.FormEvent) => {
    e.preventDefault();
    setComputing(true);
    setComputeResult(null);
    const res = await fetch('/api/admin/affiliate/compute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period: computePeriod || undefined }),
    });
    const data = await res.json();
    if (res.ok) setComputeResult(data);
    else setComputeResult({ period: data.error });
    setComputing(false);
  };

  const handleStarAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    setStarSaving(true);
    setStarMsg('');
    const res = await fetch('/api/admin/affiliate/stars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        influencerId: starInfluencerId,
        delta: Number(starDelta),
        note: starNote,
      }),
    });
    const data = await res.json();
    setStarMsg(res.ok ? 'Yıldız güncellendi.' : data.error || 'Hata.');
    if (res.ok) { setStarInfluencerId(''); setStarDelta(''); setStarNote(''); }
    setStarSaving(false);
  };

  // Load current period scores
  const loadScores = async () => {
    setScoresLoading(true);
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const res = await fetch(`/api/admin/affiliate/compute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period }),
    });
    if (res.ok) {
      const data = await res.json();
      setScores(data.results || []);
    }
    setScoresLoading(false);
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Affiliate Program Yönetimi</h1>
        <p className="text-sm text-slate-500 mt-0.5">Program konfigürasyonu, skor hesaplama ve yıldız düzeltmeleri</p>
      </div>

      {/* ─── Program Config ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-[16px] font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#003781]">settings</span>
          Program Konfigürasyonu
        </h2>
        {config && (
          <form onSubmit={saveConfig} className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {([
              ['baseThreshold', 'Taban Eşik (satış)', 'number'],
              ['referralReduction', 'Referral İndirimi', 'number'],
              ['minThreshold', 'Min. Eşik', 'number'],
              ['startRate', 'Başlangıç Oranı (%)', 'number'],
              ['maxRate', 'Maks. Oran (%)', 'number'],
              ['weightCvr', 'CVR Ağırlığı', 'number'],
              ['weightVolume', 'Volume Ağırlığı', 'number'],
              ['weightCtr', 'CTR Ağırlığı', 'number'],
              ['starToTry', '1 Yıldız = X TL', 'number'],
              ['minWithdrawTry', 'Min. Çekim (TL)', 'number'],
              ['refundWindowDays', 'İade Süresi (gün)', 'number'],
              ['attributionWindowDays', 'Attribution Süresi (gün)', 'number'],
            ] as [keyof ProgramConfig, string, string][]).map(([key, label]) => (
              <div key={key}>
                <label className="block text-[12px] font-medium text-slate-500 mb-1">{label}</label>
                <input
                  type="number"
                  step="any"
                  value={configForm[key] ?? ''}
                  onChange={e => setF(key, e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20"
                />
              </div>
            ))}
            <div className="col-span-2 lg:col-span-3 flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={configSaving}
                className="flex items-center gap-2 bg-[#003781] hover:bg-[#002a63] disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-[14px] transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                {configSaving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              {configMsg && (
                <span className={`text-[13px] font-medium ${configMsg === 'Kaydedildi.' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {configMsg}
                </span>
              )}
            </div>
          </form>
        )}
      </div>

      {/* ─── Compute Period ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-[16px] font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#003781]">calculate</span>
          Dönem Skoru Hesapla
        </h2>
        <form onSubmit={handleCompute} className="flex items-end gap-3">
          <div>
            <label className="block text-[12px] font-medium text-slate-500 mb-1">
              Dönem (boş bırakılırsa önceki ay)
            </label>
            <input
              type="text"
              placeholder="örn: 2026-04-01"
              value={computePeriod}
              onChange={e => setComputePeriod(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20 w-48"
            />
          </div>
          <button
            type="submit"
            disabled={computing}
            className="flex items-center gap-2 bg-[#236B40] hover:bg-[#1a4f30] disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-[14px] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">play_arrow</span>
            {computing ? 'Hesaplanıyor...' : 'Hesapla'}
          </button>
        </form>
        {computeResult && (
          <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <p className="text-[13px] text-emerald-700 font-medium">
              {typeof computeResult.count === 'number'
                ? `${computeResult.period} dönemi için ${computeResult.count} influencer işlendi.`
                : String(computeResult.period)}
            </p>
          </div>
        )}
      </div>

      {/* ─── Star Adjustment ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-[16px] font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#003781]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          Yıldız Düzeltme
        </h2>
        <form onSubmit={handleStarAdjust} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-[12px] font-medium text-slate-500 mb-1">Influencer ID</label>
            <input
              type="text"
              value={starInfluencerId}
              onChange={e => setStarInfluencerId(e.target.value)}
              placeholder="cuid..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20"
              required
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-slate-500 mb-1">Delta (+ veya - yıldız)</label>
            <input
              type="number"
              value={starDelta}
              onChange={e => setStarDelta(e.target.value)}
              placeholder="örn: 1000 veya -500"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20"
              required
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-slate-500 mb-1">Açıklama (zorunlu)</label>
            <input
              type="text"
              value={starNote}
              onChange={e => setStarNote(e.target.value)}
              placeholder="Anlaşma bonusu..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20"
              required
            />
          </div>
          <div className="lg:col-span-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={starSaving}
              className="flex items-center gap-2 bg-[#003781] hover:bg-[#002a63] disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-xl text-[14px] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">star</span>
              {starSaving ? 'Güncelleniyor...' : 'Yıldız Ekle/Çıkar'}
            </button>
            {starMsg && (
              <span className={`text-[13px] font-medium ${starMsg.includes('güncellendi') ? 'text-emerald-600' : 'text-red-500'}`}>
                {starMsg}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* ─── Scores Table ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#003781]">leaderboard</span>
            Performans Skorları (Bu Dönem)
          </h2>
          <button
            onClick={loadScores}
            disabled={scoresLoading}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 font-semibold px-4 py-2 rounded-xl text-[13px] hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            {scoresLoading ? 'Yükleniyor...' : 'Hesapla & Yükle'}
          </button>
        </div>
        {scores.length === 0 ? (
          <div className="text-center py-10 text-gray-300">
            <span className="material-symbols-outlined text-4xl">leaderboard</span>
            <p className="text-[13px] text-gray-400 mt-2">Hesapla & Yükle butonuna tıklayın</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide pb-2">Influencer</th>
                  <th className="text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide pb-2">Skor</th>
                  <th className="text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide pb-2">Komisyon</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s: ScoreRow) => (
                  <tr key={s.influencerId} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5">
                      <p className="text-[13px] font-semibold text-gray-800">{s.influencer?.fullName ?? '—'}</p>
                      <p className="text-[11px] font-mono text-gray-400">{s.influencer?.uniqueCode ?? s.influencerId}</p>
                    </td>
                    <td className="py-2.5 text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-semibold ${
                        s.score >= 75 ? 'bg-emerald-50 text-emerald-700' :
                        s.score >= 40 ? 'bg-yellow-50 text-yellow-700' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {s.score}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-[#003781]">%{s.commissionRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
