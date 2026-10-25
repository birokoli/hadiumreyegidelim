// Ödeme sağlayıcısının bildirim (webhook) adresi. Sağlayıcı tanımlı değilken kapalıdır (WhatsApp ile ödeme dönemi).
// Kurulum: src/lib/ramazan/odeme.ts
import { NextResponse } from "next/server";
import { odemeBildiriminiIsle } from "@/lib/ramazan";
import { odemeSaglayici } from "@/lib/ramazan/odeme";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const s = odemeSaglayici();
  if (!s) return NextResponse.json({ error: "Ödeme sağlayıcısı tanımlı değil." }, { status: 404 });
  const b = await s.bildirimDogrula(req).catch((e) => { console.error("[ramazan-odeme] doğrulama", e); return null; });
  if (!b) return NextResponse.json({ error: "Geçersiz bildirim." }, { status: 400 });
  if (!b.basarili) return NextResponse.json({ ok: true, islem: "başarısız ödeme kaydedilmedi" });
  const r = await odemeBildiriminiIsle({ kod: b.kod, ref: b.ref, tutarUsd: b.tutarUsd, yontem: s.ad });
  if (!r.ok) console.warn("[ramazan-odeme]", b.kod, r.hata);
  return NextResponse.json({ ok: r.ok, hata: r.hata });
}
