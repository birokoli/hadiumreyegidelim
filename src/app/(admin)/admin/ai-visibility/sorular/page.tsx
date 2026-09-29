"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAiVis } from "@/components/admin/ai-vis/AiVisProvider";
import { engineLabel, RunBar, RunProgress } from "@/components/admin/ai-vis/parts";
import { api, ErrorLine, PageHead, Section } from "@/components/admin/seo/ui";
import { isBrandedPrompt } from "@/lib/ai-vis/analyze";
import { latestRuns, type AnalyzedRun } from "@/lib/ai-vis/metrics";
import { personaVariants, suggestPrompts } from "@/lib/ai-vis/suggestions";
import { ENGINE_IDS, ENGINES, type EngineId, type Prompt } from "@/lib/ai-vis/types";

const newId = () => `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

export default function PromptsPage() {
  const { data, error, saveConfig, run, progress } = useAiVis();
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [seoTopics, setSeoTopics] = useState<string[]>([]);

  // SEO Masası'nda takip edilen kelimeler öneri konusu olur (ansvisor: arama verisinden soru keşfi)
  useEffect(() => {
    api<{ tracked: { keyword: string }[] }>("/api/admin/seo/ranks")
      .then((d) => setSeoTopics(d.tracked.map((t) => t.keyword).slice(0, 8)))
      .catch(() => {});
  }, []);

  const runs = useMemo(() => (data ? latestRuns(data.cells, data.config) : []), [data]);
  const cell = (promptId: string, engine: EngineId) => runs.find((r) => r.promptId === promptId && r.engine === engine);

  if (!data) return <ErrorLine>{error}</ErrorLine>;
  const { config, available } = data;
  const existing = new Set(config.prompts.map((p) => p.text.toLocaleLowerCase("tr")));

  const addPrompts = async (items: { text: string; tags: string[] }[]) => {
    const fresh = items.filter((i) => i.text.trim() && !existing.has(i.text.trim().toLocaleLowerCase("tr")));
    if (!fresh.length) return;
    const prompts: Prompt[] = [
      ...config.prompts,
      ...fresh.map((i) => ({ id: newId(), text: i.text.trim(), tags: i.tags, createdAt: new Date().toISOString() })),
    ];
    await saveConfig({ prompts });
  };

  const removePrompt = (id: string) => saveConfig({ prompts: config.prompts.filter((p) => p.id !== id) });

  const toggleEngine = (e: EngineId) =>
    saveConfig({ engines: config.engines.includes(e) ? config.engines.filter((x) => x !== e) : [...config.engines, e] });

  const activeEngines = config.engines;
  const suggestions = suggestPrompts(seoTopics).filter((s) => !existing.has(s.text.toLocaleLowerCase("tr")));

  return (
    <>
      <PageHead
        n="02"
        title="Takip edilen sorular"
        lede="Müşterilerin AI'a sorduğu soruları buraya yazın. Her soru seçili motorlara ayrı ayrı sorulur ve her soru × motor sorgusu ayrı ücretlendirilir. Az ama gerçek sorularla başlayın."
      >
        <RunBar />
      </PageHead>
      <RunProgress />
      <ErrorLine>{error}</ErrorLine>

      <section>
        <h2 className="text-[16px] font-bold">Motorlar</h2>
        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
          {ENGINE_IDS.map((e) => {
            const ready = available.includes(e);
            return (
              <label key={e} className={`flex cursor-pointer items-center gap-2 text-[15px] font-semibold ${ready ? "" : "text-[var(--seo-ink-3)]"}`}>
                <input type="checkbox" checked={config.engines.includes(e)} onChange={() => toggleEngine(e)} className="h-4 w-4 accent-[var(--seo-mark)]" />
                {ENGINES[e].label}
                {!ready && <span className="text-[12px] font-normal">(API bilgisi yok)</span>}
              </label>
            );
          })}
        </div>
      </section>

      <Section title={`${config.prompts.length} soru`} aside="en fazla 60">
        {config.prompts.length === 0 ? (
          <p className="text-[15px] text-[var(--seo-ink-2)]">Henüz soru yok. Aşağıdan yazın ya da önerilerden seçin.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="seo-table">
              <thead>
                <tr>
                  <th>Soru</th>
                  {activeEngines.map((e) => (
                    <th key={e} className="text-center">{engineLabel(e)}</th>
                  ))}
                  <th><span className="sr-only">İşlemler</span></th>
                </tr>
              </thead>
              <tbody>
                {config.prompts.map((p) => {
                  const branded = isBrandedPrompt(p.text, config.brand);
                  return (
                    <tr key={p.id}>
                      <td className="min-w-[280px] max-w-[420px]">
                        <p className="font-semibold leading-snug">{p.text}</p>
                        <p className="mt-1 text-[12px] text-[var(--seo-ink-3)]">
                          {[branded ? "markalı: orana katılmaz" : null, ...p.tags].filter(Boolean).join(" · ")}
                        </p>
                      </td>
                      {activeEngines.map((e) => (
                        <td key={e} className="text-center">
                          <CellMark run={cell(p.id, e)} href={`/admin/ai-visibility/yanitlar?p=${p.id}&e=${e}`} />
                        </td>
                      ))}
                      <td className="whitespace-nowrap text-right text-[13px] font-semibold">
                        <button
                          className="text-[var(--seo-mark)] hover:underline disabled:opacity-40"
                          disabled={Boolean(progress)}
                          onClick={() => run(activeEngines.filter((e) => available.includes(e)).map((engine) => ({ promptId: p.id, engine })))}
                        >
                          Sor
                        </button>
                        <button className="ml-4 text-[var(--seo-ink-3)] hover:underline" onClick={() => addPrompts(personaVariants(p.text))}>
                          Persona
                        </button>
                        <button className="ml-4 text-[var(--seo-ink-3)] hover:text-[var(--seo-danger)]" onClick={() => removePrompt(p.id)} aria-label={`${p.text} sorusunu sil`}>
                          Sil
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="mt-4 text-[13px] text-[var(--seo-ink-3)]">
              <b className="text-[var(--seo-mark)]">●</b>{" "}anıldı (varsa listedeki sırası) · <b>○</b>{" "}anılmadı · <b>—</b>{" "}motor bu soruya AI yanıtı göstermedi ·{" "}
              <b className="text-[var(--seo-danger)]">!</b>{" "}hata. &quot;Persona&quot; soruyu dört farklı müşteri ağzından çoğaltır.
            </p>
          </div>
        )}
      </Section>

      <Section title="Soru ekle">
        <form
          className="max-w-[640px]"
          onSubmit={async (e) => {
            e.preventDefault();
            await addPrompts(input.split("\n").map((t) => ({ text: t, tags: [] })));
            setInput("");
          }}
        >
          <label htmlFor="prompts" className="text-[14px] text-[var(--seo-ink-2)]">Her satıra bir soru, müşterinin yazacağı gibi.</label>
          <textarea
            id="prompts"
            rows={4}
            className="seo-input mt-3 w-full resize-y"
            placeholder={"Bireysel umre için hangi firmayı önerirsin?\nKabe'ye yürüme mesafesinde uygun otel hangileri?"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="mt-3 flex flex-wrap items-center gap-5">
            <button className="seo-btn" disabled={!input.trim()}>Ekle</button>
            <button type="button" className="seo-link text-[14px]" onClick={() => setShowSuggestions((s) => !s)}>
              {showSuggestions ? "Önerileri gizle" : `${suggestions.length} öneri göster`}
            </button>
          </div>
        </form>

        {showSuggestions && (
          <div className="mt-10">
            <p className="max-w-[640px] text-[13px] text-[var(--seo-ink-3)]">
              Öneriler umre konuları{seoTopics.length ? " ve SEO Masası'nda takip ettiğiniz kelimeler" : ""} ile hazır soru kalıplarından üretilir. Hepsini eklemeyin; müşterinin gerçekten soracağı soruları seçin.
            </p>
            <ul className="mt-4 grid gap-x-10 sm:grid-cols-2">
              {suggestions.map((s) => (
                <li key={s.text} className="flex items-baseline justify-between gap-4 py-2 text-[15px]">
                  <span>{s.text}</span>
                  <button className="shrink-0 text-[13px] font-semibold text-[var(--seo-mark)] hover:underline" onClick={() => addPrompts([s])}>
                    Ekle
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>
    </>
  );
}

function CellMark({ run, href }: { run?: AnalyzedRun; href: string }) {
  if (!run) return <span className="text-[var(--seo-ink-3)]">·</span>;
  const content =
    run.status === "error" ? (
      <span className="font-bold text-[var(--seo-danger)]" title={run.error}>!</span>
    ) : run.status === "no_surface" ? (
      <span className="text-[var(--seo-ink-3)]">—</span>
    ) : run.a.brandMentioned ? (
      <span className="font-bold text-[var(--seo-mark)]">●{run.a.brandPosition ? <sup className="ml-0.5 text-[11px]">{run.a.brandPosition}</sup> : null}</span>
    ) : (
      <span className="text-[var(--seo-ink-2)]">○</span>
    );
  return (
    <Link href={href} className="inline-block min-w-8 rounded px-2 py-1 text-[18px] hover:bg-[var(--seo-paper-2)]">
      {content}
    </Link>
  );
}
