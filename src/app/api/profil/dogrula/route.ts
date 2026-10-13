// Üye e-posta doğrulama (13 Ekim): kod gönder / kodu doğrula. Doğrulanan hesaba umre dosyası ve teklifler e-postayla bağlanır.
import { NextResponse } from "next/server";
import { checkCode, issueCode, markEmailVerified } from "@/lib/members";
import { uyeOturumu } from "@/lib/members/guard";
import { sendUyeDogrulama } from "@/lib/leads/mailer";
import { rateLimit } from "@/lib/rate-limit";

const MESAJ = { wrong: "Kod hatalı.", expired: "Kodun süresi doldu; yeni kod isteyin.", locked: "Çok fazla hatalı deneme; yeni kod isteyin.", missing: "Önce kod isteyin." } as const;

export async function POST(req: Request) {
  const o = await uyeOturumu();
  if (!o) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  if (o.dogrulandi) return NextResponse.json({ ok: true, dogrulandi: true });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (b.action === "gonder") {
    if (!rateLimit(o.m.id, "uye-dogrula", 4, 30 * 60 * 1000).allowed) return NextResponse.json({ error: "Kısa sürede çok kod istendi; e-postanızdaki son kodu kullanın." }, { status: 429 });
    try {
      await sendUyeDogrulama({ to: o.m.email, name: o.m.name, code: await issueCode(o.m.id, "eposta") });
    } catch (e) {
      console.error("[uye-dogrula]", e);
      return NextResponse.json({ error: "E-posta şu an gönderilemedi; biraz sonra tekrar deneyin." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }
  const code = String(b.code ?? "").replace(/\D/g, "");
  if (code.length !== 6) return NextResponse.json({ error: "6 haneli kodu yazın." }, { status: 400 });
  const r = await checkCode(o.m.id, "eposta", code);
  if (r !== "ok") return NextResponse.json({ error: MESAJ[r] }, { status: 400 });
  await markEmailVerified(o.m.id);
  return NextResponse.json({ ok: true, dogrulandi: true });
}
