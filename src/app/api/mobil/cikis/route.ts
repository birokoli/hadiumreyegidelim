import { NextResponse } from "next/server";
import { cihazIptal } from "@/lib/mobil/oturum";
import { mobilOturum, oturumYok } from "@/lib/mobil/istek";

/** Bu cihazdan çıkış: cihaz iptal edilir, bildirimler kesilir */
export async function POST(req: Request) {
  const o = await mobilOturum(req);
  if (!o) return oturumYok();
  await cihazIptal(o.cihazId, o.adminId);
  return NextResponse.json({ tamam: true });
}
