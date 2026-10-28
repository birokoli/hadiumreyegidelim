import { NextResponse } from "next/server";
import { cihazIptal, cihazlar } from "@/lib/mobil/oturum";
import { mobilOturum, oturumYok } from "@/lib/mobil/istek";

/** GET: bu yöneticinin açık cihazları · DELETE ?id=: bir cihazı kapat */
export async function GET(req: Request) {
  const o = await mobilOturum(req);
  if (!o) return oturumYok();
  const liste = await cihazlar(o.adminId);
  return NextResponse.json({ cihazlar: liste.map((c) => ({ id: c.id, ad: c.ad, platform: c.platform, surum: c.uygulamaSurumu, sonGorulme: c.sonGorulme, buCihaz: c.id === o.cihazId, bildirim: !!c.bildirimAnahtari })) });
}
export async function DELETE(req: Request) {
  const o = await mobilOturum(req);
  if (!o) return oturumYok();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ hata: "Cihaz seçilmedi." }, { status: 400 });
  await cihazIptal(id, o.adminId);
  return NextResponse.json({ tamam: true });
}
