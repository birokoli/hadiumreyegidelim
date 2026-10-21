// Üyelere toplu gönderim (Profil 2, 14 Ekim): hesap duyurusu (tüm üyeler, bir kez) ve kampanya (yalnızca izinli üyeler).
// E-postalar Resend toplu uç noktasıyla 100'lük partiler halinde gider; her alıcı kaydedilir (aynı duyuru iki kez gitmez),
// Resend olayları (teslim, açılma, tıklama, geri dönme) /api/leads/resend üzerinden alıcı satırına yazılır.
// Daha önce geri dönmüş adresler (müşteri havuzunda ya da önceki gönderimde) atlanır. WhatsApp elle gönderilir; işaretlenir.
import { prisma } from "@/lib/prisma";
import { listMembersForAdmin, type AdminMember } from "@/lib/members";
import { emailVerificationEnabled } from "@/lib/leads/mailer";
import { ensureUyeKampanyaSchema, getKampanya } from "./index";
import { abonelikLinki, DUYURU_ANAHTAR, duyuruEposta, kampanyaEposta } from "./eposta";
import type { Kampanya } from "./ortak";

let ready: Promise<void> | null = null;
/** Gönderim tabloları (paket bülteni de aynı tabloları kullanır: src/lib/paket-bulteni) */
export function ensureSchema() {
  ready ??= (async () => {
    await ensureUyeKampanyaSchema();
    for (const s of [
      `CREATE TABLE IF NOT EXISTS "UyeGonderim" (
        "id" TEXT PRIMARY KEY,
        "tur" TEXT NOT NULL,
        "anahtar" TEXT NOT NULL,
        "kanal" TEXT NOT NULL DEFAULT 'eposta',
        "konu" TEXT NOT NULL,
        "toplam" INTEGER NOT NULL DEFAULT 0,
        "gonderilen" INTEGER NOT NULL DEFAULT 0,
        "hatali" INTEGER NOT NULL DEFAULT 0,
        "durum" TEXT NOT NULL DEFAULT 'gonderiliyor',
        "kim" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS "UyeGonderimAlici" (
        "id" TEXT PRIMARY KEY,
        "gonderimId" TEXT NOT NULL,
        "anahtar" TEXT NOT NULL,
        "kanal" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "adres" TEXT NOT NULL,
        "resendId" TEXT,
        "durum" TEXT NOT NULL DEFAULT 'gonderildi',
        "hata" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "teslimAt" TIMESTAMP(3),
        "acildiAt" TIMESTAMP(3),
        "tiklandiAt" TIMESTAMP(3)
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "UyeGonderimAlici_tekil" ON "UyeGonderimAlici"("anahtar","kanal","userId")`,
      `CREATE INDEX IF NOT EXISTS "UyeGonderimAlici_resend_idx" ON "UyeGonderimAlici"("resendId")`,
    ])
      await prisma.$executeRawUnsafe(s);
  })().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

export type GonderimTur = "duyuru" | "kampanya";
const yeniId = (p: string) => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

/** Geri dönmüş ya da spam bildirilmiş adresler (küçük harf). */
export async function engelliAdresler(): Promise<Set<string>> {
  await ensureSchema();
  const rows = await prisma.$queryRawUnsafe<{ a: string }[]>(`
    SELECT LOWER("email") AS "a" FROM "MarketingLead" WHERE "email" IS NOT NULL AND "emailStatus" IN ('bounced','complained')
    UNION SELECT LOWER("adres") FROM "UyeGonderimAlici" WHERE "kanal" = 'eposta' AND "durum" IN ('geri-dondu','spam')`);
  return new Set(rows.map((r) => r.a));
}

async function gonderilmisler(anahtar: string, kanal: string): Promise<Set<string>> {
  await ensureSchema();
  const rows = await prisma.$queryRawUnsafe<{ u: string }[]>(`SELECT "userId" AS "u" FROM "UyeGonderimAlici" WHERE "anahtar" = $1 AND "kanal" = $2 AND "durum" <> 'hata'`, anahtar, kanal);
  return new Set(rows.map((r) => r.u));
}

export type AliciOzet = { alicilar: AdminMember[]; toplamUye: number; izinsiz: number; engelli: number; zatenGitti: number };

/** Kime gidecek: duyuru tüm üyelere, kampanya yalnızca e-posta izni olanlara; engelli ve daha önce alanlar çıkar. */
export async function epostaAlicilari(tur: GonderimTur, anahtar: string): Promise<AliciOzet> {
  const [uyeler, engelli, gitti] = await Promise.all([listMembersForAdmin(), engelliAdresler(), gonderilmisler(anahtar, "eposta")]);
  let izinsiz = 0, eng = 0, zaten = 0;
  const alicilar = uyeler.filter((u) => {
    if (tur === "kampanya" && !u.izinEposta) return izinsiz++, false;
    if (engelli.has(u.email.toLowerCase())) return eng++, false;
    if (gitti.has(u.id)) return zaten++, false;
    return true;
  });
  return { alicilar, toplamUye: uyeler.length, izinsiz, engelli: eng, zatenGitti: zaten };
}

async function icerik(tur: GonderimTur, u: Pick<AdminMember, "id" | "name" | "email">, k: Kampanya | null) {
  if (tur === "duyuru") return { ...duyuruEposta({ ad: u.name, email: u.email }), headers: undefined as Record<string, string> | undefined };
  const abonelik = await abonelikLinki(u.id);
  return { ...kampanyaEposta({ ad: u.name, k: k!, abonelik }), headers: { "List-Unsubscribe": `<${abonelik}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } };
}

export async function onizleme(tur: GonderimTur, kampanyaId?: string) {
  const k = tur === "kampanya" ? await getKampanya(String(kampanyaId)) : null;
  if (tur === "kampanya" && !k) throw new Error("Kampanya bulunamadı.");
  const c = await icerik(tur, { id: "onizleme", name: "Ayşe Yılmaz", email: "ornek@example.com" }, k);
  const anahtar = tur === "duyuru" ? DUYURU_ANAHTAR : k!.id;
  const o = await epostaAlicilari(tur, anahtar);
  return { konu: c.subject, html: c.html, alici: o.alicilar.length, toplamUye: o.toplamUye, izinsiz: o.izinsiz, engelli: o.engelli, zatenGitti: o.zatenGitti };
}

export const gonderen = () => process.env.UYE_EMAIL_FROM || process.env.LEAD_EMAIL_FROM || "";

export async function resendToplu(mesajlar: { to: string[]; subject: string; html: string; text: string; headers?: Record<string, string>; tags: { name: string; value: string }[] }[]): Promise<(string | null)[]> {
  const r = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(mesajlar.map((m) => ({ from: gonderen(), ...m }))),
    signal: AbortSignal.timeout(30_000),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const d = (await r.json()) as { data?: { id?: string }[] };
  return mesajlar.map((_, i) => d.data?.[i]?.id ?? null);
}

/** Deneme: tek adrese, konu başında [DENEME]. Kayıt tutulmaz. */
export async function denemeGonder(tur: GonderimTur, adres: string, kampanyaId?: string) {
  if (!emailVerificationEnabled()) throw new Error("E-posta servisi yapılandırılmamış (RESEND_API_KEY / LEAD_EMAIL_FROM).");
  const k = tur === "kampanya" ? await getKampanya(String(kampanyaId)) : null;
  const c = await icerik(tur, { id: "deneme", name: "Deneme Alıcı", email: adres }, k);
  await resendToplu([{ to: [adres], subject: `[DENEME] ${c.subject}`, html: c.html, text: c.text, headers: c.headers, tags: [{ name: "tur", value: "deneme" }] }]);
}

/** Gerçek gönderim. Alıcı kaydı gönderimden önce yazılır (benzersiz indeks yarışta ikinci gönderimi engeller). */
export async function topluGonder(tur: GonderimTur, kim: string, kampanyaId?: string): Promise<{ id: string; gonderilen: number; hatali: number; toplam: number }> {
  if (!emailVerificationEnabled()) throw new Error("E-posta servisi yapılandırılmamış (RESEND_API_KEY / LEAD_EMAIL_FROM).");
  await ensureSchema();
  const k = tur === "kampanya" ? await getKampanya(String(kampanyaId)) : null;
  if (tur === "kampanya" && !k) throw new Error("Kampanya bulunamadı.");
  const anahtar = tur === "duyuru" ? DUYURU_ANAHTAR : k!.id;
  const { alicilar } = await epostaAlicilari(tur, anahtar);
  const id = yeniId("ug");
  const konu = tur === "duyuru" ? duyuruEposta({ ad: "", email: "" }).subject : kampanyaEposta({ ad: "", k: k!, abonelik: "" }).subject;
  await prisma.$executeRawUnsafe(`INSERT INTO "UyeGonderim" ("id","tur","anahtar","kanal","konu","toplam","kim") VALUES ($1,$2,$3,'eposta',$4,$5,$6)`, id, tur, anahtar, konu, alicilar.length, kim);

  let gonderilen = 0, hatali = 0;
  for (let i = 0; i < alicilar.length; i += 100) {
    const parti: (AdminMember & { satir: string })[] = [];
    for (const u of alicilar.slice(i, i + 100)) {
      const satir = yeniId("ua");
      const n = await prisma.$executeRawUnsafe(
        `INSERT INTO "UyeGonderimAlici" ("id","gonderimId","anahtar","kanal","userId","adres") VALUES ($1,$2,$3,'eposta',$4,$5) ON CONFLICT ("anahtar","kanal","userId") DO NOTHING`,
        satir, id, anahtar, u.id, u.email,
      );
      if (n) parti.push({ ...u, satir });
    }
    if (!parti.length) continue;
    const mesajlar = await Promise.all(parti.map(async (u) => {
      const c = await icerik(tur, u, k);
      return { to: [u.email], subject: c.subject, html: c.html, text: c.text, headers: c.headers, tags: [{ name: "gonderim", value: id }] };
    }));
    try {
      const ids = await resendToplu(mesajlar);
      for (let j = 0; j < parti.length; j++) await prisma.$executeRawUnsafe(`UPDATE "UyeGonderimAlici" SET "resendId" = $1 WHERE "id" = $2`, ids[j], parti[j].satir);
      gonderilen += parti.length;
    } catch (e) {
      hatali += parti.length;
      const msg = String(e instanceof Error ? e.message : e).slice(0, 300);
      for (const u of parti) await prisma.$executeRawUnsafe(`UPDATE "UyeGonderimAlici" SET "durum" = 'hata', "hata" = $1 WHERE "id" = $2`, msg, u.satir);
    }
    await prisma.$executeRawUnsafe(`UPDATE "UyeGonderim" SET "gonderilen" = $1, "hatali" = $2 WHERE "id" = $3`, gonderilen, hatali, id);
    if (i + 100 < alicilar.length) await new Promise((r) => setTimeout(r, 700)); // Resend: saniyede 2 istek
  }
  await prisma.$executeRawUnsafe(`UPDATE "UyeGonderim" SET "durum" = 'bitti' WHERE "id" = $1`, id);
  return { id, gonderilen, hatali, toplam: alicilar.length };
}

export type GonderimOzet = { id: string; tur: GonderimTur; anahtar: string; kanal: string; konu: string; toplam: number; gonderilen: number; hatali: number; durum: string; kim: string | null; createdAt: Date; teslim: number; acildi: number; tiklandi: number; geriDondu: number };

export async function gonderimGecmisi(): Promise<GonderimOzet[]> {
  await ensureSchema();
  const rows = await prisma.$queryRawUnsafe<GonderimOzet[]>(`
    SELECT g.*, COUNT(a.*) FILTER (WHERE a."teslimAt" IS NOT NULL)::int AS "teslim", COUNT(a.*) FILTER (WHERE a."acildiAt" IS NOT NULL)::int AS "acildi",
      COUNT(a.*) FILTER (WHERE a."tiklandiAt" IS NOT NULL)::int AS "tiklandi", COUNT(a.*) FILTER (WHERE a."durum" IN ('geri-dondu','spam'))::int AS "geriDondu"
    FROM "UyeGonderim" g LEFT JOIN "UyeGonderimAlici" a ON a."gonderimId" = g."id" GROUP BY g."id" ORDER BY g."createdAt" DESC LIMIT 50`);
  return rows;
}

/** Resend olayı gönderim alıcısına işlenir (e-posta kimliğiyle). İşlenen satır sayısını döndürür. */
export async function gonderimOlayi(emailId: string, tur: string): Promise<number> {
  await ensureSchema();
  const set: Record<string, string> = {
    "email.delivered": `"teslimAt" = COALESCE("teslimAt", NOW()), "durum" = CASE WHEN "durum" = 'gonderildi' THEN 'teslim' ELSE "durum" END`,
    "email.opened": `"acildiAt" = COALESCE("acildiAt", NOW()), "teslimAt" = COALESCE("teslimAt", NOW())`,
    "email.clicked": `"tiklandiAt" = COALESCE("tiklandiAt", NOW()), "acildiAt" = COALESCE("acildiAt", NOW())`,
    "email.bounced": `"durum" = 'geri-dondu'`,
    "email.suppressed": `"durum" = 'geri-dondu'`,
    "email.complained": `"durum" = 'spam'`,
  };
  if (!set[tur]) return 0;
  return prisma.$executeRawUnsafe(`UPDATE "UyeGonderimAlici" SET ${set[tur]} WHERE "resendId" = $1`, emailId);
}

// ─── WhatsApp (elle) ─────────────────────────────────────────────────────────
export async function whatsappListesi(k: Kampanya): Promise<(AdminMember & { gonderildi: boolean })[]> {
  const [uyeler, gitti] = await Promise.all([listMembersForAdmin(), gonderilmisler(k.id, "whatsapp")]);
  return uyeler.filter((u) => u.izinWhatsapp && u.phone).map((u) => ({ ...u, gonderildi: gitti.has(u.id) }));
}

export async function whatsappIsaretle(k: Kampanya, userId: string, phone: string, gonderildi: boolean) {
  await ensureSchema();
  if (!gonderildi) {
    await prisma.$executeRawUnsafe(`DELETE FROM "UyeGonderimAlici" WHERE "anahtar" = $1 AND "kanal" = 'whatsapp' AND "userId" = $2`, k.id, userId);
    return;
  }
  await prisma.$executeRawUnsafe(
    `INSERT INTO "UyeGonderimAlici" ("id","gonderimId","anahtar","kanal","userId","adres","durum") VALUES ($1,$2,$3,'whatsapp',$4,$5,'gonderildi') ON CONFLICT ("anahtar","kanal","userId") DO NOTHING`,
    yeniId("ua"), `wa_${k.id}`, k.id, userId, phone,
  );
}
