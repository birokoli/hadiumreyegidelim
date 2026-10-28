import { NextResponse } from "next/server";
import { listMembersForAdmin } from "@/lib/members";
import { mobilOturum, oturumYok, yetkili } from "@/lib/mobil/istek";

export const dynamic = "force-dynamic";

/** Üye listesi (admin /admin/uyeler sayfasıyla aynı kaynak); arama ve süzme uygulamada yapılır */
export async function GET(req: Request) {
  const o = await mobilOturum(req);
  if (!o) return oturumYok();
  if (!yetkili(o, "orders")) return NextResponse.json({ hata: "Yetkiniz yok." }, { status: 403 });
  const uyeler = await listMembersForAdmin();
  return NextResponse.json({
    uyeler: uyeler.map((u) => ({
      id: u.id, ad: u.name, eposta: u.email, telefon: u.phone, uyelik: u.createdAt, yeni: u.yeni, dogrulandi: !!u.emailVerifiedAt,
      izinEposta: u.izinEposta, izinWhatsapp: u.izinWhatsapp, dosyaSayisi: u.dosyaSayisi, sonDosyaNo: u.sonDosyaNo, sonDosyaDurum: u.sonDosyaStatus,
      plan: { donem: u.planDonem, kisi: u.planKisi, kimle: u.planKimle, otel: u.planOtel }, sonGiris: u.sonGiris,
    })),
  });
}
