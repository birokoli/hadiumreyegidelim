import { prisma } from "@/lib/prisma";
import { HUBS } from "@/lib/geo-blog/inventory";
import { contentPath } from "@/content/pages";
import { getLiveContentPages } from "@/content/pages/store";
import { SITE_URL } from "@/lib/seo/site";

export const revalidate = 3600;

export async function GET() {
  try {
    const [posts, packages] = await Promise.all([
      prisma.post
        .findMany({
          where: { published: true },
          select: { slug: true, title: true, description: true, tldr: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        })
        .catch(() => []),
      prisma.package
        .findMany({
          where: { published: true },
          select: { slug: true, title: true, description: true, price: true, currency: true },
          orderBy: { createdAt: "desc" },
          take: 50,
        })
        .catch(() => []),
    ]);

    const lines: string[] = [
      "# HadiUmreyeGidelim — llms.txt",
      "",
      "> Bireysel umre ve hac turları için Türkiye'nin en kapsamlı rehberlik platformu.",
      "> Mekke ve Medine'ye kendi programınıza göre özel umre paketleri.",
      "",
      "## Site Bilgisi",
      "",
      "- **Alan:** hadiumreyegidelim.com",
      "- **Dil:** Türkçe",
      "- **Konu:** Bireysel umre, hac rehberliği, Mekke & Medine seyahati",
      "- **Hedef Kitle:** Türk hacı adayları, umre yapmak isteyen bireyler ve aileler",
      "",
      "## Ana Sayfalar & Hub'lar",
      "",
    ];

    for (const hub of HUBS) {
      const url = `${SITE_URL}${hub.path}`;
      const desc = hub.topics.slice(0, 4).join(", ");
      lines.push(`- [${hub.title}](${url}) — ${desc}`);
    }

    if (packages.length > 0) {
      lines.push("", "## Umre Paketleri", "");
      for (const p of packages) {
        const url = `${SITE_URL}/paketler/${p.slug}`;
        const priceInfo = p.price ? ` (${p.price} ${p.currency || "USD"})` : "";
        const desc = (p.description || "").slice(0, 120).trim();
        lines.push(`- [${p.title}](${url})${priceInfo}${desc ? ` — ${desc}` : ""}`);
      }
    }

    if (posts.length > 0) {
      lines.push("", "## Blog Yazıları (Son 50 Rehber İçeriği)", "");
      for (const p of posts) {
        const url = `${SITE_URL}/blog/${p.slug}`;
        const desc = (p.tldr || p.description || "").slice(0, 140).trim();
        lines.push(`- [${p.title}](${url})${desc ? ` — ${desc}` : ""}`);
      }
    }

    // Rehber sayfaları (umre sözlüğü, karşılaştırmalar, kişi ve döneme göre umre)
    lines.push("", "## Umre Rehberi", "", `- [Umre rehberi](${SITE_URL}/umre-rehberi) — terimler, karşılaştırmalar ve planlama rehberleri`);
    for (const p of await getLiveContentPages()) lines.push(`- [${p.h1}](${SITE_URL}${contentPath(p)}) — ${p.description.slice(0, 140)}`);

    lines.push(
      "",
      "## Yapılandırılmış Veri",
      "",
      "Blog yazılarımız ve sayfalarımız Schema.org JSON-LD şemalarıyla zenginleştirilmiştir:",
      "- `BlogPosting` (başlık, yazar, tarih, görsel, makale metni)",
      "- `BreadcrumbList` (navigasyon hiyerarşisi)",
      "- `FAQPage` (SSS soru ve cevapları)",
      "- `TravelAgency` / `Product` (paket detayları)",
      "",
      "## Robots / Crawl Politikası",
      "",
      "AI botları ve LLM'ler bu içerikleri eğitim veya arama yanıtlarında alıntılamak amacıyla kullanabilir.",
      "Lütfen kaynak gösterirken `hadiumreyegidelim.com` adresini ve doğrudan sayfa URL'sini belirtin.",
      ""
    );

    const body = lines.join("\n");

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    return new Response(`Error generating llms.txt: ${errMsg}`, { status: 500 });
  }
}
