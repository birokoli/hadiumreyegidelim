// AI hazırlık denetimi: AI motorlarının sayfayı bulup alıntılayabilmesi için ölçülebilir
// sinyaller. Liste; awesome-ai-visibility kaynakları, geo-aeo-tracker "AEO Audit"
// (llms.txt, şema, BLUF, başlık yapısı) ve ai-seo skill'indeki çıkarılabilirlik
// kontrollerinden derlendi. Model tahmini yok; her kontrol HTML'den okunur.

import { analyzeHtml, collectSiteFacts, toPath, visibleText } from "@/lib/seo/audit";
import { SITE_URL } from "@/lib/seo/site";

export type Check = { id: string; label: string; pass: boolean; detail: string; fix: string };
export type PageReadiness = { path: string; status: number; score: number; checks: Check[] };
export type Readiness = { checkedAt: string; site: Check[]; pages: PageReadiness[]; score: number };

const AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "Claude-SearchBot", "Google-Extended", "Bingbot"];

function blocked(robots: string, agent: string) {
  return robots.split(/\n(?=\s*user-agent:)/i).some((g) => {
    const agents = [...g.matchAll(/user-agent:\s*(.+)/gi)].map((m) => m[1].trim().toLowerCase());
    return agents.includes(agent.toLowerCase()) && /^\s*disallow:\s*\/\s*$/im.test(g);
  });
}

function jsonLd(html: string) {
  const out: Record<string, unknown>[] = [];
  const walk = (n: unknown) => {
    if (Array.isArray(n)) return n.forEach(walk);
    if (n && typeof n === "object") {
      out.push(n as Record<string, unknown>);
      Object.values(n).forEach(walk);
    }
  };
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      walk(JSON.parse(m[1].trim()));
    } catch {
      /* bozuk blok */
    }
  }
  return out;
}

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const strip = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();

function pageChecks(path: string, html: string): Check[] {
  const page = analyzeHtml(path, html, 200, 0, null);
  const ld = jsonLd(html);
  const types = new Set(page.schemaTypes);
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html.match(/<body[\s\S]*<\/body>/i)?.[0] ?? html;
  const firstP = [...main.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => strip(m[1])).find((t) => words(t) >= 12) ?? "";
  const h2 = [...main.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map((m) => strip(m[1]));
  const text = visibleText(html);
  const numbers = (text.match(/\b\d[\d.,]*\s?(?:%|₺|\$|€|tl|usd|gün|gece|km|metre|m\b|saat)/gi) ?? []).length;
  const external = new Set(
    [...html.matchAll(/<a\b[^>]*href=["'](https?:\/\/[^"']+)["']/gi)]
      .map((m) => m[1])
      .filter((u) => toPath(u) === null)
      .map((u) => new URL(u).hostname.replace(/^www\./, ""))
      .filter((h) => !/(facebook|instagram|twitter|x\.com|youtube|tiktok|linkedin|wa\.me|whatsapp|google\.com\/maps)/.test(h)),
  );
  const hasDate = ld.some((n) => n.dateModified || n.datePublished) || /<time\b/i.test(html) || /son güncelleme/i.test(text);
  const hasAuthor = ld.some((n) => n.author) || /rel=["']author["']/i.test(html);
  const isBlog = path.startsWith("/blog/") && !path.startsWith("/blog/kategori");
  const isPackage = path.startsWith("/paketler/");

  const checks: Check[] = [
    {
      id: "bluf", label: "İlk paragraf doğrudan yanıt veriyor",
      pass: words(firstP) >= 12 && words(firstP) <= 90,
      detail: firstP ? `${words(firstP)} kelime: “${firstP.slice(0, 110)}${firstP.length > 110 ? "…" : ""}”` : "Ana içerikte paragraf bulunamadı",
      fix: "Sayfanın ilk paragrafı, sorunun cevabını 40–60 kelimede tek başına verecek şekilde yazılmalı. AI motorları cevabı sayfanın başından alıntılar.",
    },
    {
      id: "headings", label: "Soru biçiminde ara başlıklar",
      pass: h2.filter((h) => h.includes("?")).length >= 2,
      detail: `${h2.length} H2, ${h2.filter((h) => h.includes("?")).length} tanesi soru`,
      fix: "İnsanların AI'a sorduğu biçimde H2 başlıkları ekleyin (\"Umre vizesi kaç günde çıkar?\"). Her başlığın altı o soruyu tek başına cevaplamalı.",
    },
    {
      id: "faq", label: "SSS yapısal verisi",
      pass: types.has("FAQPage"),
      detail: types.has("FAQPage") ? "FAQPage var" : "FAQPage yok",
      fix: "Sayfadaki sık sorulan soruları FAQPage JSON-LD olarak işaretleyin.",
    },
    {
      id: "fresh", label: "Güncelleme tarihi görünür",
      pass: hasDate,
      detail: hasDate ? "Tarih bilgisi var" : "dateModified, <time> ya da \"son güncelleme\" yok",
      fix: "Sayfada \"Son güncelleme: …\" yazın ve JSON-LD'ye dateModified ekleyin. AI motorları tarihsiz içeriği daha az kaynak gösterir.",
    },
    {
      id: "numbers", label: "Somut rakam ve veri",
      pass: numbers >= 3,
      detail: `${numbers} birimli rakam (fiyat, gün, metre, %)`,
      fix: "Fiyat aralığı, gün sayısı, otelin Kabe'ye metre cinsinden uzaklığı gibi somut rakamlar ekleyin. Rakam içeren pasajlar daha sık alıntılanır.",
    },
    {
      id: "sources", label: "Güvenilir dış kaynaklara link",
      pass: external.size >= 1,
      detail: external.size ? [...external].slice(0, 4).join(", ") : "Dış kaynak linki yok",
      fix: "Vize, ihram, Nusuk gibi konularda resmî kaynaklara (Diyanet, Nusuk, Suudi vize portalı) link verin.",
    },
  ];

  if (path === "/") {
    checks.push({
      id: "org", label: "Kurum yapısal verisi",
      pass: types.has("Organization") || types.has("TravelAgency") || types.has("LocalBusiness"),
      detail: [...types].slice(0, 5).join(", ") || "şema yok",
      fix: "Ana sayfaya adres, telefon, sosyal hesaplar (sameAs) ve lisans bilgisiyle Organization / TravelAgency JSON-LD ekleyin.",
    });
  }
  if (isBlog) {
    checks.push({
      id: "author", label: "Yazar bilgisi",
      pass: hasAuthor,
      detail: hasAuthor ? "Yazar var" : "Yazar yok",
      fix: "Yazıya uzmanlığı belli bir yazar adı ve BlogPosting.author ekleyin.",
    });
  }
  if (isPackage) {
    checks.push({
      id: "offer", label: "Fiyat yapısal verisi",
      pass: [...types].some((t) => /Product|Offer|Trip/.test(t)),
      detail: [...types].slice(0, 5).join(", ") || "şema yok",
      fix: "Paket fiyatını, para birimini ve süresini Product + Offer (veya TouristTrip) olarak işaretleyin.",
    });
  }
  return checks;
}

export async function runReadiness(): Promise<Readiness> {
  const facts = await collectSiteFacts();
  const paths = facts.sitemapUrls.map(toPath).filter((p): p is string => Boolean(p));
  const pick = [
    "/", "/bireysel-umre", "/paketler", "/umre-vizesi", "/ilk-umrem",
    paths.find((p) => p.startsWith("/blog/") && !p.startsWith("/blog/kategori")),
    paths.find((p) => p.startsWith("/paketler/")),
    paths.find((p) => p.endsWith("-cikisli-bireysel-umre")),
  ].filter((p): p is string => Boolean(p));

  const blockedBots = facts.robots ? AI_BOTS.filter((b) => blocked(facts.robots!, b) || blocked(facts.robots!, "*")) : [];
  const site: Check[] = [
    {
      id: "robots", label: "AI botları siteye girebiliyor",
      pass: facts.robots !== null && blockedBots.length === 0,
      detail: facts.robots === null ? "robots.txt okunamadı" : blockedBots.length ? `Engelli: ${blockedBots.join(", ")}` : `${AI_BOTS.length} bot serbest`,
      fix: "robots.txt'te GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot ve Google-Extended engellenmemeli; engellenen motor siteyi kaynak gösteremez.",
    },
    {
      id: "llms", label: "/llms.txt var",
      pass: facts.hasLlmsTxt,
      detail: facts.hasLlmsTxt ? "Var" : "Yok",
      fix: "Sitenin ne sunduğunu, fiyat aralığını ve ana sayfaların linklerini içeren kısa bir /llms.txt ekleyin (llmstxt.org).",
    },
    {
      id: "sitemap", label: "Sitemap okunuyor",
      pass: facts.sitemapUrls.length > 0,
      detail: `${facts.sitemapUrls.length} adres`,
      fix: "sitemap.xml canlıda boş dönüyor; src/app/sitemap.ts'i kontrol edin.",
    },
  ];

  const pages = await Promise.all(
    pick.map(async (path) => {
      try {
        const res = await fetch(new URL(path, SITE_URL), { cache: "no-store", signal: AbortSignal.timeout(15_000), headers: { "User-Agent": "HadiUmreyeAIReadiness/1.0" } });
        const html = await res.text();
        const checks = res.ok ? pageChecks(path, html) : [];
        return { path, status: res.status, checks, score: checks.length ? Math.round((checks.filter((c) => c.pass).length / checks.length) * 100) : 0 };
      } catch {
        return { path, status: 0, checks: [], score: 0 };
      }
    }),
  );

  const all = [...site, ...pages.flatMap((p) => p.checks)];
  return {
    checkedAt: new Date().toISOString(),
    site,
    pages,
    score: all.length ? Math.round((all.filter((c) => c.pass).length / all.length) * 100) : 0,
  };
}
