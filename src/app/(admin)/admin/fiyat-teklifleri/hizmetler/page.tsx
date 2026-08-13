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

  if (loading) return <div className="p-8 max-w-7xl mx-auto min-h-screen bg-surface text-on-surface-variant text-xs">Hizmet kütüphanesi yükleniyor...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-surface text-on-surface">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/15">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Teklif ve Servisler</span>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-1">Hizmet Kütüphanesi</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">{services.length} hizmet şablonu aktif.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openNew}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-container text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Yeni Hizmet</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/15 pb-3 overflow-x-auto">
        <button
          onClick={() => setCatFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 ${
            catFilter === 'all'
              ? 'bg-primary text-white border-primary shadow-sm'
              : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/25 hover:border-primary/40'
          }`}
        >
          Tümü
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCatFilter(c.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 ${
              catFilter === c.value
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/25 hover:border-primary/40'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-outline-variant/15 rounded-2xl overflow-hidden bg-surface-container-lowest">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-outline text-xs font-medium">
            Henüz hizmet eklenmemiş.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low border-b border-outline-variant/15 text-on-surface-variant uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="px-4 py-3">Hizmet Adı</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Fiyatlandırma Tipi</th>
                <th className="px-4 py-3 text-right">Alış Fiyatı ($)</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filtered.map((svc) => {
                const cat = CATEGORIES.find(c => c.value === svc.category);
                const pt = PRICING_TYPES.find(p => p.value === svc.defaultPricingType);
                return (
                  <tr key={svc.id} className="hover:bg-primary/[0.03] transition-colors">
                    <td className="px-4 py-3 font-bold text-on-surface">{svc.name}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{cat?.label || svc.category}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{pt?.label || svc.defaultPricingType}</td>
                    <td className="px-4 py-3 font-mono font-bold text-primary text-right">${svc.defaultCostUsd || 0}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => openEdit(svc)} className="p-1.5 text-outline hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button onClick={() => del(svc.id, svc.name)} className="p-1.5 text-outline hover:text-error transition-colors">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-primary-fixed/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
              <h3 className="text-sm font-bold text-on-surface">{editId ? 'Hizmet Düzenle' : 'Yeni Hizmet Ekle'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-outline hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-on-surface-variant mb-1">Hizmet Adı</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface-variant mb-1">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-on-surface-variant mb-1">Varsayılan Maliyet ($)</label>
                <input
                  type="number"
                  value={form.defaultCostUsd}
                  onChange={(e) => setForm({ ...form, defaultCostUsd: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={save}
                disabled={saving}
                className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-container transition-all active:scale-95 disabled:opacity-60"
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
