// Hoş geldin serisi (18 Kasım, kullanıcı: "düzenli mailing yapılması gerekli"; seçim: "2 haftada bir + hoş geldin serisi").
// Kitapçık formunda pazarlama izni veren (MarketingLead) ya da e-posta izni olan yeni üyeye kayıttan sonra kendiliğinden 3 e-posta:
//   1. adım (2. gün): bireysel umreyi 4 adımda planlama
//   2. adım (5. gün): güncel vize dahil paketler (paket bülteni şablonu, canlı fiyat)
//   3. adım (10. gün): nasıl çalışıyoruz (güven sayfasındaki bilgiler)
// İlk e-posta (kitapçık ve doğrulama kodu) zaten kayıt anında gidiyor (src/lib/leads/mailer.ts).
// Varsayılan KAPALI: yönetici açtığı andan sonra gelen kişilere gider, eski kayıtlara gitmez (Setting HOSGELDIN_AYAR).
// Günde bir kez publish-scheduled içinden çalışır (src/lib/mobil/hatirlatma.ts → gunlukHatirlatma).
// Kayıt: UyeGonderim (tur "hosgeldin", anahtar "hosgeldin:<adım>:<gün>") ve UyeGonderimAlici (anahtar "hosgeldin:<adım>",
// aynı adrese aynı adım bir kez). Resend olayları (açılma, tıklama) gönderim geçmişine düşer.
// İçerikte yalnızca sitede yazan bilgiler kullanılır (hadi-umreye-gidelim-guvenilir-mi, umre-vizesi).
import { prisma } from "@/lib/prisma";
import { ensureLeadSchema } from "@/lib/leads";
import { emailVerificationEnabled } from "@/lib/leads/mailer";
import { listMembersForAdmin } from "@/lib/members";
import { bultenEposta, havuzCikisLinki, paketKartlari, type BultenAyar } from "@/lib/paket-bulteni";
import { SITE_URL } from "@/lib/seo/site";
import { abonelikLinki } from "@/lib/uye-kampanya/eposta";
import { engelliAdresler, ensureSchema, resendToplu } from "@/lib/uye-kampanya/gonderim";

const SANS = "'Cairo','Segoe UI',Helvetica,Arial,sans-serif";
const LAC = "#203c76";
const GRI = "#5b6b86";
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
const usd = (n: number) => `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
const yeniId = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const GUN = 86_400_000;
/** Adımın gününden sonra en fazla bu kadar gün içinde gönderilir (servis durursa eski kayıtlara topluca gitmesin) */
const PENCERE = 7;

export const ADIMLAR = [
  { no: 1, gun: 2, ad: "Bireysel umreyi 4 adımda planlayın" },
  { no: 2, gun: 5, ad: "Güncel vize dahil paketler" },
  { no: 3, gun: 10, ad: "Nasıl çalışıyoruz" },
] as const;
export type AdimNo = (typeof ADIMLAR)[number]["no"];

type Ayar = { aktif: boolean; baslangic: string | null };
const AYAR_ANAHTARI = "HOSGELDIN_AYAR";

export async function hosgeldinAyar(): Promise<Ayar> {
  const s = await prisma.setting.findUnique({ where: { key: AYAR_ANAHTARI } }).catch(() => null);
  try {
    const a = JSON.parse(s?.value ?? "{}") as Partial<Ayar>;
    return { aktif: a.aktif === true, baslangic: a.baslangic ?? null };
  } catch {
    return { aktif: false, baslangic: null };
  }
}

/** Açılınca başlangıç anı yazılır: seri yalnızca bundan sonra gelen kişilere gider */
export async function hosgeldinAyarla(aktif: boolean) {
  const once = await hosgeldinAyar();
  const a: Ayar = { aktif, baslangic: aktif ? (once.aktif && once.baslangic ? once.baslangic : new Date().toISOString()) : once.baslangic };
  await prisma.setting.upsert({ where: { key: AYAR_ANAHTARI }, update: { value: JSON.stringify(a) }, create: { key: AYAR_ANAHTARI, value: JSON.stringify(a) } });
  return a;
}

// ── E-posta şablonu (paket bülteniyle aynı görünüm) ─────────────────────────────────────────────

type Kabuk = { konu: string; onMetin: string; kicker: string; baslik: string; giris: string; govde: string; cta: { metin: string; yol: string }; kampanya: string };

const utm = (kampanya: string, yol: string) => `${SITE_URL}${yol}${yol.includes("?") ? "&" : "?"}utm_source=eposta&utm_medium=hosgeldin&utm_campaign=${kampanya}`;
const cizgi = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px"><tr><td width="90" style="height:3px;background:#b8902a;font-size:0;line-height:0">&nbsp;</td><td style="height:1px;background:#dfe4ec;font-size:0;line-height:0">&nbsp;</td></tr></table>`;

function kabuk(k: Kabuk, ad: string, cikis: string) {
  const ilk = ad.trim().split(/\s+/)[0] ?? "";
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light">
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet"><title>${esc(k.konu)}</title></head>
<body style="margin:0;padding:0;background:#f3f5f9">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(k.onMetin)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f3f5f9" style="background:#f3f5f9"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dfe4ec">
<tr><td style="padding:26px 28px 0">
  <a href="${SITE_URL}"><img src="${SITE_URL}/email/logo.png" width="92" alt="Hadi Umreye Gidelim" style="display:block;border:0"></a>
  <p style="margin:24px 0 0;font-family:${SANS};font-size:11px;font-weight:700;letter-spacing:3px;color:${GRI}">${esc(k.kicker.toLocaleUpperCase("tr-TR"))}</p>
  <p style="margin:6px 0 0;font-family:${SANS};font-size:28px;line-height:1.18;font-weight:800;color:${LAC}">${esc(k.baslik)}</p>
  ${cizgi}
  <p style="margin:18px 0 0;font-family:${SANS};font-size:15px;line-height:1.6;color:#3d4a66">${ilk ? `Merhaba ${esc(ilk)},<br>` : "Merhaba,<br>"}${esc(k.giris)}</p>
</td></tr>
<tr><td style="padding:8px 28px 0">${k.govde}</td></tr>
<tr><td style="padding:24px 28px 0"><a href="${utm(k.kampanya, k.cta.yol)}" style="display:inline-block;background:${LAC};color:#ffffff;font-family:${SANS};font-size:15px;font-weight:700;text-decoration:none;padding:13px 22px;border-radius:12px">${esc(k.cta.metin)} &rarr;</a></td></tr>
<tr><td style="padding:26px 28px 28px">
  ${cizgi}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px"><tr>
    <td style="font-family:${SANS};font-size:13px;font-weight:700;color:${GRI}"><a href="${utm(k.kampanya, "/")}" style="color:${GRI};text-decoration:none">hadiumreyegidelim.com</a></td>
    <td align="right" style="font-family:${SANS};font-size:13px;font-weight:800;color:${LAC}"><a href="https://wa.me/905404010038" style="color:${LAC};text-decoration:none">WhatsApp: +90 540 401 00 38</a></td>
  </tr></table>
</td></tr>
</table>
<p style="margin:18px 0 0;font-family:${SANS};font-size:11px;line-height:1.6;color:#8a94ab;text-align:center;max-width:520px">Bu e-postayı umre programları ve fiyatlarıyla ilgili e-posta almaya izin verdiğiniz için alıyorsunuz. <a href="${cikis}" style="color:#5b6680">Bu e-postaları almak istemiyorum</a><br>MBD Tourism L.L.C. · <a href="${SITE_URL}" style="color:#5b6680;text-decoration:none">hadiumreyegidelim.com</a></p>
</td></tr></table></body></html>`;
}

/** Numaralı madde listesi (başlık + açıklama) */
function maddeler(liste: { baslik: string; metin: string }[]) {
  return liste
    .map(
      (m, i) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:18px"><tr>
  <td width="40" valign="top"><div style="width:30px;height:30px;border-radius:15px;background:${LAC};color:#fff;font-family:${SANS};font-size:14px;font-weight:700;line-height:30px;text-align:center">${i + 1}</div></td>
  <td valign="top" style="font-family:${SANS}"><p style="margin:2px 0 0;font-size:17px;font-weight:800;color:${LAC};line-height:1.3">${esc(m.baslik)}</p>
    <p style="margin:4px 0 0;font-size:14px;line-height:1.55;color:#3d4a66">${esc(m.metin)}</p></td>
</tr></table>`,
    )
    .join("\n");
}

const metinListe = (liste: { baslik: string; metin: string }[]) => liste.map((m, i) => `${i + 1}. ${m.baslik}\n   ${m.metin}`).join("\n\n");

const ADIM1 = [
  { baslik: "Tarihinizi ve gece sayınızı seçin", metin: "Grup takvimine bağlı kalmazsınız. Ne zaman gideceğinize, Mekke ve Medine'de kaç gece kalacağınıza siz karar verirsiniz." },
  { baslik: "Otelinizi seçin", metin: "Harem'e yakın otelleri ve güncel fiyatlarını sitemizde görebilir, kişi sayınıza göre toplamı hemen hesaplayabilirsiniz." },
  { baslik: "Vizenizi alın", metin: "Kişi başı 140 USD. Otel rezervasyonunuz, uçak biletiniz, pasaportunuzun ön yüzü ve biyometrik fotoğrafınız tamamlandığında vizeniz 2 saat içinde gelir." },
  { baslik: "Uçağınızı alın, gerisini bize bırakın", metin: "Uçak bileti satmıyoruz; uçuşunuzu dilediğiniz havayolundan kendiniz alırsınız. Cidde'de sizi karşılar, transferlerinizi ayarlarız." },
];

const ADIM3 = [
  { baslik: "Önce yazılı teklif", metin: "Oteller, tarihler, oda tipleri, araç ve toplam fiyat size yazılı bir bağlantıyla gelir. Birden fazla seçenek varsa yan yana karşılaştırırsınız. Onaylamadan ödeme istemeyiz." },
  { baslik: "Bölerek ödeme", metin: "Kartla ya da havaleyle ödersiniz. İsterseniz transfer ve rehberlik ücretinin bir kısmını Cidde'de, sizi karşıladığımızda ödersiniz." },
  { baslik: "Otelden kendiniz teyit edin", metin: "Voucher'ınızda her otelin onay numarası yazar; yola çıkmadan otele bu numarayla kendiniz sorabilirsiniz." },
  { baslik: "Lisanslı acente", metin: "MBD Tourism L.L.C. bünyesinde, Dubai Turizm Dairesi (DTCM) lisansıyla (no 1203162) çalışıyoruz. Yolculuk boyunca WhatsApp hattımızdasınız." },
];

/** Adımın e-postası. 2. adımda yayında paket yoksa null (o gün gönderilmez). */
export async function adimEposta(no: AdimNo, ad: string, cikis: string): Promise<{ subject: string; html: string; text: string } | null> {
  const ilk = ad.trim().split(/\s+/)[0] ?? "";
  const merhaba = ilk ? `Merhaba ${ilk},` : "Merhaba,";
  const son = `\n\nWhatsApp: +90 540 401 00 38\nBu e-postaları almak istemiyorsanız: ${cikis}`;
  if (no === 1) {
    const k: Kabuk = {
      konu: "Bireysel umreyi 4 adımda planlayın",
      onMetin: "Tarih, otel, vize ve uçak: bireysel umre planının özeti.",
      kicker: "Bireysel umre rehberi",
      baslik: "Umrenizi kendi takviminizle planlayın",
      giris: "Kitapçığımızı indirdiğiniz için teşekkür ederiz. Bireysel umre planlamak düşündüğünüzden kolay; dört adımda özetledik.",
      govde: maddeler(ADIM1),
      cta: { metin: "Umrenizi planlayın", yol: "/bireysel-umre" },
      kampanya: "hosgeldin-1",
    };
    return { subject: k.konu, html: kabuk(k, ad, cikis), text: `${merhaba}\n\n${k.giris}\n\n${metinListe(ADIM1)}\n\nUmrenizi planlayın: ${utm(k.kampanya, k.cta.yol)}${son}` };
  }
  if (no === 2) {
    const kartlar = await paketKartlari();
    if (!kartlar.length) return null;
    const ay = kartlar[0].ay;
    const a: BultenAyar = {
      kod: "hosgeldin-2",
      konu: `${ay}'da vize dahil umre paketleri ${usd(Math.min(...kartlar.map((k) => k.fiyat)))}'dan`,
      kicker: `${ay} · Mekke umre paketleri`,
      baslik: "Vize dahil hazır paketler",
      giris: "Planlamayla uğraşmak istemezseniz vize, otel, karşılama ve transferi bir arada hazırladığımız paketlere göz atın. Gece ve kişi sayınızı seçip fiyatınızı hemen görebilirsiniz.",
      paketler: kartlar.map((k) => k.slug),
    };
    return bultenEposta(a, kartlar, ad, cikis);
  }
  const k: Kabuk = {
    konu: "Neye, ne zaman ödediğinizi bilirsiniz",
    onMetin: "Yazılı teklif, bölerek ödeme, otel onay numarası: nasıl çalıştığımız.",
    kicker: "Hadi Umreye Gidelim nasıl çalışır",
    baslik: "Önce yazılı teklif, sonra ödeme",
    giris: "Umre gibi önemli bir yolculukta kiminle yola çıktığınızı bilmek istersiniz. Nasıl çalıştığımızı kısaca anlatalım.",
    govde: maddeler(ADIM3),
    cta: { metin: "Ayrıntıları okuyun", yol: "/hadi-umreye-gidelim-guvenilir-mi" },
    kampanya: "hosgeldin-3",
  };
  return { subject: k.konu, html: kabuk(k, ad, cikis), text: `${merhaba}\n\n${k.giris}\n\n${metinListe(ADIM3)}\n\nAyrıntılar: ${utm(k.kampanya, k.cta.yol)}${son}` };
}

// ── Alıcılar ve gönderim ──────────────────────────────────────────────────────────────────────

type Kisi = { anahtar: string; ad: string; email: string; kaynak: "uye" | "havuz"; id: string; kayit: Date };

/** Başlangıçtan sonra gelen, izinli, adresi sağlam kişiler (aynı adres bir kez; üye kaydı önce) */
async function seriKisileri(baslangic: Date): Promise<Kisi[]> {
  await Promise.all([ensureSchema(), ensureLeadSchema()]);
  const [uyeler, engelli, havuz] = await Promise.all([
    listMembersForAdmin(),
    engelliAdresler(),
    prisma.$queryRawUnsafe<{ id: string; name: string | null; email: string; emailStatus: string | null; createdAt: Date }[]>(
      `SELECT DISTINCT ON (LOWER("email")) "id", "name", "email", "emailStatus", "createdAt" FROM "MarketingLead"
       WHERE "marketingConsent" = true AND "email" IS NOT NULL AND "email" <> '' AND "createdAt" >= $1 ORDER BY LOWER("email"), "createdAt" ASC`,
      baslangic,
    ),
  ]);
  const kisiler: Kisi[] = [];
  const goruldu = new Set<string>();
  const izniKapali = new Set(uyeler.filter((u) => !u.izinEposta).map((u) => u.email.toLowerCase()));
  for (const u of uyeler) {
    const a = u.email.toLowerCase();
    if (!u.izinEposta || new Date(u.createdAt) < baslangic || engelli.has(a) || goruldu.has(a)) continue;
    goruldu.add(a);
    kisiler.push({ anahtar: u.id, ad: u.name ?? "", email: u.email, kaynak: "uye", id: u.id, kayit: new Date(u.createdAt) });
  }
  for (const l of havuz) {
    const a = l.email.toLowerCase();
    if (goruldu.has(a) || izniKapali.has(a) || engelli.has(a) || l.emailStatus === "bounced" || l.emailStatus === "complained") continue;
    goruldu.add(a);
    kisiler.push({ anahtar: `lead:${l.id}`, ad: l.name ?? "", email: l.email, kaynak: "havuz", id: l.id, kayit: new Date(l.createdAt) });
  }
  return kisiler;
}

/** Adrese göre gönderilmiş seri adımları ve tarihleri */
async function gidenler() {
  const r = await prisma.$queryRawUnsafe<{ a: string; anahtar: string; t: Date }[]>(
    `SELECT LOWER("adres") AS "a", "anahtar", "createdAt" AS "t" FROM "UyeGonderimAlici" WHERE "anahtar" LIKE 'hosgeldin:%' AND "kanal" = 'eposta' AND "durum" <> 'hata'`,
  );
  const m = new Map<string, Map<number, Date>>();
  for (const x of r) {
    const no = Number(x.anahtar.split(":")[1]);
    if (!m.has(x.a)) m.set(x.a, new Map());
    m.get(x.a)!.set(no, new Date(x.t));
  }
  return m;
}

/** İki seri e-postası arasında en az bu kadar gün (servis aksarsa aynı gün iki e-posta gitmesin) */
const ARA_GUN = 2;

/**
 * Bugün hangi adımın kime gideceği. Kişi başına en fazla bir adım: gönderilmemiş ilk adım, günü gelmiş ve penceresi
 * geçmemişse (penceresi geçen adım atlanır, sıradakine bakılır); bir önceki seri e-postasından en az 2 gün sonra.
 */
export async function bekleyenler(simdi = new Date()) {
  const ayar = await hosgeldinAyar();
  const sonuc = ADIMLAR.map((a) => ({ no: a.no as AdimNo, kisiler: [] as Kisi[] }));
  if (!ayar.baslangic) return sonuc;
  const [kisiler, giden] = await Promise.all([seriKisileri(new Date(ayar.baslangic)), gidenler()]);
  for (const k of kisiler) {
    const yas = (simdi.getTime() - k.kayit.getTime()) / GUN;
    const kendi = giden.get(k.email.toLowerCase()) ?? new Map<number, Date>();
    const son = Math.max(0, ...[...kendi.values()].map((d) => d.getTime()));
    if (son && simdi.getTime() - son < ARA_GUN * GUN) continue;
    const adim = ADIMLAR.find((a) => !kendi.has(a.no) && yas >= a.gun && yas < a.gun + PENCERE);
    if (adim) sonuc.find((x) => x.no === adim.no)!.kisiler.push(k);
  }
  return sonuc;
}

const cikisLinki = (k: Pick<Kisi, "kaynak" | "id">) => (k.kaynak === "uye" ? abonelikLinki(k.id) : havuzCikisLinki(k.id));

/** Günlük çalışma: seri açıksa vadesi gelen adımları gönderir. Gönderilen e-posta sayısı. */
export async function hosgeldinCalistir(simdi = new Date()): Promise<number> {
  const ayar = await hosgeldinAyar();
  if (!ayar.aktif || !emailVerificationEnabled()) return 0;
  const gun = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(simdi);
  let toplam = 0;
  for (const { no, kisiler } of await bekleyenler(simdi)) {
    if (!kisiler.length) continue;
    const ornek = await adimEposta(no, "", "#");
    if (!ornek) continue;
    const id = yeniId("ug");
    await prisma.$executeRawUnsafe(
      `INSERT INTO "UyeGonderim" ("id","tur","anahtar","kanal","konu","toplam","kim") VALUES ($1,'hosgeldin',$2,'eposta',$3,$4,'Hoş geldin serisi')`,
      id, `hosgeldin:${no}:${gun}`, ornek.subject, kisiler.length,
    );
    let gonderilen = 0, hatali = 0;
    for (let i = 0; i < kisiler.length; i += 100) {
      const parti: (Kisi & { satir: string })[] = [];
      for (const k of kisiler.slice(i, i + 100)) {
        const satir = yeniId("ua");
        const n = await prisma.$executeRawUnsafe(
          `INSERT INTO "UyeGonderimAlici" ("id","gonderimId","anahtar","kanal","userId","adres") VALUES ($1,$2,$3,'eposta',$4,$5) ON CONFLICT ("anahtar","kanal","userId") DO NOTHING`,
          satir, id, `hosgeldin:${no}`, k.anahtar, k.email,
        );
        if (n) parti.push({ ...k, satir });
      }
      if (!parti.length) continue;
      const mesajlar = (
        await Promise.all(
          parti.map(async (k) => {
            const cikis = await cikisLinki(k);
            const c = await adimEposta(no, k.ad, cikis);
            return c && { to: [k.email], subject: c.subject, html: c.html, text: c.text, headers: { "List-Unsubscribe": `<${cikis}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" }, tags: [{ name: "gonderim", value: id }] };
          }),
        )
      ).filter((m): m is NonNullable<typeof m> => !!m);
      try {
        const ids = await resendToplu(mesajlar);
        for (let j = 0; j < parti.length; j++) await prisma.$executeRawUnsafe(`UPDATE "UyeGonderimAlici" SET "resendId" = $1 WHERE "id" = $2`, ids[j], parti[j].satir);
        gonderilen += parti.length;
      } catch (e) {
        hatali += parti.length;
        const msg = String(e instanceof Error ? e.message : e).slice(0, 300);
        for (const k of parti) await prisma.$executeRawUnsafe(`UPDATE "UyeGonderimAlici" SET "durum" = 'hata', "hata" = $1 WHERE "id" = $2`, msg, k.satir);
      }
      await prisma.$executeRawUnsafe(`UPDATE "UyeGonderim" SET "gonderilen" = $1, "hatali" = $2 WHERE "id" = $3`, gonderilen, hatali, id);
      if (i + 100 < kisiler.length) await new Promise((r) => setTimeout(r, 700));
    }
    await prisma.$executeRawUnsafe(`UPDATE "UyeGonderim" SET "durum" = 'bitti' WHERE "id" = $1`, id);
    toplam += gonderilen;
  }
  return toplam;
}

/** Yönetim ekranı: ayar, adımlar, her adımın toplam gönderim/açılma sayısı, bugün bekleyenler */
export async function hosgeldinDurum() {
  await ensureSchema();
  const [ayar, bekleyen, sayim] = await Promise.all([
    hosgeldinAyar(),
    bekleyenler().catch(() => ADIMLAR.map((a) => ({ no: a.no, kisiler: [] as Kisi[] }))),
    prisma.$queryRawUnsafe<{ anahtar: string; gonderilen: number; acilan: number; tiklanan: number }[]>(
      `SELECT "anahtar", COUNT(*)::int AS "gonderilen", COUNT("acildiAt")::int AS "acilan", COUNT("tiklandiAt")::int AS "tiklanan"
       FROM "UyeGonderimAlici" WHERE "anahtar" LIKE 'hosgeldin:%' AND "durum" <> 'hata' GROUP BY "anahtar"`,
    ),
  ]);
  return {
    ...ayar,
    epostaHazir: emailVerificationEnabled(),
    adimlar: await Promise.all(
      ADIMLAR.map(async (a) => {
        const s = sayim.find((x) => x.anahtar === `hosgeldin:${a.no}`);
        const ornek = await adimEposta(a.no, "", "#").catch(() => null);
        return { no: a.no, gun: a.gun, ad: a.ad, konu: ornek?.subject ?? null, gonderilen: s?.gonderilen ?? 0, acilan: s?.acilan ?? 0, tiklanan: s?.tiklanan ?? 0, bugun: bekleyen.find((b) => b.no === a.no)?.kisiler.length ?? 0 };
      }),
    ),
  };
}

export async function hosgeldinOnizleme(no: AdimNo) {
  return adimEposta(no, "Ayşe Yılmaz", "#");
}

export async function hosgeldinDeneme(no: AdimNo, adres: string) {
  if (!emailVerificationEnabled()) throw new Error("E-posta servisi yapılandırılmamış (RESEND_API_KEY / LEAD_EMAIL_FROM).");
  const c = await adimEposta(no, "Deneme Alıcı", `${SITE_URL}/api/bulten/cik`);
  if (!c) throw new Error("Yayında net fiyatlı paket yok; 2. adım şu an gönderilmez.");
  await resendToplu([{ to: [adres], subject: `[DENEME] ${c.subject}`, html: c.html, text: c.text, tags: [{ name: "tur", value: "deneme" }] }]);
}
