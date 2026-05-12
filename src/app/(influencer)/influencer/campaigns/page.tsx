'use client';

import { useEffect, useState } from 'react';

const typeLabels: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  package:  { label: 'Paket',    icon: 'inventory_2',    color: 'text-blue-600',    bg: 'bg-blue-50' },
  transfer: { label: 'Transfer', icon: 'directions_car', color: 'text-orange-600',  bg: 'bg-orange-50' },
  hotel:    { label: 'Otel',     icon: 'hotel',          color: 'text-purple-600',  bg: 'bg-purple-50' },
  flight:   { label: 'Uçuş',    icon: 'flight',         color: 'text-sky-600',     bg: 'bg-sky-50' },
  all:      { label: 'Tümü',    icon: 'star',           color: 'text-yellow-600',  bg: 'bg-yellow-50' },
};

export default function InfluencerCampaignsPage() {
  const [data, setData] = useState<{ available: any[]; joined: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState('');
  const [copied, setCopied] = useState('');
  const [tab, setTab] = useState<'available' | 'joined'>('joined');

  const load = () => {
    fetch('/api/influencer/campaigns').then(r => r.json()).then(d => { setData(d); setLoading(false); });
  };
  useEffect(() => { load(); }, []);

  const join = async (campaignId: string) => {
    setJoining(campaignId);
    const res = await fetch('/api/influencer/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId }),
    });
    const d = await res.json();
    if (res.ok) { load(); setTab('joined'); }
    else alert(d.error || 'Hata oluştu.');
    setJoining('');
  };

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#003781]/20 border-t-[#003781] rounded-full animate-spin" />
      </div>
    );
  }

  const available = data?.available || [];
  const joined = data?.joined || [];

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-[24px] font-bold text-gray-900 tracking-tight">Kampanyalar</h1>
        <p className="text-[14px] text-gray-400 mt-0.5">Kampanyalara katılın, size özel kod alın, paylaşın</p>
      </div>

      {/* Tab */}
      <div className="flex bg-gray-100 rounded-2xl p-1 gap-1 w-fit">
        {[
          { key: 'joined',    label: `Kampanyalarım (${joined.length})` },
          { key: 'available', label: `Katılabileceklerim (${available.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${tab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Katıldıklarım */}
      {tab === 'joined' && (
        <div className="space-y-4">
          {joined.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <span className="material-symbols-outlined text-5xl text-gray-200 mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
              <p className="text-[15px] font-semibold text-gray-400">Henüz kampanyaya katılmadınız</p>
              <button onClick={() => setTab('available')} className="mt-4 inline-flex items-center gap-2 bg-[#003781] text-white font-semibold px-5 py-2.5 rounded-xl text-[14px] hover:bg-[#002a63] transition-all">
                Kampanyaları Gör
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          ) : joined.map(p => {
            const t = typeLabels[p.campaign.type] || typeLabels.all;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
                  <div className={`w-10 h-10 ${t.bg} rounded-xl flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined text-[20px] ${t.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-bold text-gray-900">{p.campaign.title}</p>
                    <p className="text-[12px] text-gray-400">
                      {p.campaign.discountType === 'percent' ? `%${p.campaign.discountValue}` : `₺${p.campaign.discountValue}`} indirim · {t.label}
                    </p>
                  </div>
                  <span className="text-[12px] font-semibold text-gray-400">{new Date(p.joinedAt).toLocaleDateString('tr-TR')} katıldı</span>
                </div>

                {/* Kod */}
                <div className="px-5 py-5">
                  <p className="text-[12px] text-gray-400 font-medium mb-2">Size Özel Kampanya Kodunuz</p>
                  <div className="flex items-center gap-3 bg-gradient-to-r from-[#003781]/5 to-[#003781]/10 rounded-2xl px-5 py-4">
                    <p className="text-[28px] font-black text-[#003781] tracking-widest flex-1">{p.uniqueCode}</p>
                    <button onClick={() => copy(p.uniqueCode, p.id)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-[13px] transition-all ${copied === p.id ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                      <span className="material-symbols-outlined text-[18px]">{copied === p.id ? 'check' : 'content_copy'}</span>
                      {copied === p.id ? 'Kopyalandı!' : 'Kopyala'}
                    </button>
                  </div>

                  {/* İstatistik */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-[24px] font-bold text-gray-900">{p.usageCount}</p>
                      <p className="text-[12px] text-gray-400 font-medium">Toplam Kullanım</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <p className="text-[24px] font-bold text-gray-900">{p.codeUsages?.length || 0}</p>
                      <p className="text-[12px] text-gray-400 font-medium">Bu Ay</p>
                    </div>
                  </div>

                  {/* Son kullanımlar */}
                  {p.codeUsages && p.codeUsages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[12px] font-semibold text-gray-500 mb-2">Son Kullanımlar</p>
                      <div className="space-y-1.5">
                        {p.codeUsages.slice(0, 5).map((u: any) => (
                          <div key={u.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                            <p className="text-[13px] font-medium text-gray-700">{u.customerName || 'Anonim'}</p>
                            <p className="text-[12px] text-gray-400">{new Date(u.usedAt).toLocaleDateString('tr-TR')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Nasıl kullanılır */}
                  <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    <p className="text-[12px] text-blue-700 leading-relaxed">
                      <span className="font-semibold">Nasıl paylaşılır?</span> Takipçilerinize bu kodu söyleyin veya yazın: <span className="font-bold">{p.campaign.description || `"${p.campaign.title} için ${p.uniqueCode} kodunu kullanın!"`}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Katılabileceklerim */}
      {tab === 'available' && (
        <div className="space-y-4">
          {available.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <span className="material-symbols-outlined text-5xl text-gray-200 mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
              <p className="text-[15px] font-semibold text-gray-400">Yeni kampanya yok</p>
              <p className="text-[13px] text-gray-300 mt-1">Tüm aktif kampanyalara katıldınız</p>
            </div>
          ) : available.map((c: any) => {
            const t = typeLabels[c.type] || typeLabels.all;
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${t.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined text-[24px] ${t.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h3 className="text-[16px] font-bold text-gray-900">{c.title}</h3>
                        {c.description && <p className="text-[13px] text-gray-400 mt-0.5">{c.description}</p>}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${t.bg} ${t.color}`}>{t.label}</span>
                          <span className="text-[13px] font-bold text-gray-800">
                            {c.discountType === 'percent' ? `%${c.discountValue} indirim` : `₺${c.discountValue} indirim`}
                          </span>
                          <span className="text-[12px] text-gray-400">{c._count.participants} katılımcı</span>
                        </div>
                        <div className="mt-2 bg-gray-50 rounded-xl px-3 py-2 inline-block">
                          <p className="text-[11px] text-gray-400">Kodunuz şöyle görünecek:</p>
                          <p className="text-[15px] font-black text-[#003781] tracking-widest mt-0.5">AD{c.codeTemplate}</p>
                        </div>
                      </div>
                      <button onClick={() => join(c.id)} disabled={joining === c.id}
                        className="flex items-center gap-2 bg-[#003781] hover:bg-[#002a63] text-white font-semibold px-4 py-2.5 rounded-xl text-[14px] transition-all shadow-sm shrink-0 disabled:opacity-60">
                        {joining === c.id
                          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <><span className="material-symbols-outlined text-[18px]">add</span> Katıl</>
                        }
                      </button>
                    </div>
                  </div>
                </div>
                {c.endDate && (
                  <p className="text-[12px] text-gray-400 mt-3 pt-3 border-t border-gray-50 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">event</span>
                    Bitiş: {new Date(c.endDate).toLocaleDateString('tr-TR')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
