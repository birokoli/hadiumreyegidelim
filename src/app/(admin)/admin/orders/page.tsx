"use client";
import React, { useState, useEffect } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="pt-28 p-12 min-h-screen bg-surface">Yükleniyor...</div>;

  return (
    <div className="pt-28 p-12 min-h-screen bg-surface">
      <header className="mb-12">
        <span className="text-tertiary font-label text-xs tracking-[0.2em] uppercase mb-2 block">Müşteri İşlemleri</span>
        <h2 className="text-5xl font-serif text-primary">Siparişler (Satın Alımlar)</h2>
        <p className="text-on-surface-variant mt-4 max-w-2xl font-light leading-relaxed">
            Kullanıcıların oluşturduğu umre planlarını ve siparişlerini buradan takip edebilirsiniz.
        </p>
      </header>

      <div className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-none">
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Tarih</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Kişi</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Toplam Fiyat</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {orders.map(order => (
              <tr key={order.id} className="group hover:bg-surface-container-low/50 transition-colors">
                <td className="px-8 py-6 text-sm text-on-surface">
                  {new Date(order.createdAt).toLocaleString('tr-TR')}
                </td>
                <td className="px-8 py-6 text-sm text-on-surface">{order.pax} Kişi</td>
                <td className="px-8 py-6 font-bold text-primary">${order.totalUSD}</td>
                <td className="px-8 py-6">
                  <span className="text-xs font-semibold px-3 py-1 bg-secondary-container/30 text-secondary rounded-md">
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={4} className="text-center py-8 text-outline">Henüz sipariş yok.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
