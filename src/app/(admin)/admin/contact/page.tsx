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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  UNREAD:    { label: "Yeni",      color: "text-red-600",    bg: "bg-red-50 border-red-200"     },
  CONTACTED: { label: "Ulaşıldı", color: "text-amber-600",  bg: "bg-amber-50 border-amber-200" },
  RESOLVED:  { label: "Çözüldü",  color: "text-green-600",  bg: "bg-green-50 border-green-200" },
};

function buildWaUrl(lead: Lead): string {
  let phone = lead.phone.replace(/[^0-9]/g, '');
  if (phone.startsWith('0')) phone = '9' + phone;
  if (!phone.startsWith('90')) phone = '90' + phone;
  const msg = lead.package
    ? `Merhaba ${lead.name.split(' ')[0]} Bey/Hanım, Hadi Umreye Gidelim platformundan oluşturduğunuz "${lead.package}" talebi üzerine size ulaşıyoruz. Yardımcı olmamı ister misiniz?`
    : `Merhaba ${lead.name.split(' ')[0]} Bey/Hanım, Hadi Umreye Gidelim platformundan oluşturduğunuz talep üzerine size ulaşıyoruz.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

function LeadScore({ lead }: { lead: Lead }) {
  let score = 0;
  if (lead.package) score += 3;
  if (lead.message && lead.message.length > 20) score += 2;
  const ageHours = (Date.now() - new Date(lead.createdAt).getTime()) / 3600000;
  if (ageHours < 2) score += 3;
  else if (ageHours < 24) score += 1;

  const label = score >= 6 ? { text: "Sıcak Lead", color: "bg-red-100 text-red-700" }
    : score >= 3 ? { text: "Umut Verici", color: "bg-amber-100 text-amber-700" }
    : { text: "Soğuk", color: "bg-slate-100 text-slate-600" };

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${label.color}`}>
      {label.text}
    </span>
  );
}

export default function ContactLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "UNREAD" | "CONTACTED" | "RESOLVED">("ALL");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
    setUpdatingId(id);
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
    finally { setUpdatingId(null); }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Bu talebi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/contact/${id}`, { method: "DELETE" });
      if (res.ok) setLeads(prev => prev.filter(l => l.id !== id));
    } catch {}
  };

  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`${selected.size} talep silinsin mi?`)) return;
    for (const id of selected) {
      await fetch(`/api/admin/contact/${id}`, { method: "DELETE" });
    }
    setLeads(prev => prev.filter(l => !selected.has(l.id)));
    setSelected(new Set());
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selected.size === 0) return;
    for (const id of selected) {
      await fetch(`/api/admin/contact/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    }
    setLeads(prev => prev.map(l => selected.has(l.id) ? { ...l, status } : l));
    setSelected(new Set());
  };

  const filtered = leads.filter(l => {
    const matchSearch = !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      (l.package || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.message || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    UNREAD: leads.filter(l => l.status === "UNREAD").length,
    CONTACTED: leads.filter(l => l.status === "CONTACTED").length,
    RESOLVED: leads.filter(l => l.status === "RESOLVED").length,
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-surface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">İletişim Talepleri</h1>
          <p className="text-sm text-on-surface-variant mt-1">WhatsApp & İletişim formu potansiyel müşterileri</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <>
              <button onClick={() => bulkUpdateStatus("CONTACTED")} className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 text-amber-700 rounded-xl font-bold text-xs hover:bg-amber-200 transition-colors">
                <span className="material-symbols-outlined text-[16px]">phone</span> Ulaşıldı
              </button>
              <button onClick={() => bulkUpdateStatus("RESOLVED")} className="flex items-center gap-1.5 px-3 py-2 bg-green-100 text-green-700 rounded-xl font-bold text-xs hover:bg-green-200 transition-colors">
                <span className="material-symbols-outlined text-[16px]">check_circle</span> Çözüldü
              </button>
              <button onClick={bulkDelete} className="flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-600 rounded-xl font-bold text-xs hover:bg-red-200 transition-colors">
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span> {selected.size} Sil
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { key: "UNREAD", icon: "mark_email_unread", color: "text-red-500", bg: "bg-red-50" },
          { key: "CONTACTED", icon: "phone_in_talk", color: "text-amber-500", bg: "bg-amber-50" },
          { key: "RESOLVED", icon: "check_circle", color: "text-green-500", bg: "bg-green-50" },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setStatusFilter(statusFilter === s.key as any ? "ALL" : s.key as any)}
            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${statusFilter === s.key ? 'border-primary bg-primary/5' : 'bg-white border-outline-variant/10 hover:shadow-sm'}`}
          >
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <span className={`material-symbols-outlined text-[20px] ${s.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium">{STATUS_CONFIG[s.key].label}</p>
              <p className="text-2xl font-bold text-slate-900">{counts[s.key as keyof typeof counts]}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Smart suggestions */}
      {counts.UNREAD > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <span className="material-symbols-outlined text-amber-500 text-[22px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
          <div>
            <p className="text-sm font-bold text-amber-800">
              {counts.UNREAD} okunmamış lead var.
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              WhatsApp mesajı gönderdikten sonra durumu "Ulaşıldı" olarak işaretleyin.
              Paketle ilgilenen leadler sıcak lead — öncelik verin.
            </p>
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
          <input
            type="text"
            placeholder="İsim, telefon veya paket ile ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-outline-variant/20 rounded-xl p-1">
          {(["ALL", "UNREAD", "CONTACTED", "RESOLVED"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === s ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-surface-container'}`}>
              {s === "ALL" ? "Tümü" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <span className="text-sm text-on-surface-variant self-center">{filtered.length} kayıt</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-3 block">inbox</span>
            <p className="font-bold text-primary">Talep bulunamadı</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant/10">
                  <th className="p-4 w-10">
                    <input type="checkbox"
                      checked={selected.size === filtered.length && filtered.length > 0}
                      onChange={e => setSelected(e.target.checked ? new Set(filtered.map(l => l.id)) : new Set())}
                    />
                  </th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-outline">Müşteri</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-outline hidden md:table-cell">Paket / Mesaj</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-outline text-center hidden sm:table-cell">Skor</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-outline text-center">Durum</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-outline text-right">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {filtered.map(lead => {
                  const cfg = STATUS_CONFIG[lead.status] || STATUS_CONFIG.UNREAD;
                  const date = new Date(lead.createdAt).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
                  return (
                    <tr key={lead.id} className={`hover:bg-surface-container-lowest transition-colors ${selected.has(lead.id) ? 'bg-primary/3' : ''}`}>
                      <td className="p-4">
                        <input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleSelect(lead.id)} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-primary text-sm">{lead.name}</p>
                            <p className="text-xs font-mono text-secondary">{lead.phone}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{date}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        {lead.package && (
                          <span className="inline-block bg-primary/5 text-primary text-xs font-bold px-2.5 py-1 rounded border border-primary/10 mb-1">
                            {lead.package}
                          </span>
                        )}
                        {lead.message && (
                          <p className="text-xs text-slate-500 max-w-[260px] truncate" title={lead.message}>{lead.message}</p>
                        )}
                      </td>
                      <td className="p-4 text-center hidden sm:table-cell">
                        <LeadScore lead={lead} />
                      </td>
                      <td className="p-4 text-center">
                        <select
                          value={lead.status}
                          disabled={updatingId === lead.id}
                          onChange={e => updateStatus(lead.id, e.target.value)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border cursor-pointer focus:outline-none ${cfg.bg} ${cfg.color}`}
                        >
                          <option value="UNREAD">Yeni</option>
                          <option value="CONTACTED">Ulaşıldı</option>
                          <option value="RESOLVED">Çözüldü</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={buildWaUrl(lead)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => lead.status === 'UNREAD' && updateStatus(lead.id, 'CONTACTED')}
                            className="inline-flex items-center gap-1.5 bg-[#25D366] text-white font-bold text-[11px] px-3 py-2 rounded-lg hover:bg-[#1DA851] active:scale-95 transition-all"
                          >
                            WhatsApp <span className="material-symbols-outlined text-[13px]">chat</span>
                          </a>
                          <button
                            onClick={() => deleteLead(lead.id)}
                            className="p-2 bg-error/10 text-error hover:bg-error hover:text-white rounded-lg transition-all"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
