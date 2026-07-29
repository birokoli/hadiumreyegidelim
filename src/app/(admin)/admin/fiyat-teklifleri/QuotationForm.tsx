'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  VEHICLE_TYPES, vehicleCapacityWarning, roomCapacityWarning, calcSaleTotal, round2,
  type PricingType, type QuotationItemCalc,
} from '@/lib/quotation-calc';

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
  { value: 'vize',     label: 'Vize İşlemleri' },
  { value: 'hotel',    label: 'Konaklama' },
  { value: 'transfer', label: 'Transfer ve Ulaşım' },
  { value: 'tur',      label: 'Gezi ve Ziyaretler' },
  { value: 'flight',   label: 'Uçuş' },
  { value: 'extra',    label: 'Ekstra Hizmetler' },
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

export default function QuotationForm({ editId }: { editId?: string }) {
  const router = useRouter();

  const [activeTab,    setActiveTab]    = useState<'form' | 'preview'>('form');
  const [quotationNo,  setQuotationNo]  = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone,setCustomerPhone]= useState('');
  const [paxCount,     setPaxCount]     = useState(1);
  const [childCount,   setChildCount]   = useState(0);
  const [infantCount,  setInfantCount]  = useState(0);

  const [travelDate,   setTravelDate]   = useState('');
  const [startDate,    setStartDate]    = useState('');
  const [validUntil,   setValidUntil]   = useState('');

  const [margin,       setMargin]       = useState(15);
  const [usdRate,      setUsdRate]      = useState(38.5);
  const [notes,        setNotes]        = useState('');
  const [status,       setStatus]       = useState('draft');

  const [items,        setItems]        = useState<Item[]>([]);
  const [saving,       setSaving]       = useState(false);
  const [libModalOpen, setLibModalOpen] = useState(false);
  const [serviceLib,   setServiceLib]   = useState<ServiceLibItem[]>([]);
  const [libSearch,    setLibSearch]    = useState('');
  const [libCat,       setLibCat]       = useState('');

  useEffect(() => {
    fetch('/api/admin/service-library')
      .then(r => r.json())
      .then(d => setServiceLib(d.services ?? []))
      .catch(() => {});

    if (editId) {
      fetch(`/api/admin/quotations/${editId}`)
        .then(r => r.json())
        .then(d => {
          const q = d.quotation;
          if (!q) return;
          setQuotationNo(q.quotationNo || '');
          setCustomerName(q.customerName || '');
          setCustomerPhone(q.customerPhone || '');
          setPaxCount(q.paxCount || 1);
          setChildCount(q.childCount || 0);
          setInfantCount(q.infantCount || 0);
          setTravelDate(q.travelDate || '');
          setStartDate(q.startDate ? q.startDate.slice(0, 10) : '');
          setValidUntil(q.validUntil ? q.validUntil.slice(0, 10) : '');
          setMargin(q.margin ?? 15);
          setUsdRate(q.usdRate ?? 38.5);
          setNotes(q.notes || '');
          setStatus(q.status || 'draft');
          setItems((q.items || []).map((it: any) => ({
            _key: uid(),
            category:          it.category,
            name:              it.name,
            pricingType:       it.pricingType,
            unitCostUsd:       it.unitCostUsd,
            quantity:          it.quantity,
            childPricePercent: it.childPricePercent || 0,
            vehicleType:       it.vehicleType || 'sedan',
            extraBedCount:     it.extraBedCount || 0,
            extraBedPriceUsd:  it.extraBedPriceUsd || 0,
            saleTotalUsd:      it.saleTotalUsd,
            sortOrder:         it.sortOrder || 0,
          })));
        });
    }
  }, [editId]);

  const recalculateItemSale = useCallback((it: Item, m: number, pax: number, ch: number): number => {
    return calcSaleTotal({
      pricingType:       it.pricingType,
      unitCostUsd:       it.unitCostUsd,
      quantity:          it.quantity,
      childPricePercent: it.childPricePercent,
      vehicleType:       it.vehicleType,
      extraBedCount:     it.extraBedCount,
      extraBedPriceUsd:  it.extraBedPriceUsd,
    }, m, pax, ch);
  }, []);

  function handleMarginChange(newMargin: number) {
    setMargin(newMargin);
    setItems(prev => prev.map(it => ({
      ...it,
      saleTotalUsd: recalculateItemSale(it, newMargin, paxCount, childCount),
    })));
  }

  function handlePaxChange(newPax: number) {
    setPaxCount(newPax);
    setItems(prev => prev.map(it => ({
      ...it,
      saleTotalUsd: recalculateItemSale(it, margin, newPax, childCount),
    })));
  }

  function handleChildChange(newCh: number) {
    setChildCount(newCh);
    setItems(prev => prev.map(it => ({
      ...it,
      saleTotalUsd: recalculateItemSale(it, margin, paxCount, newCh),
    })));
  }

  function updateItem(key: string, patch: Partial<Item>) {
    setItems(prev => prev.map(it => {
      if (it._key !== key) return it;
      const updated = { ...it, ...patch };
      updated.saleTotalUsd = recalculateItemSale(updated, margin, paxCount, childCount);
      return updated;
    }));
  }

  function removeItem(key: string) {
    setItems(prev => prev.filter(i => i._key !== key));
  }

  function addItemFromLib(libItem: ServiceLibItem) {
    const newItem: Item = {
      _key:              uid(),
      category:          libItem.category,
      name:              libItem.name,
      pricingType:       (libItem.defaultPricingType as PricingType) || 'flat',
      unitCostUsd:       libItem.defaultCostUsd || 0,
      quantity:          1,
      childPricePercent: libItem.defaultChildPercent || 0,
      vehicleType:       libItem.defaultVehicleType || 'sedan',
      extraBedCount:     0,
      extraBedPriceUsd:  libItem.defaultExtraBedPrice || 0,
      saleTotalUsd:      0,
      sortOrder:         items.length,
    };
    newItem.saleTotalUsd = recalculateItemSale(newItem, margin, paxCount, childCount);
    setItems(prev => [...prev, newItem]);
  }

  async function save() {
    if (!customerName.trim()) return alert('Müşteri adı zorunlu.');
    setSaving(true);

    const body = {
      customerName, customerPhone, paxCount, childCount, infantCount,
      travelDate, startDate, validUntil, margin, usdRate,
      notes, status,
      items: items.map((it, idx) => ({ ...it, sortOrder: idx })),
    };
    const res = editId
      ? await fetch(`/api/admin/quotations/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch('/api/admin/quotations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

    if (res.ok) {
      const data = await res.json();
      if (!editId) router.replace(`/admin/fiyat-teklifleri/${data.quotation.id}`);
      else setQuotationNo(data.quotation.quotationNo);
    }
    setSaving(false);
  }

  function downloadPdf() {
    if (!editId) return alert('Önce teklifi kaydedin.');
    window.open(`/api/admin/quotations/${editId}/pdf`, '_blank');
  }

  const totalCost = items.reduce((s, it) => s + round2(it.saleTotalUsd / (1 + margin / 100)), 0);
  const grandTotal = items.reduce((s, it) => s + it.saleTotalUsd, 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6 min-h-screen bg-white text-zinc-900 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">TEKLIF FORMU</span>
          <h1 className="text-2xl font-light tracking-tight text-zinc-900 mt-0.5">
            {editId ? (quotationNo || 'Teklif Düzenle') : 'Yeni Fiyat Teklifi'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {editId && (
            <button onClick={downloadPdf} className="bg-white border border-zinc-200 text-zinc-900 hover:border-zinc-900 font-medium px-3 py-1.5 rounded transition-colors">
              PDF İndir
            </button>
          )}
          <select value={status} onChange={e => setStatus(e.target.value)} className="bg-white border border-zinc-200 text-zinc-900 rounded px-3 py-1.5 font-medium outline-none">
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button onClick={save} disabled={saving} className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-4 py-1.5 rounded transition-colors">
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-zinc-50 border border-zinc-200 p-4 rounded grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Müşteri Adı</label>
          <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-white border border-zinc-200 text-zinc-900 rounded p-1.5 font-semibold outline-none" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Telefon</label>
          <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-white border border-zinc-200 text-zinc-900 rounded p-1.5 font-semibold outline-none" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Yetişkin Pax</label>
          <input type="number" value={paxCount} onChange={e => handlePaxChange(parseInt(e.target.value) || 1)} className="w-full bg-white border border-zinc-200 text-zinc-900 rounded p-1.5 font-semibold outline-none" />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Kar Marjı (%)</label>
          <input type="number" value={margin} onChange={e => handleMarginChange(parseFloat(e.target.value) || 0)} className="w-full bg-white border border-zinc-200 text-zinc-900 rounded p-1.5 font-semibold outline-none" />
        </div>
      </div>

      {/* Item List Table */}
      <div className="border border-zinc-200 rounded overflow-hidden">
        <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-zinc-500">Teklif Kalemleri</span>
          <button onClick={() => setLibModalOpen(true)} className="bg-zinc-900 text-white text-xs font-medium px-3 py-1 rounded">
            + Hizmet Ekle
          </button>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 uppercase text-[10px] font-bold">
            <tr>
              <th className="p-3">Hizmet</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Maliyet ($)</th>
              <th className="p-3 text-right">Toplam Satış ($)</th>
              <th className="p-3 text-right">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map((it) => (
              <tr key={it._key} className="hover:bg-zinc-50">
                <td className="p-3 font-semibold text-zinc-900">{it.name}</td>
                <td className="p-3 text-zinc-500">{it.category}</td>
                <td className="p-3 font-mono font-bold text-zinc-900">${it.unitCostUsd}</td>
                <td className="p-3 font-mono font-bold text-zinc-900 text-right">${it.saleTotalUsd.toFixed(2)}</td>
                <td className="p-3 text-right">
                  <button onClick={() => removeItem(it._key)} className="text-zinc-400 hover:text-red-600">
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
