"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DEFAULT_EYLUL_CAMPAIGN, DEFAULT_HANIM_UMRESI_CAMPAIGN, DEFAULT_ILK_UMREM_CAMPAIGN, EylulCampaignConfig } from "@/lib/eylul-campaign";

type AdsConfig = { ad1: EylulCampaignConfig; ad2: EylulCampaignConfig; ad3: EylulCampaignConfig };

const inputClass = "w-full rounded-lg border border-outline-variant/25 bg-surface-container-lowest px-3 py-2 text-xs text-on-surface outline-none focus:border-primary/40";
const labelClass = "mb-1 block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant";

function Field({ label, value, onChange, rows, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; rows?: number; type?: string; required?: boolean }) {
  return (
    <label>
      <span className={labelClass}>{label}</span>
      {rows ? (
        <textarea className={inputClass} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
      ) : (
        <input className={inputClass} type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
      )}
    </label>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-outline-variant/15 bg-surface-container-lowest p-6 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-on-surface-variant">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function AdsAdminPage() {
  const [ads, setAds] = useState<AdsConfig>({ ad1: DEFAULT_EYLUL_CAMPAIGN, ad2: DEFAULT_ILK_UMREM_CAMPAIGN, ad3: DEFAULT_HANIM_UMRESI_CAMPAIGN });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeAdTab, setActiveAdTab] = useState<1 | 2 | 3>(1);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/eylul-campaign", { cache: "no-store" })
      .then(async (res) => { if (!res.ok) throw new Error("ADS sayfası bilgileri alınamadı."); return res.json(); })
      .then(setAds)
      .catch((error) => setMessage({ ok: false, text: error.message }))
      .finally(() => setLoading(false));
  }, []);

  const activeKey = `ad${activeAdTab}` as keyof AdsConfig;
  const form = ads[activeKey];
  const updateForm = (updater: (current: EylulCampaignConfig) => EylulCampaignConfig) => setAds((current) => ({ ...current, [activeKey]: updater(current[activeKey]) }));
  const setField = <K extends keyof EylulCampaignConfig>(key: K, value: EylulCampaignConfig[K]) => updateForm((current) => ({ ...current, [key]: value }));
  const setPackage = (index: number, key: keyof EylulCampaignConfig["packages"][number], value: string) => updateForm((current) => ({ ...current, packages: current.packages.map((item, i) => i === index ? { ...item, [key]: value } : item) }));
  const setIncluded = (index: number, key: keyof EylulCampaignConfig["includedItems"][number], value: string) => updateForm((current) => ({ ...current, includedItems: current.includedItems.map((item, i) => i === index ? { ...item, [key]: value } : item) }));
  const setFaq = (index: number, key: keyof EylulCampaignConfig["faqs"][number], value: string) => updateForm((current) => ({ ...current, faqs: current.faqs.map((item, i) => i === index ? { ...item, [key]: value } : item) }));

  const addIncluded = () => setField("includedItems", [...form.includedItems, { icon: "check_circle", label: "Yeni hizmet", detail: "Pakete dahil" }]);
  const addFaq = () => setField("faqs", [...form.faqs, { q: "Yeni soru", a: "Cevabı buraya yazın." }]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage(null);
    try {
      const res = await fetch("/api/admin/eylul-campaign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ads) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ADS sayfası kaydedilemedi.");
      setAds(data.configs); setMessage({ ok: true, text: "Kayıt tamamlandı." });
    } catch (error) { setMessage({ ok: false, text: error instanceof Error ? error.message : "Bir hata oluştu." }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-8 max-w-7xl mx-auto min-h-screen bg-surface text-on-surface-variant text-xs">ADS sayfası yükleniyor...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 min-h-screen bg-surface text-on-surface text-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/15">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-secondary uppercase">PAZARLAMA</span>
          <h1 className="font-headline text-2xl font-bold tracking-tight text-primary mt-1">ADS Sayfası Yönetimi</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">Reklam sayfaları ve kampanya bandı içeriklerini yönetin.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={activeAdTab === 1 ? "/eylul-umresi" : activeAdTab === 2 ? "/ilk-umrem" : "/hanim-umresi"}
            target="_blank"
            className="inline-flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant/25 text-primary hover:border-primary/40 font-bold px-4 py-2.5 rounded-xl text-xs transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            <span>Canlı Sayfayı Aç</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid gap-3 md:grid-cols-3">
        {([
          { id: 1 as const, label: "1. REKLAM", title: "Eylül Grup Umresi" },
          { id: 2 as const, label: "2. REKLAM", title: "İlk Umrem Kampanyası" },
          { id: 3 as const, label: "3. REKLAM", title: "Hanım Umresi Kampanyası" },
        ]).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setActiveAdTab(tab.id); setMessage(null); }}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeAdTab === tab.id
                ? "border-primary bg-primary text-white shadow-sm"
                : "border-outline-variant/25 bg-surface-container-lowest text-on-surface-variant hover:border-primary/40"
            }`}
          >
            <span className="block text-[10px] font-bold uppercase tracking-widest opacity-60">{tab.label}</span>
            <span className="mt-1 block text-xs font-bold">{tab.title}</span>
          </button>
        ))}
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-xs font-medium ${message.ok ? "bg-secondary/10 text-secondary border border-secondary/25" : "bg-error/10 text-error border border-error/25"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={save} className="space-y-6">
        <Section title="SEO Ayarları" description="Google arama sonuçlarında görünen başlık ve açıklama.">
          <div className="grid gap-4">
            <Field label="SEO Başlığı" value={form.seoTitle} onChange={(v) => setField("seoTitle", v)} />
            <Field label="SEO Açıklaması" rows={3} value={form.seoDescription} onChange={(v) => setField("seoDescription", v)} />
          </div>
        </Section>

        <Section title="Kapak Alanı" description="Ana reklam alanı içerikleri.">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Kapak Görseli URL" value={form.heroImage} onChange={(v) => setField("heroImage", v)} />
            <Field label="Üst Rozet Metni" value={form.badgeText} onChange={(v) => setField("badgeText", v)} />
            <Field label="Ana Başlık" value={form.title} onChange={(v) => setField("title", v)} />
            <Field label="Sarı Vurgulu Başlık" value={form.highlightedTitle} onChange={(v) => setField("highlightedTitle", v)} />
            <Field label="Başlangıç Fiyatı" value={form.startingPrice} onChange={(v) => setField("startingPrice", v)} />
            <Field label="Fiyat Yanı Metni" value={form.priceSuffix} onChange={(v) => setField("priceSuffix", v)} />
            <Field label="Tarih / Süre Satırı" value={form.dateSummary} onChange={(v) => setField("dateSummary", v)} />
            <Field label="Kapak Alt Notu" value={form.heroNote} onChange={(v) => setField("heroNote", v)} />
            <Field label="WhatsApp Butonu" value={form.heroButton} onChange={(v) => setField("heroButton", v)} />
            <Field label="WhatsApp Hazır Mesajı" value={form.whatsappMessage} onChange={(v) => setField("whatsappMessage", v)} />
          </div>
        </Section>

        <Section title="Çıkış Tarihleri ve Kontenjan">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="1. Çıkış Tarihi" value={form.departureOne} onChange={(v) => setField("departureOne", v)} />
            <Field label="2. Çıkış Tarihi" value={form.departureTwo} onChange={(v) => setField("departureTwo", v)} />
            <Field label="Toplam Kontenjan" value={form.capacity} onChange={(v) => setField("capacity", v)} />
          </div>
        </Section>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary hover:bg-primary-container text-white font-bold rounded-xl text-xs transition-all active:scale-95"
          >
            {saving ? "Kaydediliyor..." : "ADS Sayfasını Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
