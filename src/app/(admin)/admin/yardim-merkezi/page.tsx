"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { SUBJECTS } from "@/lib/help";
import { parseFaq, serializeFaq } from "@/lib/page-texts/faq";
import type { FaqItem } from "@/components/help/FaqBrowser";
import { PAGE_TEXTS } from "@/lib/page-texts/registry";

import HubTabs from "@/components/admin/HubTabs";

type Lead = {
  id: string;
  name: string;
  phone: string;
  package: string | null;
  message: string | null;
  status: string;
  createdAt: string;
};

const HELP_PAGES = [
  {
    id: "sss",
    title: "Sıkça Sorulan Sorular",
    path: "/sss",
    desc: "Umre planlama, vize, ödeme ve iptal süreçlerine dair tüm SSS başlıkları.",
  },
  {
    id: "iletisim",
    title: "İletişim & Destek",
    path: "/iletisim",
    desc: "Müşterilerin talep formu doldurduğu ve çağrı merkezi bilgilerinin yer aldığı destek sayfası.",
  },
  {
    id: "grup-talepleri",
    title: "Grup Talepleri",
    path: "/grup-talepleri",
    desc: "Aile ve kalabalık gruplara özel umre organizasyonu başvuru sayfası.",
  },
  {
    id: "isletme-kaydi",
    title: "İşletme Kaydı & İş Ortaklığı",
    path: "/isletme-kaydi",
    desc: "Otel, transfer ve rehberlik sağlayıcıları için kurumsal başvuru sayfası.",
  },
];

export default function YardimMerkeziAdminPage() {
  // SSS düzenleyici state'leri
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [sssMeta, setSssMeta] = useState({ kicker: "", title: "", lead: "" });
  const [loadingText, setLoadingText] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // SSS arama ve kategori filtreleri
  const [catFilter, setCatFilter] = useState("Tümü");
  const [searchQuery, setSearchQuery] = useState("");
  const [customCatInputs, setCustomCatInputs] = useState<Record<number, string>>({});

  // Gelen talepler state'leri
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [leadsError, setLeadsError] = useState("");

  // Sayfa metinlerini yükleme (GET /api/admin/page-texts)
  const fetchPageTexts = useCallback(async () => {
    setLoadingText(true);
    try {
      const res = await fetch("/api/admin/page-texts");
      if (!res.ok) throw new Error("Sayfa metinleri alınamadı.");
      const data = await res.json();
      const sssDef = PAGE_TEXTS.find((p) => p.id === "sss");
      const sssValues = data.values?.sss || {};

      const kicker = sssValues.kicker || sssDef?.fields.find((f) => f.key === "kicker")?.default || "Sıkça sorulan sorular";
      const title = sssValues.title || sssDef?.fields.find((f) => f.key === "title")?.default || "Aklınızdaki sorular.";
      const lead = sssValues.lead || sssDef?.fields.find((f) => f.key === "lead")?.default || "Umre planlama, vize, ödeme ve rezervasyon süreçleriyle ilgili en çok sorulan soruların cevapları.";
      const rawItems = sssValues.items || sssDef?.fields.find((f) => f.key === "items")?.default || "";

      setSssMeta({ kicker, title, lead });
      setFaqItems(parseFaq(rawItems));
      setIsDirty(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setNotice({ type: "error", text: message || "SSS yüklenirken hata oluştu." });
    } finally {
      setLoadingText(false);
    }
  }, []);

  // Talepleri yükleme (GET /api/admin/contact)
  const fetchLeads = useCallback(async () => {
    setLoadingLeads(true);
    setLeadsError("");
    try {
      const res = await fetch("/api/admin/contact");
      if (!res.ok) throw new Error("Talepler alınamadı.");
      const data = await res.json();
      if (Array.isArray(data)) {
        setLeads(data);
      } else {
        setLeads([]);
      }
    } catch {
      setLeadsError("Gelen talepler yüklenemedi.");
      setLeads([]);
    } finally {
      setLoadingLeads(false);
    }
  }, []);

  useEffect(() => {
    fetchPageTexts();
    fetchLeads();
  }, [fetchPageTexts, fetchLeads]);

  // Kaydedilmemiş değişiklik uyarısı
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Mevcut kategoriler listesi
  const availableCategories = useMemo(() => {
    const defaultCats = ["Umre planlama", "Vize", "Ödeme ve iptal", "Hadi Umreye Gidelim"];
    const itemCats = faqItems.map((i) => i.cat).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...itemCats]));
  }, [faqItems]);

  // SSS Öğesi Güncelleme
  const updateFaqItem = (index: number, field: keyof FaqItem, value: string) => {
    setFaqItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setIsDirty(true);
  };

  // Soru Taşıma (Yukarı / Aşağı)
  const moveFaqItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqItems.length) return;
    setFaqItems((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
    setIsDirty(true);
  };

  // Soru Silme
  const deleteFaqItem = (index: number) => {
    if (!confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;
    setFaqItems((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  // Yeni Soru Ekleme
  const addFaqItem = () => {
    const initialCat = catFilter !== "Tümü" ? catFilter : availableCategories[0] || "Umre planlama";
    setFaqItems((prev) => [...prev, { cat: initialCat, q: "", a: "" }]);
    setIsDirty(true);
  };

  // SSS Kaydetme (PUT /api/admin/page-texts)
  const handleSaveFaq = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const serialized = serializeFaq(faqItems);
      const res = await fetch("/api/admin/page-texts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: "sss",
          values: {
            kicker: sssMeta.kicker,
            title: sssMeta.title,
            lead: sssMeta.lead,
            items: serialized,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.ok === false) {
        throw new Error(data.error || "SSS kaydı başarısız oldu.");
      }

      setNotice({ type: "success", text: "SSS listesi başarıyla kaydedildi." });
      setIsDirty(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setNotice({ type: "error", text: message || "Kaydetme sırasında bir hata oluştu." });
    } finally {
      setSaving(false);
    }
  };

  // SSS Filtrelenmiş liste
  const filteredFaqItems = useMemo(() => {
    return faqItems
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ item }) => {
        if (catFilter !== "Tümü" && item.cat !== catFilter) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            item.cat.toLowerCase().includes(q) ||
            item.q.toLowerCase().includes(q) ||
            item.a.toLowerCase().includes(q)
          );
        }
        return true;
      });
  }, [faqItems, catFilter, searchQuery]);

  // Son 30 gündeki talep istatistikleri (SUBJECTS sırasıyla)
  const recentLeadsSummary = useMemo(() => {
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const recent = leads.filter((l) => new Date(l.createdAt).getTime() >= thirtyDaysAgo);

    const counts: Record<string, number> = {};
    for (const sub of SUBJECTS) {
      counts[sub] = 0;
    }

    for (const lead of recent) {
      const pkg = lead.package;
      if (pkg && (SUBJECTS as readonly string[]).includes(pkg)) {
        counts[pkg] = (counts[pkg] || 0) + 1;
      } else {
        counts["Diğer"] = (counts["Diğer"] || 0) + 1;
      }
    }

    return {
      total: recent.length,
      bySubject: SUBJECTS.map((sub) => ({
        subject: sub,
        count: counts[sub] || 0,
      })),
    };
  }, [leads]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-10 min-h-screen bg-surface text-on-surface">
      <HubTabs hub="site" />
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/15">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">İçerik Stüdyosu</span>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-1">Yardım Merkezi Komuta Masası</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            SSS sorularını düzenleyin, destek sayfalarını inceleyin ve son 30 günlük talep dağılımını takip edin.
          </p>
        </div>

        {isDirty && (
          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-xl border border-amber-500/20 text-xs font-semibold">
            <span className="material-symbols-outlined text-[16px]">warning</span>
            <span>Kaydedilmemiş değişiklikler var</span>
          </div>
        )}
      </div>

      {/* Bildirim Kutusu */}
      {notice && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            notice.type === "success"
              ? "bg-secondary/10 text-secondary border-secondary/25"
              : "bg-error/10 text-error border-error/25"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">
              {notice.type === "success" ? "check_circle" : "error"}
            </span>
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-xs opacity-70 hover:opacity-100">
            Kapat
          </button>
        </div>
      )}

      {/* Bölüm 1: SSS Düzenleyici */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline text-lg font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">quiz</span>
              <span>SSS (Sıkça Sorulan Sorular) Düzenleyici</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              `/sss` sayfasında gösterilen kategorize edilmiş soruları düzenleyin, sıralayın veya yeni soru ekleyin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={addFaqItem}
              className="inline-flex items-center gap-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold px-3.5 py-2 rounded-xl border border-outline-variant/30 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Soru Ekle</span>
            </button>

            <button
              onClick={handleSaveFaq}
              disabled={saving}
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-container text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">{saving ? "sync" : "save"}</span>
              <span>{saving ? "Kaydediliyor..." : "Kaydet"}</span>
            </button>
          </div>
        </div>

        {/* Filtre ve Arama Barı */}
        <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/15 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {["Tümü", ...availableCategories].map((cat) => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                  catFilter === cat
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:border-primary/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[16px]">
              search
            </span>
            <input
              type="text"
              placeholder="Sorularda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low text-xs text-on-surface rounded-xl pl-9 pr-3 py-2 border border-outline-variant/30 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* SSS Kartları Listesi */}
        {loadingText ? (
          <div className="p-8 text-center text-xs text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-outline-variant/15">
            SSS metinleri yükleniyor...
          </div>
        ) : filteredFaqItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-outline bg-surface-container-lowest rounded-2xl border border-outline-variant/15">
            Kriterlere uygun soru bulunamadı.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqItems.map(({ item, originalIndex }) => {
              const isCustomCat = customCatInputs[originalIndex] !== undefined;

              return (
                <div
                  key={originalIndex}
                  className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 shadow-sm space-y-4 transition-all hover:border-outline-variant/30"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/10">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-[10px] font-bold text-outline font-mono">#{originalIndex + 1}</span>

                      {/* Kategori Seçici */}
                      {!isCustomCat ? (
                        <select
                          value={availableCategories.includes(item.cat) ? item.cat : "__NEW__"}
                          onChange={(e) => {
                            if (e.target.value === "__NEW__") {
                              setCustomCatInputs((prev) => ({ ...prev, [originalIndex]: "" }));
                            } else {
                              updateFaqItem(originalIndex, "cat", e.target.value);
                            }
                          }}
                          className="bg-surface-container-low border border-outline-variant/30 text-xs font-bold text-primary rounded-lg px-2.5 py-1 focus:outline-none focus:border-primary"
                        >
                          {availableCategories.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                          <option value="__NEW__">+ Yeni Kategori Ekle...</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="Yeni kategori adı..."
                            value={customCatInputs[originalIndex]}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomCatInputs((prev) => ({ ...prev, [originalIndex]: val }));
                              updateFaqItem(originalIndex, "cat", val || "Genel");
                            }}
                            className="bg-surface-container-low border border-primary text-xs font-bold text-primary rounded-lg px-2.5 py-1 focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              setCustomCatInputs((prev) => {
                                const next = { ...prev };
                                delete next[originalIndex];
                                return next;
                              });
                            }}
                            className="text-[11px] text-outline hover:text-error underline"
                          >
                            İptal
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Aksiyon Butonları (Sıralama ve Silme) */}
                    <div className="flex items-center gap-1 self-end sm:self-auto">
                      <button
                        onClick={() => moveFaqItem(originalIndex, "up")}
                        disabled={originalIndex === 0}
                        title="Yukarı Taşı"
                        className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container-low disabled:opacity-20 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                      </button>
                      <button
                        onClick={() => moveFaqItem(originalIndex, "down")}
                        disabled={originalIndex === faqItems.length - 1}
                        title="Aşağı Taşı"
                        className="p-1.5 rounded-lg text-outline hover:text-primary hover:bg-surface-container-low disabled:opacity-20 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                      </button>
                      <div className="w-px h-4 bg-outline-variant/20 mx-1" />
                      <button
                        onClick={() => deleteFaqItem(originalIndex)}
                        title="Soruyu Sil"
                        className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-error/10 transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Soru ve Cevap Girişleri */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                        Soru
                      </label>
                      <input
                        type="text"
                        value={item.q}
                        onChange={(e) => updateFaqItem(originalIndex, "q", e.target.value)}
                        placeholder="Örn: Umre vizesi kaç günde çıkar?"
                        className="w-full bg-surface-container-low text-xs text-on-surface font-semibold rounded-xl px-3 py-2 border border-outline-variant/30 focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                        Cevap
                      </label>
                      <textarea
                        rows={3}
                        value={item.a}
                        onChange={(e) => updateFaqItem(originalIndex, "a", e.target.value)}
                        placeholder="Sorunun ayrıntılı cevabı..."
                        className="w-full bg-surface-container-low text-xs text-on-surface rounded-xl px-3 py-2 border border-outline-variant/30 focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Bölüm 2: Yardım Merkezi Sayfaları Kartları */}
      <section className="space-y-4">
        <div>
          <h2 className="font-headline text-lg font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">pages</span>
            <span>Yardım Merkezi Sayfaları</span>
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Müşteri yardım ve başvuru sayfalarının canlı görünümleri ve metin düzenleme bağlantıları.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HELP_PAGES.map((page) => (
            <div
              key={page.id}
              className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 shadow-sm flex flex-col justify-between space-y-4 hover:border-primary/30 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{page.id}</span>
                  <Link
                    href={page.path}
                    target="_blank"
                    className="text-outline hover:text-primary transition-colors flex items-center gap-0.5 text-[11px]"
                    title="Canlı Sayfayı Gör"
                  >
                    <span>Canlı Sayfa</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </Link>
                </div>
                <h3 className="font-headline font-bold text-on-surface text-sm">{page.title}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{page.desc}</p>
              </div>

              <div className="pt-2 border-t border-outline-variant/10">
                <Link
                  href="/admin/sayfa-metinleri"
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-surface-container-low hover:bg-surface-container-high text-primary text-xs font-bold py-2 rounded-xl border border-outline-variant/20 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  <span>Metinleri Düzenle</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bölüm 3: Gelen Talepler Özeti (Son 30 Gün) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-lg font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">analytics</span>
              <span>Gelen Talepler Özeti (Son 30 Gün)</span>
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              İletişim ve destek formlarından gelen son 30 günlük başvuruların konu başlıklarına göre dağılımı.
            </p>
          </div>

          <Link
            href="/admin/contact"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>Tüm Talepleri Gör</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>

        {loadingLeads ? (
          <div className="p-8 text-center text-xs text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-outline-variant/15">
            Talep istatistikleri yükleniyor...
          </div>
        ) : leadsError ? (
          <div className="p-6 text-center text-xs text-error bg-error/5 rounded-2xl border border-error/15">
            {leadsError}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentLeadsSummary.bySubject.map(({ subject, count }) => (
              <div
                key={subject}
                className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Konu</span>
                  <h4 className="font-semibold text-on-surface text-xs mt-0.5 line-clamp-2 min-h-[32px] flex items-center">
                    {subject}
                  </h4>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-outline-variant/10">
                  <span className="font-headline text-2xl font-bold text-primary">{count}</span>
                  <Link
                    href={`/admin/contact?konu=${encodeURIComponent(subject)}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-secondary hover:text-primary transition-colors"
                  >
                    <span>Talepleri Gör</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
