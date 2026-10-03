// SEO açıkları (kullanıcı, 3 Ekim): bize ve rakiplere kim link veriyor, rakiplerin link alıp bizim almadığımız
// siteler, rakiplerin ilk 10'da olup bizim olmadığımız kelimeler. Kaynak DataForSEO (Backlinks + Labs).
import { dfsPost, rankedKeywords, type RankedKeyword } from "@/lib/seo/dataforseo";
import { DFS_LANGUAGE_CODE, DFS_LOCATION_CODE } from "@/lib/seo/site";

export type RefDomain = { domain: string; rank: number | null; backlinks: number | null; spam: number | null; firstSeen: string | null };
export type OurLink = { from: string; fromDomain: string; to: string; anchor: string | null; dofollow: boolean; domainRank: number | null; spam: number | null; firstSeen: string | null };
export type LinkGap = { domain: string; rank: number | null; spam: number | null; linksTo: string[] };
export type KeywordGap = { keyword: string; volume: number | null; best: { domain: string; position: number; url: string }; others: { domain: string; position: number }[]; ourPosition: number | null };

export type GapSnapshot = {
  checkedAt: string;
  cost: number;
  ours: { links: OurLink[]; domains: RefDomain[] };
  competitors: { domain: string; domains: RefDomain[]; error?: string }[];
  linkGap: LinkGap[];
  keywordGap: KeywordGap[];
  errors: string[];
};

const host = (d: string) => d.replace(/^www\./, "");
// Her siteyi otomatik listeleyen "SEO checker / backlink" siteleri: gerçek link fırsatı değil (3 Ekim, ilk analiz)
const SEO_TOOL_SITE = /seo|backlink|checker|dapa|\bda[-.]|dadr|drchecker|rank|traffic|anchorurl|shrink|indexer|webstat|siteprice|worth|whois|similar/i;

export async function referringDomains(target: string, limit = 300) {
  const { result, cost } = await dfsPost<{ items?: { domain?: string; rank?: number; backlinks?: number; backlinks_spam_score?: number; first_seen?: string }[] }>(
    "/v3/backlinks/referring_domains/live",
    [{ target, include_subdomains: true, limit, order_by: ["rank,desc"], exclude_internal_backlinks: true }],
    { timeoutMs: 60000 },
  );
  const data: RefDomain[] = (result?.items ?? [])
    .filter((i) => i.domain)
    .map((i) => ({ domain: host(i.domain!), rank: i.rank ?? null, backlinks: i.backlinks ?? null, spam: i.backlinks_spam_score ?? null, firstSeen: i.first_seen ?? null }));
  return { data, cost };
}

export async function ourBacklinks(target: string, limit = 200) {
  const { result, cost } = await dfsPost<{
    items?: { url_from?: string; domain_from?: string; url_to?: string; anchor?: string; dofollow?: boolean; domain_from_rank?: number; backlink_spam_score?: number; first_seen?: string }[];
  }>("/v3/backlinks/backlinks/live", [{ target, include_subdomains: true, limit, mode: "as_is", order_by: ["domain_from_rank,desc"] }], { timeoutMs: 60000 });
  const data: OurLink[] = (result?.items ?? []).map((i) => ({
    from: i.url_from ?? "",
    fromDomain: host(i.domain_from ?? ""),
    to: i.url_to ?? "",
    anchor: i.anchor ?? null,
    dofollow: i.dofollow ?? false,
    domainRank: i.domain_from_rank ?? null,
    spam: i.backlink_spam_score ?? null,
    firstSeen: i.first_seen ?? null,
  }));
  return { data, cost };
}

/** Rakiplerin ilk 10'da olduğu kelimeler (tahmini ziyarete göre ilk `limit`) */
async function top10Keywords(domain: string, limit = 150) {
  const { result, cost } = await dfsPost<{
    items?: { keyword_data?: { keyword?: string; keyword_info?: { search_volume?: number | null } }; ranked_serp_element?: { serp_item?: { rank_group?: number; url?: string } } }[];
  }>("/v3/dataforseo_labs/google/ranked_keywords/live", [
    {
      target: domain,
      location_code: DFS_LOCATION_CODE,
      language_code: DFS_LANGUAGE_CODE,
      limit,
      filters: ["ranked_serp_element.serp_item.rank_group", "<=", 10],
      order_by: ["ranked_serp_element.serp_item.etv,desc"],
    },
  ]);
  const data = (result?.items ?? [])
    .map((i) => ({ keyword: i.keyword_data?.keyword ?? "", volume: i.keyword_data?.keyword_info?.search_volume ?? null, position: i.ranked_serp_element?.serp_item?.rank_group ?? 0, url: i.ranked_serp_element?.serp_item?.url ?? "" }))
    .filter((k) => k.keyword);
  return { data, cost };
}

export async function buildGapSnapshot(ourDomain: string, competitors: string[]): Promise<GapSnapshot> {
  let cost = 0;
  const errors: string[] = [];
  const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));

  const [linksR, oursR, ourKwR, ...compR] = await Promise.allSettled([
    ourBacklinks(ourDomain),
    referringDomains(ourDomain),
    rankedKeywords(ourDomain, 500),
    ...competitors.map((d) => Promise.all([referringDomains(d), top10Keywords(d)])),
  ]);

  const links = linksR.status === "fulfilled" ? (cost += linksR.value.cost, linksR.value.data) : (errors.push(`Bizim linkler: ${msg(linksR.reason)}`), []);
  const ourDomains = oursR.status === "fulfilled" ? (cost += oursR.value.cost, oursR.value.data) : (errors.push(`Bizim link veren siteler: ${msg(oursR.reason)}`), []);
  const ourKw: RankedKeyword[] = ourKwR.status === "fulfilled" ? (cost += ourKwR.value.cost, ourKwR.value.data) : (errors.push(`Bizim kelimeler: ${msg(ourKwR.reason)}`), []);

  const comps: GapSnapshot["competitors"] = [];
  const kwByComp: { domain: string; rows: { keyword: string; volume: number | null; position: number; url: string }[] }[] = [];
  compR.forEach((r, i) => {
    const domain = competitors[i];
    if (r.status === "fulfilled") {
      const [rd, kw] = r.value;
      cost += rd.cost + kw.cost;
      comps.push({ domain, domains: rd.data });
      kwByComp.push({ domain, rows: kw.data });
    } else {
      comps.push({ domain, domains: [], error: msg(r.reason) });
      errors.push(`${domain}: ${msg(r.reason)}`);
    }
  });

  // Link açığı: en az bir rakibe link verip bize vermeyen siteler; rakip sayısı ve güce göre
  const ourSet = new Set(ourDomains.map((d) => d.domain));
  const competitorHosts = new Set([...competitors.map(host), host(ourDomain)]);
  const gap = new Map<string, LinkGap>();
  for (const c of comps) {
    for (const d of c.domains) {
      if (ourSet.has(d.domain) || competitorHosts.has(d.domain)) continue;
      const g = gap.get(d.domain) ?? { domain: d.domain, rank: d.rank, spam: d.spam, linksTo: [] };
      g.linksTo.push(c.domain);
      g.rank = Math.max(g.rank ?? 0, d.rank ?? 0);
      gap.set(d.domain, g);
    }
  }
  const linkGap = [...gap.values()]
    .filter((g) => (g.spam ?? 0) < 40 && !SEO_TOOL_SITE.test(g.domain))
    .sort((a, b) => b.linksTo.length - a.linksTo.length || (b.rank ?? 0) - (a.rank ?? 0))
    .slice(0, 300);

  // Kelime açığı: rakiplerden en az birinin ilk 10'da olduğu, bizim ilk 10'da olmadığımız kelimeler
  const ourPos = new Map(ourKw.map((k) => [k.keyword.toLocaleLowerCase("tr-TR"), k.position]));
  const kg = new Map<string, KeywordGap>();
  for (const c of kwByComp) {
    for (const k of c.rows) {
      const key = k.keyword.toLocaleLowerCase("tr-TR");
      const mine = ourPos.get(key) ?? null;
      if (mine != null && mine <= 10) continue;
      const g = kg.get(key);
      if (!g) kg.set(key, { keyword: k.keyword, volume: k.volume, best: { domain: c.domain, position: k.position, url: k.url }, others: [], ourPosition: mine });
      else if (k.position < g.best.position) {
        g.others.push({ domain: g.best.domain, position: g.best.position });
        g.best = { domain: c.domain, position: k.position, url: k.url };
      } else g.others.push({ domain: c.domain, position: k.position });
    }
  }
  const keywordGap = [...kg.values()].sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0)).slice(0, 300);

  return { checkedAt: new Date().toISOString(), cost, ours: { links, domains: ourDomains }, competitors: comps, linkGap, keywordGap, errors };
}
