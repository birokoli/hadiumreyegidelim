// Üyelere gönderim (Profil 2, 14 Ekim): önizleme, deneme, gerçek gönderim, geçmiş; WhatsApp listesi ve işaretleme.
import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { getKampanya, listKampanyalar } from "@/lib/uye-kampanya";
import { denemeGonder, gonderimGecmisi, onizleme, topluGonder, whatsappIsaretle, whatsappListesi, type GonderimTur } from "@/lib/uye-kampanya/gonderim";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const tur = (req.nextUrl.searchParams.get("tur") === "kampanya" ? "kampanya" : "duyuru") as GonderimTur;
  const kampanyaId = req.nextUrl.searchParams.get("kampanya") || undefined;
  try {
    const [o, gecmis, kampanyalar] = await Promise.all([
      tur === "kampanya" && !kampanyaId ? null : onizleme(tur, kampanyaId),
      gonderimGecmisi(),
      listKampanyalar(),
    ]);
    const k = kampanyaId ? await getKampanya(kampanyaId) : null;
    const wa = k ? await whatsappListesi(k) : [];
    return NextResponse.json({ onizleme: o, gecmis, kampanyalar, whatsapp: wa.map((u) => ({ id: u.id, name: u.name, phone: u.phone, gonderildi: u.gonderildi, planDonem: u.planDonem })) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Hata" }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  const s = await getAdminSession();
  if (!s) return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const tur = (b.tur === "kampanya" ? "kampanya" : "duyuru") as GonderimTur;
  try {
    if (b.action === "deneme") {
      const adres = String(b.adres ?? "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adres)) return NextResponse.json({ error: "Geçerli bir e-posta yazın." }, { status: 400 });
      await denemeGonder(tur, adres, b.kampanyaId);
      return NextResponse.json({ ok: true });
    }
    if (b.action === "gonder") {
      if (b.onay !== "GÖNDER") return NextResponse.json({ error: "Onay metni eksik." }, { status: 400 });
      const r = await topluGonder(tur, String((s as { name?: string; username?: string }).name ?? (s as { username?: string }).username ?? "admin"), b.kampanyaId);
      return NextResponse.json({ ok: true, ...r });
    }
    if (b.action === "whatsapp") {
      const k = await getKampanya(String(b.kampanyaId));
      if (!k) return NextResponse.json({ error: "Kampanya bulunamadı." }, { status: 404 });
      await whatsappIsaretle(k, String(b.userId), String(b.phone ?? ""), b.gonderildi === true);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  } catch (e) {
    console.error("[uye-gonderim]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Gönderilemedi." }, { status: 500 });
  }
}
