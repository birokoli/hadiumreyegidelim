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
        setAudit(data.audits[0]);
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

  const schemaStatus = audit?.schemaStatus ? JSON.parse(audit.schemaStatus) : null;
  const llmAnalysis = audit?.llmAnalysis ? JSON.parse(audit.llmAnalysis) : null;
  const citationDetails = audit?.citationDetails ? JSON.parse(audit.citationDetails) : [];
  const recommendations = audit?.recommendations ? JSON.parse(audit.recommendations) : [];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-surface text-on-surface text-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/15">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">GEO & LLM SEO</span>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-1">AI Görünürlük & LLM SEO Analizör</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Sitenizin ChatGPT, Perplexity ve Claude arama motorlarındaki görünürlüğünü analiz edin.</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="bg-surface-container-lowest text-on-surface text-xs font-bold rounded-xl border border-outline-variant/25 px-3 py-2 outline-none focus:border-primary/40"
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
            className="bg-primary hover:bg-primary-container text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all active:scale-95 shrink-0 disabled:opacity-60"
          >
            {loading ? "Taranıyor..." : "AI Taraması Başlat"}
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest flex flex-col justify-between">
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Skor</span>
          <div>
            <p className="text-xs text-on-surface-variant font-medium">Genel GEO Skoru</p>
            <p className="font-headline text-2xl font-bold text-primary mt-0.5">%{audit?.geoScore || 59}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest flex flex-col justify-between">
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Yapısal Veri</span>
          <div>
            <p className="text-xs text-on-surface-variant font-medium">Schema.org Yapısal Veri</p>
            <p className="font-headline text-2xl font-bold text-primary mt-0.5">%{audit?.schemaScore || 60}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest flex flex-col justify-between">
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Okunabilirlik</span>
          <div>
            <p className="text-xs text-on-surface-variant font-medium">LLM Okunabilirlik</p>
            <p className="font-headline text-2xl font-bold text-primary mt-0.5">%{audit?.llmReadabilityScore || 52}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest flex flex-col justify-between">
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Alıntı</span>
          <div>
            <p className="text-xs text-on-surface-variant font-medium">AI Atıf Oranı</p>
            <p className="font-headline text-2xl font-bold text-primary mt-0.5">%{audit?.citationScore || 65}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/15 pb-3 overflow-x-auto">
        {(["overview", "schema", "markdown", "citations", "recommendations"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 ${
              activeTab === t
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/25 hover:border-primary/40"
            }`}
          >
            {t === "overview" && "Genel Bakış"}
            {t === "schema" && "Schema.org Yapısı"}
            {t === "markdown" && "LLM Markdown"}
            {t === "citations" && "AI Arama Testleri"}
            {t === "recommendations" && "Geliştirme Önerileri"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="border border-outline-variant/15 rounded-2xl p-6 bg-surface-container-lowest space-y-4">
        {recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((rec: any, index: number) => (
              <div key={index} className="p-3 border border-outline-variant/15 rounded-xl bg-surface-container-low flex items-start gap-3">
                <span className="bg-primary text-white text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0">
                  {rec.priority || "ÖNERİ"}
                </span>
                <div>
                  <p className="font-bold text-on-surface">{rec.title || rec.type}</p>
                  <p className="text-on-surface-variant text-[11px] mt-0.5">{rec.description || rec.text}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-outline text-xs">
            Mevcut FAQPage şemasına "Bireysel Umre nedir?", "Vize süreci nasıl işler?" gibi eklemeler yaparak AI atıf oranını artırabilirsiniz.
          </div>
        )}
      </div>
    </div>
  );
}
