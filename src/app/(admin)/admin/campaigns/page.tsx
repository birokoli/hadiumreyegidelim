'use client';

import { useEffect, useState } from 'react';

const typeLabels: Record<string, { label: string; icon: string; color: string }> = {
  package:  { label: 'Paket',    icon: 'inventory_2',    color: 'bg-blue-50 text-blue-600' },
  transfer: { label: 'Transfer', icon: 'directions_car', color: 'bg-orange-50 text-orange-600' },
  hotel:    { label: 'Otel',     icon: 'hotel',          color: 'bg-purple-50 text-purple-600' },
  flight:   { label: 'Uçuş',    icon: 'flight',         color: 'bg-sky-50 text-sky-600' },
  all:      { label: 'Tümü',    icon: 'star',           color: 'bg-yellow-50 text-yellow-600' },
};

const statusMap: Record<string, { label: string; dot: string }> = {
  active: { label: 'Aktif',    dot: 'bg-green-500' },
  paused: { label: 'Duraklat', dot: 'bg-yellow-500' },
  ended:  { label: 'Bitti',   dot: 'bg-gray-400' },
};

const EMPTY_FORM = {
  title: '', description: '', type: 'transfer',
  discountType: 'percent', discountValue: '', codeTemplate: '',
  startDate: '', endDate: '', maxParticipants: '',
  // Story alanları
  storyEyebrow: '', storyTitle: '', storySub: '',
  storyFeats: '', commissionPct: '',
};

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');
  const [form, setForm]           = useState(EMPTY_FORM);

  const load = () => {
    fetch('/api/admin/campaigns')
      .then(r => r.json())
      .then(d => { setCampaigns(d.campaigns || []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        ...form,
        storyFeats: form.storyFeats
          ? form.storyFeats.split(',').map(s => s.trim()).filter(Boolean)
          : undefined,
        commissionPct: form.commissionPct || undefined,
      };
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setShowForm(false);
        setForm(EMPTY_FORM);
        load();
      } else {
        setError(data.error || 'Hata oluştu.');
      }
    } catch {
      setError('Sunucu hatası. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id: string, status: string) => {
    const next = status === 'active' ? 'paused' : 'active';
    await fetch(`/api/admin/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    });
    load();
  };

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kampanyalar</h1>
          <p className="text-sm text-slate-500 mt-0.5">Influencer'lara özel indirim kampanyaları oluşturun</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#003781] hover:bg-[#002a63] text-white font-semibold px-4 py-2.5 rounded-xl text-[14px] transition-all shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Kampanya Oluştur
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-7 my-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[18px] font-bold text-slate-900">Yeni Kampanya</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-all">
                <span className="material-symbols-outlined text-[18px] text-slate-500">close</span>
              </button>
            </div>

            {error && <div className="mb-4 bg-red-50 text-red-600 text-[13px] px-4 py-3 rounded-xl border border-red-100">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ── Temel bilgiler ─────────────────────────── */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Kampanya Adı *</label>
                <input type="text" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Transfer %10 İndirim"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Açıklama</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Kampanya detayları..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Kapsam *</label>
                  <select value={form.type} onChange={e => set('type', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all">
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">İndirim Tipi *</label>
                  <select value={form.discountType} onChange={e => set('discountType', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all">
                    <option value="percent">Yüzde (%)</option>
                    <option value="fixed">Sabit Tutar (₺)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                    İndirim Miktarı * {form.discountType === 'percent' ? '(%)' : '(₺)'}
                  </label>
                  <input type="number" value={form.discountValue} onChange={e => set('discountValue', e.target.value)} required min="1" placeholder={form.discountType === 'percent' ? '10' : '500'}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Kod Şablonu *</label>
                  <input type="text" value={form.codeTemplate} onChange={e => set('codeTemplate', e.target.value.toUpperCase())} required placeholder="TRANSFER10"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
                  {form.codeTemplate && (
                    <p className="text-[11px] text-slate-400 mt-1">Örn: <span className="font-semibold text-[#003781]">YASİN{form.codeTemplate}</span></p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Başlangıç</label>
                  <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Bitiş</label>
                  <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Maks. Katılımcı</label>
                  <input type="number" value={form.maxParticipants} onChange={e => set('maxParticipants', e.target.value)} min="1" placeholder="sınırsız"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Komisyon %</label>
                  <input type="number" value={form.commissionPct} onChange={e => set('commissionPct', e.target.value)} min="0" max="100" step="0.1" placeholder="örn: 5"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
                </div>
              </div>

              {/* ── Story alanları ─────────────────────────── */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-3">Story Görsel Alanları (opsiyonel)</p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Eyebrow (üst etiket)</label>
                    <input type="text" value={form.storyEyebrow} onChange={e => set('storyEyebrow', e.target.value)} placeholder="🌙 AĞUSTOS ÖZEL"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Story Başlığı</label>
                    <input type="text" value={form.storyTitle} onChange={e => set('storyTitle', e.target.value)} placeholder="Boş bırakılırsa kampanya adı kullanılır"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Alt Başlık</label>
                    <input type="text" value={form.storySub} onChange={e => set('storySub', e.target.value)} placeholder="Takipçilerine özel fırsat"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Özellikler (virgülle ayır)</label>
                    <input type="text" value={form.storyFeats} onChange={e => set('storyFeats', e.target.value)} placeholder="Otel dahil, Uçuş dahil, Rehber dahil"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20 focus:border-[#003781] transition-all" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl text-[14px] hover:bg-slate-50 transition-all">İptal</button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-[#003781] hover:bg-[#002a63] text-white font-semibold py-3 rounded-xl text-[14px] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {submitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Oluştur'}
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
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-200 mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>campaign</span>
          <p className="text-[16px] font-semibold text-slate-400">Henüz kampanya yok</p>
          <button onClick={() => setShowForm(true)} className="mt-4 inline-flex items-center gap-2 bg-[#003781] text-white font-semibold px-5 py-2.5 rounded-xl text-[14px] hover:bg-[#002a63] transition-all">
            <span className="material-symbols-outlined text-[18px]">add</span> İlk Kampanyayı Oluştur
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c: any) => {
            const t = typeLabels[c.type] || typeLabels.all;
            const s = statusMap[c.status] || statusMap.active;
            return (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${t.color} rounded-2xl flex items-center justify-center shrink-0`}>
                      <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{t.icon}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[16px] font-bold text-slate-900">{c.title}</h3>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${c.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-500'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </div>
                      </div>
                      {c.description && <p className="text-[13px] text-slate-400 mt-0.5">{c.description}</p>}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${t.color}`}>{t.label}</span>
                        <span className="text-[13px] font-semibold text-slate-700">
                          {c.discountType === 'percent' ? `%${c.discountValue} indirim` : `₺${c.discountValue} indirim`}
                        </span>
                        {c.commissionPct && (
                          <span className="text-[12px] font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">%{c.commissionPct} komisyon</span>
                        )}
                        <span className="text-[12px] text-slate-400 font-mono bg-slate-50 px-2 py-0.5 rounded-lg">Şablon: {c.codeTemplate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-[22px] font-bold text-slate-900">{c._count.participants}</p>
                      <p className="text-[11px] text-slate-400">Katılımcı</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[22px] font-bold text-slate-900">{c._count.codeUsages}</p>
                      <p className="text-[11px] text-slate-400">Kullanım</p>
                    </div>
                    <button onClick={() => toggleStatus(c.id, c.status)}
                      className={`px-3 py-2 rounded-xl text-[12px] font-semibold transition-all border ${c.status === 'active' ? 'border-slate-200 text-slate-600 hover:bg-slate-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}>
                      {c.status === 'active' ? 'Duraklat' : 'Aktif Et'}
                    </button>
                  </div>
                </div>

                {(c.endDate || c.maxParticipants) && (
                  <p className="text-[12px] text-slate-400 mt-3 pt-3 border-t border-slate-50 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">event</span>
                    {c.endDate && `Bitiş: ${new Date(c.endDate).toLocaleDateString('tr-TR')}`}
                    {c.endDate && c.maxParticipants && ' · '}
                    {c.maxParticipants && `Maks ${c.maxParticipants} katılımcı`}
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
