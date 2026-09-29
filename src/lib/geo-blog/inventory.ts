// Sitenin link verilebilir sayfa envanteri. Blog motoru iç linkleri yalnızca
// buradan seçer; kalite kapısı da her iç linki bu listeye göre doğrular.
// Hub-and-spoke: yazılar ilgili hub'a, hub'lar ve diğer yazılar birbirine bağlanır.

import { prisma } from "@/lib/prisma";
import { turkeyCities } from "@/lib/turkey-cities";

export type LinkTarget = { path: string; title: string; kind: "hub" | "post" | "package" | "city"; topics: string[] };

/** Canlıda 200 döndüğü doğrulanmış ana sayfalar (29.09.2026). /rehber yok (404). */
export const HUBS: LinkTarget[] = [
  { path: "/bireysel-umre", title: "Bireysel umre planlama", kind: "hub", topics: ["bireysel umre", "kendi programıyla umre", "özel umre", "diyanetsiz umre", "umre planlama", "vip umre"] },
  { path: "/paketler", title: "Umre paketleri ve fiyatları", kind: "hub", topics: ["umre paketi", "umre fiyatları", "umre turu", "umre turları", "umre ücreti", "lüks umre", "ekonomik umre"] },
  { path: "/umre-vizesi", title: "Umre vizesi başvurusu", kind: "hub", topics: ["umre vizesi", "suudi vize", "e-vize", "nusuk", "vize başvurusu", "turist vizesi"] },
  { path: "/ilk-umrem", title: "İlk kez umreye gidecekler için rehber", kind: "hub", topics: ["ilk umre", "ilk kez umre", "umre nasıl yapılır", "umre hazırlığı", "umre adımları", "ihram", "tavaf", "sa'y"] },
  { path: "/hanim-umresi", title: "Hanımlar için umre", kind: "hub", topics: ["kadın umre", "hanım umresi", "mahremsiz umre", "kadınlar için umre"] },
  { path: "/eylul-umresi", title: "Eylül umresi kampanyası", kind: "hub", topics: ["eylül umresi", "sonbahar umresi", "umre kampanyası"] },
  { path: "/rehberlik", title: "Umre rehberliği hizmeti", kind: "hub", topics: ["umre rehberi", "rehberli umre", "manevi rehber", "hoca eşliğinde umre"] },
  { path: "/hizmetler", title: "Umre ek hizmetleri", kind: "hub", topics: ["transfer", "vip transfer", "tren", "haramain treni", "ek hizmet"] },
  { path: "/hakkimizda", title: "Hadi Umreye Gidelim hakkında", kind: "hub", topics: ["hadi umreye gidelim", "güvenilir umre firması", "umre acentesi"] },
  { path: "/blog", title: "Umre rehber yazıları", kind: "hub", topics: ["umre blog", "umre rehberi yazıları"] },
];

export async function loadInventory(): Promise<LinkTarget[]> {
  const [posts, packages] = await Promise.all([
    prisma.post
      .findMany({ where: { published: true }, select: { slug: true, title: true, focusKeyword: true, keywords: true }, orderBy: { updatedAt: "desc" }, take: 300 })
      .catch(() => []),
    prisma.package.findMany({ where: { published: true }, select: { slug: true, title: true }, take: 100 }).catch(() => []),
  ]);
  return [
    ...HUBS,
    ...posts.map((p) => ({
      path: `/blog/${p.slug}`,
      title: p.title,
      kind: "post" as const,
      topics: [p.focusKeyword, ...(p.keywords ?? "").split(",")].map((t) => (t ?? "").trim()).filter(Boolean).slice(0, 8),
    })),
    ...packages.map((p) => ({ path: `/paketler/${p.slug}`, title: p.title, kind: "package" as const, topics: [p.title] })),
    ...turkeyCities.map((c) => ({
      path: `/${c.slug}-cikisli-bireysel-umre`,
      title: `${c.name} çıkışlı bireysel umre`,
      kind: "city" as const,
      topics: [`${c.name.toLocaleLowerCase("tr")} çıkışlı umre`, `${c.name.toLocaleLowerCase("tr")} umre`],
    })),
  ];
}

const fold = (s: string) => s.toLocaleLowerCase("tr").replace(/[^\p{L}\p{N}\s']/gu, " ");
const tokens = (s: string) => new Set(fold(s).split(/\s+/).filter((w) => w.length > 2));

/** Konuya en yakın link hedefleri: hub'lar önce, sonra yazılar/paketler, şehir sayfaları yalnızca şehir geçiyorsa */
export function pickLinkTargets(topic: string, inventory: LinkTarget[], limit = 14, excludePath?: string) {
  const t = tokens(topic);
  const folded = fold(topic);
  const scored = inventory
    .filter((x) => x.path !== excludePath)
    .map((x) => {
      const phraseHit = x.topics.some((p) => p && folded.includes(fold(p).trim()));
      const overlap = [...tokens([x.title, ...x.topics].join(" "))].filter((w) => t.has(w)).length;
      const base = x.kind === "hub" ? 2 : x.kind === "city" ? -2 : 0;
      return { x, score: (phraseHit ? 5 : 0) + overlap + base };
    })
    .filter((s) => s.score > (s.x.kind === "city" ? 3 : 0))
    .sort((a, b) => b.score - a.score);
  const hubs = scored.filter((s) => s.x.kind === "hub").slice(0, 6);
  const rest = scored.filter((s) => s.x.kind !== "hub").slice(0, limit - hubs.length);
  // Konu ne olursa olsun satış hub'ları aday listesinde bulunsun
  const must = HUBS.filter((h) => ["/bireysel-umre", "/paketler"].includes(h.path));
  const out = [...hubs.map((s) => s.x), ...rest.map((s) => s.x)];
  for (const m of must) if (!out.some((o) => o.path === m.path)) out.push(m);
  return out;
}

export function isInternalPath(href: string, inventory: LinkTarget[]) {
  let path = href;
  try {
    const u = new URL(href, "https://hadiumreyegidelim.com");
    if (!/(^|\.)hadiumreyegidelim\.com$/.test(u.hostname)) return false;
    path = u.pathname.replace(/\/+$/, "") || "/";
  } catch {
    return false;
  }
  return path === "/" || inventory.some((x) => x.path === path);
}
