// Umre dosyası belgesini indir: yalnızca dosyanın sahibi üye.
import { NextResponse } from "next/server";
import { uyeOturumu } from "@/lib/members/guard";
import { getBelge, ensureUmreSchema, memberCanSeeDosya, type Dosya } from "@/lib/umre";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const o = await uyeOturumu();
  if (!o) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const b = await getBelge((await params).id);
  if (!b) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  await ensureUmreSchema();
  const rows = await prisma.$queryRaw<(Omit<Dosya, "data"> & { data: string })[]>`SELECT * FROM "UmreDosyasi" WHERE "id" = ${b.dosyaId}`;
  const d = rows[0];
  if (!d || !(await memberCanSeeDosya({ ...d, data: {} } as Dosya, o.m, o.dogrulandi))) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  const buf = Buffer.from(b.icerik, "base64");
  const ad = b.ad.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.-]+/g, "-");
  return new NextResponse(buf as unknown as BodyInit, {
    headers: { "Content-Type": b.mime, "Content-Disposition": `attachment; filename="${ad}"`, "Cache-Control": "private, no-store" },
  });
}
