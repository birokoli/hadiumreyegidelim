// Ramazan 2027 umresi: GET müsaitlik ve fiyatlar (kişisel veri yok), POST rezervasyon (yer anında ayrılır, 24 saat içinde ödeme).
import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewLead } from "@/lib/lead-notify";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { checkEmail, checkPhone } from "@/lib/leads/email-check";
import { ramazanDurumu, rezervasyonYap } from "@/lib/ramazan";
import { paketTarihleri, ramazanPaketi } from "@/lib/ramazan/paketler";
import { odemeSaglayici } from "@/lib/ramazan/odeme";

export const dynamic = "force-dynamic";

export async function GET() {
  const d = await ramazanDurumu().catch((e) => { console.error("[ramazan]", e); return null; });
  if (!d) return NextResponse.json({ error: "Fiyatlar şu an alınamadı." }, { status: 503 });
  return NextResponse.json({ secenekler: d.secenekler }, { headers: { "Cache-Control": "no-store" } });
}

const metin = (v: unknown, max = 120) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");

export async function POST(request: Request) {
  const { allowed, retryAfterMs } = rateLimit(getClientIp(request), "ramazan", 5, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: "Çok fazla deneme. Lütfen 10 dakika sonra tekrar deneyin." }, { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } });
  }
  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  if (b.website) return NextResponse.json({ error: "Gönderilemedi." }, { status: 400 }); // bot tuzağı

  const paket = ramazanPaketi(metin(b.paketId, 10));
  const kisi = Number(b.kisi);
  const adSoyad = metin(b.adSoyad);
  const tel = checkPhone(metin(b.telefon, 30));
  const epostaHam = metin(b.eposta, 160);
  const yolcular = Array.isArray(b.yolcular) ? b.yolcular.map((y) => metin(y)).filter(Boolean) : [];

  if (!paket) return NextResponse.json({ error: "Paket seçin." }, { status: 400 });
  if (adSoyad.length < 5 || !adSoyad.includes(" ")) return NextResponse.json({ error: "Adınızı ve soyadınızı yazın." }, { status: 400 });
  if (!tel.ok) return NextResponse.json({ error: tel.error || "Telefon numaranızı yazın." }, { status: 400 });
  if (yolcular.length !== kisi) return NextResponse.json({ error: `${kisi} yolcunun adını ve soyadını yazın.` }, { status: 400 });
  if (b.kvkk !== true) return NextResponse.json({ error: "Devam etmek için aydınlatma metnini onaylayın." }, { status: 400 });
  let eposta: string | null = null;
  if (epostaHam) {
    const e = await checkEmail(epostaHam);
    if (!e.ok) return NextResponse.json({ error: e.error }, { status: 400 });
    eposta = e.email;
  }

  const sonuc = await rezervasyonYap({ paketId: paket.id, kisi, adSoyad, telefon: tel.phone, eposta, yolcular, pazarlamaIzni: b.pazarlama === true })
    .catch((e) => { console.error("[ramazan] rezervasyon", e); return { ok: false as const, hata: "Rezervasyon kaydedilemedi; WhatsApp'tan yazın." }; });
  if (!sonuc.ok) return NextResponse.json({ error: sonuc.hata }, { status: 409 });

  // Gelen Kutusu'na düşer, yöneticiye WhatsApp bildirimi gider (yanıtı bekletmeden)
  const t = paketTarihleri(paket);
  const ozet = `Ramazan 2027 · ${sonuc.paket} · ${kisi} kişi · ${sonuc.kod}`;
  const mesaj = [
    `Rezervasyon: ${sonuc.kod} (oda ${sonuc.oda})`,
    `${sonuc.paket}: ${t.ramazan}, ${t.giris} – ${t.cikis}`,
    `Toplam ${sonuc.toplamUsd.toFixed(2)} $ (kişi başı ${sonuc.kisiBasiUsd.toFixed(2)} $)`,
    `Son ödeme: ${sonuc.sonOdeme.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}`,
    `Yolcular: ${yolcular.join(", ")}`,
    eposta ? `E-posta: ${eposta}` : "",
  ].filter(Boolean).join("\n");
  after(async () => {
    const kayit = await prisma.contactRequest.create({ data: { name: adSoyad, phone: tel.phone, package: ozet, message: mesaj } }).catch(() => null);
    await notifyNewLead({ name: adSoyad, phone: tel.phone, package: ozet, message: mesaj });
    if (!kayit) console.warn("[ramazan] gelen kutusu kaydı açılamadı", sonuc.kod);
  });

  // Ödeme sağlayıcısı tanımlıysa ödeme sayfası açılır; değilse ödeme bilgisi WhatsApp'tan gider
  let odemeUrl: string | null = null;
  const saglayici = odemeSaglayici();
  if (saglayici) {
    odemeUrl = await saglayici.baslat({ kod: sonuc.kod, toplamUsd: sonuc.toplamUsd, adSoyad, telefon: tel.phone, eposta, aciklama: ozet })
      .then((o) => o.url).catch((e) => { console.error("[ramazan-odeme] başlatılamadı", e); return null; });
  }

  return NextResponse.json({ ok: true, odemeUrl, kod: sonuc.kod, paket: sonuc.paket, kisi, kisiBasiUsd: sonuc.kisiBasiUsd, toplamUsd: sonuc.toplamUsd, sonOdeme: sonuc.sonOdeme, ...t });
}
