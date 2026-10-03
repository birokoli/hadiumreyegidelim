import { NextResponse } from "next/server";
import { dfsErrorResponse, requireSeoAdmin } from "@/lib/seo/guard";
import { buildGapSnapshot, type GapSnapshot } from "@/lib/seo/gaps";
import { SITE_DOMAIN } from "@/lib/seo/site";
import { readJson, SEO_KEYS, writeJson } from "@/lib/seo/store";

export const maxDuration = 180;

export async function GET() {
  const denied = await requireSeoAdmin();
  if (denied) return denied;
  const [snapshot, comp] = await Promise.all([readJson<GapSnapshot | null>(SEO_KEYS.gaps, null), readJson<{ domains: string[] }>(SEO_KEYS.competitors, { domains: [] })]);
  return NextResponse.json({ snapshot, competitors: comp.domains });
}

/** Rakipler sayfasında kayıtlı alan adlarıyla açık analizini çalıştırır */
export async function POST() {
  const denied = await requireSeoAdmin();
  if (denied) return denied;
  const comp = await readJson<{ domains: string[] }>(SEO_KEYS.competitors, { domains: [] });
  if (!comp.domains.length) return NextResponse.json({ error: "Önce Rakipler sayfasında rakip alan adlarını girin." }, { status: 400 });
  try {
    const snapshot = await buildGapSnapshot(SITE_DOMAIN, comp.domains);
    await writeJson(SEO_KEYS.gaps, snapshot);
    return NextResponse.json({ snapshot, competitors: comp.domains });
  } catch (e) {
    return dfsErrorResponse(e);
  }
}
