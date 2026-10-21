// Paket bülteninden abonelikten çıkma (21 Ekim): müşteri havuzu kaydı (kitapçık formu) için imzalı bağlantı, giriş gerekmez.
// GET onay sayfası; sayfadaki düğme ve e-posta istemcilerinin tek tık çıkışı (List-Unsubscribe-Post) POST ile pazarlama
// iznini kapatır (aynı adresli bütün havuz kayıtlarında). Üyelerin bağlantısı /api/profil/abonelik.
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { ensureLeadSchema } from "@/lib/leads";
import { abonelikImza } from "@/lib/uye-kampanya/eposta";

async function dogrula(l: string | null, k: string | null) {
  if (!l || !k) return null;
  const beklenen = Buffer.from(await abonelikImza(`lead:${l}`));
  const gelen = Buffer.from(k);
  if (gelen.length !== beklenen.length || !timingSafeEqual(gelen, beklenen)) return null;
  await ensureLeadSchema();
  const r = await prisma.$queryRawUnsafe<{ email: string }[]>(`SELECT "email" FROM "MarketingLead" WHERE "id" = $1`, l);
  return r[0] ?? null;
}

const sayfa = (govde: string) =>
  new NextResponse(
    `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>E-posta tercihi</title></head>
<body style="margin:0;background:#f3f5f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif;color:#203c76"><div style="max-width:440px;margin:60px auto;background:#fff;border-radius:20px;padding:28px;border:1px solid #dfe4ec;text-align:center">${govde}
<p style="margin-top:24px;font-size:12px"><a href="/" style="color:#5b6b86">hadiumreyegidelim.com</a></p></div></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } },
  );

export async function GET(req: Request) {
  const url = new URL(req.url);
  const kayit = await dogrula(url.searchParams.get("l"), url.searchParams.get("k"));
  if (!kayit) return sayfa(`<h1 style="font-size:20px">Bağlantı geçersiz</h1><p>Bu e-postaları durdurmak için info@hadiumreyegidelim.com adresine yazabilirsiniz.</p>`);
  return sayfa(`<h1 style="font-size:20px">Umre paketleri e-postaları</h1><p style="color:#3d4a66">Paket ve fiyat e-postalarını almak istemiyor musunuz?</p>
<form method="post"><button style="margin-top:12px;background:#203c76;color:#fff;border:0;border-radius:12px;padding:13px 22px;font-size:15px;font-weight:700;cursor:pointer">E-postaları durdur</button></form>`);
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const kayit = await dogrula(url.searchParams.get("l"), url.searchParams.get("k"));
  if (!kayit) return sayfa(`<h1 style="font-size:20px">Bağlantı geçersiz</h1>`);
  await prisma.$executeRawUnsafe(`UPDATE "MarketingLead" SET "marketingConsent" = false WHERE LOWER("email") = LOWER($1)`, kayit.email);
  return sayfa(`<h1 style="font-size:20px">Tamam, e-postaları durdurduk</h1><p style="color:#3d4a66">Bu adrese artık paket ve fiyat e-postası göndermeyeceğiz.</p>`);
}
