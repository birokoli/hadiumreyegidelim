"use client";

import React, { useEffect, useState } from "react";

export default function AiVisibilityPage() {
  const [targetUrl, setTargetUrl] = useState("/");
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "schema" | "markdown" | "citations" | "recommendations">("overview");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/admin/ai-visibility");
      const data = await res.json();
      if (data.audits && data.audits.length > 0) {
        setHistory(data.audits);
        setAudit(data.audits[0]); // Load latest audit
      }
    } catch (e) {
      console.error("Fetch history error:", e);
    }
  };

  const handleRunAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ai-visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });
      const data = await res.json();
      if (data.success && data.audit) {
        setAudit(data.audit);
        setHistory((prev) => [data.audit, ...prev]);
      } else if (data.error) {
        alert(`Hata: ${data.error}`);
      }
    } catch (e: any) {
      alert(`Tarama başlatılamadı: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper parsers
  const schemaStatus = audit?.schemaStatus ? JSON.parse(audit.schemaStatus) : null;
  const llmAnalysis = audit?.llmAnalysis ? JSON.parse(audit.llmAnalysis) : null;
  const citationDetails = audit?.citationDetails ? JSON.parse(audit.citationDetails) : [];
  const recommendations = audit?.recommendations ? JSON.parse(audit.recommendations) : [];

  return (
    <div className="p-8 space-y-8 max-w-screen-2xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-[#003781] via-[#002f6c] to-[#236B40] text-white p-8 rounded-3xl shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-mono font-bold tracking-widest text-emerald-300 border border-white/10 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            GEO & AI Visibility Studio (Open Source Powered)
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">AI Görünürlük & LLM SEO Analizör</h1>
          <p className="text-white/80 text-sm max-w-2xl">
            Sitenizin ChatGPT, Perplexity, Google Gemini ve Claude gibi yapay zeka arama motorları tarafından ne kadar görünür ve doğru indekslendiğini analiz edin.
          </p>
        </div>

        {/* Action Input */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/10 p-2 rounded-2xl backdrop-blur-lg border border-white/20">
          <select
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="bg-white text-slate-800 text-sm font-semibold rounded-xl px-4 py-3 outline-none w-full sm:w-60 shadow-inner"
          >
            <option value="/">Ana Sayfa (/)</option>
            <option value="/bireysel-umre">Bireysel Umre (/bireysel-umre)</option>
            <option value="/paketler">Umre Paketleri (/paketler)</option>
            <option value="/umre-vizesi">Umre Vizesi (/umre-vizesi)</option>
            <option value="/blog">Manevi Blog (/blog)</option>
          </select>
          <button
            onClick={handleRunAudit}
            disabled={loading}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
          >
            {loading ? (
              <>
                <span className="animate-spin material-symbols-outlined text-[20px]">refresh</span>
                Taranıyor...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">search_hands_free</span>
                AI Taraması Başlat
              </>
            )}
          </button>
        </div>
      </div>

      {/* Powered by Open-Source GitHub Repos Badge */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <span className="material-symbols-outlined text-primary text-2xl">schema</span>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-white">schemaorg/schemaorg</p>
            <p className="text-[11px] text-slate-500">JSON-LD Yapısal Veri</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <span className="material-symbols-outlined text-amber-500 text-2xl">local_fire_department</span>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-white">firecrawl/firecrawl</p>
            <p className="text-[11px] text-slate-500">LLM Markdown Scraper</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <span className="material-symbols-outlined text-emerald-500 text-2xl">bug_report</span>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-white">unclecode/crawl4AI</p>
            <p className="text-[11px] text-slate-500">Gürültü & Token Yoğunluğu</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <span className="material-symbols-outlined text-indigo-500 text-2xl">smart_toy</span>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-white">browser-use/browser-use</p>
            <p className="text-[11px] text-slate-500">AI Atıf & Arama Simülasyonu</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-sm col-span-2 md:col-span-1">
          <span className="material-symbols-outlined text-purple-500 text-2xl">account_tree</span>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-white">langchain-ai/langgraph</p>
            <p className="text-[11px] text-slate-500">GEO İş Akışı & Öneriler</p>
          </div>
        </div>
      </div>

      {audit && (
        <>
          {/* Main KPI Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Overall GEO Score */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Genel GEO Skoru</span>
                <span className="material-symbols-outlined text-emerald-500 text-2xl">auto_awesome</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900 dark:text-white">%{audit.geoScore}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${audit.geoScore >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  {audit.geoScore >= 80 ? "Mükemmel" : "Geliştirilmeli"}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${audit.geoScore}%` }}></div>
              </div>
            </div>

            {/* Schema.org Score */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Schema.org Yapısal Veri</span>
                <span className="material-symbols-outlined text-primary text-2xl">schema</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900 dark:text-white">%{audit.schemaScore}</span>
                <span className="text-xs text-slate-500">{schemaStatus?.foundCount || 0} Şema Aktif</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${audit.schemaScore}%` }}></div>
              </div>
            </div>

            {/* LLM Readability */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">LLM Okunabilirlik</span>
                <span className="material-symbols-outlined text-amber-500 text-2xl">description</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900 dark:text-white">%{audit.readabilityScore}</span>
                <span className="text-xs text-slate-500">~{llmAnalysis?.tokenEstimate || 0} Token</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: `${audit.readabilityScore}%` }}></div>
              </div>
            </div>

            {/* AI Citation Rate */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Atıf (Citation) Oranı</span>
                <span className="material-symbols-outlined text-indigo-500 text-2xl">format_quote</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-slate-900 dark:text-white">%{audit.citationRate}</span>
                <span className="text-xs text-slate-500">{citationDetails.length} Sorgu Test Edildi</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${audit.citationRate}%` }}></div>
              </div>
            </div>
          </div>

          {/* Tab Controls */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === "overview" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              Genel Bakış & Öneriler (LangGraph)
            </button>
            <button
              onClick={() => setActiveTab("schema")}
              className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === "schema" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              Schema.org Yapısı ({schemaStatus?.foundCount || 0})
            </button>
            <button
              onClick={() => setActiveTab("markdown")}
              className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === "markdown" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              LLM Markdown Görünümü (Firecrawl)
            </button>
            <button
              onClick={() => setActiveTab("citations")}
              className={`pb-4 text-sm font-bold transition-colors border-b-2 ${activeTab === "citations" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              AI Ajan Arama Testleri (Browser-Use)
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-500">task_alt</span>
                Önceliklendirilmiş GEO İyileştirme Aksiyonları
              </h3>
              <div className="space-y-4">
                {recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${rec.priority === "HIGH" ? "bg-red-100 text-red-700" : rec.priority === "MEDIUM" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                      {rec.priority === "HIGH" ? "YÜKSEK ÖNCELİK" : rec.priority === "MEDIUM" ? "ORTA ÖNCELİK" : "DÜŞÜK ÖNCELİK"}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{rec.category}</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{rec.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "schema" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Schema.org JSON-LD Doğrulama Listesi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schemaStatus?.checks?.map((c: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">{c.label}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${c.pass ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                      <span className="material-symbols-outlined text-[16px]">{c.pass ? "check_circle" : "cancel"}</span>
                      {c.pass ? "Mevcut" : "Eksik"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "markdown" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">LLM Tarafından Okunan Temiz İçerik (Markdown)</h3>
                <span className="text-xs text-slate-500 font-mono">Token: ~{llmAnalysis?.tokenEstimate || 0}</span>
              </div>
              <pre className="bg-slate-950 text-slate-200 p-6 rounded-2xl overflow-x-auto text-xs font-mono leading-relaxed max-h-[500px]">
                {audit.markdownContent}
              </pre>
            </div>
          )}

          {activeTab === "citations" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Arama Motorlarında Marka Atıf (Citation) Testi</h3>
              <div className="space-y-4">
                {citationDetails.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-2 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-800 dark:text-white">🔍 Sorgu: "{item.query}"</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${item.cited ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        <span className="material-symbols-outlined text-[16px]">{item.cited ? "verified" : "help"}</span>
                        {item.cited ? "Atıf Alındı" : "Atıf Yok / Zayıf"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                      "{item.snippet}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-md font-bold text-slate-900 dark:text-white">Geçmiş AI Taramaları</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {history.map((h: any) => (
              <div
                key={h.id}
                onClick={() => setAudit(h)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${audit?.id === h.id ? "bg-primary/5 border-primary shadow-md" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold truncate max-w-[180px]">{h.url}</span>
                  <span className="text-xs font-extrabold text-emerald-600">%{h.geoScore} GEO</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {new Date(h.createdAt).toLocaleString("tr-TR")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
