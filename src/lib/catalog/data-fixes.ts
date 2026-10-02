// Tek seferlik veri düzeltmeleri (kullanıcı onayı, 2 Ekim 2026: "benden beklenenleri de sen yap").
// Katalog ilk okunduğunda bir kez çalışır; bitince Setting'e işaret yazılır, bir daha çalışmaz.
// Sonradan admin'de yapılan "Sitede göster" değişikliklerinin üzerine YAZILMAZ (yalnızca bir kez).
import { prisma } from "@/lib/prisma";
import { TRANSFER_SLUG_PREFIX } from "@/lib/catalog/transfers";
import { syncTransferList } from "@/lib/catalog/transfer-sync";

const FLAG = "DATA_FIX_2026_10_02";
let ran = false;

export async function runDataFixesOnce() {
  if (ran) return;
  ran = true;
  const done = await prisma.setting.findUnique({ where: { key: FLAG } });
  if (done) return;
  const log: Record<string, number | string> = {};

  // 1. Transfer listesi (araç × rota): canlıda yarım kalmıştı
  const t = await syncTransferList();
  log.transferCreated = t.created;
  log.transferHiddenOld = t.hiddenOld;

  // 2. Haremeyn treni (eski TRAIN kayıtları kişi başı transfer olarak aktarılmıştı) sitede görünsün
  log.trains = (await prisma.serviceLibrary.updateMany({
    where: { category: "transfer", defaultPricingType: "per_person", isActive: true, OR: [{ slug: null }, { NOT: { slug: { startsWith: TRANSFER_SLUG_PREFIX } } }] },
    data: { isPublic: true },
  })).count;

  // 3. Rehber / hoca kalemleri
  log.guides = (await prisma.serviceLibrary.updateMany({
    where: { category: { in: ["tur", "extra"] }, isActive: true, OR: [{ name: { contains: "rehber", mode: "insensitive" } }, { name: { contains: "hoca", mode: "insensitive" } }, { name: { contains: "mutavv", mode: "insensitive" } }] },
    data: { isPublic: true },
  })).count;

  // 4. Medine otelleri (şehri girilmiş olanlar)
  log.medineHotels = (await prisma.serviceLibrary.updateMany({
    where: { category: "hotel", city: "medine", isActive: true },
    data: { isPublic: true, defaultPricingType: "per_room" },
  })).count;

  // 5. Bebek beşiği kalemi yoksa eklenir. Fiyatı bilinmediği için boş: planlayıcıda "teklifte" görünür, fiyat admin'den girilir.
  const crib = await prisma.serviceLibrary.findFirst({ where: { OR: [{ name: { contains: "beşik", mode: "insensitive" } }, { name: { contains: "besik", mode: "insensitive" } }] } });
  if (!crib) {
    await prisma.serviceLibrary.create({
      data: { category: "extra", name: "Bebek beşiği (gecelik)", publicDescription: "0–2 yaş bebek için otel beşiği, gece başı", defaultPricingType: "flat", defaultCostUsd: 0, isPublic: true, isActive: true },
    });
    log.crib = "eklendi";
  } else if (!crib.isPublic) {
    await prisma.serviceLibrary.update({ where: { id: crib.id }, data: { isPublic: true } });
    log.crib = "sitede gösterildi";
  }

  // 6. Yazar: ad başındaki boşluk ve İngilizce unvanın Türkçe büyük harf bozulması
  const authors = await prisma.author.findMany({ select: { id: true, name: true, expertise: true } });
  let fixedAuthors = 0;
  for (const a of authors) {
    const data: { name?: string; expertise?: string } = {};
    if (a.name !== a.name.trim()) data.name = a.name.trim();
    if (a.expertise && /OFF[İI]CE|ED[İI]TOR|CH[İI]EF/.test(a.expertise)) data.expertise = "Türkiye Ofisi Sorumlusu ve Genel Yayın Yönetmeni";
    if (Object.keys(data).length) {
      await prisma.author.update({ where: { id: a.id }, data });
      fixedAuthors++;
    }
  }
  log.authors = fixedAuthors;

  await prisma.setting.upsert({ where: { key: FLAG }, update: { value: JSON.stringify(log) }, create: { key: FLAG, value: JSON.stringify(log) } });
  console.log("[data-fix] 2026-10-02", log);
}
