// Paylaşım görseli (19 Ekim, kullanıcı): public/og/<görsel>.jpg arka plan + logo + üst etiket + sayfa başlığı.
// Görseller kullanıcının yapay zekâyla ürettiği 44 görsel (docs/Paylasim-Gorselleri-Brief.docx); konu sağ yarıda, sol yarı başlık için.
// Kullanım: /og?g=bolge-karadeniz&k=Bireysel%20umre&t=Trabzon%20çıkışlı%20bireysel%20umre  (src/lib/seo/og.ts → ogGorsel)
import { readFile } from "node:fs/promises";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { OG_GORSELLER } from "@/lib/seo/og";

const fontlar = Promise.all(
  [
    ["cairo-latin-700.woff", 700],
    ["cairo-latin-ext-700.woff", 700],
    ["cairo-latin-400.woff", 400],
    ["cairo-latin-ext-400.woff", 400],
  ].map(async ([dosya, weight]) => ({
    name: "Cairo",
    data: await readFile(new URL(`./${dosya}`, import.meta.url)),
    weight: weight as 400 | 700,
    style: "normal" as const,
  })),
);

const kisalt = (s: string, max: number) => (s.length > max ? `${s.slice(0, max - 1).trimEnd()}…` : s);

export async function GET(req: Request) {
  const url = new URL(req.url);
  const g = url.searchParams.get("g") ?? "varsayilan";
  const gorsel = (OG_GORSELLER as readonly string[]).includes(g) ? g : "varsayilan";
  const baslik = kisalt((url.searchParams.get("t") ?? "Hadi Umreye Gidelim").trim(), 90);
  const kicker = kisalt((url.searchParams.get("k") ?? "Bireysel umre").trim(), 40);
  const kok = url.origin;
  const uzun = baslik.length > 48;

  const png = new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: "Cairo" }}>
        <img src={`${kok}/og/${gorsel}.jpg`} width={1200} height={630} style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }} alt="" />
        <div style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, display: "flex", backgroundImage: "linear-gradient(90deg, rgba(15,37,82,0.94) 0%, rgba(15,37,82,0.82) 34%, rgba(15,37,82,0.35) 58%, rgba(15,37,82,0) 75%)" }} />
        <div style={{ position: "absolute", top: 0, left: 0, width: 640, height: 630, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "48px 56px" }}>
          <img src={`${kok}/email/logo-beyaz.png`} width={108} height={80} style={{ width: 108, height: 80 }} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 22, fontWeight: 700, letterSpacing: 4, color: "#f2dda6", textTransform: "uppercase" }}>{kicker}</div>
            <div style={{ display: "flex", width: 56, height: 5, borderRadius: 3, backgroundColor: "#f2dda6", margin: "16px 0 20px" }} />
            <div style={{ display: "flex", fontSize: uzun ? 50 : 62, fontWeight: 700, lineHeight: 1.12, color: "#ffffff" }}>{baslik}</div>
          </div>
          <div style={{ display: "flex", fontSize: 22, fontWeight: 400, color: "rgba(255,255,255,0.8)" }}>hadiumreyegidelim.com</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: await fontlar },
  );
  // PNG ~1 MB oluyor; WhatsApp büyük önizleme görsellerini göstermeyebiliyor. JPEG'e çevrilir (~120 KB).
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer())).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400, s-maxage=2592000, stale-while-revalidate=86400" },
  });
}
