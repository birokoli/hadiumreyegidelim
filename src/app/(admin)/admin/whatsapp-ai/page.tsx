"use client";

import { useEffect, useState } from "react";
import { DEFAULT_WHATSAPP_AI_CONFIG, type WhatsAppAIConfig } from "@/lib/whatsapp-ai";

type DashboardData = {
  config: WhatsAppAIConfig;
  stats: { conversations: number; totalMessages: number; aiMessages: number; handoffCount: number };
  connection: { gemini: boolean; githubModels: boolean; whatsapp: boolean; model: string; bot: { status: string; qr: string | null; phone: string | null; error: string | null } };
  conversations: Array<{ id: string; phone: string; name: string | null; status: string; leadType: string | null; leadScore: number; lastMessageAt: string; messages: Array<{ id: string; content: string; direction: string; source: string; createdAt: string }> }>;
};

const input = "w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-xs text-on-surface outline-none focus:border-primary/40";

export default function WhatsAppAIPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [config, setConfig] = useState(DEFAULT_WHATSAPP_AI_CONFIG);
  const [tab, setTab] = useState<"overview" | "connection" | "knowledge" | "training" | "test" | "ollama">("overview");
  const [testMessage, setTestMessage] = useState("Eşimle birlikte bireysel umreye gitmek istiyoruz, grup umresinden farkı nedir?");
  const [testWarning, setTestWarning] = useState("");
  const [testHistory, setTestHistory] = useState<Array<{ direction: "INBOUND" | "OUTBOUND"; content: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const load = async () => {
    const response = await fetch("/api/admin/whatsapp-ai", { cache: "no-store" });
    const json = await response.json();
    if (response.ok) { setData(json); setConfig(json.config); }
  };

  useEffect(() => {
    fetch("/api/admin/whatsapp-ai", { cache: "no-store" })
      .then((response) => response.json().then((json) => ({ response, json })))
      .then(({ response, json }) => {
        if (response.ok) { setData(json); setConfig(json.config); }
      });
  }, []);

  if (!data) return <div className="p-8 max-w-7xl mx-auto min-h-screen bg-surface text-on-surface-variant text-xs">WhatsApp AI merkezi yükleniyor...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-surface text-on-surface text-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/15">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">Satış ve Otomasyon</span>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-1">WhatsApp AI Merkezi</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Umre satış asistanını ve WhatsApp konuşma akışını yönetin.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${data.connection.gemini ? "bg-secondary/10 text-secondary border-secondary/25" : "bg-surface-container-low text-outline border-outline-variant/20"}`}>
            Gemini {data.connection.gemini ? "Aktif" : "Pasif"}
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${data.connection.whatsapp ? "bg-[#25D366]/10 text-[#1a9c4d] border-[#25D366]/25" : "bg-surface-container-low text-outline border-outline-variant/20"}`}>
            WhatsApp {data.connection.whatsapp ? "Bağlı" : "Bekliyor"}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/15 pb-3 overflow-x-auto">
        {[["overview","Genel Bakış"],["connection","QR Bağlantısı"],["knowledge","Bilgi Tabanı"],["training","AI Eğitim"],["test","Yanıt Testi"]].map(([id,label]) => (
          <button
            key={id}
            onClick={() => setTab(id as typeof tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 ${
              tab === id
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/25 hover:border-primary/40"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="border border-outline-variant/15 rounded-2xl p-6 bg-surface-container-lowest space-y-4">
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-outline-variant/15 bg-surface-container-low">
                <p className="text-[10px] text-outline font-bold uppercase">Toplam Konuşma</p>
                <p className="font-headline text-xl font-bold text-primary mt-1">{data.stats.conversations}</p>
              </div>

              <div className="p-4 rounded-xl border border-outline-variant/15 bg-surface-container-low">
                <p className="text-[10px] text-outline font-bold uppercase">Toplam Mesaj</p>
                <p className="font-headline text-xl font-bold text-primary mt-1">{data.stats.totalMessages}</p>
              </div>

              <div className="p-4 rounded-xl border border-outline-variant/15 bg-surface-container-low">
                <p className="text-[10px] text-outline font-bold uppercase">AI Yanıtı</p>
                <p className="font-headline text-xl font-bold text-primary mt-1">{data.stats.aiMessages}</p>
              </div>

              <div className="p-4 rounded-xl border border-outline-variant/15 bg-surface-container-low">
                <p className="text-[10px] text-outline font-bold uppercase">Canlı Destek Yönlendirme</p>
                <p className="font-headline text-xl font-bold text-primary mt-1">{data.stats.handoffCount}</p>
              </div>
            </div>

            <div className="border border-outline-variant/15 rounded-2xl overflow-hidden mt-6">
              <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant/15 font-bold text-xs text-on-surface uppercase tracking-wider">
                Canlı WhatsApp Logları
              </div>
              <div className="divide-y divide-outline-variant/10">
                {data.conversations.map((c) => (
                  <div key={c.id} className="p-4 hover:bg-primary/[0.03] flex items-center justify-between transition-colors">
                    <div>
                      <p className="font-bold text-on-surface">{c.name || c.phone}</p>
                      <p className="text-on-surface-variant text-[11px] mt-0.5">{c.messages.at(-1)?.content || "Mesaj yok"}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-primary/20 bg-primary/[0.06] text-primary">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
