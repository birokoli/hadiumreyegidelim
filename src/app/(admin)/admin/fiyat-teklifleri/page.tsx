'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface QuotationItem {
  saleTotalUsd: number;
}

interface Quotation {
  id: string;
  quotationNo: string;
  customerName: string;
  customerPhone?: string;
  adultsCount: number;
  childrenCount: number;
  travelDate?: string;
  status: string;
  createdAt: string;
  items: QuotationItem[];
}

function calcTotal(items: QuotationItem[]) {
  return items.reduce((s, i) => s + i.saleTotalUsd, 0);
}

function paxLabel(adults: number, children: number) {
  return children > 0 ? `${adults}Y + ${children}Ç` : `${adults} Yetişkin`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function QuotationsListPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFlt, setStatusFlt] = useState('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch('/api/admin/quotations');
    if (res.ok) setQuotations((await res.json()).quotations ?? []);
    setLoading(false);
  }

  async function del(id: string, no: string) {
    if (!confirm(`"${no}" numaralı teklifi silmek istediğinizden emin misiniz?`)) return;
    setDeleting(id);
    await fetch(`/api/admin/quotations/${id}`, { method: 'DELETE' });
    setQuotations(prev => prev.filter(q => q.id !== id));
    setDeleting(null);
  }

  const filtered = quotations.filter(q => {
    const m = !search
      || q.customerName.toLowerCase().includes(search.toLowerCase())
      || q.quotationNo.toLowerCase().includes(search.toLowerCase())
      || (q.customerPhone ?? '').includes(search);
    return m && (statusFlt === 'all' || q.status === statusFlt);
  });

  const totalValue = filtered.reduce((s, q) => s + calcTotal(q.items), 0);

  if (loading) return <div className="p-8 max-w-7xl mx-auto min-h-screen bg-white text-zinc-500 text-xs">Fiyat teklifleri yükleniyor...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-white text-zinc-900">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">SATIS & TEKLIFLER</span>
          <h1 className="text-2xl font-light tracking-tight text-zinc-900 mt-1">Fiyat Teklifleri</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{quotations.length} teklif · Toplam ${totalValue.toLocaleString('en-US')} USD</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/fiyat-teklifleri/yeni">
            <button className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-4 py-2 rounded text-xs transition-colors">
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Yeni Teklif Oluştur</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[16px]">
            search
          </span>
          <input
            type="text"
            placeholder="Müşteri adı, teklif no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white text-xs text-zinc-900 rounded pl-8 pr-3 py-1.5 border border-zinc-200 focus:outline-none focus:border-zinc-900"
          />
        </div>

        <select
          value={statusFlt}
          onChange={(e) => setStatusFlt(e.target.value)}
          className="bg-white border border-zinc-200 text-xs text-zinc-800 rounded px-3 py-1.5 focus:outline-none"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="draft">Taslak</option>
          <option value="sent">Gönderildi</option>
          <option value="accepted">Kabul Edildi</option>
          <option value="rejected">Reddedildi</option>
        </select>
      </div>

      {/* Table */}
      <div className="border border-zinc-200 rounded overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 text-xs font-medium">
            Kayıtlı fiyat teklifi bulunamadı.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="px-4 py-3">Teklif No</th>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">Seyahat / Pax</th>
                <th className="px-4 py-3">Tutar</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Oluşturulma</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.map((q) => {
                const tot = calcTotal(q.items);
                return (
                  <tr key={q.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-zinc-900">{q.quotationNo}</td>
                    <td className="px-4 py-3 font-semibold text-zinc-900">{q.customerName}</td>
                    <td className="px-4 py-3 text-zinc-500">{paxLabel(q.adultsCount, q.childrenCount)}</td>
                    <td className="px-4 py-3 font-mono font-bold text-zinc-900">${tot > 0 ? tot.toLocaleString('en-US') : '-'}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200 uppercase">
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 font-mono">{formatDate(q.createdAt)}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link href={`/admin/fiyat-teklifleri/${q.id}`}>
                        <button className="p-1 text-zinc-400 hover:text-zinc-900">
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                      </Link>
                      <button
                        onClick={() => del(q.id, q.quotationNo)}
                        disabled={deleting === q.id}
                        className="p-1 text-zinc-400 hover:text-red-600"
                      >
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
    </div>
  );
}
