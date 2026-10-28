import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureMobilSchema } from "@/lib/mobil/oturum";
import { mobilOturum, oturumYok } from "@/lib/mobil/istek";

type Satir = { id: string; olay: string; baslik: string; govde: string; yol: string | null; okundu: boolean; createdAt: Date };

/** GET ?once=<ISO> → son 50 bildirim (sayfalama) + okunmamış sayısı */
export async function GET(req: Request) {
  const o = await mobilOturum(req);
  if (!o) return oturumYok();
  await ensureMobilSchema();
  const once = new URL(req.url).searchParams.get("once");
  const liste = await prisma.$queryRawUnsafe<Satir[]>(
    `SELECT "id","olay","baslik","govde","yol","okundu","createdAt" FROM "MobilBildirim" WHERE "adminId" = $1 ${once ? `AND "createdAt" < $2` : ""} ORDER BY "createdAt" DESC LIMIT 50`,
    ...(once ? [o.adminId, new Date(once)] : [o.adminId]),
  );
  const [{ n }] = await prisma.$queryRawUnsafe<{ n: number }[]>(`SELECT COUNT(*)::int AS n FROM "MobilBildirim" WHERE "adminId" = $1 AND NOT "okundu"`, o.adminId);
  return NextResponse.json({ bildirimler: liste, okunmamis: n });
}

/** POST { idler?: string[], hepsi?: true } → okundu işaretle */
export async function POST(req: Request) {
  const o = await mobilOturum(req);
  if (!o) return oturumYok();
  await ensureMobilSchema();
  const b = (await req.json().catch(() => null)) as { idler?: string[]; hepsi?: boolean } | null;
  if (b?.hepsi) await prisma.$executeRawUnsafe(`UPDATE "MobilBildirim" SET "okundu" = TRUE WHERE "adminId" = $1`, o.adminId);
  else if (b?.idler?.length) await prisma.$executeRawUnsafe(`UPDATE "MobilBildirim" SET "okundu" = TRUE WHERE "adminId" = $1 AND "id" = ANY($2)`, o.adminId, b.idler.slice(0, 200).map(String));
  return NextResponse.json({ tamam: true });
}
