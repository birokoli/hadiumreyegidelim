'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  VEHICLE_TYPES, vehicleCapacityWarning, roomCapacityWarning, calcSaleTotal, round2,
  type PricingType, type QuotationItemCalc,
} from '@/lib/quotation-calc';

// ─── Tipler ───────────────────────────────────────────────────
interface ServiceLibItem {
  id: string; category: string; name: string;
  defaultPricingType: string; defaultCostUsd: number;
  defaultVehicleType?: string; defaultChildPercent?: number;
  defaultExtraBedPrice?: number;
}

interface Item {
  _key:              string;
  category:          string;
  name:              string;
  pricingType:       PricingType;
  unitCostUsd:       number;
  quantity:          number;
  childPricePercent: number;
  vehicleType:       string;
  extraBedCount:     number;
  extraBedPriceUsd:  number;
  saleTotalUsd:      number;
  sortOrder:         number;
}

const CATEGORIES = [
  { value: 'vize',     label: 'Vize İşlemleri',     icon: 'badge' },
  { value: 'hotel',    label: 'Konaklama',           icon: 'hotel' },
  { value: 'transfer', label: 'Transfer ve Ulaşım',  icon: 'directions_car' },
  { value: 'tur',      label: 'Gezi ve Ziyaretler',  icon: 'tour' },
  { value: 'flight',   label: 'Uçuş',                icon: 'flight' },
  { value: 'extra',    label: 'Ekstra Hizmetler',    icon: 'add_circle' },
];

const PRICING_TYPES: { value: PricingType; label: string }[] = [
  { value: 'per_person',  label: 'Kişi başı' },
  { value: 'per_vehicle', label: 'Araç bazlı' },
  { value: 'per_room',    label: 'Oda + ek yatak' },
  { value: 'flat',        label: 'Sabit / adet' },
];

const STATUS_OPTIONS = [
  { value: 'draft',    label: 'Taslak' },
  { value: 'sent',     label: 'Gönderildi' },
  { value: 'accepted', label: 'Kabul Edildi' },
  { value: 'rejected', label: 'Reddedildi' },
  { value: 'expired',  label: 'Süresi Doldu' },
];

const CAT_ORDER = ['vize', 'hotel', 'transfer', 'tur', 'flight', 'extra'];

function uid() { return Math.random().toString(36).slice(2, 9); }

function blankItem(category = 'vize', margin = 18): Item {
  return {
    _key: uid(), category, name: '',
    pricingType: 'flat', unitCostUsd: 0, quantity: 1,
    childPricePercent: 0, vehicleType: 'sedan',
    extraBedCount: 0, extraBedPriceUsd: 0,
    saleTotalUsd: 0, sortOrder: 0,
  };
  void margin;
}

// ─── Ana bileşen ──────────────────────────────────────────────
export default function QuotationForm({ editId }: { editId?: string }) {
  const router = useRouter();

  // Form state
  const [customerName,  setCustomerName]  = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [adultsCount,   setAdultsCount]   = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [travelDate,    setTravelDate]    = useState('');
  const [startDate,     setStartDate]     = useState('');
  const [validUntil,    setValidUntil]    = useState('3 iş günü');
  const [margin,        setMargin]        = useState(18);
  const [usdRate,       setUsdRate]       = useState(0);
  const [notes,         setNotes]         = useState('');
  const [status,        setStatus]        = useState('draft');
  const [items,         setItems]         = useState<Item[]>([]);
  const [quotationNo,   setQuotationNo]   = useState('');
  const [addingCat,     setAddingCat]     = useState('vize');

  // UI state
  const [saving,      setSaving]      = useState(false);
  const [activeTab,   setActiveTab]   = useState<'form' | 'preview'>('form');
  const [serviceLib,  setServiceLib]  = useState<ServiceLibItem[]>([]);
  const [libOpen,     setLibOpen]     = useState(false);
  const [libSearch,   setLibSearch]   = useState('');
  const [libCat,      setLibCat]      = useState('');

  // Hesap bağlamı
  const ctx = useCallback(() => ({
    adultsCount, childrenCount, margin,
  }), [adultsCount, childrenCount, margin]);

  // Kalem hesapla
  const computeItem = useCallback((item: Item): Item => {
    const calc: QuotationItemCalc = {
      pricingType: item.pricingType, unitCostUsd: item.unitCostUsd,
      quantity: item.quantity, childPricePercent: item.childPricePercent,
      vehicleType: item.vehicleType, extraBedCount: item.extraBedCount,
      extraBedPriceUsd: item.extraBedPriceUsd,
    };
    return { ...item, saleTotalUsd: calcSaleTotal(calc, ctx()) };
  }, [ctx]);

  // Tüm kalemleri yeniden hesapla (margin/kişi değişince)
  useEffect(() => {
    setItems(prev => prev.map(computeItem));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [margin, adultsCount, childrenCount]);

  // Hizmet kütüphanesi yükle
  useEffect(() => {
    fetch('/api/admin/service-library').then(r => r.json()).then(d => setServiceLib(d.services ?? []));
  }, []);

  // Mevcut teklifi yükle (düzenleme)
  useEffect(() => {
    if (!editId) return;
    fetch(`/api/admin/quotations/${editId}`)
      .then(r => r.json())
      .then(d => {
        const q = d.quotation;
        if (!q) return;
        setCustomerName(q.customerName);
        setCustomerPhone(q.customerPhone ?? '');
        setCustomerEmail(q.customerEmail ?? '');
        setAdultsCount(q.adultsCount ?? 1);
        setChildrenCount(q.childrenCount ?? 0);
        setTravelDate(q.travelDate ?? '');
        setStartDate(q.startDate ?? '');
        setValidUntil(q.validUntil ?? '3 iş günü');
        setMargin(q.margin ?? 18);
        setUsdRate(q.usdRate ?? 0);
        setNotes(q.notes ?? '');
        setStatus(q.status);
        setQuotationNo(q.quotationNo);
        setItems(q.items.map((i: Item & { id: string }) => ({
          ...i, _key: i.id,
          pricingType:       (i.pricingType as PricingType) || 'flat',
          vehicleType:       i.vehicleType || 'sedan',
        })));
      });
  }, [editId]);

  // ─── Kalem yönetimi ─────────────────────────────────────────
  function addItem() {
    const item = computeItem(blankItem(addingCat, margin));
    setItems(prev => [...prev, item]);
  }

  function addFromLib(svc: ServiceLibItem) {
    const base: Item = {
      _key: uid(),
      category:          svc.category,
      name:              svc.name,
      pricingType:       (svc.defaultPricingType as PricingType) || 'flat',
      unitCostUsd:       svc.defaultCostUsd || 0,
      quantity:          1,
      childPricePercent: svc.defaultChildPercent || 0,
      vehicleType:       svc.defaultVehicleType || 'sedan',
      extraBedCount:     0,
      extraBedPriceUsd:  svc.defaultExtraBedPrice || 0,
      saleTotalUsd:      0,
      sortOrder:         0,
    };
    setItems(prev => [...prev, computeItem(base)]);
  }

  function updateItem(key: string, patch: Partial<Item>) {
    setItems(prev => prev.map(it => {
      if (it._key !== key) return it;
      const merged = { ...it, ...patch };
      return computeItem(merged);
    }));
  }

  function removeItem(key: string) {
    setItems(prev => prev.filter(i => i._key !== key));
  }

  // ─── Kaydet ──────────────────────────────────────────────────
  async function save() {
    if (!customerName.trim()) return alert('Müşteri adı zorunlu.');
    setSaving(true);
    const body = {
      customerName, customerPhone, customerEmail,
      adultsCount, childrenCount,
      travelDate, startDate, validUntil, margin, usdRate,
      notes, status,
      items: items.map((it, idx) => ({ ...it, sortOrder: idx })),
    };
    const res = editId
      ? await fetch(`/api/admin/quotations/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch('/api/admin/quotations',            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

    if (res.ok) {
      const data = await res.json();
      if (!editId) router.replace(`/admin/fiyat-teklifleri/${data.quotation.id}`);
      else setQuotationNo(data.quotation.quotationNo);
    }
    setSaving(false);
  }

  // ─── PDF İndir ───────────────────────────────────────────────
  function downloadPdf() {
    if (!editId) return alert('Önce teklifi kaydedin.');
    window.open(`/api/admin/quotations/${editId}/pdf`, '_blank');
  }

  // ─── Hesaplamalar ─────────────────────────────────────────────
  const totalCost = items.reduce((s, it) => {
    const calc: QuotationItemCalc = {
      pricingType: it.pricingType, unitCostUsd: it.unitCostUsd,
      quantity: it.quantity, childPricePercent: it.childPricePercent,
      vehicleType: it.vehicleType, extraBedCount: it.extraBedCount,
      extraBedPriceUsd: it.extraBedPriceUsd,
    };
    // rawCost: sale / (1 + margin/100)
    return s + round2(it.saleTotalUsd / (1 + margin / 100));
  }, 0);
  const grandTotal = items.reduce((s, it) => s + it.saleTotalUsd, 0);
  const profit = round2(grandTotal - totalCost);

  const catGroups = CAT_ORDER.map(catVal => ({
    ...CATEGORIES.find(c => c.value === catVal)!,
    items: items.filter(i => i.category === catVal),
  }));

  const filteredLib = serviceLib.filter(s =>
    (!libSearch || s.name.toLowerCase().includes(libSearch.toLowerCase())) &&
    (!libCat    || s.category === libCat),
  );

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {editId ? (quotationNo || 'Teklif Düzenle') : 'Yeni Fiyat Teklifi'}
          </h1>
          {editId && <p className="text-xs text-slate-400 mt-0.5">ID: {editId}</p>}
        </div>
        <div className="flex gap-2 flex-wrap">
          {editId && (
            <button onClick={downloadPdf}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm">
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              PDF İndir
            </button>
          )}
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="border border-slate-200 rounded-xl text-[13px] px-3 py-2 bg-white text-slate-700 focus:outline-none">
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 bg-[#003781] hover:bg-[#002d6a] disabled:opacity-50 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm">
            <span className="material-symbols-outlined text-[18px]">{saving ? 'progress_activity' : 'save'}</span>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="flex gap-1 border-b border-slate-200">
        {(['form', 'preview'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab ? 'bg-white border border-b-white border-slate-200 text-[#003781]' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {tab === 'form' ? 'Form' : 'Önizleme'}
          </button>
        ))}
      </div>

      {/* ── FORM SEKMESİ ── */}
      {activeTab === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Sol: Genel bilgiler */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <h3 className="font-semibold text-slate-700 text-sm">Müşteri Bilgileri</h3>

              <Field label="Müşteri Adı *">
                <input value={customerName} onChange={e => setCustomerName(e.target.value)}
                  placeholder="Melike Hanım" className={inputCls} />
              </Field>
              <Field label="Telefon">
                <input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="+90 5xx xxx xx xx" className={inputCls} />
              </Field>
              <Field label="E-posta">
                <input value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="ornek@mail.com" className={inputCls} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Yetişkin">
                  <input type="number" min={1} value={adultsCount}
                    onChange={e => setAdultsCount(Math.max(1, Number(e.target.value)))}
                    className={inputCls} />
                </Field>
                <Field label="Çocuk">
                  <input type="number" min={0} value={childrenCount}
                    onChange={e => setChildrenCount(Math.max(0, Number(e.target.value)))}
                    className={inputCls} />
                </Field>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
              <h3 className="font-semibold text-slate-700 text-sm">Seyahat & Fiyat</h3>

              <Field label="Tarih Başlığı (PDF'te görünür)">
                <input value={travelDate} onChange={e => setTravelDate(e.target.value)}
                  placeholder="8-13 Haziran 2026" className={inputCls} />
              </Field>
              <Field label="Başlangıç Tarihi (PDF'te görünür)">
                <input value={startDate} onChange={e => setStartDate(e.target.value)}
                  placeholder="8 Haziran 2026" className={inputCls} />
              </Field>
              <Field label="Geçerlilik Süresi">
                <input value={validUntil} onChange={e => setValidUntil(e.target.value)}
                  placeholder="3 iş günü" className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Kar Marjı (%)">
                  <input type="number" min={0} max={100} step={0.5} value={margin}
                    onChange={e => setMargin(Number(e.target.value))}
                    className={inputCls} />
                </Field>
                <Field label="USD/TL Kuru">
                  <input type="number" min={0} step={0.01} value={usdRate}
                    onChange={e => setUsdRate(Number(e.target.value))}
                    placeholder="0" className={inputCls} />
                </Field>
              </div>
              <Field label="Notlar (sadece admin görür)">
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  rows={3} placeholder="İç notlar..." className={inputCls} />
              </Field>
            </div>

            {/* Özet kutu */}
            <div className="bg-[#003781]/5 rounded-2xl border border-[#003781]/10 p-5 space-y-2">
              <h3 className="font-semibold text-[#003781] text-sm">Hesap Özeti</h3>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Toplam Maliyet</span>
                <span className="font-mono text-slate-700">${totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Toplam Satış</span>
                <span className="font-mono font-bold text-[#003781]">${grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-[#003781]/10 pt-2">
                <span className="text-slate-500">Kar ({margin}%)</span>
                <span className="font-mono text-emerald-600 font-semibold">${profit.toFixed(2)}</span>
              </div>
              {usdRate > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">TL Karşılığı</span>
                  <span className="font-mono text-slate-600">{(grandTotal * usdRate).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL</span>
                </div>
              )}
            </div>
          </div>

          {/* Sağ: Kalemler */}
          <div className="lg:col-span-2 space-y-4">

            {/* Kategori grupları */}
            {catGroups.map(cat => (
              <div key={cat.value} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50/60">
                  <span className="material-symbols-outlined text-[18px] text-[#003781]">{cat.icon}</span>
                  <span className="font-semibold text-slate-700 text-sm">{cat.label}</span>
                  <span className="ml-auto text-xs text-slate-400">{cat.items.length} kalem</span>
                </div>

                {cat.items.length === 0 ? (
                  <p className="text-xs text-slate-400 px-5 py-3">Henüz kalem yok</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {cat.items.map(item => (
                      <ItemRow
                        key={item._key}
                        item={item}
                        adultsCount={adultsCount}
                        childrenCount={childrenCount}
                        usdRate={usdRate}
                        onChange={patch => updateItem(item._key, patch)}
                        onRemove={() => removeItem(item._key)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Kalem ekle */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex gap-2 flex-wrap">
                <select value={addingCat} onChange={e => setAddingCat(e.target.value)}
                  className="border border-slate-200 rounded-xl text-[13px] px-3 py-2 bg-white text-slate-700 flex-1 min-w-[140px]">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <button onClick={addItem}
                  className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-800 text-white text-[13px] font-medium px-4 py-2 rounded-xl transition-all">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Boş Kalem
                </button>
                <button onClick={() => setLibOpen(true)}
                  className="flex items-center gap-1.5 bg-[#003781] hover:bg-[#002d6a] text-white text-[13px] font-medium px-4 py-2 rounded-xl transition-all">
                  <span className="material-symbols-outlined text-[16px]">library_books</span>
                  Kütüphaneden Ekle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ÖNİZLEME SEKMESİ ── */}
      {activeTab === 'preview' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#003781]">{quotationNo || 'Taslak Teklif'}</h2>
            {editId && (
              <button onClick={downloadPdf}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl">
                <span className="material-symbols-outlined text-[16px]">download</span>
                PDF İndir
              </button>
            )}
          </div>

          <p className="text-sm text-slate-600 mb-1">
            <strong className="text-[#003781]">{startDate || travelDate || '—'}:</strong>{' '}
            {customerName || '—'} ({adultsCount} Yetişkin{childrenCount > 0 ? ` + ${childrenCount} Çocuk` : ''})
          </p>
          <p className="text-xs text-slate-400 mb-5">Kur: {usdRate > 0 ? `1 USD = ${usdRate} TL` : 'TL gösterimi kapalı'}</p>

          {CAT_ORDER.filter(cat => items.some(i => i.category === cat)).map(cat => {
            const catLabel = CATEGORIES.find(c => c.value === cat)?.label || cat;
            const catItems = items.filter(i => i.category === cat);
            return (
              <div key={cat} className="mb-5">
                <h4 className="font-bold text-[#003781] text-sm mb-2">{catLabel}</h4>
                {catItems.map(item => {
                  const calc: QuotationItemCalc = {
                    pricingType: item.pricingType, unitCostUsd: item.unitCostUsd,
                    quantity: item.quantity, childPricePercent: item.childPricePercent,
                    vehicleType: item.vehicleType, extraBedCount: item.extraBedCount,
                    extraBedPriceUsd: item.extraBedPriceUsd,
                  };
                  return (
                    <div key={item._key} className="mb-2 pl-3">
                      <p className="text-sm font-semibold text-slate-800">{item.name || '(isimsiz)'}</p>
                      <p className="text-sm text-slate-600">• ${item.saleTotalUsd.toFixed(2)} USD
                        {usdRate > 0 ? ` / ${(item.saleTotalUsd * usdRate).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL` : ''}
                      </p>
                      <p className="text-xs text-slate-400">{detailText(calc, adultsCount, childrenCount)}</p>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* 4 senaryo toplamları */}
          <div className="border-t border-slate-200 pt-4 mt-4 space-y-1">
            {buildScenarios(items, ctx()).map(s => (
              <div key={s.label} className="flex justify-between text-sm">
                <span className="text-slate-600">{s.label}</span>
                <span className="font-semibold text-[#003781]">
                  ${s.usd.toFixed(2)}
                  {usdRate > 0 ? ` / ${(s.usd * usdRate).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Kütüphane Modal ── */}
      {libOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setLibOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">Hizmet Kütüphanesi</h3>
              <button onClick={() => setLibOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-3 border-b border-slate-100 flex gap-2">
              <input value={libSearch} onChange={e => setLibSearch(e.target.value)}
                placeholder="Hizmet ara..." className={`${inputCls} flex-1`} />
              <select value={libCat} onChange={e => setLibCat(e.target.value)}
                className={`${inputCls} w-40`}>
                <option value="">Tüm kategoriler</option>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
              {filteredLib.length === 0
                ? <p className="text-sm text-slate-400 text-center py-8">Hizmet bulunamadı</p>
                : filteredLib.map(svc => (
                  <button key={svc.id} onClick={() => { addFromLib(svc); setLibOpen(false); }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{svc.name}</p>
                      <p className="text-xs text-slate-400">
                        {CATEGORIES.find(c => c.value === svc.category)?.label} ·{' '}
                        {PRICING_TYPES.find(p => p.value === svc.defaultPricingType)?.label} ·{' '}
                        ${svc.defaultCostUsd.toFixed(2)}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-slate-400">add</span>
                  </button>
                ))
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ItemRow bileşeni ─────────────────────────────────────────
function ItemRow({ item, adultsCount, childrenCount, usdRate, onChange, onRemove }: {
  item: Item;
  adultsCount: number;
  childrenCount: number;
  usdRate: number;
  onChange: (patch: Partial<Item>) => void;
  onRemove: () => void;
}) {
  const calc: QuotationItemCalc = {
    pricingType: item.pricingType, unitCostUsd: item.unitCostUsd,
    quantity: item.quantity, childPricePercent: item.childPricePercent,
    vehicleType: item.vehicleType, extraBedCount: item.extraBedCount,
    extraBedPriceUsd: item.extraBedPriceUsd,
  };
  const ctx = { adultsCount, childrenCount, margin: 0 }; // uyarı için margin'e gerek yok
  const vWarn = vehicleCapacityWarning(calc, ctx);
  const rWarn = roomCapacityWarning(calc, ctx);

  return (
    <div className="p-4 space-y-3">
      {/* Satır 1: İsim + Tip */}
      <div className="flex gap-2 flex-wrap">
        <input value={item.name} onChange={e => onChange({ name: e.target.value })}
          placeholder="Kalem adı (örn: Al Ebaa Hotel - Mekke)"
          className={`${inputCls} flex-1 min-w-[180px]`} />
        <select value={item.pricingType}
          onChange={e => onChange({ pricingType: e.target.value as PricingType })}
          className={`${inputCls} w-36`}>
          {PRICING_TYPES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        <select value={item.category} onChange={e => onChange({ category: e.target.value })}
          className={`${inputCls} w-36`}>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Satır 2: Tip'e göre alanlar */}
      <div className="flex gap-2 flex-wrap items-end">

        {/* Birim alış (tüm tipler) */}
        <Field label={item.pricingType === 'per_room' ? 'Oda alış (USD)' : 'Birim alış (USD)'}>
          <input type="number" min={0} step={0.01} value={item.unitCostUsd}
            onChange={e => onChange({ unitCostUsd: Number(e.target.value) })}
            className={`${inputCls} w-28`} />
        </Field>

        {/* per_person: çocuk % */}
        {item.pricingType === 'per_person' && (
          <Field label="Çocuk %">
            <input type="number" min={0} max={100} step={5} value={item.childPricePercent}
              onChange={e => onChange({ childPricePercent: Number(e.target.value) })}
              className={`${inputCls} w-20`} />
          </Field>
        )}

        {/* per_vehicle: araç tipi + adet */}
        {item.pricingType === 'per_vehicle' && (
          <>
            <Field label="Araç tipi">
              <select value={item.vehicleType} onChange={e => onChange({ vehicleType: e.target.value })}
                className={`${inputCls} w-28`}>
                {VEHICLE_TYPES.map(v => (
                  <option key={v.value} value={v.value}>{v.label} ({v.capacity})</option>
                ))}
              </select>
            </Field>
            <Field label="Adet">
              <input type="number" min={1} value={item.quantity}
                onChange={e => onChange({ quantity: Math.max(1, Number(e.target.value)) })}
                className={`${inputCls} w-16`} />
            </Field>
          </>
        )}

        {/* per_room: oda sayısı + ek yatak */}
        {item.pricingType === 'per_room' && (
          <>
            <Field label="Oda sayısı">
              <input type="number" min={1} value={item.quantity}
                onChange={e => onChange({ quantity: Math.max(1, Number(e.target.value)) })}
                className={`${inputCls} w-20`} />
            </Field>
            <Field label="Ek yatak">
              <input type="number" min={0} value={item.extraBedCount}
                onChange={e => onChange({ extraBedCount: Math.max(0, Number(e.target.value)) })}
                className={`${inputCls} w-20`} />
            </Field>
            <Field label="Ek yatak alış (USD)">
              <input type="number" min={0} step={0.01} value={item.extraBedPriceUsd}
                onChange={e => onChange({ extraBedPriceUsd: Number(e.target.value) })}
                className={`${inputCls} w-28`} />
            </Field>
          </>
        )}

        {/* flat: adet */}
        {item.pricingType === 'flat' && (
          <Field label="Adet">
            <input type="number" min={1} value={item.quantity}
              onChange={e => onChange({ quantity: Math.max(1, Number(e.target.value)) })}
              className={`${inputCls} w-20`} />
          </Field>
        )}

        {/* Satış toplamı (readonly) + sil */}
        <div className="ml-auto flex items-end gap-2">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 mb-0.5">Satış Toplamı</p>
            <p className="text-sm font-bold text-[#003781]">${item.saleTotalUsd.toFixed(2)}</p>
            {usdRate > 0 && (
              <p className="text-[10px] text-slate-400">{(item.saleTotalUsd * usdRate).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL</p>
            )}
          </div>
          <button onClick={onRemove} className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors mb-0.5">
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </div>

      {/* Uyarılar */}
      {vWarn && (
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          <span className="material-symbols-outlined text-[14px] mt-0.5">warning</span>
          {vWarn}
        </div>
      )}
      {rWarn && (
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          <span className="material-symbols-outlined text-[14px] mt-0.5">warning</span>
          {rWarn}
        </div>
      )}
    </div>
  );
}

// ─── Yardımcı UI bileşenleri ──────────────────────────────────
const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#003781]/20 bg-white';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

// ─── Önizleme yardımcıları ────────────────────────────────────
function detailText(calc: QuotationItemCalc, adults: number, children: number): string {
  switch (calc.pricingType) {
    case 'per_person': {
      const childPart = children > 0 ? ` + ${children} çocuk × %${calc.childPricePercent}` : '';
      return `${adults} yetişkin${childPart}`;
    }
    case 'per_vehicle': {
      const vt = VEHICLE_TYPES.find(v => v.value === calc.vehicleType);
      return `${calc.quantity} × ${vt?.label ?? calc.vehicleType} (${vt?.capacity ?? '?'} kişilik)`;
    }
    case 'per_room': {
      const parts = [`${calc.quantity} oda`];
      if (calc.extraBedCount > 0) parts.push(`${calc.extraBedCount} ek yatak`);
      return parts.join(' + ');
    }
    case 'flat':
      return calc.quantity > 1 ? `${calc.quantity} adet` : '';
    default:
      return '';
  }
}

function buildScenarios(items: Item[], ctx: { adultsCount: number; childrenCount: number; margin: number }) {
  const grouped: Record<string, Item[]> = {};
  CAT_ORDER.forEach(c => { grouped[c] = items.filter(i => i.category === c); });

  const catTotal = (cats: string[]) =>
    cats.reduce((sum, c) =>
      sum + (grouped[c] ?? []).reduce((s, it) => {
        const calc: QuotationItemCalc = {
          pricingType: it.pricingType, unitCostUsd: it.unitCostUsd,
          quantity: it.quantity, childPricePercent: it.childPricePercent,
          vehicleType: it.vehicleType, extraBedCount: it.extraBedCount,
          extraBedPriceUsd: it.extraBedPriceUsd,
        };
        return s + calcSaleTotal(calc, ctx);
      }, 0), 0);

  return [
    { label: 'Yemekli Otel Toplamı',           usd: catTotal(CAT_ORDER) },
    { label: 'Yemeksiz Otel – Tursuz',          usd: catTotal(CAT_ORDER.filter(c => c !== 'tur')) },
    { label: 'Sadece Otel',                     usd: catTotal(CAT_ORDER.filter(c => c !== 'tur' && c !== 'transfer')) },
    { label: 'Transfersiz Otel – Turlu',        usd: catTotal(CAT_ORDER.filter(c => c !== 'transfer')) },
  ];
}
