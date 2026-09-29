"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, ErrorLine, formatDate, Section } from "@/components/admin/seo/ui";

type Log = { id: string; topic: string | null; status: string; details: string | null; createdAt: string; completedAt: string | null };
type Status = {
  autoBlog: boolean;
  autoPublish: boolean;
  anthropicKey: boolean;
  schedule: string[];
  nextTopic: string | null;
  createdToday: number;
  logs: Log[];
};

const RUNNING = (s: string) => !["COMPLETED", "FAILED"].includes(s);

/** Otomatik yazının neden çalışıp çalışmadığını tek yerde gösterir */
export default function AutoBlogPanel({ onDraftCreated }: { onDraftCreated?: () => void }) {
  const [data, setData] = useState<Status | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await api<Status>("/api/admin/geo-blog/auto"));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Üretim sürerken 10 sn'de bir yenile
  const running = data?.logs.some((l) => RUNNING(l.status));
  useEffect(() => {
    if (!running) return;
    const t = setInterval(async () => {
      await load();
      onDraftCreated?.();
    }, 10_000);
    return () => clearInterval(t);
  }, [running, load, onDraftCreated]);

  const toggle = async (key: "AUTO_BLOG_ENABLED" | "GEO_BLOG_AUTOPUBLISH", value: boolean) => {
    setError("");
    try {
      await api("/api/admin/geo-blog/auto", { method: "POST", body: JSON.stringify({ key, value }) });
      await load();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const runNow = async () => {
    setBusy(true);
    setError("");
    try {
      await api("/api/admin/trigger-ai", { method: "POST" });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // Neden otomatik yazı çıkmıyor: ilk engeli söyle
  const blocker = !data
    ? null
    : !data.anthropicKey
      ? "ANTHROPIC_API_KEY tanımlı değil; otomatik yazı çalışamaz."
      : !data.autoBlog
        ? "Otomatik yazı kapalı. Açınca her gün bir taslak üretilir."
        : data.createdToday > 0
          ? `Bugün ${data.createdToday} yazı/taslak oluşturuldu; cron günde bir yazı üretir, yarın yenisini dener.`
          : !data.autoPublish
            ? "Otomatik yazı açık. Yazılar taslak olarak kaydedilir ve aşağıdaki listede onay bekler; sitede görünmeleri için Yayınla'ya basın."
            : null;

  return (
    <Section title="Otomatik yazı" aside={data ? `Cron: ${data.schedule.join(" · ")}` : undefined}>
      <ErrorLine>{error}</ErrorLine>
      {data && (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <div className="space-y-3">
              {(
                [
                  ["AUTO_BLOG_ENABLED", "Her gün otomatik taslak üret", data.autoBlog],
                  ["GEO_BLOG_AUTOPUBLISH", "Kalite kapısını geçen taslağı otomatik yayınla", data.autoPublish],
                ] as const
              ).map(([key, label, on]) => (
                <label key={key} className="flex cursor-pointer items-center gap-3 text-[15px] font-semibold">
                  <input type="checkbox" checked={on} onChange={(e) => toggle(key, e.target.checked)} className="h-4 w-4 accent-[var(--seo-mark)]" />
                  {label}
                </label>
              ))}
            </div>
            {blocker && <p className="mt-5 max-w-[460px] text-[14px] leading-relaxed text-[var(--seo-ink-2)]">{blocker}</p>}
            <p className="mt-5 text-[13px] text-[var(--seo-ink-3)]">
              Sıradaki konu: <span className="font-semibold text-[var(--seo-ink)]">{data.nextTopic ?? "—"}</span>
            </p>
            <button className="seo-btn mt-4" onClick={runNow} disabled={busy || running || !data.anthropicKey}>
              {running ? "Yazı üretiliyor" : busy ? "Başlatılıyor" : "Şimdi bir taslak yaz"}
            </button>
            <p className="mt-2 text-[12px] text-[var(--seo-ink-3)]">Araştırma ve yazım 2–4 dakika sürer; sayfadan ayrılabilirsiniz.</p>
          </div>

          <div>
            <p className="seo-label">Son çalıştırmalar</p>
            {data.logs.length === 0 ? (
              <p className="mt-3 text-[14px] text-[var(--seo-ink-3)]">Henüz kayıt yok. Cron hiç çalışmadıysa Vercel → Project → Cron Jobs sayfasından kontrol edin.</p>
            ) : (
              <ul className="mt-2">
                {data.logs.map((l) => (
                  <li key={l.id} className="grid grid-cols-[96px_1fr] gap-3 border-t border-[var(--seo-rule)] py-2.5 text-[13px] first:border-t-0">
                    <span className={`font-bold ${l.status === "FAILED" ? "text-[var(--seo-danger)]" : RUNNING(l.status) ? "text-[var(--seo-mark)]" : "text-[var(--seo-ink-3)]"}`}>
                      {l.status === "FAILED" ? "hata" : RUNNING(l.status) ? "sürüyor" : "bitti"}
                    </span>
                    <span>
                      <span className="text-[var(--seo-ink-3)]">{formatDate(l.createdAt)}</span> · {l.details ?? l.topic}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link href="/admin/ai-logs" className="seo-link mt-3 inline-block text-[13px]">Tüm kayıtlar (Yapay Zeka sayfası)</Link>
          </div>
        </div>
      )}
    </Section>
  );
}
