// Doğrulama kodu e-postası (13 Ekim). Resend REST API ile gönderilir; SDK yok.
// Gerekli ortam değişkenleri (Vercel): RESEND_API_KEY ve LEAD_EMAIL_FROM (ör. "Hadi Umreye Gidelim <kitapcik@hadiumreyegidelim.com>",
// alan adı Resend'de doğrulanmış olmalı). İkisi yoksa kod gönderilmez; form yalnızca adres kontrolleriyle çalışır.
// Tasarım site kimliğiyle aynı (13 Ekim, kullanıcı): logo, Pantone renkleri, kitap kapağı, kendi ikon setimiz
// (Gmail SVG göstermediği için public/email/*.png), Cairo (yüklenmezse Segoe UI/Arial), serif italik vurgu.
import { SITE_URL } from "@/lib/seo/site";
import { LEAD_FILES, LEAD_SOURCES } from "@/lib/leads";

export function emailVerificationEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.LEAD_EMAIL_FROM);
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

const SANS = "'Cairo','Segoe UI',Helvetica,Arial,sans-serif";
const SERIF = "'Noto Serif',Georgia,'Times New Roman',serif";

export function leadCodeEmail(opts: { name: string; code: string; source: string; leadId: string }) {
  const file = LEAD_FILES[opts.source] ?? LEAD_FILES["tavaf-kitapcigi"];
  const title = LEAD_SOURCES[opts.source] ?? "El Kitabı";
  const first = esc(opts.name.split(" ")[0]);
  const link = `${SITE_URL}/api/leads/dogrula?l=${encodeURIComponent(opts.leadId)}&k=${opts.code}`;
  const img = (p: string) => `${SITE_URL}${p}`;
  const ozellik = (ikon: string, metin: string) =>
    `<td width="33%" align="center" valign="top" style="padding:0 6px"><img src="${img(`/email/ikon-${ikon}.png`)}" width="34" height="34" alt="" style="display:block;margin:0 auto 8px"><span style="font-family:${SANS};font-size:12px;line-height:1.4;color:#3d4a66">${metin}</span></td>`;

  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Noto+Serif:ital@1&display=swap" rel="stylesheet">
<title>${esc(title)} doğrulama kodu</title></head>
<body style="margin:0;padding:0;background:#edf1fe">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">Kodunuz ${opts.code} · 15 dakika geçerli · ${esc(title)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#edf1fe" style="background:#edf1fe"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d7e0f0">

<tr><td style="padding:22px 28px 18px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td><a href="${SITE_URL}"><img src="${img("/email/logo.png")}" width="84" alt="Hadi Umreye Gidelim" style="display:block;border:0"></a></td>
    <td align="right" style="font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:2.5px;color:#1d428a">ÜCRETSİZ KİTAPÇIK</td>
  </tr></table>
</td></tr>

<tr><td bgcolor="#1d428a" style="background:#1d428a;background-image:linear-gradient(135deg,#12295a 0%,#1d428a 100%);padding:24px 28px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td width="104" valign="middle"><img src="${img(file.cover)}" width="92" alt="${esc(title)} kapağı" style="display:block;border-radius:6px;border:1px solid rgba(255,255,255,0.15)"></td>
    <td valign="middle" style="padding-left:18px">
      <p style="margin:0 0 6px;font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:2.5px;color:#f2dda6">${esc(title.toLocaleUpperCase("tr-TR"))}</p>
      <p style="margin:0;font-family:${SANS};font-size:24px;line-height:1.2;font-weight:700;color:#ffffff">Kitapçığınız bir adım <em style="font-family:${SERIF};font-style:italic;font-weight:400;color:#f2dda6">uzakta</em></p>
      <p style="margin:8px 0 0;font-family:${SANS};font-size:13px;line-height:1.5;color:#d6e0f2">${esc(file.alt ?? "Okunuşu ve anlamıyla 19 sayfa; telefonunuza kaydedin ya da yazdırın.")}</p>
    </td>
  </tr></table>
</td></tr>

<tr><td style="padding:28px 28px 8px;font-family:${SANS};color:#14213d">
  <p style="margin:0 0 10px;font-size:16px;font-weight:700">Merhaba ${first},</p>
  <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3d4a66">E-posta adresinizi doğrulamak için kodu sayfadaki kutuya yazın ya da aşağıdaki düğmeye dokunun; kitapçık hemen iner.</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#edf1fe" style="background:#edf1fe;border:2px dashed #b8c9e3;border-radius:14px;padding:16px 10px">
    <p style="margin:0 0 4px;font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:2.5px;color:#5b6680">DOĞRULAMA KODU</p>
    <p style="margin:0;font-family:${SANS};font-size:36px;font-weight:700;letter-spacing:10px;color:#1d428a">${opts.code}</p>
  </td></tr></table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px"><tr><td align="center">
    <a href="${link}" style="display:inline-block;background:#1d428a;color:#ffffff;font-family:${SANS};font-size:15px;font-weight:700;text-decoration:none;padding:15px 30px;border-radius:12px">Kitapçığı indir &rarr;</a>
  </td></tr></table>
  <p style="margin:14px 0 0;text-align:center;font-size:12px;color:#8a94ab">Kod 15 dakika geçerlidir.</p>
</td></tr>

<tr><td style="padding:22px 22px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e1e6ef"><tr><td style="padding-top:22px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    ${ozellik(file.icon, file.ozellik ?? "7 şavt,<br>7 niyet")}${ozellik("dua", "Okunuşu ve<br>anlamıyla dualar")}${ozellik("guven", "Kaynakları<br>belli dualar")}
  </tr></table>
</td></tr></table></td></tr>

<tr><td align="center" style="padding:20px 28px 26px">
  <p style="margin:0;font-family:${SERIF};font-style:italic;font-size:16px;line-height:1.5;color:#1d428a">${esc(file.dua)}</p>
</td></tr>

<tr><td bgcolor="#f2dda6" style="background:#f2dda6;padding:18px 28px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="font-family:${SANS};font-size:13px;line-height:1.5;color:#12295a"><b>Umrenizi kendi tarihinizde planlayın.</b><br>Vize, otel ve transfer; teklifiniz WhatsApp'tan gelsin.</td>
    <td align="right" width="120"><a href="${SITE_URL}/bireysel-umre" style="display:inline-block;background:#12295a;color:#f2dda6;font-family:${SANS};font-size:12px;font-weight:700;text-decoration:none;padding:10px 14px;border-radius:10px">Planla</a></td>
  </tr></table>
</td></tr>
</table>

<p style="margin:18px 0 0;font-family:${SANS};font-size:11px;line-height:1.6;color:#8a94ab;text-align:center">
<a href="${SITE_URL}" style="color:#5b6680;text-decoration:none">hadiumreyegidelim.com</a> · WhatsApp +90 540 401 00 38<br>
Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
</td></tr></table></body></html>`;

  const text = `Merhaba ${opts.name.split(" ")[0]},\n\n${title} için doğrulama kodunuz: ${opts.code}\n\nKodu sayfadaki kutuya yazın ya da bu bağlantıyı açın: ${link}\nKod 15 dakika geçerlidir.\n\n${file.dua}\n\nHadi Umreye Gidelim · hadiumreyegidelim.com`;
  return { subject: `${opts.code} · ${title} doğrulama kodunuz`, html, text };
}

/** Kodu gönderir; Resend'in e-posta kimliğini döndürür (teslim olayları bu kimlikle gelir). */
export async function sendLeadCode(opts: { to: string; name: string; code: string; source: string; leadId: string }): Promise<string | null> {
  const { subject, html, text } = leadCodeEmail(opts);
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.LEAD_EMAIL_FROM, to: [opts.to], subject, html, text, tags: [{ name: "lead", value: opts.leadId }] }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const d = (await r.json().catch(() => ({}))) as { id?: string };
  return d.id ?? null;
}

/** Şifre sıfırlama kodu (üyelik, 13 Ekim). Aynı kimlik, kitapçık e-postasının sade hali. */
export function passwordResetEmail(opts: { name: string; code: string }) {
  const first = esc(opts.name.split(" ")[0]);
  const img = (p: string) => `${SITE_URL}${p}`;
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Noto+Serif:ital@1&display=swap" rel="stylesheet"><title>Şifre sıfırlama kodu</title></head>
<body style="margin:0;padding:0;background:#edf1fe">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">Şifre sıfırlama kodunuz ${opts.code} · 15 dakika geçerli</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#edf1fe"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d7e0f0">
<tr><td style="padding:22px 28px 18px"><a href="${SITE_URL}"><img src="${img("/email/logo.png")}" width="84" alt="Hadi Umreye Gidelim" style="display:block;border:0"></a></td></tr>
<tr><td bgcolor="#1d428a" style="background:#1d428a;background-image:linear-gradient(135deg,#12295a 0%,#1d428a 100%);padding:24px 28px">
  <p style="margin:0 0 6px;font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:2.5px;color:#f2dda6">HESABINIZ</p>
  <p style="margin:0;font-family:${SANS};font-size:24px;line-height:1.2;font-weight:700;color:#ffffff">Yeni şifrenizi <em style="font-family:${SERIF};font-style:italic;font-weight:400;color:#f2dda6">belirleyin</em></p>
</td></tr>
<tr><td style="padding:28px;font-family:${SANS};color:#14213d">
  <p style="margin:0 0 10px;font-size:16px;font-weight:700">Merhaba ${first},</p>
  <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3d4a66">Şifre sıfırlama kodunuz aşağıda. Kodu sayfadaki kutuya yazıp yeni şifrenizi belirleyin.</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" bgcolor="#edf1fe" style="background:#edf1fe;border:2px dashed #b8c9e3;border-radius:14px;padding:16px 10px">
    <p style="margin:0 0 4px;font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:2.5px;color:#5b6680">SIFIRLAMA KODU</p>
    <p style="margin:0;font-family:${SANS};font-size:36px;font-weight:700;letter-spacing:10px;color:#1d428a">${opts.code}</p>
  </td></tr></table>
  <p style="margin:16px 0 0;text-align:center;font-size:12px;color:#8a94ab">Kod 15 dakika geçerlidir. Bu isteği siz yapmadıysanız şifreniz değişmez; e-postayı yok sayabilirsiniz.</p>
</td></tr></table>
<p style="margin:18px 0 0;font-family:${SANS};font-size:11px;color:#8a94ab;text-align:center"><a href="${SITE_URL}" style="color:#5b6680;text-decoration:none">hadiumreyegidelim.com</a> · WhatsApp +90 540 401 00 38</p>
</td></tr></table></body></html>`;
  const text = `Merhaba ${opts.name.split(" ")[0]},\n\nŞifre sıfırlama kodunuz: ${opts.code}\nKod 15 dakika geçerlidir. Bu isteği siz yapmadıysanız e-postayı yok sayabilirsiniz.\n\nHadi Umreye Gidelim`;
  return { subject: `${opts.code} · Şifre sıfırlama kodunuz`, html, text };
}

export async function sendPasswordCode(opts: { to: string; name: string; code: string }): Promise<void> {
  if (!emailVerificationEnabled()) {
    // Yerel geliştirmede e-posta servisi yok: kod sunucu konsoluna yazılır (canlıda asla)
    if (process.env.NODE_ENV !== "production") console.log(`[şifre sıfırlama] ${opts.to} kodu: ${opts.code}`);
    else throw new Error("E-posta servisi yapılandırılmamış");
    return;
  }
  const { subject, html, text } = passwordResetEmail(opts);
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.LEAD_EMAIL_FROM, to: [opts.to], subject, html, text }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

/** Umre dosyası güncellendi (aşama değişti) e-postası. */
export async function sendUmreGuncelleme(opts: { to: string; name: string; no: string; asama: string; aciklama: string }) {
  const first = esc(opts.name.split(" ")[0]);
  const link = `${SITE_URL}/profil/umrelerim/${encodeURIComponent(opts.no)}`;
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Noto+Serif:ital@1&display=swap" rel="stylesheet"><title>Umre dosyanız güncellendi</title></head>
<body style="margin:0;padding:0;background:#edf1fe">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(opts.asama)} · ${esc(opts.no)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#edf1fe"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d7e0f0">
<tr><td style="padding:22px 28px 18px"><a href="${SITE_URL}"><img src="${SITE_URL}/email/logo.png" width="84" alt="Hadi Umreye Gidelim" style="display:block;border:0"></a></td></tr>
<tr><td bgcolor="#1d428a" style="background:#1d428a;background-image:linear-gradient(135deg,#12295a 0%,#1d428a 100%);padding:24px 28px">
  <p style="margin:0 0 6px;font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:2.5px;color:#f2dda6">UMRE DOSYANIZ · ${esc(opts.no)}</p>
  <p style="margin:0;font-family:${SANS};font-size:24px;line-height:1.2;font-weight:700;color:#ffffff">${esc(opts.asama)}</p>
</td></tr>
<tr><td style="padding:28px;font-family:${SANS};color:#14213d">
  <p style="margin:0 0 10px;font-size:16px;font-weight:700">Merhaba ${first},</p>
  <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#3d4a66">${esc(opts.aciklama)}</p>
  <a href="${link}" style="display:inline-block;background:#1d428a;color:#ffffff;font-family:${SANS};font-size:15px;font-weight:700;text-decoration:none;padding:14px 26px;border-radius:12px">Dosyamı aç &rarr;</a>
  <p style="margin:22px 0 0;font-family:${SERIF};font-style:italic;font-size:15px;color:#1d428a">Rabbim umrenizi kolaylaştırsın.</p>
</td></tr></table>
<p style="margin:18px 0 0;font-family:${SANS};font-size:11px;color:#8a94ab;text-align:center"><a href="${SITE_URL}" style="color:#5b6680;text-decoration:none">hadiumreyegidelim.com</a> · WhatsApp +90 540 401 00 38</p>
</td></tr></table></body></html>`;
  const text = `Merhaba ${opts.name.split(" ")[0]},\n\nUmre dosyanız (${opts.no}) güncellendi: ${opts.asama}.\n${opts.aciklama}\n\nDosyanız: ${link}\n\nHadi Umreye Gidelim`;
  if (!emailVerificationEnabled()) {
    if (process.env.NODE_ENV !== "production") console.log(`[umre bildirimi] ${opts.to}: ${opts.asama}`);
    return;
  }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.LEAD_EMAIL_FROM, to: [opts.to], subject: `${opts.asama} · Umre dosyanız ${opts.no}`, html, text }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 200)}`);
}

/** Üye e-posta doğrulama kodu (kayıttan sonra). */
export async function sendUyeDogrulama(opts: { to: string; name: string; code: string }) {
  const { html, text } = passwordResetEmail(opts);
  const html2 = html.replace("Yeni şifrenizi", "E-postanızı").replace(">belirleyin<", ">doğrulayın<").replace("Şifre sıfırlama kodunuz aşağıda. Kodu sayfadaki kutuya yazıp yeni şifrenizi belirleyin.", "Hesabınızı doğrulamak için kodu profilinizdeki kutuya yazın. Doğrulanan hesaba umre dosyanız ve teklifleriniz kendiliğinden bağlanır.").replace("SIFIRLAMA KODU", "DOĞRULAMA KODU").replace("Şifre sıfırlama kodu", "E-posta doğrulama kodu").replace("Bu isteği siz yapmadıysanız şifreniz değişmez; e-postayı yok sayabilirsiniz.", "Bu isteği siz yapmadıysanız e-postayı yok sayabilirsiniz.");
  if (!emailVerificationEnabled()) {
    if (process.env.NODE_ENV !== "production") console.log(`[üye doğrulama] ${opts.to} kodu: ${opts.code}`);
    return;
  }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.LEAD_EMAIL_FROM, to: [opts.to], subject: `${opts.code} · E-posta doğrulama kodunuz`, html: html2, text: text.replace("Şifre sıfırlama kodunuz", "E-posta doğrulama kodunuz") }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 200)}`);
}
