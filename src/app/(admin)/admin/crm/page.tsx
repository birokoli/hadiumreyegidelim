"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

type LeadStage = "NEW" | "IN_DISCUSSION" | "QUOTATION_SENT" | "WON" | "LOST";

const STAGES: { key: LeadStage; label: string; color: string; bg: string; border: string; icon: string }[] = [
  { key: "NEW", label: "Yeni Talep / Lead", color: "text-primary", bg: "bg-primary/[0.05]", border: "border-primary/20", icon: "inbox" },
  { key: "IN_DISCUSSION", label: "Görüşmede", color: "text-[#b8862f]", bg: "bg-[#b8862f]/[0.06]", border: "border-[#b8862f]/25", icon: "call" },
  { key: "QUOTATION_SENT", label: "Teklif Gönderildi", color: "text-secondary", bg: "bg-secondary/[0.06]", border: "border-secondary/25", icon: "request_quote" },
  { key: "WON", label: "Satış Kazanıldı (WON)", color: "text-secondary", bg: "bg-secondary/[0.1]", border: "border-secondary/35", icon: "task_alt" },
  { key: "LOST", label: "Kaybedildi (LOST)", color: "text-outline", bg: "bg-surface-container-low", border: "border-outline-variant/20", icon: "cancel" },
];

export default function CrmPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // New Lead Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    preferredPackage: "Özel Umre Paket Talebi",
    valueUSD: "1250",
    source: "MANUAL",
    stage: "NEW",
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/crm");
      const data = await res.json();
      if (data.leads) {
        setLeads(data.leads);
      }
    } catch (e) {
      console.error("CRM fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (leadId: string, newStage: LeadStage) => {
    try {
      const res = await fetch("/api/admin/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, stage: newStage }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, stage: newStage, updatedAt: new Date().toISOString() } : l))
        );
        if (selectedLead?.id === leadId) {
          setSelectedLead((prev: any) => ({ ...prev, stage: newStage }));
        }
      }
    } catch (e) {
      console.error("Stage update error:", e);
    }
  };

  const handleUpdateValue = async (leadId: string, val: string) => {
    try {
      const res = await fetch("/api/admin/crm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, valueUSD: val }),
      });
      if (res.ok) {
        const num = parseFloat(val) || 0;
        setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, valueUSD: num } : l)));
        if (selectedLead?.id === leadId) {
          setSelectedLead((prev: any) => ({ ...prev, valueUSD: num }));
        }
      }
    } catch (e) {
      console.error("Value update error:", e);
    }
  };

  const handleAddActivityNote = async () => {
    if (!selectedLead || !newNote.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch("/api/admin/crm/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactRequestId: selectedLead.id, note: newNote }),
      });
      if (res.ok) {
        const data = await res.json();
        const act = data.activity;
        setSelectedLead((prev: any) => ({
          ...prev,
          activities: [act, ...(prev.activities || [])],
        }));
        setLeads((prev) =>
          prev.map((l) => (l.id === selectedLead.id ? { ...l, activities: [act, ...(l.activities || [])] } : l))
        );
        setNewNote("");
      }
    } catch (e) {
      console.error("Add note error:", e);
    } finally {
      setSavingNote(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeadForm),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewLeadForm({
          name: "",
          phone: "",
          email: "",
          preferredPackage: "Özel Umre Paket Talebi",
          valueUSD: "1250",
          source: "MANUAL",
          stage: "NEW",
        });
        fetchLeads();
      }
    } catch (e) {
      console.error("Create lead error:", e);
    }
  };

  // KPIs
  const totalPipelineValue = leads.reduce((sum, l) => sum + (l.valueUSD || 0), 0);
  const wonLeads = leads.filter((l) => l.stage === "WON");
  const winRate = leads.length > 0 ? Math.round((wonLeads.length / leads.length) * 100) : 0;
  const activeLeadsCount = leads.filter((l) => l.stage !== "LOST" && l.stage !== "WON").length;

  if (loading) return <div className="p-8 max-w-7xl mx-auto min-h-screen bg-surface text-on-surface-variant text-xs">CRM Komuta Merkezi yükleniyor...</div>;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto min-h-screen bg-surface text-on-surface">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/15">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Satış & CRM</span>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-1">CRM Komuta Merkezi</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Tüm müşteri adaylarını ve satış fırsatlarını Kanban panosunda yönetin.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-container text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Yeni Fırsat Ekle
          </button>
        </div>
      </div>

      {/* Top KPI Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Toplam Fırsat Hacmi", value: `$${totalPipelineValue.toLocaleString("en-US")}`, badge: "PIPELINE", accent: "text-primary" },
          { label: "Kazanım Oranı (Win Rate)", value: `%${winRate}`, badge: "DÖNÜŞÜM", accent: "text-secondary" },
          { label: "Aktif Görüşmedeki Fırsatlar", value: `${activeLeadsCount} Müşteri`, badge: "DEVAM EDİYOR", accent: "text-[#b8862f]" },
          { label: "Toplam CRM Müşterisi", value: `${leads.length} Kayıt`, badge: "TOPLAM", accent: "text-on-surface-variant" },
        ].map((kpi) => (
          <div key={kpi.label} className="p-5 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest flex flex-col justify-between">
            <span className={`text-[10px] font-bold tracking-widest uppercase mb-3 ${kpi.accent}`}>{kpi.badge}</span>
            <div>
              <p className="text-xs text-on-surface-variant font-medium">{kpi.label}</p>
              <p className="font-headline text-2xl font-bold text-on-surface tracking-tight mt-1">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls & View Switcher */}
      <div className="flex justify-between items-center border-b border-outline-variant/15 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              viewMode === "kanban"
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/25 hover:border-primary/40"
            }`}
          >
            Kanban Görünümü
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              viewMode === "table"
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/25 hover:border-primary/40"
            }`}
          >
            Tablo Görünümü
          </button>
        </div>

        <span className="text-[11px] text-outline font-mono">Son Güncelleme: Canlı Senkronize</span>
      </div>

      {/* View Content */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-6">
          {STAGES.map((stg) => {
            const stageLeads = leads.filter((l) => (l.stage || "NEW") === stg.key);
            const stageTotal = stageLeads.reduce((s, l) => s + (l.valueUSD || 0), 0);

            return (
              <div
                key={stg.key}
                className={`${stg.bg} border ${stg.border} rounded-2xl p-4 flex flex-col min-h-[500px]`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-[16px] ${stg.color}`}>{stg.icon}</span>
                    <div>
                      <h3 className="text-xs font-bold text-on-surface">{stg.label}</h3>
                      <p className="text-[10px] text-outline font-mono mt-0.5">${stageTotal.toLocaleString("en-US")}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold bg-surface-container-lowest ${stg.color} px-2 py-0.5 rounded-full border ${stg.border}`}>
                    {stageLeads.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {stageLeads.length === 0 ? (
                    <div className="py-12 text-center text-[11px] text-outline italic">
                      Bu aşamada müşteri yok.
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="p-3.5 bg-surface-container-lowest border border-outline-variant/15 hover:border-primary/40 hover:shadow-sm rounded-xl cursor-pointer transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-xs font-bold text-on-surface">{lead.name}</p>
                          <span className="text-xs font-mono font-bold text-primary">${lead.valueUSD || 0}</span>
                        </div>

                        <p className="text-[11px] text-outline font-mono">{lead.phone}</p>

                        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/10 text-[10px] text-outline">
                          <span>{lead.preferredPackage || "Umre Talebi"}</span>
                          {lead.activities?.length > 0 && (
                            <span className="flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[12px]">chat</span>
                              {lead.activities.length}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-outline-variant/15 rounded-2xl overflow-hidden bg-surface-container-lowest">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low border-b border-outline-variant/15 text-on-surface-variant uppercase tracking-wider font-bold text-[10px]">
              <tr>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">Paket</th>
                <th className="px-4 py-3">Tutar</th>
                <th className="px-4 py-3">Aşama</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-primary/[0.03] transition-colors">
                  <td className="px-4 py-3 font-bold text-on-surface">{l.name}</td>
                  <td className="px-4 py-3 text-on-surface-variant font-mono">{l.phone}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{l.preferredPackage || "-"}</td>
                  <td className="px-4 py-3 font-mono font-bold text-primary">${l.valueUSD || 0}</td>
                  <td className="px-4 py-3">
                    <select
                      value={l.stage || "NEW"}
                      onChange={(e) => handleStageChange(l.id, e.target.value as LeadStage)}
                      className="bg-surface-container-lowest border border-outline-variant/25 text-xs text-on-surface rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary/40"
                    >
                      {STAGES.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedLead(l)}
                      className="px-2.5 py-1.5 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-primary-container transition-all active:scale-95"
                    >
                      Detay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected Lead Modal */}
      {selectedLead && (
        <div className="admin-modal-scrim fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-primary-fixed/40 backdrop-blur-sm">
          <div className="admin-modal-panel bg-surface-container-lowest border border-outline-variant/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
              <div>
                <h3 className="text-sm font-bold text-on-surface">{selectedLead.name}</h3>
                <p className="text-xs text-outline font-mono">{selectedLead.phone}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-outline hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-on-surface-variant">
              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Aşama</label>
                <select
                  value={selectedLead.stage || "NEW"}
                  onChange={(e) => handleStageChange(selectedLead.id, e.target.value as LeadStage)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/25 text-xs text-on-surface rounded-lg p-2 focus:outline-none focus:border-primary/40"
                >
                  {STAGES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Fırsat Değeri ($)</label>
                <input
                  type="number"
                  defaultValue={selectedLead.valueUSD || 0}
                  onBlur={(e) => handleUpdateValue(selectedLead.id, e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/25 text-xs text-on-surface rounded-lg p-2 focus:outline-none focus:border-primary/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-outline mb-1">Not Ekle</label>
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Görüşme notu yazın..."
                  className="w-full bg-surface-container-lowest border border-outline-variant/25 text-xs text-on-surface rounded-lg p-2 focus:outline-none focus:border-primary/40"
                />
                <button
                  onClick={handleAddActivityNote}
                  disabled={savingNote}
                  className="mt-2 w-full py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-container transition-all active:scale-95 disabled:opacity-60"
                >
                  Notu Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="admin-modal-scrim fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-primary-fixed/40 backdrop-blur-sm">
          <form onSubmit={handleCreateLead} className="admin-modal-panel bg-surface-container-lowest border border-outline-variant/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/15 pb-3">
              <h3 className="text-sm font-bold text-on-surface">Yeni Fırsat / Müşteri Adayı</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-outline hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-on-surface-variant font-bold mb-1">Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-bold mb-1">Telefon</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-bold mb-1">Fiyat ($)</label>
                <input
                  type="number"
                  value={newLeadForm.valueUSD}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, valueUSD: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant/25 rounded-lg p-2 focus:outline-none focus:border-primary/40"
                />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-container transition-all active:scale-95">
                Fırsatı Oluştur
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
