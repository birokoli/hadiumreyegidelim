"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { AnimatedNumber } from "@/components/motion-primitives/animated-number";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import { api, ErrorLine, formatDate, PageHead, Section, SegmentMeter, SEVERITY_ORDER, SeverityWord } from "@/components/admin/seo/ui";
import type { AuditReport, Category, Issue } from "@/lib/seo/audit";

type History = { id: string; finishedAt: string; score: number; issueCount: number; pageCount: number }[];

const CATEGORIES: Category[] = ["Taranabilirlik", "Sayfa içi", "İçerik", "Yapısal veri ve AI"];

export default function SeoAuditPage() {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [history, setHistory] = useState<History>([]);
  const [fixed, setFixed] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number; path: string } | null>(null);
  const [error, setError] = useState("");
  const [showPages, setShowPages] = useState(false);

  useEffect(() => {
    api<{ report: AuditReport | null; history: History; fixed: Record<string, boolean> }>("/api/admin/seo/audit")
      .then((d) => {
        setReport(d.report);
        setHistory(d.history);
        setFixed(d.fixed);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));
  }, []);

  const run = async () => {
    setError("");
    setProgress({ done: 0, total: 0, path: "" });
    try {
      const res = await fetch("/api/admin/seo/audit", { method: "POST" });
      if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).error || "Denetim başlatılamadı.");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const msg = JSON.parse(line);
          if (msg.type === "plan") setProgress({ done: 0, total: msg.total, path: "" });
          if (msg.type === "page") setProgress({ done: msg.done, total: msg.total, path: msg.path });
          if (msg.type === "error") throw new Error(msg.error);
          if (msg.type === "done") {
            const r = msg.report as AuditReport;
            if (msg.saveError) setError(msg.saveError);
            setReport(r);
            setFixed({});
            setHistory((h) => [{ id: r.id, finishedAt: r.finishedAt, score: r.score, issueCount: r.issues.length, pageCount: r.pageCount }, ...h].slice(0, 20));
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setProgress(null);
    }
  };

  const toggleFixed = async (code: string) => {
    const next = !fixed[code];
    setFixed((f) => ({ ...f, [code]: next }));
    api<{ fixed: Record<string, boolean> }>("/api/admin/seo/audit", { method: "PATCH", body: JSON.stringify({ code, fixed: next }) })
      .then((d) => setFixed(d.fixed))
      .catch((e) => setError(e.message));
  };

  const issues = report?.issues ?? [];
  const fixedCount = issues.filter((i) => fixed[i.code]).length;
  const previous = history[1];

  return (
    <>
      <PageHead
        n="02"
        title="Site denetimi"
        lede="Sitemap'teki her sayfayı canlı siteden çeker ve 32 kuralla kontrol eder: taranabilirlik, title ve açıklama, başlık yapısı, içerik uzunluğu, yapısal veri ve AI botlarının erişimi."
      >
        <button className="seo-btn" onClick={run} disabled={Boolean(progress)}>
          {progress ? "Denetleniyor" : report ? "Yeniden denetle" : "Denetimi başlat"}
        </button>
      </PageHead>

      <ErrorLine>{error}</ErrorLine>

      {progress && (
        <div className="mb-16" aria-live="polite">
          <TextShimmer className="text-[22px] font-bold">
            {progress.total ? `${progress.total} sayfanın ${progress.done} tanesi tarandı` : "Sitemap okunuyor"}
          </TextShimmer>
          {progress.total > 0 && (
            <div className="mt-4">
              <SegmentMeter done={progress.done} total={progress.total} segments={40} label="Taranan sayfa" />
            </div>
          )}
          {progress.path && <p className="seo-mono mt-3 text-[13px] text-[var(--seo-ink-3)]">{progress.path}</p>}
        </div>
      )}

      {loaded && !report && !progress && (
        <p className="max-w-[560px] text-[16px] text-[var(--seo-ink-2)]">
          Henüz denetim yok. İlk denetim sitenin büyüklüğüne göre bir iki dakika sürer; sayfa bu sırada ilerlemeyi gösterir.
        </p>
      )}

      {report && !progress && (
        <>
          <div className="grid gap-12 lg:grid-cols-[auto_1fr] lg:items-end">
            <p className="flex items-baseline gap-2">
              <AnimatedNumber value={report.score} className="seo-figure text-[140px] sm:text-[176px]" />
              <span className="text-[28px] font-bold text-[var(--seo-ink-3)]">/100</span>
            </p>
            <div className="max-w-[520px] pb-3">
              <p className="text-[18px] font-semibold leading-snug">
                {report.pageCount} sayfada {issues.length} sorun bulundu
                {previous && previous.id !== report.id && (
                  <>; önceki denetimde puan {previous.score}{report.score !== previous.score && ` idi (${report.score > previous.score ? "+" : ""}${report.score - previous.score})`}</>
                )}
                .
              </p>
              <p className="mt-2 text-[14px] text-[var(--seo-ink-3)]">{formatDate(report.finishedAt)}</p>
              <div className="mt-5">
                <SegmentMeter done={fixedCount} total={issues.length} label="Düzeltilen sorun" />
                <p className="mt-2 text-[13px] text-[var(--seo-ink-3)]">Düzelttiğinizi işaretleyin; bir sonraki denetim gerçekten düzelip düzelmediğini gösterir.</p>
              </div>
            </div>
          </div>

          {CATEGORIES.map((cat) => {
            const list = issues
              .filter((i) => i.category === cat)
              .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || b.pages.length - a.pages.length);
            return (
              <Section key={cat} title={cat} aside={list.length ? `${list.length} sorun` : "sorun yok"}>
                {list.length === 0 ? (
                  <p className="text-[15px] text-[var(--seo-ink-3)]">Bu başlıkta kontrollerin hepsi geçti.</p>
                ) : (
                  <ul>
                    {list.map((issue) => (
                      <IssueRow key={issue.code} issue={issue} fixed={Boolean(fixed[issue.code])} onToggle={() => toggleFixed(issue.code)} />
                    ))}
                  </ul>
                )}
              </Section>
            );
          })}

          <Section title="Taranan sayfalar" aside={<button className="seo-link" onClick={() => setShowPages((s) => !s)}>{showPages ? "Gizle" : `${report.pages.length} sayfayı göster`}</button>}>
            {showPages && (
              <div className="overflow-x-auto">
                <table className="seo-table">
                  <thead>
                    <tr>
                      <th>Sayfa</th>
                      <th className="num">Durum</th>
                      <th className="num">Süre</th>
                      <th className="num">Kelime</th>
                      <th>Şema</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.pages.map((p) => (
                      <tr key={p.path}>
                        <td className="seo-mono max-w-[380px] truncate text-[13px]">{p.path}</td>
                        <td className={`num ${p.status !== 200 ? "font-bold text-[var(--seo-danger)]" : ""}`}>{p.status || "—"}</td>
                        <td className="num">{(p.ms / 1000).toFixed(1)} sn</td>
                        <td className="num">{p.words}</td>
                        <td className="text-[13px] text-[var(--seo-ink-2)]">{p.schemaTypes.slice(0, 3).join(", ") || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {history.length > 1 && (
            <Section title="Geçmiş denetimler">
              <table className="seo-table max-w-[560px]">
                <thead>
                  <tr><th>Tarih</th><th className="num">Puan</th><th className="num">Sorun</th><th className="num">Sayfa</th></tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id}>
                      <td>{formatDate(h.finishedAt)}</td>
                      <td className="num font-bold">{h.score}</td>
                      <td className="num">{h.issueCount}</td>
                      <td className="num">{h.pageCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}
        </>
      )}
    </>
  );
}

function IssueRow({ issue, fixed, onToggle }: { issue: Issue; fixed: boolean; onToggle: () => void }) {
  // Durum sayfasından #kod ile gelinirse satır açık başlar (satırlar yalnızca istemcide, veri gelince çizilir)
  const [open, setOpen] = useState(() => typeof window !== "undefined" && window.location.hash === `#${issue.code}`);
  const reduce = useReducedMotion();
  const panelId = `issue-${issue.code}`;

  return (
    <li id={issue.code} className="scroll-mt-24 border-t border-[var(--seo-rule)] first:border-t-0">
      <div className="grid grid-cols-[64px_1fr_auto] items-baseline gap-4 py-4 sm:grid-cols-[72px_1fr_auto_auto]">
        <SeverityWord severity={issue.severity} />
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          className={`text-left text-[17px] font-semibold leading-snug ${fixed ? "text-[var(--seo-ink-3)] line-through decoration-1" : ""}`}
        >
          {issue.title}
          {issue.detail && <span className="ml-2 text-[14px] font-normal text-[var(--seo-ink-2)]">{issue.detail}</span>}
        </button>
        <span className="hidden text-[13px] tabular-nums text-[var(--seo-ink-3)] sm:inline">
          {issue.pages.length ? `${issue.pages.length} sayfa` : "site geneli"}
        </span>
        <label className="flex cursor-pointer items-center gap-2 text-[13px] font-semibold text-[var(--seo-ink-2)]">
          <input type="checkbox" checked={fixed} onChange={onToggle} className="h-4 w-4 accent-[var(--seo-ink)]" />
          Düzelttim
        </label>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="grid gap-6 pb-6 sm:pl-[88px] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
              <p className="text-[15px] leading-relaxed">{issue.fix}</p>
              {issue.pages.length > 0 && (
                <ul className="seo-mono max-h-[260px] space-y-1 overflow-y-auto text-[13px] text-[var(--seo-ink-2)]">
                  {issue.pages.slice(0, 60).map((p) => (
                    <li key={p} className="truncate">{p}</li>
                  ))}
                  {issue.pages.length > 60 && <li className="text-[var(--seo-ink-3)]">ve {issue.pages.length - 60} sayfa daha</li>}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
