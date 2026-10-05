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

// Beşinci düzeltme (3 Ekim, G11 – Claude kontrolü): blog yasaklı ifadeleri (tam cümle) ve vize yazısının yeniden yazımı.
// Bulunamayan cümle atlanır ve kayda yazılır; veritabanındaki &nbsp;'ler boşluk sayılarak eşleştirilir.
const FLAG_E = "DATA_FIX_2026_10_03_E";
let ranE = false;

export async function runDataFixesOnceE() {
  if (ranE) return;
  ranE = true;
  if (await prisma.setting.findUnique({ where: { key: FLAG_E } })) return;
  const fixes = (await import("@/lib/content-fixes/blog-duzeltmeleri.json")).default as { slug: string; find: string; replace: string }[];
  const vize = (await import("@/lib/content-fixes/vize-yazisi.json")).default as { slug: string; title: string; description: string; content: string; faq: { q: string; a: string }[] };
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const log: { applied: string[]; skipped: string[]; vize?: string } = { applied: [], skipped: [] };
  for (const f of fixes) {
    const post = await prisma.post.findUnique({ where: { slug: f.slug }, select: { id: true, content: true } });
    if (!post) { log.skipped.push(`${f.slug}: yazı yok`); continue; }
    const pattern = new RegExp(f.find.trim().split(/\s+/).map(esc).join("(?:\\s|&nbsp;|\\u00a0)+"));
    if (!pattern.test(post.content)) { log.skipped.push(`${f.slug}: ${f.find.slice(0, 50)}`); continue; }
    await prisma.post.update({ where: { id: post.id }, data: { content: post.content.replace(pattern, f.replace) } });
    log.applied.push(`${f.slug}: ${f.find.slice(0, 50)}`);
  }
  const post = await prisma.post.findUnique({ where: { slug: vize.slug }, select: { id: true } });
  if (post) {
    await prisma.post.update({ where: { id: post.id }, data: { title: vize.title, metaTitle: vize.title, description: vize.description, content: vize.content, faq: JSON.stringify(vize.faq) } });
    log.vize = "güncellendi";
  } else log.vize = "yazı bulunamadı";
  await prisma.setting.upsert({ where: { key: FLAG_E }, update: { value: JSON.stringify(log) }, create: { key: FLAG_E, value: JSON.stringify(log) } });
  console.log("[data-fix] 2026-10-03 E", log);
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/blog", "layout");
  } catch { /* önbellek tazeleme düzeltmeyi engellemez */ }
}

// Altıncı düzeltme (3 Ekim, G12-4 – Claude kontrolü): kalan yasaklı ifadeler (TÜRSAB, "Harem'e sıfır", 7/24, lüks/VIP).
// "field": "faq" kayıtları SSS'teki ilgili sorunun yanıtında düzeltilir. Bulunamayan cümle atlanıp kayda yazılır.
const FLAG_F = "DATA_FIX_2026_10_03_F";
let ranF = false;

export async function runDataFixesOnceF() {
  if (ranF) return;
  ranF = true;
  if (await prisma.setting.findUnique({ where: { key: FLAG_F } })) return;
  const fixes = (await import("@/lib/content-fixes/blog-duzeltmeleri-2.json")).default as { slug: string; field?: "faq"; q?: string; find: string; replace: string }[];
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const log: { applied: string[]; skipped: string[] } = { applied: [], skipped: [] };
  for (const f of fixes) {
    const post = await prisma.post.findUnique({ where: { slug: f.slug }, select: { id: true, content: true, faq: true } });
    if (!post) { log.skipped.push(`${f.slug}: yazı yok`); continue; }
    const pattern = new RegExp(f.find.trim().split(/\s+/).map(esc).join("(?:\\s|&nbsp;|\\u00a0)+"));
    if (f.field === "faq") {
      let faq: { q: string; a: string }[] = [];
      try { faq = JSON.parse(post.faq ?? "[]"); } catch { /* bozuk SSS atlanır */ }
      const item = faq.find((x) => x.q.trim() === f.q?.trim() && pattern.test(x.a)) ?? faq.find((x) => pattern.test(x.a));
      if (!item) { log.skipped.push(`${f.slug} (SSS): ${f.find.slice(0, 50)}`); continue; }
      item.a = item.a.replace(pattern, f.replace);
      await prisma.post.update({ where: { id: post.id }, data: { faq: JSON.stringify(faq) } });
    } else {
      if (!pattern.test(post.content)) { log.skipped.push(`${f.slug}: ${f.find.slice(0, 50)}`); continue; }
      await prisma.post.update({ where: { id: post.id }, data: { content: post.content.replace(pattern, f.replace) } });
    }
    log.applied.push(`${f.slug}: ${f.find.slice(0, 50)}`);
  }
  await prisma.setting.upsert({ where: { key: FLAG_F }, update: { value: JSON.stringify(log) }, create: { key: FLAG_F, value: JSON.stringify(log) } });
  console.log("[data-fix] 2026-10-03 F", log);
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/blog", "layout");
  } catch { /* önbellek tazeleme düzeltmeyi engellemez */ }
}

// Yedinci düzeltme (3 Ekim, Açıklar analizi + kullanıcı kararı):
// - Fiyatı 0 olan, şablonsuz paketler yayından kaldırılır (silinmez).
// - "Diyanet umre fiyatları" aramalarında yarışan iki yazı yayından kalkar (next.config'te ana yazıya 301).
// - Ana yazının başına /paketler bağlantılı tek paragraf eklenir.
const FLAG_G = "DATA_FIX_2026_10_03_G";
let ranG = false;
const MERGED_POSTS = ["umre-turlari-2026-bireysel-diyanet-fiyat-karsilastirma", "umre-turlari-2026-fiyat-karsilastirmalari-diyanet-bireysel-vip"];
const MAIN_PRICE_POST = "2026-umre-turlari-diyanet-bireysel-fiyatlar-vip-ipuclari";

export async function runDataFixesOnceG() {
  if (ranG) return;
  ranG = true;
  if (await prisma.setting.findUnique({ where: { key: FLAG_G } })) return;
  const { packagePreset } = await import("@/lib/pricing/package");
  const log: Record<string, unknown> = {};
  const zero = (await prisma.package.findMany({ where: { published: true, price: { lte: 0 } }, select: { id: true, slug: true } })).filter((p) => !packagePreset(p.slug));
  if (zero.length) await prisma.package.updateMany({ where: { id: { in: zero.map((p) => p.id) } }, data: { published: false } });
  log.unpublishedPackages = zero.map((p) => p.slug);
  const merged = await prisma.post.updateMany({ where: { slug: { in: MERGED_POSTS } }, data: { published: false } });
  log.unpublishedPosts = merged.count;
  const main = await prisma.post.findUnique({ where: { slug: MAIN_PRICE_POST }, select: { id: true, content: true } });
  if (main && !main.content.includes('href="/paketler"')) {
    const lead = `<p><strong>Güncel fiyatlar:</strong> Paketlerimizin kişi başı başlangıç fiyatlarını ve otel seçeneklerini <a href="/paketler">Umre Paketleri ve Fiyatları</a> sayfasında görebilirsiniz; fiyat seçtiğiniz otele ve kişi sayısına göre anında hesaplanır.</p>\n`;
    await prisma.post.update({ where: { id: main.id }, data: { content: lead + main.content } });
    log.mainPost = "bağlantı eklendi";
  } else log.mainPost = main ? "zaten var" : "yazı yok";
  await prisma.setting.upsert({ where: { key: FLAG_G }, update: { value: JSON.stringify(log) }, create: { key: FLAG_G, value: JSON.stringify(log) } });
  console.log("[data-fix] 2026-10-03 G", log);
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/blog", "layout");
    revalidatePath("/paketler", "layout");
    revalidatePath("/");
  } catch { /* önbellek tazeleme düzeltmeyi engellemez */ }
}

// Sekizinci düzeltme (6 Ekim, kullanıcı): blog kategorileri oluşturulur, yazılar konularına göre toplanır.
// Eski kategoriler silinmez; yazısı kalmayan kategori sitede zaten listelenmez.
const FLAG_H = "DATA_FIX_2026_10_06_H";
let ranH = false;

export async function runDataFixesOnceH() {
  if (ranH) return;
  ranH = true;
  if (await prisma.setting.findUnique({ where: { key: FLAG_H } })) return;
  const { BLOG_CATEGORIES, POST_CATEGORY, guessCategory } = await import("@/lib/geo-blog/categories");
  const ids: Record<string, string> = {};
  for (const c of BLOG_CATEGORIES) {
    const row = await prisma.category.upsert({ where: { slug: c.slug }, update: { name: c.name, description: c.description }, create: { slug: c.slug, name: c.name, description: c.description } });
    ids[c.slug] = row.id;
  }
  const posts = await prisma.post.findMany({ select: { id: true, slug: true, title: true } });
  const log: Record<string, string[]> = { atanan: [], tahmin: [], kategorisiz: [] };
  for (const p of posts) {
    const fixed = POST_CATEGORY[p.slug];
    const slug = fixed ?? guessCategory(p.title);
    if (!slug) { log.kategorisiz.push(p.slug); continue; }
    await prisma.post.update({ where: { id: p.id }, data: { categoryId: ids[slug] } });
    (fixed ? log.atanan : log.tahmin).push(`${p.slug} → ${slug}`);
  }
  await prisma.setting.upsert({ where: { key: FLAG_H }, update: { value: JSON.stringify(log) }, create: { key: FLAG_H, value: JSON.stringify(log) } });
  console.log("[data-fix] 2026-10-06 H", log);
  try {
    const { revalidatePath } = await import("next/cache");
    revalidatePath("/blog", "layout");
  } catch { /* önbellek tazeleme düzeltmeyi engellemez */ }
}
