'use client';

import { useEffect, useState } from 'react';

const platformLabels: Record<string, { label: string; icon: string; color: string }> = {
  instagram_story: { label: 'Instagram Story', icon: 'fiber_manual_record', color: 'bg-pink-50 text-pink-600' },
  instagram_reel:  { label: 'Instagram Reel',  icon: 'play_circle',        color: 'bg-pink-50 text-pink-600' },
  instagram_post:  { label: 'Instagram Post',  icon: 'photo_camera',       color: 'bg-pink-50 text-pink-600' },
  tiktok:          { label: 'TikTok',           icon: 'music_note',        color: 'bg-gray-900 text-white'   },
  youtube:         { label: 'YouTube',          icon: 'smart_display',     color: 'bg-red-50 text-red-600'   },
  x:               { label: 'X (Twitter)',      icon: 'close',             color: 'bg-gray-50 text-gray-700' },
  other:           { label: 'Diğer',            icon: 'share',             color: 'bg-gray-50 text-gray-600' },
};

const statusMap: Record<string, { label: string; color: string }> = {
  pending:  { label: 'İnceleniyor', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  approved: { label: 'Onaylı',      color: 'bg-green-50 text-green-700 border-green-200'   },
  rejected: { label: 'Reddedildi',  color: 'bg-red-50 text-red-600 border-red-200'         },
};

export default function InfluencerSharesPage() {
  const [shares, setShares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ platform: 'instagram_story', shareUrl: '', shareDate: '', description: '' });
  const [error, setError] = useState('');

  const load = () => {
    fetch('/api/influencer/shares').then(r => r.json()).then(d => { setShares(d.shares || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const res = await fetch('/api/influencer/shares', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setShowForm(false);
      setForm({ platform: 'instagram_story', shareUrl: '', shareDate: '', description: '' });
      load();
    } else {
      setError(data.error || 'Bir hata oluştu.');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Paylaşımı silmek istediğinize emin misiniz?')) return;
    await fetch(`/api/influencer/shares?id=${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900 tracking-tight">Paylaşımlarım</h1>
          <p className="text-[14px] text-gray-400 mt-0.5">Yaptığınız paylaşımları sisteme ekleyin, admin onayına gönderin</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#003781] hover:bg-[#002a63] text-white font-semibold px-4 py-2.5 rounded-xl text-[14px] transition-all shadow-sm shadow-[#003781]/20">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Yeni Paylaşım
        </button>
      </div>

      {/* Yeni paylaşım formu */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-bold text-gray-900">Yeni Paylaşım Ekle</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all">
                <span className="material-symbols-outlined text-[18px] text-gray-500">close</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 text-red-600 text-[13px] px-4 py-3 rounded-xl border border-red-100">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Platform *</label>
                <select value={form.platform} onChange={e => set('platform', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all">
                  {Object.entries(platformLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Paylaşım URL'si</label>
                <input type="url" value={form.shareUrl} onChange={e => set('shareUrl', e.target.value)}
                  placeholder="https://instagram.com/p/..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Paylaşım Tarihi *</label>
                <input type="date" value={form.shareDate} onChange={e => set('shareDate', e.target.value)} required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Açıklama (opsiyonel)</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
                  placeholder="Kısa bir not..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-[14px] hover:bg-gray-50 transition-all">
                  İptal
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-[#003781] hover:bg-[#002a63] text-white font-semibold py-3 rounded-xl text-[14px] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Gönder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#003781]/20 border-t-[#003781] rounded-full animate-spin" />
        </div>
      ) : shares.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-gray-200 mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
          <p className="text-[16px] font-semibold text-gray-400">Henüz paylaşım eklemediniz</p>
          <p className="text-[13px] text-gray-300 mt-1">İlk paylaşımınızı ekleyerek başlayın</p>
          <button onClick={() => setShowForm(true)}
            className="mt-5 inline-flex items-center gap-2 bg-[#003781] text-white font-semibold px-5 py-2.5 rounded-xl text-[14px] hover:bg-[#002a63] transition-all">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Paylaşım Ekle
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {shares.map((share: any) => {
            const plat = platformLabels[share.platform] || platformLabels.other;
            const st = statusMap[share.status] || statusMap.pending;
            return (
              <div key={share.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plat.color}`}>
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{plat.icon}</span>
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-gray-900">{plat.label}</p>
                      <p className="text-[12px] text-gray-400">{new Date(share.shareDate).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${st.color}`}>{st.label}</span>
                    {share.status === 'pending' && (
                      <button onClick={() => handleDelete(share.id)}
                        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined text-[15px] text-red-500">delete</span>
                      </button>
                    )}
                  </div>
                </div>

                {share.rejectReason && (
                  <div className="mt-3 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-[12px] text-red-600">
                    <span className="font-semibold">Red sebebi: </span>{share.rejectReason}
                  </div>
                )}

                {share.shareUrl && (
                  <a href={share.shareUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-1.5 text-[12px] text-[#003781] font-medium hover:underline">
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                    Paylaşımı Gör
                  </a>
                )}

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                  {[
                    { icon: 'visibility', label: 'Görüntülenme', value: share.viewCount },
                    { icon: 'ads_click',  label: 'Tıklanma',     value: share.clickCount },
                    { icon: 'shopping_bag', label: 'Satış',       value: share.saleCount },
                  ].map(m => (
                    <div key={m.label} className="flex items-center gap-1.5 text-[12px] text-gray-400">
                      <span className="material-symbols-outlined text-[14px]">{m.icon}</span>
                      <span className="font-semibold text-gray-700">{m.value}</span>
                      <span>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
