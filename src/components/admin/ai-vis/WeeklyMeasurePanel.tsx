"use client";

import { useEffect, useState } from "react";
import { api, ErrorLine } from "@/components/admin/seo/ui";
import type { WeeklyState } from "@/lib/weekly-measure";

type Status = { state: WeeklyState | null; cap: number; currentWeek: string; schedule: string };

/** Haftalık otomatik ölçümün bu haftaki durumu ve harcama tavanı */
export default function WeeklyMeasurePanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [cap, setCap] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [note, setNote] = useState("");

  const runNow = async () => {
    setRunning(true);
    setError("");
    setNote("Çalışıyor; birkaç dakika sürebilir…");
    try {
      const r = await api<{ state: WeeklyState; message: string }>("/api/admin/ai-vis/weekly", { method: "POST", body: JSON.stringify({ action: "run" }) });
      setStatus((s) => (s ? { ...s, state: r.state } : s));
      setNote(`${r.message} Sonuçları görmek için sayfayı yenileyin.`);
    } catch (e) {
      setError((e as Error).message);
      setNote("");
    } finally {
      setRunning(false);
    }
  };

  useEffect(() => {
    api<Status>("/api/admin/ai-vis/weekly")
      .then((s) => {
        setStatus(s);
        setCap(String(s.cap));
      })
      .catch((e) => setError((e as Error).message));
  }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const r = await api<{ cap: number }>("/api/admin/ai-vis/weekly", { method: "POST", body: JSON.stringify({ cap: Number(cap) }) });
      setStatus((s) => (s ? { ...s, cap: r.cap } : s));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (!status) return error ? <ErrorLine>{error}</ErrorLine> : null;
  const s = status.state && status.state.week === status.currentWeek ? status.state : null;
  const line = status.cap === 0
    ? "Kapalı (tavan 0 $)."
    : !s
      ? "Bu hafta henüz başlamadı; pazartesi otomatik başlar."
      : s.finishedAt
        ? `${s.capHit ? "Tavana ulaşıldı" : "Tamamlandı"}: ${s.done}/${s.total} soru-motor, ${s.spent.toFixed(2)} $${s.errors ? `, ${s.errors} hata` : ""}.`
        : `Devam ediyor: ${s.done}/${s.total} soru-motor, ${s.spent.toFixed(2)} $ harcandı.`;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-[var(--seo-rule)] py-4 text-[14px]">
      <p>
        <span className="seo-label mr-2">Haftalık otomatik ölçüm</span>
        <span className="text-[var(--seo-ink-2)]">{status.schedule} · {status.currentWeek} · </span>
        <span className="font-semibold">{line}</span>
      </p>
      <label className="flex items-center gap-2 text-[13px] text-[var(--seo-ink-2)]">
        Haftalık tavan
        <input type="number" min={0} max={20} step={0.5} value={cap} onChange={(e) => setCap(e.target.value)} className="w-20 border border-[var(--seo-rule)] bg-white px-2 py-1 text-right" />
        $
      </label>
      <button className="seo-btn" disabled={saving || Number(cap) === status.cap} onClick={save}>{saving ? "Kaydediliyor" : "Kaydet"}</button>
      {status.cap > 0 && !(s?.finishedAt) && (
        <button className="seo-btn" disabled={running} onClick={runNow}>{running ? "Çalışıyor" : "Şimdi çalıştır"}</button>
      )}
      {note && <p className="w-full text-[13px] text-[var(--seo-ink-2)]">{note}</p>}
      <ErrorLine>{error}</ErrorLine>
    </div>
  );
}
