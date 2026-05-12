'use client';

import { useEffect, useState } from 'react';

const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
  pending:  { label: 'Bekliyor',     color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: 'schedule' },
  approved: { label: 'Onaylandı',    color: 'bg-blue-50 text-blue-700 border-blue-200',       icon: 'check_circle' },
  paid:     { label: 'Ödendi',       color: 'bg-green-50 text-green-700 border-green-200',    icon: 'payments' },
  cancelled:{ label: 'İptal',        color: 'bg-red-50 text-red-600 border-red-200',          icon: 'cancel' },
};

export default function InfluencerPaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/influencer/dashboard').then(r => r.json()),
      fetch('/api/influencer/payments').then(r => r.json()),
    ]).then(([d, p]) => {
      setData(d);
      setPayments(p.payments || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#003781]/20 border-t-[#003781] rounded-full animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="space-y-6 pb-20 lg:pb-0">
      <div>
        <h1 className="text-[24px] font-bold text-gray-900 tracking-tight">Ödemelerim</h1>
        <p className="text-[14px] text-gray-400 mt-0.5">Komisyon kazançlarınız ve ödeme geçmişiniz</p>
      </div>

      {/* Earning cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#003781] to-[#002a63] rounded-2xl p-5 text-white shadow-lg shadow-[#003781]/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[18px] text-white/60">account_balance_wallet</span>
            <p className="text-[13px] text-white/60 font-medium">Toplam Kazanç</p>
          </div>
          <p className="text-[32px] font-bold">₺{(stats.totalEarnings || 0).toLocaleString()}</p>
          <p className="text-[12px] text-white/40 mt-1">Tüm zamanlar</p>
        </div>

        <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[18px] text-amber-500">pending</span>
            <p className="text-[13px] text-gray-400 font-medium">Bekleyen Ödeme</p>
          </div>
          <p className="text-[32px] font-bold text-gray-900">₺{(stats.pendingEarnings || 0).toLocaleString()}</p>
          <p className="text-[12px] text-gray-400 mt-1">Onay bekleniyor</p>
        </div>

        <div className="bg-white rounded-2xl border border-green-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[18px] text-green-500">check_circle</span>
            <p className="text-[13px] text-gray-400 font-medium">Ödenen</p>
          </div>
          <p className="text-[32px] font-bold text-gray-900">
            ₺{payments.filter(p => p.status === 'paid').reduce((a: number, p: any) => a + p.netAmount, 0).toLocaleString()}
          </p>
          <p className="text-[12px] text-gray-400 mt-1">Hesabınıza geçen</p>
        </div>
      </div>

      {/* Nasıl çalışır */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <h3 className="text-[14px] font-bold text-blue-900 mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">info</span>
          Ödeme Nasıl Çalışır?
        </h3>
        <div className="space-y-2">
          {[
            'Müşteri umreye gider ve 15 günlük iade süresi dolduktan sonra komisyon "hak edildi" sayılır.',
            'Her ayın sonunda yönetim size ait ödemeleri toplar ve onaylar.',
            'Onaylanan ödeme en kısa sürede IBAN\'ınıza transfer edilir.',
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <p className="text-[13px] text-blue-700 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Payment history */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="text-[16px] font-bold text-gray-900">Ödeme Geçmişi</h2>
        </div>

        {payments.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-gray-200 mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
            <p className="text-[15px] font-semibold text-gray-400">Henüz ödeme kaydı yok</p>
            <p className="text-[13px] text-gray-300 mt-1">Satışlarınız hak edildikçe burada görünür</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {payments.map((p: any) => {
              const st = statusConfig[p.status] || statusConfig.pending;
              return (
                <div key={p.id} className="flex items-center gap-4 px-5 py-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${st.color}`}>
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>{st.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-gray-900">{p.periodMonth} dönemi</p>
                    <p className="text-[12px] text-gray-400 mt-0.5">
                      {p.sales?.length || 0} satış • {p.approvedAt ? `Onaylandı: ${new Date(p.approvedAt).toLocaleDateString('tr-TR')}` : 'Onay bekleniyor'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[16px] font-bold text-gray-900">₺{p.netAmount?.toLocaleString()}</p>
                    {p.taxDeduction > 0 && (
                      <p className="text-[11px] text-gray-400">Stopaj: ₺{p.taxDeduction?.toLocaleString()}</p>
                    )}
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${st.color} hidden sm:flex items-center gap-1`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
