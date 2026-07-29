"use client";

import React, { useState, useEffect } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bu siparişi tamamen silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOrders(orders.filter((o) => o.id !== id));
        if (selectedOrder?.id === id) setSelectedOrder(null);
      } else {
        alert("Sipariş silinemedi.");
      }
    } catch {
      alert("Hata oluştu.");
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o))
        );
      } else {
        alert("Durum güncellenemedi.");
      }
    } catch {
      alert("Hata oluştu.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const downloadExcel = () => {
    window.open("/api/admin/orders/export", "_blank");
  };

  const parseJson = (val: string | null) => {
    if (!val) return null;
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  };

  if (loading) return <div className="p-8 max-w-7xl mx-auto min-h-screen bg-white text-zinc-500 text-xs">Siparişler yükleniyor...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-white text-zinc-900">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">MUSTERI ISLEMLERI</span>
          <h1 className="text-2xl font-light tracking-tight text-zinc-900 mt-1">Siparişler & Umre Talepleri</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Kullanıcıların oluşturduğu paketleri ve detaylı talepleri yönetin.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadExcel}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-4 py-2 rounded text-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Excel Dışa Aktar</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="border border-zinc-200 rounded overflow-hidden">
        {orders.length === 0 ? (
          <div className="py-16 text-center text-zinc-400 text-xs font-medium">
            Henüz kayıtlı bir sipariş bulunmuyor.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">Kişi Sayısı</th>
                <th className="px-4 py-3">Toplam Tutar</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {orders.map((o) => {
                const date = new Date(o.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });
                return (
                  <tr key={o.id} onClick={() => setSelectedOrder(o)} className="hover:bg-zinc-50 transition-colors cursor-pointer">
                    <td className="px-4 py-3 text-zinc-500 font-mono">{date}</td>
                    <td className="px-4 py-3 font-semibold text-zinc-900">{o.contactName || "Anonim"}</td>
                    <td className="px-4 py-3 text-zinc-600">{o.pax || 1} Kişi</td>
                    <td className="px-4 py-3 font-mono font-bold text-zinc-900">${o.totalUSD || 0}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded border border-zinc-200">
                        {o.status || "PENDING"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => handleDelete(o.id, e)}
                        className="p-1 text-zinc-400 hover:text-red-600 transition-colors"
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 rounded max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Sipariş Detayı</h3>
                <p className="text-xs text-zinc-500 font-mono">{selectedOrder.id}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-zinc-400 hover:text-zinc-900">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Müşteri Adı</span>
                  <span className="font-semibold text-zinc-900">{selectedOrder.contactName || "-"}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Telefon</span>
                  <span className="font-mono text-zinc-900">{selectedOrder.contactPhone || "-"}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Durum Güncelle</span>
                <select
                  value={selectedOrder.status || "PENDING"}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                  disabled={updatingStatus}
                  className="w-full bg-white border border-zinc-200 rounded p-2 text-xs focus:outline-none"
                >
                  <option value="PENDING">PENDING (Beklemede)</option>
                  <option value="CONFIRMED">CONFIRMED (Onaylandı)</option>
                  <option value="COMPLETED">COMPLETED (Tamamlandı)</option>
                  <option value="CANCELLED">CANCELLED (İptal)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
