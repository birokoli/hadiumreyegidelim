import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureMobilSchema } from "@/lib/mobil/oturum";
import { OLAYLAR } from "@/lib/mobil/bildir";
import { mobilOturum, oturumYok, yetkili } from "@/lib/mobil/istek";

const saat = (s: unknown) => (typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s) ? s : null);

/** GET → { olaylar: [{ anahtar, ad, acik }], sessizBas, sessizSon } (yalnızca yetkisi olan olaylar) */
export async function GET(req: Request) {
  const o = await mobilOturum(req);
  if (!o) return oturumYok();
  await ensureMobilSchema();
  const rows = await prisma.$queryRawUnsafe<{ kapali: string; sessizBas: string | null; sessizSon: string | null }[]>(`SELECT * FROM "MobilTercih" WHERE "adminId" = $1`, o.adminId);
  let kapali: string[] = [];
  try {
    kapali = JSON.parse(rows[0]?.kapali ?? "[]");
  } catch {}
  const olaylar = Object.entries(OLAYLAR).filter(([, v]) => yetkili(o, v.yetki)).map(([k, v]) => ({ anahtar: k, ad: v.ad, acik: !kapali.includes(k) }));
  return NextResponse.json({ olaylar, sessizBas: rows[0]?.sessizBas ?? null, sessizSon: rows[0]?.sessizSon ?? null });
}

/** PUT { kapali: string[], sessizBas?, sessizSon? } */
export async function PUT(req: Request) {
  const o = await mobilOturum(req);
  if (!o) return oturumYok();
  await ensureMobilSchema();
  const b = (await req.json().catch(() => null)) as { kapali?: unknown; sessizBas?: unknown; sessizSon?: unknown } | null;
  const kapali = Array.isArray(b?.kapali) ? b.kapali.filter((k): k is string => typeof k === "string" && k in OLAYLAR) : [];
  await prisma.$executeRawUnsafe(
    `INSERT INTO "MobilTercih" ("adminId","kapali","sessizBas","sessizSon") VALUES ($1,$2,$3,$4)
     ON CONFLICT ("adminId") DO UPDATE SET "kapali" = EXCLUDED."kapali", "sessizBas" = EXCLUDED."sessizBas", "sessizSon" = EXCLUDED."sessizSon", "updatedAt" = CURRENT_TIMESTAMP`,
    o.adminId, JSON.stringify(kapali), saat(b?.sessizBas), saat(b?.sessizSon),
  );
  return NextResponse.json({ tamam: true });
}
