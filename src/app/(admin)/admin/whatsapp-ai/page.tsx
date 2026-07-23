"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { DEFAULT_WHATSAPP_AI_CONFIG, type WhatsAppAIConfig } from "@/lib/whatsapp-ai";

type DashboardData = {
  config: WhatsAppAIConfig;
  stats: { conversations: number; totalMessages: number; aiMessages: number; handoffCount: number };
  connection: { gemini: boolean; githubModels: boolean; whatsapp: boolean; model: string; bot: { status: string; qr: string | null; phone: string | null; error: string | null } };
  conversations: Array<{ id: string; phone: string; name: string | null; status: string; leadType: string | null; leadScore: number; lastMessageAt: string; messages: Array<{ id: string; content: string; direction: string; source: string; createdAt: string }> }>;
};

const input = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#003781] focus:ring-2 focus:ring-[#003781]/10";

export default function WhatsAppAIPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [config, setConfig] = useState(DEFAULT_WHATSAPP_AI_CONFIG);
  const [tab, setTab] = useState<"overview" | "connection" | "knowledge" | "test">("overview");
  const [testMessage, setTestMessage] = useState("Eşimle birlikte bireysel umreye gitmek istiyoruz, grup umresinden farkı nedir?");
  const [testWarning, setTestWarning] = useState("");
  const [testProvider, setTestProvider] = useState("");
  const [testHistory, setTestHistory] = useState<Array<{ direction: "INBOUND" | "OUTBOUND"; content: string }>>([]);
  const [conversationFilter, setConversationFilter] = useState<"all" | "answered" | "unanswered" | "handoff">("all");
  const [openConversation, setOpenConversation] = useState<string | null>(null);
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

  useEffect(() => {
    if (tab !== "connection") return;
    const refreshQr = () => {
      fetch("/api/admin/whatsapp-ai", { cache: "no-store" })
        .then((response) => response.json().then((json) => ({ response, json })))
        .then(({ response, json }) => {
          if (response.ok) setData(json);
        });
    };
    refreshQr();
    const interval = window.setInterval(refreshQr, 8_000);
    return () => window.clearInterval(interval);
  }, [tab]);

  const save = async () => {
    setBusy(true); setNotice("");
    const response = await fetch("/api/admin/whatsapp-ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(config) });
    const json = await response.json();
    setNotice(response.ok ? "Ayarlar kaydedildi." : json.error || "Kaydedilemedi.");
    setBusy(false); if (response.ok) load();
  };

  const test = async () => {
    setBusy(true); setTestWarning(""); setTestProvider("");
    const response = await fetch("/api/admin/whatsapp-ai/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: testMessage, history: testHistory }) });
    const json = await response.json();
    if (response.ok) setTestHistory((current) => [...current, { direction: "INBOUND", content: testMessage }, { direction: "OUTBOUND", content: json.reply }].slice(-10));
    else setTestWarning(json.error || "Test başarısız");
    if (response.ok && json.warning) setTestWarning(json.warning);
    if (response.ok && json.provider) setTestProvider(json.provider);
    setBusy(false);
  };

  if (!data) return <div className="p-8 text-slate-500">WhatsApp AI merkezi yükleniyor...</div>;
  const conversationState = (conversation: DashboardData["conversations"][number]) => {
    if (conversation.status === "HUMAN_NEEDED") return "handoff";
    return conversation.messages.at(-1)?.direction === "INBOUND" ? "unanswered" : "answered";
  };
  const filteredConversations = data.conversations.filter((conversation) => conversationFilter === "all" || conversationState(conversation) === conversationFilter);
  const answerCounts = data.conversations.reduce((counts, conversation) => {
    counts[conversationState(conversation)] += 1;
    return counts;
  }, { answered: 0, unanswered: 0, handoff: 0 });

  return <div className="mx-auto max-w-7xl space-y-6 p-5 md:p-8">
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-600">Satış & Müşteri Hizmetleri</p><h1 className="mt-2 text-2xl font-bold text-slate-900">WhatsApp AI Merkezi</h1><p className="mt-1 text-sm text-slate-500">Umre satış asistanını, konuşmaları ve bilgi tabanını Türkçe olarak yönetin.</p></div>
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${data.connection.githubModels ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>GitHub Modelleri {data.connection.githubModels ? "Bağlı" : "Hazır Değil"}</span>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${data.connection.gemini ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>Gemini {data.connection.gemini ? "Bağlı" : "Eksik"}</span>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${data.connection.whatsapp ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>WhatsApp {data.connection.whatsapp ? "Bağlı" : "Kurulum Bekliyor"}</span>
      </div>
    </div>

    <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2">
      {[["overview","Genel Bakış"],["connection","QR Bağlantısı"],["knowledge","Asistan & Bilgi Tabanı"],["test","Yanıt Testi"]].map(([id,label]) => <button key={id} onClick={() => setTab(id as typeof tab)} className={`rounded-xl px-5 py-3 text-sm font-bold ${tab === id ? "bg-[#003781] text-white" : "text-slate-500 hover:bg-slate-50"}`}>{label}</button>)}
    </div>

    {tab === "overview" && <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[["Konuşma",data.stats.conversations,"forum"],["Toplam Mesaj",data.stats.totalMessages,"chat"],["AI Yanıtı",data.stats.aiMessages,"smart_toy"],["Temsilci Bekleyen",data.stats.handoffCount,"support_agent"]].map(([label,value,icon]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="material-symbols-outlined text-[#003781]">{icon}</span><p className="mt-4 text-3xl font-bold text-slate-900">{value}</p><p className="text-sm text-slate-500">{label}</p></div>)}
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5"><h2 className="font-bold text-slate-900">Müşteri Mesajları ve AI Yanıtları</h2><p className="mt-1 text-sm text-slate-500">Gelen mesajları, AI cevaplarını ve temsilci bekleyen konuşmaları buradan takip edin.</p><div className="mt-4 flex flex-wrap gap-2">{[
          ["all", `Tümü (${data.conversations.length})`],
          ["answered", `AI Yanıtladı (${answerCounts.answered})`],
          ["unanswered", `Yanıtlanmadı (${answerCounts.unanswered})`],
          ["handoff", `Temsilci Bekliyor (${answerCounts.handoff})`],
        ].map(([id, label]) => <button key={id} onClick={() => setConversationFilter(id as typeof conversationFilter)} className={`rounded-full px-3 py-2 text-xs font-bold ${conversationFilter === id ? "bg-[#003781] text-white" : "bg-slate-100 text-slate-600"}`}>{label}</button>)}</div></div>
        {data.conversations.length === 0 ? <div className="p-10 text-center text-sm text-slate-400">Henüz WhatsApp konuşması yok. QR bağlantısı tamamlandığında mesajlar burada görünecek.</div> :
          filteredConversations.length === 0 ? <div className="p-10 text-center text-sm text-slate-400">Bu durumda konuşma bulunmuyor.</div> :
          <div className="divide-y divide-slate-100">{filteredConversations.map((c) => {
            const state = conversationState(c);
            const stateLabel = state === "answered" ? "AI Yanıtladı" : state === "unanswered" ? "Yanıtlanmadı" : "Temsilci Bekliyor";
            const stateClass = state === "answered" ? "bg-emerald-50 text-emerald-700" : state === "unanswered" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700";
            return <div key={c.id} className="px-6 py-4"><button onClick={() => setOpenConversation(openConversation === c.id ? null : c.id)} className="grid w-full gap-3 text-left md:grid-cols-[1fr_2fr_auto] md:items-center"><div><p className="font-bold text-slate-800">{c.name || c.phone}</p><p className="text-xs text-slate-400">+{c.phone}</p></div><p className="truncate text-sm text-slate-500">{c.messages.at(-1)?.content}</p><div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${stateClass}`}>{stateLabel}</span><span className="text-xs font-bold text-slate-400">{c.leadType || "KARARSIZ"} · %{c.leadScore}</span></div></button>{openConversation === c.id ? <div className="mt-4 space-y-2 rounded-2xl bg-[#efeae2] p-4">{c.messages.map((message) => <div key={message.id} className={`flex ${message.direction === "INBOUND" ? "justify-start" : "justify-end"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${message.direction === "INBOUND" ? "rounded-tl-sm bg-white text-slate-700" : "rounded-tr-sm bg-[#d9fdd3] text-slate-800"}`}><p className="mb-1 text-[10px] font-bold uppercase text-slate-400">{message.direction === "INBOUND" ? "Müşteri" : message.source === "ai" ? "AI Yanıtı" : "Temsilci"}</p><p className="whitespace-pre-wrap">{message.content}</p></div></div>)}</div> : null}</div>;
          })}</div>}
      </section>
    </>}

    {tab === "connection" && <section className="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[1fr_1.2fr]">
      <div className="flex min-h-80 items-center justify-center rounded-2xl bg-slate-50 p-6">
        {data.connection.bot.qr ? <Image src={data.connection.bot.qr} alt="WhatsApp bağlantı QR kodu" width={320} height={320} unoptimized className="w-full max-w-72 rounded-xl bg-white p-3 shadow-md" /> :
          <div className="text-center"><span className={`material-symbols-outlined text-6xl ${data.connection.whatsapp ? "text-emerald-500" : "text-slate-300"}`}>{data.connection.whatsapp ? "check_circle" : "qr_code_2"}</span><p className="mt-3 font-bold text-slate-700">{data.connection.whatsapp ? "WhatsApp bağlı" : "QR kod henüz hazır değil"}</p><p className="mt-1 text-sm text-slate-400">{data.connection.bot.status}</p></div>}
      </div>
      <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Bağlı Cihaz Yöntemi</p><h2 className="mt-2 text-xl font-bold text-slate-900">WhatsApp Business Numaranızı Bağlayın</h2><p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{data.connection.whatsapp ? "WhatsApp oturumu bağlı ve Mac’te güvenle saklanıyor. QR yenilenmez; yalnızca panel bağlantı durumunu 8 saniyede bir kontrol eder." : "Bu kod WhatsApp Web’in gerçek bağlantı kodudur. QR yalnızca bağlantı kurulana kadar yenilenir; mevcut telefon veya Safari oturumundan çıkış yapmayın."}</p><ol className="mt-5 space-y-4 text-sm leading-relaxed text-slate-600"><li><b>1.</b> Telefonda WhatsApp Business uygulamasını açın.</li><li><b>2.</b> Ayarlar → Bağlı Cihazlar → Cihaz Bağla bölümüne girin.</li><li><b>3.</b> Soldaki QR kodu telefonunuzla okutun.</li><li><b>4.</b> Durum “BAĞLI” olduğunda numaranız telefonda açık kalırken AI gelen mesajlara dönüş yapar.</li></ol><div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-800"><b>Servis durumu:</b> {data.connection.bot.status}{data.connection.bot.phone ? ` · +${data.connection.bot.phone}` : ""}{data.connection.bot.error ? <div className="mt-1 text-xs text-red-600">{data.connection.bot.error}</div> : null}</div><button onClick={load} className="mt-5 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-[#003781] hover:bg-slate-50">Durumu Yenile</button></div>
    </section>}

    {tab === "knowledge" && <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold text-slate-900">Otomatik Yanıt Durumu</h2><p className="text-sm text-slate-500">WhatsApp bağlantısı tamamlandıktan sonra müşterilere otomatik dönüşü buradan açın.</p></div><button onClick={() => setConfig({ ...config, enabled: !config.enabled })} className={`rounded-full px-5 py-2 text-sm font-bold ${config.enabled ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>{config.enabled ? "AI Aktif" : "AI Kapalı"}</button></div>
        <div className="grid gap-5 md:grid-cols-2"><label><span className="mb-1.5 block text-xs font-bold text-slate-500">ASİSTAN ADI</span><input className={input} value={config.assistantName} onChange={(e) => setConfig({ ...config, assistantName: e.target.value })}/></label><label><span className="mb-1.5 block text-xs font-bold text-slate-500">KARŞILAMA MESAJI</span><textarea rows={3} className={input} value={config.welcomeMessage} onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}/></label></div>
      </section>
      {[["Konuşma Üslubu","tone"],["Şirket ve Hizmet Bilgisi","companyKnowledge"],["Satış Kuralları","salesRules"]].map(([label,key]) => <section key={key} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="mb-1 font-bold text-slate-900">{label}</h2><p className="mb-4 text-sm text-slate-500">Asistan bu alanı bütün müşteri konuşmalarında talimat olarak kullanır.</p><textarea rows={7} className={input} value={config[key as keyof WhatsAppAIConfig] as string} onChange={(e) => setConfig({ ...config, [key]: e.target.value })}/></section>)}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold text-slate-900">İnsan Temsilciye Aktarma Kelimeleri</h2><p className="mb-4 text-sm text-slate-500">Virgülle ayırın. Bu ifadelerden biri geçerse konuşma temsilci bekliyor durumuna alınır.</p><input className={input} value={config.handoffKeywords.join(", ")} onChange={(e) => setConfig({ ...config, handoffKeywords: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })}/></section>
      <div className="sticky bottom-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur"><p className="text-sm font-bold text-emerald-600">{notice}</p><button disabled={busy} onClick={save} className="rounded-xl bg-[#003781] px-7 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "Kaydediliyor..." : "Ayarları Kaydet"}</button></div>
    </div>}

    {tab === "test" && <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-2">
      <div><div className="flex items-center justify-between"><h2 className="font-bold text-slate-900">Müşteri Mesajını Deneyin</h2><button onClick={() => { setTestHistory([]); setTestWarning(""); setTestProvider(""); }} className="text-xs font-bold text-red-600">Sohbeti Sıfırla</button></div><p className="mb-4 text-sm text-slate-500">Gerçek WhatsApp mesajı göndermeden bağlı AI modellerinin yanıtını ve konuşma sürekliliğini deneyin.</p><textarea rows={10} className={input} value={testMessage} onChange={(e) => setTestMessage(e.target.value)}/><button disabled={busy || !testMessage.trim()} onClick={test} className="mt-4 rounded-xl bg-[#25D366] px-7 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "Yanıt hazırlanıyor..." : "Yanıtı Test Et"}</button></div>
      <div className="rounded-2xl bg-[#efeae2] p-5"><div className="mb-3 flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Deneme Sohbeti</p>{testProvider ? <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-[#003781] shadow-sm">{testProvider}</span> : null}</div>{testWarning ? <div className="mb-3 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">{testWarning}</div> : null}<div className="max-h-96 space-y-2 overflow-y-auto">{testHistory.length ? testHistory.map((message, index) => <div key={`${index}-${message.direction}`} className={`flex ${message.direction === "INBOUND" ? "justify-end" : "justify-start"}`}><div className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${message.direction === "INBOUND" ? "rounded-tr-sm bg-[#d9fdd3]" : "rounded-tl-sm bg-white"}`}>{message.content}</div></div>) : <div className="min-h-40 rounded-2xl bg-white p-4 text-sm text-slate-400 shadow-sm">Test yanıtı burada görünecek.</div>}</div></div>
    </section>}
  </div>;
}
