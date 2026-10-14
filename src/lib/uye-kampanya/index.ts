// Üyelere özel kampanyalar, üye tercihleri (umre planı + iletişim izni) ve son giriş (Profil 2, 14 Ekim).
// Tablolar yalnızca eklenir (CREATE TABLE / ADD COLUMN IF NOT EXISTS), Prisma modeli yok. Kampanya talepleri satış masasında
// dosya olarak açılır (data.kampanyaId); sayaçlar oradan hesaplanır.
// İzin: 14 Ekim'den önce üye olanların izni yoktur; üye olurken müşteri havuzuna "ileti izni var" düşenler izinli sayılır.
import { prisma } from "@/lib/prisma";
import { createDosya, ensureSatisSchema, getDosya, saveDosya, type Dosya } from "@/lib/satis";
import { ensureLeadSchema } from "@/lib/leads";
import { IZIN_METNI, type Kampanya, type KampanyaDurum, type KampanyaSayac, type UyeTercih } from "./ortak";

export * from "./ortak";

let ready: Promise<void> | null = null;
export function ensureUyeKampanyaSchema() {
  ready ??= (async () => {
    const sql = [
      `CREATE TABLE IF NOT EXISTS "UyeKampanya" (
        "id" TEXT PRIMARY KEY,
        "baslik" TEXT NOT NULL,
        "aciklama" TEXT NOT NULL DEFAULT '',
        "gorsel" TEXT,
        "hat" TEXT,
        "gidis" TEXT,
        "donus" TEXT,
        "mekkeGece" INTEGER,
        "medineGece" INTEGER,
        "mekkeOtel" TEXT,
        "medineOtel" TEXT,
        "dahil" TEXT NOT NULL DEFAULT '',
        "uyeFiyat" DOUBLE PRECISION,
        "normalFiyat" DOUBLE PRECISION,
        "kontenjan" INTEGER,
        "sonTarih" TEXT,
        "hedef" TEXT,
        "durum" TEXT NOT NULL DEFAULT 'taslak',
        "sira" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "UyeTercih" (
        "userId" TEXT PRIMARY KEY,
        "planDonem" TEXT,
        "planKisi" INTEGER,
        "planKimle" TEXT,
        "planOtel" TEXT,
        "izinEposta" BOOLEAN NOT NULL DEFAULT false,
        "izinWhatsapp" BOOLEAN NOT NULL DEFAULT false,
        "izinTarihi" TIMESTAMP(3),
        "izinGecmis" TEXT NOT NULL DEFAULT '[]',
        "izinSoruldu" TIMESTAMP(3),
        "sonGiris" TIMESTAMP(3),
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
    ];
    for (const s of sql) await prisma.$executeRawUnsafe(s);
    await Promise.all([ensureSatisSchema(), ensureLeadSchema()]);
  })().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

const iso = (d: unknown) => (d instanceof Date ? d.toISOString() : d ? String(d) : null);
const yeniId = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const bugun = () => new Date(Date.now() + 3 * 3600e3).toISOString().slice(0, 10); // İstanbul günü

type KampanyaRow = Omit<Kampanya, "createdAt" | "updatedAt"> & { createdAt: Date; updatedAt: Date };
const kampanyaOf = (r: KampanyaRow): Kampanya => ({ ...r, createdAt: iso(r.createdAt)!, updatedAt: iso(r.updatedAt)! });

// ─── Kampanyalar ──────────────────────────────────────────────────────────────
export async function listKampanyalar(): Promise<Kampanya[]> {
  await ensureUyeKampanyaSchema();
  const rows = await prisma.$queryRawUnsafe<KampanyaRow[]>(`SELECT * FROM "UyeKampanya" ORDER BY "durum" = 'yayinda' DESC, "sira" ASC, "gidis" ASC NULLS LAST, "createdAt" DESC`);
  return rows.map(kampanyaOf);
}

export async function getKampanya(id: string): Promise<Kampanya | null> {
  await ensureUyeKampanyaSchema();
  const rows = await prisma.$queryRawUnsafe<KampanyaRow[]>(`SELECT * FROM "UyeKampanya" WHERE "id" = $1`, id);
  return rows[0] ? kampanyaOf(rows[0]) : null;
}

/** Talep, kişi ve satış sayıları (satış = onaylanmış ve sonrası). */
export async function kampanyaSayaclari(): Promise<Record<string, KampanyaSayac>> {
  await ensureUyeKampanyaSchema();
  const rows = await prisma.$queryRawUnsafe<{ id: string; talep: number; kisi: number; satis: number }[]>(`
    SELECT ("data"::jsonb->>'kampanyaId') AS "id", COUNT(*)::int AS "talep",
      COALESCE(SUM((("data"::jsonb->>'yetiskin')::int + COALESCE(("data"::jsonb->>'cocuk')::int, 0))) FILTER (WHERE "status" IN ('onaylandi','odeme','vize_basvuru','vize_cikti','yolculuk','tamamlandi')), 0)::int AS "kisi",
      COUNT(*) FILTER (WHERE "status" IN ('onaylandi','odeme','vize_basvuru','vize_cikti','yolculuk','tamamlandi'))::int AS "satis"
    FROM "SatisDosyasi" WHERE "status" <> 'iptal' AND ("data"::jsonb->>'kampanyaId') IS NOT NULL GROUP BY 1`);
  return Object.fromEntries(rows.map((r) => [r.id, { talep: r.talep, kisi: r.kisi, satis: r.satis }]));
}

export type YayinKampanya = Kampanya & { kalan: number | null };

/** Üyelere ve siteye gösterilen kampanyalar: yayında, son günü geçmemiş, kontenjanı dolmamış. */
export async function yayindakiKampanyalar(): Promise<YayinKampanya[]> {
  const [list, sayac] = await Promise.all([listKampanyalar(), kampanyaSayaclari()]);
  const t = bugun();
  return list
    .filter((k) => k.durum === "yayinda" && (!k.sonTarih || k.sonTarih >= t))
    .map((k) => ({ ...k, kalan: k.kontenjan == null ? null : Math.max(0, k.kontenjan - (sayac[k.id]?.kisi ?? 0)) }))
    .filter((k) => k.kalan == null || k.kalan > 0);
}

export type KampanyaGirdi = Partial<Omit<Kampanya, "id" | "createdAt" | "updatedAt">> & { id?: string };

const metin = (v: unknown, n: number) => (v == null ? null : String(v).trim().slice(0, n) || null);
const sayi = (v: unknown) => (v === "" || v == null || Number.isNaN(Number(v)) ? null : Number(v));
const tarih = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

export async function saveKampanya(g: KampanyaGirdi): Promise<Kampanya> {
  await ensureUyeKampanyaSchema();
  const id = g.id && /^uk_[a-z0-9]+$/.test(g.id) ? g.id : yeniId("uk");
  const durum: KampanyaDurum = g.durum === "yayinda" || g.durum === "kapali" ? g.durum : "taslak";
  const v = [
    id,
    metin(g.baslik, 120) ?? "Üyelere özel umre",
    metin(g.aciklama, 600) ?? "",
    metin(g.gorsel, 500),
    metin(g.hat, 16),
    tarih(g.gidis),
    tarih(g.donus),
    sayi(g.mekkeGece),
    sayi(g.medineGece),
    metin(g.mekkeOtel, 120),
    metin(g.medineOtel, 120),
    metin(g.dahil, 800) ?? "",
    sayi(g.uyeFiyat),
    sayi(g.normalFiyat),
    sayi(g.kontenjan),
    tarih(g.sonTarih),
    metin(g.hedef, 20),
    durum,
    sayi(g.sira) ?? 0,
  ];
  await prisma.$executeRawUnsafe(
    `INSERT INTO "UyeKampanya" ("id","baslik","aciklama","gorsel","hat","gidis","donus","mekkeGece","medineGece","mekkeOtel","medineOtel","dahil","uyeFiyat","normalFiyat","kontenjan","sonTarih","hedef","durum","sira")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
     ON CONFLICT ("id") DO UPDATE SET "baslik"=$2,"aciklama"=$3,"gorsel"=$4,"hat"=$5,"gidis"=$6,"donus"=$7,"mekkeGece"=$8,"medineGece"=$9,"mekkeOtel"=$10,
       "medineOtel"=$11,"dahil"=$12,"uyeFiyat"=$13,"normalFiyat"=$14,"kontenjan"=$15,"sonTarih"=$16,"hedef"=$17,"durum"=$18,"sira"=$19,"updatedAt"=NOW()`,
    ...v,
  );
  return (await getKampanya(id))!;
}

export async function deleteKampanya(id: string) {
  await ensureUyeKampanyaSchema();
  await prisma.$executeRawUnsafe(`DELETE FROM "UyeKampanya" WHERE "id" = $1`, id);
}

/** Üye "teklif iste"ye bastı: aynı kampanyaya açık talebi varsa onu döndürür, yoksa satış masasında dosya açar. */
export async function kampanyaTalebi(m: { id: string; name: string; email: string; phone: string | null }, k: Kampanya, kisi: number, not?: string): Promise<{ dosya: Dosya; yeni: boolean }> {
  await ensureUyeKampanyaSchema();
  const var_ = await prisma.$queryRawUnsafe<{ no: string }[]>(
    `SELECT "no" FROM "SatisDosyasi" WHERE "userId" = $1 AND ("data"::jsonb->>'kampanyaId') = $2 AND "status" <> 'iptal' LIMIT 1`,
    m.id,
    k.id,
  );
  if (var_[0]) return { dosya: (await getDosya("no", var_[0].no))!, yeni: false };
  const d = await createDosya({
    musteriAdi: m.name,
    email: m.email,
    phone: m.phone,
    yetiskin: Math.min(20, Math.max(1, kisi)),
    gidis: k.gidis ?? undefined,
    donus: k.donus ?? undefined,
    talepNotu: [`Üyelere özel kampanya: ${k.baslik.replace(/\*/g, "")}`, not?.trim()].filter(Boolean).join(" · "),
    kim: "Üye kampanyası",
  });
  await saveDosya(d.id, { userId: m.id, data: { kampanyaId: k.id, kampanyaBaslik: k.baslik.replace(/\*/g, "") } }, "Üye kampanyası");
  return { dosya: (await getDosya("id", d.id))!, yeni: true };
}

/** Üyenin kampanyalara açtığı talepler: kampanyaId → dosya no. */
export async function uyeKampanyaTalepleri(userId: string): Promise<Record<string, string>> {
  await ensureUyeKampanyaSchema();
  const rows = await prisma.$queryRawUnsafe<{ k: string; no: string }[]>(
    `SELECT ("data"::jsonb->>'kampanyaId') AS "k", "no" FROM "SatisDosyasi" WHERE "userId" = $1 AND "status" <> 'iptal' AND ("data"::jsonb->>'kampanyaId') IS NOT NULL`,
    userId,
  );
  return Object.fromEntries(rows.map((r) => [r.k, r.no]));
}

// ─── Üye tercihleri ───────────────────────────────────────────────────────────
type TercihRow = Omit<UyeTercih, "izinTarihi" | "izinSoruldu" | "sonGiris"> & { izinTarihi: Date | null; izinSoruldu: Date | null; sonGiris: Date | null };
const tercihOf = (r: TercihRow): UyeTercih => ({ ...r, izinTarihi: iso(r.izinTarihi), izinSoruldu: iso(r.izinSoruldu), sonGiris: iso(r.sonGiris) });
const TERCIH_COLS = `"userId","planDonem","planKisi","planKimle","planOtel","izinEposta","izinWhatsapp","izinTarihi","izinSoruldu","sonGiris"`;

/** Tercih satırı yoksa: üye olurken müşteri havuzuna ileti izniyle düştüyse izinli sayılır. */
export async function getTercih(userId: string, email: string): Promise<UyeTercih> {
  await ensureUyeKampanyaSchema();
  const rows = await prisma.$queryRawUnsafe<TercihRow[]>(`SELECT ${TERCIH_COLS} FROM "UyeTercih" WHERE "userId" = $1`, userId);
  // Satır var ve izin hiç değiştirilmemişse (yalnızca son giriş ya da plan yazılmış) izin üyelik kaydından gelir
  if (rows[0]?.izinTarihi || rows[0]?.izinSoruldu) return tercihOf(rows[0]);
  const lead = await prisma.$queryRawUnsafe<{ izin: boolean; t: Date }[]>(
    `SELECT bool_or("marketingConsent") AS "izin", MIN("createdAt") FILTER (WHERE "marketingConsent") AS "t" FROM "MarketingLead" WHERE LOWER("email") = LOWER($1) AND "source" = 'uyelik'`,
    email,
  );
  const izin = !!lead[0]?.izin;
  const r = rows[0] ? tercihOf(rows[0]) : { userId, planDonem: null, planKisi: null, planKimle: null, planOtel: null, sonGiris: null };
  return { ...r, izinEposta: izin, izinWhatsapp: izin, izinTarihi: izin ? iso(lead[0].t) : null, izinSoruldu: izin ? iso(lead[0].t) : null };
}

export type TercihGirdi = Partial<Pick<UyeTercih, "planDonem" | "planKisi" | "planKimle" | "planOtel" | "izinEposta" | "izinWhatsapp">> & { soruldu?: boolean };

/** Tercihleri kaydeder. İzin değişirse tarihi, metni, kaynağı ve IP'si izin geçmişine yazılır (İYS ve KVKK kanıtı). */
export async function saveTercih(userId: string, email: string, g: TercihGirdi, kaynak: string, ip: string | null): Promise<UyeTercih> {
  const once = await getTercih(userId, email);
  const yeni = { ...once };
  if (g.planDonem !== undefined) yeni.planDonem = metin(g.planDonem, 20);
  if (g.planKisi !== undefined) yeni.planKisi = g.planKisi == null ? null : Math.min(30, Math.max(1, Number(g.planKisi) || 1));
  if (g.planKimle !== undefined) yeni.planKimle = metin(g.planKimle, 20);
  if (g.planOtel !== undefined) yeni.planOtel = metin(g.planOtel, 20);
  if (g.izinEposta !== undefined) yeni.izinEposta = !!g.izinEposta;
  if (g.izinWhatsapp !== undefined) yeni.izinWhatsapp = !!g.izinWhatsapp;
  const izinDegisti = yeni.izinEposta !== once.izinEposta || yeni.izinWhatsapp !== once.izinWhatsapp;
  const simdi = new Date();
  const kayit = izinDegisti ? JSON.stringify([{ t: simdi.toISOString(), eposta: yeni.izinEposta, whatsapp: yeni.izinWhatsapp, kaynak, ip, metin: IZIN_METNI }]) : "[]";
  await prisma.$executeRawUnsafe(
    `INSERT INTO "UyeTercih" ("userId","planDonem","planKisi","planKimle","planOtel","izinEposta","izinWhatsapp","izinTarihi","izinGecmis","izinSoruldu","updatedAt")
     VALUES ($1,$2,$3::int,$4,$5,$6::boolean,$7::boolean,$8::timestamp,$9::text,$10::timestamp,NOW())
     ON CONFLICT ("userId") DO UPDATE SET "planDonem"=$2,"planKisi"=$3::int,"planKimle"=$4,"planOtel"=$5,"izinEposta"=$6::boolean,"izinWhatsapp"=$7::boolean,
       "izinTarihi"=CASE WHEN $11::boolean THEN $8::timestamp ELSE COALESCE("UyeTercih"."izinTarihi", $8::timestamp) END,
       "izinGecmis"=CASE WHEN $11::boolean THEN ("UyeTercih"."izinGecmis"::jsonb || $9::jsonb)::text ELSE "UyeTercih"."izinGecmis" END,
       "izinSoruldu"=COALESCE("UyeTercih"."izinSoruldu", $10::timestamp),"updatedAt"=NOW()`,
    userId,
    yeni.planDonem,
    yeni.planKisi,
    yeni.planKimle,
    yeni.planOtel,
    yeni.izinEposta,
    yeni.izinWhatsapp,
    izinDegisti ? simdi : once.izinTarihi ? new Date(once.izinTarihi) : null,
    kayit,
    g.soruldu || izinDegisti ? simdi : once.izinSoruldu ? new Date(once.izinSoruldu) : null,
    izinDegisti,
  );
  return getTercih(userId, email);
}

/** Profil açıldığında son giriş (saatte en fazla bir yazma). */
export async function touchSonGiris(userId: string) {
  await ensureUyeKampanyaSchema();
  await prisma.$executeRawUnsafe(
    `INSERT INTO "UyeTercih" ("userId","sonGiris") VALUES ($1, NOW())
     ON CONFLICT ("userId") DO UPDATE SET "sonGiris" = NOW() WHERE "UyeTercih"."sonGiris" IS NULL OR "UyeTercih"."sonGiris" < NOW() - INTERVAL '1 hour'`,
    userId,
  );
}

/** Kampanyaları üyenin planına göre sıralar: dönemi tutanlar önce. */
export function planaGoreSirala<T extends Kampanya>(list: T[], t: Pick<UyeTercih, "planDonem"> | null): (T & { eslesme: boolean })[] {
  const donem = t?.planDonem;
  const es = (k: T) => !!donem && donem !== "belirsiz" && (k.hedef === donem || (!!k.gidis && k.gidis.startsWith(donem)));
  return list.map((k) => ({ ...k, eslesme: es(k) })).sort((a, b) => Number(b.eslesme) - Number(a.eslesme));
}
