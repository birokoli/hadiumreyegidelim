import { NextResponse } from "next/server";
import type { AuditReport } from "@/lib/seo/audit";
import { isDataforseoConfigured } from "@/lib/seo/dataforseo";
import { requireSeoAdmin } from "@/lib/seo/guard";
import { readJson, SEO_KEYS } from "@/lib/seo/store";
import type { CompetitorSnapshot, TrackedKeyword } from "@/lib/seo/types";

/** Genel durum sayfası için tek istekte özet */
export async function GET() {
  const denied = await requireSeoAdmin();
  if (denied) return denied;

  const [report, fixed, tracked, competitors] = await Promise.all([
    readJson<AuditReport | null>(SEO_KEYS.audit, null),
    readJson<Record<string, boolean>>(SEO_KEYS.auditFixed, {}),
    readJson<TrackedKeyword[]>(SEO_KEYS.tracked, []),
    readJson<{ snapshot: CompetitorSnapshot | null }>(SEO_KEYS.competitors, { snapshot: null }),
  ]);

  return NextResponse.json({
    dataforseo: isDataforseoConfigured(),
    audit: report && {
      score: report.score,
      finishedAt: report.finishedAt,
      pageCount: report.pageCount,
      issues: report.issues.map(({ code, severity, title, category, pages }) => ({
        code, severity, title, category, count: pages.length, fixed: Boolean(fixed[code]),
      })),
    },
    tracked: tracked.map((t) => ({
      keyword: t.keyword,
      position: t.history.at(-1)?.position ?? null,
      previous: t.history.at(-2)?.position ?? null,
      checkedAt: t.history.at(-1)?.date ?? null,
    })),
    ours: competitors.snapshot?.rows[0] ?? null,
  });
}
