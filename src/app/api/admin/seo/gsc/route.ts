// SEO Masası → Search Console. Salt okuma; sonuç 3 saat önbellekte (Search Console verisi günde bir güncellenir).
import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { requireSeoAdmin } from "@/lib/seo/guard";
import { GscError, gscConfigured, gscServiceEmail, resolveSite, searchAnalytics, type GscRow } from "@/lib/seo/gsc";

export const maxDuration = 60;

const ymd = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
const shift = (d: Date, days: number) => new Date(d.getTime() + days * 86_400_000);

function ranges(days: number) {
  const end = shift(new Date(), -2); // Search Console 2–3 gün geriden gelir
  const start = shift(end, -(days - 1));
  const prevEnd = shift(start, -1);
  const prevStart = shift(prevEnd, -(days - 1));
  return { cur: { startDate: ymd(start), endDate: ymd(end) }, prev: { startDate: ymd(prevStart), endDate: ymd(prevEnd) } };
}

const totals = (rows: GscRow[]) => {
  const r = rows[0];
  return r ? { clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position } : { clicks: 0, impressions: 0, ctr: 0, position: 0 };
};
const slim = (rows: GscRow[]) => rows.map((r) => ({ key: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }));

async function load(days: number) {
  const site = await resolveSite();
  const { cur, prev } = ranges(days);
  const [tNow, tPrev, daily, queries, pages, devices, countries, prevQueries] = await Promise.all([
    searchAnalytics(site, { ...cur }),
    searchAnalytics(site, { ...prev }),
    searchAnalytics(site, { ...cur, dimensions: ["date"], rowLimit: 500 }),
    searchAnalytics(site, { ...cur, dimensions: ["query"], rowLimit: 200 }),
    searchAnalytics(site, { ...cur, dimensions: ["page"], rowLimit: 200 }),
    searchAnalytics(site, { ...cur, dimensions: ["device"] }),
    searchAnalytics(site, { ...cur, dimensions: ["country"], rowLimit: 10 }),
    searchAnalytics(site, { ...prev, dimensions: ["query"], rowLimit: 500 }),
  ]);
  const prevPos = new Map(prevQueries.map((r) => [r.keys[0], r.position]));
  return {
    site,
    range: cur,
    prevRange: prev,
    totals: totals(tNow),
    prevTotals: totals(tPrev),
    daily: daily.map((r) => ({ date: r.keys[0], clicks: r.clicks, impressions: r.impressions, position: r.position })),
    queries: slim(queries).map((q) => ({ ...q, prevPosition: prevPos.get(q.key) ?? null })),
    pages: slim(pages),
    devices: slim(devices),
    countries: slim(countries),
    fetchedAt: new Date().toISOString(),
  };
}

const cached = unstable_cache(load, ["gsc-v1"], { revalidate: 3 * 3600, tags: ["gsc"] });

export async function GET(req: Request) {
  const denied = await requireSeoAdmin(["marketing", "dashboard"]);
  if (denied) return denied;
  if (!gscConfigured()) return NextResponse.json({ configured: false });
  const days = [7, 28, 90].includes(Number(new URL(req.url).searchParams.get("days"))) ? Number(new URL(req.url).searchParams.get("days")) : 28;
  try {
    return NextResponse.json({ configured: true, serviceEmail: gscServiceEmail(), ...(await cached(days)) });
  } catch (e) {
    const status = e instanceof GscError ? e.status : 500;
    return NextResponse.json({ configured: true, serviceEmail: gscServiceEmail(), error: e instanceof Error ? e.message : "Search Console okunamadı" }, { status: status === 412 ? 412 : 502 });
  }
}
