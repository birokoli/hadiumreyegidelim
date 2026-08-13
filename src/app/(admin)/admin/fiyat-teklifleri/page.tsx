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

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-outline-variant/20 text-on-surface-variant border-outline-variant/25",
  sent: "bg-primary/10 text-primary border-primary/25",
  accepted: "bg-secondary/10 text-secondary border-secondary/25",
  rejected: "bg-error/10 text-error border-error/25",
};

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

  if (loading) return <div className="p-8 max-w-7xl mx-auto min-h-screen bg-surface text-on-surface-variant text-xs">Fiyat teklifleri yükleniyor...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-surface text-on-surface">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/15">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Satış & Teklifler</span>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-1">Fiyat Teklifleri</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">{quotations.length} teklif · Toplam ${totalValue.toLocaleString('en-US')} USD</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/fiyat-teklifleri/yeni">
            <button className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-container text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all active:scale-95 shadow-sm">
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Yeni Teklif Oluştur</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-outline-variant/15 pb-4">
        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px]">
            search
          </span>
          <input
            type="text"
            placeholder="Müşteri adı, teklif no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-lowest text-xs text-on-surface rounded-xl pl-9 pr-3 py-2 border border-outline-variant/25 focus:outline-none focus:border-primary/40"
          />
        </div>

        <select
          value={statusFlt}
          onChange={(e) => setStatusFlt(e.target.value)}
          className="bg-surface-container-lowest border border-outline-variant/25 text-xs text-on-surface rounded-xl px-3 py-2 focus:outline-none focus:border-primary/40"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="draft">Taslak</option>
          <option value="sent">Gönderildi</option>
          <option value="accepted">Kabul Edildi</option>
          <option value="rejected">Reddedildi</option>
        </select>
      </div>

      {/* Table */}
      <div className="border border-outline-variant/15 rounded-2xl overflow-hidden bg-surface-container-lowest">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-outline text-xs font-medium">
            Kayıtlı fiyat teklifi bulunamadı.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low border-b border-outline-variant/15 text-on-surface-variant uppercase tracking-wider font-bold text-[10px]">
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
            <tbody className="divide-y divide-outline-variant/10">
              {filtered.map((q) => {
                const tot = calcTotal(q.items);
                return (
                  <tr key={q.id} className="hover:bg-primary/[0.03] transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-primary">{q.quotationNo}</td>
                    <td className="px-4 py-3 font-bold text-on-surface">{q.customerName}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{paxLabel(q.adultsCount, q.childrenCount)}</td>
                    <td className="px-4 py-3 font-mono font-bold text-on-surface">${tot > 0 ? tot.toLocaleString('en-US') : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${STATUS_STYLES[q.status] || STATUS_STYLES.draft}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-outline font-mono">{formatDate(q.createdAt)}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link href={`/admin/fiyat-teklifleri/${q.id}`}>
                        <button className="p-1.5 text-outline hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                      </Link>
                      <button
                        onClick={() => del(q.id, q.quotationNo)}
                        disabled={deleting === q.id}
                        className="p-1.5 text-outline hover:text-error transition-colors"
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
