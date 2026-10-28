import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paylasimEkleri } from "@/lib/marketing/paylasim";
import { mobilOturum, oturumYok, yetkili } from "@/lib/mobil/istek";

export const dynamic = "force-dynamic";

/** Influencer içerikleri (tüm influencer'lar): ?durum=pending|approved|rejected|tumu. Onay/red mevcut uçla:
 *  POST /api/admin/influencers/<influencerId>/shares { shareId, action, note } */
export async function GET(req: Request) {
  const o = await mobilOturum(req);
  if (!o) return oturumYok();
  if (!yetkili(o, "marketing")) return NextResponse.json({ hata: "Yetkiniz yok." }, { status: 403 });
  const durum = new URL(req.url).searchParams.get("durum") || "pending";
  const liste = await prisma.share.findMany({
    where: durum === "tumu" ? {} : { status: durum },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { influencer: { select: { id: true, fullName: true, instagramHandle: true } } },
  });
  const ek = await paylasimEkleri(liste.map((s) => s.id));
  const kampanyaIds = [...new Set(Object.values(ek).map((e) => e.campaignId).filter((x): x is string => !!x))];
  const kampanyalar = kampanyaIds.length ? await prisma.campaign.findMany({ where: { id: { in: kampanyaIds } }, select: { id: true, title: true } }) : [];
  return NextResponse.json({
    icerikler: liste.map((s) => ({
      id: s.id, platform: s.platform, link: s.shareUrl, gorsel: s.screenshotUrl, tarih: s.shareDate, aciklama: s.description, durum: s.status,
      redNedeni: s.rejectReason, olusturma: s.createdAt, influencer: s.influencer,
      kampanya: kampanyalar.find((k) => k.id === ek[s.id]?.campaignId)?.title ?? null, ekipNotu: ek[s.id]?.adminNote ?? null,
    })),
  });
}
