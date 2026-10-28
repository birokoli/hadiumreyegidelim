import { NextResponse } from "next/server";
import { anahtarYenile } from "@/lib/mobil/oturum";
import { ipOf } from "@/lib/mobil/istek";
import { rateLimit } from "@/lib/rate-limit";

/** POST { yenileme, surum? } → yeni { erisim, yenileme, yonetici }; geçersizse 401 (uygulama giriş ekranına döner) */
export async function POST(req: Request) {
  if (!rateLimit(ipOf(req), "mobil-yenile", 30, 60_000).allowed) return NextResponse.json({ hata: "Çok fazla istek." }, { status: 429 });
  const b = (await req.json().catch(() => null)) as { yenileme?: string; surum?: string } | null;
  const sonuc = b?.yenileme ? await anahtarYenile(String(b.yenileme), b.surum) : null;
  return sonuc ? NextResponse.json(sonuc) : NextResponse.json({ hata: "Oturum sona erdi." }, { status: 401 });
}
