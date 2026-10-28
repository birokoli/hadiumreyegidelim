import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { listDosyalar } from "@/lib/satis";
import { gunKaldi, onaylandiMi } from "@/lib/satis/ortak";
import { rezervasyonlar, aktif } from "@/lib/ramazan";
import { ensureMobilSchema } from "@/lib/mobil/oturum";
import { mobilOturum, oturumYok, yetkili } from "@/lib/mobil/istek";

export const dynamic = "force-dynamic";

/** Bugün ekranı: yetkiye göre sayaçlar ve yaklaşan yolculuklar (tek istek). Hata veren kalem 0 sayılır, ekran yine açılır. */
export async function GET(req: Request) {
  const o = await mobilOturum(req);
  if (!o) return oturumYok();
  await ensureMobilSchema();
  const siparis = yetkili(o, "orders");
  const pazarlama = yetkili(o, "marketing");
  const s = <T,>(p: Promise<T>, yedek: T) => p.catch((e) => (console.error("[mobil/ozet]", e), yedek));

  const [dosyalar, yeniTalep, ramazan, yeniUye, yorum, icerik, basvuru, destek, whatsapp, okunmamis] = await Promise.all([
    siparis ? s(listDosyalar(), []) : Promise.resolve([]),
    siparis ? s(prisma.contactRequest.count({ where: { status: "UNREAD" } }), 0) : 0,
    siparis ? s(rezervasyonlar(), []) : Promise.resolve([]),
    siparis ? s(prisma.user.count({ where: { createdAt: { gt: new Date(Date.now() - 7 * 86_400_000) } } }), 0) : 0,
    pazarlama ? s(prisma.review.count({ where: { status: "pending" } }), 0) : 0,
    pazarlama ? s(prisma.share.count({ where: { status: "pending" } }), 0) : 0,
    pazarlama ? s(prisma.influencer.count({ where: { status: "pending" } }), 0) : 0,
    pazarlama ? s(prisma.supportChat.aggregate({ _sum: { unreadByAdmin: true } }).then((a) => a._sum.unreadByAdmin ?? 0), 0) : 0,
    pazarlama ? s(prisma.whatsAppConversation.count({ where: { status: "HUMAN_NEEDED" } }), 0) : 0,
    s(prisma.$queryRawUnsafe<{ n: number }[]>(`SELECT COUNT(*)::int AS n FROM "MobilBildirim" WHERE "adminId" = $1 AND NOT "okundu"`, o.adminId).then((r) => r[0]?.n ?? 0), 0),
  ]);

  const asama: Record<string, number> = {};
  for (const d of dosyalar) asama[d.status] = (asama[d.status] ?? 0) + 1;
  const yaklasan = dosyalar
    .filter((d) => onaylandiMi(d.status) && d.status !== "tamamlandi")
    .map((d) => ({ no: d.no, musteri: d.data.musteriAdi, gidis: d.data.gidis ?? null, kalan: gunKaldi(d.data.gidis), status: d.status }))
    .filter((d) => d.kalan != null && d.kalan >= 0 && d.kalan <= 30)
    .sort((a, b) => (a.kalan ?? 0) - (b.kalan ?? 0))
    .slice(0, 10);
  const bekleyenTeklif = dosyalar.filter((d) => d.status === "talep").slice(0, 5).map((d) => ({ no: d.no, musteri: d.data.musteriAdi, tarih: d.updatedAt }));

  return NextResponse.json({
    ad: o.ad,
    yetkiler: { siparis, pazarlama },
    sayac: {
      yeniTalep, yeniUye, yorum, icerik, basvuru, destek, whatsapp, okunmamis,
      ramazanAktif: ramazan.filter((r) => aktif(r)).length,
      ramazanBekleyen: ramazan.filter((r) => r.durum === "bekliyor" && aktif(r)).length,
      dosya: asama,
    },
    yaklasan,
    bekleyenTeklif,
  });
}
