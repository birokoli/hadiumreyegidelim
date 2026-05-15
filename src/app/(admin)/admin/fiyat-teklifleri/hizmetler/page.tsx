'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ServiceItem {
  id: string;
  category: string;
  name: string;
  description?: string;
  defaultCost: number;
  currency: string;
  unit?: string;
  isActive: boolean;
}

const CATEGORIES = [
  { value: 'flight',   label: 'Uçuş',      icon: 'flight' },
  { value: 'hotel',    label: 'Otel',       icon: 'hotel' },
  { value: 'transfer', label: 'Transfer',   icon: 'directions_car' },
  { value: 'guide',    label: 'Rehber',     icon: 'person_pin' },
  { value: 'extra',    label: 'Ekstra',     icon: 'add_circle' },
];

const CURRENCIES = ['USD', 'EUR', 'TRY', 'SAR'];

const BLANK = {
  category: 'flight',
  name: '',
  description: '',
  defaultCost: 0,
  currency: 'USD',
  unit: '',
};

export default function ServiceLibraryPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('all');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    const res = await fetch('/api/admin/service-library');
    if (res.ok) {
      const data = await res.json();
      setServices(data.services ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

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
      description: svc.description ?? '',
      defaultCost: svc.defaultCost,
      currency: svc.currency,
      unit: svc.unit ?? '',
    });
    setModalOpen(true);
  }

  async function save() {
    if (!form.name.trim()) return alert('Hizmet adı zorunlu.');
    setSaving(true);
    const body = { ...form, defaultCost: Number(form.defaultCost) };
    const res = editId
      ? await fetch(`/api/admin/service-library/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch('/api/admin/service-library', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

    if (res.ok) {
      await load();
      setModalOpen(false);
    }
    setSaving(false);
  }

  async function remove(id: string, name: string) {
    if (!confirm(`"${name}" silinsin mi?`)) return;
    setDeleting(id);
    await fetch(`/api/admin/service-library/${id}`, { method: 'DELETE' });
    setServices(prev => prev.filter(s => s.id !== id));
    setDeleting(null);
  }

  const filtered = catFilter === 'all' ? services : services.filter(s => s.category === catFilter);

  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    items: filtered.filter(s => s.category === cat.value),
  })).filter(g => catFilter === 'all' ? g.items.length > 0 : g.value === catFilter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Link href="/admin/fiyat-teklifleri">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          </Link>
          <div>
            <h1 className="text-[22px] font-bold text-gray-900">Hizmet Kütüphanesi</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">{services.length} şablon · Tekliflerde hızlı ekleme için kullan</p>
          </div>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-[#003781] hover:bg-[#002d6a] text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Yeni Hizmet
        </button>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCatFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all ${catFilter === 'all' ? 'bg-[#003781] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#003781]/40 hover:text-[#003781]'}`}
        >
          Tümü ({services.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = services.filter(s => s.category === cat.value).length;
          return (
            <button
              key={cat.value}
              onClick={() => setCatFilter(cat.value)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all flex items-center gap-1.5 ${catFilter === cat.value ? 'bg-[#003781] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#003781]/40 hover:text-[#003781]'}`}
            >
              <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 text-[14px]">
          <span className="material-symbols-outlined animate-spin text-[24px] mr-2">progress_activity</span>
          Yükleniyor...
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#003781]/5 flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px] text-[#003781]" style={{ fontVariationSettings: "'FILL' 1" }}>library_books</span>
          </div>
          <div className="text-center">
            <p className="text-[15px] font-semibold text-gray-700">Kütüphane boş</p>
            <p className="text-[13px] text-gray-400 mt-1 max-w-xs">Sık kullandığın hizmetleri buraya ekle — tekliflerde tek tıkla eklenir.</p>
          </div>
          <button onClick={openNew} className="flex items-center gap-1.5 bg-[#003781] text-white text-[13px] font-semibold px-4 py-2 rounded-xl hover:bg-[#002d6a] transition-all active:scale-95">
            <span className="material-symbols-outlined text-[16px]">add</span>
            İlk hizmeti ekle
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-10 text-center text-[13px] text-gray-400">
          Bu kategoride henüz hizmet yok.{' '}
          <button onClick={openNew} className="text-[#003781] font-semibold hover:underline">Ekle</button>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(group => (
            <div key={group.value} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#003781]" style={{ fontVariationSettings: "'FILL' 1" }}>{group.icon}</span>
                <h2 className="text-[13px] font-bold text-gray-800">{group.label}</h2>
                <span className="text-[11px] text-gray-400 ml-1">{group.items.length} hizmet</span>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-5 py-2.5">Hizmet Adı</th>
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-2.5 hidden md:table-cell">Açıklama</th>
                    <th className="text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-2.5">Varsayılan Maliyet</th>
                    <th className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-2.5 hidden sm:table-cell">Birim</th>
                    <th className="px-4 py-2.5 w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {group.items.map(svc => (
                    <tr key={svc.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-[13px] font-semibold text-gray-900">{svc.name}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-[12px] text-gray-400 truncate max-w-[200px]">{svc.description || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-[13px] font-bold text-[#003781]">
                          {svc.defaultCost > 0 ? `${svc.defaultCost.toLocaleString('tr-TR')} ${svc.currency}` : '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-[12px] text-gray-500">{svc.unit || '—'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5 justify-end">
                          <button
                            onClick={() => openEdit(svc)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#003781] transition-colors"
                            title="Düzenle"
                          >
                            <span className="material-symbols-outlined text-[17px]">edit</span>
                          </button>
                          <button
                            onClick={() => remove(svc.id, svc.name)}
                            disabled={deleting === svc.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Sil"
                          >
                            <span className="material-symbols-outlined text-[17px]">{deleting === svc.id ? 'progress_activity' : 'delete'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-gray-900">{editId ? 'Hizmeti Düzenle' : 'Yeni Hizmet Ekle'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Category */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-2">Kategori</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                      className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-[10px] font-semibold transition-all ${form.category === cat.value ? 'border-[#003781] bg-[#003781]/5 text-[#003781]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                    >
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: form.category === cat.value ? "'FILL' 1" : "'FILL' 0" }}>{cat.icon}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Hizmet Adı *</label>
                <input
                  type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="örn. Türk Hava Yolları – İstanbul / Cidde"
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/15 focus:border-[#003781]/40"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Açıklama</label>
                <input
                  type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Opsiyonel detay..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/15 focus:border-[#003781]/40"
                />
              </div>

              {/* Cost + Currency + Unit */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Varsayılan Maliyet</label>
                  <input
                    type="number" value={form.defaultCost || ''} min={0}
                    onChange={e => setForm(f => ({ ...f, defaultCost: Number(e.target.value) }))}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[13px] text-amber-800 placeholder:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Döviz</label>
                  <select
                    value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-700 focus:outline-none"
                  >
                    {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Birim</label>
                <input
                  type="text" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  placeholder="kişi / gece / araç..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/15 focus:border-[#003781]/40"
                />
              </div>

              <p className="text-[11px] text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                Maliyet bilgisi yalnızca admin panelinde görünür, PDF'e yansımaz.
              </p>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex gap-2 justify-end">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors">
                İptal
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003781] hover:bg-[#002d6a] text-white text-[13px] font-semibold disabled:opacity-50 transition-all active:scale-95"
              >
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
