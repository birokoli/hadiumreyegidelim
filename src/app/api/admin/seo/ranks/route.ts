import { NextResponse } from "next/server";
import { checkSerpPosition } from "@/lib/seo/dataforseo";
import { dfsErrorResponse, requireSeoAdmin } from "@/lib/seo/guard";
import { SITE_DOMAIN } from "@/lib/seo/site";
import { readJson, SEO_KEYS, writeJson } from "@/lib/seo/store";
import type { TrackedKeyword } from "@/lib/seo/types";

export const maxDuration = 300;

const MAX_TRACKED = 50;

const load = () => readJson<TrackedKeyword[]>(SEO_KEYS.tracked, []);

export async function GET() {
  const denied = await requireSeoAdmin();
  if (denied) return denied;
  return NextResponse.json({ tracked: await load() });
}

type Body =
  | { action: "add"; keywords: string[] }
  | { action: "remove"; keyword: string }
  | { action: "check"; keywords?: string[] };

export async function POST(req: Request) {
  const denied = await requireSeoAdmin();
  if (denied) return denied;
  const body = (await req.json()) as Body;
  const tracked = await load();

  if (body.action === "add") {
    const existing = new Set(tracked.map((t) => t.keyword));
    const fresh = (body.keywords ?? [])
      .map((k) => k.trim().toLocaleLowerCase("tr"))
      .filter((k) => k && !existing.has(k));
    const next = [...tracked, ...[...new Set(fresh)].map((keyword) => ({ keyword, addedAt: new Date().toISOString(), history: [] }))];
    if (next.length > MAX_TRACKED) {
      return NextResponse.json({ error: `En fazla ${MAX_TRACKED} kelime takip edilebilir.` }, { status: 400 });
    }
    await writeJson(SEO_KEYS.tracked, next);
    return NextResponse.json({ tracked: next });
  }

  if (body.action === "remove") {
    const next = tracked.filter((t) => t.keyword !== body.keyword);
    await writeJson(SEO_KEYS.tracked, next);
    return NextResponse.json({ tracked: next });
  }

  if (body.action === "check") {
    const targets = body.keywords?.length ? tracked.filter((t) => body.keywords!.includes(t.keyword)) : tracked;
    let cost = 0;
    const errors: string[] = [];
    const date = new Date().toISOString();
    let cursor = 0;
    const worker = async () => {
      while (cursor < targets.length) {
        const item = targets[cursor++];
        try {
          const { data, cost: c } = await checkSerpPosition(item.keyword, SITE_DOMAIN);
          cost += c;
          item.history = [...item.history, { date, position: data.position, url: data.url }].slice(-60);
          item.topThree = data.topThree;
        } catch (e) {
          // bağlantı yoksa hepsi aynı hatayı verir; ilkinde dur
          if (e instanceof Error && e.message.includes("bağlı değil")) return dfsErrorResponse(e);
          errors.push(`${item.keyword}: ${e instanceof Error ? e.message : e}`);
        }
      }
    };
    const results = await Promise.all(Array.from({ length: 3 }, worker));
    const blocked = results.find((r) => r instanceof Response);
    if (blocked) return blocked;
    await writeJson(SEO_KEYS.tracked, tracked);
    return NextResponse.json({ tracked, cost, errors });
  }

  return NextResponse.json({ error: "Bilinmeyen işlem." }, { status: 400 });
}
