"use client";

import React, { useState, useEffect, useCallback } from "react";

type Lead = {
  id: string;
  name: string;
  phone: string;
  package: string | null;
  message: string | null;
  status: string;
  createdAt: string;
};

function buildWaUrl(lead: Lead): string {
  let phone = lead.phone.replace(/[^0-9]/g, "");
  if (phone.startsWith("0")) phone = "9" + phone;
  if (!phone.startsWith("90")) phone = "90" + phone;
  const msg = lead.package
    ? `Merhaba ${lead.name.split(" ")[0]} Bey/Hanım, Hadi Umreye Gidelim platformundan oluşturduğunuz "${lead.package}" talebi üzerine size ulaşıyoruz. Yardımcı olmamı ister misiniz?`
    : `Merhaba ${lead.name.split(" ")[0]} Bey/Hanım, Hadi Umreye Gidelim platformundan oluşturduğunuz talep üzerine size ulaşıyoruz.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

export default function ContactLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNREAD" | "CONTACTED" | "RESOLVED">("ALL");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/contact");
      const data = await res.json();
      if (Array.isArray(data)) setLeads(data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
      }
    } catch {}
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Bu talebi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/contact/${id}`, { method: "DELETE" });
      if (res.ok) setLeads(prev => prev.filter(l => l.id !== id));
    } catch {}
  };

  const filtered = leads.filter(l => {
    if (statusFilter !== "ALL" && l.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.name.toLowerCase().includes(q) || l.phone.includes(q) || (l.package && l.package.toLowerCase().includes(q));
    }
    return true;
  });

  const unreadCount = leads.filter(l => l.status === "UNREAD").length;
  const contactedCount = leads.filter(l => l.status === "CONTACTED").length;
  const resolvedCount = leads.filter(l => l.status === "RESOLVED").length;

  if (loading) return <div className="p-8 max-w-7xl mx-auto min-h-screen bg-surface text-on-surface-variant text-xs">Talepler yükleniyor...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-surface text-on-surface">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/15">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Satış & CRM</span>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-1">İletişim Talepleri & WhatsApp</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">WhatsApp ve iletişim formu üzerinden gelen müşteri potansiyelleri.</p>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-error/20 bg-surface-container-lowest flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-error uppercase">Okunmadı</span>
            <p className="font-headline text-2xl font-bold text-on-surface mt-1">{unreadCount}</p>
          </div>
          <span className="text-xs font-bold bg-error text-white px-2.5 py-1 rounded-full">YENİ</span>
        </div>

        <div className="p-5 rounded-2xl border border-[#b8862f]/25 bg-surface-container-lowest flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#b8862f] uppercase">Ulaşıldı</span>
            <p className="font-headline text-2xl font-bold text-on-surface mt-1">{contactedCount}</p>
          </div>
          <span className="text-xs font-bold bg-[#b8862f]/10 text-[#b8862f] px-2.5 py-1 rounded-full">GÖRÜŞMEDE</span>
        </div>

        <div className="p-5 rounded-2xl border border-secondary/25 bg-surface-container-lowest flex justify-between items-center">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Çözüldü</span>
            <p className="font-headline text-2xl font-bold text-on-surface mt-1">{resolvedCount}</p>
          </div>
          <span className="text-xs font-bold bg-secondary/10 text-secondary px-2.5 py-1 rounded-full">TAMAMLANDI</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-outline-variant/15 pb-4">
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(["ALL", "UNREAD", "CONTACTED", "RESOLVED"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                statusFilter === st
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/25 hover:border-primary/40"
              }`}
            >
              {st === "ALL" ? "Tümü" : st === "UNREAD" ? "Okunmadı" : st === "CONTACTED" ? "Ulaşıldı" : "Çözüldü"}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px]">
            search
          </span>
          <input
            type="text"
            placeholder="İsim, telefon veya paket ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-lowest text-xs text-on-surface rounded-xl pl-9 pr-3 py-2 border border-outline-variant/25 focus:outline-none focus:border-primary/40"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="border border-outline-variant/15 rounded-2xl overflow-hidden bg-surface-container-lowest">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-outline text-xs font-medium">
            Aramanıza uygun talep bulunamadı.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low border-b border-outline-variant/15 text-on-surface-variant uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">İlgilendiği Paket</th>
                <th className="px-4 py-3">Tarih</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filtered.map((l) => {
                const date = new Date(l.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
                return (
                  <tr key={l.id} className="hover:bg-primary/[0.03] transition-colors">
                    <td className="px-4 py-3 font-bold text-on-surface">{l.name}</td>
                    <td className="px-4 py-3 font-mono text-on-surface-variant">{l.phone}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{l.package || "Özel İletişim Formu"}</td>
                    <td className="px-4 py-3 text-outline font-mono">{date}</td>
                    <td className="px-4 py-3">
                      <select
                        value={l.status}
                        onChange={(e) => updateStatus(l.id, e.target.value)}
                        className="bg-surface-container-lowest border border-outline-variant/25 text-xs text-on-surface rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary/40"
                      >
                        <option value="UNREAD">Okunmadı</option>
                        <option value="CONTACTED">Ulaşıldı</option>
                        <option value="RESOLVED">Çözüldü</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <a
                        href={buildWaUrl(l)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-[#25D366] text-white hover:bg-[#1fb958] px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[14px]">chat</span>
                        <span>WhatsApp</span>
                      </a>
                      <button
                        onClick={() => deleteLead(l.id)}
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
