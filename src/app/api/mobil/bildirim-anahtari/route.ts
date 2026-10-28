import { NextResponse } from "next/server";
import { bildirimAnahtariKaydet } from "@/lib/mobil/oturum";
import { mobilOturum, oturumYok } from "@/lib/mobil/istek";

/** POST { anahtar } — cihazın FCM anahtarı (uygulama her açılışta gönderir; null = bildirimi kapat) */
export async function POST(req: Request) {
  const o = await mobilOturum(req);
  if (!o) return oturumYok();
  const b = (await req.json().catch(() => null)) as { anahtar?: string | null } | null;
  const anahtar = typeof b?.anahtar === "string" && b.anahtar.length < 4096 ? b.anahtar : null;
  await bildirimAnahtariKaydet(o.cihazId, anahtar);
  return NextResponse.json({ tamam: true });
}
