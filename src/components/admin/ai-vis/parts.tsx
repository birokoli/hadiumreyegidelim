"use client";

import Link from "next/link";
import DeskNav from "@/components/admin/seo/DeskNav";
import { Cost, SegmentMeter } from "@/components/admin/seo/ui";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import { ENGINES, type EngineId } from "@/lib/ai-vis/types";
import { useAiVis } from "./AiVisProvider";

export const AI_CHAPTERS = [
  { href: "/admin/ai-visibility", n: "01", label: "Durum" },
  { href: "/admin/ai-visibility/sorular", n: "02", label: "Sorular" },
  { href: "/admin/ai-visibility/yanitlar", n: "03", label: "Yanıtlar" },
  { href: "/admin/ai-visibility/kaynaklar", n: "04", label: "Kaynaklar" },
  { href: "/admin/ai-visibility/rakipler", n: "05", label: "Rakipler" },
  { href: "/admin/ai-visibility/hazirlik", n: "06", label: "Hazırlık" },
];

export function AiNav() {
  return <DeskNav title="AI Görünürlük" chapters={AI_CHAPTERS} cross={{ href: "/admin/seo", label: "SEO Masası" }} />;
}

export const engineLabel = (e: EngineId) => ENGINES[e].label;

export function Pct({ value, digits = 0 }: { value: number | null; digits?: number }) {
  if (value == null) return <span className="text-[var(--seo-ink-3)]">—</span>;
  return <>%{(value * 100).toFixed(digits)}</>;
}

/** Her sayının yanında kaç yanıta dayandığı (limelit: "n") */
export function N({ n }: { n: number }) {
  return <span className="text-[12px] font-semibold tabular-nums text-[var(--seo-ink-3)]">n={n}</span>;
}

/** Çalıştırma durumu: her sayfanın başlığında aynı düğme ve ilerleme */
export function RunBar({ label }: { label?: string }) {
  const { data, run, progress, lastRun, runnableEngines } = useAiVis();
  const prompts = data?.config.prompts.length ?? 0;
  const total = prompts * runnableEngines.length;
  return (
    <div className="flex flex-col items-start gap-2 lg:items-end">
      <button className="seo-btn" disabled={Boolean(progress) || total === 0} onClick={() => run()}>
        {progress ? "Soruluyor" : label ?? `${prompts} soruyu ${runnableEngines.length} motora sor`}
      </button>
      {!progress && lastRun && (
        <span className="flex gap-3 text-[13px] text-[var(--seo-ink-3)]">
          {lastRun.total} yanıt{lastRun.errors ? `, ${lastRun.errors} hata` : ""}
          <Cost usd={lastRun.cost} />
        </span>
      )}
    </div>
  );
}

export function RunProgress() {
  const { progress } = useAiVis();
  if (!progress) return null;
  return (
    <div className="mb-14" aria-live="polite">
      <TextShimmer className="text-[20px] font-bold" baseColor="#6b7690" highlightColor="#003781">
        {`${progress.total} yanıttan ${progress.done} tanesi geldi`}
      </TextShimmer>
      <div className="mt-4">
        <SegmentMeter done={progress.done} total={progress.total} segments={40} label="Gelen yanıt" />
      </div>
      <p className="mt-3 text-[13px] text-[var(--seo-ink-3)]">
        {progress.active.map((j) => engineLabel(j.engine)).join(", ")} yanıtlıyor. ChatGPT ve Gemini tek soruda bir dakikayı bulabilir; sayfalar arasında gezebilirsiniz, sorgu devam eder.
      </p>
    </div>
  );
}

export function EmptyPrompts() {
  return (
    <p className="max-w-[560px] text-[16px] leading-relaxed text-[var(--seo-ink-2)]">
      Henüz soru yok. <Link href="/admin/ai-visibility/sorular" className="seo-link">Sorular</Link>{" "}sayfasından müşterilerin AI&apos;a sorduğu soruları
      ekleyin ya da önerilerden seçin. Sonra her soruyu seçtiğiniz motorlara sorup markanın yanıtlarda geçip geçmediğini ölçeriz.
    </p>
  );
}

/** Günlük anılma oranı çizgisi. Değerler 0–1. */
export function TrendChart({ series }: { series: { date: string; visibility: number | null; n: number }[] }) {
  const pts = series.filter((s) => s.visibility != null);
  if (pts.length < 2) {
    return <p className="text-[14px] text-[var(--seo-ink-3)]">Trend için en az iki farklı günde ölçüm gerekiyor.</p>;
  }
  const W = 640;
  const H = 160;
  const step = W / (pts.length - 1);
  const y = (v: number) => H - 8 - v * (H - 16);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${y(p.visibility!).toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-[720px] overflow-visible" role="img" aria-label="Günlük anılma oranı">
        {[0, 0.5, 1].map((g) => (
          <g key={g}>
            <line x1={0} x2={W} y1={y(g)} y2={y(g)} stroke="var(--seo-rule)" strokeWidth={1} />
            <text x={W + 8} y={y(g) + 4} fontSize={11} fill="var(--seo-ink-3)">%{g * 100}</text>
          </g>
        ))}
        <path d={path} fill="none" stroke="var(--seo-mark)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={(pts.length - 1) * step} cy={y(last.visibility!)} r={4} fill="var(--seo-mark)" />
      </svg>
      <figcaption className="mt-2 flex justify-between text-[12px] text-[var(--seo-ink-3)] max-w-[720px]">
        <span>{new Date(pts[0].date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</span>
        <span>{new Date(last.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}</span>
      </figcaption>
    </figure>
  );
}
