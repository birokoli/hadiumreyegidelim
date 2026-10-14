// Üyeler (B2C profil, 13 Ekim): oturum okuma ve şifre sıfırlama kodları. Kullanıcı tablosu Prisma "User";
// sıfırlama kodları için tablo yalnızca eklenir (CREATE TABLE IF NOT EXISTS), Prisma modeli yok.
import { createHash, randomInt } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { ensureSatisSchema } from "@/lib/satis";
import { ensureLeadSchema } from "@/lib/leads";

export const SESSION_COOKIE = "b2c_session";

export type Member = { id: string; name: string; email: string; phone: string | null; createdAt: Date };

/** Oturumdaki üye (yoksa null). */
export async function getMember(): Promise<Member | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await verifyToken(token);
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.id }, select: { id: true, name: true, email: true, phone: true, createdAt: true } });
}

/** Oturum çerezi ayarları (giriş, kayıt ve şifre sıfırlamada aynı). */
export const sessionCookie = (value: string) => ({
  name: SESSION_COOKIE,
  value,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7, // JWT de 7 gün
  path: "/",
});

let ready: Promise<void> | null = null;
function ensureSchema() {
  ready ??= (async () => {
    // Üyeye gönderilen tek kullanımlık kodlar (şifre sıfırlama, e-posta doğrulama)
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "UyeKod" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "amac" TEXT NOT NULL,
      "codeHash" TEXT NOT NULL,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "attempts" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "UyeKod_userId_idx" ON "UyeKod"("userId")`);
    // Üye ek bilgileri: e-posta doğrulaması (User tablosuna dokunmadan)
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "UyeMeta" (
      "userId" TEXT PRIMARY KEY,
      "emailVerifiedAt" TIMESTAMP(3),
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`);
  })().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

export type KodAmac = "sifre" | "eposta";
const hash = (userId: string, amac: KodAmac, code: string) => createHash("sha256").update(`${amac}:${userId}:${code}`).digest("hex");

/** Yeni 6 haneli kod; aynı amaçlı önceki kodlar geçersiz olur. */
export async function issueCode(userId: string, amac: KodAmac): Promise<string> {
  await ensureSchema();
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await prisma.$executeRaw`DELETE FROM "UyeKod" WHERE "userId" = ${userId} AND "amac" = ${amac}`;
  await prisma.$executeRaw`INSERT INTO "UyeKod" ("id","userId","amac","codeHash","expiresAt") VALUES (${`uk_${Date.now().toString(36)}${randomInt(0, 1e9).toString(36)}`}, ${userId}, ${amac}, ${hash(userId, amac, code)}, ${new Date(Date.now() + 15 * 60 * 1000)})`;
  return code;
}

export async function checkCode(userId: string, amac: KodAmac, code: string): Promise<"ok" | "wrong" | "expired" | "locked" | "missing"> {
  await ensureSchema();
  const rows = await prisma.$queryRaw<{ id: string; codeHash: string; expiresAt: Date; attempts: number }[]>`SELECT "id","codeHash","expiresAt","attempts" FROM "UyeKod" WHERE "userId" = ${userId} AND "amac" = ${amac} LIMIT 1`;
  const r = rows[0];
  if (!r) return "missing";
  if (r.attempts >= 5) return "locked";
  if (new Date(r.expiresAt).getTime() < Date.now()) return "expired";
  if (r.codeHash !== hash(userId, amac, code)) {
    await prisma.$executeRaw`UPDATE "UyeKod" SET "attempts" = "attempts" + 1 WHERE "id" = ${r.id}`;
    return "wrong";
  }
  await prisma.$executeRaw`DELETE FROM "UyeKod" WHERE "userId" = ${userId} AND "amac" = ${amac}`;
  return "ok";
}

export async function issueResetCode(userId: string) {
  return issueCode(userId, "sifre");
}
export async function checkResetCode(userId: string, code: string) {
  return checkCode(userId, "sifre", code);
}

/** E-postası kodla doğrulanmış mı? Umre dosyası ve teklifler e-postaya göre yalnızca doğrulanmışsa otomatik bağlanır. */
export async function isEmailVerified(userId: string): Promise<boolean> {
  await ensureSchema();
  const rows = await prisma.$queryRaw<{ v: Date | null }[]>`SELECT "emailVerifiedAt" AS v FROM "UyeMeta" WHERE "userId" = ${userId}`;
  return Boolean(rows[0]?.v);
}

export async function markEmailVerified(userId: string) {
  await ensureSchema();
  await prisma.$executeRaw`INSERT INTO "UyeMeta" ("userId","emailVerifiedAt","updatedAt") VALUES (${userId}, NOW(), NOW())
    ON CONFLICT ("userId") DO UPDATE SET "emailVerifiedAt" = NOW(), "updatedAt" = NOW()`;
}

/** Admin üye listesi (14 Ekim): üyelik bilgisi, e-posta doğrulaması, ileti izni (üye olurken müşteri havuzuna düşen kayıttan)
 *  ve satış masasındaki umre dosyaları (üyeye bağlı ya da aynı e-postayla açılmış). */
export type AdminMember = Member & {
  emailVerifiedAt: Date | null;
  marketingConsent: boolean;
  dosyaSayisi: number;
  sonDosyaNo: string | null;
  sonDosyaStatus: string | null;
  /** Son 7 günde üye oldu */
  yeni: boolean;
};

export async function listMembersForAdmin(): Promise<AdminMember[]> {
  await ensureSchema();
  await Promise.all([ensureSatisSchema(), ensureLeadSchema()]);
  const rows = await prisma.$queryRawUnsafe<(Omit<AdminMember, "dosyaSayisi"> & { dosyaSayisi: bigint })[]>(`
    SELECT u."id", u."name", u."email", u."phone", u."createdAt",
      m."emailVerifiedAt", (u."createdAt" > NOW() - INTERVAL '7 days') AS "yeni",
      COALESCE((SELECT bool_or(l."marketingConsent") FROM "MarketingLead" l WHERE LOWER(l."email") = LOWER(u."email")), false) AS "marketingConsent",
      (SELECT COUNT(*) FROM "SatisDosyasi" d WHERE d."userId" = u."id" OR LOWER(d."email") = LOWER(u."email")) AS "dosyaSayisi",
      (SELECT d."no" FROM "SatisDosyasi" d WHERE d."userId" = u."id" OR LOWER(d."email") = LOWER(u."email") ORDER BY d."updatedAt" DESC LIMIT 1) AS "sonDosyaNo",
      (SELECT d."status" FROM "SatisDosyasi" d WHERE d."userId" = u."id" OR LOWER(d."email") = LOWER(u."email") ORDER BY d."updatedAt" DESC LIMIT 1) AS "sonDosyaStatus"
    FROM "User" u LEFT JOIN "UyeMeta" m ON m."userId" = u."id"
    ORDER BY u."createdAt" DESC LIMIT 5000`);
  return rows.map((r) => ({ ...r, dosyaSayisi: Number(r.dosyaSayisi) }));
}
