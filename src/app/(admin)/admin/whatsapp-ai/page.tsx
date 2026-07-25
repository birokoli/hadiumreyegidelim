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
  const [tab, setTab] = useState<"overview" | "connection" | "knowledge" | "training" | "test" | "ollama">("overview");
  const [testMessage, setTestMessage] = useState("Eşimle birlikte bireysel umreye gitmek istiyoruz, grup umresinden farkı nedir?");
  const [testWarning, setTestWarning] = useState("");
  const [testProvider, setTestProvider] = useState("");
  const [testHistory, setTestHistory] = useState<Array<{ direction: "INBOUND" | "OUTBOUND"; content: string }>>([]);
  const [ollamaMessage, setOllamaMessage] = useState("");
  const [ollamaError, setOllamaError] = useState("");
  const [ollamaProvider, setOllamaProvider] = useState("");
  const [ollamaHistory, setOllamaHistory] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [conversationFilter, setConversationFilter] = useState<"all" | "answered" | "unanswered" | "handoff">("all");
  const [openConversation, setOpenConversation] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [trainingQuestion, setTrainingQuestion] = useState("");
  const [trainingReply, setTrainingReply] = useState("");
  const [trainingCategory, setTrainingCategory] = useState("Satış");
  const [bulkTraining, setBulkTraining] = useState("");

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

  const cleanupSyntheticTests = async () => {
    setBusy(true); setNotice("");
    const response = await fetch("/api/admin/whatsapp-ai/cleanup-tests", { method: "POST" });
    const json = await response.json();
    setNotice(response.ok
      ? `${json.conversations} test konuşması ve ${json.messages} test mesajı temizlendi.`
      : json.error || "Test kayıtları temizlenemedi.");
    setBusy(false);
    if (response.ok) load();
  };

  const cleanupConversations = async (conversationId?: string) => {
    const warning = conversationId
      ? "Bu konuşma ve içindeki bütün mesajlar kalıcı olarak silinecek. Devam edilsin mi?"
      : "Paneldeki TÜM WhatsApp konuşmaları ve mesajları kalıcı olarak silinecek. Devam edilsin mi?";
    if (!window.confirm(warning)) return;
    setBusy(true); setNotice("");
    const response = await fetch("/api/admin/whatsapp-ai/conversations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(conversationId ? { conversationId } : { all: true }),
    });
    const json = await response.json();
    setNotice(response.ok
      ? `${json.conversations} konuşma ve ${json.messages} mesaj temizlendi.`
      : json.error || "Konuşmalar temizlenemedi.");
    setBusy(false);
    if (response.ok) {
      setOpenConversation(null);
      load();
    }
  };

  const teachAnswer = async (customerMessage: string, currentReply: string) => {
    const idealReply = window.prompt("Bu müşteriye verilmesi gereken doğru cevabı yazın:", currentReply)?.trim();
    if (!idealReply) return;
    setBusy(true); setNotice("");
    const response = await fetch("/api/admin/whatsapp-ai/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerMessage, idealReply, category: "Konuşmadan öğretildi" }),
    });
    const json = await response.json();
    setNotice(response.ok ? "Düzeltilen cevap eğitim havuzuna eklendi." : json.error || "Cevap öğretilemedi.");
    setBusy(false);
    if (response.ok) load();
  };

  const addTrainingExample = async () => {
    if (!trainingQuestion.trim() || !trainingReply.trim()) return;
    setBusy(true); setNotice("");
    const response = await fetch("/api/admin/whatsapp-ai/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerMessage: trainingQuestion, idealReply: trainingReply, category: trainingCategory }),
    });
    const json = await response.json();
    setNotice(response.ok ? "Yeni doğru cevap örneği kaydedildi." : json.error || "Örnek kaydedilemedi.");
    if (response.ok) { setTrainingQuestion(""); setTrainingReply(""); await load(); }
    setBusy(false);
  };

  const deleteTrainingExample = async (id: string) => {
    setBusy(true); setNotice("");
    const response = await fetch("/api/admin/whatsapp-ai/feedback", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const json = await response.json();
    setNotice(response.ok ? "Eğitim örneği kaldırıldı." : json.error || "Örnek kaldırılamadı.");
    if (response.ok) await load();
    setBusy(false);
  };

  const importBulkTraining = async () => {
    const normalized = bulkTraining.replace(/\r/g, "").trim();
    const matches = [...normalized.matchAll(/(?:^|\n)\s*(?:Müşteri|Musteri)\s*:\s*([\s\S]*?)\n\s*(?:Cevap|Yanıt|Yanit|Temsilci)\s*:\s*([\s\S]*?)(?=\n\s*(?:Müşteri|Musteri)\s*:|$)/gi)];
    const examples = matches.map((match) => ({
      customerMessage: match[1].trim(),
      idealReply: match[2].trim(),
      category: "Toplu eğitim",
    })).filter((item) => item.customerMessage && item.idealReply);
    if (!examples.length) {
      setNotice("Metinde “Müşteri:” ve “Cevap:” biçiminde eşleşen konuşma bulunamadı.");
      return;
    }
    setBusy(true); setNotice("");
    const response = await fetch("/api/admin/whatsapp-ai/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examples }),
    });
    const json = await response.json();
    setNotice(response.ok ? `${json.added} konuşma örneği tek seferde öğretildi.` : json.error || "Toplu eğitim kaydedilemedi.");
    if (response.ok) { setBulkTraining(""); await load(); }
    setBusy(false);
  };

  const test = async () => {
    setBusy(true); setTestWarning(""); setTestProvider("");
    const response = await fetch("/api/admin/whatsapp-ai/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: testMessage, history: testHistory }) });
    const json = await response.json();
    if (response.ok) setTestHistory((current) => [...current, { direction: "INBOUND" as const, content: testMessage }, { direction: "OUTBOUND" as const, content: String(json.reply) }].slice(-10));
    else setTestWarning(json.error || "Test başarısız");
    if (response.ok && json.warning) setTestWarning(json.warning);
    if (response.ok && json.provider) setTestProvider(json.provider);
    setBusy(false);
  };

  const testOllama = async () => {
    const message = ollamaMessage.trim();
    if (!message || busy) return;
    const nextHistory = [...ollamaHistory, { role: "user" as const, content: message }];
    setOllamaHistory(nextHistory); setOllamaMessage(""); setOllamaError(""); setBusy(true);
    const response = await fetch("/api/admin/whatsapp-ai/ollama", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: nextHistory }),
    });
    const json = await response.json();
    if (response.ok) {
      setOllamaHistory((current) => [...current, { role: "assistant" as const, content: String(json.reply) }].slice(-20));
      setOllamaProvider(json.provider || "Güvenli hazır yanıt");
    }
    else setOllamaError(json.error || "Bağlantı hatası: Sunucu kapalı olabilir");
    setBusy(false);
  };

  const [adminDirectReply, setAdminDirectReply] = useState("");

  const sendAdminDirectMessage = async (conversationId: string, phone: string) => {
    if (!adminDirectReply.trim()) return;
    setBusy(true); setNotice("");
    const response = await fetch("/api/admin/whatsapp-ai/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, phone, text: adminDirectReply.trim() }),
    });
    const json = await response.json();
    if (response.ok) {
      setAdminDirectReply("");
      setNotice("Yönetici yanıtı WhatsApp'a iletildi ve otomatik eğitime kaydedildi.");
      await load();
    } else {
      setNotice(json.error || "Mesaj gönderilemedi.");
    }
    setBusy(false);
  };

  const toggleBotStatus = async (conversationId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "HUMAN_NEEDED" ? "AI_ACTIVE" : "HUMAN_NEEDED";
    setBusy(true); setNotice("");
    const response = await fetch("/api/admin/whatsapp-ai/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, status: nextStatus }),
    }).catch(() => null);
    setNotice(nextStatus === "HUMAN_NEEDED" ? "Bot bu konuşma için durduruldu (İnsan Modu)." : "Bot yeniden aktif edildi.");
    setBusy(false);
    load();
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
      <div><p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-600">Satış & Müşteri Hizmetleri</p><h1 className="mt-2 text-2xl font-bold text-slate-900">WhatsApp AI Merkezi</h1><p className="mt-1 text-sm text-slate-500">Umre satış asistanını, canlı konuşma loglarını ve otomatik eğitimi Türkçe yönetin.</p></div>
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${data.connection.githubModels ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>GitHub Modelleri {data.connection.githubModels ? "Bağlı" : "Hazır Değil"}</span>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${data.connection.gemini ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>Gemini {data.connection.gemini ? "Bağlı" : "Eksik"}</span>
        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${data.connection.whatsapp ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>WhatsApp {data.connection.whatsapp ? "Bağlı" : "Kurulum Bekliyor"}</span>
      </div>
    </div>

    <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2">
      {[["overview","Genel Bakış & Canlı Loglar"],["connection","QR Bağlantısı"],["knowledge","Asistan & Bilgi Tabanı"],["training","AI Eğitim Merkezi"],["test","Yanıt Testi"],["ollama","Ollama Sohbeti"]].map(([id,label]) => <button key={id} onClick={() => setTab(id as typeof tab)} className={`rounded-xl px-5 py-3 text-sm font-bold ${tab === id ? "bg-[#003781] text-white" : "text-slate-500 hover:bg-slate-50"}`}>{label}</button>)}
    </div>

    {tab === "overview" && <>
      {notice ? <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{notice}</div> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[["Konuşma",data.stats.conversations,"forum"],["Toplam Mesaj",data.stats.totalMessages,"chat"],["AI Yanıtı",data.stats.aiMessages,"smart_toy"],["Temsilci Bekleyen",data.stats.handoffCount,"support_agent"]].map(([label,value,icon]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className="material-symbols-outlined text-[#003781]">{icon}</span><p className="mt-4 text-3xl font-bold text-slate-900">{value}</p><p className="text-sm text-slate-500">{label}</p></div>)}
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold text-slate-900">Müşteri WhatsApp Konuşma Logları & Canlı Müdahale</h2><p className="mt-1 text-sm text-slate-500">Gelen mesajları görün, AI yanıtlarını inceleyin veya tek tıkla canlı WhatsApp mesajı gönderin.</p></div><div className="flex flex-wrap gap-2"><button disabled={busy} onClick={cleanupSyntheticTests} className="rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50">Tanımlı testleri temizle</button><button disabled={busy || data.conversations.length === 0} onClick={() => cleanupConversations()} className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50">Tüm konuşmaları temizle</button></div></div><div className="mt-4 flex flex-wrap gap-2">{[
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
            return <div key={c.id} className="px-6 py-4"><div className="flex items-start gap-3"><button onClick={() => setOpenConversation(openConversation === c.id ? null : c.id)} className="grid min-w-0 flex-1 gap-3 text-left md:grid-cols-[1fr_2fr_auto] md:items-center"><div><p className="font-bold text-slate-800">{c.name || c.phone}</p><p className="text-xs text-slate-400">+{c.phone}</p></div><p className="truncate text-sm text-slate-500">{c.messages.at(-1)?.content}</p><div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${stateClass}`}>{stateLabel}</span><span className="text-xs font-bold text-slate-400">{c.leadType || "KARARSIZ"} · %{c.leadScore}</span></div></button><button disabled={busy} onClick={() => cleanupConversations(c.id)} title="Konuşmayı sil" className="rounded-lg p-2 text-slate-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"><span className="material-symbols-outlined text-xl">delete</span></button></div>{openConversation === c.id ? <div className="mt-4 space-y-3 rounded-2xl bg-[#efeae2] p-4">
              <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                <span className="text-xs font-bold text-slate-600">Canlı WhatsApp Sohbet Logları (+{c.phone})</span>
                <button disabled={busy} onClick={() => toggleBotStatus(c.id, c.status)} className={`rounded-full px-3 py-1 text-xs font-bold ${c.status === "HUMAN_NEEDED" ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"}`}>
                  {c.status === "HUMAN_NEEDED" ? "▶ Botu Yeniden Başlat" : "⏸ Botu Durdur / Devral"}
                </button>
              </div>

              {/* AI TEŞHİS VE EKSİK TESPİT KARTI */}
              {(() => {
                const lastInbound = c.messages.filter(m => m.direction === 'INBOUND').slice(-1)[0];
                const matchedExample = lastInbound ? config.trainingExamples.find(ex => ex.customerMessage.toLowerCase().includes(lastInbound.content.toLowerCase().slice(0, 15))) : null;
                return (
                  <div className="rounded-xl border border-blue-200 bg-white p-3.5 text-xs shadow-sm space-y-2">
                    <div className="flex items-center justify-between font-bold text-blue-900 border-b border-slate-100 pb-2">
                      <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-sm text-blue-600">analytics</span> Gelen Soru & Eğitim Entegrasyon Analizi</span>
                      <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] text-blue-700 font-mono">Ollama 4'lü Zincir Aktif</span>
                    </div>
                    
                    <div className="grid gap-2 sm:grid-cols-2 text-slate-700">
                      <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                        <b className="block text-[10px] uppercase text-slate-400">Müşterinin Son Gelen Sorusu</b>
                        <p className="mt-1 font-semibold text-slate-800">{lastInbound?.content || "Henüz gelen soru yok"}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                        <b className="block text-[10px] uppercase text-slate-400">Veritabanı Eğitim Durumu</b>
                        {matchedExample ? (
                          <div className="mt-1 text-emerald-700 font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span>Eşleşen Eğitim Var: "{matchedExample.category}"</span>
                          </div>
                        ) : (
                          <div className="mt-1 text-amber-700 font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            <span>Özel Örnek Yok (Genel Kurallarla Yanıtlandı)</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg bg-blue-50/60 p-2 text-[11px] text-blue-900 flex items-center justify-between">
                      <span>💡 <b>Eksik Giderme Önerisi:</b> {matchedExample ? "Bu soru türü veritabanınızda eğitilmiş durumda." : "Bu soruyu ve ideal yanıtını tek tıkla Eğitim Havuzuna ekleyebilirsiniz."}</span>
                      {lastInbound && (
                        <button disabled={busy} onClick={() => teachAnswer(lastInbound.content, c.messages.filter(m => m.direction === 'OUTBOUND').slice(-1)[0]?.content || "")} className="shrink-0 rounded bg-[#003781] px-2.5 py-1 font-bold text-white hover:bg-blue-900">
                          ➕ Bu Soruyu Eğitime Ekle
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {c.messages.map((message, index) => <div key={message.id} className={`flex ${message.direction === "INBOUND" ? "justify-start" : "justify-end"}`}><div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${message.direction === "INBOUND" ? "rounded-tl-sm bg-white text-slate-700" : "rounded-tr-sm bg-[#d9fdd3] text-slate-800"}`}><p className="mb-1 text-[10px] font-bold uppercase text-slate-400">{message.direction === "INBOUND" ? "👤 Müşteri" : message.source === "ai" ? "🤖 AI Yanıtı (4'lü Zincir)" : "👨‍💼 Yönetici (İnsan)"}</p><p className="whitespace-pre-wrap">{message.content}</p>{message.source === "ai" ? <button disabled={busy} onClick={() => teachAnswer([...c.messages].slice(0, index).reverse().find((item) => item.direction === "INBOUND")?.content || "", message.content)} className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700 hover:bg-amber-100">Düzelt ve öğret</button> : null}</div></div>)}
              <div className="mt-3 flex gap-2 rounded-xl bg-white p-2 shadow-sm">
                <input className="flex-1 text-sm outline-none px-3" placeholder="Müşteriye doğrudan WhatsApp mesajı yazın..." value={adminDirectReply} onChange={(e) => setAdminDirectReply(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAdminDirectMessage(c.id, c.phone); } }} />
                <button disabled={busy || !adminDirectReply.trim()} onClick={() => sendAdminDirectMessage(c.id, c.phone)} className="rounded-xl bg-[#003781] px-5 py-2 text-xs font-bold text-white disabled:opacity-50">
                  {busy ? "Gönderiliyor..." : "WhatsApp'a Gönder"}
                </button>
              </div>
            </div> : null}</div>;
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

    {tab === "training" && <div className="space-y-5">
      {notice ? <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{notice}</div> : null}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Kontrollü Öğrenme</p><h2 className="mt-1 text-xl font-bold text-slate-900">AI Eğitim Merkezi</h2><p className="mt-1 text-sm text-slate-500">Doğru cevap örnekleri sonraki benzer müşteri mesajlarında asistana gösterilir.</p></div>
          <span className="rounded-full bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700">{config.trainingExamples.length} onaylı örnek</span>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label><span className="mb-1.5 block text-xs font-bold text-slate-500">MÜŞTERİ NE YAZAR?</span><textarea rows={5} className={input} value={trainingQuestion} onChange={(event) => setTrainingQuestion(event.target.value)} placeholder="Örn: Biraz indirim yaparsanız kesin alacağım." /></label>
          <label><span className="mb-1.5 block text-xs font-bold text-slate-500">İDEAL CEVAP NE OLMALI?</span><textarea rows={5} className={input} value={trainingReply} onChange={(event) => setTrainingReply(event.target.value)} placeholder="Müşteriye gönderilmesi gereken doğru ve doğal cevabı yazın." /></label>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="min-w-52"><span className="mb-1.5 block text-xs font-bold text-slate-500">KATEGORİ</span><select className={input} value={trainingCategory} onChange={(event) => setTrainingCategory(event.target.value)}><option>Satış</option><option>Fiyat</option><option>İndirim İtirazı</option><option>Grup Umresi</option><option>Bireysel Umre</option><option>Otel ve Konaklama</option><option>Çocuklu Aile</option><option>Temsilciye Aktarım</option></select></label>
          <button disabled={busy || !trainingQuestion.trim() || !trainingReply.trim()} onClick={addTrainingExample} className="rounded-xl bg-[#003781] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "Kaydediliyor..." : "Doğru Cevap Olarak Öğret"}</button>
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-amber-600">Canlı Yönetici Desteği</p><h2 className="mt-1 text-lg font-bold text-slate-900">Anlamadığını WhatsApp’tan Bana Sor</h2><p className="mt-1 max-w-2xl text-sm text-slate-600">AI teyit gerektiren veya cevaplayamadığı bir soruda müşteriye bekleme mesajı gönderir, ardından bu numaraya referans koduyla danışır. Verdiğiniz cevap müşteriye iletilip eğitim havuzuna eklenir.</p></div><button onClick={() => setConfig({ ...config, managerEscalationEnabled: !config.managerEscalationEnabled })} className={`shrink-0 rounded-full px-5 py-2 text-sm font-bold ${config.managerEscalationEnabled ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>{config.managerEscalationEnabled ? "Yöneticiye Sorma Açık" : "Yöneticiye Sorma Kapalı"}</button></div>
        <label className="mt-5 block max-w-xl"><span className="mb-1.5 block text-xs font-bold text-slate-500">SORULARIN GİDECEĞİ WHATSAPP NUMARASI</span><input className={input} value={config.managerPhone} onChange={(event) => setConfig({ ...config, managerPhone: event.target.value.replace(/[^\d+]/g, "") })} placeholder="905xxxxxxxxx" /><span className="mt-1.5 block text-xs text-amber-700">Müşteri hattından farklı bir numara yazın. Başında 90 ülke kodu bulunmalı.</span></label>
        <label className="mt-5 flex max-w-3xl items-start gap-3 rounded-xl border border-amber-200 bg-white p-4"><input type="checkbox" checked={config.managerApprovalMode} onChange={(event) => setConfig({ ...config, managerApprovalMode: event.target.checked })} className="mt-1 h-5 w-5 accent-[#003781]" /><span><b className="block text-sm text-slate-900">Güvenli onay modu: Her cevabı önce bana sor</b><span className="mt-1 block text-xs leading-relaxed text-slate-500">Açıkken AI müşteriye doğrudan mesaj göndermez. Soruyu ve hazırladığı taslağı yönetici WhatsApp numarasına yollar; yalnızca sizin #YANIT cevabınız müşteriye gider.</span></span></label>
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50/40 p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Hızlı Aktarım</p><h2 className="mt-1 text-lg font-bold text-slate-900">Toplu Konuşma Öğret</h2><p className="mt-1 text-sm text-slate-500">Onlarca müşteri-cevap çiftini tek alana yapıştırın; sistem hepsini otomatik ayırır.</p></div><span className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm">En fazla 100 örnek saklanır</span></div>
        <div className="mt-4 rounded-xl border border-blue-100 bg-white p-3 text-xs leading-6 text-slate-500"><b>Kullanılacak biçim:</b><br />Müşteri: Biraz indirim yaparsanız kesin alacağım.<br />Cevap: Talebinizi anlıyorum efendim. Teyitsiz indirim sözü vermeden özel fiyat talebinizi yetkili temsilcimize iletiyorum.<br /><br />Müşteri: Grup umreleriniz ne zaman?<br />Cevap: Grup umremizin çıkışları 15 ve 25 Eylül’dür. Size hangi tarih daha uygun olur?</div>
        <textarea rows={12} className={`${input} mt-4 font-mono`} value={bulkTraining} onChange={(event) => setBulkTraining(event.target.value)} placeholder={"Müşteri: ...\nCevap: ...\n\nMüşteri: ...\nCevap: ..."} />
        <div className="mt-4 flex items-center justify-between gap-3"><p className="text-xs text-slate-500">Boş satır bırakmanız şart değildir; her “Müşteri:” yeni bir kayıt başlatır.</p><button disabled={busy || !bulkTraining.trim()} onClick={importBulkTraining} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "İçe aktarılıyor..." : "Hepsini Tek Seferde Öğret"}</button></div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold text-slate-900">Gönderim Öncesi Kalite Kuralları</h2><p className="mb-4 text-sm text-slate-500">Asistan her cevapta bu kontrol listesini uygular.</p><textarea rows={9} className={input} value={config.qualityRules} onChange={(event) => setConfig({ ...config, qualityRules: event.target.value })} /></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-bold text-slate-900">Söylenmesi Yasak / Teyit Gerektiren Bilgiler</h2><p className="mb-4 text-sm text-slate-500">Her satıra bir yasak veya teyit şartı yazın.</p><textarea rows={9} className={input} value={config.prohibitedClaims.join("\n")} onChange={(event) => setConfig({ ...config, prohibitedClaims: event.target.value.split("\n").map((item) => item.trim()).filter(Boolean) })} /></section>
      </div>
      <div className="flex justify-end"><button disabled={busy} onClick={save} className="rounded-xl bg-emerald-600 px-7 py-3 text-sm font-bold text-white disabled:opacity-50">Kuralları Kaydet</button></div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5"><h2 className="font-bold text-slate-900">Onaylanmış Cevap Kütüphanesi</h2><p className="text-sm text-slate-500">Konuşma ekranındaki “Düzelt ve öğret” düğmesiyle eklenen cevaplar da burada görünür.</p></div>
        {config.trainingExamples.length === 0 ? <div className="p-10 text-center text-sm text-slate-400">Henüz eğitim örneği eklenmedi.</div> : <div className="divide-y divide-slate-100">{[...config.trainingExamples].reverse().map((example) => <div key={example.id} className="grid gap-3 px-6 py-5 md:grid-cols-[1fr_1fr_auto]"><div><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">{example.category}</span><p className="mt-2 text-sm font-semibold text-slate-800">{example.customerMessage}</p></div><div className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{example.idealReply}</div><button disabled={busy} onClick={() => deleteTrainingExample(example.id)} className="self-start rounded-lg p-2 text-slate-300 hover:bg-red-50 hover:text-red-600"><span className="material-symbols-outlined">delete</span></button></div>)}</div>}
      </section>
    </div>}

    {tab === "test" && <section className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-2">
      <div><div className="flex items-center justify-between"><h2 className="font-bold text-slate-900">Müşteri Mesajını Deneyin</h2><button onClick={() => { setTestHistory([]); setTestWarning(""); setTestProvider(""); }} className="text-xs font-bold text-red-600">Sohbeti Sıfırla</button></div><p className="mb-4 text-sm text-slate-500">Gerçek WhatsApp mesajı göndermeden bağlı AI modellerinin yanıtını ve konuşma sürekliliğini deneyin.</p><textarea rows={10} className={input} value={testMessage} onChange={(e) => setTestMessage(e.target.value)}/><button disabled={busy || !testMessage.trim()} onClick={test} className="mt-4 rounded-xl bg-[#25D366] px-7 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "Yanıt hazırlanıyor..." : "Yanıtı Test Et"}</button></div>
      <div className="rounded-2xl bg-[#efeae2] p-5"><div className="mb-3 flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-widest text-slate-500">Deneme Sohbeti</p>{testProvider ? <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-[#003781] shadow-sm">{testProvider}</span> : null}</div>{testWarning ? <div className="mb-3 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800">{testWarning}</div> : null}<div className="max-h-96 space-y-2 overflow-y-auto">{testHistory.length ? testHistory.map((message, index) => <div key={`${index}-${message.direction}`} className={`flex ${message.direction === "INBOUND" ? "justify-end" : "justify-start"}`}><div className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${message.direction === "INBOUND" ? "rounded-tr-sm bg-[#d9fdd3]" : "rounded-tl-sm bg-white"}`}>{message.content}</div></div>) : <div className="min-h-40 rounded-2xl bg-white p-4 text-sm text-slate-400 shadow-sm">Test yanıtı burada görünecek.</div>}</div></div>
    </section>}

    {tab === "ollama" && <section className="relative overflow-hidden rounded-[28px] bg-[#07101f] p-4 text-white shadow-2xl md:p-7">
      <div className="pointer-events-none absolute -left-20 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="relative mx-auto max-w-4xl">
        <div className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[.06] p-4 backdrop-blur-xl">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-300">Hadi Umreye Müşteri Temsilcisi</p><h2 className="mt-1 text-xl font-bold">Ollama · llama3.2</h2></div>
          <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_#34d399]" /><span className="text-xs text-slate-300">{ollamaProvider || "Öncelikli yerel model"}</span></div>
        </div>
        <div className="flex min-h-[430px] max-h-[58vh] flex-col gap-3 overflow-y-auto rounded-3xl border border-white/10 bg-black/20 p-4 backdrop-blur-xl md:p-6">
          {ollamaHistory.length === 0 ? <div className="m-auto max-w-md text-center"><span className="material-symbols-outlined text-5xl text-blue-300">support_agent</span><h3 className="mt-3 text-lg font-bold">WhatsApp müşteri temsilcisini deneyin</h3><p className="mt-2 text-sm leading-relaxed text-slate-400">Bu ekran WhatsApp hattındaki şirket bilgisi, Umre paketleri, satış kuralları ve konuşma hafızasının aynısını kullanır.</p></div> :
            ollamaHistory.map((message, index) => <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === "user" ? "rounded-br-md bg-blue-600 text-white" : "rounded-bl-md border border-white/10 bg-white/10 text-slate-100 backdrop-blur"}`}>{message.content}</div></div>)}
          {busy ? <div className="flex justify-start"><div className="rounded-2xl rounded-bl-md border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-300">Müşteri temsilcimiz hazırlanıyor <span className="animate-pulse">(3 aşamalı kontrol yapılıyor...)</span></div></div> : null}
        </div>
        {ollamaError ? <div className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{ollamaError}</div> : null}
        <div className="mt-4 flex gap-3 rounded-2xl border border-white/10 bg-white/[.07] p-2 backdrop-blur-xl">
          <textarea rows={2} value={ollamaMessage} onChange={(event) => setOllamaMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); testOllama(); } }} placeholder="llama3.2 modeline mesaj yazın..." className="min-h-12 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500" />
          <button disabled={busy || !ollamaMessage.trim()} onClick={testOllama} className="self-end rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40">{busy ? "Bekleyin" : "Gönder"}</button>
        </div>
        <div className="mt-3 flex justify-end"><button onClick={() => { setOllamaHistory([]); setOllamaError(""); setOllamaProvider(""); }} className="text-xs font-semibold text-slate-400 hover:text-white">Sohbeti temizle</button></div>
      </div>
    </section>}
  </div>;
}
