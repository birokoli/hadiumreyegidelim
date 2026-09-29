"use client";

import { useMemo } from "react";
import { useAiVis } from "@/components/admin/ai-vis/AiVisProvider";
import { EmptyPrompts, engineLabel, RunBar, RunProgress } from "@/components/admin/ai-vis/parts";
import { ErrorLine, PageHead, Section } from "@/components/admin/seo/ui";
import { CITATION_KIND_LABEL, type CitationKind } from "@/lib/ai-vis/analyze";
import { citationDomains, citationOpportunities, fanOutQueries, latestRuns } from "@/lib/ai-vis/metrics";

const KINDS: CitationKind[] = ["own", "competitor", "social", "informational", "other"];

export default function SourcesPage() {
  const { data, error } = useAiVis();
  const view = useMemo(() => {
    if (!data) return null;
    const runs = latestRuns(data.cells, data.config);
    const domains = citationDomains(runs);
    const total = domains.reduce((s, d) => s + d.count, 0);
    const byKind = KINDS.map((k) => ({ kind: k, count: domains.filter((d) => d.kind === k).reduce((s, d) => s + d.count, 0) }));
    return { runs, domains, total, byKind, opportunities: citationOpportunities(runs), queries: fanOutQueries(runs) };
  }, [data]);

  return (
    <>
      <PageHead
        n="04"
        title="AI'ın gösterdiği kaynaklar"
        lede="AI motorları yanıt verirken hangi sitelere dayanıyor. Rakiplerin geçip markanın geçmediği yanıtlarda kaynak gösterilen siteler, yanıtlara girmenin en kısa yolu: o sitelerde yer almak."
      >
        <RunBar />
      </PageHead>
      <RunProgress />
      <ErrorLine>{error}</ErrorLine>
      {data && data.config.prompts.length === 0 && <EmptyPrompts />}

      {view && view.total === 0 && data && data.config.prompts.length > 0 && (
        <p className="text-[16px] text-[var(--seo-ink-2)]">Henüz kaynak gösteren yanıt yok.</p>
      )}

      {view && view.total > 0 && (
        <>
          <div>
            <p className="seo-label">{view.total} kaynak gösterimi, türe göre</p>
            <div className="mt-4 flex h-3 w-full max-w-[760px] overflow-hidden rounded-full bg-[var(--seo-paper-2)]" aria-hidden>
              {view.byKind.filter((k) => k.count).map((k) => (
                <span
                  key={k.kind}
                  style={{
                    width: `${(k.count / view.total) * 100}%`,
                    background: k.kind === "own" ? "var(--seo-mark)" : k.kind === "competitor" ? "#6b7690" : k.kind === "informational" ? "#9fb3d6" : k.kind === "social" ? "#c9d4e8" : "#e1e6ef",
                  }}
                />
              ))}
            </div>
            <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
              {view.byKind.map((k) => (
                <div key={k.kind} className="flex items-baseline gap-2">
                  <dd className={`text-[26px] font-extrabold tabular-nums ${k.kind === "own" ? "text-[var(--seo-mark)]" : ""}`}>
                    %{Math.round((k.count / view.total) * 100)}
                  </dd>
                  <dt className="text-[13px] text-[var(--seo-ink-3)]">{CITATION_KIND_LABEL[k.kind]} ({k.count})</dt>
                </div>
              ))}
            </dl>
          </div>

          <Section title="Kaynak fırsatları" aside="markanın anılmadığı yanıtlarda gösterilen üçüncü taraf siteler">
            {view.opportunities.length === 0 ? (
              <p className="text-[15px] text-[var(--seo-ink-3)]">Markanın anılmadığı yanıtlarda üçüncü taraf kaynak yok.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="seo-table">
                  <thead>
                    <tr><th>Site</th><th>Tür</th><th className="num">Yanıt</th><th className="num">Rakip de anılan</th><th>Örnek sayfa</th></tr>
                  </thead>
                  <tbody>
                    {view.opportunities.slice(0, 25).map((o) => (
                      <tr key={o.domain}>
                        <td className="seo-mono text-[13px] font-semibold">{o.domain}</td>
                        <td className="text-[13px] text-[var(--seo-ink-2)]">{CITATION_KIND_LABEL[o.kind]}</td>
                        <td className="num">{o.runs}</td>
                        <td className={`num ${o.withCompetitor ? "font-bold" : ""}`}>{o.withCompetitor || ""}</td>
                        <td className="max-w-[340px] truncate text-[13px]">
                          <a href={o.urls[0]} target="_blank" rel="noreferrer" className="hover:underline">{o.urls[0]?.replace(/^https?:\/\/(www\.)?/, "")}</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-4 max-w-[640px] text-[13px] text-[var(--seo-ink-3)]">
                  Bu sitelerde markanın yer alması için: listelerine girmek, konu hakkında bilgi vermek, forumlarda gerçek soruları yanıtlamak ya da basın içeriği.
                  &quot;Rakip de anılan&quot; sütunu en öncelikli olanları gösterir.
                </p>
              </div>
            )}
          </Section>

          <Section title="En çok gösterilen siteler">
            <div className="overflow-x-auto">
              <table className="seo-table">
                <thead>
                  <tr><th>Site</th><th>Tür</th><th className="num">Gösterim</th><th className="num">Soru</th><th>Motorlar</th></tr>
                </thead>
                <tbody>
                  {view.domains.slice(0, 40).map((d) => (
                    <tr key={d.domain} className={d.kind === "own" ? "font-bold" : ""}>
                      <td className="seo-mono text-[13px]">{d.domain}</td>
                      <td className={`text-[13px] ${d.kind === "own" ? "text-[var(--seo-mark)]" : "text-[var(--seo-ink-2)]"}`}>
                        {CITATION_KIND_LABEL[d.kind]}{d.owner && d.kind === "competitor" ? `: ${d.owner}` : ""}
                      </td>
                      <td className="num">{d.count}</td>
                      <td className="num">{d.prompts}</td>
                      <td className="text-[13px] text-[var(--seo-ink-2)]">{d.engines.map(engineLabel).join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="AI'ın arka planda yaptığı aramalar" aside="ChatGPT, Perplexity ve Claude bildiriyor">
            {view.queries.length === 0 ? (
              <p className="text-[15px] text-[var(--seo-ink-3)]">Motorlar henüz arama sorgusu bildirmedi.</p>
            ) : (
              <>
                <p className="mb-5 max-w-[640px] text-[14px] text-[var(--seo-ink-2)]">
                  AI yanıt vermeden önce bu aramaları yapıyor. Bu aramalarda Google&apos;da üst sıralarda olan sayfalar yanıtlara kaynak olur; SEO Masası&apos;nda takip etmeye değer.
                </p>
                <table className="seo-table max-w-[860px]">
                  <thead>
                    <tr><th>Arama</th><th className="num">Kez</th><th className="num">Sitemiz kaynaktı</th><th>Motorlar</th></tr>
                  </thead>
                  <tbody>
                    {view.queries.slice(0, 40).map((q) => (
                      <tr key={q.query}>
                        <td className="font-semibold">{q.query}</td>
                        <td className="num">{q.count}</td>
                        <td className={`num ${q.ownCited ? "font-bold text-[var(--seo-mark)]" : "text-[var(--seo-ink-3)]"}`}>{q.ownCited || "hiç"}</td>
                        <td className="text-[13px] text-[var(--seo-ink-2)]">{q.engines.map(engineLabel).join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </Section>
        </>
      )}
    </>
  );
}
