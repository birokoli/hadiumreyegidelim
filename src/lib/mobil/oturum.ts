// Mobil yönetim uygulaması oturumu (28 Ekim; plan: docs/MOBIL-ADMIN-PLANI.md).
// Uygulama web admin'in /api/admin/* uçlarını kullanır: istekte "Authorization: Bearer <erişim anahtarı>" gelir, middleware
// bunu doğrulayıp admin_token çerezi gibi içeri geçirir. Erişim anahtarı 1 saatlik JWT'dir (içinde cihaz kimliği);
// süresi dolunca uygulama yenileme anahtarıyla yenisini alır. Yenileme anahtarı cihazda güvenli depoda, sunucuda yalnızca
// SHA-256 özeti olarak tutulur; cihaz iptal edilince yenileme reddedilir ve en geç 1 saatte erişim biter.
// Tablolar yalnızca eklenir (CREATE TABLE IF NOT EXISTS).
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { createAdminToken, LEGACY_ADMIN_ID, legacyAdminSession, normalizePermissions, type AdminSession } from "@/lib/admin-auth";

export const ERISIM_SURESI = "1h";
const YENILEME_GUN = 90;

let hazir: Promise<void> | null = null;
export function ensureMobilSchema() {
  hazir ??= (async () => {
    for (const sql of [
      `CREATE TABLE IF NOT EXISTS "MobilCihaz" (
        "id" TEXT PRIMARY KEY,
        "adminId" TEXT NOT NULL,
        "ad" TEXT NOT NULL DEFAULT '',
        "platform" TEXT NOT NULL DEFAULT 'android',
        "uygulamaSurumu" TEXT,
        "yenilemeOzeti" TEXT NOT NULL UNIQUE,
        "bildirimAnahtari" TEXT,
        "iptal" BOOLEAN NOT NULL DEFAULT FALSE,
        "sonGorulme" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE INDEX IF NOT EXISTS "MobilCihaz_adminId_idx" ON "MobilCihaz"("adminId")`,
      `CREATE TABLE IF NOT EXISTS "MobilBildirim" (
        "id" TEXT PRIMARY KEY,
        "adminId" TEXT NOT NULL,
        "olay" TEXT NOT NULL,
        "baslik" TEXT NOT NULL,
        "govde" TEXT NOT NULL DEFAULT '',
        "yol" TEXT,
        "okundu" BOOLEAN NOT NULL DEFAULT FALSE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE INDEX IF NOT EXISTS "MobilBildirim_admin_idx" ON "MobilBildirim"("adminId", "createdAt" DESC)`,
      `CREATE TABLE IF NOT EXISTS "MobilTercih" (
        "adminId" TEXT PRIMARY KEY,
        "kapali" TEXT NOT NULL DEFAULT '[]',
        "sessizBas" TEXT,
        "sessizSon" TEXT,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
    ]) await prisma.$executeRawUnsafe(sql);
  })().catch((e) => {
    hazir = null;
    throw e;
  });
  return hazir;
}

const ozet = (t: string) => crypto.createHash("sha256").update(t).digest("hex");
const yeniAnahtar = () => crypto.randomBytes(32).toString("base64url");

export type MobilCihaz = { id: string; adminId: string; ad: string; platform: string; uygulamaSurumu: string | null; bildirimAnahtari: string | null; iptal: boolean; sonGorulme: Date; createdAt: Date };

/** Yönetici kimliğinden güncel oturum (yetkiler ve durum her yenilemede veritabanından okunur) */
async function guncelOturum(adminId: string): Promise<Omit<AdminSession, "legacy"> | null> {
  if (adminId === LEGACY_ADMIN_ID) {
    const ad = await prisma.setting.findUnique({ where: { key: "ADMIN_USERNAME" } }).catch(() => null);
    return legacyAdminSession(ad?.value || "Yasin");
  }
  const a = await prisma.adminUser.findUnique({ where: { id: adminId } });
  if (!a || a.status !== "active") return null;
  return { id: a.id, name: a.name, username: a.username, email: a.email, role: a.role, permissions: normalizePermissions(a.permissions) };
}

async function anahtarCifti(oturum: Omit<AdminSession, "legacy">, cihazId: string, yenileme: string) {
  return {
    erisim: await createAdminToken(oturum, ERISIM_SURESI, { cihaz: cihazId }),
    yenileme,
    yonetici: { id: oturum.id, ad: oturum.name, kullaniciAdi: oturum.username, rol: oturum.role, yetkiler: oturum.role === "super_admin" ? ["*"] : oturum.permissions },
  };
}

/** Başarılı girişten sonra yeni cihaz kaydı ve anahtar çifti */
export async function cihazKaydet(oturum: Omit<AdminSession, "legacy">, bilgi: { ad?: string; platform?: string; surum?: string }) {
  await ensureMobilSchema();
  const id = crypto.randomUUID();
  const yenileme = yeniAnahtar();
  await prisma.$executeRawUnsafe(
    `INSERT INTO "MobilCihaz" ("id","adminId","ad","platform","uygulamaSurumu","yenilemeOzeti") VALUES ($1,$2,$3,$4,$5,$6)`,
    id, oturum.id, (bilgi.ad || "").slice(0, 80), (bilgi.platform || "android").slice(0, 20), bilgi.surum?.slice(0, 20) ?? null, ozet(yenileme),
  );
  return anahtarCifti(oturum, id, yenileme);
}

/** Yenileme anahtarı → yeni erişim anahtarı; yenileme anahtarı her seferinde değişir (eskisi geçersiz) */
export async function anahtarYenile(yenileme: string, surum?: string) {
  await ensureMobilSchema();
  const rows = await prisma.$queryRawUnsafe<MobilCihaz[]>(`SELECT * FROM "MobilCihaz" WHERE "yenilemeOzeti" = $1`, ozet(yenileme));
  const c = rows[0];
  if (!c || c.iptal || Date.now() - new Date(c.sonGorulme).getTime() > YENILEME_GUN * 86_400_000) return null;
  const oturum = await guncelOturum(c.adminId);
  if (!oturum) return null;
  const yeni = yeniAnahtar();
  await prisma.$executeRawUnsafe(
    `UPDATE "MobilCihaz" SET "yenilemeOzeti" = $1, "sonGorulme" = CURRENT_TIMESTAMP, "uygulamaSurumu" = COALESCE($2, "uygulamaSurumu") WHERE "id" = $3`,
    ozet(yeni), surum?.slice(0, 20) ?? null, c.id,
  );
  return anahtarCifti(oturum, c.id, yeni);
}

export async function cihazIptal(cihazId: string, adminId?: string) {
  await ensureMobilSchema();
  await prisma.$executeRawUnsafe(
    `UPDATE "MobilCihaz" SET "iptal" = TRUE, "bildirimAnahtari" = NULL WHERE "id" = $1${adminId ? ` AND "adminId" = $2` : ""}`,
    ...(adminId ? [cihazId, adminId] : [cihazId]),
  );
}

export async function bildirimAnahtariKaydet(cihazId: string, anahtar: string | null) {
  await ensureMobilSchema();
  await prisma.$executeRawUnsafe(`UPDATE "MobilCihaz" SET "bildirimAnahtari" = $1, "sonGorulme" = CURRENT_TIMESTAMP WHERE "id" = $2 AND NOT "iptal"`, anahtar, cihazId);
}

export async function cihazlar(adminId: string) {
  await ensureMobilSchema();
  return prisma.$queryRawUnsafe<MobilCihaz[]>(`SELECT * FROM "MobilCihaz" WHERE "adminId" = $1 AND NOT "iptal" ORDER BY "sonGorulme" DESC`, adminId);
}

/** Erişim anahtarındaki cihaz hâlâ geçerli mi (iptal edilen cihazın açık anahtarı mobil uçlarda hemen reddedilir) */
export async function cihazGecerli(cihazId: string | undefined) {
  if (!cihazId) return false;
  await ensureMobilSchema();
  const rows = await prisma.$queryRawUnsafe<{ iptal: boolean }[]>(`SELECT "iptal" FROM "MobilCihaz" WHERE "id" = $1`, cihazId);
  return !!rows[0] && !rows[0].iptal;
}
