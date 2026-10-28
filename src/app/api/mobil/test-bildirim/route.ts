import { NextResponse } from "next/server";
import { bildir } from "@/lib/mobil/bildir";
import { mobilOturum, oturumYok } from "@/lib/mobil/istek";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Ayarlar → "Test bildirimi gönder": FCM yapılandırmasını telefondan doğrulamak için; yalnızca isteyen yöneticinin
 *  cihazlarına gider. Dakikada 3. */
export async function POST(req: Request) {
  const o = await mobilOturum(req);
  if (!o) return oturumYok();
  if (!rateLimit(o.adminId, "test-bildirim", 3, 60_000).allowed) return NextResponse.json({ hata: "Biraz bekleyin." }, { status: 429 });
  const fcm = !!process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  await bildir("hatirlatma", { baslik: "Test bildirimi", govde: "Hadi Yönetim bildirimleri çalışıyor.", yol: "/bildirimler" }, o.adminId);
  return NextResponse.json({ tamam: true, fcm });
}
