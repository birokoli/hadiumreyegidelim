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
const checkSvg = svg(`<path fill="none" stroke="#16a34a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" d="M5 12.5l4.5 4.5L19 7.5"/>`, "0 0 24 24");
const verifiedSvg = svg(`<circle cx="12" cy="12" r="11" fill="#1d9bf0"/><path fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" d="M7 12.4l3.3 3.3L17 9"/>`, "0 0 24 24");

/** Metin uzunluğuna göre yazı boyutu; çok uzun metin kısaltılır */
function fit(text: string, story: boolean, withPhoto: boolean) {
  const max = story ? (withPhoto ? 300 : 480) : withPhoto ? 200 : 360;
  const t = text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}…` : text;
  const n = t.length;
  const size = story ? (n < 120 ? 48 : n < 220 ? 42 : n < 360 ? 37 : 33) : n < 120 ? 42 : n < 220 ? 37 : 33;
  return { t, size };
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toLocaleUpperCase("tr-TR"))
    .join("");

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
  // Müşteri fotoğrafı varsa kartın içinde gösterilir; "arka=foto" ise arka plan da o olur
  const photoBg = sp.get("arka") === "foto" && !!r.photoUrl;
  const photoInCard = !!r.photoUrl && !photoBg;
  const a = await loadAssets();
  const { t, size } = fit(r.text.replace(/\s+/g, " ").trim(), story, photoInCard);
  const name = r.displayName || shortName(r.customerName);
  const meta = [r.city, r.umreMonth ? `${r.umreMonth} umresi` : null].filter(Boolean).join(" · ");
  const cardW = 920;
  const fg = dark ? "#ffffff" : NAVY;
  const fgSoft = dark ? "rgba(255,255,255,0.7)" : "rgba(32,60,118,0.6)";

  const node = (
    <div style={{ width: W, height: H, display: "flex", position: "relative", fontFamily: "Poppins", backgroundColor: dark ? DEEP : "#eef2f8" }}>
      {/* Arka plan */}
      {dark ? (
        <>
          <img src={photoBg ? r.photoUrl! : a.kabe} alt="" width={W} height={H} style={{ position: "absolute", top: 0, left: 0, width: W, height: H, objectFit: "cover" }} />
          <div style={{ position: "absolute", top: 0, left: 0, width: W, height: H, display: "flex", backgroundImage: "linear-gradient(180deg, rgba(10,22,52,0.70) 0%, rgba(10,22,52,0.86) 45%, rgba(10,22,52,0.96) 100%)" }} />
        </>
      ) : (
        <>
          <div style={{ position: "absolute", top: -260, right: -260, width: 760, height: 760, borderRadius: 999, display: "flex", backgroundImage: "radial-gradient(circle, rgba(212,175,106,0.35) 0%, rgba(212,175,106,0) 70%)" }} />
          <div style={{ position: "absolute", bottom: -300, left: -300, width: 860, height: 860, borderRadius: 999, display: "flex", backgroundImage: "radial-gradient(circle, rgba(32,60,118,0.22) 0%, rgba(32,60,118,0) 70%)" }} />
        </>
      )}

      <div style={{ position: "relative", display: "flex", flexDirection: "column", width: W, height: H, padding: story ? "250px 80px 300px" : "72px 80px 64px" }}>
        {/* Üst başlık: Instagram'daki yerleşik ifade, sade */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", width: 56, height: 4, borderRadius: 2, backgroundColor: GOLD }} />
          <span style={{ fontSize: story ? 30 : 26, fontWeight: 500, color: fgSoft }}>hadiumreyegidelim.com</span>
        </div>
        <div style={{ display: "flex", marginTop: story ? 18 : 12, fontSize: story ? 84 : 64, lineHeight: 1.05, fontWeight: 700, color: fg }}>Sizden gelenler</div>

        {/* Yorum kartı */}
        <div style={{ display: "flex", flexGrow: 1, alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", width: cardW, padding: story ? 60 : 48, borderRadius: 44, backgroundColor: "#ffffff", boxShadow: dark ? "0 40px 90px rgba(0,0,0,0.35)" : "0 30px 80px rgba(32,60,118,0.16)" }}>
            {/* Kişi satırı */}
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ display: "flex", width: 104, height: 104, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundImage: `linear-gradient(135deg, ${NAVY} 0%, #3a5ea8 100%)`, color: "#ffffff", fontSize: 40, fontWeight: 700 }}>{initials(name)}</div>
              <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 40, fontWeight: 700, color: "#111827" }}>{name}</span>
                  <img src={verifiedSvg} alt="" width={38} height={38} />
                </div>
                {meta && <span style={{ fontSize: 27, color: "#6b7280", marginTop: 2 }}>{meta}</span>}
              </div>
            </div>

            {/* Yıldızlar */}
            {r.rating ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 34 }}>
                {Array.from({ length: 5 }, (_, i) => (
                  <img key={i} src={starSvg(i < r.rating! ? GOLD : "#e5e7eb")} alt="" width={46} height={46} />
                ))}
                <span style={{ marginLeft: 12, fontSize: 28, fontWeight: 500, color: "#6b7280" }}>{r.rating}/5</span>
              </div>
            ) : null}

            {/* Metin */}
            <div style={{ display: "flex", marginTop: 26, fontSize: size, lineHeight: 1.45, color: "#1f2937" }}>{t}</div>

            {photoInCard && (
              <img src={r.photoUrl!} alt="" width={cardW - (story ? 120 : 96)} height={story ? 380 : 300} style={{ marginTop: 32, borderRadius: 28, objectFit: "cover" }} />
            )}

            {/* Kart altı */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 34, paddingTop: 26, borderTop: "2px solid #f1f2f4" }}>
              <img src={checkSvg} alt="" width={30} height={30} />
              <span style={{ fontSize: 25, color: "#6b7280" }}>Doğrulanmış müşteri · hadiumreyegidelim.com</span>
            </div>
          </div>
        </div>

        {/* Alt: logo sol, çağrı sağ */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <img src={dark ? a.logoWhite : a.logoNavy} alt="" width={story ? 160 : 150} height={story ? 118 : 111} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
            <span style={{ fontSize: 24, color: fgSoft }}>Umrenizi birlikte planlayalım</span>
            <div style={{ display: "flex", padding: "14px 28px", borderRadius: 999, backgroundColor: GOLD, color: DEEP, fontSize: 26, fontWeight: 700 }}>WhatsApp&apos;tan yazın</div>
          </div>
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
