"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

type LeadStage = "NEW" | "IN_DISCUSSION" | "QUOTATION_SENT" | "WON" | "LOST";

const STAGES: { key: LeadStage; label: string; color: string; bg: string; border: string; icon: string }[] = [
  { key: "NEW", label: "Yeni Talep / Lead", color: "text-zinc-900", bg: "bg-zinc-50", border: "border-zinc-200", icon: "inbox" },
  { key: "IN_DISCUSSION", label: "Görüşmede", color: "text-zinc-900", bg: "bg-zinc-50", border: "border-zinc-200", icon: "call" },
  { key: "QUOTATION_SENT", label: "Teklif Gönderildi", color: "text-zinc-900", bg: "bg-zinc-50", border: "border-zinc-200", icon: "request_quote" },
  { key: "WON", label: "Satış Kazanıldı (WON)", color: "text-zinc-900", bg: "bg-zinc-50", border: "border-zinc-200", icon: "task_alt" },
  { key: "LOST", label: "Kaybedildi (LOST)", color: "text-zinc-400", bg: "bg-zinc-50", border: "border-zinc-200", icon: "cancel" },
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

  if (loading) return <div className="p-8 max-w-7xl mx-auto min-h-screen bg-white text-zinc-500 text-xs">CRM Komuta Merkezi yükleniyor...</div>;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto min-h-screen bg-white text-zinc-900">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">SATIS & CRM</span>
          <h1 className="text-2xl font-light tracking-tight text-zinc-900 mt-1">CRM Komuta Merkezi</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Tüm müşteri adaylarını ve satış fırsatlarını Kanban panosunda yönetin.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-4 py-2 rounded text-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            Yeni Fırsat Ekle
          </button>
        </div>
      </div>

      {/* Top KPI Metrics Bar - Swiss Minimalist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Toplam Fırsat Hacmi", value: `$${totalPipelineValue.toLocaleString()}`, badge: "PIPELINE" },
          { label: "Kazanım Oranı (Win Rate)", value: `%${winRate}`, badge: "DONUSUM" },
          { label: "Aktif Görüşmedeki Fırsatlar", value: `${activeLeadsCount} Müşteri`, badge: "IN PROGRESS" },
          { label: "Toplam CRM Müşterisi", value: `${leads.length} Kayıt`, badge: "TOPLAM" },
        ].map((kpi) => (
          <div key={kpi.label} className="p-5 rounded border border-zinc-200 bg-zinc-50/50 flex flex-col justify-between">
            <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase mb-3">{kpi.badge}</span>
            <div>
              <p className="text-xs text-zinc-500 font-medium">{kpi.label}</p>
              <p className="text-2xl font-light text-zinc-900 tracking-tight mt-1">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls & View Switcher */}
      <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
              viewMode === "kanban"
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900"
            }`}
          >
            Kanban Görünümü
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
              viewMode === "table"
                ? "bg-zinc-900 text-white border-zinc-900"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900"
            }`}
          >
            Tablo Görünümü
          </button>
        </div>

        <span className="text-[11px] text-zinc-400 font-mono">Son Güncelleme: Canlı Senkronize</span>
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
                className="bg-zinc-50 border border-zinc-200 rounded p-4 flex flex-col min-h-[500px]"
              >
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 mb-3">
                  <div>
                    <h3 className="text-xs font-semibold text-zinc-900">{stg.label}</h3>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">${stageTotal.toLocaleString()}</p>
                  </div>
                  <span className="text-xs font-bold bg-white text-zinc-700 px-2 py-0.5 rounded border border-zinc-200">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {stageLeads.length === 0 ? (
                    <div className="py-12 text-center text-[11px] text-zinc-400 italic">
                      Bu aşamada müşteri yok.
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="p-3.5 bg-white border border-zinc-200 hover:border-zinc-900 rounded shadow-2xs cursor-pointer transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <p className="text-xs font-semibold text-zinc-900">{lead.name}</p>
                          <span className="text-xs font-mono font-bold text-zinc-900">${lead.valueUSD || 0}</span>
                        </div>

                        <p className="text-[11px] text-zinc-500 font-mono">{lead.phone}</p>

                        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-[10px] text-zinc-400">
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
        <div className="border border-zinc-200 rounded overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold text-[10px]">
              <tr>
                <th className="px-4 py-3">Müşteri</th>
                <th className="px-4 py-3">Telefon</th>
                <th className="px-4 py-3">Paket</th>
                <th className="px-4 py-3">Tutar</th>
                <th className="px-4 py-3">Aşama</th>
                <th className="px-4 py-3 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {leads.map((l) => (
                <tr key={l.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-zinc-900">{l.name}</td>
                  <td className="px-4 py-3 text-zinc-500 font-mono">{l.phone}</td>
                  <td className="px-4 py-3 text-zinc-600">{l.preferredPackage || "-"}</td>
                  <td className="px-4 py-3 font-mono font-bold text-zinc-900">${l.valueUSD || 0}</td>
                  <td className="px-4 py-3">
                    <select
                      value={l.stage || "NEW"}
                      onChange={(e) => handleStageChange(l.id, e.target.value as LeadStage)}
                      className="bg-white border border-zinc-200 text-xs text-zinc-800 rounded px-2 py-1 focus:outline-none"
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
                      className="px-2.5 py-1 bg-zinc-900 text-white text-[11px] font-medium rounded hover:bg-zinc-800 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-zinc-200 rounded max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">{selectedLead.name}</h3>
                <p className="text-xs text-zinc-500 font-mono">{selectedLead.phone}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-zinc-400 hover:text-zinc-900">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-700">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Aşama</label>
                <select
                  value={selectedLead.stage || "NEW"}
                  onChange={(e) => handleStageChange(selectedLead.id, e.target.value as LeadStage)}
                  className="w-full bg-white border border-zinc-200 text-xs text-zinc-800 rounded p-2 focus:outline-none"
                >
                  {STAGES.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Fırsat Değeri ($)</label>
                <input
                  type="number"
                  defaultValue={selectedLead.valueUSD || 0}
                  onBlur={(e) => handleUpdateValue(selectedLead.id, e.target.value)}
                  className="w-full bg-white border border-zinc-200 text-xs text-zinc-800 rounded p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Not Ekle</label>
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Görüşme notu yazın..."
                  className="w-full bg-white border border-zinc-200 text-xs text-zinc-800 rounded p-2 focus:outline-none"
                />
                <button
                  onClick={handleAddActivityNote}
                  disabled={savingNote}
                  className="mt-2 w-full py-1.5 bg-zinc-900 text-white rounded text-xs font-medium hover:bg-zinc-800 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form onSubmit={handleCreateLead} className="bg-white border border-zinc-200 rounded max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <h3 className="text-sm font-bold text-zinc-900">Yeni Fırsat / Müşteri Adayı</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-zinc-900">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Telefon</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Fiyat ($)</label>
                <input
                  type="number"
                  value={newLeadForm.valueUSD}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, valueUSD: e.target.value })}
                  className="w-full bg-white border border-zinc-200 rounded p-2 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="w-full py-2 bg-zinc-900 text-white rounded text-xs font-medium hover:bg-zinc-800 transition-colors">
                Fırsatı Oluştur
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
