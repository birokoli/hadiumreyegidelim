'use client';

import { useState } from 'react';

const commissionLabel = (rate: number) => `%${(rate * 100).toFixed(1)}`;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:  { label: 'Bekliyor',     color: 'bg-amber-50 text-amber-700' },
  earned:   { label: 'Tamamlandı',   color: 'bg-green-50 text-green-700' },
  paid:     { label: 'Ödendi',       color: 'bg-blue-50 text-blue-700' },
  refunded: { label: 'İade',         color: 'bg-red-50 text-red-600' },
};

export default function AdminInfluencerSalesPanel({
  influencerId,
  initialSales,
}: {
  influencerId: string;
  initialSales: any[];
}) {
  const [sales, setSales] = useState(initialSales);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    umrePackage: '',
    saleAmount: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [msg, setMsg] = useState('');

  async function handleCreate() {
    setLoading(true);
    setMsg('');
    const res = await fetch(`/api/admin/influencers/${influencerId}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, saleAmount: Number(form.saleAmount) }),
    });
    const json = await res.json();
    if (json.error) {
      setMsg(json.error);
    } else {
      setMsg('Satış oluşturuldu.');
      setForm({ customerName: '', customerPhone: '', umrePackage: '', saleAmount: '', notes: '' });
      setShowForm(false);
      setSales([json.sale, ...sales]);
    }
    setLoading(false);
  }

  async function handleAction(saleId: string, action: 'complete' | 'refund') {
    setActionLoading(saleId + action);
    const res = await fetch(`/api/admin/influencers/${influencerId}/sales`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saleId, action }),
    });
    const json = await res.json();
    if (json.success) {
      setSales(sales.map(s =>
        s.id === saleId
          ? { ...s, commissionStatus: action === 'complete' ? 'earned' : 'refunded' }
          : s
      ));
    }
    setActionLoading('');
  }

  const totalEarned = sales
    .filter(s => s.commissionStatus === 'earned')
    .reduce((sum: number, s: any) => sum + s.saleAmount, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-slate-400" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
          <h2 className="font-semibold text-slate-900">Satışlar</h2>
          <span className="text-[12px] text-slate-400">{sales.length} kayıt</span>
        </div>
        <div className="flex items-center gap-3">
          {totalEarned > 0 && (
            <span className="text-[13px] text-emerald-600 font-semibold">
              Toplam: ₺{totalEarned.toLocaleString('tr-TR')}
            </span>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 bg-[#003781] text-white text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-[#002a63] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Yeni Satış
          </button>
        </div>
      </div>

      {/* Satış ekleme formu */}
      {showForm && (
        <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 space-y-4">
          <p className="text-[13px] font-semibold text-slate-700">Yeni Satış Ekle</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] text-slate-500 font-medium">Müşteri Adı Soyadı *</label>
              <input
                placeholder="Ahmet Yılmaz"
                value={form.customerName}
                onChange={e => setForm({ ...form, customerName: e.target.value })}
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20"
              />
            </div>
            <div>
              <label className="text-[12px] text-slate-500 font-medium">Telefon *</label>
              <input
                placeholder="05XX XXX XX XX"
                value={form.customerPhone}
                onChange={e => setForm({ ...form, customerPhone: e.target.value })}
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20"
              />
            </div>
            <div>
              <label className="text-[12px] text-slate-500 font-medium">Paket Adı</label>
              <input
                placeholder="Standart Umre 2026"
                value={form.umrePackage}
                onChange={e => setForm({ ...form, umrePackage: e.target.value })}
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20"
              />
            </div>
            <div>
              <label className="text-[12px] text-slate-500 font-medium">Satış Tutarı (₺) *</label>
              <input
                type="number"
                placeholder="18000"
                value={form.saleAmount}
                onChange={e => setForm({ ...form, saleAmount: e.target.value })}
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20"
              />
              {form.saleAmount && (
                <p className="text-[11px] text-slate-400 mt-1">
                  Komisyon: {commissionLabel(
                    Number(form.saleAmount) < 18000 ? 0.015 :
                    Number(form.saleAmount) < 28000 ? 0.018 :
                    Number(form.saleAmount) < 45000 ? 0.020 : 0.025
                  )} = ₺{(Number(form.saleAmount) * (
                    Number(form.saleAmount) < 18000 ? 0.015 :
                    Number(form.saleAmount) < 28000 ? 0.018 :
                    Number(form.saleAmount) < 45000 ? 0.020 : 0.025
                  )).toLocaleString('tr-TR')}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="text-[12px] text-slate-500 font-medium">Not</label>
              <input
                placeholder="Kupon kodu kullandı, telefonda anlaşıldı..."
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
                className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#003781]/20"
              />
            </div>
          </div>
          {msg && (
            <p className={`text-[13px] px-3 py-2 rounded-lg ${msg.includes('oluşturuldu') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {msg}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={loading || !form.customerName || !form.customerPhone || !form.saleAmount}
              className="bg-[#003781] text-white text-[13px] font-semibold px-5 py-2 rounded-xl hover:bg-[#002a63] transition-colors disabled:opacity-50"
            >
              {loading ? 'Kaydediliyor...' : 'Satışı Kaydet'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-[13px] text-slate-500 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Satış listesi */}
      {sales.length === 0 ? (
        <div className="py-10 text-center">
          <span className="material-symbols-outlined text-4xl text-slate-200">receipt_long</span>
          <p className="text-sm mt-2 text-slate-400">Henüz satış yok</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {sales.map((s: any) => {
            const st = STATUS_LABELS[s.commissionStatus] || STATUS_LABELS.pending;
            return (
              <div key={s.id} className="px-6 py-4 flex items-start gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-semibold text-slate-900">
                      ₺{s.saleAmount.toLocaleString('tr-TR')}
                    </p>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                    {s.pointsEarned > 0 && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">
                        +{s.pointsEarned.toLocaleString('tr-TR')} <span className="material-symbols-outlined text-[12px] align-[-1px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> {s.monthlyMultiplierAtSale && s.monthlyMultiplierAtSale !== 1 ? `(${s.monthlyMultiplierAtSale}x)` : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    {s.umrePackage ? `${s.umrePackage} · ` : ''}
                    Komisyon: {commissionLabel(s.commissionRate)} = ₺{s.commissionAmount.toLocaleString('tr-TR')}
                  </p>
                  {s.notes && <p className="text-[12px] text-slate-400 mt-0.5 truncate">{s.notes}</p>}
                  <p className="text-[11px] text-slate-300 mt-0.5">{new Date(s.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
                {s.commissionStatus === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(s.id, 'complete')}
                      disabled={actionLoading === s.id + 'complete'}
                      className="bg-emerald-600 text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === s.id + 'complete' ? '...' : 'Tamamla + Puan Ver'}
                    </button>
                    <button
                      onClick={() => handleAction(s.id, 'refund')}
                      disabled={actionLoading === s.id + 'refund'}
                      className="bg-red-50 text-red-600 text-[12px] font-semibold px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      İptal
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
