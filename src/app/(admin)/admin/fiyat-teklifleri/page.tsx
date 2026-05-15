'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface QuotationItem {
  salePrice: number;
  quantity: number;
  currency: string;
}

interface Quotation {
  id: string;
  quotationNo: string;
  customerName: string;
  customerPhone?: string;
  pax: number;
  travelDate?: string;
  status: string;
  margin: number;
  createdAt: string;
  items: QuotationItem[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:    { label: 'Taslak',   color: 'bg-gray-100 text-gray-600' },
  sent:     { label: 'Gönderildi', color: 'bg-blue-50 text-blue-700' },
  accepted: { label: 'Kabul Edildi', color: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Reddedildi', color: 'bg-red-50 text-red-600' },
  expired:  { label: 'Süresi Doldu', color: 'bg-amber-50 text-amber-700' },
};

function calcTotal(items: QuotationItem[]) {
  return items.reduce((s, i) => s + i.salePrice * i.quantity, 0);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function QuotationsListPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  async function load() {
    const res = await fetch('/api/admin/quotations');
    if (res.ok) {
      const data = await res.json();
      setQuotations(data.quotations ?? []);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function deleteQuotation(id: string, no: string) {
    if (!confirm(`"${no}" numaralı teklifi silmek istediğinizden emin misiniz?`)) return;
    setDeleting(id);
    await fetch(`/api/admin/quotations/${id}`, { method: 'DELETE' });
    setQuotations(prev => prev.filter(q => q.id !== id));
    setDeleting(null);
  }

  const filtered = quotations.filter(q => {
    const matchSearch = !search
      || q.customerName.toLowerCase().includes(search.toLowerCase())
      || q.quotationNo.toLowerCase().includes(search.toLowerCase())
      || (q.customerPhone ?? '').includes(search);
    const matchStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalValue = filtered.reduce((s, q) => s + calcTotal(q.items), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900">Fiyat Teklifleri</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">{quotations.length} teklif · Toplam {totalValue.toLocaleString('tr-TR')} USD</p>
        </div>
        <Link href="/admin/fiyat-teklifleri/yeni">
          <button className="flex items-center gap-2 bg-[#003781] hover:bg-[#002d6a] text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Yeni Teklif
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-gray-400">search</span>
          <input
            type="text"
            placeholder="Müşteri adı, teklif no..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/15 focus:border-[#003781]/40"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-xl text-[13px] text-gray-700 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#003781]/15"
        >
          <option value="all">Tüm Durumlar</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-[14px]">
            <span className="material-symbols-outlined animate-spin text-[24px] mr-2">progress_activity</span>
            Yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="material-symbols-outlined text-5xl text-gray-200" style={{ fontVariationSettings: "'FILL' 1" }}>request_quote</span>
            <p className="text-[14px] text-gray-400">
              {search || statusFilter !== 'all' ? 'Arama kriterlerine uygun teklif bulunamadı.' : 'Henüz teklif oluşturulmadı.'}
            </p>
            {!search && statusFilter === 'all' && (
              <Link href="/admin/fiyat-teklifleri/yeni">
                <button className="mt-1 text-[13px] font-semibold text-[#003781] hover:underline">İlk teklifi oluştur</button>
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Teklif No</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Müşteri</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Seyahat</th>
                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Tutar</th>
                <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Durum</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Tarih</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(q => {
                const total = calcTotal(q.items);
                const st = STATUS_LABELS[q.status] ?? { label: q.status, color: 'bg-gray-100 text-gray-600' };
                return (
                  <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-[13px] font-bold text-[#003781]">{q.quotationNo}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-[13px] font-semibold text-gray-900">{q.customerName}</p>
                      {q.customerPhone && <p className="text-[11px] text-gray-400">{q.customerPhone}</p>}
                      <p className="text-[11px] text-gray-400">{q.pax} kişi</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-[13px] text-gray-600">{q.travelDate || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right hidden sm:table-cell">
                      <p className="text-[14px] font-bold text-gray-900">
                        {total > 0 ? `${total.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} USD` : '—'}
                      </p>
                      {q.items.length > 0 && <p className="text-[11px] text-gray-400">{q.items.length} kalem</p>}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <p className="text-[12px] text-gray-400">{formatDate(q.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <Link href={`/admin/fiyat-teklifleri/${q.id}`}>
                          <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#003781] transition-colors" title="Düzenle">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        </Link>
                        <button
                          onClick={() => deleteQuotation(q.id, q.quotationNo)}
                          disabled={deleting === q.id}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Sil"
                        >
                          <span className="material-symbols-outlined text-[18px]">{deleting === q.id ? 'progress_activity' : 'delete'}</span>
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
    </div>
  );
}
