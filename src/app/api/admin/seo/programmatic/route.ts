import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyzeHtml, collectSiteFacts, toPath, visibleText } from "@/lib/seo/audit";
import { searchVolumes } from "@/lib/seo/dataforseo";
import { dfsErrorResponse, requireSeoAdmin } from "@/lib/seo/guard";
import { buildPatterns, shingleSimilarity } from "@/lib/seo/programmatic";
import { SITE_URL } from "@/lib/seo/site";
import { turkeyCities } from "@/lib/turkey-cities";

export const maxDuration = 60;

const SAMPLE_CITIES = ["istanbul", "ankara", "izmir", "van", "rize", "adana"];

export async function GET() {
  const denied = await requireSeoAdmin();
  if (denied) return denied;

  const [facts, hotels] = await Promise.all([
    collectSiteFacts(),
    prisma.hotel.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { distanceMeters: "asc" } }).catch(() => []),
  ]);
  const existing = new Set(facts.sitemapUrls.map(toPath).filter(Boolean) as string[]);

  const samples = await Promise.all(
    SAMPLE_CITIES.map(async (slug) => {
      const path = `/${slug}-cikisli-bireysel-umre`;
      try {
        const res = await fetch(new URL(path, SITE_URL), { cache: "no-store", signal: AbortSignal.timeout(15_000) });
        const html = await res.text();
        const page = analyzeHtml(path, html, res.status, 0, null);
        return { path, status: res.status, title: page.title, description: page.description, words: page.words, text: visibleText(html) };
      } catch {
        return { path, status: 0, title: "", description: "", words: 0, text: "" };
      }
    }),
  );

  const usable = samples.filter((s) => s.status === 200 && s.text);
  const pairs: number[] = [];
  for (let i = 0; i < usable.length; i++)
    for (let j = i + 1; j < usable.length; j++) pairs.push(shingleSimilarity(usable[i].text, usable[j].text));
  const similarity = pairs.length ? pairs.reduce((a, b) => a + b, 0) / pairs.length : null;

  const year = new Date().getFullYear();
  const patterns = buildPatterns(hotels, year).map((p) => ({
    ...p,
    candidates: p.candidates.map((c) => ({ ...c, covered: c.covers.some((path) => existing.has(path)) })),
  }));

  return NextResponse.json({
    city: {
      pageCount: turkeyCities.length,
      inSitemap: turkeyCities.filter((c) => existing.has(`/${c.slug}-cikisli-bireysel-umre`)).length,
      similarity,
      samples: samples.map(({ path, status, title, description, words }) => ({ path, status, title, description, words })),
    },
    patterns,
  });
}

/** { keywords } → Google Ads aylık arama hacmi */
export async function POST(req: Request) {
  const denied = await requireSeoAdmin();
  if (denied) return denied;
  const { keywords } = (await req.json()) as { keywords?: string[] };
  if (!keywords?.length) return NextResponse.json({ error: "Kelime listesi boş." }, { status: 400 });
  try {
    const { data, cost } = await searchVolumes(keywords);
    return NextResponse.json({ volumes: data, cost });
  } catch (e) {
    return dfsErrorResponse(e);
  }
}
