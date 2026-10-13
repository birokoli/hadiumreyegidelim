// Dosya belgesini indir: yalnızca dosyanın sahibi üye.
import { NextResponse } from "next/server";
import { uyeOturumu } from "@/lib/members/guard";
import { getBelge, getDosya, memberCanSee } from "@/lib/satis";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const o = await uyeOturumu();
  if (!o) return NextResponse.json({ error: "Oturum gerekli." }, { status: 401 });
  const b = await getBelge((await params).id);
  const d = b ? await getDosya("id", b.dosyaId) : null;
  if (!b || !d || !memberCanSee(d, o.m, o.dogrulandi)) return NextResponse.json({ error: "Bulunamadı." }, { status: 404 });
  const ad = b.ad.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.-]+/g, "-");
  return new NextResponse(Buffer.from(b.icerik, "base64") as unknown as BodyInit, { headers: { "Content-Type": b.mime, "Content-Disposition": `attachment; filename="${ad}"`, "Cache-Control": "private, no-store" } });
}
