// Site denetimi: sitemap'teki sayfaları sunucu tarafında çeker ve sabit
// kurallarla kontrol eder. DataForSEO gerektirmez, ücretsizdir.
// Not: yalnızca sunucudan gelen HTML okunur; tarayıcıda JS ile eklenen
// JSON-LD burada görünmez (Next.js sayfalarında şema sunucuda basıldığı
// için bu sitede sorun değil).

import { SITE_URL } from "./site";

const UA = "HadiUmreyeSEO/1.0 (+admin site denetimi)";
const PAGE_TIMEOUT_MS = 15_000;

export type Severity = "kritik" | "yüksek" | "orta" | "düşük";
export type Category = "Taranabilirlik" | "Sayfa içi" | "İçerik" | "Yapısal veri ve AI";

export type PageResult = {
  path: string;
  status: number;
  finalPath: string | null;
  ms: number;
  title: string;
  description: string;
  h1Count: number;
  canonical: string | null;
  noindex: boolean;
  images: number;
  imagesNoAlt: number;
  schemaTypes: string[];
  words: number;
  hasLang: boolean;
  hasViewport: boolean;
  hasOgImage: boolean;
  links: string[];
  error?: string;
};

export type Issue = {
  code: string;
  category: Category;
  severity: Severity;
  title: string;
  fix: string;
  pages: string[];
  detail?: string;
};

export type SiteFacts = {
  robots: string | null;
  sitemapUrls: string[];
  hasLlmsTxt: boolean;
  httpRedirectsToHttps: boolean | null;
  wwwResolvesToApex: boolean | null;
};

export type AuditReport = {
  id: string;
  startedAt: string;
  finishedAt: string;
  score: number;
  pageCount: number;
  issues: Issue[];
  pages: Pick<PageResult, "path" | "status" | "ms" | "title" | "words" | "schemaTypes">[];
};

// ─── HTML yardımcıları ───────────────────────────────────────────────────

function decode(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function attrs(tag: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tag))) out[m[1].toLowerCase()] = m[3] ?? m[4] ?? m[5] ?? "";
  // değersiz nitelikler (ör. <img alt>)
  for (const bare of tag.replace(re, "").matchAll(/\s([a-zA-Z-]+)(?=[\s/>])/g)) {
    if (!(bare[1].toLowerCase() in out)) out[bare[1].toLowerCase()] = "";
  }
  return out;
}

function collectSchemaTypes(node: unknown, into: Set<string>) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) return node.forEach((n) => collectSchemaTypes(n, into));
  const obj = node as Record<string, unknown>;
  const t = obj["@type"];
  if (typeof t === "string") into.add(t);
  if (Array.isArray(t)) t.forEach((x) => typeof x === "string" && into.add(x));
  if (obj["@graph"]) collectSchemaTypes(obj["@graph"], into);
  for (const v of Object.values(obj)) if (v && typeof v === "object") collectSchemaTypes(v, into);
}

export function toPath(href: string): string | null {
  try {
    const u = new URL(href, SITE_URL);
    const host = u.hostname.replace(/^www\./, "");
    if (host !== new URL(SITE_URL).hostname) return null;
    const p = u.pathname.replace(/\/+$/, "") || "/";
    return decodeURIComponent(p);
  } catch {
    return null;
  }
}

/** Görünen ana metin (script/style/nav/footer hariç). Programatik benzerlik için de kullanılır. */
export function visibleText(html: string) {
  const body = html.match(/<body[\s\S]*<\/body>/i)?.[0] ?? html;
  return decode(
    body
      .replace(/<(script|style|noscript|svg|nav|footer|header)\b[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  );
}

export function analyzeHtml(path: string, html: string, status: number, ms: number, finalPath: string | null): PageResult {
  const head = html.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? html;
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => attrs(m[0]));
  const linksHead = [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => attrs(m[0]));
  const meta = (name: string) =>
    metas.find((a) => (a.name ?? a.property ?? "").toLowerCase() === name)?.content ?? null;

  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map((m) => attrs(m[0]));
  const types = new Set<string>();
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      collectSchemaTypes(JSON.parse(m[1].trim()), types);
    } catch {
      /* bozuk JSON-LD: tip sayılmaz */
    }
  }

  const links = new Set<string>();
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["']/gi)) {
    const p = toPath(m[1]);
    if (p) links.add(p);
  }

  const text = visibleText(html);
  const canonical = linksHead.find((a) => (a.rel ?? "").toLowerCase() === "canonical")?.href ?? null;
  const robots = (meta("robots") ?? "").toLowerCase();

  return {
    path,
    status,
    finalPath,
    ms,
    title: decode(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""),
    description: decode(meta("description") ?? ""),
    h1Count: (html.match(/<h1[\s>]/gi) ?? []).length,
    canonical,
    noindex: robots.includes("noindex"),
    images: imgs.length,
    imagesNoAlt: imgs.filter((a) => !("alt" in a)).length,
    schemaTypes: [...types],
    words: text ? text.split(/\s+/).length : 0,
    hasLang: /<html[^>]*\slang=["'][a-z]/i.test(html),
    hasViewport: metas.some((a) => (a.name ?? "").toLowerCase() === "viewport"),
    hasOgImage: Boolean(meta("og:image")),
    links: [...links],
  };
}

export async function fetchPage(path: string): Promise<PageResult> {
  const started = Date.now();
  try {
    const res = await fetch(new URL(path, SITE_URL), {
      headers: { "User-Agent": UA, Accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
      cache: "no-store",
    });
    const html = await res.text();
    const ms = Date.now() - started;
    const finalPath = res.redirected ? toPath(res.url) : null;
    return analyzeHtml(path, html, res.status, ms, finalPath && finalPath !== path ? finalPath : null);
  } catch (e) {
    return {
      path, status: 0, finalPath: null, ms: Date.now() - started, title: "", description: "", h1Count: 0,
      canonical: null, noindex: false, images: 0, imagesNoAlt: 0, schemaTypes: [], words: 0,
      hasLang: false, hasViewport: false, hasOgImage: false, links: [],
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

async function fetchText(url: string): Promise<{ status: number; text: string; finalUrl: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      redirect: "follow",
      signal: AbortSignal.timeout(PAGE_TIMEOUT_MS),
      cache: "no-store",
    });
    return { status: res.status, text: await res.text(), finalUrl: res.url };
  } catch {
    return null;
  }
}

export async function collectSiteFacts(): Promise<SiteFacts> {
  const apex = new URL(SITE_URL).hostname;
  const [robots, sitemap, llms, http, www] = await Promise.all([
    fetchText(`${SITE_URL}/robots.txt`),
    fetchText(`${SITE_URL}/sitemap.xml`),
    fetchText(`${SITE_URL}/llms.txt`),
    fetchText(`http://${apex}/`),
    fetchText(`https://www.${apex}/`),
  ]);

  const sitemapUrls =
    sitemap && sitemap.status === 200
      ? [...sitemap.text.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => decode(m[1]))
      : [];

  return {
    robots: robots && robots.status === 200 ? robots.text : null,
    sitemapUrls,
    hasLlmsTxt: Boolean(llms && llms.status === 200 && !/<html/i.test(llms.text.slice(0, 500))),
    httpRedirectsToHttps: http ? http.finalUrl.startsWith("https://") : null,
    wwwResolvesToApex: www ? new URL(www.finalUrl).hostname === apex : null,
  };
}

// ─── Kurallar ────────────────────────────────────────────────────────────

const AI_BOTS = ["GPTBot", "ChatGPT-User", "OAI-SearchBot", "PerplexityBot", "ClaudeBot", "Google-Extended"];

/** robots.txt içinde belirli bir user-agent için "Disallow: /" var mı */
function robotsBlocks(robots: string, agent: string) {
  const groups = robots.split(/\n(?=\s*user-agent:)/i);
  return groups.some((g) => {
    const agents = [...g.matchAll(/user-agent:\s*(.+)/gi)].map((m) => m[1].trim().toLowerCase());
    if (!agents.includes(agent.toLowerCase())) return false;
    return /^\s*disallow:\s*\/\s*$/im.test(g);
  });
}

function dupes(pages: PageResult[], pick: (p: PageResult) => string) {
  const byValue = new Map<string, string[]>();
  for (const p of pages) {
    const v = pick(p);
    if (!v) continue;
    byValue.set(v, [...(byValue.get(v) ?? []), p.path]);
  }
  return [...byValue.values()].filter((paths) => paths.length > 1).flat();
}

export function buildIssues(facts: SiteFacts, pages: PageResult[]): Issue[] {
  const issues: Issue[] = [];
  const add = (issue: Omit<Issue, "pages"> & { pages?: string[] }) => {
    const list = issue.pages ?? [];
    if (issue.pages && list.length === 0) return;
    issues.push({ ...issue, pages: list });
  };
  const ok = pages.filter((p) => p.status === 200);
  const where = (fn: (p: PageResult) => boolean) => ok.filter(fn).map((p) => p.path);

  // Taranabilirlik
  if (facts.robots === null) {
    add({ code: "robots-missing", category: "Taranabilirlik", severity: "kritik", title: "robots.txt okunamadı", fix: "src/app/robots.ts dosyasının canlıda /robots.txt olarak 200 döndüğünü kontrol edin." });
  } else {
    if (robotsBlocks(facts.robots, "*")) add({ code: "robots-blocks-all", category: "Taranabilirlik", severity: "kritik", title: "robots.txt tüm siteyi kapatıyor", fix: "User-agent: * altındaki \"Disallow: /\" satırını kaldırın." });
    if (!/^\s*sitemap:/im.test(facts.robots)) add({ code: "robots-no-sitemap", category: "Taranabilirlik", severity: "düşük", title: "robots.txt sitemap adresini vermiyor", fix: "robots.txt sonuna \"Sitemap: https://hadiumreyegidelim.com/sitemap.xml\" ekleyin." });
    const blocked = AI_BOTS.filter((b) => robotsBlocks(facts.robots!, b));
    if (blocked.length) add({ code: "ai-bots-blocked", category: "Yapısal veri ve AI", severity: "yüksek", title: "AI arama botları engellenmiş", detail: blocked.join(", "), fix: "Bu botlar engelliyken ChatGPT, Perplexity ve Claude siteyi kaynak gösteremez. Engeli kaldırın ya da yalnızca eğitim botlarını (CCBot) kapatın." });
  }
  if (facts.sitemapUrls.length === 0) add({ code: "sitemap-missing", category: "Taranabilirlik", severity: "kritik", title: "sitemap.xml boş ya da okunamadı", fix: "src/app/sitemap.ts çıktısını canlıda kontrol edin; veritabanı hatasında boş liste dönüyor olabilir." });
  if (facts.httpRedirectsToHttps === false) add({ code: "https-redirect", category: "Taranabilirlik", severity: "yüksek", title: "http:// adresi https:// adresine yönlenmiyor", fix: "Vercel alan adı ayarlarında HTTPS yönlendirmesini açın." });
  if (facts.wwwResolvesToApex === false) add({ code: "www-split", category: "Taranabilirlik", severity: "orta", title: "www. ve www'suz adres ayrı çalışıyor", fix: "Vercel'de www.hadiumreyegidelim.com için hadiumreyegidelim.com'a 308 yönlendirmesi tanımlayın." });

  add({ code: "status-error", category: "Taranabilirlik", severity: "kritik", title: "Sitemap'teki sayfa hata döndürüyor", pages: pages.filter((p) => p.status !== 200).map((p) => `${p.path} (${p.status || p.error || "yanıt yok"})`), fix: "Sayfayı düzeltin ya da sitemap'ten çıkarın. Google hata veren URL'leri indeksten düşürür." });
  add({ code: "redirected", category: "Taranabilirlik", severity: "orta", title: "Sitemap yönlendirilen URL içeriyor", pages: ok.filter((p) => p.finalPath).map((p) => `${p.path} → ${p.finalPath}`), fix: "Sitemap'e yönlendirmenin son adresini yazın." });
  add({ code: "noindex", category: "Taranabilirlik", severity: "kritik", title: "Sitemap'teki sayfa noindex", pages: where((p) => p.noindex), fix: "Sayfa indekslenmeli ise robots meta etiketini kaldırın; indekslenmemeli ise sitemap'ten çıkarın." });
  add({ code: "canonical-missing", category: "Taranabilirlik", severity: "orta", title: "Canonical etiketi yok", pages: where((p) => !p.canonical), fix: "generateMetadata içine alternates.canonical ekleyin." });
  add({
    code: "canonical-other", category: "Taranabilirlik", severity: "yüksek", title: "Canonical başka bir sayfayı gösteriyor",
    pages: ok.filter((p) => p.canonical && toPath(p.canonical) !== null && toPath(p.canonical) !== p.path).map((p) => `${p.path} → ${toPath(p.canonical!)}`),
    fix: "Her benzersiz sayfa kendi adresini canonical olarak vermeli. Bilerek birleştirilen sayfalar değilse düzeltin.",
  });
  const linked = new Set(ok.flatMap((p) => p.links));
  add({ code: "orphan", category: "Taranabilirlik", severity: "orta", title: "Hiçbir sayfadan link almayan sayfa", pages: where((p) => p.path !== "/" && !linked.has(p.path)), fix: "Bu sayfalara ilgili hub sayfasından (paketler, blog, şehir listesi) link verin. Sadece sitemap'te duran sayfa zayıf sinyal alır." });

  // Sayfa içi
  add({ code: "title-missing", category: "Sayfa içi", severity: "kritik", title: "Title etiketi yok", pages: where((p) => !p.title), fix: "Sayfaya metadata.title ekleyin." });
  add({ code: "title-long", category: "Sayfa içi", severity: "düşük", title: "Title 60 karakterden uzun", pages: ok.filter((p) => p.title.length > 60).map((p) => `${p.path} (${p.title.length} karakter)`), fix: "Google'da kesilir. Ana kelimeyi başa alıp marka adını kısaltın." });
  add({ code: "title-short", category: "Sayfa içi", severity: "düşük", title: "Title 30 karakterden kısa", pages: where((p) => p.title.length > 0 && p.title.length < 30), fix: "Hedef kelimeyi ve sayfanın ne sunduğunu ekleyin." });
  add({ code: "title-duplicate", category: "Sayfa içi", severity: "orta", title: "Aynı title birden fazla sayfada", pages: dupes(ok, (p) => p.title), fix: "Her sayfaya kendi konusunu anlatan bir title yazın; aynı title kanibalizasyona yol açar." });
  add({ code: "desc-missing", category: "Sayfa içi", severity: "orta", title: "Meta description yok", pages: where((p) => !p.description), fix: "150–160 karakterlik, sayfaya özel bir açıklama ekleyin. Yoksa Google sayfadan rastgele cümle seçer." });
  add({ code: "desc-length", category: "Sayfa içi", severity: "düşük", title: "Meta description 70–160 karakter aralığında değil", pages: where((p) => p.description.length > 0 && (p.description.length < 70 || p.description.length > 160)), fix: "Açıklamayı 70–160 karaktere çekin." });
  add({ code: "desc-duplicate", category: "Sayfa içi", severity: "orta", title: "Aynı meta description birden fazla sayfada", pages: dupes(ok, (p) => p.description), fix: "Şablonla üretilen sayfalarda açıklamaya sayfaya özgü bir bilgi (şehir, havalimanı, fiyat) koyun." });
  add({ code: "h1-missing", category: "Sayfa içi", severity: "yüksek", title: "H1 başlığı yok", pages: where((p) => p.h1Count === 0), fix: "Sayfanın ana başlığını <h1> olarak işaretleyin." });
  add({ code: "h1-multiple", category: "Sayfa içi", severity: "düşük", title: "Birden fazla H1", pages: ok.filter((p) => p.h1Count > 1).map((p) => `${p.path} (${p.h1Count})`), fix: "Tek H1 bırakın, diğerlerini H2 yapın." });
  add({ code: "img-alt", category: "Sayfa içi", severity: "orta", title: "Alt metni olmayan görseller", pages: ok.filter((p) => p.imagesNoAlt > 0).map((p) => `${p.path} (${p.imagesNoAlt}/${p.images})`), fix: "Görsele ne gösterdiğini anlatan alt metni ekleyin. Süs görselleri için alt=\"\" kullanın." });
  add({ code: "lang-missing", category: "Sayfa içi", severity: "orta", title: "<html lang> yok", pages: where((p) => !p.hasLang), fix: "Kök layout'ta <html lang=\"tr\"> kullanın." });
  add({ code: "viewport-missing", category: "Sayfa içi", severity: "yüksek", title: "Viewport meta etiketi yok", pages: where((p) => !p.hasViewport), fix: "Mobil uyumluluk için viewport etiketini ekleyin." });
  add({ code: "og-image-missing", category: "Sayfa içi", severity: "düşük", title: "Paylaşım görseli (og:image) yok", pages: where((p) => !p.hasOgImage), fix: "WhatsApp ve sosyal medyada paylaşıldığında görsel çıkması için metadata.openGraph.images ekleyin." });

  // İçerik
  add({ code: "thin", category: "İçerik", severity: "orta", title: "250 kelimeden az içerik", pages: ok.filter((p) => p.words < 250).map((p) => `${p.path} (${p.words} kelime)`), fix: "Sayfanın sorusunu cevaplayan içerik ekleyin: fiyat aralığı, süre, otel mesafesi, vize adımı gibi somut bilgiler." });
  add({ code: "slow", category: "İçerik", severity: "orta", title: "Yanıt süresi 1,5 saniyeden uzun", pages: ok.filter((p) => p.ms > 1500).map((p) => `${p.path} (${(p.ms / 1000).toFixed(1)} sn)`), fix: "Sayfa sunucuda her istekte veritabanına gidiyor olabilir. Önbellek (revalidate) ekleyin." });

  // Yapısal veri ve AI
  add({ code: "schema-missing", category: "Yapısal veri ve AI", severity: "orta", title: "JSON-LD yapısal veri yok", pages: where((p) => p.schemaTypes.length === 0), fix: "Sayfa türüne uygun şema ekleyin: blog için BlogPosting, paket için Product/Offer, SSS için FAQPage." });
  add({ code: "blog-no-article", category: "Yapısal veri ve AI", severity: "orta", title: "Blog yazısında Article şeması yok", pages: where((p) => p.path.startsWith("/blog/") && !p.path.startsWith("/blog/kategori") && !p.schemaTypes.some((t) => /Article|BlogPosting/.test(t))), fix: "Yazar, yayın ve güncellenme tarihiyle BlogPosting ekleyin. AI arama motorları tarihsiz içeriği daha az kaynak gösterir." });
  add({ code: "package-no-product", category: "Yapısal veri ve AI", severity: "orta", title: "Paket sayfasında fiyat şeması yok", pages: where((p) => p.path.startsWith("/paketler/") && !p.schemaTypes.some((t) => /Product|Offer|Trip|TouristTrip/.test(t))), fix: "Fiyat ve para birimiyle Product + Offer (veya TouristTrip) ekleyin." });
  if (!facts.hasLlmsTxt) add({ code: "llms-missing", category: "Yapısal veri ve AI", severity: "düşük", title: "/llms.txt yok", fix: "AI sistemlerine sitenin ne sunduğunu ve ana sayfalarını anlatan kısa bir /llms.txt ekleyin." });

  return issues;
}

const WEIGHTS: Record<Severity, number> = { kritik: 12, yüksek: 7, orta: 4, düşük: 2 };

/** 100'den başlar; her kural bir kez ceza keser, etkilenen sayfa oranı cezayı büyütür. */
export function scoreIssues(issues: Issue[], pageCount: number) {
  const penalty = issues.reduce((sum, i) => {
    const ratio = i.pages.length === 0 ? 1 : Math.min(1, i.pages.length / Math.max(1, pageCount));
    return sum + WEIGHTS[i.severity] * (0.4 + 0.6 * ratio);
  }, 0);
  return Math.max(0, Math.round(100 - penalty));
}
