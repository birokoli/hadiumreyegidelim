"use client";

import { useEffect, useState } from "react";
import { DEFAULT_WHATSAPP_AI_CONFIG, type WhatsAppAIConfig } from "@/lib/whatsapp-ai";

type DashboardData = {
  config: WhatsAppAIConfig;
  stats: { conversations: number; totalMessages: number; aiMessages: number; handoffCount: number };
  connection: { gemini: boolean; githubModels: boolean; whatsapp: boolean; model: string; bot: { status: string; qr: string | null; phone: string | null; error: string | null } };
  conversations: Array<{ id: string; phone: string; name: string | null; status: string; leadType: string | null; leadScore: number; lastMessageAt: string; messages: Array<{ id: string; content: string; direction: string; source: string; createdAt: string }> }>;
};

const input = "w-full rounded border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 outline-none focus:border-zinc-900";

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

  if (!data) return <div className="p-8 max-w-7xl mx-auto min-h-screen bg-white text-zinc-500 text-xs">WhatsApp AI merkezi yükleniyor...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-white text-zinc-900 text-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">SATIS VE OTOMASYON</span>
          <h1 className="text-2xl font-light tracking-tight text-zinc-900 mt-1">WhatsApp AI Merkezi</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Umre satış asistanını ve WhatsApp konuşma akışını yönetin.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-zinc-100 text-zinc-700 text-[10px] font-bold px-2 py-0.5 rounded border border-zinc-200">
            Gemini {data.connection.gemini ? "Aktif" : "Pasif"}
          </span>
          <span className="bg-zinc-100 text-zinc-700 text-[10px] font-bold px-2 py-0.5 rounded border border-zinc-200">
            WhatsApp {data.connection.whatsapp ? "Bağlı" : "Bekliyor"}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3 overflow-x-auto">
        {[["overview","Genel Bakış"],["connection","QR Bağlantısı"],["knowledge","Bilgi Tabanı"],["training","AI Eğitim"],["test","Yanıt Testi"]].map(([id,label]) => (
          <button
            key={id}
            onClick={() => setTab(id as typeof tab)}
            className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
              tab === id
                ? "bg-zinc-900 text-white border-zinc-900 font-semibold"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="border border-zinc-200 rounded p-6 bg-white space-y-4">
        {tab === "overview" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50">
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Toplam Konuşma</p>
                <p className="text-xl font-light text-zinc-900 mt-1">{data.stats.conversations}</p>
              </div>

              <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50">
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Toplam Mesaj</p>
                <p className="text-xl font-light text-zinc-900 mt-1">{data.stats.totalMessages}</p>
              </div>

              <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50">
                <p className="text-[10px] text-zinc-400 font-bold uppercase">AI Yanıtı</p>
                <p className="text-xl font-light text-zinc-900 mt-1">{data.stats.aiMessages}</p>
              </div>

              <div className="p-4 rounded border border-zinc-200 bg-zinc-50/50">
                <p className="text-[10px] text-zinc-400 font-bold uppercase">Canlı Destek Yönlendirme</p>
                <p className="text-xl font-light text-zinc-900 mt-1">{data.stats.handoffCount}</p>
              </div>
            </div>

            <div className="border border-zinc-200 rounded overflow-hidden mt-6">
              <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200 font-semibold text-xs text-zinc-900">
                CANLI WHATSAPP LOGLARI
              </div>
              <div className="divide-y divide-zinc-100">
                {data.conversations.map((c) => (
                  <div key={c.id} className="p-4 hover:bg-zinc-50 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-zinc-900">{c.name || c.phone}</p>
                      <p className="text-zinc-500 text-[11px] mt-0.5">{c.messages.at(-1)?.content || "Mesaj yok"}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50 text-zinc-700">
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
