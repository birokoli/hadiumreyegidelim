'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

// ─── Types ────────────────────────────────────────────────
interface ServiceLibItem {
  id: string;
  category: string;
  name: string;
  description?: string;
  defaultCost: number;
  currency: string;
  unit?: string;
}

interface QuotationItem {
  _key: string;
  category: string;
  name: string;
  description: string;
  costPrice: number;
  salePrice: number;
  currency: string;
  quantity: number;
  unit: string;
  sortOrder: number;
}

const CATEGORIES = [
  { value: 'flight',   label: 'Uçuş',      icon: 'flight' },
  { value: 'hotel',    label: 'Otel',       icon: 'hotel' },
  { value: 'transfer', label: 'Transfer',   icon: 'directions_car' },
  { value: 'guide',    label: 'Rehber',     icon: 'person_pin' },
  { value: 'extra',    label: 'Ekstra',     icon: 'add_circle' },
];

const STATUS_OPTIONS = [
  { value: 'draft',    label: 'Taslak' },
  { value: 'sent',     label: 'Gönderildi' },
  { value: 'accepted', label: 'Kabul Edildi' },
  { value: 'rejected', label: 'Reddedildi' },
  { value: 'expired',  label: 'Süresi Doldu' },
];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function calcSalePrice(cost: number, margin: number) {
  return parseFloat((cost * (1 + margin / 100)).toFixed(2));
}

// ─── PDF Template ─────────────────────────────────────────
function buildPdfHtml(fields: {
  quotationNo: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  pax: number;
  travelDate?: string;
  validUntil?: string;
  notes?: string;
  items: QuotationItem[];
  createdAt: string;
}) {
  const catGroups: Record<string, QuotationItem[]> = {};
  fields.items.forEach(item => {
    if (!catGroups[item.category]) catGroups[item.category] = [];
    catGroups[item.category].push(item);
  });

  const catOrder = ['flight', 'hotel', 'transfer', 'guide', 'extra'];
  const catLabels: Record<string, string> = {
    flight: 'Uçuş', hotel: 'Konaklama', transfer: 'Transfer', guide: 'Rehber Hizmeti', extra: 'Ekstra Hizmetler',
  };

  const grandTotal = fields.items.reduce((s, i) => s + i.salePrice * i.quantity, 0);

  const rowsHtml = catOrder
    .filter(cat => catGroups[cat])
    .map(cat => {
      const catTotal = catGroups[cat].reduce((s, i) => s + i.salePrice * i.quantity, 0);
      const itemRows = catGroups[cat].map(item => `
        <tr>
          <td style="padding:7px 10px; font-size:11px; color:#464646; border-bottom:1px solid #f0f0f0;">${item.name}${item.description ? `<br><span style="font-size:10px;color:#999">${item.description}</span>` : ''}</td>
          <td style="padding:7px 10px; text-align:center; font-size:11px; color:#464646; border-bottom:1px solid #f0f0f0;">${item.quantity} ${item.unit || ''}</td>
          <td style="padding:7px 10px; text-align:right; font-size:11px; font-weight:600; color:#464646; border-bottom:1px solid #f0f0f0;">${item.salePrice.toLocaleString('tr-TR', { minimumFractionDigits: 0 })} ${item.currency}</td>
          <td style="padding:7px 10px; text-align:right; font-size:11px; font-weight:700; color:#203D76; border-bottom:1px solid #f0f0f0;">${(item.salePrice * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 0 })} ${item.currency}</td>
        </tr>
      `).join('');
      return `
        <tr>
          <td colspan="4" style="padding:10px 10px 6px; background:#203D76; color:#fff; font-size:11px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase;">${catLabels[cat] || cat}</td>
        </tr>
        ${itemRows}
        <tr>
          <td colspan="3" style="padding:6px 10px; text-align:right; font-size:11px; font-weight:600; color:#203D76; background:#f7f9fc;">Ara Toplam</td>
          <td style="padding:6px 10px; text-align:right; font-size:12px; font-weight:700; color:#203D76; background:#f7f9fc;">${catTotal.toLocaleString('tr-TR', { minimumFractionDigits: 0 })} USD</td>
        </tr>
      `;
    }).join('');

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Poppins',sans-serif; background:#fff; color:#464646; }
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@700;900&family=Poppins:wght@400;600;700&display=swap');
</style>
</head>
<body>
<div style="width:794px; min-height:1123px; background:#fff; padding:0; position:relative;">

  <!-- HEADER -->
  <div style="background:#203D76; padding:32px 40px 24px; display:flex; justify-content:space-between; align-items:flex-start;">
    <div>
      <div style="font-family:'Cairo',sans-serif; font-size:32px; font-weight:900; color:#fff; letter-spacing:-0.5px; line-height:1;">Hadi Umreye</div>
      <div style="font-size:11px; color:rgba(255,255,255,0.65); margin-top:4px; letter-spacing:0.05em; font-weight:600; text-transform:uppercase;">Fiyat Teklifi</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:18px; font-weight:700; color:#fff; letter-spacing:0.5px;">${fields.quotationNo}</div>
      <div style="font-size:11px; color:rgba(255,255,255,0.65); margin-top:2px;">${new Date(fields.createdAt).toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric' })}</div>
      ${fields.validUntil ? `<div style="font-size:10px; color:rgba(255,255,255,0.5); margin-top:1px;">Geçerlilik: ${fields.validUntil}</div>` : ''}
    </div>
  </div>

  <!-- CUSTOMER INFO -->
  <div style="display:flex; gap:0; border-bottom:2px solid #f0f0f0;">
    <div style="flex:1; padding:20px 40px; border-right:1px solid #f0f0f0;">
      <div style="font-size:9px; font-weight:700; color:#203D76; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px;">Müşteri Bilgileri</div>
      <div style="font-size:15px; font-weight:700; color:#203D76;">${fields.customerName}</div>
      ${fields.customerPhone ? `<div style="font-size:12px; color:#666; margin-top:2px;">${fields.customerPhone}</div>` : ''}
      ${fields.customerEmail ? `<div style="font-size:12px; color:#666;">${fields.customerEmail}</div>` : ''}
    </div>
    <div style="padding:20px 40px; min-width:200px;">
      <div style="font-size:9px; font-weight:700; color:#203D76; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:6px;">Seyahat Detayları</div>
      <div style="font-size:13px; font-weight:600; color:#464646;">${fields.pax} Kişi</div>
      ${fields.travelDate ? `<div style="font-size:12px; color:#666; margin-top:2px;">${fields.travelDate}</div>` : ''}
    </div>
  </div>

  <!-- ITEMS TABLE -->
  <div style="padding:24px 40px;">
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr style="background:#f7f9fc; border-top:2px solid #203D76;">
          <th style="padding:9px 10px; text-align:left; font-size:10px; font-weight:700; color:#203D76; text-transform:uppercase; letter-spacing:0.06em; width:50%;">Hizmet</th>
          <th style="padding:9px 10px; text-align:center; font-size:10px; font-weight:700; color:#203D76; text-transform:uppercase; letter-spacing:0.06em; width:15%;">Miktar</th>
          <th style="padding:9px 10px; text-align:right; font-size:10px; font-weight:700; color:#203D76; text-transform:uppercase; letter-spacing:0.06em; width:17.5%;">Birim Fiyat</th>
          <th style="padding:9px 10px; text-align:right; font-size:10px; font-weight:700; color:#203D76; text-transform:uppercase; letter-spacing:0.06em; width:17.5%;">Toplam</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <!-- GRAND TOTAL -->
    <div style="margin-top:16px; display:flex; justify-content:flex-end;">
      <div style="background:#203D76; color:#fff; padding:14px 24px; border-radius:8px; text-align:right; min-width:220px;">
        <div style="font-size:10px; font-weight:600; opacity:0.7; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:4px;">Genel Toplam</div>
        <div style="font-size:22px; font-weight:900; font-family:'Cairo',sans-serif; letter-spacing:-0.5px;">${grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 0 })} USD</div>
      </div>
    </div>
  </div>

  ${fields.notes ? `
  <!-- NOTES -->
  <div style="padding:0 40px 24px;">
    <div style="background:#f7f9fc; border-left:3px solid #203D76; padding:14px 16px; border-radius:0 6px 6px 0;">
      <div style="font-size:9px; font-weight:700; color:#203D76; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:5px;">Notlar</div>
      <div style="font-size:11px; color:#464646; line-height:1.6; white-space:pre-wrap;">${fields.notes}</div>
    </div>
  </div>` : ''}

  <!-- FOOTER -->
  <div style="position:absolute; bottom:0; left:0; right:0; background:#f7f9fc; border-top:1px solid #e8ecf3; padding:14px 40px; display:flex; justify-content:space-between; align-items:center;">
    <div style="font-size:10px; color:#999;">hadiumreyegidelim.com · info@hadiumreyegidelim.com</div>
    <div style="font-size:10px; color:#999;">Bu teklif ${fields.validUntil || '30 gün'} süreyle geçerlidir.</div>
  </div>
</div>
</body>
</html>`;
}

// ─── Main Component ────────────────────────────────────────
export default function QuotationForm({ editId }: { editId?: string }) {
  const router = useRouter();
  const previewRef = useRef<HTMLDivElement>(null);
  const [html2pdfReady, setHtml2pdfReady] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [pax, setPax] = useState(1);
  const [travelDate, setTravelDate] = useState('');
  const [validUntil, setValidUntil] = useState('30 gün');
  const [margin, setMargin] = useState(20);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('draft');
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [quotationNo, setQuotationNo] = useState('');
  const [createdAt, setCreatedAt] = useState(new Date().toISOString());

  // UI state
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [serviceLib, setServiceLib] = useState<ServiceLibItem[]>([]);
  const [libOpen, setLibOpen] = useState(false);
  const [libSearch, setLibSearch] = useState('');
  const [addingCategory, setAddingCategory] = useState('flight');

  // Load service library
  useEffect(() => {
    fetch('/api/admin/service-library').then(r => r.json()).then(d => setServiceLib(d.services ?? []));
  }, []);

  // Load existing quotation for edit
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
        setPax(q.pax);
        setTravelDate(q.travelDate ?? '');
        setValidUntil(q.validUntil ?? '30 gün');
        setMargin(q.margin);
        setNotes(q.notes ?? '');
        setStatus(q.status);
        setQuotationNo(q.quotationNo);
        setCreatedAt(q.createdAt);
        setItems(q.items.map((i: { id: string; category: string; name: string; description?: string; costPrice: number; salePrice: number; currency: string; quantity: number; unit?: string; sortOrder: number }) => ({ ...i, _key: i.id })));
      });
  }, [editId]);

  // Recalc sale prices when margin changes
  const recalcItems = useCallback((newMargin: number) => {
    setItems(prev => prev.map(item => ({
      ...item,
      salePrice: calcSalePrice(item.costPrice, newMargin),
    })));
  }, []);

  function handleMarginChange(val: number) {
    setMargin(val);
    recalcItems(val);
  }

  // Add blank item
  function addItem(category: string) {
    const newItem: QuotationItem = {
      _key: uid(),
      category,
      name: '',
      description: '',
      costPrice: 0,
      salePrice: 0,
      currency: 'USD',
      quantity: 1,
      unit: 'kişi',
      sortOrder: items.length,
    };
    setItems(prev => [...prev, newItem]);
  }

  // Add from library
  function addFromLib(svc: ServiceLibItem) {
    const cost = svc.defaultCost;
    const sale = calcSalePrice(cost, margin);
    setItems(prev => [...prev, {
      _key: uid(),
      category: svc.category,
      name: svc.name,
      description: svc.description ?? '',
      costPrice: cost,
      salePrice: sale,
      currency: svc.currency,
      quantity: 1,
      unit: svc.unit ?? '',
      sortOrder: prev.length,
    }]);
    setLibOpen(false);
  }

  function updateItem(key: string, field: keyof QuotationItem, value: string | number) {
    setItems(prev => prev.map(item => {
      if (item._key !== key) return item;
      const updated = { ...item, [field]: value };
      // cost değişince sale fiyatı otomatik güncelle
      if (field === 'costPrice') {
        updated.salePrice = calcSalePrice(Number(value), margin);
      }
      return updated;
    }));
  }

  function removeItem(key: string) {
    setItems(prev => prev.filter(i => i._key !== key));
  }

  const grandTotal = items.reduce((s, i) => s + i.salePrice * i.quantity, 0);
  const totalCost = items.reduce((s, i) => s + i.costPrice * i.quantity, 0);
  const profit = grandTotal - totalCost;

  async function save() {
    if (!customerName.trim()) return alert('Müşteri adı zorunlu.');
    setSaving(true);
    const body = { customerName, customerPhone, customerEmail, pax, travelDate, validUntil, margin, notes, status, items };
    const res = editId
      ? await fetch(`/api/admin/quotations/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch('/api/admin/quotations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

    if (res.ok) {
      const data = await res.json();
      if (!editId) {
        router.replace(`/admin/fiyat-teklifleri/${data.quotation.id}`);
      } else {
        setQuotationNo(data.quotation.quotationNo);
      }
    }
    setSaving(false);
  }

  function downloadPdf() {
    if (!html2pdfReady) return alert('PDF kütüphanesi yüklenemedi, lütfen bekleyin.');
    setDownloading(true);
    const html = buildPdfHtml({
      quotationNo: quotationNo || 'TASLAK',
      customerName,
      customerPhone,
      customerEmail,
      pax,
      travelDate,
      validUntil,
      notes,
      items,
      createdAt,
    });

    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const h2p = (window as any).html2pdf;
    h2p().set({
      margin: 0,
      filename: `${quotationNo || 'teklif'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'px', format: [794, 1123], orientation: 'portrait' },
    }).from(container.firstChild).save().then(() => {
      document.body.removeChild(container);
      setDownloading(false);
    });
  }

  const filteredLib = serviceLib.filter(s =>
    !libSearch
    || s.name.toLowerCase().includes(libSearch.toLowerCase())
    || s.category.includes(libSearch)
  );

  const catGroups = CATEGORIES.map(cat => ({
    ...cat,
    items: items.filter(i => i.category === cat.value),
  }));

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
        onLoad={() => setHtml2pdfReady(true)}
      />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/admin/fiyat-teklifleri')} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div>
              <h1 className="text-[20px] font-bold text-gray-900">{editId ? `Teklif Düzenle` : 'Yeni Teklif'}</h1>
              {quotationNo && <p className="text-[12px] text-gray-400">{quotationNo}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {editId && (
              <button
                onClick={downloadPdf}
                disabled={downloading || items.length === 0}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">{downloading ? 'progress_activity' : 'picture_as_pdf'}</span>
                PDF İndir
              </button>
            )}
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl text-[13px] text-gray-700 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#003781]/15"
            >
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1.5 bg-[#003781] hover:bg-[#002d6a] disabled:opacity-50 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">{saving ? 'progress_activity' : 'save'}</span>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0 bg-gray-100 rounded-xl p-1 w-fit">
          {(['form', 'preview'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${activeTab === tab ? 'bg-white text-[#003781] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'form' ? 'Düzenle' : 'Önizleme'}
            </button>
          ))}
        </div>

        {activeTab === 'form' ? (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">

            {/* Left — Main form */}
            <div className="space-y-5">

              {/* Customer info card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h2 className="text-[14px] font-bold text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#003781]">person</span>
                  Müşteri Bilgileri
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Müşteri Adı *</label>
                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)}
                      placeholder="Ad Soyad"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/15 focus:border-[#003781]/40" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Telefon</label>
                    <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="+90 5xx xxx xx xx"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/15 focus:border-[#003781]/40" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">E-posta</label>
                    <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/15 focus:border-[#003781]/40" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Kişi Sayısı</label>
                    <input type="number" value={pax} onChange={e => setPax(Number(e.target.value))} min={1}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003781]/15 focus:border-[#003781]/40" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Seyahat Tarihi</label>
                    <input type="text" value={travelDate} onChange={e => setTravelDate(e.target.value)}
                      placeholder="Mart 2027"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/15 focus:border-[#003781]/40" />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Geçerlilik Süresi</label>
                    <input type="text" value={validUntil} onChange={e => setValidUntil(e.target.value)}
                      placeholder="30 gün"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/15 focus:border-[#003781]/40" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Notlar (PDF'e eklenir)</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Ek bilgiler, koşullar..."
                    rows={2}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/15 focus:border-[#003781]/40 resize-none" />
                </div>
              </div>

              {/* Items by category */}
              {catGroups.map(cat => (
                <div key={cat.value} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-[#003781]" style={{ fontVariationSettings: "'FILL' 1" }}>{cat.icon}</span>
                      <h2 className="text-[13px] font-bold text-gray-800">{cat.label}</h2>
                      {cat.items.length > 0 && (
                        <span className="text-[11px] text-gray-400">· {cat.items.length} kalem</span>
                      )}
                    </div>
                    <button
                      onClick={() => addItem(cat.value)}
                      className="text-[12px] font-semibold text-[#003781] hover:bg-[#003781]/5 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      Ekle
                    </button>
                  </div>

                  {cat.items.length === 0 ? (
                    <div className="px-5 py-4 text-[12px] text-gray-400 text-center">
                      Bu kategoride henüz kalem yok.{' '}
                      <button onClick={() => addItem(cat.value)} className="text-[#003781] font-semibold hover:underline">Ekle</button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {cat.items.map(item => (
                        <div key={item._key} className="px-5 py-3 space-y-2">
                          <div className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto] gap-2">
                            <input
                              type="text" placeholder="Hizmet adı" value={item.name}
                              onChange={e => updateItem(item._key, 'name', e.target.value)}
                              className="col-span-2 sm:col-span-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/10"
                            />
                            <input
                              type="text" placeholder="Açıklama (opsiyonel)" value={item.description}
                              onChange={e => updateItem(item._key, 'description', e.target.value)}
                              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/10"
                            />
                            <button onClick={() => removeItem(item._key)} className="p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors self-center">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                              <label className="text-[10px] text-gray-400 font-semibold block mb-1">Maliyet (gizli)</label>
                              <input
                                type="number" placeholder="0" value={item.costPrice || ''}
                                onChange={e => updateItem(item._key, 'costPrice', Number(e.target.value))}
                                className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-[13px] text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-200"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 font-semibold block mb-1">Satış Fiyatı</label>
                              <input
                                type="number" placeholder="0" value={item.salePrice || ''}
                                onChange={e => updateItem(item._key, 'salePrice', Number(e.target.value))}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003781]/10"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 font-semibold block mb-1">Miktar</label>
                              <div className="flex gap-1">
                                <input
                                  type="number" placeholder="1" value={item.quantity || ''}
                                  onChange={e => updateItem(item._key, 'quantity', Number(e.target.value))}
                                  className="w-16 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003781]/10"
                                />
                                <input
                                  type="text" placeholder="kişi" value={item.unit}
                                  onChange={e => updateItem(item._key, 'unit', e.target.value)}
                                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/10"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 font-semibold block mb-1">Döviz</label>
                              <select
                                value={item.currency}
                                onChange={e => updateItem(item._key, 'currency', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none"
                              >
                                {['USD', 'EUR', 'TRY', 'SAR'].map(c => <option key={c}>{c}</option>)}
                              </select>
                            </div>
                          </div>
                          {item.costPrice > 0 && (
                            <div className="text-[11px] text-emerald-600 font-medium">
                              Toplam: {(item.salePrice * item.quantity).toLocaleString('tr-TR')} {item.currency}
                              {' · '}
                              <span className="text-gray-400">
                                Kar: {(item.salePrice - item.costPrice).toLocaleString('tr-TR', { minimumFractionDigits: 0 })} {item.currency} / birim
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Add from library */}
              <button
                onClick={() => setLibOpen(true)}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-[13px] text-gray-400 hover:border-[#003781]/30 hover:text-[#003781] transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">library_add</span>
                Hizmet Kütüphanesinden Ekle
              </button>
            </div>

            {/* Right — Margin & summary */}
            <div className="space-y-4 xl:sticky xl:top-24">

              {/* Margin card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-[13px] font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                  Kar Marjı (Gizli)
                </h2>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="range" min={0} max={100} value={margin}
                    onChange={e => handleMarginChange(Number(e.target.value))}
                    className="flex-1 accent-[#003781]"
                  />
                  <div className="relative">
                    <input
                      type="number" value={margin} min={0} max={100}
                      onChange={e => handleMarginChange(Number(e.target.value))}
                      className="w-16 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-center font-bold text-[#003781] focus:outline-none"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">%</span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  Bu değer PDF'e yansımaz. Tüm satış fiyatları otomatik hesaplanır.
                </p>
              </div>

              {/* Summary card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-[13px] font-bold text-gray-800 mb-4">Özet</h2>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-500">Toplam Maliyet</span>
                    <span className="font-semibold text-amber-700">{totalCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} USD</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-500">Toplam Kar</span>
                    <span className="font-semibold text-emerald-600">+{profit.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} USD</span>
                  </div>
                  <div className="h-px bg-gray-100 my-1" />
                  <div className="flex justify-between">
                    <span className="text-[14px] font-bold text-gray-800">Satış Toplamı</span>
                    <span className="text-[16px] font-black text-[#003781]">{grandTotal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} USD</span>
                  </div>
                  {items.length > 0 && totalCost > 0 && (
                    <div className="text-center text-[11px] text-gray-400 pt-1">
                      Efektif marj: %{(((grandTotal - totalCost) / totalCost) * 100).toFixed(1)}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick add */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-[13px] font-bold text-gray-800 mb-3">Hızlı Kalem Ekle</h2>
                <div className="space-y-1.5">
                  <select
                    value={addingCategory}
                    onChange={e => setAddingCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none"
                  >
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  <button
                    onClick={() => addItem(addingCategory)}
                    className="w-full py-2 bg-[#003781]/5 hover:bg-[#003781]/10 text-[#003781] text-[13px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Boş Kalem Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PREVIEW TAB */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <p className="text-[13px] font-semibold text-gray-600">PDF Önizleme</p>
              {editId && (
                <button
                  onClick={downloadPdf}
                  disabled={downloading || items.length === 0}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">{downloading ? 'progress_activity' : 'download'}</span>
                  PDF İndir
                </button>
              )}
            </div>
            <div className="p-5 overflow-auto bg-gray-100 min-h-[600px]">
              <div
                ref={previewRef}
                className="mx-auto bg-white shadow-xl"
                style={{ width: '794px', minHeight: '1123px', transform: 'scale(0.75)', transformOrigin: 'top center', marginBottom: '-280px' }}
                dangerouslySetInnerHTML={{
                  __html: buildPdfHtml({
                    quotationNo: quotationNo || 'TASLAK',
                    customerName: customerName || 'Müşteri Adı',
                    customerPhone,
                    customerEmail,
                    pax,
                    travelDate,
                    validUntil,
                    notes,
                    items,
                    createdAt,
                  })
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Service Library Modal */}
      {libOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={() => setLibOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-gray-900">Hizmet Kütüphanesi</h3>
              <button onClick={() => setLibOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="px-4 py-3 border-b border-gray-50">
              <input
                type="text" placeholder="Hizmet ara..." value={libSearch}
                onChange={e => setLibSearch(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#003781]/15"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredLib.length === 0 ? (
                <div className="px-5 py-8 text-center text-[13px] text-gray-400">
                  {serviceLib.length === 0
                    ? 'Kütüphane boş. Sağ kenar çubuğundan hizmet ekleyin.'
                    : 'Sonuç bulunamadı.'}
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredLib.map(svc => (
                    <button
                      key={svc.id}
                      onClick={() => addFromLib(svc)}
                      className="w-full px-5 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3"
                    >
                      <span className="material-symbols-outlined text-[18px] text-[#003781] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {CATEGORIES.find(c => c.value === svc.category)?.icon ?? 'add_circle'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-900">{svc.name}</p>
                        {svc.description && <p className="text-[11px] text-gray-400 truncate">{svc.description}</p>}
                        <p className="text-[11px] text-[#003781] font-semibold mt-0.5">
                          {svc.defaultCost > 0 ? `${svc.defaultCost.toLocaleString('tr-TR')} ${svc.currency}` : 'Fiyat girilmemiş'}
                          {svc.unit && ` / ${svc.unit}`}
                        </p>
                      </div>
                      <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0 self-start">
                        {CATEGORIES.find(c => c.value === svc.category)?.label ?? svc.category}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
