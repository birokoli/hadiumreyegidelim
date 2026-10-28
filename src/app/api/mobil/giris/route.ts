import { NextResponse } from "next/server";
import { adminKimlikDogrula } from "@/lib/admin-auth";
import { cihazKaydet } from "@/lib/mobil/oturum";
import { ipOf } from "@/lib/mobil/istek";
import { rateLimit } from "@/lib/rate-limit";

/** POST { kullanici, sifre, cihazAdi?, platform?, surum? } → { erisim, yenileme, yonetici } */
export async function POST(req: Request) {
  const ip = ipOf(req);
  const rl = rateLimit(ip, "mobil-giris", 5, 15 * 60_000);
  if (!rl.allowed) return NextResponse.json({ hata: `Çok fazla deneme. ${Math.ceil(rl.retryAfterMs / 60_000)} dakika sonra tekrar deneyin.` }, { status: 429 });
  const b = (await req.json().catch(() => null)) as { kullanici?: string; sifre?: string; cihazAdi?: string; platform?: string; surum?: string } | null;
  const login = String(b?.kullanici ?? "").trim();
  const sifre = String(b?.sifre ?? "");
  if (!login || !sifre) return NextResponse.json({ hata: "Kullanıcı adı ve şifre gerekli." }, { status: 400 });
  const oturum = await adminKimlikDogrula(login, sifre);
  if (oturum === "pasif") return NextResponse.json({ hata: "Bu yönetici hesabı pasif durumda." }, { status: 403 });
  if (!oturum) return NextResponse.json({ hata: `Hatalı kullanıcı adı veya şifre. ${rl.remaining} deneme hakkınız kaldı.` }, { status: 401 });
  return NextResponse.json(await cihazKaydet(oturum, { ad: b?.cihazAdi, platform: b?.platform, surum: b?.surum }));
}
