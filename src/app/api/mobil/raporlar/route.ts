// Raporlar (uygulama): web'deki Dashboard ve Analytics sayaçları + son otomatik yazı kayıtları (AILog).
// Satış rakamları (ciro, kâr, tahsilat) uygulamada dosyalardan hesaplanır (src/lib/satis/ortak.ts ortak).
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mobilOturum, oturumYok, yetkili } from "@/lib/mobil/istek";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const o = await mobilOturum(req);
  if (!o) return oturumYok();
  if (!yetkili(o, "dashboard")) return NextResponse.json({ hata: "Yetkiniz yok." }, { status: 403 });
  const gun = (n: number) => new Date(Date.now() - n * 86_400_000);
  const [talep7, talep30, talepOkunmamis, talepToplam, yaziYayinda, yaziTaslak, yazi30, paketYayinda, siparis30, uye30, uyeToplam, aiTamam, aiSon] = await Promise.all([
    prisma.contactRequest.count({ where: { createdAt: { gte: gun(7) } } }),
    prisma.contactRequest.count({ where: { createdAt: { gte: gun(30) } } }),
    prisma.contactRequest.count({ where: { status: "UNREAD" } }),
    prisma.contactRequest.count(),
    prisma.post.count({ where: { published: true } }),
    prisma.post.count({ where: { published: false } }),
    prisma.post.count({ where: { published: true, createdAt: { gte: gun(30) } } }),
    prisma.package.count({ where: { published: true } }),
    prisma.order.count({ where: { createdAt: { gte: gun(30) } } }),
    prisma.user.count({ where: { createdAt: { gte: gun(30) } } }).catch(() => 0),
    prisma.user.count().catch(() => 0),
    prisma.aILog.count({ where: { status: "COMPLETED" } }),
    prisma.aILog.findMany({ take: 20, orderBy: { createdAt: "desc" }, select: { id: true, topic: true, status: true, details: true, createdAt: true, completedAt: true } }),
  ]);
  return NextResponse.json({
    talep: { son7: talep7, son30: talep30, okunmamis: talepOkunmamis, toplam: talepToplam },
    icerik: { yayinda: yaziYayinda, taslak: yaziTaslak, son30: yazi30, paket: paketYayinda },
    siparis30,
    uye: { son30: uye30, toplam: uyeToplam },
    ai: { tamamlanan: aiTamam, son: aiSon.map((l) => ({ ...l, details: l.details?.slice(0, 400) ?? null })) },
  });
}
