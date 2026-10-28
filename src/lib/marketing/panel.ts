// Marketing paneli sunucu verileri (27 Ekim): sayfalar istemcide fetch beklemeden sunucuda veriyle gelir.
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo/site";
import { effectiveThreshold, validSalesCount, currentRate, currentPeriod, starBalance, getConfig } from "@/lib/affiliate";
import { getBriefs, type KampanyaBrief } from "./brief";
import { paylasimEkleri } from "./paylasim";

const TABAN = process.env.NEXT_PUBLIC_BASE_URL || SITE_URL;
export const takipLinki = (uniqueUrl: string) => `${TABAN}/r/${uniqueUrl}`;
export const kampanyaLinki = (slug: string, kod: string) => `${TABAN}/c/${slug}?ref=${encodeURIComponent(kod)}`;
export const indirimEtiketi = (c: { discountType: string; discountValue: number }) =>
  c.discountValue > 0 ? (c.discountType === "percent" ? `%${c.discountValue} indirim` : `${c.discountValue.toLocaleString("tr-TR")} TL indirim`) : "";

export const MUSTERI_DURUM: Record<string, { ad: string; sira: number }> = {
  clicked: { ad: "Linke tıkladı", sira: 0 },
  contacted: { ad: "Arandı", sira: 1 },
  in_discussion: { ad: "Görüşüyor", sira: 2 },
  contracted: { ad: "Sözleşme", sira: 3 },
  paid: { ad: "Ödeme yaptı", sira: 4 },
  completed: { ad: "Umresini yaptı", sira: 5 },
  cancelled: { ad: "İptal", sira: -1 },
};

/** KVKK: müşterinin yalnızca ilk adı ve soyadının baş harfi */
export const kisaAd = (ad: string) => ad.trim().split(/\s+/).map((w, i) => (i === 0 ? w : `${w[0]}.`)).join(" ");

export async function bugunVerisi(influencerId: string) {
  const ayBasi = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const period = currentPeriod();
  // Program ayarı yoksa aşağıdaki paralel sorgular aynı anda oluşturmaya çalışıp çakışıyordu; önce tek seferde garanti et
  await getConfig();
  const [inf, ayTik, ayMusteri, aySatis, esik, gecerli, oran, yildiz, katilimlar, aktifler, paylasimlar] = await Promise.all([
    prisma.influencer.findUnique({ where: { id: influencerId }, include: { customers: { orderBy: { createdAt: "desc" }, take: 5 } } }),
    prisma.linkClick.count({ where: { influencerId, clickedAt: { gte: ayBasi }, isBot: false } }),
    prisma.customer.count({ where: { influencerId, createdAt: { gte: ayBasi } } }),
    prisma.sale.count({ where: { influencerId, createdAt: { gte: ayBasi } } }),
    effectiveThreshold(influencerId, period),
    validSalesCount(influencerId),
    currentRate(influencerId, period),
    starBalance(influencerId),
    prisma.campaignParticipant.findMany({ where: { influencerId }, include: { campaign: true }, orderBy: { joinedAt: "desc" } }),
    prisma.campaign.findMany({ where: { status: "active" }, orderBy: { createdAt: "desc" } }),
    prisma.share.findMany({ where: { influencerId }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  if (!inf) return null;
  // Kazanç satışlardan hesaplanır (özet alanlar her zaman güncel değil)
  const toplamlar = await prisma.sale.groupBy({ by: ["commissionStatus"], where: { influencerId }, _sum: { commissionAmount: true } });
  const tutar = (d: string[]) => toplamlar.filter((t) => d.includes(t.commissionStatus)).reduce((a, t) => a + (t._sum.commissionAmount ?? 0), 0);
  const briefler = await getBriefs(aktifler.map((c) => c.id));
  const katildigi = new Set(katilimlar.map((k) => k.campaignId));
  // Öne çıkan kampanya: brief'i olan, katılmadığı ilk aktif kampanya; yoksa katıldığı en yeni aktif kampanya
  const one = aktifler.find((c) => briefler[c.id] && !katildigi.has(c.id)) ?? aktifler.find((c) => katildigi.has(c.id)) ?? aktifler[0] ?? null;
  const ekler = await paylasimEkleri(paylasimlar.slice(0, 5).map((p) => p.id)).catch(() => ({} as Record<string, { campaignId: string | null; adminNote: string | null }>));
  return {
    inf,
    link: takipLinki(inf.uniqueUrl),
    stats: { ayTik, ayMusteri, aySatis, toplamKazanc: tutar(["earned", "paid"]), bekleyen: tutar(["pending"]) },
    program: { esik, gecerli, oran, acik: inf.programUnlocked, yildiz },
    one: one ? { kampanya: one, brief: briefler[one.id] ?? null, katildi: katildigi.has(one.id) } : null,
    aktifSayisi: aktifler.length,
    paylasim: {
      bekleyen: paylasimlar.filter((p) => p.status === "pending").length,
      onay: paylasimlar.filter((p) => p.status === "approved").length,
      son: paylasimlar.slice(0, 3).map((p) => ({ ...p, not: ekler[p.id]?.adminNote ?? p.rejectReason ?? null })),
    },
    musteriler: inf.customers.map((c) => ({ id: c.id, ad: kisaAd(c.fullName), durum: c.status, tarih: c.createdAt })),
  };
}

export type KampanyaKart = {
  id: string; slug: string; baslik: string; aciklama: string | null; tur: string; indirim: string; komisyon: number | null;
  bitis: Date | null; gorsel: string | null; brief: KampanyaBrief | null; katildi: boolean; kod: string | null; kullanim: number; katilimci: number;
};

export async function kampanyalar(influencerId: string): Promise<KampanyaKart[]> {
  const [aktifler, katilimlar] = await Promise.all([
    prisma.campaign.findMany({ where: { status: "active" }, orderBy: { createdAt: "desc" }, include: { _count: { select: { participants: true } } } }),
    prisma.campaignParticipant.findMany({ where: { influencerId } }),
  ]);
  const briefler = await getBriefs(aktifler.map((c) => c.id));
  const kat = new Map(katilimlar.map((k) => [k.campaignId, k]));
  return aktifler.map((c) => ({
    id: c.id, slug: c.slug, baslik: c.title, aciklama: c.description, tur: c.type, indirim: indirimEtiketi(c), komisyon: c.commissionPct,
    bitis: c.endDate, gorsel: briefler[c.id]?.gorseller[0]?.url ?? c.imageUrl, brief: briefler[c.id] ?? null,
    katildi: kat.has(c.id), kod: kat.get(c.id)?.uniqueCode ?? null, kullanim: kat.get(c.id)?.usageCount ?? 0, katilimci: c._count.participants,
  }));
}
