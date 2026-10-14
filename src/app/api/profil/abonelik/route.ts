// Kampanya e-postasından abonelikten çıkma (Profil 2, 14 Ekim): imzalı bağlantı, giriş gerekmez. GET bir onay sayfası
// gösterir; e-posta istemcilerinin tek tık çıkışı (List-Unsubscribe-Post) ve sayfadaki düğme POST ile izni kapatır.
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { abonelikImza } from "@/lib/uye-kampanya/eposta";
import { saveTercih } from "@/lib/uye-kampanya";
import { getClientIp } from "@/lib/rate-limit";

async function dogrula(u: string | null, k: string | null) {
  if (!u || !k) return null;
  const beklenen = Buffer.from(await abonelikImza(u));
  const gelen = Buffer.from(k);
  if (gelen.length !== beklenen.length || !timingSafeEqual(gelen, beklenen)) return null;
  return prisma.user.findUnique({ where: { id: u }, select: { id: true, email: true } });
}

const sayfa = (govde: string) =>
  new NextResponse(
    `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>E-posta tercihi</title></head>
<body style="margin:0;background:#edf1fe;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#14213d"><div style="max-width:440px;margin:60px auto;background:#fff;border-radius:20px;padding:28px;border:1px solid #d7e0f0;text-align:center">${govde}
<p style="margin-top:24px;font-size:12px"><a href="/" style="color:#5b6680">hadiumreyegidelim.com</a></p></div></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );

export async function GET(req: Request) {
  const url = new URL(req.url);
  const user = await dogrula(url.searchParams.get("u"), url.searchParams.get("k"));
  if (!user) return sayfa(`<h1 style="font-size:20px;color:#1d428a">Bağlantı geçersiz</h1><p>Tercihinizi profilinizdeki Hesap bölümünden değiştirebilirsiniz.</p>`);
  return sayfa(`<h1 style="font-size:20px;color:#1d428a">Üyelere özel e-postalar</h1><p style="color:#3d4a66">Yeni tarih ve fiyat e-postalarını almak istemiyor musunuz?</p>
<form method="post"><button style="margin-top:12px;background:#1d428a;color:#fff;border:0;border-radius:12px;padding:13px 22px;font-size:15px;font-weight:700;cursor:pointer">E-postaları durdur</button></form>`);
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const user = await dogrula(url.searchParams.get("u"), url.searchParams.get("k"));
  if (!user) return sayfa(`<h1 style="font-size:20px;color:#1d428a">Bağlantı geçersiz</h1>`);
  await saveTercih(user.id, user.email, { izinEposta: false, soruldu: true }, "abonelik", getClientIp(req));
  return sayfa(`<h1 style="font-size:20px;color:#1d428a">Tamam, e-postaları durdurduk</h1><p style="color:#3d4a66">Üyeliğiniz devam ediyor. Fikrinizi değiştirirseniz profilinizdeki Hesap bölümünden yeniden açabilirsiniz.</p>`);
}
