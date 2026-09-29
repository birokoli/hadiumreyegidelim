import { NextResponse } from "next/server";
import { buildIssues, collectSiteFacts, fetchPage, scoreIssues, toPath, type AuditReport, type PageResult } from "@/lib/seo/audit";
import { readJson, SEO_KEYS, writeJson } from "@/lib/seo/store";
import { requireSeoAdmin } from "@/lib/seo/guard";

export const maxDuration = 300;

const CONCURRENCY = 6;
const MAX_PAGES = 400;

type HistoryEntry = { id: string; finishedAt: string; score: number; issueCount: number; pageCount: number };

export async function GET() {
  const denied = await requireSeoAdmin();
  if (denied) return denied;
  const [report, history, fixed] = await Promise.all([
    readJson<AuditReport | null>(SEO_KEYS.audit, null),
    readJson<HistoryEntry[]>(SEO_KEYS.auditHistory, []),
    readJson<Record<string, boolean>>(SEO_KEYS.auditFixed, {}),
  ]);
  return NextResponse.json({ report, history, fixed });
}

/** Düzeltildi işareti: { code, fixed } */
export async function PATCH(req: Request) {
  const denied = await requireSeoAdmin();
  if (denied) return denied;
  const { code, fixed } = (await req.json()) as { code?: string; fixed?: boolean };
  if (!code) return NextResponse.json({ error: "code gerekli." }, { status: 400 });
  const map = await readJson<Record<string, boolean>>(SEO_KEYS.auditFixed, {});
  if (fixed) map[code] = true;
  else delete map[code];
  await writeJson(SEO_KEYS.auditFixed, map);
  return NextResponse.json({ fixed: map });
}

/**
 * Denetimi başlatır ve ilerlemeyi NDJSON olarak akıtır:
 * {type:"plan",total} → {type:"page",done,total,path} … → {type:"done",report}
 */
export async function POST() {
  const denied = await requireSeoAdmin();
  if (denied) return denied;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      const startedAt = new Date().toISOString();
      try {
        const facts = await collectSiteFacts();
        const paths = [...new Set(facts.sitemapUrls.map(toPath).filter((p): p is string => Boolean(p)))].slice(0, MAX_PAGES);
        if (paths.length === 0) paths.push("/");
        send({ type: "plan", total: paths.length });

        const pages: PageResult[] = [];
        let cursor = 0;
        const worker = async () => {
          while (cursor < paths.length) {
            const path = paths[cursor++];
            const page = await fetchPage(path);
            pages.push(page);
            send({ type: "page", done: pages.length, total: paths.length, path, status: page.status });
          }
        };
        await Promise.all(Array.from({ length: CONCURRENCY }, worker));

        const issues = buildIssues(facts, pages);
        const report: AuditReport = {
          id: `audit_${Date.now()}`,
          startedAt,
          finishedAt: new Date().toISOString(),
          score: scoreIssues(issues, pages.length),
          pageCount: pages.length,
          issues,
          pages: pages
            .map(({ path, status, ms, title, words, schemaTypes }) => ({ path, status, ms, title, words, schemaTypes }))
            .sort((a, b) => a.path.localeCompare(b.path, "tr")),
        };

        let saveError: string | null = null;
        try {
          const history = await readJson<HistoryEntry[]>(SEO_KEYS.auditHistory, []);
          await Promise.all([
            writeJson(SEO_KEYS.audit, report),
            writeJson(SEO_KEYS.auditHistory, [
              { id: report.id, finishedAt: report.finishedAt, score: report.score, issueCount: issues.length, pageCount: pages.length },
              ...history,
            ].slice(0, 20)),
            // yeni denetim eski "düzeltildi" işaretlerini sıfırlar; hâlâ duran sorun yeniden görünür
            writeJson(SEO_KEYS.auditFixed, {}),
          ]);
        } catch (e) {
          // tarama boşa gitmesin: rapor yine gösterilir, yalnızca kaydedilemediği söylenir
          console.error("[seo] denetim kaydedilemedi", e);
          saveError = "Denetim tamamlandı ama veritabanına kaydedilemedi.";
        }
        send({ type: "done", report, saveError });
      } catch (e) {
        send({ type: "error", error: e instanceof Error ? e.message : String(e) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
