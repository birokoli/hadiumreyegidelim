'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  isPublic?: boolean;
  slug?: string | null;
  city?: string | null;
  imageUrl?: string | null;
  publicDescription?: string | null;
  hotelStars?: number | null;
  distanceMeters?: number | null;
}

const CITIES = [
  { value: '', label: '—' },
  { value: 'mekke', label: 'Mekke' },
  { value: 'medine', label: 'Medine' },
  { value: 'cidde', label: 'Cidde' },
  { value: 'tr', label: 'Türkiye (kalkış)' },
];

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
  isPublic: false,
  slug: '',
  city: '',
  imageUrl: '',
  publicDescription: '',
  hotelStars: '' as number | '',
  distanceMeters: '' as number | '',
};

export default function ServiceLibraryPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('all');
  const [publicFilter, setPublicFilter] = useState<'all' | 'public' | 'hidden'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...BLANK });
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  type CatalogStatus = { total: number; public: number; hotels: { public: number; mekke: number; medine: number; noCity: string[] }; noPrice: string[]; nusukHidden: string[]; siteNow: number; siteFresh: number | null; error: string | null };
  const [status, setStatus] = useState<CatalogStatus | null>(null);
  const loadStatus = () => fetch('/api/admin/catalog-status').then((r) => r.json()).then((d) => setStatus(d.error && d.total == null ? null : d)).catch(() => {});
  const refreshSite = async () => { await fetch('/api/admin/catalog-status', { method: 'POST' }); setTimeout(loadStatus, 800); };

  useEffect(() => {
    let alive = true;
    fetch('/api/admin/catalog-status').then((r) => r.json()).then((d) => { if (alive) setStatus(d.error && d.total == null ? null : d); }).catch(() => {});
    fetch('/api/admin/service-library').then((r) => r.json()).then((d) => { if (alive) { setServices(d.services ?? []); setLoading(false); } }).catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  async function load() {
    loadStatus();
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
      isPublic: !!svc.isPublic,
      slug: svc.slug || '',
      city: svc.city || '',
      imageUrl: svc.imageUrl || '',
      publicDescription: svc.publicDescription || '',
      hotelStars: svc.hotelStars ?? '',
      distanceMeters: svc.distanceMeters ?? '',
    });
    setModalOpen(true);
  }

  async function save() {
    if (!form.name.trim()) return alert('Hizmet adı zorunlu.');
    if (form.category === 'hotel' && !form.city) return alert('Otel için şehir seçin (Mekke ya da Medine); şehri olmayan otel planlayıcıda görünmez.');
    setSaving(true);
    const url = editId ? `/api/admin/service-library/${editId}` : '/api/admin/service-library';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { await load(); setModalOpen(false); }
    setSaving(false);
  }

  async function togglePublic(svc: ServiceItem) {
    setTogglingId(svc.id);
    setErrorMsg(null);
    const nextPublic = !svc.isPublic;
    const body = {
      category: svc.category,
      name: svc.name,
      description: svc.description || '',
      defaultPricingType: svc.defaultPricingType,
      defaultCostUsd: svc.defaultCostUsd,
      defaultVehicleType: svc.defaultVehicleType || 'sedan',
      defaultChildPercent: svc.defaultChildPercent || 0,
      defaultExtraBedPrice: svc.defaultExtraBedPrice || 0,
      isPublic: nextPublic,
      slug: svc.slug || '',
      city: svc.city || '',
      imageUrl: svc.imageUrl || '',
      publicDescription: svc.publicDescription || '',
      hotelStars: svc.hotelStars ?? '',
      distanceMeters: svc.distanceMeters ?? '',
    };
    const res = await fetch(`/api/admin/service-library/${svc.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setServices(prev => prev.map(s => s.id === svc.id ? { ...s, isPublic: nextPublic } : s));
    } else {
      setErrorMsg(`"${svc.name}" sitede gösterim durumu güncellenemedi.`);
    }
    setTogglingId(null);
  }

  async function makeAllFilteredPublic() {
    const hiddenInFilter = filtered.filter(s => !s.isPublic);
    if (hiddenInFilter.length === 0) return alert('Seçili filtredeki tüm hizmetler zaten sitede görünüyor.');
    if (!confirm(`Filtrelenen ${hiddenInFilter.length} hizmet sitede gösterilecek. Onaylıyor musunuz?`)) return;

    for (const svc of hiddenInFilter) {
      await togglePublic({ ...svc, isPublic: false });
    }
  }

  async function importLegacy() {
    if (!confirm('Eski otel ve hizmetler kütüphaneye aktarılsın mı? Mevcut kayıtlar korunacak, mükerrer olanlar atlanacak.')) return;
    setImporting(true);
    try {
      const res = await fetch('/api/admin/service-library/import-legacy', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(`Aktarım tamamlandı: ${data.created ?? 0} yeni kayıt eklendi, ${data.skipped ?? 0} kayıt zaten vardı${data.completed ? `, ${data.completed} otelin eksik bilgisi (şehir, yıldız, mesafe, görsel) tamamlandı` : ''}.`);
        await load();
      } else {
        alert(`Aktarım hatası: ${data.error || 'Bilinmeyen hata'}`);
      }
    } catch (err) {
      alert(`Aktarım hatası: ${err instanceof Error ? err.message : 'bilinmeyen'}`);
    }
    setImporting(false);
  }

  async function del(id: string, name: string) {
    if (!confirm(`"${name}" silinsin mi?`)) return;
    await fetch(`/api/admin/service-library/${id}`, { method: 'DELETE' });
    setServices(prev => prev.filter(s => s.id !== id));
  }

  const filtered = services.filter(s => {
    if (catFilter !== 'all' && s.category !== catFilter) return false;
    if (publicFilter === 'public' && !s.isPublic) return false;
    if (publicFilter === 'hidden' && s.isPublic) return false;
    return true;
  });

  if (loading) return <div className="p-8 max-w-7xl mx-auto min-h-screen bg-surface text-on-surface-variant text-xs">Hizmet kütüphanesi yükleniyor...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-surface text-on-surface">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/15">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Teklif ve Servisler</span>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-1">Hizmet Kütüphanesi</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">{services.length} hizmet şablonu aktif ({services.filter(s => s.isPublic).length} sitede görünür).</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={importLegacy}
            disabled={importing}
            className="inline-flex items-center gap-1.5 border border-outline-variant/30 text-on-surface font-bold px-3.5 py-2 rounded-xl text-xs hover:bg-surface-container-low disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>{importing ? 'Aktarılıyor...' : 'Eski verileri aktar'}</span>
          </button>

          <Link href="/admin/fiyat-teklifleri/hizmetler/fiyatlar"
            className="inline-flex items-center gap-1.5 border border-primary/30 text-primary font-bold px-3.5 py-2 rounded-xl text-xs hover:bg-primary/[0.04]"
          >
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            <span>Aylık satış fiyatları</span>
          </Link>
          
          <button
            onClick={openNew}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-container text-white font-bold px-4 py-2 rounded-xl text-xs transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Yeni Hizmet</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-error/10 text-error rounded-xl text-xs font-bold border border-error/20">
          {errorMsg}
        </div>
      )}

      {status && (
        <div className={`rounded-2xl border p-4 text-xs ${status.error || status.hotels.noCity.length || !status.hotels.mekke || !status.hotels.medine ? 'border-amber-300 bg-amber-50' : 'border-primary/20 bg-primary/[0.03]'}`} role="status">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-bold text-primary">
              Sitede şu an: {status.siteNow} kalem · Mekke oteli {status.hotels.mekke} · Medine oteli {status.hotels.medine}
              {status.siteFresh != null && status.siteFresh !== status.siteNow && <span className="ml-2 font-normal text-amber-800">(güncel veride {status.siteFresh}; site henüz yenilenmedi)</span>}
            </p>
            <button onClick={refreshSite} className="rounded-lg border border-primary/30 px-3 py-1.5 font-bold text-primary hover:bg-primary/[0.05]">Siteyi yenile</button>
          </div>
          <ul className="mt-2 space-y-1 text-on-surface-variant">
            {status.public === 0 && <li>• Hiçbir kalem "Sitede göster" durumunda değil. Satmak istediklerinizin anahtarını açın (ya da "Hepsini sitede göster").</li>}
            {status.hotels.noCity.length > 0 && <li>• <b>Şehri seçilmemiş {status.hotels.noCity.length} otel</b> planlayıcıda görünmez (Mekke/Medine bilinmiyor): {status.hotels.noCity.slice(0, 8).join(', ')}{status.hotels.noCity.length > 8 ? '…' : ''}. Düzenle → Şehir.</li>}
            {status.noPrice.length > 0 && <li>• Alış fiyatı ve aylık fiyatı olmayan {status.noPrice.length} kalem sitede "teklifte" görünür: {status.noPrice.slice(0, 6).join(', ')}{status.noPrice.length > 6 ? '…' : ''}.</li>}
            {status.nusukHidden.length > 0 && <li>• Nusuk kalemleri işaretli olsa da sitede gösterilmez (kural).</li>}
            {status.error && <li className="text-error">• Katalog okunurken hata: {status.error}</li>}
          </ul>
        </div>
      )}

      {/* Filters and Batch Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/15 pb-4">
        {/* Category Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setCatFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 ${
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 ${
                catFilter === c.value
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/25 hover:border-primary/40'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Public Status Filter & Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/20">
            <button
              onClick={() => setPublicFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                publicFilter === 'all' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setPublicFilter('public')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                publicFilter === 'public' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Sitede
            </button>
            <button
              onClick={() => setPublicFilter('hidden')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                publicFilter === 'hidden' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Gizli
            </button>
          </div>

          <button
            onClick={makeAllFilteredPublic}
            className="inline-flex items-center gap-1 bg-secondary/10 text-secondary hover:bg-secondary/20 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>Hepsini sitede göster</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="border border-outline-variant/15 rounded-2xl overflow-hidden bg-surface-container-lowest">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-outline text-xs font-medium">
            Filtreye uygun hizmet bulunamadı.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low border-b border-outline-variant/15 text-on-surface-variant uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="px-4 py-3">Hizmet Adı</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Fiyatlandırma Tipi</th>
                <th className="px-4 py-3">Sitede Göster</th>
                <th className="px-4 py-3 text-right">Alış Fiyatı ($)</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filtered.map((svc) => {
                const cat = CATEGORIES.find(c => c.value === svc.category);
                const pt = PRICING_TYPES.find(p => p.value === (svc.category === 'hotel' ? 'per_room' : svc.defaultPricingType));
                return (
                  <tr key={svc.id} className="hover:bg-primary/[0.03] transition-colors">
                    <td className="px-4 py-3 font-bold text-on-surface">{svc.name}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{cat?.label || svc.category}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{pt?.label || svc.defaultPricingType}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublic(svc)}
                        disabled={togglingId === svc.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                          svc.isPublic
                            ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
                            : 'bg-outline-variant/15 border-outline-variant/25 text-outline hover:bg-outline-variant/30 hover:text-on-surface'
                        }`}
                        title="Sitede gösterim durumunu değiştirmek için tıklayın"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {svc.isPublic ? 'visibility' : 'visibility_off'}
                        </span>
                        <span>{svc.isPublic ? 'Görünür' : 'Gizli'}</span>
                      </button>
                    </td>
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
        <div className="admin-modal-scrim fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-primary-fixed/40 backdrop-blur-sm">
          <div className="admin-modal-panel bg-surface-container-lowest border border-outline-variant/15 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
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

              {/* Sitede Göster Kutusu (Hizmet Adının hemen altında) */}
              <div className="rounded-xl border border-primary/20 bg-primary/[0.03] p-3 space-y-2">
                <label className="flex items-center gap-2 font-bold text-on-surface cursor-pointer">
                  <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} className="h-4 w-4 accent-[#003781]" />
                  Sitede göster (planlayıcı, otel ve fiyat sayfaları)
                </label>
                <p className="text-[11px] text-on-surface-variant">Sitede yalnızca satış fiyatı (varsayılan: maliyet + %15 otel / %10 diğer) veya aylık özel fiyat görünür; maliyet asla gösterilmez.</p>
                {!form.isPublic && form.category === 'hotel' && (
                  <div>
                    <label className="block font-bold text-on-surface-variant mb-1">Şehir (otel için gerekli)</label>
                    <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40">
                      {CITIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                )}
                {form.isPublic && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-on-surface-variant mb-1">Şehir</label>
                      <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40">
                        {CITIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-on-surface-variant mb-1">Adres (boşsa addan üretilir)</label>
                      <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="ornek-otel-mekke" className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40 font-mono" />
                    </div>
                    {form.category === 'hotel' && (
                      <>
                        <div>
                          <label className="block font-bold text-on-surface-variant mb-1">Yıldız</label>
                          <input type="number" min={1} max={5} value={form.hotelStars} onChange={(e) => setForm({ ...form, hotelStars: e.target.value === '' ? '' : Number(e.target.value) })} className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40" />
                        </div>
                        <div>
                          <label className="block font-bold text-on-surface-variant mb-1">Harem'e mesafe (metre)</label>
                          <input type="number" value={form.distanceMeters} onChange={(e) => setForm({ ...form, distanceMeters: e.target.value === '' ? '' : Number(e.target.value) })} className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40" />
                        </div>
                      </>
                    )}
                    <div className="col-span-2">
                      <label className="block font-bold text-on-surface-variant mb-1">Görsel adresi</label>
                      <input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40" />
                    </div>
                    <div className="col-span-2">
                      <label className="block font-bold text-on-surface-variant mb-1">Sitedeki açıklama (müşteri görür; "en ucuz", "sıfır", "garanti" yazmayın)</label>
                      <textarea rows={3} value={form.publicDescription} onChange={(e) => setForm({ ...form, publicDescription: e.target.value })} className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40" />
                    </div>
                  </div>
                )}
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
                <label className="block font-bold text-on-surface-variant mb-1">Açıklama (iç kullanım, teklifte görünür)</label>
                <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-on-surface-variant mb-1">Fiyatlandırma tipi</label>
                  <select value={form.category === 'hotel' ? 'per_room' : form.defaultPricingType} disabled={form.category === 'hotel'} title={form.category === 'hotel' ? 'Otel her zaman 1 oda / 1 gece fiyatlanır' : undefined} onChange={(e) => setForm({ ...form, defaultPricingType: e.target.value })} className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40">
                    {PRICING_TYPES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-on-surface-variant mb-1">Varsayılan maliyet ($)</label>
                  <input type="number" value={form.defaultCostUsd} onChange={(e) => setForm({ ...form, defaultCostUsd: parseFloat(e.target.value) || 0 })} className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40" />
                </div>
                {form.defaultPricingType === 'per_vehicle' && (
                  <div>
                    <label className="block font-bold text-on-surface-variant mb-1">Araç tipi</label>
                    <select value={form.defaultVehicleType} onChange={(e) => setForm({ ...form, defaultVehicleType: e.target.value })} className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40 font-mono text-xs">
                      {VEHICLE_TYPES.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
                    </select>
                  </div>
                )}
                {form.defaultPricingType === 'per_person' && (
                  <div>
                    <label className="block font-bold text-on-surface-variant mb-1">Çocuk fiyatı (yetişkinin %)</label>
                    <input type="number" value={form.defaultChildPercent} onChange={(e) => setForm({ ...form, defaultChildPercent: parseFloat(e.target.value) || 0 })} className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40" />
                  </div>
                )}
                {form.defaultPricingType === 'per_room' && (
                  <div>
                    <label className="block font-bold text-on-surface-variant mb-1">Ek yatak maliyeti ($)</label>
                    <input type="number" value={form.defaultExtraBedPrice} onChange={(e) => setForm({ ...form, defaultExtraBedPrice: parseFloat(e.target.value) || 0 })} className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40" />
                  </div>
                )}
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
