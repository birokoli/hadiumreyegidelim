// Katalog veri adımları (15 Ekim): canlı veritabanına bir kez yazılan kayıtlar. Her adımın Setting'te bir işareti vardır;
// işaret varsa adım bir daha çalışmaz. Admin sonradan fiyatı ya da oteli değiştirirse üzerine yazılmaz.
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

/**
 * Address Jabal Omar Makkah (kullanıcı, 15 Ekim): otelin Türkiye pazarı acente fiyat listesinden (SAR, oda/gece, yarım pansiyon).
 * Kurallar: hafta sonu (Perş–Cuma) fiyatı baz; 1 USD = 3,75 SAR; +%15 kâr; yukarı yuvarlama; kişi bazlı oda fiyatı (k2/k3/k4).
 * Aralık ve Ocak iki sezona bölündüğü için pahalı sezon (21 Ara–8 Oca) yazıldı. Ramazan dönemi (9 Şub–8 Mar 2027) listede yok:
 * Şubat ve Mart girilmedi. Liste 17 Nisan 2027'de biter.
 */
const SAR = 3.75;
const KAR = 1.15;
const satis = (sar: number) => Math.ceil((sar / SAR) * KAR);
const ADDRESS_SEZON: Record<string, [number, number, number]> = {
  "2026-10": [965, 1155, 1345],
  "2026-11": [1010, 1210, 1410],
  "2026-12": [1560, 1760, 1960],
  "2027-01": [1560, 1760, 1960],
  "2027-04": [890, 1070, 1250],
};

async function addressJabalOmar() {
  const ISARET = "VERI_ADIMI_ADDRESS_JABAL_OMAR_2026_10";
  if (await prisma.setting.findUnique({ where: { key: ISARET } })) return;
  const var_ = await prisma.$queryRawUnsafe<{ id: string }[]>(
    `SELECT "id" FROM "ServiceLibrary" WHERE "slug" = 'address-jabal-omar-makkah' OR ("category" = 'hotel' AND LOWER("name") LIKE '%address%jabal%omar%') LIMIT 1`,
  );
  const id = var_[0]?.id ?? `svc_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
  if (!var_[0]) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "ServiceLibrary" ("id","category","name","description","defaultPricingType","defaultCostUsd","isActive","sortOrder","isPublic","slug","city","publicDescription","hotelStars","createdAt","updatedAt")
       VALUES ($1,'hotel','Address Jabal Omar Makkah',$2,'per_room',0,true,0,true,'address-jabal-omar-makkah','mekke',$3,5,NOW(),NOW())`,
      id,
      "Otel acente fiyat listesi (Türkiye pazarı, 15 Ekim 2026). Fiyatlar yarım pansiyon; sınırlı oda için, dolunca anlık fiyat.",
      "Jabal Omar bölgesinde 5 yıldızlı otel. Fiyatlara kahvaltı ve akşam yemeği dahildir (yarım pansiyon). Giriş 16:00'dan sonra, çıkış 12:00'ye kadar.",
    );
  }
  for (const [ay, [k2, k3, k4]] of Object.entries(ADDRESS_SEZON)) {
    for (const [variant, sar] of [["k2", k2], ["k3", k3], ["k4", k4]] as const) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "ServicePrice" ("id","serviceId","month","variant","salePriceUsd","note","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())
         ON CONFLICT ("serviceId","month","variant") DO NOTHING`,
        `sp_${randomUUID().replace(/-/g, "").slice(0, 20)}`,
        id,
        ay,
        variant,
        satis(sar),
        `Otel listesi ${sar} SAR (hafta sonu), +%15`,
      );
    }
  }
  await prisma.setting.create({ data: { key: ISARET, value: new Date().toISOString() } });
  console.log("[katalog] Address Jabal Omar eklendi", id);
}

/** Şema hazırlandıktan sonra çağrılır; hata siteyi durdurmaz. */
export async function veriAdimlari() {
  await addressJabalOmar().catch((e) => console.error("[katalog] Address Jabal Omar adımı", e));
}
