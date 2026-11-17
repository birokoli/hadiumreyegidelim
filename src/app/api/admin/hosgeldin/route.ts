// Hoş geldin serisi (18 Kasım): durum ve adım önizlemesi (GET), aç/kapat ve deneme gönderimi (POST). Sunucu: src/lib/hosgeldin
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { ADIMLAR, hosgeldinAyarla, hosgeldinDeneme, hosgeldinDurum, hosgeldinOnizleme, type AdimNo } from "@/lib/hosgeldin";

export const dynamic = "force-dynamic";

const adimNo = (v: unknown): AdimNo | null => (ADIMLAR.some((a) => a.no === Number(v)) ? (Number(v) as AdimNo) : null);

export async function GET(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  try {
    const no = adimNo(req.nextUrl.searchParams.get("onizleme"));
    if (no) {
      const c = await hosgeldinOnizleme(no);
      return NextResponse.json({ onizleme: c ? { konu: c.subject, html: c.html } : null });
    }
    return NextResponse.json(await hosgeldinDurum());
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Hata" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  try {
    if (b.action === "ayar") return NextResponse.json({ ok: true, ...(await hosgeldinAyarla(b.aktif === true)) });
    if (b.action === "deneme") {
      const no = adimNo(b.adim);
      const adres = String(b.adres ?? "").trim();
      if (!no) return NextResponse.json({ error: "Adım seçin." }, { status: 400 });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adres)) return NextResponse.json({ error: "Geçerli bir e-posta yazın." }, { status: 400 });
      await hosgeldinDeneme(no, adres);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  } catch (e) {
    console.error("[hosgeldin]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Hata" }, { status: 500 });
  }
}
