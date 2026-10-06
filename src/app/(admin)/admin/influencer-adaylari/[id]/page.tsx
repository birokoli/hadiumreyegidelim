"use client";

import React, { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import { DM_TEMPLATES, fillTemplate } from "../dm";
import type { Prospect } from "../page";

const API = "/api/admin/influencer-prospects";

async function post(body: Record<string, unknown>): Promise<{ item?: Prospect; inviteUrl?: string }> {
  const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) throw new Error(data.error || `İstek başarısız (${res.status}).`);
  return data;
}

const STAGES: { key: Prospect["stage"]; label: string }[] = [
  { key: "bulundu", label: "Bulundu" },
  { key: "uygun", label: "Uygun" },
  { key: "mesaj", label: "Mesaj Gönderildi" },
  { key: "yanit", label: "Yanıt Alındı" },
  { key: "anlasildi", label: "Anlaşıldı" },
  { key: "red", label: "Reddedildi" },
];

export default function InfluencerAdayDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const prospectId = resolvedParams.id;

  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [noteText, setNoteText] = useState("");
  const [audienceText, setAudienceText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("instagram_dm_short");
  const [inviteUrl, setInviteUrl] = useState("");
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastError, setToastError] = useState(false);

  const showToast = (msg: string, isError = false) => {
    setToastMsg(msg);
    setToastError(isError);
    setTimeout(() => setToastMsg(""), 4000);
  };

  const apply = (item: Prospect) => {
    setProspect(item);
    setNoteText(item.note || "");
    setAudienceText(item.audienceTR != null ? String(item.audienceTR) : "");
  };

  const loadProspect = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(`${API}?id=${encodeURIComponent(prospectId)}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.item) throw new Error(data.error || `Aday alınamadı (${res.status}).`);
      apply(data.item);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [prospectId]);

  useEffect(() => {
    loadProspect();
  }, [loadProspect]);

  const run = async (body: Record<string, unknown>, ok: string) => {
    try {
      const d = await post(body);
      if (d.item) apply(d.item);
      showToast(ok);
      return d;
    } catch (e) {
      showToast(e instanceof Error ? e.message : String(e), true);
      return null;
    }
  };

  const handleStageChange = async (newStage: Prospect["stage"]) => {
    if (!prospect) return;
    await run({ action: "stage", id: prospect.id, stage: newStage }, `Aşama "${STAGES.find(s => s.key === newStage)?.label}" olarak güncellendi.`);
  };

  const handleSaveNote = async () => {
    if (!prospect) return;
    setSavingNote(true);
    await run({ action: "note", id: prospect.id, note: noteText, audienceTR: audienceText.trim() === "" ? null : Number(audienceText.replace(",", ".")) }, "Kaydedildi.");
    setSavingNote(false);
  };

  // Kartopu ve kişiye özel mesaj (6 Ekim)
  const [similarBusy, setSimilarBusy] = useState(false);
  const [draftBusy, setDraftBusy] = useState(false);
  const [customDm, setCustomDm] = useState("");
  const handleSimilar = async () => {
    if (!prospect) return;
    setSimilarBusy(true);
    try {
      const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "similar", id: prospect.id }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || d.ok === false) throw new Error(d.error || "Bulunamadı.");
      showToast(`${d.checked} etiketlenen hesap denendi, ${d.added} yeni aday eklendi.`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : String(e), true);
    } finally {
      setSimilarBusy(false);
    }
  };
  const handleDraft = async () => {
    if (!prospect) return;
    setDraftBusy(true);
    try {
      const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "draft", id: prospect.id }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || d.ok === false) throw new Error(d.error || "Mesaj yazılamadı.");
      setCustomDm(String(d.text).replaceAll("{davet}", inviteUrl || "{davet}"));
      showToast("Kişiye özel mesaj hazır; göndermeden önce okuyun.");
    } catch (e) {
      showToast(e instanceof Error ? e.message : String(e), true);
    } finally {
      setDraftBusy(false);
    }
  };

  const handleRefresh = async () => {
    if (!prospect) return;
    setRefreshing(true);
    const d = await run({ action: "score", id: prospect.id }, "Ölçümler yenilendi.");
    if (d?.item?.metricsError) showToast(d.item.metricsError, true);
    setRefreshing(false);
  };

  const handleCreateInvite = async () => {
    if (!prospect) return;
    setGeneratingInvite(true);
    const d = await run({ action: "invite", id: prospect.id }, "Davet bağlantısı oluşturuldu; aday \"Mesaj Gönderildi\" aşamasına alındı.");
    if (d?.inviteUrl) setInviteUrl(d.inviteUrl);
    setGeneratingInvite(false);
  };

  const activeTemplate = DM_TEMPLATES.find(t => t.id === selectedTemplateId) || DM_TEMPLATES[0];
  const filledDmContent = prospect
    ? fillTemplate(activeTemplate.content, {
        ad: prospect.name || prospect.handle,
        platform: prospect.platform === "instagram" ? "Instagram" : prospect.platform === "tiktok" ? "TikTok" : "YouTube",
        komisyon: "{komisyon}",
        davet: inviteUrl || "{davet}"
      })
    : "";

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} kopyalandı!`);
  };

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return "-";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString("tr-TR");
  };

  const getScoreBadgeClass = (score: number | null) => {
    if (score === null) return "bg-surface-container text-on-surface-variant";
    if (score >= 70) return "bg-primary/10 text-primary border border-primary/20 font-bold";
    if (score >= 40) return "bg-surface-container-high text-on-surface-variant border border-outline-variant/30 font-medium";
    return "bg-surface-container-lowest text-outline border border-outline-variant/20 opacity-70";
  };

  if (!loading && !prospect) {
    return (
      <div className="p-12 text-center text-xs space-y-3">
        <p className="text-error">{loadError || "Aday bulunamadı."}</p>
        <Link href="/admin/influencer-adaylari" className="text-primary font-semibold">Aday havuzuna dön</Link>
      </div>
    );
  }

  if (loading || !prospect) {
    return (
      <div className="p-12 text-center text-xs text-outline flex items-center justify-center gap-2">
        <span className="material-symbols-outlined animate-spin">refresh</span>
        <span>Aday detayları yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Toast Notice */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-sm px-4 py-3 text-white text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2 ${toastError ? "bg-error" : "bg-primary"}`}>
          <span className="material-symbols-outlined text-[18px]">{toastError ? "error" : "check_circle"}</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/15 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-outline mb-1">
            <Link href="/admin/influencer-adaylari" className="hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">arrow_back</span>
              <span>Influencer Aday Havuzu</span>
            </Link>
            <span>/</span>
            <span className="text-on-surface font-medium">@{prospect.handle}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
              {prospect.name}
            </h1>
            <a
              href={prospect.url}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 bg-surface-container-low hover:bg-surface-container text-primary rounded-xl text-xs font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span>@{prospect.handle}</span>
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </a>
          </div>
        </div>

        {/* Stage quick changer */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-surface-container-lowest p-1.5 rounded-2xl border border-outline-variant/15">
          {STAGES.map(s => {
            const isActive = prospect.stage === s.key;
            return (
              <button
                key={s.key}
                onClick={() => handleStageChange(s.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-primary text-white font-bold shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid: Left details & Right DM action center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Score & Reasons */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/15 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">stars</span>
                <h3 className="font-headline font-bold text-base text-on-surface">Uygunluk ve Puan Analizi</h3>
              </div>
              <span className={`px-4 py-1.5 rounded-2xl text-sm ${getScoreBadgeClass(prospect.fitScore)}`}>
                {prospect.fitScore !== null ? `${prospect.fitScore} / 100 Puan` : "Puanlanmadı"}
              </span>
            </div>

            <div>
              <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Puanlama Gerekçeleri</h4>
              {prospect.fitReasons && prospect.fitReasons.length > 0 ? (
                <ul className="space-y-2">
                  {prospect.fitReasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-on-surface bg-surface-container-low/50 p-2.5 rounded-xl border border-outline-variant/10">
                      <span className="material-symbols-outlined text-primary text-[16px] shrink-0 mt-0.5">check_circle</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-outline italic">Puanlama gerekçesi girilmemiş.</p>
              )}
            </div>
          </div>

          {/* Card 2: Key Metrics Overview */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/15 shadow-sm space-y-4">
            <h3 className="font-headline font-bold text-base text-on-surface border-b border-outline-variant/10 pb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
              Hesap Metrikleri & Kitle Analizi
              <button onClick={handleSimilar} disabled={similarBusy} className="px-3 py-1.5 rounded-xl border border-outline-variant/30 text-xs font-semibold text-primary hover:bg-surface-container-low inline-flex items-center gap-1 disabled:opacity-50" title="Paylaşımlarında etiketlediği hesaplardan 10–50 bin aralığındakileri ekler">
                <span className="material-symbols-outlined text-[16px]">group_add</span>
                {similarBusy ? "Aranıyor…" : "Benzerlerini bul"}
              </button>
              <button onClick={handleRefresh} disabled={refreshing} className="ml-auto px-3 py-1.5 rounded-xl border border-outline-variant/30 text-xs font-semibold text-primary hover:bg-surface-container-low inline-flex items-center gap-1 disabled:opacity-50">
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                {refreshing ? "Ölçülüyor…" : "Yeniden ölç ve puanla"}
              </button>
            </h3>
            {prospect.metricsError && <p className="text-xs text-error bg-error/5 rounded-xl p-3">{prospect.metricsError}</p>}
            <p className="text-[11px] text-outline">
              {prospect.metricsAt ? `Son ölçüm: ${new Date(prospect.metricsAt).toLocaleString("tr-TR")}` : "Henüz ölçülmedi."}
              {prospect.postsLast30 != null && ` · Son 30 günde ${prospect.postsLast30} paylaşım`}
              {prospect.avgLikes != null && ` · ort. ${prospect.avgLikes.toLocaleString("tr-TR")} beğeni, ${prospect.avgComments?.toLocaleString("tr-TR") ?? "-"} yorum`}
            </p>
            {prospect.bio && <p className="text-xs text-on-surface-variant whitespace-pre-line">{prospect.bio}</p>}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                <span className="text-[11px] font-semibold text-outline block mb-1">Takipçi Sayısı</span>
                <span className="text-lg font-bold font-headline text-on-surface">{formatNumber(prospect.followers)}</span>
              </div>
              <div className="p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                <span className="text-[11px] font-semibold text-outline block mb-1">Ort. İzlenme (Reels)</span>
                <span className="text-lg font-bold font-headline text-on-surface">{formatNumber(prospect.avgViews)}</span>
              </div>
              <div className="p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                <span className="text-[11px] font-semibold text-outline block mb-1">Etkileşim Oranı</span>
                <span className="text-lg font-bold font-headline text-on-surface">
                  {prospect.engagementRate != null ? `%${prospect.engagementRate.toLocaleString("tr-TR")}` : "-"}
                </span>
              </div>
              <div className="p-3.5 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                <span className="text-[11px] font-semibold text-outline block mb-1">Türkiye Kitle %</span>
                <span className="text-lg font-bold font-headline text-on-surface">
                  {prospect.audienceTR != null ? `%${prospect.audienceTR}` : "-"}
                </span>
                <span className="block text-[10px] text-outline mt-0.5">Influencer'ın kendi istatistiğinden girilir</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10">
                <span className="text-[11px] font-semibold text-outline block mb-1">Dindar/Muhafazakâr Kitle</span>
                <span className="text-xs font-bold text-on-surface">
                  {prospect.religiousAudience === true ? "Evet" : prospect.religiousAudience === false ? "Hayır" : "Bilinmiyor"}
                </span>
              </div>
              <div className="p-3.5 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10">
                <span className="text-[11px] font-semibold text-outline block mb-1">Son Paylaşım Tarihi</span>
                <span className="text-xs font-bold text-on-surface">
                  {prospect.lastPostAt ? new Date(prospect.lastPostAt).toLocaleDateString("tr-TR") : "-"}
                </span>
              </div>
              <div className="p-3.5 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10">
                <span className="text-[11px] font-semibold text-outline block mb-1">Veri Kaynağı</span>
                <span className="text-xs font-bold text-on-surface">{prospect.source}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Notes Area */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/15 shadow-sm space-y-3">
            <h3 className="font-headline font-bold text-base text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">sticky_note_2</span>
              Özel Notlar & Görüşme Kayıtları
            </h3>
            <textarea
              rows={4}
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              placeholder="Adayla ilgili iletişim geçmişi, şartlar veya özel notlar ekleyin..."
              className="w-full bg-surface-container-low text-xs text-on-surface rounded-xl p-3.5 border border-outline-variant/20 focus:outline-none focus:border-primary leading-relaxed"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs text-outline">
                Türkiye kitle %
                <input value={audienceText} onChange={e => setAudienceText(e.target.value)} inputMode="decimal" placeholder="örn. 85" className="w-20 bg-surface-container-low text-xs text-on-surface rounded-xl px-2 py-1.5 border border-outline-variant/20 focus:outline-none focus:border-primary" />
              </label>
              <button
                onClick={handleSaveNote}
                disabled={savingNote}
                className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>{savingNote ? "Kaydediliyor..." : "Kaydet"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): DM Templates & Invite Link generator */}
        <div className="space-y-6">
          {/* DM Generator Card */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/15 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-3">
              <span className="material-symbols-outlined text-primary text-[20px]">chat</span>
              <h3 className="font-headline font-bold text-sm text-on-surface">DM & Mesaj Taslağı</h3>
            </div>

            <div>
              <button onClick={handleDraft} disabled={draftBusy} className="mb-3 w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50">
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                {draftBusy ? "Paylaşımları okunuyor…" : customDm ? "Yeniden yaz" : "Kişiye özel mesaj yaz"}
              </button>
              {customDm && <button onClick={() => setCustomDm("")} className="mb-3 text-[11px] text-outline underline">Şablona dön</button>}
              <label className="block text-[11px] font-semibold text-outline mb-1">Şablon Seçimi</label>
              <select
                value={selectedTemplateId}
                onChange={e => setSelectedTemplateId(e.target.value)}
                className="w-full bg-surface-container-low text-xs text-on-surface rounded-xl px-3 py-2 border border-outline-variant/30 focus:outline-none focus:border-primary"
              >
                {DM_TEMPLATES.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {activeTemplate.subject && (
              <div className="p-2.5 bg-surface-container-low rounded-xl border border-outline-variant/10 text-xs">
                <span className="font-bold text-outline">E-posta Konusu: </span>
                <span className="font-medium text-on-surface">{activeTemplate.subject}</span>
              </div>
            )}

            <div className="relative">
              <textarea
                rows={12}
                value={customDm || filledDmContent}
                readOnly={!customDm}
                onChange={(e) => setCustomDm(e.target.value)}
                className="w-full bg-surface-container-low text-xs text-on-surface rounded-xl p-3.5 border border-outline-variant/20 font-mono leading-relaxed focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(customDm || filledDmContent, "DM Metni")}
                className="absolute top-3 right-3 px-2.5 py-1.5 bg-primary text-white rounded-xl text-[11px] font-bold shadow-sm hover:bg-primary-container transition-all active:scale-95 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">content_copy</span>
                <span>Kopyala</span>
              </button>
            </div>
          </div>

          {/* Invite Link Generator Card */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/15 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-3">
              <span className="material-symbols-outlined text-primary text-[20px]">link</span>
              <h3 className="font-headline font-bold text-sm text-on-surface">Davet Bağlantısı</h3>
            </div>

            <p className="text-[11px] text-outline leading-relaxed">
              Influencer başvuru sayfasına adaya özel bağlantı oluşturur ve adayı "Mesaj Gönderildi" aşamasına alır. Komisyon oranını mesajda {"{komisyon}"} yerine siz yazın.
            </p>

            {inviteUrl ? (
              <div className="space-y-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="w-full bg-surface-container-low text-xs text-on-surface rounded-xl px-3 py-2 border border-outline-variant/30 font-mono"
                />
                <button
                  onClick={() => copyToClipboard(inviteUrl, "Davet Bağlantısı")}
                  className="w-full py-2 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  <span>Bağlantıyı Kopyala</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleCreateInvite}
                disabled={generatingInvite}
                className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">add_link</span>
                <span>{generatingInvite ? "Oluşturuluyor..." : "Davet Bağlantısı Oluştur"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
