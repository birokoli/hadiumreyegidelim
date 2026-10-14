// Üyelere giden e-postalar (Profil 2, 14 Ekim): hesap duyurusu (bilgilendirme; fiyat/kampanya yok, herkese gider) ve
// kampanya e-postası (yalnızca e-posta izni olanlara; tek tıkla abonelikten çıkma). Tasarım kitapçık e-postasıyla aynı kimlik.
import { createHmac } from "node:crypto";
import { getJwtKey } from "@/lib/jwt-key";
import { SITE_URL } from "@/lib/seo/site";
import { geceToplam, trGun, usdTam, type Kampanya } from "./ortak";

const SANS = "'Cairo','Segoe UI',Helvetica,Arial,sans-serif";
const SERIF = "'Noto Serif',Georgia,'Times New Roman',serif";
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
const vurgu = (s: string) => esc(s).replace(/\*([^*]+)\*/g, `<em style="font-family:${SERIF};font-style:italic;font-weight:400;color:#f2dda6">$1</em>`);
const img = (p: string) => (p.startsWith("http") ? p : `${SITE_URL}${p}`);
const utm = (campaign: string, medium: string) => `utm_source=eposta&utm_medium=${medium}&utm_campaign=${encodeURIComponent(campaign)}`;

export const DUYURU_KONU = "Hesabınız yenilendi: umrenizi artık profilinizden takip edebilirsiniz";
export const DUYURU_ANAHTAR = "profil2-duyuru";

/** Abonelikten çıkma bağlantısı için imza: userId'yi oturum anahtarıyla imzalar (tahmin edilemez, süresiz). */
export async function abonelikImza(userId: string): Promise<string> {
  const key = Buffer.from(await getJwtKey());
  return createHmac("sha256", key).update(`abonelik:${userId}`).digest("base64url").slice(0, 32);
}
export async function abonelikLinki(userId: string): Promise<string> {
  return `${SITE_URL}/api/profil/abonelik?u=${encodeURIComponent(userId)}&k=${await abonelikImza(userId)}`;
}

function kabuk(opts: { onizleme: string; ust: string; baslik: string; govde: string; alt: string }) {
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Noto+Serif:ital@1&display=swap" rel="stylesheet"><title>Hadi Umreye Gidelim</title></head>
<body style="margin:0;padding:0;background:#edf1fe">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(opts.onizleme)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#edf1fe" style="background:#edf1fe"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #d7e0f0">
<tr><td style="padding:22px 28px 18px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td><a href="${SITE_URL}"><img src="${img("/email/logo.png")}" width="84" alt="Hadi Umreye Gidelim" style="display:block;border:0"></a></td>
    <td align="right" style="font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:2.5px;color:#1d428a">${esc(opts.ust)}</td>
  </tr></table>
</td></tr>
${opts.baslik}
${opts.govde}
</table>
<p style="margin:18px 0 0;font-family:${SANS};font-size:11px;line-height:1.6;color:#8a94ab;text-align:center;max-width:520px">${opts.alt}</p>
</td></tr></table></body></html>`;
}

const ozellik = (ikon: string, baslik: string, metin: string) => `<tr><td style="padding:0 0 14px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td width="46" valign="top"><img src="${img(`/email/ikon-${ikon}.png`)}" width="34" height="34" alt="" style="display:block"></td>
    <td valign="top" style="font-family:${SANS};font-size:14px;line-height:1.55;color:#3d4a66"><b style="color:#14213d">${baslik}</b><br>${metin}</td>
  </tr></table></td></tr>`;

/** Hesap duyurusu: yalnızca hesabın yeni bölümleri; fiyat, indirim ya da kampanya içermez. */
export function duyuruEposta(opts: { ad: string; email: string }) {
  const first = esc(opts.ad.split(" ")[0]);
  const link = `${SITE_URL}/profil?${utm("profil2", "duyuru")}`;
  const sifre = `${SITE_URL}/profil/sifremi-unuttum?email=${encodeURIComponent(opts.email)}`;
  const html = kabuk({
    onizleme: "Umre dosyanız, el kitaplarınız ve size özel bölüm tek yerde.",
    ust: "HESABINIZ",
    baslik: `<tr><td bgcolor="#1d428a" style="background:#1d428a;background-image:linear-gradient(135deg,#12295a 0%,#1d428a 100%);padding:26px 28px">
  <p style="margin:0 0 6px;font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:2.5px;color:#f2dda6">PROFİLİNİZ YENİLENDİ</p>
  <p style="margin:0;font-family:${SANS};font-size:25px;line-height:1.2;font-weight:700;color:#ffffff">Umreniz artık <em style="font-family:${SERIF};font-style:italic;font-weight:400;color:#f2dda6">tek bir yerde</em></p>
</td></tr>`,
    govde: `<tr><td style="padding:28px 28px 8px;font-family:${SANS};color:#14213d">
  <p style="margin:0 0 10px;font-size:16px;font-weight:700">Merhaba ${first},</p>
  <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#3d4a66">Hadi Umreye Gidelim hesabınızı yeniledik. Profilinizde artık umrenizle ilgili her şey tek bir yerde:</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${ozellik("onay", "Umre dosyanız", "Vizenizden otelinize, karşılamadan tren saatine kadar her adımı takip edin. Belgeleriniz ve voucher'ınız da burada.")}
    ${ozellik("tavaf", "El kitaplarınız", "Tavafta ve Sa'yde okunacak dualar, okunuşu ve anlamıyla. Harem'de telefonunuzdan şavt şavt takip edebilirsiniz.")}
    ${ozellik("dua", "Umre planınız", "Ne zaman ve kimlerle gitmek istediğinizi yazın, size uygun tarihleri hesabınızda görün.")}
    ${ozellik("guven", "Size özel", "Üyelerimize ayrılan tarihler bu bölümde yayınlanır.")}
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px"><tr><td align="center">
    <a href="${link}" style="display:inline-block;background:#1d428a;color:#ffffff;font-family:${SANS};font-size:15px;font-weight:700;text-decoration:none;padding:15px 34px;border-radius:12px">Profilime git &rarr;</a>
  </td></tr></table>
  <p style="margin:16px 0 0;text-align:center;font-size:13px;line-height:1.5;color:#5b6680">Şifrenizi hatırlamıyorsanız <a href="${sifre}" style="color:#1d428a;font-weight:700">buradan</a> birkaç saniyede yenileyebilirsiniz.</p>
</td></tr>
<tr><td align="center" style="padding:22px 28px 26px">
  <p style="margin:0;font-family:${SERIF};font-style:italic;font-size:16px;line-height:1.5;color:#1d428a">Rabbim umre niyetinizi kolaylaştırsın.</p>
  <p style="margin:6px 0 0;font-family:${SANS};font-size:13px;font-weight:700;color:#14213d">Hadi Umreye Gidelim</p>
</td></tr>`,
    alt: `Bu e-postayı hadiumreyegidelim.com'daki üyeliğiniz nedeniyle alıyorsunuz. Üyeliğinizi <a href="${SITE_URL}/profil/hesap" style="color:#5b6680">profilinizdeki Hesap bölümünden</a> kapatabilirsiniz.<br><a href="${SITE_URL}" style="color:#5b6680;text-decoration:none">hadiumreyegidelim.com</a> · WhatsApp +90 540 401 00 38`,
  });
  const text = `Merhaba ${opts.ad.split(" ")[0]},

Hadi Umreye Gidelim hesabınızı yeniledik. Profilinizde artık umrenizle ilgili her şey tek bir yerde:

- Umre dosyanız: vizenizden otelinize, karşılamadan tren saatine kadar her adımı takip edin. Belgeleriniz ve voucher'ınız da burada.
- El kitaplarınız: Tavafta ve Sa'yde okunacak dualar, okunuşu ve anlamıyla.
- Umre planınız: ne zaman ve kimlerle gitmek istediğinizi yazın, size uygun tarihleri hesabınızda görün.
- Size özel: üyelerimize ayrılan tarihler bu bölümde yayınlanır.

Profilime git: ${link}
Şifrenizi hatırlamıyorsanız: ${sifre}

Rabbim umre niyetinizi kolaylaştırsın.
Hadi Umreye Gidelim

Bu e-postayı hadiumreyegidelim.com'daki üyeliğiniz nedeniyle alıyorsunuz. Üyeliğinizi profilinizdeki Hesap bölümünden kapatabilirsiniz.`;
  return { subject: DUYURU_KONU, html, text };
}

/** Kampanya e-postası: yalnızca e-posta izni olan üyelere; abonelikten çıkma bağlantısı ve List-Unsubscribe başlığıyla. */
export function kampanyaEposta(opts: { ad: string; k: Kampanya; abonelik: string }) {
  const { k } = opts;
  const first = esc(opts.ad.split(" ")[0]);
  const link = `${SITE_URL}/profil/size-ozel?${utm(k.id, "kampanya")}`;
  const tarihler = k.gidis ? `${trGun(k.gidis)} – ${trGun(k.donus, { day: "numeric", month: "long", year: "numeric" })}` : "";
  const gece = geceToplam(k);
  const satir = (a: string, b: string) => `<tr><td style="padding:8px 0;border-top:1px solid #e1e6ef;font-family:${SANS};font-size:13px;color:#5b6680" width="38%">${a}</td><td style="padding:8px 0;border-top:1px solid #e1e6ef;font-family:${SANS};font-size:14px;font-weight:700;color:#14213d">${b}</td></tr>`;
  const dahil = k.dahil.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
  const html = kabuk({
    onizleme: `${k.baslik.replace(/\*/g, "")}${tarihler ? ` · ${tarihler}` : ""} · üyelere özel`,
    ust: "ÜYELERE ÖZEL",
    baslik: `<tr><td style="padding:0"><img src="${img(k.gorsel || "/images/hero-kabe.jpg")}" width="560" alt="" style="display:block;width:100%;height:auto;max-height:220px;object-fit:cover"></td></tr>
<tr><td bgcolor="#1d428a" style="background:#1d428a;background-image:linear-gradient(135deg,#12295a 0%,#1d428a 100%);padding:24px 28px">
  <p style="margin:0 0 6px;font-family:${SANS};font-size:10px;font-weight:700;letter-spacing:2.5px;color:#f2dda6">${esc([tarihler, gece ? `${gece} GECE` : ""].filter(Boolean).join(" · ").toLocaleUpperCase("tr-TR"))}</p>
  <p style="margin:0;font-family:${SANS};font-size:25px;line-height:1.2;font-weight:700;color:#ffffff">${vurgu(k.baslik)}</p>
</td></tr>`,
    govde: `<tr><td style="padding:26px 28px 8px;font-family:${SANS};color:#14213d">
  <p style="margin:0 0 10px;font-size:16px;font-weight:700">Merhaba ${first},</p>
  ${k.aciklama ? `<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#3d4a66">${esc(k.aciklama)}</p>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    ${k.mekkeOtel ? satir(`Mekke${k.mekkeGece ? ` · ${k.mekkeGece} gece` : ""}`, esc(k.mekkeOtel)) : ""}
    ${k.medineOtel ? satir(`Medine${k.medineGece ? ` · ${k.medineGece} gece` : ""}`, esc(k.medineOtel)) : ""}
    ${dahil.length ? satir("Dahil", esc(dahil.join(" · "))) : ""}
    ${k.uyeFiyat != null ? satir("Üye fiyatı", `${usdTam(k.uyeFiyat)} <span style="font-weight:400;color:#5b6680">kişi başı</span>${k.normalFiyat != null && k.normalFiyat > k.uyeFiyat ? ` <s style="font-weight:400;color:#8a94ab">${usdTam(k.normalFiyat)}</s>` : ""}`) : ""}
    ${k.sonTarih ? satir("Son başvuru", trGun(k.sonTarih, { day: "numeric", month: "long", year: "numeric" })) : ""}
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:22px"><tr><td align="center">
    <a href="${link}" style="display:inline-block;background:#1d428a;color:#ffffff;font-family:${SANS};font-size:15px;font-weight:700;text-decoration:none;padding:15px 34px;border-radius:12px">Teklif iste &rarr;</a>
  </td></tr></table>
  <p style="margin:14px 0 0;text-align:center;font-size:12px;color:#8a94ab">Ödeme şimdi alınmaz; ekibimiz teklifi WhatsApp'tan gönderir.</p>
</td></tr>
<tr><td align="center" style="padding:22px 28px 26px">
  <p style="margin:0;font-family:${SERIF};font-style:italic;font-size:16px;line-height:1.5;color:#1d428a">Rabbim umre niyetinizi kolaylaştırsın.</p>
</td></tr>`,
    alt: `Bu e-postayı üyelere özel tarihlerden haberdar olmak istediğiniz için alıyorsunuz. <a href="${opts.abonelik}" style="color:#5b6680">Bu e-postaları almak istemiyorum</a><br>MBD Travel LLC · <a href="${SITE_URL}" style="color:#5b6680;text-decoration:none">hadiumreyegidelim.com</a> · WhatsApp +90 540 401 00 38`,
  });
  const text = `Merhaba ${opts.ad.split(" ")[0]},

${k.baslik.replace(/\*/g, "")}${tarihler ? `\n${tarihler}${gece ? ` · ${gece} gece` : ""}` : ""}
${k.aciklama ?? ""}
${k.uyeFiyat != null ? `Üye fiyatı: ${usdTam(k.uyeFiyat)} kişi başı` : ""}

Teklif iste: ${link}

Bu e-postaları almak istemiyorsanız: ${opts.abonelik}
MBD Travel LLC · hadiumreyegidelim.com`;
  return { subject: `${k.baslik.replace(/\*/g, "")} · üyelere özel`, html, text };
}
