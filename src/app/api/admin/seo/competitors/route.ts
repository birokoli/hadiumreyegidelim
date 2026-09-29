import { NextResponse } from "next/server";
import { backlinkSummary, domainOverview, rankedKeywords, type BacklinkSummary } from "@/lib/seo/dataforseo";
import type { CompetitorSnapshot } from "@/lib/seo/types";
import { dfsErrorResponse, requireSeoAdmin } from "@/lib/seo/guard";
import { normalizeDomain, SITE_DOMAIN } from "@/lib/seo/site";
import { readJson, SEO_KEYS, writeJson } from "@/lib/seo/store";

export const maxDuration = 120;

type Stored = { domains: string[]; snapshot: CompetitorSnapshot | null };

export async function GET() {
  const denied = await requireSeoAdmin();
  if (denied) return denied;
  return NextResponse.json(await readJson<Stored>(SEO_KEYS.competitors, { domains: [], snapshot: null }));
}

/** { domains: string[] } → kaydeder ve hepsini (bizim alan adı dahil) çeker */
export async function POST(req: Request) {
  const denied = await requireSeoAdmin();
  if (denied) return denied;
  const { domains } = (await req.json()) as { domains?: string[] };
  const list = [...new Set((domains ?? []).map(normalizeDomain).filter((d) => d && d !== SITE_DOMAIN))].slice(0, 5);

  try {
    let cost = 0;
    let backlinkError: string | null = null;
    const rows = await Promise.all(
      [SITE_DOMAIN, ...list].map(async (domain) => {
        const overview = await domainOverview(domain);
        cost += overview.cost;
        let backlinks: BacklinkSummary | null = null;
        try {
          const b = await backlinkSummary(domain);
          cost += b.cost;
          backlinks = b.data;
        } catch (e) {
          backlinkError = e instanceof Error ? e.message : String(e);
        }
        return { ...overview.data, backlinks };
      }),
    );
    const ours = await rankedKeywords(SITE_DOMAIN, 30);
    cost += ours.cost;

    const stored: Stored = {
      domains: list,
      snapshot: { checkedAt: new Date().toISOString(), rows, ours: ours.data, backlinkError, cost },
    };
    await writeJson(SEO_KEYS.competitors, stored);
    return NextResponse.json(stored);
  } catch (e) {
    return dfsErrorResponse(e);
  }
}
