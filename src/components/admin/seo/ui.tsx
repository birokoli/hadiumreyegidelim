"use client";

import React from "react";

export function PageHead({ n, title, lede, children }: { n: string; title: string; lede: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="mb-14 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
      <div className="max-w-[640px]" data-chapter={n}>
        <h1 className="seo-title text-[40px] sm:text-[52px]">{title}</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-[var(--seo-ink-2)]">{lede}</p>
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </header>
  );
}

export function Section({ title, aside, children, className = "" }: { title: string; aside?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`mt-20 ${className}`}>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-[22px] font-bold tracking-tight">{title}</h2>
        {aside && <div className="text-[13px] text-[var(--seo-ink-3)]">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

/**
 * Segmentli ilerleme göstergesi. Watermelon UI "onboarding-checklist"
 * (MIT) içindeki 14 çubuklu sayaçtan uyarlandı.
 */
export function SegmentMeter({ done, total, segments = 14, label }: { done: number; total: number; segments?: number; label: string }) {
  const filled = total === 0 ? 0 : Math.round((done / total) * segments);
  return (
    <div className="flex items-center gap-3" role="meter" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={label}>
      <div className="flex gap-[3px]" aria-hidden>
        {Array.from({ length: segments }).map((_, i) => (
          <span
            key={i}
            className="h-4 w-[4px] rounded-full transition-colors duration-500"
            style={{ background: i < filled ? "var(--seo-mark)" : "var(--seo-rule)" }}
          />
        ))}
      </div>
      <span className="text-[13px] font-semibold tabular-nums text-[var(--seo-ink-2)]">
        {done}/{total}
      </span>
    </div>
  );
}

export function NeedsKey({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "max-w-[520px]" : "max-w-[640px] bg-[var(--seo-paper-2)] rounded-[4px] p-6"}>
      <p className="text-[16px] font-bold">DataForSEO bağlı değil</p>
      <p className="mt-2 text-[14px] leading-relaxed text-[var(--seo-ink-2)]">
        Kelime hacmi, Google sırası ve rakip verisi DataForSEO&apos;dan gelir. Aylık abonelik yok; her sorgu için birkaç sent ödenir.
        Vercel ortam değişkenlerine <code className="seo-mono text-[13px]">DATAFORSEO_LOGIN</code>{" "}ve{" "}
        <code className="seo-mono text-[13px]">DATAFORSEO_PASSWORD</code>{" "}ekleyin (ya da open-seo ile aynı biçimde base64{" "}
        <code className="seo-mono text-[13px]">DATAFORSEO_API_KEY</code>).
      </p>
      {!compact && (
        <p className="mt-3 text-[14px]">
          <a className="seo-link" href="https://app.dataforseo.com/api-access" target="_blank" rel="noreferrer">
            API bilgilerini DataForSEO panelinden alın ↗
          </a>
        </p>
      )}
    </div>
  );
}

export function Cost({ usd }: { usd: number | null | undefined }) {
  if (usd == null) return null;
  return <span className="text-[13px] tabular-nums text-[var(--seo-ink-3)]">Bu sorgu ${usd.toFixed(4)} tuttu</span>;
}

export function ErrorLine({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return <p role="alert" className="mt-4 text-[14px] font-semibold text-[var(--seo-danger)]">{children}</p>;
}

export function Sparkline({ values, invert = false, width = 96, height = 24 }: { values: (number | null)[]; invert?: boolean; width?: number; height?: number }) {
  const nums = values.map((v) => (v == null ? null : v));
  const defined = nums.filter((v): v is number => v != null);
  if (defined.length < 2) return <span className="text-[12px] text-[var(--seo-ink-3)]">veri az</span>;
  const min = Math.min(...defined);
  const max = Math.max(...defined);
  const span = max - min || 1;
  const step = width / (nums.length - 1);
  const pts = nums
    .map((v, i) => {
      if (v == null) return null;
      const norm = (v - min) / span;
      const y = invert ? norm * (height - 4) + 2 : height - 2 - norm * (height - 4);
      return `${(i * step).toFixed(1)},${y.toFixed(1)}`;
    })
    .filter(Boolean)
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="overflow-visible">
      <polyline points={pts} fill="none" stroke="var(--seo-ink)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/** Sıra değişimi: sıra küçülürse iyileşme. */
export function Delta({ now, prev }: { now: number | null; prev: number | null }) {
  if (now == null && prev == null) return <span className="text-[var(--seo-ink-3)]">·</span>;
  if (prev == null) return <span className="text-[13px] font-semibold text-[var(--seo-ink-3)]">yeni</span>;
  if (now == null) return <span className="text-[13px] font-semibold text-[var(--seo-danger)]">düştü</span>;
  const d = prev - now;
  if (d === 0) return <span className="text-[13px] text-[var(--seo-ink-3)]">aynı</span>;
  return (
    <span className={`text-[13px] font-bold tabular-nums ${d > 0 ? "text-[var(--seo-mark)]" : "text-[var(--seo-danger)]"}`}>
      {d > 0 ? `↑${d}` : `↓${-d}`}
    </span>
  );
}

export const SEVERITY_ORDER = { kritik: 0, "yüksek": 1, orta: 2, "düşük": 3 } as const;

export function SeverityWord({ severity }: { severity: keyof typeof SEVERITY_ORDER }) {
  const color =
    severity === "kritik" || severity === "yüksek" ? "text-[var(--seo-danger)]" : severity === "orta" ? "text-[var(--seo-mark)]" : "text-[var(--seo-ink-3)]";
  return (
    <span className={`text-[12px] font-bold ${color}`}>
      {severity}
    </span>
  );
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

export function formatNumber(n: number | null | undefined) {
  if (n == null) return "—";
  return Math.round(n).toLocaleString("tr-TR");
}

/** DataForSEO bağlı mı? Bilinmiyorsa null. Sayfa açılırken uyarıyı baştan göstermek için. */
export function useDataforseoReady() {
  const [ready, setReady] = React.useState<boolean | null>(null);
  React.useEffect(() => {
    api<{ dataforseo: boolean }>("/api/admin/seo/status")
      .then((d) => setReady(d.dataforseo))
      .catch(() => setReady(null));
  }, []);
  return ready;
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.error || `İstek başarısız (${res.status})`) as Error & { needsKey?: boolean };
    err.needsKey = Boolean(json.needsKey);
    throw err;
  }
  return json as T;
}
