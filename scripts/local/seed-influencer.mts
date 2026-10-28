// YALNIZCA YEREL TEST (27 Ekim): marketing paneli için test influencer'ı, 3 kampanya (brief'leri 19-ajans-kampanyalari'ndan)
// ve örnek müşteri/paylaşım/tıklama. Şifre her çalıştırmada rastgele; scripts/local/.test-influencer.json'a yazılır (git'e girmez).
import { randomBytes } from "crypto";
import { writeFileSync } from "fs";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../../src/generated/prisma/index.js";

const url = process.env.DATABASE_URL ?? "";
if (!/@(127\.0\.0\.1|localhost):5432\//.test(url)) throw new Error("Güvenlik: yalnızca yerel veritabanı.");
const prisma = new PrismaClient({ datasources: { db: { url } } });

const email = "influencer-test@localhost.test";
const password = randomBytes(12).toString("base64url");
const inf = await prisma.influencer.upsert({
  where: { email },
  update: { password: await bcrypt.hash(password, 10), status: "active" },
  create: {
    fullName: "Zeynep Test", email, password: await bcrypt.hash(password, 10), phone: "+900000000000",
    instagramHandle: "zeyneptest", instagramFollowers: 24000, uniqueCode: "ZEYNEPTEST", uniqueUrl: "zeyneptest", status: "active", tier: "rehber",
  },
});

const K = "/marketing/kampanya";
const KAMPANYALAR = [
  {
    slug: "bir-oda-bir-ramazan", title: "Bir Oda, Bir Ramazan", type: "package", codeTemplate: "RAMAZAN", commissionPct: 5,
    description: "Ramazan 2027 · Safwah Al Talayie", endDate: new Date("2027-02-04"),
    brief: {
      soz: "Birlikte gelin, fiyat düşsün.",
      amac: "Ramazan umresi en çok sevdiklerle düşünülür ama oda fiyatı tek başına yüksek görünür. Oda yalnızca bir gruba ayrılır ve kişi arttıkça kişi başı fiyat düşer.",
      anaMesaj: "Ramazan’ı sevdiklerinizle Mekke’de geçirin: odanız yalnızca sizin grubunuza ayrılır, kişi arttıkça kişi başı fiyat düşer.",
      bilgiler: ["Ramazan 2027, 7 Şubat – 9 Mart; Safwah Al Talayie (Mekke)", "5 gece kişi başı: 2 kişilik oda 391,99 $, 3 kişilik 304,99 $, 4 kişilik 261,99 $", "30, 15 ve 10 gece seçenekleri de var", "Sahur ve iftar, umre vizesi, Cidde–Mekke transferi dahil", "Uçak bileti dahil değildir", "Yer anında ayrılır; ödeme 24 saat içinde"],
      yap: ["Kimlerle gitmek istediğinizi anlatın; takipçinize “siz kimle gitmek istersiniz?” diye sorun.", "Etiketleme çağrısı yapın: “Ramazan’ı birlikte geçirmek istediğiniz kişiyi etiketleyin.”"],
      yapma: ["“Yerler doluyor” demeyin; açık tarihler sitede görünür."],
      aciklamalar: [
        "Ramazan’ı kiminle geçirmek istersiniz? 🌙\n\nRamazan 2027’de Mekke’de oda yalnızca sizin grubunuza ayrılıyor; sahur ve iftar dahil. Dört kişi olursanız 5 gece kişi başı 261,99 $.\n\nKodum: {kod}\n{link}\n\nUçak bileti dahil değildir. #işbirliği",
        "Annemle Ramazan’da Mekke’de olmayı hep istedim. Siz de sevdiklerinizle gitmek isterseniz oda 2, 3 ya da 4 kişilik; kişi arttıkça fiyat düşüyor.\n\nKodum: {kod} · {link}\n#işbirliği",
      ],
      hashtagler: "#ramazanumresi #ramazan2027 #hadiumreyegidelim #işbirliği",
      gorseller: [{ url: `${K}/bir-oda-gonderi.jpg`, ad: "Gönderi 4:5", format: "gonderi" }, { url: `${K}/bir-oda-story.jpg`, ad: "Story", format: "story" }, { url: `${K}/bir-oda-etiketle.jpg`, ad: "Etiketle", format: "gonderi" }],
      takvim: "23 Kasım – 4 Şubat",
    },
  },
  {
    slug: "bir-gun-degil", title: "Bir Gün Değil", type: "all", codeTemplate: "TARIH", commissionPct: null,
    description: "Ertelenen umre niyetini bir tarihe çevirmek",
    brief: {
      soz: "Bir gün değil, bir tarih.",
      amac: "Umre çoğu insan için yıllarca ertelenen bir niyettir: “Emekli olunca”, “Çocuklar büyüyünce”. Engel çoğu zaman belirsizliktir; bireysel umrede tarihi yolcu seçer.",
      anaMesaj: "Umreyi “bir gün”e bırakmayın: takvimden gününüzü seçin, kişi başı fiyatı hemen görün.",
      bilgiler: ["Tarih ve otel yolcu tarafından seçilir; kişi başı fiyat sitede anında görünür", "Vize, otel ve transfer tek yerden", "Uçak bileti dahil değildir"],
      yap: ["Kendi “bir gün”ünüzü paylaşın: ertelediğiniz bir niyet, ya da annenizin babanızın.", "Story anketi: “Sizin bir gün’ünüz ne?”"],
      yapma: ["Kimseyi suçlamayın ya da acele ettirmeyin; davet edin."],
      aciklamalar: ["Herkesin bir “bir gün”ü var: emekli olunca, çocuklar büyüyünce… Benimki bu yıl bir tarihe dönüştü.\n\nSiz de tarihinizi seçip kişi başı fiyatı hemen görebilirsiniz.\nKodum: {kod} · {link}\n#işbirliği"],
      hashtagler: "#bireyselumre #umre #hadiumreyegidelim #işbirliği",
      gorseller: [{ url: `${K}/bir-gun-gonderi.jpg`, ad: "Gönderi 4:5", format: "gonderi" }, { url: `${K}/bir-gun-story.jpg`, ad: "Story", format: "story" }, { url: `${K}/bir-gun-yatay.jpg`, ad: "Yatay", format: "yatay" }],
      takvim: "9 – 22 Kasım",
    },
  },
  {
    slug: "yalniz-degilsiniz", title: "Yalnız Değilsiniz", type: "all", codeTemplate: "REHBER", commissionPct: null,
    description: "İlk umreye gidenler için ücretsiz kitapçıklar",
    brief: {
      soz: "Bireysel, ama yalnız değil.",
      amac: "İlk kez gidecek biri için bireysel umrenin en büyük korkusu yalnız kalmak. Ücretsiz Tavaf ve Sa’y kitapçıkları, karşılama ve WhatsApp desteği bu korkuya cevap.",
      anaMesaj: "İlk umrenize cebinizde bir rehberle gidin: kitapçıklar ücretsiz, WhatsApp’tan REHBER yazmanız yeter.",
      bilgiler: ["Tavaf ve Sa’y kitapçıkları ücretsiz", "WhatsApp’tan “REHBER” yazan kitapçıkları alır", "Cidde’de karşılama ve yol boyunca WhatsApp desteği"],
      yap: ["İlk umrenizde en çok neyi merak ettiğinizi anlatın.", "Takipçinize WhatsApp’tan REHBER yazmasını söyleyin."],
      yapma: ["Kitapçığı satış şartına bağlamayın; ücretsizdir."],
      aciklamalar: ["İlk umreniz mi? Tavaf nerede başlar, ihram nasıl giyilir… Hepsini anlatan kitapçıklar ücretsiz: WhatsApp’tan REHBER yazmanız yeter.\n\nKodum: {kod}\n#işbirliği"],
      hashtagler: "#ilkumrem #umre #hadiumreyegidelim #işbirliği",
      gorseller: [{ url: `${K}/yalniz-kitapcik.jpg`, ad: "Kitapçık", format: "gonderi" }, { url: `${K}/yalniz-story.jpg`, ad: "Story", format: "story" }, { url: `${K}/yalniz-gonderi.jpg`, ad: "Gönderi", format: "gonderi" }],
    },
  },
];

const ids: Record<string, string> = {};
for (const k of KAMPANYALAR) {
  const c = await prisma.campaign.upsert({
    where: { slug: k.slug },
    update: { status: "active", title: k.title, description: k.description, commissionPct: k.commissionPct },
    create: { slug: k.slug, title: k.title, description: k.description, type: k.type, discountType: "percent", discountValue: 0, codeTemplate: k.codeTemplate, commissionPct: k.commissionPct, status: "active", endDate: k.endDate ?? null },
  });
  ids[k.slug] = c.id;
  const value = JSON.stringify(k.brief);
  await prisma.setting.upsert({ where: { key: `KAMPANYA_BRIEF:${c.id}` }, update: { value }, create: { key: `KAMPANYA_BRIEF:${c.id}`, value } });
}

// Katılım: Bir Gün Değil kampanyasına katılmış; diğer ikisi "katılabileceklerim"de
await prisma.campaignParticipant.upsert({
  where: { campaignId_influencerId: { campaignId: ids["bir-gun-degil"], influencerId: inf.id } },
  update: {},
  create: { campaignId: ids["bir-gun-degil"], influencerId: inf.id, uniqueCode: "ZEYNEPTARIH" },
});

// Örnek müşteriler, satış, paylaşım ve tıklamalar (yalnız ilk kurulumda)
if ((await prisma.customer.count({ where: { influencerId: inf.id } })) === 0) {
  const adlar: [string, string][] = [["Ayşe Yılmaz", "in_discussion"], ["Mehmet Kaya", "contacted"], ["Fatma Demir", "paid"], ["Ali Çelik", "clicked"], ["Hatice Şahin", "clicked"]];
  for (const [ad, durum] of adlar) {
    const m = await prisma.customer.create({ data: { fullName: ad, phone: "+900000000001", influencerId: inf.id, source: "link", status: durum } });
    if (durum === "paid") await prisma.sale.create({ data: { customerId: m.id, influencerId: inf.id, umrePackage: "Bireysel umre · 7 gece", saleAmount: 48000, commissionRate: 0.03, commissionAmount: 1440, commissionStatus: "pending" } });
  }
  const p1 = await prisma.share.create({ data: { influencerId: inf.id, platform: "instagram_story", shareDate: "2026-10-24", description: "3 story’lik seri", status: "approved", approvedAt: new Date(), clickCount: 42, saleCount: 1 } });
  await prisma.share.create({ data: { influencerId: inf.id, platform: "instagram_reel", shareUrl: "https://www.instagram.com/reel/ornek", shareDate: "2026-10-26", status: "pending" } });
  await prisma.$executeRawUnsafe(`ALTER TABLE "Share" ADD COLUMN IF NOT EXISTS "campaignId" TEXT`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Share" ADD COLUMN IF NOT EXISTS "adminNote" TEXT`);
  await prisma.$executeRaw`UPDATE "Share" SET "campaignId" = ${ids["bir-gun-degil"]}, "adminNote" = ${"Çok güzel olmuş; ikinci story’de kod çok iyi okunuyor."} WHERE "id" = ${p1.id}`;
  for (let i = 0; i < 37; i++) await prisma.linkClick.create({ data: { influencerId: inf.id, clickedAt: new Date(Date.now() - i * 15 * 3600_000) } });
}

writeFileSync(new URL("./.test-influencer.json", import.meta.url), JSON.stringify({ email, password }));
console.log("test influencer hazır (bilgiler scripts/local/.test-influencer.json)");
await prisma.$disconnect();
