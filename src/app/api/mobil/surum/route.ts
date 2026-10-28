import { NextResponse } from "next/server";

// Uygulama içi güncelleme (28 Ekim, kullanıcı: "GitHub'dan ve her yerden aynı senkronda olmalı"): en son sürüm GitHub'daki
// son yayından (Releases, etiket "yonetim-v1.2.3", ekte .apk) okunur. Uygulama açılışta ve öne geldiğinde buraya bakar,
// sürümü eskiyse "Güncelle" gösterir. GitHub'a ulaşılamazsa public/indir/hadi-yonetim/surum.json yedeği kullanılır.
export const revalidate = 300;

type Surum = { surum: string; kod: number; apk: string | null; zorunlu: boolean; notlar: string[] };

async function githubdan(): Promise<Surum | null> {
  const r = await fetch("https://api.github.com/repos/birokoli/hadiumreyegidelim/releases?per_page=20", {
    headers: { accept: "application/vnd.github+json", "user-agent": "hadiumreyegidelim" },
    next: { revalidate: 300 },
  });
  if (!r.ok) return null;
  const liste = (await r.json()) as { tag_name: string; body: string | null; draft: boolean; prerelease: boolean; assets: { name: string; browser_download_url: string }[] }[];
  const y = liste.find((x) => !x.draft && !x.prerelease && x.tag_name.startsWith("yonetim-v") && x.assets.some((a) => a.name.endsWith(".apk")));
  if (!y) return null;
  const surum = y.tag_name.replace("yonetim-v", "");
  const [a, b, c] = surum.split(".").map(Number);
  const notlar = (y.body ?? "").split("\n").map((s) => s.replace(/^[-*•]\s*/, "").trim()).filter((s) => s && !s.startsWith("#") && !/^zorunlu/i.test(s)).slice(0, 8);
  return { surum, kod: (a || 0) * 10000 + (b || 0) * 100 + (c || 0), apk: y.assets.find((x) => x.name.endsWith(".apk"))!.browser_download_url, zorunlu: /zorunlu/i.test(y.body ?? ""), notlar };
}

export async function GET() {
  const g = await githubdan().catch(() => null);
  if (g) return NextResponse.json(g);
  const s = await import("../../../../../public/indir/hadi-yonetim/surum.json").then((m) => m.default).catch(() => null);
  return NextResponse.json(s ?? { surum: "0.0.0", kod: 0, apk: null, zorunlu: false, notlar: [] });
}
