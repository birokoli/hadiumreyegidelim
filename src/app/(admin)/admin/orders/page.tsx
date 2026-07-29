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

  // Helper JSON parsing
  const parseJson = (val: string | null) => {
    if (!val) return null;
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  };

  if (loading) return <div className="pt-28 p-12 min-h-screen bg-surface">Siparişler Yükleniyor...</div>;

  return (
    <div className="pt-28 p-12 min-h-screen bg-surface space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="text-tertiary font-label text-xs tracking-[0.2em] uppercase mb-2 block">
            Müşteri İşlemleri
          </span>
          <h2 className="text-5xl font-serif text-primary">Siparişler & Umre Talepleri</h2>
          <p className="text-on-surface-variant mt-4 max-w-2xl font-light leading-relaxed">
            Kullanıcıların özelleştirip oluşturduğu umre paketlerini, seçtiği uçak/otel/transfer kalemlerini detaylı inceleyebilir ve sipariş durumunu yönetebilirsiniz.
          </p>
        </div>
        <div>
          <button
            onClick={downloadExcel}
            className="bg-[#107C41] hover:bg-[#185C37] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 text-sm tracking-wide"
          >
            <span className="material-symbols-outlined text-[20px]">table_chart</span> Excel Çıktısı Al
          </button>
        </div>
      </header>

      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-none">
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Tarih</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Kişi</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">İçerik Özet</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Toplam Fiyat</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase">Durum</th>
              <th className="px-8 py-5 text-[10px] font-bold tracking-widest text-outline uppercase text-right">Aksiyon</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {orders.map((order) => {
              const flight = parseJson(order.flight);
              const hotel = parseJson(order.hotel);
              const transfer = parseJson(order.transfer);
              const guide = parseJson(order.guide);
              const extras = parseJson(order.extras);
              const contact = parseJson(order.contactInfo);

              const summaryItems: string[] = [];
              if (flight) summaryItems.push(`✈️ ${flight.airline || flight.name || "Uçuş"}`);
              if (hotel) summaryItems.push(`🏨 ${hotel.name || "Otel"}`);
              if (transfer) summaryItems.push(`🚘 Transfer`);
              if (guide) summaryItems.push(`📖 Rehber`);
              if (extras && extras.length > 0) summaryItems.push(`✨ ${extras.length} Ekstra`);

              return (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="group hover:bg-primary/5 cursor-pointer transition-colors"
                >
                  <td className="px-8 py-6 text-sm text-on-surface font-mono">
                    {new Date(order.createdAt).toLocaleString("tr-TR")}
                  </td>
                  <td className="px-8 py-6 text-sm font-semibold text-on-surface">{order.pax} Kişi</td>
                  <td className="px-8 py-6 text-xs text-slate-600">
                    {summaryItems.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {summaryItems.map((item, idx) => (
                          <span key={idx} className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md font-medium text-slate-700 dark:text-slate-300">
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="italic text-slate-400">Genel Özel Paket</span>
                    )}
                  </td>
                  <td className="px-8 py-6 font-bold text-primary text-base">${order.totalUSD}</td>
                  <td className="px-8 py-6">
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                        order.status === "PAID" || order.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : order.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                      className="bg-primary/10 hover:bg-primary hover:text-white text-primary px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      İncele & Detay
                    </button>
                    <button
                      onClick={(e) => handleDelete(order.id, e)}
                      className="text-error hover:bg-error/10 p-2 rounded-xl transition-colors inline-flex items-center justify-center"
                      title="Sil"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-outline">
                  Henüz kayıtlı sipariş yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-8">
            {/* Modal Header */}
            <div className="bg-primary text-white px-8 py-6 flex justify-between items-center">
              <div>
                <span className="text-xs uppercase tracking-widest text-white/70 font-mono">Sipariş ID: {selectedOrder.id}</span>
                <h3 className="text-2xl font-bold font-headline mt-1">Sipariş & Paket Detayı</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Contact Info & Meta */}
              {(() => {
                const contact = parseJson(selectedOrder.contactInfo);
                return (
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">person</span> Müşteri İletişim Bilgileri
                      </h4>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(selectedOrder.createdAt).toLocaleString("tr-TR")}
                      </span>
                    </div>

                    {contact ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-slate-400 font-bold">Müşteri Adı</p>
                          <p className="font-bold text-slate-800 dark:text-white mt-0.5">{contact.name || "Belirtilmedi"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold">Telefon</p>
                          <p className="font-bold text-slate-800 dark:text-white mt-0.5">{contact.phone || "Belirtilmedi"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold">E-Posta</p>
                          <p className="font-bold text-slate-800 dark:text-white mt-0.5">{contact.email || "Belirtilmedi"}</p>
                        </div>
                        {contact.phone && (
                          <div className="col-span-3 pt-2">
                            <a
                              href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all"
                            >
                              <span className="material-symbols-outlined text-[18px]">chat</span>
                              WhatsApp'tan İletişime Geç ({contact.phone})
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">info</span>
                        <span>Müşteri ödeme/taslak aşamasında iletişim formunu henüz göndermeden siparişi oluşturmuş (İletişim bilgisi doldurulmamış).</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Order Status Controller */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Sipariş Durumu</h4>
                  <p className="text-xs text-slate-500">Müşteriyle görüştükçe sipariş durumunu güncelleyebilirsiniz.</p>
                </div>
                <div className="flex items-center gap-2">
                  {["PENDING", "CONTACTED", "PAID", "COMPLETED", "CANCELLED"].map((st) => (
                    <button
                      key={st}
                      disabled={updatingStatus}
                      onClick={() => handleUpdateStatus(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedOrder.status === st
                          ? "bg-primary text-white shadow-md ring-2 ring-primary/30"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Package Breakdown */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">inventory_2</span> Seçilen Paket Kalemleri & Hizmetler ({selectedOrder.pax} Kişi)
                </h4>

                <div className="space-y-3">
                  {/* Flight */}
                  {(() => {
                    const flight = parseJson(selectedOrder.flight);
                    if (!flight) return null;
                    return (
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="p-3 bg-blue-100 text-blue-700 rounded-xl font-bold">✈️</span>
                          <div>
                            <p className="font-bold text-sm text-slate-800 dark:text-white">{flight.name || "Uçak Bileti"}</p>
                            <p className="text-xs text-slate-500">
                              {flight.airline} {flight.code ? `(${flight.code})` : ""} · Kalkış: {flight.departureTime || "-"} · Varış: {flight.arrivalTime || "-"}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-primary text-sm">${flight.price} / kişi</span>
                      </div>
                    );
                  })()}

                  {/* Hotel */}
                  {(() => {
                    const hotel = parseJson(selectedOrder.hotel);
                    if (!hotel) return null;
                    return (
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="p-3 bg-amber-100 text-amber-700 rounded-xl font-bold">🏨</span>
                          <div>
                            <p className="font-bold text-sm text-slate-800 dark:text-white">{hotel.name || "Otel Konaklaması"}</p>
                            <p className="text-xs text-slate-500">
                              {hotel.city || "Mekke/Medine"} · Mesafesi: {hotel.distanceText || "-"}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-primary text-sm">${hotel.price}</span>
                      </div>
                    );
                  })()}

                  {/* Transfer */}
                  {(() => {
                    const transfer = parseJson(selectedOrder.transfer);
                    if (!transfer) return null;
                    return (
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="p-3 bg-emerald-100 text-emerald-700 rounded-xl font-bold">🚘</span>
                          <div>
                            <p className="font-bold text-sm text-slate-800 dark:text-white">{transfer.name || "Özel VIP Transfer"}</p>
                            <p className="text-xs text-slate-500">{transfer.description || "Havalimanı - Otel VIP Ulaşım"}</p>
                          </div>
                        </div>
                        <span className="font-bold text-primary text-sm">${transfer.price}</span>
                      </div>
                    );
                  })()}

                  {/* Guide */}
                  {(() => {
                    const guide = parseJson(selectedOrder.guide);
                    if (!guide) return null;
                    return (
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="p-3 bg-purple-100 text-purple-700 rounded-xl font-bold">📖</span>
                          <div>
                            <p className="font-bold text-sm text-slate-800 dark:text-white">{guide.name || "Özel Rehberlik Hizmeti"}</p>
                            <p className="text-xs text-slate-500">{guide.title || "İlahiyatçı Manevi Rehber"}</p>
                          </div>
                        </div>
                        <span className="font-bold text-primary text-sm">${guide.price}</span>
                      </div>
                    );
                  })()}

                  {/* Extras */}
                  {(() => {
                    const extras = parseJson(selectedOrder.extras);
                    if (!extras || extras.length === 0) return null;
                    return (
                      <div className="space-y-2">
                        {extras.map((ex: any, idx: number) => (
                          <div key={idx} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <span className="p-3 bg-rose-100 text-rose-700 rounded-xl font-bold">✨</span>
                              <div>
                                <p className="font-bold text-sm text-slate-800 dark:text-white">{ex.name}</p>
                                <p className="text-xs text-slate-500">{ex.description || "Ekstra Tur & Deneyim"}</p>
                              </div>
                            </div>
                            <span className="font-bold text-primary text-sm">${ex.price}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Total USD Bar */}
              <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">Toplam USD Tutarı ({selectedOrder.pax} Kişi)</p>
                  <p className="text-xs text-slate-500">Tüm seçili uçuş, otel, transfer ve ekstralar dahil</p>
                </div>
                <span className="text-3xl font-extrabold text-primary">${selectedOrder.totalUSD}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 dark:bg-slate-800 px-8 py-4 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
