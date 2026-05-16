'use client';

import { useEffect, useState } from 'react';
import { VEHICLE_TYPES } from '@/lib/quotation-calc';

interface ServiceItem {
  id: string;
  category: string;
  name: string;
  description?: string;
  defaultPricingType: string;
  defaultCostUsd: number;
  defaultVehicleType?: string;
  defaultChildPercent?: number;
  defaultExtraBedPrice?: number;
  isActive: boolean;
}

const CATEGORIES = [
  { value: 'vize',     label: 'Vize İşlemleri',    icon: 'badge' },
  { value: 'hotel',    label: 'Konaklama',          icon: 'hotel' },
  { value: 'transfer', label: 'Transfer ve Ulaşım', icon: 'directions_car' },
  { value: 'tur',      label: 'Gezi ve Ziyaretler', icon: 'tour' },
  { value: 'flight',   label: 'Uçuş',               icon: 'flight' },
  { value: 'extra',    label: 'Ekstra Hizmetler',   icon: 'add_circle' },
];

const PRICING_TYPES = [
  { value: 'per_person',  label: 'Kişi başı' },
  { value: 'per_vehicle', label: 'Araç bazlı' },
  { value: 'per_room',    label: 'Oda + ek yatak' },
  { value: 'flat',        label: 'Sabit / adet' },
];

const BLANK = {
  category: 'vize',
  name: '',
  description: '',
  defaultPricingType: 'flat',
  defaultCostUsd: 0,
  defaultVehicleType: 'sedan',
  defaultChildPercent: 0,
  defaultExtraBedPrice: 0,
};

const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003781]/20 bg-white';

export default function ServiceLibraryPage() {
  const [services,  setServices]  = useState<ServiceItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [catFilter, setCatFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [form,      setForm]      = useState({ ...BLANK });
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch('/api/admin/service-library');
    if (res.ok) setServices((await res.json()).services ?? []);
    setLoading(false);
  }

  function openNew() {
    setEditId(null);
    setForm({ ...BLANK });
    setModalOpen(true);
  }

  function openEdit(svc: ServiceItem) {
    setEditId(svc.id);
    setForm({
      category:            svc.category,
      name:                svc.name,
      description:         svc.description || '',
      defaultPricingType:  svc.defaultPricingType,
      defaultCostUsd:      svc.defaultCostUsd,
      defaultVehicleType:  svc.defaultVehicleType || 'sedan',
      defaultChildPercent: svc.defaultChildPercent || 0,
      defaultExtraBedPrice: svc.defaultExtraBedPrice || 0,
    });
    setModalOpen(true);
  }

  async function save() {
    if (!form.name.trim()) return alert('Hizmet adı zorunlu.');
    setSaving(true);
    const url    = editId ? `/api/admin/service-library/${editId}` : '/api/admin/service-library';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { await load(); setModalOpen(false); }
    setSaving(false);
  }

  async function del(id: string, name: string) {
    if (!confirm(`"${name}" silinsin mi?`)) return;
    setDeleting(id);
    await fetch(`/api/admin/service-library/${id}`, { method: 'DELETE' });
    setServices(prev => prev.filter(s => s.id !== id));
    setDeleting(null);
  }

  const filtered = services.filter(s => catFilter === 'all' || s.category === catFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Hizmet Kütüphanesi</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">{services.length} hizmet şablonu</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-[#003781] hover:bg-[#002d6a] text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Yeni Hizmet
        </button>
      </div>

      {/* Kategori filtresi */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setCatFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${catFilter === 'all' ? 'bg-[#003781] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          Tümü
        </button>
        {CATEGORIES.map(c => (
          <button key={c.value} onClick={() => setCatFilter(c.value)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${catFilter === c.value ? 'bg-[#003781] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <span className="material-symbols-outlined animate-spin text-[24px] mr-2">progress_activity</span>
            Yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="material-symbols-outlined text-5xl text-gray-200" style={{ fontVariationSettings: "'FILL' 1" }}>library_books</span>
            <p className="text-[14px] text-gray-400">Henüz hizmet eklenmedi</p>
            <button onClick={openNew} className="text-[13px] font-semibold text-[#003781] hover:underline">İlk hizmeti ekle</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Hizmet Adı</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Kategori</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Fiyatlandırma</th>
                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Alış (USD)</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(svc => {
                const cat = CATEGORIES.find(c => c.value === svc.category);
                const pt  = PRICING_TYPES.find(p => p.value === svc.defaultPricingType);
                const vt  = VEHICLE_TYPES.find(v => v.value === svc.defaultVehicleType);
                return (
                  <tr key={svc.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-[13px] font-semibold text-gray-900">{svc.name}</p>
                      {svc.description && <p className="text-[11px] text-gray-400">{svc.description}</p>}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-[12px] text-gray-600">{cat?.label || svc.category}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <p className="text-[12px] text-gray-600">{pt?.label || svc.defaultPricingType}</p>
                      {svc.defaultPricingType === 'per_vehicle' && vt &&
                        <p className="text-[11px] text-gray-400">{vt.label} ({vt.capacity} kişi)</p>}
                      {svc.defaultPricingType === 'per_person' && (svc.defaultChildPercent ?? 0) > 0 &&
                        <p className="text-[11px] text-gray-400">Çocuk: %{svc.defaultChildPercent}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <p className="text-[14px] font-bold text-gray-900">${svc.defaultCostUsd.toFixed(2)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => openEdit(svc)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#003781] transition-colors">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button onClick={() => del(svc.id, svc.name)} disabled={deleting === svc.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">{deleting === svc.id ? 'progress_activity' : 'delete'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">{editId ? 'Hizmeti Düzenle' : 'Yeni Hizmet'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Temel bilgiler */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Kategori</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className={inputCls}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Fiyatlandırma Tipi</label>
                  <select value={form.defaultPricingType} onChange={e => setForm(f => ({ ...f, defaultPricingType: e.target.value }))}
                    className={inputCls}>
                    {PRICING_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Hizmet Adı *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Al Ebaa Hotel - Mekke" className={inputCls} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Açıklama</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Opsiyonel not..." className={inputCls} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                  {form.defaultPricingType === 'per_room' ? 'Oda Alış Fiyatı (USD)' : 'Birim Alış Fiyatı (USD)'}
                </label>
                <input type="number" min={0} step={0.01} value={form.defaultCostUsd}
                  onChange={e => setForm(f => ({ ...f, defaultCostUsd: Number(e.target.value) }))}
                  className={inputCls} />
              </div>

              {/* per_person: çocuk % */}
              {form.defaultPricingType === 'per_person' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Çocuk Oranı (%)</label>
                  <input type="number" min={0} max={100} step={5} value={form.defaultChildPercent}
                    onChange={e => setForm(f => ({ ...f, defaultChildPercent: Number(e.target.value) }))}
                    placeholder="0 = çocuk dahil değil, 50 = %50 indirim..." className={inputCls} />
                </div>
              )}

              {/* per_vehicle: araç tipi */}
              {form.defaultPricingType === 'per_vehicle' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Araç Tipi</label>
                  <select value={form.defaultVehicleType} onChange={e => setForm(f => ({ ...f, defaultVehicleType: e.target.value }))}
                    className={inputCls}>
                    {VEHICLE_TYPES.map(v => <option key={v.value} value={v.value}>{v.label} ({v.capacity} kişilik)</option>)}
                  </select>
                </div>
              )}

              {/* per_room: ek yatak fiyatı */}
              {form.defaultPricingType === 'per_room' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">Ek Yatak Alış Fiyatı (USD)</label>
                  <input type="number" min={0} step={0.01} value={form.defaultExtraBedPrice}
                    onChange={e => setForm(f => ({ ...f, defaultExtraBedPrice: Number(e.target.value) }))}
                    className={inputCls} />
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-[13px] text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                İptal
              </button>
              <button onClick={save} disabled={saving}
                className="flex items-center gap-1.5 bg-[#003781] hover:bg-[#002d6a] disabled:opacity-50 text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-all">
                <span className="material-symbols-outlined text-[16px]">{saving ? 'progress_activity' : 'save'}</span>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
