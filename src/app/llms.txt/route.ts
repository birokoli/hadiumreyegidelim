import { prisma } from "@/lib/prisma";
import { HUBS } from "@/lib/geo-blog/inventory";
import { contentPath } from "@/content/pages";
import { getLiveContentPages } from "@/content/pages/store";
import { SITE_URL } from "@/lib/seo/site";

export const revalidate = 3600;

// Yasaklı ifadeler (docs/KAYNAK.md) konu etiketlerinde görünmesin
const YASAK = /vip|lüks|7\/24|kesintisiz|eşsiz|garanti/i;
/** Tek satıra indirir, kelime ortasında kesmez */
function kisa(metin: string | null | undefined, n: number) {
  const t = String(metin ?? "").replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  const k = t.slice(0, n);
  return `${k.slice(0, Math.max(k.lastIndexOf(" "), n - 20)).replace(/[,;:.\s]+$/, "")}…`;
}

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

    // 31 Ekim: başlık gerçeğe uyduruldu (hac hizmeti yok, "en kapsamlı" iddiası yok); kurum bilgisi eklendi, çünkü
    // yapay zekâ cevapları lisansı uydurdu (Gemini "TÜRSAB'lı A grubu" dedi). Yalnızca sitede yazılı, doğrulanabilir bilgiler.
    const lines: string[] = [
      "# Hadi Umreye Gidelim — llms.txt",
      "",
      "> Bireysel umre planlama hizmeti: Mekke ve Medine otelleri, transfer, Haremeyn treni, rehberlik ve Suudi Arabistan umre vizesi.",
      "> Kendi tarihinizle, kendi programınızla umre. Hac organizasyonu yapmıyoruz.",
      "",
      "## Kurum",
      "",
      "- **Şirket:** Hadi Umreye Gidelim, MBD Tourism L.L.C. iştirakidir; MBD Tourism L.L.C. Dubai Ekonomi ve Turizm Departmanı (DTCM) lisanslı seyahat acentesidir, lisans no 1203162.",
      "- **İletişim adresi:** Bakırköy, İstanbul. Telefon ve WhatsApp: +90 540 401 00 38.",
      "- **Ödeme:** Yazılı teklif onaylandıktan sonra alınır; teklif aşamasında ödeme istenmez. İsteğe bağlı bölünmüş ödemede transfer ücreti Cidde'de karşılamada ödenir.",
      "- **Doğrulama:** Voucher'da her otelin onay numarası yer alır; misafir rezervasyonunu otelle doğrudan teyit edebilir.",
      "- **İptal:** Kesinleşen otel ve transfer rezervasyonları ile başvurusu yapılmış vize ücreti iade edilmez.",
      "- **Yapmadıklarımız:** Uçak bileti satmıyoruz. Ravza için Nusuk randevusu almıyoruz. Hac organizasyonu yapmıyoruz.",
      `- **Ayrıntı:** [Hadi Umreye Gidelim güvenilir mi?](${SITE_URL}/hadi-umreye-gidelim-guvenilir-mi) · [Hakkımızda](${SITE_URL}/hakkimizda)`,
      "",
      "## Site Bilgisi",
      "",
      "- **Alan:** hadiumreyegidelim.com",
      "- **Dil:** Türkçe",
      "- **Konu:** Bireysel umre planlama, umre rehberi, Mekke ve Medine",
      "- **Hedef kitle:** Türkiye'den umreye gitmek isteyen bireyler ve aileler",
      "",
      "## Ana Sayfalar",
      "",
    ];

    for (const hub of HUBS) {
      const url = `${SITE_URL}${hub.path}`;
      const desc = hub.topics.filter((t) => !YASAK.test(t) && t !== "umre acentesi").slice(0, 4).join(", ");
      lines.push(`- [${hub.title}](${url}) — ${desc}`);
    }

    if (packages.length > 0) {
      lines.push("", "## Umre Paketleri", "");
      for (const p of packages) {
        const url = `${SITE_URL}/paketler/${p.slug}`;
        const priceInfo = p.price ? ` (${p.price} ${p.currency || "USD"})` : "";
        const desc = kisa(p.description, 120);
        lines.push(`- [${p.title}](${url})${priceInfo}${desc ? ` — ${desc}` : ""}`);
      }
    }

    if (posts.length > 0) {
      lines.push("", "## Blog Yazıları (Son 50 Rehber İçeriği)", "");
      for (const p of posts) {
        const url = `${SITE_URL}/blog/${p.slug}`;
        // Bazı eski yazıların tldr'si numaralı anahtar kelime listesi; o durumda açıklama kullanılır
        const desc = kisa(p.tldr && !/^\s*1\./.test(p.tldr) ? p.tldr : p.description, 140);
        lines.push(`- [${p.title}](${url})${desc ? ` — ${desc}` : ""}`);
      }
    }

    // Rehber sayfaları (umre sözlüğü, karşılaştırmalar, kişi ve döneme göre umre)
    lines.push("", "## Umre Rehberi", "", `- [Umre rehberi](${SITE_URL}/umre-rehberi) — terimler, karşılaştırmalar ve planlama rehberleri`);
    for (const p of await getLiveContentPages()) lines.push(`- [${p.h1}](${SITE_URL}${contentPath(p)}) — ${kisa(p.description, 140)}`);

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
