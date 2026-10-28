import { NextResponse } from "next/server";
import { getDosya } from "@/lib/satis";
import { teklifLinki, teklifMesaji, voucherLinki, voucherMesaji } from "@/lib/satis/mesaj";
import { mobilOturum, oturumYok, yetkili } from "@/lib/mobil/istek";

export const dynamic = "force-dynamic";

/** Satış dosyasının WhatsApp metinleri (web panelindekiyle aynı kaynak: src/lib/satis/mesaj.ts) */
export async function GET(req: Request) {
  const o = await mobilOturum(req);
  if (!o) return oturumYok();
  if (!yetkili(o, "orders")) return NextResponse.json({ hata: "Yetkiniz yok." }, { status: 403 });
  const d = await getDosya("no", new URL(req.url).searchParams.get("no") ?? "");
  if (!d) return NextResponse.json({ hata: "Dosya bulunamadı." }, { status: 404 });
  return NextResponse.json({ teklif: teklifMesaji(d), voucher: voucherMesaji(d), teklifLinki: teklifLinki(d), voucherLinki: voucherLinki(d) });
}
