// Yorum paylaşım görseli (5 Ekim, kullanıcı): seçilen yorumdan Instagram story (1080×1920) ya da gönderi (1080×1350) PNG'si.
// GET /api/admin/reviews/{id}/image?tema=koyu|acik&format=story|post&arka=kabe|foto&indir=1
// Yalnızca admin (middleware: /api/admin). Fontlar ve görseller yerel dosyadan okunur (dış istek yok).
import { readFile } from "fs/promises";
import path from "path";
import { ImageResponse } from "next/og";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureReviewSchema } from "@/lib/reviews/schema";
import { shortName } from "@/lib/reviews";

export const runtime = "nodejs";

const NAVY = "#203c76";
const DEEP = "#0f1f45";
const GOLD = "#d4af6a";
const CREAM = "#f7f3ea";

const pub = (p: string) => path.join(process.cwd(), "public", p);
let assets: Promise<{ regular: Buffer; medium: Buffer; bold: Buffer; kabe: string; logoNavy: string; logoWhite: string }> | null = null;
function loadAssets() {
  assets ??= (async () => {
    const [regular, medium, bold, kabe, svg] = await Promise.all([
      readFile(pub("fonts/Poppins-Regular.ttf")),
      readFile(pub("fonts/Poppins-Medium.ttf")),
      readFile(pub("fonts/Poppins-Bold.ttf")),
      readFile(pub("images/hero-kabe.jpg")),
      readFile(pub("hadiumreyegidelim.svg"), "utf8"),
    ]);
    const svgUri = (s: string) => `data:image/svg+xml;base64,${Buffer.from(s).toString("base64")}`;
    return {
      regular,
      medium,
      bold,
      kabe: `data:image/jpeg;base64,${kabe.toString("base64")}`,
      logoNavy: svgUri(svg),
      logoWhite: svgUri(svg.replace(/#203c76/gi, "#ffffff")),
    };
  })().catch((e) => {
    assets = null;
    throw e;
  });
  return assets;
}

// Poppins'te ★ ✓ “ işaretleri yok; SVG olarak çizilir
const svg = (body: string, vb: string) => `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`).toString("base64")}`;
const starSvg = (fill: string) => svg(`<path fill="${fill}" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/>`, "0 0 24 24");
const checkSvg = svg(`<path fill="none" stroke="${GOLD}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" d="M5 12.5l4.5 4.5L19 7.5"/>`, "0 0 24 24");
const quoteSvg = svg(`<path fill="${GOLD}" d="M10 8C6 8 3 11.2 3 15.3V24h8.5v-8.4H7.4c0-2.6 1.4-4.2 3.6-4.6zm15 0c-4 0-7 3.2-7 7.3V24h8.5v-8.4h-4.1c0-2.6 1.4-4.2 3.6-4.6z"/>`, "0 6 32 20");

/** Metin uzunluğuna göre yazı boyutu; çok uzun metin kısaltılır */
function fit(text: string, story: boolean) {
  const max = story ? 620 : 420;
  const t = text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}…` : text;
  const n = t.length;
  const size = story ? (n < 110 ? 64 : n < 200 ? 54 : n < 320 ? 46 : n < 450 ? 40 : 36) : n < 110 ? 54 : n < 200 ? 46 : n < 300 ? 40 : 34;
  return { t, size };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sp = req.nextUrl.searchParams;
  await ensureReviewSchema();
  const r = await prisma.review.findUnique({ where: { id } });
  if (!r || !r.text) return NextResponse.json({ error: "Yorum bulunamadı ya da metni yok." }, { status: 404 });

  const story = sp.get("format") !== "post";
  const W = 1080;
  const H = story ? 1920 : 1350;
  const dark = sp.get("tema") !== "acik";
  const usePhoto = sp.get("arka") === "foto" && !!r.photoUrl;
  const a = await loadAssets();
  const { t, size } = fit(r.text.replace(/\s+/g, " ").trim(), story);
  const name = r.displayName || shortName(r.customerName);
  const meta = [r.city, r.umreMonth].filter(Boolean).join(" · ");
  const ink = dark ? "#ffffff" : NAVY;
  const soft = dark ? "rgba(255,255,255,0.78)" : "rgba(32,60,118,0.75)";
  const pad = 90;

  const stars = r.rating ? (
    <div style={{ display: "flex", gap: 12, marginTop: 30 }}>
      {Array.from({ length: 5 }, (_, i) => (
         
        <img key={i} src={starSvg(i < r.rating! ? GOLD : dark ? "rgba(255,255,255,0.25)" : "rgba(32,60,118,0.18)")} alt="" width={56} height={56} />
      ))}
    </div>
  ) : null;

  const node = (
    <div style={{ width: W, height: H, display: "flex", position: "relative", fontFamily: "Poppins", backgroundColor: dark ? DEEP : CREAM }}>
      {dark && (
         
        <img src={usePhoto ? r.photoUrl! : a.kabe} alt="" width={W} height={H} style={{ position: "absolute", top: 0, left: 0, width: W, height: H, objectFit: "cover" }} />
      )}
      {dark && (
        <div style={{ position: "absolute", top: 0, left: 0, width: W, height: H, display: "flex", backgroundImage: `linear-gradient(180deg, rgba(15,31,69,0.55) 0%, rgba(15,31,69,0.82) 38%, rgba(15,31,69,0.94) 100%)` }} />
      )}
      {!dark && (
        <div style={{ position: "absolute", top: 40, left: 40, width: W - 80, height: H - 80, display: "flex", border: `3px solid ${GOLD}`, borderRadius: 48 }} />
      )}

      <div style={{ position: "relative", display: "flex", flexDirection: "column", width: W, height: H, padding: `${story ? 150 : 100}px ${pad}px ${story ? 140 : 90}px` }}>
        {/* Üst: logo + başlık */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          { }
          <img src={dark ? a.logoWhite : a.logoNavy} alt="" width={story ? 300 : 240} height={story ? 222 : 178} />
          <div style={{ display: "flex", marginTop: story ? 44 : 28, fontSize: story ? 30 : 26, fontWeight: 500, letterSpacing: 6, color: GOLD }}>UMRECİLERİMİZİN YORUMLARI</div>
        </div>

        {/* Orta: yorum */}
        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center", alignItems: "center", paddingTop: story ? 0 : 20 }}>
          { }
          <img src={quoteSvg} alt="" width={story ? 120 : 96} height={story ? 75 : 60} />
          {stars}
          <div style={{ display: "flex", marginTop: 36, fontSize: size, lineHeight: 1.38, fontWeight: 500, color: ink, textAlign: "center" }}>{t}</div>
          <div style={{ display: "flex", width: 120, height: 4, backgroundColor: GOLD, borderRadius: 2, marginTop: 56 }} />
          <div style={{ display: "flex", marginTop: 34, fontSize: 44, fontWeight: 700, color: ink }}>{name}</div>
          {meta && <div style={{ display: "flex", marginTop: 6, fontSize: 32, color: soft }}>{meta}</div>}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 24, padding: "10px 26px", borderRadius: 999, fontSize: 26, fontWeight: 500, color: dark ? "#ffffff" : NAVY, backgroundColor: dark ? "rgba(255,255,255,0.12)" : "rgba(32,60,118,0.08)", border: `2px solid ${dark ? "rgba(255,255,255,0.25)" : "rgba(32,60,118,0.2)"}` }}>
            { }
            <img src={checkSvg} alt="" width={30} height={30} />
            Doğrulanmış müşteri
          </div>
        </div>

        {/* Alt */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", padding: "18px 44px", borderRadius: 999, backgroundColor: GOLD, color: DEEP, fontSize: 32, fontWeight: 700 }}>Umrenizi birlikte planlayalım</div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 500, color: soft }}>hadiumreyegidelim.com</div>
        </div>
      </div>
    </div>
  );

  try {
    const img = new ImageResponse(node, {
      width: W,
      height: H,
      fonts: [
        { name: "Poppins", data: a.regular, weight: 400, style: "normal" },
        { name: "Poppins", data: a.medium, weight: 500, style: "normal" },
        { name: "Poppins", data: a.bold, weight: 700, style: "normal" },
      ],
    });
    const buf = Buffer.from(await img.arrayBuffer());
    const file = `hadiumreyegidelim-yorum-${name.toLocaleLowerCase("tr-TR").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || r.id}-${story ? "story" : "gonderi"}.png`;
    return new Response(buf, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
        ...(sp.get("indir") ? { "Content-Disposition": `attachment; filename="${file}"` } : {}),
      },
    });
  } catch (e) {
    console.error("[review-image]", e);
    return NextResponse.json({ error: "Görsel oluşturulamadı." }, { status: 500 });
  }
}
