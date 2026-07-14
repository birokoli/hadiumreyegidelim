"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DEFAULT_EYLUL_CAMPAIGN, EylulCampaignConfig } from "@/lib/eylul-campaign";

export default function EylulUmresiAdminPage() {
  const [form, setForm] = useState<EylulCampaignConfig>(DEFAULT_EYLUL_CAMPAIGN);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/eylul-campaign", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Kampanya bilgileri alınamadı.");
        return res.json();
      })
      .then(setForm)
      .catch((error) => setMessage({ ok: false, text: error.message }))
      .finally(() => setLoading(false));
  }, []);

  const setField = <K extends keyof EylulCampaignConfig>(key: K, value: EylulCampaignConfig[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const setPackage = (index: number, key: keyof EylulCampaignConfig["packages"][number], value: string) => {
    setForm((current) => ({
      ...current,
      packages: current.packages.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/eylul-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Kampanya kaydedilemedi.");
      setForm(data.config);
      setMessage({ ok: true, text: "Kampanya kaydedildi ve canlı sayfa güncellendi." });
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Bir hata oluştu." });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#003781] focus:ring-2 focus:ring-[#003781]/10";
  const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500";

  if (loading) return <div className="p-8 text-slate-500">Kampanya bilgileri yükleniyor...</div>;

  return (
    <div className="mx-auto max-w-6xl p-5 md:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Reklam Sayfası</p>
          <h1 className="text-2xl font-bold text-slate-900">Eylül Umresi Kampanyası</h1>
          <p className="mt-2 text-sm text-slate-500">Bu alandaki değişiklikler kampanya sayfasına ve ana sayfa reklam bandına yansır.</p>
        </div>
        <Link href="/eylul-umresi" target="_blank" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-[#003781] hover:bg-slate-50">
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          Canlı Sayfayı Aç
        </Link>
      </div>

      <form onSubmit={save} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <h2 className="mb-5 text-lg font-bold text-slate-900">Başlık, Tarih ve Kontenjan</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <label><span className={labelClass}>Başlık</span><input className={inputClass} value={form.title} onChange={(e) => setField("title", e.target.value)} required /></label>
            <label><span className={labelClass}>Vurgulu Başlık</span><input className={inputClass} value={form.highlightedTitle} onChange={(e) => setField("highlightedTitle", e.target.value)} required /></label>
            <label><span className={labelClass}>Başlangıç Fiyatı</span><input className={inputClass} value={form.startingPrice} onChange={(e) => setField("startingPrice", e.target.value)} required /></label>
            <label><span className={labelClass}>1. Çıkış Tarihi</span><input className={inputClass} value={form.departureOne} onChange={(e) => setField("departureOne", e.target.value)} required /></label>
            <label><span className={labelClass}>2. Çıkış Tarihi</span><input className={inputClass} value={form.departureTwo} onChange={(e) => setField("departureTwo", e.target.value)} required /></label>
            <label><span className={labelClass}>Toplam Kontenjan</span><input className={inputClass} type="number" min="1" value={form.capacity} onChange={(e) => setField("capacity", e.target.value)} required /></label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <h2 className="mb-5 text-lg font-bold text-slate-900">Yetişkin Fiyatları</h2>
          <div className="space-y-5">
            {form.packages.map((item, index) => (
              <div key={index} className="grid gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-4">
                <label><span className={labelClass}>Program</span><input className={inputClass} value={item.days} onChange={(e) => setPackage(index, "days", e.target.value)} /></label>
                <label><span className={labelClass}>2 Kişilik Oda</span><input className={inputClass} value={item.double} onChange={(e) => setPackage(index, "double", e.target.value)} /></label>
                <label><span className={labelClass}>3 Kişilik Oda</span><input className={inputClass} value={item.triple} onChange={(e) => setPackage(index, "triple", e.target.value)} /></label>
                <label><span className={labelClass}>4 Kişilik Oda</span><input className={inputClass} value={item.quad} onChange={(e) => setPackage(index, "quad", e.target.value)} /></label>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <h2 className="mb-5 text-lg font-bold text-slate-900">Çocuk Fiyatları</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <label><span className={labelClass}>2–11 Yaş</span><input className={inputClass} value={form.childTwoToEleven} onChange={(e) => setField("childTwoToEleven", e.target.value)} /></label>
              <label><span className={labelClass}>0–2 Yaş</span><input className={inputClass} value={form.childZeroToTwo} onChange={(e) => setField("childZeroToTwo", e.target.value)} /></label>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <h2 className="mb-5 text-lg font-bold text-slate-900">Otel ve WhatsApp</h2>
            <div className="space-y-5">
              <label><span className={labelClass}>Otel Bilgisi</span><input className={inputClass} value={form.hotelDetail} onChange={(e) => setField("hotelDetail", e.target.value)} /></label>
              <label><span className={labelClass}>WhatsApp Hazır Mesajı</span><textarea className={inputClass} rows={3} value={form.whatsappMessage} onChange={(e) => setField("whatsappMessage", e.target.value)} /></label>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <h2 className="mb-2 text-lg font-bold text-slate-900">Pakete Dahil Hizmetler</h2>
          <p className="mb-5 text-sm text-slate-500">Her hizmeti ayrı bir satıra yazın.</p>
          <textarea className={inputClass} rows={6} value={form.includedServices.join("\n")} onChange={(e) => setField("includedServices", e.target.value.split("\n"))} />
        </section>

        <div className="sticky bottom-4 flex flex-col items-stretch gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>{message && <p className={`text-sm font-bold ${message.ok ? "text-emerald-600" : "text-red-600"}`}>{message.text}</p>}</div>
          <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003781] px-7 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#002b66] disabled:cursor-not-allowed disabled:opacity-60">
            <span className={`material-symbols-outlined text-[19px] ${saving ? "animate-spin" : ""}`}>{saving ? "progress_activity" : "save"}</span>
            {saving ? "Kaydediliyor..." : "Kampanyayı Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
