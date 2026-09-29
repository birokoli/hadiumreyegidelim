"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useAiVis } from "@/components/admin/ai-vis/AiVisProvider";
import { EmptyPrompts, engineLabel, RunBar, RunProgress } from "@/components/admin/ai-vis/parts";
import { ErrorLine, formatDate, PageHead } from "@/components/admin/seo/ui";
import { CITATION_KIND_LABEL, highlightParts } from "@/lib/ai-vis/analyze";
import { latestRuns, previousRuns, toCsv, type AnalyzedRun } from "@/lib/ai-vis/metrics";
import type { AiVisConfig, EngineId } from "@/lib/ai-vis/types";

export default function AnswersPage() {
  return (
    <Suspense fallback={null}>
      <Answers />
    </Suspense>
  );
}

type Filter = "all" | "mentioned" | "missed" | "problem";

function Answers() {
  const { data, error } = useAiVis();
  const params = useSearchParams();
  const [prompt, setPrompt] = useState(params.get("p") ?? "");
  const [engine, setEngine] = useState<EngineId | "">((params.get("e") as EngineId) ?? "");
  const [filter, setFilter] = useState<Filter>("all");

  const runs = useMemo(() => (data ? latestRuns(data.cells, data.config) : []), [data]);
  const prev = useMemo(() => (data ? previousRuns(data.cells, data.config) : new Map()), [data]);

  const shown = runs
    .filter((r) => (!prompt || r.promptId === prompt) && (!engine || r.engine === engine))
    .filter((r) =>
      filter === "mentioned" ? r.a.brandMentioned : filter === "missed" ? r.a.countable && !r.a.brandMentioned : filter === "problem" ? r.status !== "ok" : true,
    )
    .sort((a, b) => b.at.localeCompare(a.at));

  const download = () => {
    const blob = new Blob(["﻿" + toCsv(shown)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ai-yanitlar-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <PageHead
        n="03"
        title="Yanıtlar"
        lede="Her soru ve motor için alınan son yanıt. Marka lacivert zeminle, rakipler altı çizili gösterilir. Sayıların hepsi bu metinlerden hesaplanır; hiçbir model neyin anıldığına kendisi karar vermez."
      >
        <RunBar />
      </PageHead>
      <RunProgress />
      <ErrorLine>{error}</ErrorLine>
      {data && data.config.prompts.length === 0 && <EmptyPrompts />}

      {data && runs.length > 0 && (
        <>
          <div className="mb-12 flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1 text-[12px] font-semibold text-[var(--seo-ink-3)]">
              Soru
              <select className="seo-input max-w-[380px] text-[14px] text-[var(--seo-ink)]" value={prompt} onChange={(e) => setPrompt(e.target.value)}>
                <option value="">Hepsi</option>
                {data.config.prompts.map((p) => <option key={p.id} value={p.id}>{p.text}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-[12px] font-semibold text-[var(--seo-ink-3)]">
              Motor
              <select className="seo-input text-[14px] text-[var(--seo-ink)]" value={engine} onChange={(e) => setEngine(e.target.value as EngineId | "")}>
                <option value="">Hepsi</option>
                {data.config.engines.map((e) => <option key={e} value={e}>{engineLabel(e)}</option>)}
              </select>
            </label>
            <fieldset className="flex flex-wrap gap-4 pb-3 text-[14px] font-semibold">
              <legend className="sr-only">Durum</legend>
              {([["all", "Hepsi"], ["mentioned", "Anılan"], ["missed", "Anılmayan"], ["problem", "Yanıtsız / hata"]] as const).map(([v, l]) => (
                <label key={v} className="flex cursor-pointer items-center gap-1.5">
                  <input type="radio" name="f" checked={filter === v} onChange={() => setFilter(v)} className="accent-[var(--seo-mark)]" />
                  {l}
                </label>
              ))}
            </fieldset>
            <button className="seo-link ml-auto pb-3 text-[14px]" onClick={download}>{shown.length} yanıtı CSV indir</button>
          </div>

          {shown.length === 0 && <p className="text-[var(--seo-ink-3)]">Bu filtreyle yanıt yok.</p>}
          <ol>
            {shown.map((r) => (
              <Answer key={r.id} run={r} prev={prev.get(`${r.promptId}::${r.engine}`)} config={data.config} />
            ))}
          </ol>
        </>
      )}
      {data && data.config.prompts.length > 0 && runs.length === 0 && (
        <p className="text-[16px] text-[var(--seo-ink-2)]">Henüz yanıt yok. Sağ üstteki düğmeyle soruları motorlara sorun.</p>
      )}
    </>
  );
}

function Answer({ run, prev, config }: { run: AnalyzedRun; prev?: AnalyzedRun; config: AiVisConfig }) {
  const [open, setOpen] = useState(false);
  const parts = useMemo(() => highlightParts(run.text, config), [run.text, config]);
  const long = run.text.length > 900;

  return (
    <li className="border-t border-[var(--seo-rule)] py-8 first:border-t-0 first:pt-0">
      <div className="grid gap-2 lg:grid-cols-[1fr_auto] lg:gap-8">
        <div>
          <p className="text-[13px] font-semibold text-[var(--seo-mark)]">{engineLabel(run.engine)}</p>
          <h3 className="mt-1 text-[20px] font-bold leading-snug tracking-tight">{run.prompt}</h3>
        </div>
        <div className="text-[13px] lg:text-right">
          <p className="font-bold">
            {run.status === "error" ? (
              <span className="text-[var(--seo-danger)]">Hata</span>
            ) : run.status === "no_surface" ? (
              <span className="text-[var(--seo-ink-3)]">AI yanıtı çıkmadı</span>
            ) : run.a.brandMentioned ? (
              <span className="text-[var(--seo-mark)]">Marka anıldı{run.a.brandPosition ? `, ${run.a.brandPosition}. sırada` : ""}</span>
            ) : (
              <span>Marka anılmadı</span>
            )}
          </p>
          {prev && prev.status === "ok" && run.status === "ok" && prev.a.brandMentioned !== run.a.brandMentioned && (
            <p className={run.a.brandMentioned ? "text-[var(--seo-mark)]" : "text-[var(--seo-danger)]"}>
              önceki ölçümde {prev.a.brandMentioned ? "anılmıştı" : "anılmamıştı"}
            </p>
          )}
          <p className="text-[var(--seo-ink-3)]">{formatDate(run.at)}</p>
          {run.a.branded && <p className="text-[var(--seo-ink-3)]">markalı soru, orana katılmaz</p>}
        </div>
      </div>

      {run.error && <p className="mt-3 text-[14px] text-[var(--seo-danger)]">{run.error}</p>}
      {run.note && <p className="mt-2 text-[13px] text-[var(--seo-ink-3)]">{run.note}</p>}
      {run.a.competitorsMentioned.length > 0 && (
        <p className="mt-2 text-[14px] text-[var(--seo-ink-2)]">Anılan rakipler: {run.a.competitorsMentioned.join(", ")}</p>
      )}

      {run.text && (
        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
          <div>
            <p className={`whitespace-pre-wrap text-[15px] leading-relaxed ${!open && long ? "line-clamp-[12]" : ""}`}>
              {parts.map((p, i) =>
                p.who === "brand" ? (
                  <mark key={i} className="rounded-[2px] bg-[#dbe5f5] px-0.5 font-semibold text-[var(--seo-mark)]">{p.text}</mark>
                ) : p.who === "competitor" ? (
                  <span key={i} className="font-semibold underline decoration-2 underline-offset-2">{p.text}</span>
                ) : (
                  <span key={i}>{p.text}</span>
                ),
              )}
            </p>
            {long && (
              <button className="seo-link mt-3 text-[14px]" onClick={() => setOpen((o) => !o)}>
                {open ? "Kısalt" : "Tamamını göster"}
              </button>
            )}
          </div>
          <div className="text-[13px]">
            {run.a.citations.length > 0 && (
              <>
                <p className="seo-label">Kaynaklar</p>
                <ul className="mt-2 space-y-1.5">
                  {run.a.citations.map((c) => (
                    <li key={c.url} className="flex gap-2">
                      <span className={`shrink-0 font-semibold ${c.kind === "own" ? "text-[var(--seo-mark)]" : "text-[var(--seo-ink-3)]"}`}>
                        {CITATION_KIND_LABEL[c.kind]}
                      </span>
                      <a href={c.url} target="_blank" rel="noreferrer" className="seo-mono truncate hover:underline">{c.domain}</a>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {run.queries.length > 0 && (
              <>
                <p className="seo-label mt-5">Yanıt öncesi yaptığı aramalar</p>
                <ul className="mt-2 space-y-1 text-[var(--seo-ink-2)]">
                  {run.queries.map((q) => <li key={q}>{q}</li>)}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
