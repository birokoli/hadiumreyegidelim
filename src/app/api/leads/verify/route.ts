// E-posta doğrulama kodu: kontrol ve yeniden gönderme (13 Ekim).
import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getLead, issueCode, recordEmailSent, verifyCode } from "@/lib/leads";
import { emailVerificationEnabled, sendLeadCode } from "@/lib/leads/mailer";

const MESSAGES = {
  wrong: "Kod hatalı; e-postanızdaki 6 haneli kodu kontrol edin.",
  expired: "Kodun süresi doldu; yeni kod isteyin.",
  locked: "Çok fazla hatalı deneme; yeni kod isteyin.",
  missing: "Kayıt bulunamadı; formu yeniden doldurun.",
} as const;

export async function POST(req: Request) {
  if (!rateLimit(getClientIp(req), "lead-verify", 20, 10 * 60 * 1000).allowed) return NextResponse.json({ ok: false, error: "Çok fazla deneme; birkaç dakika sonra tekrar deneyin." }, { status: 429 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const leadId = String(b.leadId ?? "");
  if (!/^ml_[a-z0-9]+$/.test(leadId)) return NextResponse.json({ ok: false, error: MESSAGES.missing }, { status: 400 });

  if (b.action === "resend") {
    const lead = await getLead(leadId);
    if (!lead?.email || !emailVerificationEnabled()) return NextResponse.json({ ok: false, error: MESSAGES.missing }, { status: 400 });
    if (lead.emailVerified) return NextResponse.json({ ok: true, verified: true });
    if (!rateLimit(lead.email, "lead-code", 3, 30 * 60 * 1000).allowed) return NextResponse.json({ ok: false, error: "Kısa sürede çok kod istendi; birkaç dakika bekleyin." }, { status: 429 });
    const code = await issueCode(leadId);
    try {
      await recordEmailSent(leadId, await sendLeadCode({ to: lead.email, name: lead.name, code, source: lead.source, leadId }));
    } catch (e) {
      console.error("[leads] kod yeniden gönderilemedi", e);
      return NextResponse.json({ ok: false, error: "E-posta şu an gönderilemedi; biraz sonra tekrar deneyin." }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  }

  const code = String(b.code ?? "").replace(/\D/g, "");
  if (code.length !== 6) return NextResponse.json({ ok: false, error: "6 haneli kodu yazın." }, { status: 400 });
  const result = await verifyCode(leadId, code);
  if (result === "ok") return NextResponse.json({ ok: true, verified: true });
  return NextResponse.json({ ok: false, error: MESSAGES[result], reason: result }, { status: 400 });
}
