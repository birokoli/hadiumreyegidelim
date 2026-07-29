"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

type LeadStage = "NEW" | "IN_DISCUSSION" | "QUOTATION_SENT" | "WON" | "LOST";

const STAGES: { key: LeadStage; label: string; color: string; bg: string; border: string; icon: string }[] = [
  { key: "NEW", label: "Yeni Talep / Lead", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50/80 dark:bg-slate-900", border: "border-blue-200 dark:border-blue-900/50", icon: "inbox" },
  { key: "IN_DISCUSSION", label: "Görüşmede", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50/80 dark:bg-slate-900", border: "border-amber-200 dark:border-amber-900/50", icon: "call" },
  { key: "QUOTATION_SENT", label: "Teklif Gönderildi", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50/80 dark:bg-slate-900", border: "border-purple-200 dark:border-purple-900/50", icon: "request_quote" },
  { key: "WON", label: "Satış Kazanıldı (WON)", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50/80 dark:bg-slate-900", border: "border-emerald-200 dark:border-emerald-900/50", icon: "task_alt" },
  { key: "LOST", label: "Kaybedildi (LOST)", color: "text-red-600 dark:text-red-400", bg: "bg-red-50/80 dark:bg-slate-900", border: "border-red-200 dark:border-red-900/50", icon: "cancel" },
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
        body: JSON.stringify({
          leadId: selectedLead.id,
          type: "NOTE",
          content: newNote,
          createdBy: "Yönetici",
        }),
      });
      const data = await res.json();
      if (data.success && data.activity) {
        const updatedActivities = [data.activity, ...(selectedLead.activities || [])];
        setSelectedLead({ ...selectedLead, activities: updatedActivities });
        setLeads((prev) =>
          prev.map((l) => (l.id === selectedLead.id ? { ...l, activities: updatedActivities } : l))
        );
        setNewNote("");
      }
    } catch (e) {
      console.error("Activity note error:", e);
    } finally {
      setSavingNote(false);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) {
      alert("Lütfen isim ve telefon bilgilerini girin.");
      return;
    }
    try {
      const res = await fetch("/api/admin/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeadForm),
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setLeads([data.lead, ...leads]);
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

  if (loading) return <div className="p-12 pt-28 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">CRM Komuta Merkezi Yükleniyor...</div>;

  return (
    <div className="p-6 md:p-8 pt-24 space-y-8 max-w-[1700px] mx-auto min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-primary to-slate-900 text-white p-8 rounded-3xl shadow-xl border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-mono font-bold tracking-widest text-emerald-300 border border-white/10 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            All-in-One CRM Command Center (Odoo & Twenty Powered)
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Müşteri İlişkileri & Satış Komuta Merkezi</h1>
          <p className="text-white/80 text-sm max-w-2xl">
            Tüm umre taleplerini, WhatsApp müşteri görüşmelerini ve fiyat tekliflerini tek bir interaktif Kanban panosunda yönetin.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-lg active:scale-95 flex items-center gap-2 text-sm"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Yeni Müşteri / Fırsat Ekle
          </button>
        </div>
      </div>

      {/* Top KPI Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary dark:text-sky-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-3xl">attach_money</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toplam Fırsat Hacmi</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">${totalPipelineValue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-3xl">trending_up</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Satış Kazanım Oranı (Win Rate)</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">%{winRate}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-3xl">forum</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aktif Görüşmedeki Fırsatlar</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">{activeLeadsCount} Müşteri</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-3xl">groups</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Toplam CRM Müşterisi</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">{leads.length} Kayıt</p>
          </div>
        </div>
      </div>

      {/* Controls & View Switcher */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("kanban")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              viewMode === "kanban" ? "bg-primary text-white shadow-md" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">view_kanban</span>
            Kanban Boru Hattı (Pipeline)
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              viewMode === "table" ? "bg-primary text-white shadow-md" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">table_rows</span>
            Tablo / Liste Görünümü
          </button>
        </div>
        <span className="text-xs font-mono text-slate-400">Son Güncelleme: Anlık Canlı Senkronizasyon</span>
      </div>

      {/* Kanban Board View */}
      {viewMode === "kanban" && (
        <div className="flex gap-5 overflow-x-auto pb-6 min-h-[600px] items-start">
          {STAGES.map((st) => {
            const stageLeads = leads.filter((l) => l.stage === st.key);
            const stageTotalVal = stageLeads.reduce((sum, l) => sum + (l.valueUSD || 0), 0);

            return (
              <div key={st.key} className="flex-1 min-w-[280px] max-w-[340px] shrink-0 space-y-4">
                {/* Stage Header */}
                <div className={`p-4 rounded-2xl border ${st.bg} ${st.border} flex justify-between items-center shadow-sm`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`material-symbols-outlined text-[20px] shrink-0 ${st.color}`}>{st.icon}</span>
                    <span className={`text-xs font-bold uppercase tracking-wider truncate ${st.color}`}>{st.label}</span>
                  </div>
                  <span className="text-xs font-extrabold px-2 py-0.5 bg-white dark:bg-slate-800 rounded-full text-slate-700 dark:text-slate-200 shrink-0">
                    {stageLeads.length}
                  </span>
                </div>

                <div className="text-right text-[11px] font-mono font-bold text-slate-400 px-1">
                  Toplam: ${stageTotalVal.toLocaleString()}
                </div>

                {/* Cards Container */}
                <div className="space-y-3 min-h-[400px]">
                  {stageLeads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-sky-500/50 p-5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all space-y-3 group"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-sky-400 transition-colors truncate">
                          {lead.name}
                        </h4>
                        <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md shrink-0">
                          ${lead.valueUSD}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{lead.preferredPackage || "Umre Talebi"}</p>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">call</span>
                          {lead.phone}
                        </span>
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#25D366] hover:underline font-bold flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">chat</span>
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  ))}

                  {stageLeads.length === 0 && (
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl h-32 flex items-center justify-center text-xs text-slate-400 font-medium">
                      Bu aşamada müşteri yok.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">Müşteri Adı</th>
                <th className="p-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">Telefon</th>
                <th className="p-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">Talep Edilen Paket</th>
                <th className="p-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">Aşama</th>
                <th className="p-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">Değer (USD)</th>
                <th className="p-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase text-right">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{lead.name}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-xs">{lead.phone}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 text-xs">{lead.preferredPackage || "Genel Umre"}</td>
                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {lead.stage}
                    </span>
                  </td>
                  <td className="p-4 font-extrabold text-emerald-600 dark:text-emerald-400">${lead.valueUSD}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLead(lead);
                      }}
                      className="bg-primary/10 text-primary dark:text-sky-400 px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all"
                    >
                      Customer 360
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer 360 Command Modal / Drawer (EspoCRM & SuiteCRM) */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-primary to-slate-900 text-white px-8 py-6 flex justify-between items-center border-b border-slate-800">
              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-300 font-mono font-bold">
                  CUSTOMER 360 COMMAND CENTER
                </span>
                <h3 className="text-2xl font-bold font-headline mt-1">{selectedLead.name}</h3>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto text-slate-900 dark:text-slate-100">
              {/* Customer Contact & Quick Actions */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-400 font-bold">Telefon</p>
                    <p className="font-bold text-slate-800 dark:text-white mt-0.5 font-mono">{selectedLead.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold">E-Posta</p>
                    <p className="font-bold text-slate-800 dark:text-white mt-0.5">{selectedLead.email || "Belirtilmedi"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold">Kaynak</p>
                    <p className="font-bold text-slate-800 dark:text-white mt-0.5">{selectedLead.source}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    WhatsApp 1-Tıkla Mesaj At
                  </a>
                  <Link
                    href={`/admin/fiyat-teklifleri/yeni?name=${encodeURIComponent(selectedLead.name)}&phone=${encodeURIComponent(selectedLead.phone)}`}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-[#002f6c] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">request_quote</span>
                    Fiyat Teklifi (Proforma) Hazırla
                  </Link>
                </div>
              </div>

              {/* Stage & Opportunity Value Manager */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
                  Fırsat Aşaması ve Değeri
                </h4>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((st) => (
                    <button
                      key={st.key}
                      onClick={() => handleStageChange(selectedLead.id, st.key)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        selectedLead.stage === st.key
                          ? "bg-primary text-white shadow-md ring-2 ring-primary/30"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Tahmini Fırsat Değeri ($ USD):</span>
                  <input
                    type="number"
                    value={selectedLead.valueUSD || 0}
                    onChange={(e) => handleUpdateValue(selectedLead.id, e.target.value)}
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-xl text-sm font-extrabold w-36 outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Activity Log & Quick Notes (Odoo & SuiteCRM style) */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary dark:text-sky-400">history</span> Aktivite Geçmişi & Çağrı Notları
                </h4>

                {/* Add note input */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Müşteriyle yapılan görüşme veya arama notu ekleyin..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    onClick={handleAddActivityNote}
                    disabled={savingNote}
                    className="bg-primary hover:bg-[#002f6c] text-white font-bold px-6 py-3 rounded-2xl text-xs transition-all shadow-md active:scale-95 shrink-0"
                  >
                    Notu Kaydet
                  </button>
                </div>

                {/* Activity Feed */}
                <div className="space-y-3">
                  {selectedLead.activities?.map((act: any) => (
                    <div key={act.id} className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex justify-between items-start text-xs">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{act.content}</p>
                        <p className="text-slate-400 mt-1">Ekleyen: {act.createdBy}</p>
                      </div>
                      <span className="font-mono text-slate-400 shrink-0">
                        {new Date(act.createdAt).toLocaleString("tr-TR")}
                      </span>
                    </div>
                  ))}
                  {(!selectedLead.activities || selectedLead.activities.length === 0) && (
                    <p className="text-xs text-slate-400 italic">Henüz özel aktivite notu girilmemiş.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 dark:bg-slate-800/80 px-8 py-4 flex justify-end">
              <button
                onClick={() => setSelectedLead(null)}
                className="bg-slate-900 dark:bg-slate-700 hover:bg-black text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800 space-y-6 text-slate-900 dark:text-slate-100">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Yeni Müşteri / Fırsat Ekle</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Müşteri Ad Soyad</label>
                <input
                  type="text"
                  required
                  placeholder="Ahmet Yılmaz"
                  value={newLeadForm.name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefon Numarası</label>
                <input
                  type="text"
                  required
                  placeholder="+905051234567"
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-Posta (İsteğe Bağlı)</label>
                <input
                  type="email"
                  placeholder="ahmet@example.com"
                  value={newLeadForm.email}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">İstenen Paket / Detay</label>
                <input
                  type="text"
                  placeholder="VIP Eylül Umresi (2 Kişilik)"
                  value={newLeadForm.preferredPackage}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, preferredPackage: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tahmini Fırsat Değeri ($ USD)</label>
                <input
                  type="number"
                  placeholder="1250"
                  value={newLeadForm.valueUSD}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, valueUSD: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary font-bold"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md"
                >
                  Fırsatı Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
