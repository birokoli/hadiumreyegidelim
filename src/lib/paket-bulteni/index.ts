// Paket bülteni (21 Ekim, kullanıcı: "pazarlama izni verenlere paket tasarımlarını gönderebileceğimiz bir sistem").
// Alıcılar: e-posta izni olan üyeler + kitapçık formunda pazarlama iznini işaretleyen ve adresini doğrulayan kayıtlar
// (MarketingLead). Aynı adres bir kez; üye izni kapattıysa havuz kaydındaki izin de sayılmaz; geri dönen/spam adresler çıkar.
// Gönderimler üye gönderimleriyle aynı tablolarda (UyeGonderim, tur = "paket"); Resend olayları oraya işlenir.
// E-posta Instagram görselleriyle aynı beyaz tasarım dilinde: logo, aralıklı gri üst başlık, altın çizgi, lacivert kutular.
import { prisma } from "@/lib/prisma";
import { getCatalog, monthLabel } from "@/lib/catalog";
import { otelGalerisi } from "@/lib/hotels/galeri";
import { ensureLeadSchema } from "@/lib/leads";
import { emailVerificationEnabled } from "@/lib/leads/mailer";
import { listMembersForAdmin } from "@/lib/members";
import { NET_PAKETLER, netPaketTablosu } from "@/lib/pricing/net-paket";
import { SITE_URL } from "@/lib/seo/site";
import { abonelikImza, abonelikLinki } from "@/lib/uye-kampanya/eposta";
import { engelliAdresler, ensureSchema, resendToplu } from "@/lib/uye-kampanya/gonderim";

export type BultenAyar = { kod: string; konu: string; kicker: string; baslik: string; giris: string; paketler: string[] };

export type PaketKart = { slug: string; otel: string; not: string; gorsel: string | null; fiyat: number; fiyatEtiket: string; ay: string };

const SANS = "'Cairo','Segoe UI',Helvetica,Arial,sans-serif";
const LAC = "#203c76";
const GRI = "#5b6b86";
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
const abs = (p: string) => (p.startsWith("http") ? p : `${SITE_URL}${p}`);
const usd = (n: number) => `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}&nbsp;$`;
const yeniId = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** Gönderilebilecek paketler: yayındaki net fiyatlı paketler, vitrin fiyatıyla */
export async function paketKartlari(slugs?: string[]): Promise<PaketKart[]> {
  const hedef = (slugs ?? Object.keys(NET_PAKETLER)).filter((s) => NET_PAKETLER[s]);
  if (!hedef.length) return [];
  const [catalog, paketler] = await Promise.all([
    getCatalog(),
    prisma.package.findMany({ where: { slug: { in: hedef }, published: true }, select: { slug: true, title: true } }),
  ]);
  const kartlar: PaketKart[] = [];
  for (const slug of hedef) {
    const cfg = NET_PAKETLER[slug];
    if (!paketler.some((p) => p.slug === slug)) continue;
    const sonuc = netPaketTablosu(cfg, catalog);
    if (!sonuc) continue;
    const vitrin = sonuc.tablo.find((t) => t.gece === cfg.vitrin.gece && t.kisi === cfg.vitrin.kisi) ?? sonuc.tablo[0];
    const otel = catalog.find((c) => c.category === "hotel" && c.slug === cfg.hotelSlug);
    kartlar.push({
      slug,
      otel: otel?.name ?? slug,
      not: [cfg.yemek ? cfg.yemek[0].toLocaleUpperCase("tr-TR") + cfg.yemek.slice(1) : "Yalnızca oda", cfg.otelNotu].join(" · "),
      gorsel: otelGalerisi(cfg.hotelSlug)[0]?.src ?? null,
      fiyat: vitrin.kisiBasiUsd,
      fiyatEtiket: `kişi başı · ${vitrin.kisi} kişi, ${vitrin.gece} gece`,
      ay: monthLabel(sonuc.ay),
    });
  }
  return kartlar;
}

const utm = (kod: string, slug: string) => `utm_source=eposta&utm_medium=paket-bulteni&utm_campaign=${encodeURIComponent(kod)}&utm_content=${encodeURIComponent(slug)}`;

/** E-posta içeriği. ad boşsa "Merhaba," ile başlar. */
export function bultenEposta(a: BultenAyar, kartlar: PaketKart[], ad: string, cikis: string) {
  const ilk = ad.trim().split(/\s+/)[0] ?? "";
  const kart = (k: PaketKart, i: number) => {
    const link = `${SITE_URL}/paketler/${k.slug}?${utm(a.kod, k.slug)}`;
    return `<tr><td style="padding:${i ? 26 : 8}px 28px 0">
  ${k.gorsel ? `<a href="${link}"><img src="${abs(k.gorsel)}" width="504" alt="${esc(k.otel)}" style="display:block;width:100%;height:auto;max-height:230px;object-fit:cover;border-radius:16px;border:0"></a>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px"><tr>
    <td width="34" valign="top"><div style="width:28px;height:28px;border-radius:14px;background:${LAC};color:#fff;font-family:${SANS};font-size:14px;font-weight:700;line-height:28px;text-align:center">${i + 1}</div></td>
    <td valign="top" style="font-family:${SANS}"><p style="margin:0;font-size:21px;font-weight:800;line-height:1.2;color:${LAC}">${esc(k.otel)}</p>
      <p style="margin:4px 0 0;font-size:14px;line-height:1.45;color:${GRI}">${esc(k.not)}</p></td>
  </tr></table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;background:#e9eef7;border:2px solid ${LAC};border-radius:14px"><tr>
    <td style="padding:12px 16px;font-family:${SANS}"><p style="margin:0;font-size:24px;font-weight:800;color:${LAC};line-height:1.1">${usd(k.fiyat)}<span style="font-size:14px;font-weight:700">'dan</span></p>
      <p style="margin:3px 0 0;font-size:12px;color:${LAC}">${esc(k.fiyatEtiket)}</p></td>
    <td align="right" style="padding:12px 16px"><a href="${link}" style="display:inline-block;background:${LAC};color:#ffffff;font-family:${SANS};font-size:14px;font-weight:700;text-decoration:none;padding:11px 18px;border-radius:10px;white-space:nowrap">Fiyatını hesapla &rarr;</a></td>
  </tr></table>
</td></tr>`;
  };
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet"><title>${esc(a.konu)}</title></head>
<body style="margin:0;padding:0;background:#f3f5f9">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(a.giris)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f3f5f9" style="background:#f3f5f9"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dfe4ec">
<tr><td style="padding:26px 28px 0">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td><a href="${SITE_URL}"><img src="${abs("/email/logo.png")}" width="92" alt="Hadi Umreye Gidelim" style="display:block;border:0"></a></td>
    <td align="right"><span style="display:inline-block;border:2px solid ${LAC};border-radius:10px;padding:5px 11px;font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:2px;color:${LAC}">VİZE DAHİL</span></td>
  </tr></table>
  <p style="margin:24px 0 0;font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:3px;color:${GRI}">${esc(a.kicker.toLocaleUpperCase("tr-TR"))}</p>
  <p style="margin:6px 0 0;font-family:${SANS};font-size:30px;line-height:1.15;font-weight:800;color:${LAC}">${esc(a.baslik)}</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px"><tr><td width="90" style="height:3px;background:#b8902a;font-size:0;line-height:0">&nbsp;</td><td style="height:1px;background:#dfe4ec;font-size:0;line-height:0">&nbsp;</td></tr></table>
  <p style="margin:18px 0 0;font-family:${SANS};font-size:15px;line-height:1.6;color:#3d4a66">${ilk ? `Merhaba ${esc(ilk)},<br>` : "Merhaba,<br>"}${esc(a.giris)}</p>
</td></tr>
${kartlar.map(kart).join("\n")}
<tr><td style="padding:26px 28px 28px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td width="90" style="height:3px;background:#b8902a;font-size:0;line-height:0">&nbsp;</td><td style="height:1px;background:#dfe4ec;font-size:0;line-height:0">&nbsp;</td></tr></table>
  <p style="margin:14px 0 0;font-family:${SANS};font-size:13px;line-height:1.6;color:${GRI}">Fiyata umre vizesi, otel, havalimanında karşılama, özel araçla transfer ve Mekke ziyaret turu dahildir. Fiyatlar ${esc(kartlar[0]?.ay ?? "")} içindir; gece ve kişi sayısına göre değişir. Uçak bileti dahil değildir.</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px"><tr>
    <td style="font-family:${SANS};font-size:13px;font-weight:700;color:${GRI}"><a href="${SITE_URL}?utm_source=eposta&utm_medium=paket-bulteni&utm_campaign=${encodeURIComponent(a.kod)}" style="color:${GRI};text-decoration:none">hadiumreyegidelim.com</a></td>
    <td align="right" style="font-family:${SANS};font-size:13px;font-weight:800;color:${LAC}"><a href="https://wa.me/905404010038" style="color:${LAC};text-decoration:none">WhatsApp: +90 540 401 00 38</a></td>
  </tr></table>
</td></tr>
</table>
<p style="margin:18px 0 0;font-family:${SANS};font-size:11px;line-height:1.6;color:#8a94ab;text-align:center;max-width:520px">Bu e-postayı umre programları ve fiyatlarıyla ilgili e-posta almaya izin verdiğiniz için alıyorsunuz. <a href="${cikis}" style="color:#5b6680">Bu e-postaları almak istemiyorum</a><br>MBD Travel LLC · <a href="${SITE_URL}" style="color:#5b6680;text-decoration:none">hadiumreyegidelim.com</a></p>
</td></tr></table></body></html>`;
  const text = `${ilk ? `Merhaba ${ilk},` : "Merhaba,"}

${a.baslik}
${a.giris}

${kartlar.map((k, i) => `${i + 1}. ${k.otel} (${k.not})\n   ${k.fiyat.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} $'dan, ${k.fiyatEtiket}\n   Fiyatını hesapla: ${SITE_URL}/paketler/${k.slug}?${utm(a.kod, k.slug)}`).join("\n\n")}

Fiyata umre vizesi, otel, havalimanında karşılama, özel araçla transfer ve Mekke ziyaret turu dahildir. Uçak bileti dahil değildir.
WhatsApp: +90 540 401 00 38

Bu e-postaları almak istemiyorsanız: ${cikis}`;
  return { subject: a.konu, html, text };
}

/** Havuz kaydı için abonelikten çıkma bağlantısı (üyeninki /api/profil/abonelik) */
export async function havuzCikisLinki(leadId: string) {
  return `${SITE_URL}/api/bulten/cik?l=${encodeURIComponent(leadId)}&k=${await abonelikImza(`lead:${leadId}`)}`;
}

export type BultenAlici = { anahtar: string; ad: string; email: string; kaynak: "uye" | "havuz"; id: string };
export type AliciSayim = { alicilar: BultenAlici[]; uye: number; havuz: number; dogrulanmamis: number; engelli: number; zatenGitti: number; izniKapali: number };

/** Kime gidecek. anahtar: UyeGonderimAlici.userId alanına yazılan tekil anahtar (üye: userId, havuz: "lead:<id>"). */
export async function bultenAlicilari(kod: string): Promise<AliciSayim> {
  await Promise.all([ensureSchema(), ensureLeadSchema()]);
  const [uyeler, engelli, gitti, havuz] = await Promise.all([
    listMembersForAdmin(),
    engelliAdresler(),
    prisma.$queryRawUnsafe<{ u: string; a: string }[]>(`SELECT "userId" AS "u", LOWER("adres") AS "a" FROM "UyeGonderimAlici" WHERE "anahtar" = $1 AND "kanal" = 'eposta' AND "durum" <> 'hata'`, `paket:${kod}`),
    prisma.$queryRawUnsafe<{ id: string; name: string | null; email: string; emailVerified: boolean; emailStatus: string | null }[]>(
      `SELECT DISTINCT ON (LOWER("email")) "id", "name", "email", "emailVerified", "emailStatus" FROM "MarketingLead"
       WHERE "marketingConsent" = true AND "email" IS NOT NULL AND "email" <> '' ORDER BY LOWER("email"), "emailVerified" DESC, "createdAt" DESC`,
    ),
  ]);
  const gidenAdres = new Set(gitti.map((g) => g.a));
  const sayim: AliciSayim = { alicilar: [], uye: 0, havuz: 0, dogrulanmamis: 0, engelli: 0, zatenGitti: 0, izniKapali: 0 };
  const goruldu = new Set<string>();
  const izniKapaliUye = new Set(uyeler.filter((u) => !u.izinEposta).map((u) => u.email.toLowerCase()));
  for (const u of uyeler) {
    const a = u.email.toLowerCase();
    if (!u.izinEposta) continue;
    goruldu.add(a);
    if (engelli.has(a)) { sayim.engelli++; continue; }
    if (gidenAdres.has(a)) { sayim.zatenGitti++; continue; }
    sayim.uye++;
    sayim.alicilar.push({ anahtar: u.id, ad: u.name ?? "", email: u.email, kaynak: "uye", id: u.id });
  }
  for (const l of havuz) {
    const a = l.email.toLowerCase();
    if (goruldu.has(a)) continue;
    goruldu.add(a);
    // Üye olup izni kapatan kişinin eski kitapçık iznine dayanılmaz
    if (izniKapaliUye.has(a)) { sayim.izniKapali++; continue; }
    if (!l.emailVerified) { sayim.dogrulanmamis++; continue; }
    if (engelli.has(a) || l.emailStatus === "bounced" || l.emailStatus === "complained") { sayim.engelli++; continue; }
    if (gidenAdres.has(a)) { sayim.zatenGitti++; continue; }
    sayim.havuz++;
    sayim.alicilar.push({ anahtar: `lead:${l.id}`, ad: l.name ?? "", email: l.email, kaynak: "havuz", id: l.id });
  }
  return sayim;
}

async function cikisLinki(al: Pick<BultenAlici, "kaynak" | "id">) {
  return al.kaynak === "uye" ? abonelikLinki(al.id) : havuzCikisLinki(al.id);
}

export async function bultenOnizleme(a: BultenAyar) {
  const kartlar = await paketKartlari(a.paketler);
  const c = bultenEposta(a, kartlar, "Ayşe Yılmaz", "#");
  const s = await bultenAlicilari(a.kod);
  const { alicilar, ...sayilar } = s;
  return { konu: c.subject, html: c.html, alici: alicilar.length, ...sayilar, kartlar };
}

function dogrula(a: BultenAyar) {
  if (!emailVerificationEnabled()) throw new Error("E-posta servisi yapılandırılmamış (RESEND_API_KEY / LEAD_EMAIL_FROM).");
  if (!/^[a-z0-9-]{3,60}$/.test(a.kod)) throw new Error("Gönderim kodu 3–60 karakter; küçük harf, rakam ve tire.");
  if (!a.konu.trim() || !a.baslik.trim()) throw new Error("Konu ve başlık boş olamaz.");
}

export async function bultenDeneme(a: BultenAyar, adres: string) {
  dogrula(a);
  const kartlar = await paketKartlari(a.paketler);
  if (!kartlar.length) throw new Error("Paket seçin.");
  const c = bultenEposta(a, kartlar, "Deneme Alıcı", `${SITE_URL}/api/bulten/cik`);
  await resendToplu([{ to: [adres], subject: `[DENEME] ${c.subject}`, html: c.html, text: c.text, tags: [{ name: "tur", value: "deneme" }] }]);
}

/** Gerçek gönderim: alıcı satırı göndermeden önce yazılır (aynı kod aynı kişiye iki kez gitmez). */
export async function bultenGonder(a: BultenAyar, kim: string) {
  dogrula(a);
  await ensureSchema();
  const kartlar = await paketKartlari(a.paketler);
  if (!kartlar.length) throw new Error("Paket seçin.");
  const anahtar = `paket:${a.kod}`;
  const { alicilar } = await bultenAlicilari(a.kod);
  const id = yeniId("ug");
  await prisma.$executeRawUnsafe(`INSERT INTO "UyeGonderim" ("id","tur","anahtar","kanal","konu","toplam","kim") VALUES ($1,'paket',$2,'eposta',$3,$4,$5)`, id, anahtar, a.konu, alicilar.length, kim);
  let gonderilen = 0, hatali = 0;
  for (let i = 0; i < alicilar.length; i += 100) {
    const parti: (BultenAlici & { satir: string })[] = [];
    for (const al of alicilar.slice(i, i + 100)) {
      const satir = yeniId("ua");
      const n = await prisma.$executeRawUnsafe(
        `INSERT INTO "UyeGonderimAlici" ("id","gonderimId","anahtar","kanal","userId","adres") VALUES ($1,$2,$3,'eposta',$4,$5) ON CONFLICT ("anahtar","kanal","userId") DO NOTHING`,
        satir, id, anahtar, al.anahtar, al.email,
      );
      if (n) parti.push({ ...al, satir });
    }
    if (!parti.length) continue;
    const mesajlar = await Promise.all(parti.map(async (al) => {
      const cikis = await cikisLinki(al);
      const c = bultenEposta(a, kartlar, al.ad, cikis);
      return { to: [al.email], subject: c.subject, html: c.html, text: c.text, headers: { "List-Unsubscribe": `<${cikis}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" }, tags: [{ name: "gonderim", value: id }] };
    }));
    try {
      const ids = await resendToplu(mesajlar);
      for (let j = 0; j < parti.length; j++) await prisma.$executeRawUnsafe(`UPDATE "UyeGonderimAlici" SET "resendId" = $1 WHERE "id" = $2`, ids[j], parti[j].satir);
      gonderilen += parti.length;
    } catch (e) {
      hatali += parti.length;
      const msg = String(e instanceof Error ? e.message : e).slice(0, 300);
      for (const al of parti) await prisma.$executeRawUnsafe(`UPDATE "UyeGonderimAlici" SET "durum" = 'hata', "hata" = $1 WHERE "id" = $2`, msg, al.satir);
    }
    await prisma.$executeRawUnsafe(`UPDATE "UyeGonderim" SET "gonderilen" = $1, "hatali" = $2 WHERE "id" = $3`, gonderilen, hatali, id);
    if (i + 100 < alicilar.length) await new Promise((r) => setTimeout(r, 700)); // Resend: saniyede 2 istek
  }
  await prisma.$executeRawUnsafe(`UPDATE "UyeGonderim" SET "durum" = 'bitti' WHERE "id" = $1`, id);
  return { id, gonderilen, hatali, toplam: alicilar.length };
}
