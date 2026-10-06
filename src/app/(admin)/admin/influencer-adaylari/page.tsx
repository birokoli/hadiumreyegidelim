"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";

import HubTabs from "@/components/admin/HubTabs";

export interface Prospect {
  id: string;
  platform: "instagram" | "tiktok" | "youtube";
  handle: string;
  url: string;
  name: string;
  bio?: string | null;
  followers: number | null;
  avgViews: number | null;
  avgLikes?: number | null;
  avgComments?: number | null;
  engagementRate: number | null;
  lastPostAt: string | null;
  postsLast30?: number | null;
  audienceTR: number | null;
  fitScore: number | null;
  fitReasons: string[];
  religiousAudience: boolean | null;
  stage: "bulundu" | "uygun" | "mesaj" | "yanit" | "anlasildi" | "red";
  source: string;
  note: string | null;
  metricsAt?: string | null;
  metricsError?: string | null;
  invitedAt?: string | null;
  createdAt: string;
}

const API = "/api/admin/influencer-prospects";

async function post<T = Record<string, unknown>>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) throw new Error(data.error || `İstek başarısız (${res.status}).`);
  return data as T;
}

const STAGES: { key: Prospect["stage"] | "all"; label: string }[] = [
  { key: "all", label: "Aktif adaylar" },
  { key: "bulundu", label: "Bulundu" },
  { key: "uygun", label: "Uygun" },
  { key: "mesaj", label: "Mesaj Gönderildi" },
  { key: "yanit", label: "Yanıt Alındı" },
  { key: "anlasildi", label: "Anlaşıldı" },
  { key: "red", label: "Reddedildi" },
];

export default function InfluencerAdaylariAdmin() {
  const [items, setItems] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeStage, setActiveStage] = useState<Prospect["stage"] | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [minScore, setMinScore] = useState<number>(0);

  // Form states
  const [addPlatform, setAddPlatform] = useState<Prospect["platform"]>("instagram");
  const [addHandle, setAddHandle] = useState("");
  const [addName, setAddName] = useState("");
  const [addNote, setAddNote] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const [discoverQuery, setDiscoverQuery] = useState("");
  const [discoverPlatform, setDiscoverPlatform] = useState<Prospect["platform"]>("instagram");
  const [discoverMode, setDiscoverMode] = useState<"ai" | "google">("ai");
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [rescoring, setRescoring] = useState(false);
  const [statusNotice, setStatusNotice] = useState("");
  const [metaStatus, setMetaStatus] = useState<{ ok: boolean; text: string } | null>(null);

  // Liste bir kez yüklenir; aşama, arama ve puan filtresi tarayıcıda uygulanır (en fazla 500 aday)
  const loadProspects = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(API, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Liste alınamadı (${res.status}).`);
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setItems([]);
      setErrorMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProspects();
  }, [loadProspects]);

  const handleSearchSubmit = (e: React.FormEvent) => e.preventDefault();

  const testMeta = async () => {
    setMetaStatus({ ok: true, text: "Deneniyor…" });
    try {
      const d = await (await fetch(`${API}?test=meta`, { cache: "no-store" })).json();
      setMetaStatus(d.ok ? { ok: true, text: `Bağlı: @${d.username}${d.followers != null ? ` · ${d.followers.toLocaleString("tr-TR")} takipçi` : ""}` } : { ok: false, text: d.error || "Bağlantı kurulamadı." });
    } catch (e) {
      setMetaStatus({ ok: false, text: e instanceof Error ? e.message : String(e) });
    }
  };

  const handleAddProspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addHandle.trim()) return;
    setAddLoading(true);
    setStatusNotice("");
    setErrorMsg("");
    try {
      const d = await post<{ item: Prospect; created: boolean }>({ action: "add", platform: addPlatform, handle: addHandle.trim(), name: addName.trim() || undefined, note: addNote.trim() || undefined });
      setStatusNotice(d.created ? (d.item.metricsError ? `@${d.item.handle} eklendi; ölçüm alınamadı: ${d.item.metricsError}` : `@${d.item.handle} eklendi ve puanlandı (${d.item.fitScore ?? "-"} / 100).`) : `@${d.item.handle} zaten havuzda.`);
      setAddHandle("");
      setAddName("");
      setAddNote("");
      await loadProspects();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setAddLoading(false);
    }
  };

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discoverQuery.trim()) return;
    setDiscoverLoading(true);
    setStatusNotice("");
    setErrorMsg("");
    try {
      const d = await post<{ found: number; alreadyKnown: number; added: number; tooSmall: number; unreadable: number; scored: number }>({ action: "discover", query: discoverQuery.trim(), platform: discoverPlatform, mode: discoverMode });
      const parts = [`${d.found} hesap önerildi`, `${d.added} yeni aday eklendi`];
      if (d.alreadyKnown) parts.push(`${d.alreadyKnown} zaten listede`);
      if (d.tooSmall) parts.push(`${d.tooSmall} tanesi 20 bin takipçinin altında olduğu için elendi`);
      if (d.unreadable) parts.push(`${d.unreadable} tanesi okunamadı (kişisel hesap ya da kullanıcı adı yanlış)`);
      if (d.scored) parts.push(`${d.scored} tanesi puanlandı, kalanlar günlük yenilemede puanlanır`);
      setStatusNotice(`"${discoverQuery.trim()}": ${parts.join(", ")}.`);
      await loadProspects();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setDiscoverLoading(false);
    }
  };

  const handleRescore = async () => {
    setRescoring(true);
    setErrorMsg("");
    try {
      const d = await post<{ refreshed: number }>({ action: "rescore" });
      setStatusNotice(`${d.refreshed} aday yeniden ölçüldü ve puanlandı. Influencer olmayan (acente, hoca, sayfa) ve 20 binin altındaki keşif adayları "Reddedildi"ye alındı. Kalanlar için tekrar basabilirsiniz.`);
      await loadProspects();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setRescoring(false);
    }
  };

  const filteredItems = items.filter(item => {
    if (activeStage === "all" ? item.stage === "red" : item.stage !== activeStage) return false;
    if (minScore > 0 && (item.fitScore || 0) < minScore) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLocaleLowerCase("tr-TR");
      const hay = `${item.handle} ${item.name} ${item.note ?? ""}`.toLocaleLowerCase("tr-TR");
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const getStageCounts = (stageKey: Prospect["stage"] | "all") => {
    if (stageKey === "all") return items.filter(i => i.stage !== "red").length;
    return items.filter(i => i.stage === stageKey).length;
  };

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return "-";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toLocaleString("tr-TR");
  };

  const getScoreBadgeClass = (score: number | null) => {
    if (score === null) return "bg-surface-container text-on-surface-variant";
    // RULE: score >= 70 uses primary brand color (NOT green!), score < 40 is muted grey, red ONLY for errors
    if (score >= 70) return "bg-primary/10 text-primary border border-primary/20 font-bold";
    if (score >= 40) return "bg-surface-container-high text-on-surface-variant border border-outline-variant/30 font-medium";
    return "bg-surface-container-lowest text-outline border border-outline-variant/20 opacity-70";
  };

  const getStageBadgeClass = (stage: Prospect["stage"]) => {
    switch (stage) {
      case "bulundu": return "bg-surface-container text-on-surface-variant";
      case "uygun": return "bg-primary/10 text-primary font-semibold";
      case "mesaj": return "bg-tertiary-fixed-dim/30 text-tertiary font-semibold";
      case "yanit": return "bg-secondary-container text-on-secondary-container font-semibold";
      case "anlasildi": return "bg-primary text-white font-bold";
      case "red": return "bg-surface-container-high text-outline font-medium";
    }
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-7xl mx-auto">
      <HubTabs hub="influencer" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-outline-variant/15 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-outline mb-1">
            <Link href="/admin" className="hover:text-primary transition-colors">Admin</Link>
            <span>/</span>
            <span className="text-on-surface font-medium">Influencer Adayları</span>
          </div>
          <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-[28px]">person_search</span>
            Influencer Aday Havuzu
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Muhafazakâr ve dindar kitleye ulaşan Instagram, TikTok ve YouTube içerik üreticilerini keşfedin, puanlayın ve yönetin.
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end gap-1">
          <button onClick={testMeta} className="px-3 py-2 rounded-xl border border-outline-variant/30 text-xs font-semibold text-primary hover:bg-surface-container-low inline-flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">link</span>
            Instagram bağlantısını test et
          </button>
          <button onClick={handleRescore} disabled={rescoring} className="px-3 py-2 rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface-variant hover:bg-surface-container-low inline-flex items-center gap-1.5 disabled:opacity-50">
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            {rescoring ? "Puanlanıyor…" : "Mevcut adayları yeniden puanla"}
          </button>
          {metaStatus && <span className={`text-[11px] ${metaStatus.ok ? "text-on-surface-variant" : "text-error"}`}>{metaStatus.text}</span>}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-medium flex items-center justify-between gap-3">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")} className="text-xs opacity-70 hover:opacity-100">Kapat</button>
        </div>
      )}

      {statusNotice && (
        <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">info</span>
            <span>{statusNotice}</span>
          </div>
          <button onClick={() => setStatusNotice("")} className="text-xs opacity-70 hover:opacity-100">Kapat</button>
        </div>
      )}

      {/* Top Action Forms: Aday Ekle & Keşif Çalıştır */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form 1: Manuel Aday Ekle */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/15 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">person_add</span>
            <h3 className="font-headline font-bold text-sm text-on-surface">Yeni Aday Ekle</h3>
          </div>
          <form onSubmit={handleAddProspect} className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-outline mb-1">Platform</label>
                <select
                  value={addPlatform}
                  onChange={e => setAddPlatform(e.target.value as Prospect["platform"])}
                  className="w-full bg-surface-container-low text-xs text-on-surface rounded-xl px-3 py-2 border border-outline-variant/30 focus:outline-none focus:border-primary"
                >
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="youtube">YouTube</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-outline mb-1">Kullanıcı Adı / Handle (*)</label>
                <input
                  type="text"
                  placeholder="@kullanici_adi"
                  value={addHandle}
                  onChange={e => setAddHandle(e.target.value)}
                  className="w-full bg-surface-container-low text-xs text-on-surface rounded-xl px-3 py-2 border border-outline-variant/30 focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-outline mb-1">Ad Soyad / Kanal Unvanı</label>
              <input
                type="text"
                placeholder="Örn: Ayşe Yılmaz | İslami Yaşam"
                value={addName}
                onChange={e => setAddName(e.target.value)}
                className="w-full bg-surface-container-low text-xs text-on-surface rounded-xl px-3 py-2 border border-outline-variant/30 focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-outline mb-1">Başlangıç Notu</label>
              <input
                type="text"
                placeholder="Örn: Hanım umresi için değerlendirilecek"
                value={addNote}
                onChange={e => setAddNote(e.target.value)}
                className="w-full bg-surface-container-low text-xs text-on-surface rounded-xl px-3 py-2 border border-outline-variant/30 focus:outline-none focus:border-primary"
              />
            </div>
            <button
              type="submit"
              disabled={addLoading}
              className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>{addLoading ? "Ekleniyor..." : "Adayı Havuza Ekle"}</span>
            </button>
          </form>
        </div>

        {/* Form 2: Otomatik Keşif Çalıştır */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/15 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-outline-variant/10 pb-3">
            <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
            <h3 className="font-headline font-bold text-sm text-on-surface">Otomatik Keşif Çalıştır</h3>
          </div>
          <form onSubmit={handleDiscover} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-outline mb-1">Keşif Sorgusu / Hedef Kelime (*)</label>
              <input
                type="text"
                placeholder="Örn: tesettür modası yapan, aile ve gezi içerikli kadın influencerlar"
                value={discoverQuery}
                onChange={e => setDiscoverQuery(e.target.value)}
                className="w-full bg-surface-container-low text-xs text-on-surface rounded-xl px-3 py-2 border border-outline-variant/30 focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-outline mb-1">Yöntem</label>
              <select
                value={discoverMode}
                onChange={e => setDiscoverMode(e.target.value as "ai" | "google")}
                className="w-full bg-surface-container-low text-xs text-on-surface rounded-xl px-3 py-2 border border-outline-variant/30 focus:outline-none focus:border-primary"
              >
                <option value="ai">Influencer araştırması (önerilen)</option>
                <option value="google">Google profil taraması</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-outline mb-1">Hedef Platform</label>
              <select
                value={discoverPlatform}
                onChange={e => setDiscoverPlatform(e.target.value as Prospect["platform"])}
                className="w-full bg-surface-container-low text-xs text-on-surface rounded-xl px-3 py-2 border border-outline-variant/30 focus:outline-none focus:border-primary"
              >
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>
            <p className="text-[11px] text-outline leading-relaxed">
              Influencer araştırması: Claude bir influencer pazarlamacısı gibi web'de araştırıp en fazla 25 hesap önerir (acente, firma, klasik hoca ve sayfa hesapları hariç). Her öneri Instagram'dan gerçek sayılarla doğrulanır; 20 binin altındaki ve okunamayan hesaplar eklenmez. 1–2 dakika sürer, Claude bütçesinden araştırma başına yaklaşık 0,5–1 $ harcar.
            </p>
            <button
              type="submit"
              disabled={discoverLoading}
              className="w-full py-2.5 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-[16px]">manage_search</span>
              <span>{discoverLoading ? "Keşif Taranıyor..." : "Keşif Başlat"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Filter Bar & Stage Tabs */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/15 shadow-sm space-y-4">
        {/* Stage Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-outline-variant/10">
          {STAGES.map(s => {
            const count = getStageCounts(s.key);
            const isActive = activeStage === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActiveStage(s.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? "bg-primary text-white font-semibold shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                <span>{s.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-surface-container-high text-outline"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & MinScore controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Adaylarda ara (ad, handle, not)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low text-xs text-on-surface rounded-xl pl-9 pr-3 py-2 border border-outline-variant/20 focus:outline-none focus:border-primary"
            />
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-outline whitespace-nowrap">Min. Uygunluk Puanı:</span>
            <select
              value={minScore}
              onChange={e => setMinScore(Number(e.target.value))}
              className="bg-surface-container-low text-xs text-on-surface rounded-xl px-3 py-2 border border-outline-variant/20 focus:outline-none"
            >
              <option value={0}>Tüm Puanlar</option>
              <option value={50}>50+ Puan</option>
              <option value={70}>70+ Puan (Öncelikli)</option>
              <option value={85}>85+ Puan (Mükemmel)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-outline flex items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin">refresh</span>
            <span>Adaylar yükleniyor...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-outline space-y-2">
            <span className="material-symbols-outlined text-[36px] text-outline/50">person_off</span>
            <p>Seçilen kriterlere uygun influencer adayı bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container-low/50 text-outline border-b border-outline-variant/15 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Hesap</th>
                  <th className="py-3 px-4">Takipçi</th>
                  <th className="py-3 px-4">Ort. İzlenme</th>
                  <th className="py-3 px-4">Etkileşim %</th>
                  <th className="py-3 px-4">Son Paylaşım</th>
                  <th className="py-3 px-4 text-center">Dindar Kitle</th>
                  <th className="py-3 px-4 text-center">Uygunluk Puanı</th>
                  <th className="py-3 px-4 text-center">Aşama</th>
                  <th className="py-3 px-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredItems.map(p => (
                  <tr key={p.id} className="hover:bg-surface-container-low/30 transition-colors">
                    {/* Account */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                          {p.platform === "instagram" && <span className="material-symbols-outlined text-[18px]">photo_camera</span>}
                          {p.platform === "tiktok" && <span className="material-symbols-outlined text-[18px]">music_note</span>}
                          {p.platform === "youtube" && <span className="material-symbols-outlined text-[18px]">play_circle</span>}
                        </div>
                        <div>
                          <Link
                            href={`/admin/influencer-adaylari/${p.id}`}
                            className="font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-1"
                          >
                            <span>@{p.handle}</span>
                            <span className="material-symbols-outlined text-[14px] text-outline">arrow_forward</span>
                          </Link>
                          <p className="text-[11px] text-outline truncate max-w-[160px]">{p.metricsError ? "Ölçüm alınamadı" : p.name}</p>
                        </div>
                      </div>
                    </td>

                    {/* Followers */}
                    <td className="py-3.5 px-4 font-semibold text-on-surface">
                      {formatNumber(p.followers)}
                    </td>

                    {/* Avg Views */}
                    <td className="py-3.5 px-4 text-on-surface-variant">
                      {formatNumber(p.avgViews)}
                    </td>

                    {/* Engagement Rate */}
                    <td className="py-3.5 px-4 font-medium text-on-surface">
                      {p.engagementRate != null ? `%${p.engagementRate.toLocaleString("tr-TR")}` : "-"}
                    </td>

                    {/* Last Post */}
                    <td className="py-3.5 px-4 text-outline text-[11px]">
                      {p.lastPostAt ? new Date(p.lastPostAt).toLocaleDateString("tr-TR") : "-"}
                    </td>

                    {/* Religious Audience */}
                    <td className="py-3.5 px-4 text-center">
                      {p.religiousAudience === true && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                          Evet
                        </span>
                      )}
                      {p.religiousAudience === false && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-container-high text-outline">
                          Hayır
                        </span>
                      )}
                      {p.religiousAudience === null && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-container-low text-outline">
                          Bilinmiyor
                        </span>
                      )}
                    </td>

                    {/* Fit Score */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-xl text-xs ${getScoreBadgeClass(p.fitScore)}`}>
                        {p.fitScore !== null ? `${p.fitScore} / 100` : "-"}
                      </span>
                    </td>

                    {/* Stage */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-xl text-[11px] capitalize ${getStageBadgeClass(p.stage)}`}>
                        {STAGES.find(s => s.key === p.stage)?.label || p.stage}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/influencer-adaylari/${p.id}`}
                        className="px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-semibold text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <span>Detay</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
