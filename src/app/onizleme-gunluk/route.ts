// GEÇİCİ (29 Ekim): WhatsApp Web teklif bağlantısının önizlemesini hangi kullanıcı ajanıyla çekiyor? middleware /t/ isteklerinin
// ajanını buraya yazar; GET son 40 kaydı verir. Teklif adresi, IP ve kişisel veri tutulmaz. Sorun çözülünce kaldırılacak.
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

let hazir: Promise<unknown> | null = null;
const tablo = () =>
  (hazir ??= prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "OnizlemeGunluk" ("id" SERIAL PRIMARY KEY, "ua" TEXT, "bot" BOOLEAN, "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP)`));

export async function POST(req: Request) {
  await tablo();
  const ua = (req.headers.get("x-ua") ?? "").slice(0, 300);
  await prisma.$executeRawUnsafe(`INSERT INTO "OnizlemeGunluk" ("ua","bot") VALUES ($1,$2)`, ua, req.headers.get("x-bot") === "1");
  await prisma.$executeRawUnsafe(`DELETE FROM "OnizlemeGunluk" WHERE "id" NOT IN (SELECT "id" FROM "OnizlemeGunluk" ORDER BY "id" DESC LIMIT 200)`);
  return new Response(null, { status: 204 });
}

export async function GET() {
  await tablo();
  const rows = await prisma.$queryRawUnsafe(`SELECT "at","bot","ua" FROM "OnizlemeGunluk" ORDER BY "id" DESC LIMIT 40`);
  return Response.json(rows, { headers: { "cache-control": "no-store" } });
}
