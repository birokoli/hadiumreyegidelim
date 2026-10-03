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

// İkinci düzeltme (2 Ekim, kullanıcı): Medine otelleri şimdilik gizli; Haremeyn treni eski hizmet tablosundan (TRAIN) aktarılır.
// Eski tablodaki fiyat alış fiyatıdır; kütüphanedeki diğer kalemler gibi kâr payı eklenerek satılır.
const FLAG_B = "DATA_FIX_2026_10_02_B";
let ranB = false;

export async function runDataFixesOnceB() {
  if (ranB) return;
  ranB = true;
  if (await prisma.setting.findUnique({ where: { key: FLAG_B } })) return;
  const log: Record<string, number> = {};
  log.medineHidden = (await prisma.serviceLibrary.updateMany({ where: { category: "hotel", city: "medine" }, data: { isPublic: false } })).count;

  const trains = await prisma.service.findMany({ where: { type: { in: ["TRAIN", "train"] } } });
  let created = 0;
  let shown = 0;
  for (const s of trains) {
    const existing = await prisma.serviceLibrary.findFirst({ where: { name: { equals: s.name, mode: "insensitive" } } });
    if (existing) {
      await prisma.serviceLibrary.update({ where: { id: existing.id }, data: { isPublic: true, isActive: true, category: "transfer", defaultPricingType: "per_person" } });
      shown++;
    } else {
      await prisma.serviceLibrary.create({
        data: { category: "transfer", name: s.name, publicDescription: s.description ?? null, defaultPricingType: "per_person", defaultCostUsd: s.price ?? 0, isPublic: true, isActive: true },
      });
      created++;
    }
  }
  log.trainsCreated = created;
  log.trainsShown = shown;
  await prisma.setting.upsert({ where: { key: FLAG_B }, update: { value: JSON.stringify(log) }, create: { key: FLAG_B, value: JSON.stringify(log) } });
  console.log("[data-fix] 2026-10-02 B", log);
}

// Üçüncü düzeltme (3 Ekim, kullanıcı): iletişim adresi Fatih değil Bakırköy
let ranC = false;
export async function runDataFixesOnceC() {
  if (ranC) return;
  ranC = true;
  const r = await prisma.setting.updateMany({ where: { key: "CONTACT_ADDRESS", value: { contains: "Fatih" } }, data: { value: "Bakırköy, İstanbul" } });
  if (r.count) {
    const { revalidateSiteSettings } = await import("@/lib/site-settings");
    revalidateSiteSettings();
  }
}

// Dördüncü düzeltme (3 Ekim, kullanıcı): anlaşmalı Mekke otelleri (PDF "Otel Fiyat", B2C = satış, 1–4 kişilik oda/gece, yemek hariç)
// ve 10 günlük Mekke paketleri. SAR → USD sabit kur 3,75. Hicri ay miladi ayın ortasında başlıyorsa yüksek olan alınır;
// Ramazan ve fiyatı 0 olan dönemler fiyatsız (planlayıcıda "teklifte").
const FLAG_D = "DATA_FIX_2026_10_03_D";
let ranD = false;
const SAR_USD = 3.75;
const usd = (sar: number) => Math.round((sar / SAR_USD) * 100) / 100;

const NEW_HOTELS: { slug: string; name: string; desc: string; stars: number | null; sar: Record<string, number> }[] = [
  { slug: "mehd-al-resaleh-1-2", name: "Mehd Al Resaleh 1 & 2", desc: "Harem'e ücretsiz servis", stars: null, sar: { "2026-10": 61.88, "2026-11": 61.88, "2026-12": 78.75, "2027-01": 78.75 } },
  { slug: "mehd-al-resaleh-3", name: "Mehd Al Resaleh 3", desc: "Harem'e yürüme mesafesi (yaklaşık 15 dakika)", stars: null, sar: { "2026-10": 78.75, "2026-11": 84.38, "2026-12": 112.5, "2027-01": 112.5 } },
  { slug: "holiday-inn-makkah-al-aziziah", name: "Holiday Inn Makkah Al Aziziah", desc: "Harem'e ücretsiz servis", stars: 5, sar: { "2026-10": 146.25, "2026-11": 146.25 } },
  // Alış 75 SAR + %15 = 86,25 SAR; yemek (35 SAR + %15) ayrıca, planlayıcıya eklenmedi
  { slug: "safwah-al-talayie", name: "Safwah Al Talayie", desc: "Harem'e ücretsiz servis", stars: null, sar: Object.fromEntries(["2026-10", "2026-11", "2026-12", "2027-01", "2027-04", "2027-05", "2027-06", "2027-07", "2027-08", "2027-09"].map((m) => [m, 86.25])) },
];

const PKG_INCLUDES = ["Mekke'de 9 gece konaklama", "Havalimanında karşılama", "Cidde ↔ Mekke transferleri (özel araç)", "Mekke ziyaret turu: Cebel-i Nur, Sevr, Arafat, Mina"];
const NEW_PACKAGES = [
  { slug: "10-gunluk-bireysel-umre-mekke-mehd-al-resaleh", title: "10 Günlük Bireysel Umre · Mekke · Mehd Al Resaleh", price: 349, hotel: "Mehd Al Resaleh 1 & 2 (Harem'e ücretsiz servis)", popular: true },
  { slug: "10-gunluk-bireysel-umre-mekke-mehd-al-resaleh-3", title: "10 Günlük Bireysel Umre · Mekke · Mehd Al Resaleh 3", price: 399, hotel: "Mehd Al Resaleh 3 (Harem'e yürüme mesafesi)", popular: false },
  { slug: "10-gunluk-bireysel-umre-mekke-holiday-inn", title: "10 Günlük Bireysel Umre · Mekke · Holiday Inn", price: 600, hotel: "Holiday Inn Makkah Al Aziziah, 5 yıldız (Harem'e ücretsiz servis)", popular: false },
];

export async function runDataFixesOnceD() {
  if (ranD) return;
  ranD = true;
  if (await prisma.setting.findUnique({ where: { key: FLAG_D } })) return;
  const log: Record<string, number> = { hotels: 0, prices: 0, packages: 0 };
  for (const h of NEW_HOTELS) {
    const data = { category: "hotel", name: h.name, city: "mekke", publicDescription: h.desc, hotelStars: h.stars, defaultPricingType: "per_room", defaultCostUsd: 0, isActive: true, isPublic: true };
    const row = await prisma.serviceLibrary.upsert({ where: { slug: h.slug }, update: data, create: { ...data, slug: h.slug } });
    log.hotels++;
    const months = Object.keys(h.sar);
    await prisma.servicePrice.deleteMany({ where: { serviceId: row.id, month: { in: months } } });
    await prisma.servicePrice.createMany({ data: months.map((month) => ({ serviceId: row.id, month, variant: "", salePriceUsd: usd(h.sar[month]), note: `B2C ${h.sar[month]} SAR / oda / gece` })) });
    log.prices += months.length;
  }
  for (const p of NEW_PACKAGES) {
    const description = `Yalnızca Mekke odaklı 10 günlük bireysel umre: ${p.hotel}. Fiyat kişi başıdır, en az 2 kişi. Uçak bileti ve e-vize fiyata dahil değildir; güncel kurla toplam maliyeti WhatsApp'tan iletiyoruz. Medine ziyareti dahil değildir.`;
    const data = { title: p.title, description, price: p.price, currency: "USD", duration: "10 Gün", includes: JSON.stringify(PKG_INCLUDES), isPopular: p.popular, published: true, imageUrl: "/images/hero-kabe.jpg" };
    await prisma.package.upsert({ where: { slug: p.slug }, update: data, create: { ...data, slug: p.slug, gallery: "[]" } });
    log.packages++;
  }
  await prisma.setting.upsert({ where: { key: FLAG_D }, update: { value: JSON.stringify(log) }, create: { key: FLAG_D, value: JSON.stringify(log) } });
  console.log("[data-fix] 2026-10-03 D", log);
}
