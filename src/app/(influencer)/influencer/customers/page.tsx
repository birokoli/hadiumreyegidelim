'use client';

import { useEffect, useState } from 'react';

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  clicked:       { label: 'Linke Tıkladı',    color: 'bg-blue-50 text-blue-600',     icon: 'ads_click' },
  contacted:     { label: 'Arandı',            color: 'bg-yellow-50 text-yellow-700', icon: 'phone_in_talk' },
  in_discussion: { label: 'Görüşüyor',         color: 'bg-orange-50 text-orange-600', icon: 'forum' },
  contracted:    { label: 'Sözleşme İmzaladı', color: 'bg-purple-50 text-purple-600', icon: 'description' },
  paid:          { label: 'Ödeme Yaptı',        color: 'bg-green-50 text-green-700',   icon: 'payments' },
  completed:     { label: 'Umre Tamamlandı',    color: 'bg-emerald-50 text-emerald-700', icon: 'mosque' },
  cancelled:     { label: 'İptal',              color: 'bg-red-50 text-red-500',       icon: 'cancel' },
};

const sourceConfig: Record<string, { label: string; color: string }> = {
  link:           { label: 'Link',             color: 'bg-blue-50 text-blue-600' },
  coupon:         { label: 'Kupon',            color: 'bg-purple-50 text-purple-600' },
  manual_phone:   { label: 'Telefon',          color: 'bg-orange-50 text-orange-600' },
  manual_branch:  { label: 'Bayi',             color: 'bg-gray-50 text-gray-600' },
};

export default function InfluencerCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/influencer/customers')
      .then(r => r.json())
      .then(d => { setCustomers(d.customers || []); setLoading(false); });
  }, []);

  const filtered = filter === 'all' ? customers : customers.filter(c => c.status === filter);

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-[24px] font-bold text-gray-900 tracking-tight">Müşterilerim</h1>
        <p className="text-[14px] text-gray-400 mt-0.5">Linkinizden veya kuponunuzdan gelen müşteriler (KVKK gereği isimler kısaltılmıştır)</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Toplam',         value: customers.length,                                            key: 'all' },
          { label: 'Görüşüyor',      value: customers.filter(c => c.status === 'in_discussion').length,  key: 'in_discussion' },
          { label: 'Ödeme Yaptı',   value: customers.filter(c => c.status === 'paid').length,            key: 'paid' },
          { label: 'Tamamlandı',     value: customers.filter(c => c.status === 'completed').length,      key: 'completed' },
        ].map(s => (
          <button key={s.key} onClick={() => setFilter(s.key)}
            className={`rounded-2xl border p-4 text-center transition-all ${filter === s.key ? 'bg-[#003781] border-[#003781] text-white' : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'}`}>
            <p className={`text-[24px] font-bold ${filter === s.key ? 'text-white' : 'text-gray-900'}`}>{s.value}</p>
            <p className={`text-[12px] font-medium mt-0.5 ${filter === s.key ? 'text-white/70' : 'text-gray-400'}`}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-[#003781]/20 border-t-[#003781] rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-gray-200 mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>person_search</span>
          <p className="text-[15px] font-semibold text-gray-400">Henüz müşteri yok</p>
          <p className="text-[13px] text-gray-300 mt-1">Linkinizi paylaşın, müşteriler geldiğinde burada görünür</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.map((c: any, i: number) => {
            const st = statusConfig[c.status] || statusConfig.clicked;
            const src = sourceConfig[c.source] || { label: c.source, color: 'bg-gray-50 text-gray-500' };
            const earned = c.commissionEarned;
            const pending = c.commissionPending;
            return (
              <div key={c.id} className={`flex items-center gap-4 px-5 py-4 ${i < filtered.length - 1 ? 'border-b border-gray-50' : ''}`}>
                {/* Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-[#003781]/10 to-[#003781]/5 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-[14px] font-bold text-[#003781]">{c.name[0]}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-semibold text-gray-900">{c.name}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${src.color}`}>{src.label}</span>
                  </div>
                  <p className="text-[12px] text-gray-400 mt-0.5">{new Date(c.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>

                {/* Commission */}
                <div className="text-right shrink-0">
                  {earned > 0 && <p className="text-[13px] font-bold text-emerald-600">+₺{earned.toLocaleString()}</p>}
                  {pending > 0 && <p className="text-[12px] text-orange-500">₺{pending.toLocaleString()} bekliyor</p>}
                  {earned === 0 && pending === 0 && <p className="text-[12px] text-gray-300">—</p>}
                </div>

                {/* Status */}
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold shrink-0 ${st.color}`}>
                  <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>{st.icon}</span>
                  <span className="hidden sm:inline">{st.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* KVKK notu */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 px-5 py-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-[20px] text-gray-400 mt-0.5">shield</span>
        <p className="text-[12px] text-gray-400 leading-relaxed">
          KVKK kapsamında müşteri telefon ve email bilgileri görüntülenmemektedir. Sadece ad-soyad baş harfi ile süreç durumu görünür.
        </p>
      </div>
    </div>
  );
}
