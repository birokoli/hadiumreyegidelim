"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DEFAULT_EYLUL_CAMPAIGN, EylulCampaignConfig } from "@/lib/eylul-campaign";

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#003781] focus:ring-2 focus:ring-[#003781]/10";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500";

function Field({ label, value, onChange, rows, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; rows?: number; type?: string; required?: boolean }) {
  return <label><span className={labelClass}>{label}</span>{rows ? <textarea className={inputClass} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} required={required} /> : <input className={inputClass} type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} />}</label>;
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"><h2 className="text-lg font-bold text-slate-900">{title}</h2>{description && <p className="mt-1 mb-5 text-sm text-slate-500">{description}</p>}{!description && <div className="mb-5" />}{children}</section>;
}

export default function AdsAdminPage() {
  const [form, setForm] = useState<EylulCampaignConfig>(DEFAULT_EYLUL_CAMPAIGN);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeAdTab, setActiveAdTab] = useState<1 | 2 | 3>(1);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/eylul-campaign", { cache: "no-store" })
      .then(async (res) => { if (!res.ok) throw new Error("ADS sayfası bilgileri alınamadı."); return res.json(); })
      .then(setForm)
      .catch((error) => setMessage({ ok: false, text: error.message }))
      .finally(() => setLoading(false));
  }, []);

  const setField = <K extends keyof EylulCampaignConfig>(key: K, value: EylulCampaignConfig[K]) => setForm((current) => ({ ...current, [key]: value }));
  const setPackage = (index: number, key: keyof EylulCampaignConfig["packages"][number], value: string) => setForm((current) => ({ ...current, packages: current.packages.map((item, i) => i === index ? { ...item, [key]: value } : item) }));
  const setIncluded = (index: number, key: keyof EylulCampaignConfig["includedItems"][number], value: string) => setForm((current) => ({ ...current, includedItems: current.includedItems.map((item, i) => i === index ? { ...item, [key]: value } : item) }));
  const setFaq = (index: number, key: keyof EylulCampaignConfig["faqs"][number], value: string) => setForm((current) => ({ ...current, faqs: current.faqs.map((item, i) => i === index ? { ...item, [key]: value } : item) }));

  const addIncluded = () => setField("includedItems", [...form.includedItems, { icon: "check_circle", label: "Yeni hizmet", detail: "Pakete dahil" }]);
  const addFaq = () => setField("faqs", [...form.faqs, { q: "Yeni soru", a: "Cevabı buraya yazın." }]);

  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setMessage(null);
    try {
      const res = await fetch("/api/admin/eylul-campaign", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ADS sayfası kaydedilemedi.");
      setForm(data.config); setMessage({ ok: true, text: "ADS sayfası kaydedildi ve canlı içerik güncellendi." });
    } catch (error) { setMessage({ ok: false, text: error instanceof Error ? error.message : "Bir hata oluştu." }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-8 text-slate-500">ADS sayfası yükleniyor...</div>;

  return <div className="mx-auto max-w-6xl p-5 md:p-8">
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Reklam Yönetimi</p><h1 className="text-2xl font-bold text-slate-900">ADS Sayfası</h1><p className="mt-2 text-sm text-slate-500">Reklam sayfası ve ana sayfadaki kampanya bandının tüm içeriklerini buradan yönetin.</p></div>
      <Link href="/eylul-umresi" target="_blank" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#003781] hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]">open_in_new</span>Canlı Sayfayı Aç</Link>
    </div>

    <div className="mb-6 grid gap-3 md:grid-cols-3" role="tablist" aria-label="Reklam grupları">
      {([
        { id: 1 as const, label: "1. Reklam", title: "Eylül Grup Umresi", icon: "calendar_month" },
        { id: 2 as const, label: "2. Reklam", title: "İlk Umrem Kampanyası", icon: "mosque" },
        { id: 3 as const, label: "3. Reklam", title: "Hanım Umresi Kampanyası", icon: "diversity_1" },
      ]).map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeAdTab === tab.id}
          onClick={() => { setActiveAdTab(tab.id); setMessage(null); }}
          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${activeAdTab === tab.id ? "border-[#003781] bg-[#003781] text-white shadow-lg" : "border-slate-200 bg-white text-slate-700 hover:border-[#003781]/30 hover:bg-slate-50"}`}
        >
          <span className={`material-symbols-outlined text-[24px] ${activeAdTab === tab.id ? "text-[#FFD166]" : "text-[#003781]"}`} style={{ fontVariationSettings: "'FILL' 1" }}>{tab.icon}</span>
          <span><span className={`block text-[10px] font-bold uppercase tracking-widest ${activeAdTab === tab.id ? "text-white/60" : "text-slate-400"}`}>{tab.label}</span><span className="mt-1 block text-sm font-bold">{tab.title}</span></span>
        </button>
      ))}
    </div>

    <form onSubmit={save} className="space-y-6">
      {activeAdTab === 1 && <>
      <Section title="SEO Ayarları" description="Google arama sonuçlarında görünen başlık ve açıklama."><div className="grid gap-5"><Field label="SEO Başlığı" value={form.seoTitle} onChange={(v) => setField("seoTitle", v)} /><Field label="SEO Açıklaması" rows={3} value={form.seoDescription} onChange={(v) => setField("seoDescription", v)} /></div></Section>

      <Section title="Kapak Alanı" description="Sayfanın en üstündeki ana reklam alanının bütün içerikleri.">
        <div className="grid gap-5 md:grid-cols-2"><Field label="Kapak Görseli URL" value={form.heroImage} onChange={(v) => setField("heroImage", v)} /><Field label="Üst Rozet Metni" value={form.badgeText} onChange={(v) => setField("badgeText", v)} /><Field label="Ana Başlık" value={form.title} onChange={(v) => setField("title", v)} /><Field label="Sarı Vurgulu Başlık" value={form.highlightedTitle} onChange={(v) => setField("highlightedTitle", v)} /><Field label="Başlangıç Fiyatı" value={form.startingPrice} onChange={(v) => setField("startingPrice", v)} /><Field label="Fiyat Yanı Metni" value={form.priceSuffix} onChange={(v) => setField("priceSuffix", v)} /><Field label="Tarih / Süre Satırı" value={form.dateSummary} onChange={(v) => setField("dateSummary", v)} /><Field label="Kapak Alt Notu" value={form.heroNote} onChange={(v) => setField("heroNote", v)} /><Field label="WhatsApp Butonu" value={form.heroButton} onChange={(v) => setField("heroButton", v)} /><Field label="WhatsApp Hazır Mesajı" value={form.whatsappMessage} onChange={(v) => setField("whatsappMessage", v)} /></div>
      </Section>

      <Section title="Çıkış Tarihleri ve Kontenjan"><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"><Field label="1. Çıkış Etiketi" value={form.departureOneLabel} onChange={(v) => setField("departureOneLabel", v)} /><Field label="1. Çıkış Tarihi" value={form.departureOne} onChange={(v) => setField("departureOne", v)} /><Field label="2. Çıkış Etiketi" value={form.departureTwoLabel} onChange={(v) => setField("departureTwoLabel", v)} /><Field label="2. Çıkış Tarihi" value={form.departureTwo} onChange={(v) => setField("departureTwo", v)} /><Field label="Toplam Kontenjan" type="number" value={form.capacity} onChange={(v) => setField("capacity", v)} /><Field label="Yer Ayır Butonu" value={form.reserveButton} onChange={(v) => setField("reserveButton", v)} /></div></Section>

      <Section title="Yetişkin Fiyatları"><div className="grid gap-5 md:grid-cols-2"><Field label="Bölüm Üst Etiketi" value={form.packagesKicker} onChange={(v) => setField("packagesKicker", v)} /><Field label="Bölüm Başlığı" value={form.packagesTitle} onChange={(v) => setField("packagesTitle", v)} /><Field label="2 Kişilik Oda Etiketi" value={form.roomDoubleLabel} onChange={(v) => setField("roomDoubleLabel", v)} /><Field label="3 Kişilik Oda Etiketi" value={form.roomTripleLabel} onChange={(v) => setField("roomTripleLabel", v)} /><Field label="4 Kişilik Oda Etiketi" value={form.roomQuadLabel} onChange={(v) => setField("roomQuadLabel", v)} /><Field label="Bölüm Butonu" value={form.packagesButton} onChange={(v) => setField("packagesButton", v)} /></div><div className="mt-6 space-y-4">{form.packages.map((item, index) => <div key={index} className="grid gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-4"><Field label="Program" value={item.days} onChange={(v) => setPackage(index, "days", v)} /><Field label="2 Kişilik" value={item.double} onChange={(v) => setPackage(index, "double", v)} /><Field label="3 Kişilik" value={item.triple} onChange={(v) => setPackage(index, "triple", v)} /><Field label="4 Kişilik" value={item.quad} onChange={(v) => setPackage(index, "quad", v)} /></div>)}</div></Section>

      <Section title="Çocuk Fiyatları"><div className="grid gap-5 md:grid-cols-2"><Field label="Bölüm Üst Etiketi" value={form.childKicker} onChange={(v) => setField("childKicker", v)} /><Field label="Bölüm Başlığı" value={form.childTitle} onChange={(v) => setField("childTitle", v)} /><Field label="1. Çocuk Grubu Etiketi" value={form.childTwoToElevenLabel} onChange={(v) => setField("childTwoToElevenLabel", v)} /><Field label="1. Çocuk Grubu Fiyatı" value={form.childTwoToEleven} onChange={(v) => setField("childTwoToEleven", v)} /><Field label="2. Çocuk Grubu Etiketi" value={form.childZeroToTwoLabel} onChange={(v) => setField("childZeroToTwoLabel", v)} /><Field label="2. Çocuk Grubu Fiyatı" value={form.childZeroToTwo} onChange={(v) => setField("childZeroToTwo", v)} /></div></Section>

      <Section title="Pakete Dahil Hizmetler" description="İkon alanında Material Symbols ikon adları kullanılır: flight, badge, hotel, mosque gibi."><div className="grid gap-5 md:grid-cols-2"><Field label="Bölüm Üst Etiketi" value={form.includedKicker} onChange={(v) => setField("includedKicker", v)} /><Field label="Bölüm Başlığı" value={form.includedTitle} onChange={(v) => setField("includedTitle", v)} /><Field label="Genel Otel Bilgisi" value={form.hotelDetail} onChange={(v) => setField("hotelDetail", v)} /></div><div className="mt-6 space-y-4">{form.includedItems.map((item, index) => <div key={index} className="grid gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-[140px_1fr_1fr_auto]"><Field label="İkon" value={item.icon} onChange={(v) => setIncluded(index, "icon", v)} /><Field label="Hizmet Adı" value={item.label} onChange={(v) => setIncluded(index, "label", v)} /><Field label="Alt Açıklama" value={item.detail} onChange={(v) => setIncluded(index, "detail", v)} /><button type="button" onClick={() => setField("includedItems", form.includedItems.filter((_, i) => i !== index))} className="mt-6 h-11 rounded-xl px-3 text-red-500 hover:bg-red-50" aria-label="Hizmeti sil"><span className="material-symbols-outlined">delete</span></button></div>)}</div><button type="button" onClick={addIncluded} className="mt-4 rounded-xl border border-dashed border-[#003781]/30 px-5 py-3 text-sm font-bold text-[#003781] hover:bg-[#003781]/5">+ Hizmet Ekle</button></Section>

      <Section title="Bilgi Notları"><div className="grid gap-5 md:grid-cols-2"><Field label="Bölüm Başlığı" value={form.notesTitle} onChange={(v) => setField("notesTitle", v)} /><Field label="Bölüm Butonu" value={form.notesButton} onChange={(v) => setField("notesButton", v)} /></div><label className="mt-5 block"><span className={labelClass}>Notlar — Her Satıra Bir Not</span><textarea className={inputClass} rows={6} value={form.notes.join("\n")} onChange={(e) => setField("notes", e.target.value.split("\n"))} /></label></Section>

      <Section title="Sıkça Sorulan Sorular"><div className="grid gap-5 md:grid-cols-3"><Field label="Bölüm Üst Etiketi" value={form.faqKicker} onChange={(v) => setField("faqKicker", v)} /><Field label="Bölüm Başlığı" value={form.faqTitle} onChange={(v) => setField("faqTitle", v)} /><Field label="Bölüm Butonu" value={form.faqButton} onChange={(v) => setField("faqButton", v)} /></div><div className="mt-6 space-y-4">{form.faqs.map((faq, index) => <div key={index} className="rounded-xl bg-slate-50 p-4"><div className="grid gap-4 md:grid-cols-[1fr_auto]"><Field label={`Soru ${index + 1}`} value={faq.q} onChange={(v) => setFaq(index, "q", v)} /><button type="button" onClick={() => setField("faqs", form.faqs.filter((_, i) => i !== index))} className="mt-6 h-11 rounded-xl px-3 text-red-500 hover:bg-red-50"><span className="material-symbols-outlined">delete</span></button></div><div className="mt-4"><Field label="Cevap" rows={3} value={faq.a} onChange={(v) => setFaq(index, "a", v)} /></div></div>)}</div><button type="button" onClick={addFaq} className="mt-4 rounded-xl border border-dashed border-[#003781]/30 px-5 py-3 text-sm font-bold text-[#003781] hover:bg-[#003781]/5">+ Soru Ekle</button></Section>

      <Section title="Sayfa Sonu Çağrı Alanı"><div className="grid gap-5 md:grid-cols-2"><Field label="Arka Plan Görseli URL" value={form.footerImage} onChange={(v) => setField("footerImage", v)} /><Field label="Başlık" value={form.footerTitle} onChange={(v) => setField("footerTitle", v)} /><Field label="Açıklama" value={form.footerDescription} onChange={(v) => setField("footerDescription", v)} /><Field label="Alt Not" value={form.footerNote} onChange={(v) => setField("footerNote", v)} /><Field label="Buton" value={form.footerButton} onChange={(v) => setField("footerButton", v)} /></div></Section>

      <Section title="Ana Sayfa Reklam Bandı" description="Ana sayfadaki koyu renkli kampanya reklamının bütün metinleri."><div className="grid gap-5 md:grid-cols-2"><Field label="Rozet Metni" value={form.homeBadge} onChange={(v) => setField("homeBadge", v)} /><Field label="Başlık" value={form.homeTitle} onChange={(v) => setField("homeTitle", v)} /><Field label="Açıklama" rows={3} value={form.homeDescription} onChange={(v) => setField("homeDescription", v)} /><Field label="Buton" value={form.homeButton} onChange={(v) => setField("homeButton", v)} /></div><label className="mt-5 block"><span className={labelClass}>Mini Özellikler — Her Satıra Bir Özellik</span><textarea className={inputClass} rows={6} value={form.homeFeatures.join("\n")} onChange={(e) => setField("homeFeatures", e.target.value.split("\n"))} /></label></Section>
      </>}

      {activeAdTab === 2 && <>
      <Section title="Hazır Program CTA — İlk Umrem" description="Ana sayfadaki Adım Adım Yolculuk bölümünden hemen sonra gösterilir."><div className="grid gap-5 md:grid-cols-2"><Field label="Üst Etiket" value={form.readyCtaKicker} onChange={(v) => setField("readyCtaKicker", v)} /><Field label="Başlık" value={form.readyCtaTitle} onChange={(v) => setField("readyCtaTitle", v)} /><Field label="Açıklama" rows={3} value={form.readyCtaDescription} onChange={(v) => setField("readyCtaDescription", v)} /><Field label="Alt Not" value={form.readyCtaNote} onChange={(v) => setField("readyCtaNote", v)} /><Field label="Buton" value={form.readyCtaButton} onChange={(v) => setField("readyCtaButton", v)} /><Field label="Görsel URL" value={form.readyCtaImage} onChange={(v) => setField("readyCtaImage", v)} /><Field label="WhatsApp Hazır Mesajı" rows={3} value={form.readyCtaWhatsappMessage} onChange={(v) => setField("readyCtaWhatsappMessage", v)} /></div></Section>
      </>}

      {activeAdTab === 3 && <>
      <Section title="Footer Öncesi Son ADS — Hanım Umresi" description="Ana sayfadaki SSS bölümünün altında, footer'dan hemen önce gösterilir."><div className="grid gap-5 md:grid-cols-2"><Field label="Rozet Metni" value={form.finalAdsBadge} onChange={(v) => setField("finalAdsBadge", v)} /><Field label="Başlık" value={form.finalAdsTitle} onChange={(v) => setField("finalAdsTitle", v)} /><Field label="Açıklama" rows={3} value={form.finalAdsDescription} onChange={(v) => setField("finalAdsDescription", v)} /><Field label="Alt Not" value={form.finalAdsNote} onChange={(v) => setField("finalAdsNote", v)} /><Field label="Buton" value={form.finalAdsButton} onChange={(v) => setField("finalAdsButton", v)} /><Field label="Görsel URL" value={form.finalAdsImage} onChange={(v) => setField("finalAdsImage", v)} /><Field label="WhatsApp Hazır Mesajı" rows={3} value={form.finalAdsWhatsappMessage} onChange={(v) => setField("finalAdsWhatsappMessage", v)} /></div></Section>
      </>}

      <div className="sticky bottom-4 flex flex-col items-stretch gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between"><div>{message && <p className={`text-sm font-bold ${message.ok ? "text-emerald-600" : "text-red-600"}`}>{message.text}</p>}</div><button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003781] px-7 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#002b66] disabled:opacity-60"><span className={`material-symbols-outlined text-[19px] ${saving ? "animate-spin" : ""}`}>{saving ? "progress_activity" : "save"}</span>{saving ? "Kaydediliyor..." : "ADS Sayfasını Kaydet"}</button></div>
    </form>
  </div>;
}
