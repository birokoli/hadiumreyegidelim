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
  { value: 'vize', label: 'Vize İşlemleri' },
  { value: 'hotel', label: 'Konaklama' },
  { value: 'transfer', label: 'Transfer ve Ulaşım' },
  { value: 'tur', label: 'Gezi ve Ziyaretler' },
  { value: 'flight', label: 'Uçuş' },
  { value: 'extra', label: 'Ekstra Hizmetler' },
];

const PRICING_TYPES = [
  { value: 'per_person', label: 'Kişi başı' },
  { value: 'per_vehicle', label: 'Araç bazlı' },
  { value: 'per_room', label: 'Oda + ek yatak' },
  { value: 'flat', label: 'Sabit / adet' },
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

export default function ServiceLibraryPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);

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
      category: svc.category,
      name: svc.name,
      description: svc.description || '',
      defaultPricingType: svc.defaultPricingType,
      defaultCostUsd: svc.defaultCostUsd,
      defaultVehicleType: svc.defaultVehicleType || 'sedan',
      defaultChildPercent: svc.defaultChildPercent || 0,
      defaultExtraBedPrice: svc.defaultExtraBedPrice || 0,
    });
    setModalOpen(true);
  }

  async function save() {
    if (!form.name.trim()) return alert('Hizmet adı zorunlu.');
    setSaving(true);
    const url = editId ? `/api/admin/service-library/${editId}` : '/api/admin/service-library';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { await load(); setModalOpen(false); }
    setSaving(false);
  }

  async function del(id: string, name: string) {
    if (!confirm(`"${name}" silinsin mi?`)) return;
    await fetch(`/api/admin/service-library/${id}`, { method: 'DELETE' });
    setServices(prev => prev.filter(s => s.id !== id));
  }

  const filtered = services.filter(s => catFilter === 'all' || s.category === catFilter);

  if (loading) return <div className="p-8 max-w-7xl mx-auto min-h-screen bg-white text-zinc-500 text-xs">Hizmet kütüphanesi yükleniyor...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-white text-zinc-900">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">TEKLIF VE SERVISLER</span>
          <h1 className="text-2xl font-light tracking-tight text-zinc-900 mt-1">Hizmet Kütüphanesi</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{services.length} hizmet şablonu aktif.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openNew}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-4 py-2 rounded text-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Yeni Hizmet</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setCatFilter('all')}
          className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
            catFilter === 'all'
              ? 'bg-zinc-900 text-white border-zinc-900 font-semibold'
              : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900'
          }`}
        >
          Tümü
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCatFilter(c.value)}
            className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
              catFilter === c.value
                ? 'bg-zinc-900 text-white border-zinc-900 font-semibold'
                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-zinc-200 rounded overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 text-xs font-medium">
            Henüz hizmet eklenmemiş.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="px-4 py-3">Hizmet Adı</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Fiyatlandırma Tipi</th>
                <th className="px-4 py-3 text-right">Alış Fiyatı ($)</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((svc) => {
                const cat = CATEGORIES.find(c => c.value === svc.category);
                const pt = PRICING_TYPES.find(p => p.value === svc.defaultPricingType);
                return (
                  <tr key={svc.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-zinc-900">{svc.name}</td>
                    <td className="px-4 py-3 text-zinc-500">{cat?.label || svc.category}</td>
                    <td className="px-4 py-3 text-zinc-500">{pt?.label || svc.defaultPricingType}</td>
                    <td className="px-4 py-3 font-mono font-bold text-zinc-900 text-right">${svc.defaultCostUsd || 0}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => openEdit(svc)} className="p-1 text-zinc-400 hover:text-zinc-900">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button onClick={() => del(svc.id, svc.name)} className="p-1 text-zinc-400 hover:text-red-600">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 rounded max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">{editId ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-zinc-400 hover:text-zinc-900">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Hizmet Adı</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded p-2 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 mb-1">Varsayılan Maliyet ($)</label>
                <input
                  type="number"
                  value={form.defaultCostUsd}
                  onChange={(e) => setForm({ ...form, defaultCostUsd: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-zinc-200 rounded p-2 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={save}
                disabled={saving}
                className="w-full py-2 bg-zinc-900 text-white rounded text-xs font-medium hover:bg-zinc-800 transition-colors"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
