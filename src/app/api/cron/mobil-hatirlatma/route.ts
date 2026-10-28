import { NextResponse } from "next/server";
import { listDosyalar } from "@/lib/satis";
import { genelToplam, gunKaldi, odenen, onaylandiMi } from "@/lib/satis/ortak";
import { bildir, kisaAd } from "@/lib/mobil/bildir";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Mobil uygulama hatırlatmaları (28 Ekim; vercel.json: her gün 06:00 UTC = 09:00 Türkiye). Günlük özet değil
 * (kullanıcı istemedi); yalnızca dosya bazında yapılacak iş varsa bildirim gider:
 * - teklifin geçerliliği yarın bitiyor
 * - onaylanmış dosyada yolculuğa 7 / 3 / 1 gün kaldı (ödeme eksikse metinde belirtilir, tutar yazılmaz)
 */
export async function GET(request: Request) {
  if (process.env.CRON_SECRET && request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const dosyalar = await listDosyalar();
  let n = 0;
  for (const d of dosyalar) {
    if (d.status === "iptal" || d.status === "tamamlandi") continue;
    const ad = kisaAd(d.data.musteriAdi);
    if (d.status === "teklif" && d.data.gecerlilik && gunKaldi(d.data.gecerlilik) === 1) {
      await bildir("hatirlatma", { baslik: "Teklif yarın sona eriyor", govde: `${ad} · ${d.no}`, yol: `/satis/${d.no}` });
      n++;
    }
    const kalan = gunKaldi(d.data.gidis);
    if (onaylandiMi(d.status) && kalan != null && [7, 3, 1].includes(kalan)) {
      const eksik: string[] = [];
      if (odenen(d.data) + 0.5 < genelToplam(d.data)) eksik.push("ödeme tamamlanmadı");
      if (!d.data.ucusGidis) eksik.push("uçuş bilgisi yok");
      if (!d.data.karsilayanAd) eksik.push("karşılama atanmadı");
      await bildir("hatirlatma", { baslik: `Yolculuğa ${kalan} gün`, govde: `${ad} · ${d.no}${eksik.length ? ` · ${eksik.join(", ")}` : ""}`, yol: `/satis/${d.no}` });
      n++;
    }
  }
  return NextResponse.json({ ok: true, bildirim: n });
}
