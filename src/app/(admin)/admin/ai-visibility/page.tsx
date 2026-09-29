"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";
import { useAiVis } from "@/components/admin/ai-vis/AiVisProvider";
import { EmptyPrompts, engineLabel, N, Pct, RunBar, RunProgress, TrendChart } from "@/components/admin/ai-vis/parts";
import { ErrorLine, PageHead, Section } from "@/components/admin/seo/ui";
import { byEngine, contentGaps, latestRuns, summarize, trend } from "@/lib/ai-vis/metrics";
import { ENGINES } from "@/lib/ai-vis/types";

export default function AiVisibilityOverview() {
  const { data, error, runnableEngines } = useAiVis();

  const view = useMemo(() => {
    if (!data) return null;
    const runs = latestRuns(data.cells, data.config);
    return {
      runs,
      summary: summarize(runs),
      engines: byEngine(runs, data.config.engines),
      trend: trend(data.daily),
      gaps: contentGaps(runs, data.config),
    };
  }, [data]);

  const missing = data ? data.config.engines.filter((e) => !data.available.includes(e)) : [];
  const drift =
    view && view.trend.last7.visibility != null && view.trend.prev7.visibility != null
      ? view.trend.last7.visibility - view.trend.prev7.visibility
      : null;

  return (
    <>
      <PageHead
        n="01"
        title="Markanın AI yanıtlarındaki yeri"
        lede="Müşterilerin AI'a sorduğu soruları ChatGPT, Gemini, Perplexity, Google ve Claude'a sorar; yanıtta Hadi Umreye Gidelim'in geçip geçmediğini, hangi sırada geçtiğini ve hangi sitelerin kaynak gösterildiğini ölçer."
      >
        <RunBar />
      </PageHead>
      <RunProgress />
      <ErrorLine>{error}</ErrorLine>

      {!data && !error && <p className="text-[var(--seo-ink-3)]">Yükleniyor…</p>}
      {data && data.config.prompts.length === 0 && <EmptyPrompts />}

      {data && view && data.config.prompts.length > 0 && (
        <>
          {view.summary.n === 0 ? (
            <p className="max-w-[560px] text-[16px] text-[var(--seo-ink-2)]">
              {data.config.prompts.length} soru hazır ama henüz sorulmadı. Sağ üstteki düğmeyle ilk ölçümü başlatın.
            </p>
          ) : (
            <>
              <div className="grid gap-12 lg:grid-cols-[auto_1fr] lg:items-end">
                <div>
                  <p className="seo-label">Anılma oranı</p>
                  <p className="mt-3 flex items-baseline gap-1">
                    <span className="text-[56px] font-extrabold text-[var(--seo-ink-3)]">%</span>
                    <AnimatedNumber value={Math.round((view.summary.visibility ?? 0) * 100)} className="seo-figure text-[140px] sm:text-[176px]" />
                  </p>
                  <p className="mt-3"><N n={view.summary.n} /></p>
                </div>
                <div className="max-w-[560px] pb-4">
                  <p className="text-[18px] font-semibold leading-snug">
                    Markalı olmayan {view.summary.n} yanıtın {Math.round((view.summary.visibility ?? 0) * view.summary.n)} tanesinde marka geçiyor.
                  </p>
                  {drift != null && Math.abs(drift) >= 0.05 && (
                    <p className={`mt-3 text-[15px] font-semibold ${drift < 0 ? "text-[var(--seo-danger)]" : "text-[var(--seo-mark)]"}`}>
                      Son 7 günde %{Math.round((view.trend.last7.visibility ?? 0) * 100)}, önceki 7 günde %{Math.round((view.trend.prev7.visibility ?? 0) * 100)}
                      {drift < 0 ? "; belirgin bir düşüş var." : "; belirgin bir artış var."}
                    </p>
                  )}
                  <p className="mt-3 text-[13px] leading-relaxed text-[var(--seo-ink-3)]">
                    Markanın adının geçtiği sorular (ör. &quot;Hadi Umreye Gidelim güvenilir mi?&quot;) bu orana katılmaz; AI zaten markayı anmak zorunda kalır.
                    Google&apos;ın AI yanıtı göstermediği sorular da ıskalama sayılmaz.
                  </p>
                </div>
              </div>

              <dl className="mt-16 flex flex-wrap gap-x-16 gap-y-8">
                {[
                  { label: "Ses payı", value: <Pct value={view.summary.sov} />, n: view.summary.n, hint: "marka / (marka + rakipler)" },
                  { label: "Ortalama sıra", value: view.summary.avgPosition == null ? "—" : view.summary.avgPosition.toFixed(1), n: view.summary.positionN, hint: "liste yanıtlarında" },
                  { label: "Kaynak payı", value: <Pct value={view.summary.citationShare} />, n: view.summary.citationN, hint: "kaynakların sitemize ait olanı" },
                ].map((m) => (
                  <div key={m.label}>
                    <dd className="seo-figure text-[56px]">{m.value}</dd>
                    <dt className="mt-2 flex items-baseline gap-2">
                      <span className="seo-label">{m.label}</span>
                      <N n={m.n} />
                    </dt>
                    <p className="mt-1 text-[12px] text-[var(--seo-ink-3)]">{m.hint}</p>
                  </div>
                ))}
              </dl>

              <Section title="Motorlara göre">
                <div className="overflow-x-auto">
                  <table className="seo-table">
                    <thead>
                      <tr>
                        <th>Motor</th>
                        <th className="num">Anılma</th>
                        <th className="num">n</th>
                        <th className="num">Ses payı</th>
                        <th className="num">Ort. sıra</th>
                        <th className="num">Kaynak payı</th>
                        <th className="num">Yanıt yok</th>
                        <th className="num">Hata</th>
                      </tr>
                    </thead>
                    <tbody>
                      {view.engines.map((e) => (
                        <tr key={e.engine}>
                          <td>
                            <span className="font-semibold">{engineLabel(e.engine)}</span>
                            <span className="block text-[12px] text-[var(--seo-ink-3)]">{ENGINES[e.engine].via}</span>
                          </td>
                          <td className="num text-[18px] font-extrabold"><Pct value={e.visibility} /></td>
                          <td className="num text-[var(--seo-ink-3)]">{e.n}</td>
                          <td className="num"><Pct value={e.sov} /></td>
                          <td className="num">{e.avgPosition == null ? "—" : e.avgPosition.toFixed(1)}</td>
                          <td className="num"><Pct value={e.citationShare} /></td>
                          <td className="num">{e.noSurface || ""}</td>
                          <td className={`num ${e.errors ? "font-bold text-[var(--seo-danger)]" : ""}`}>{e.errors || ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              <Section title="Günlük anılma oranı" aside="son 30 gün">
                <TrendChart series={view.trend.series} />
              </Section>

              {view.gaps.length > 0 && (
                <Section title="Rakiplerin geçip markanın geçmediği sorular" aside={<Link href="/admin/ai-visibility/rakipler" className="seo-link">Tümü</Link>}>
                  <ul>
                    {view.gaps.slice(0, 5).map((g) => (
                      <li key={g.prompt.id} className="grid gap-1 py-3 sm:grid-cols-[1fr_auto] sm:gap-6">
                        <Link href={`/admin/ai-visibility/yanitlar?p=${g.prompt.id}`} className="text-[16px] font-semibold hover:underline">{g.prompt.text}</Link>
                        <span className="text-[13px] text-[var(--seo-ink-3)]">{g.competitors.join(", ")}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </>
          )}

          {(missing.length > 0 || runnableEngines.length === 0) && (
            <p className="mt-16 max-w-[640px] text-[13px] leading-relaxed text-[var(--seo-ink-3)]">
              Seçili ama çalışmayan motorlar: {missing.map(engineLabel).join(", ")}.{" "}
              {missing.includes("claude") && "Claude için Vercel'de ANTHROPIC_API_KEY gerekir. "}
              {missing.some((m) => m !== "claude") && "Diğerleri için DATAFORSEO_LOGIN ve DATAFORSEO_PASSWORD gerekir."}
            </p>
          )}
        </>
      )}
    </>
  );
}
