// Doğrulama kodu e-postası (13 Ekim). Resend REST API ile gönderilir; SDK yok.
// Gerekli ortam değişkenleri (Vercel): RESEND_API_KEY ve LEAD_EMAIL_FROM (ör. "Hadi Umreye Gidelim <kitapcik@hadiumreyegidelim.com>",
// alan adı Resend'de doğrulanmış olmalı). İkisi yoksa kod gönderilmez; form yalnızca adres kontrolleriyle çalışır.
import { SITE_URL } from "@/lib/seo/site";

export function emailVerificationEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.LEAD_EMAIL_FROM);
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

export async function sendLeadCode(opts: { to: string; name: string; code: string; title: string; leadId: string }): Promise<void> {
  const first = opts.name.split(" ")[0];
  const link = `${SITE_URL}/api/leads/dogrula?l=${encodeURIComponent(opts.leadId)}&k=${opts.code}`;
  const html = `<!doctype html><html lang="tr"><body style="margin:0;background:#edf1fe;font-family:Arial,Helvetica,sans-serif;color:#14213d">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="background:#1d428a;padding:22px 28px;color:#f2dda6;font-size:12px;font-weight:bold;letter-spacing:3px">HADİ UMREYE GİDELİM</td></tr>
<tr><td style="padding:28px">
<p style="margin:0 0 12px;font-size:16px">Merhaba ${esc(first)},</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.5">${esc(opts.title)} için doğrulama kodunuz:</p>
<p style="margin:0 0 24px;font-size:34px;font-weight:bold;letter-spacing:10px;color:#1d428a">${opts.code}</p>
<p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#5b6680">Kodu sayfadaki kutuya yazın ya da aşağıdaki düğmeye dokunun; kitapçık hemen iner. Kod 15 dakika geçerlidir.</p>
<p style="margin:0 0 24px"><a href="${link}" style="display:inline-block;background:#1d428a;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:10px">Kitapçığı indir</a></p>
<p style="margin:0;font-size:12px;line-height:1.5;color:#8a94ab">Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
</td></tr></table>
<p style="font-size:11px;color:#8a94ab;margin:16px 0 0">hadiumreyegidelim.com</p>
</td></tr></table></body></html>`;
  const text = `Merhaba ${first},\n\n${opts.title} için doğrulama kodunuz: ${opts.code}\n\nKodu sayfadaki kutuya yazın ya da bu bağlantıyı açın: ${link}\nKod 15 dakika geçerlidir.\n\nHadi Umreye Gidelim`;

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.LEAD_EMAIL_FROM, to: [opts.to], subject: `Doğrulama kodunuz: ${opts.code}`, html, text }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 200)}`);
}
