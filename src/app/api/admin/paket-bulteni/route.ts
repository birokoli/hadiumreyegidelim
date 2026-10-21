// Paket bülteni (21 Ekim): önizleme ve alıcı sayısı (GET ayarlar sorgu dizgisinde), deneme ve gerçek gönderim (POST).
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { bultenDeneme, bultenGonder, bultenOnizleme, paketKartlari, type BultenAyar } from "@/lib/paket-bulteni";
import { gonderimGecmisi } from "@/lib/uye-kampanya/gonderim";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function ayar(o: Record<string, unknown>): BultenAyar {
  const s = (k: string) => String(o[k] ?? "").trim();
  const paketler = Array.isArray(o.paketler) ? o.paketler.map(String) : s("paketler").split(",").filter(Boolean);
  return { kod: s("kod"), konu: s("konu"), kicker: s("kicker"), baslik: s("baslik"), giris: s("giris"), paketler };
}

export async function GET(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  try {
    const a = ayar(Object.fromEntries(req.nextUrl.searchParams));
    const [secenekler, onizleme, gecmis] = await Promise.all([
      paketKartlari(),
      a.paketler.length ? bultenOnizleme(a) : null,
      gonderimGecmisi(),
    ]);
    return NextResponse.json({ secenekler, onizleme, gecmis: gecmis.filter((g) => g.tur === ("paket" as string)) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Hata" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const a = ayar(b);
  try {
    if (b.action === "deneme") {
      const adres = String(b.adres ?? "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adres)) return NextResponse.json({ error: "Geçerli bir e-posta yazın." }, { status: 400 });
      await bultenDeneme(a, adres);
      return NextResponse.json({ ok: true });
    }
    if (b.action === "gonder") {
      if (b.onay !== "GÖNDER") return NextResponse.json({ error: "Onay metni eksik." }, { status: 400 });
      const kim = String((s as { name?: string; username?: string }).name ?? (s as { username?: string }).username ?? "admin");
      return NextResponse.json({ ok: true, ...(await bultenGonder(a, kim)) });
    }
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  } catch (e) {
    console.error("[paket-bulteni]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Gönderilemedi." }, { status: 500 });
  }
}
