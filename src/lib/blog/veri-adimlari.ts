// Blog veri adımları (19 Ekim): canlı veritabanındaki yazılara bir kez uygulanan düzeltmeler. Her adımın Setting'te işareti vardır;
// işaret varsa adım bir daha çalışmaz. Değişiklikten önce yazının hali PostVersion'a kaydedilir (admin'den geri alınabilir).
import { prisma } from "@/lib/prisma";
import * as A from "./address-yazisi";
import * as R from "./ramazan-yazisi";
import { VIZE_ACIKLAMA, VIZE_BASLIK, VIZE_BIRLESEN_SLUGLAR, VIZE_ICERIK, VIZE_SSS as BIRLESIK_SSS, VIZE_TLDR as BIRLESIK_TLDR } from "./vize-birlesik";

/**
 * Vize yazısı (kullanıcı, 19 Ekim): TL;DR ve "Yazarın Kişisel Deneyimi" kutuları eski bilgiyle kalmıştı (1–3 / 5–7 iş günü,
 * 130–180 USD) ve metinle çelişiyordu. Kullanıcının verdiği bilgiler: kişi başı 140 USD = resmî e-vize harcı + zorunlu sağlık
 * sigortası + başvuru hizmetimiz; belgeler tamamsa 2 iş saati; yalnızca vize de satılır; Ravza randevusunu yalnızca umresini
 * bizimle planlayanlara biz alırız. Doğrulanamayan "24 saat takip" ve "3–30 gün" ifadeleri çıkarıldı.
 */
const VIZE_SLUG = "bireysel-umre-vizesi-nasil-alinir";
const VIZE_TLDR =
  "Umre için Suudi Arabistan e-vizesi kullanılır. Hadi Umreye Gidelim üzerinden ücret kişi başı 140 USD'dir; resmî e-vize harcı, zorunlu sağlık sigortası ve başvuru hizmetimiz dahildir. Otel rezervasyonu, gidiş-dönüş bileti, pasaport ön yüzü ve biyometrik fotoğraf tamamsa vize 2 iş saatinde PDF olarak gelir. Pasaport, giriş tarihinden itibaren en az 6 ay geçerli olmalıdır. Otelinizi ve biletinizi kendiniz ayarladıysanız yalnızca vize de alabilirsiniz.";
const VIZE_SSS = [
  { q: "Umre vizesi başvurusu için pasaport süresi en az kaç ay olmalıdır?", a: "Suudi Arabistan'a giriş tarihinizden itibaren pasaportunuzun en az 6 ay (180 gün) geçerli olması gerekir." },
  { q: "Umre vizesi ücreti ne kadardır ve neleri kapsar?", a: "Hadi Umreye Gidelim üzerinden umre vizesi kişi başı 140 USD'dir. Bu ücrete Suudi Arabistan'ın resmî e-vize harcı, zorunlu sağlık sigortası ve başvuru hizmetimiz dahildir." },
  { q: "Belgeleri gönderdikten sonra vize kaç saatte çıkar?", a: "Otel rezervasyonu, gidiş-dönüş uçak bileti, pasaport ön yüz fotoğrafı ve biyometrik fotoğraf eksiksiz ulaştığında vizeniz 2 iş saati içinde onaylanır ve PDF olarak WhatsApp ya da e-postayla gönderilir." },
  { q: "Otel ve uçak bileti almadan sadece vize alabilir miyim?", a: "Evet. Otelinizi ve biletinizi kendiniz ayarladıysanız bizden yalnızca vize alabilirsiniz. Başvuru için otel rezervasyonunuz ve gidiş-dönüş biletiniz yine gereklidir; ücret kişi başı 140 USD'dir." },
  { q: "Elektronik umre vizesi ile Suudi Arabistan'da kaç gün kalınabilir?", a: "Suudi Arabistan e-vizesi 1 yıl geçerlidir ve çok girişlidir. Ülkede tek seferde en fazla 90 gün kalabilirsiniz." },
  { q: "Ravza-i Mutahhara randevusunu kim alır?", a: "Umresini otel ve transferiyle birlikte bizimle planlayan misafirlerimizin Ravza randevularını ekibimiz takip eder ve adlarına alır. Yalnızca vize alan misafirlerimiz randevuyu Nusuk uygulamasından kendileri alır." },
];
const VIZE_DEGISIKLIK: [string, string][] = [
  ["vizeniz <strong>2 saat içinde</strong> hazırlanarak", "vizeniz <strong>2 iş saati içinde</strong> hazırlanarak"],
  [
    "Kişi başı 140 USD olan resmî e-vize harcı ve Suudi Arabistan sağlık sigortası dahil toplam hizmet ücreti güvenli ödeme yöntemleriyle tamamlanır.",
    "Ücret kişi başı 140 USD'dir; Suudi Arabistan'ın resmî e-vize harcı, zorunlu sağlık sigortası ve başvuru hizmetimiz bu ücrete dahildir.",
  ],
  ["Suudi Arabistan resmî portalı üzerinden 2 saat içinde onaylanır", "Suudi Arabistan resmî portalı üzerinden 2 iş saati içinde onaylanır"],
  [
    "Hadi Umreye Gidelim uzman operasyon ekibimiz, vize onay belgenizin tesliminin ardından Nusuk sistemindeki yoğunluk durumunu ve açılan randevu slotlarını sizin adınıza 24 saat esasıyla takip eder. Kadın ve erkek misafirler için ayrılan farklı ziyaret saatlerine uygun biçimde Ravza randevularınız adınıza tanımlanır ve onay belgeleri tarafınıza iletilir. Bu sayede Medine-i Münevvere'ye ulaştığınızda sistemde randevu arama stresi yaşamadan doğrudan ibadetinize odaklanabilirsiniz.",
    "Umresini otel ve transferiyle birlikte Hadi Umreye Gidelim üzerinden planlayan misafirlerimizin Ravza randevularını ekibimiz takip eder ve adlarına alır; kadın ve erkekler için ayrılan farklı ziyaret saatleri gözetilir. Yalnızca vize alan misafirlerimiz randevuyu Nusuk uygulamasından kendileri alır; nasıl yapılacağını <a href=\"/blog/nusuk-uygulamasi-nasil-kullanilir\">Nusuk rehberimizde</a> adım adım anlattık.",
  ],
  ["seyahat sürenizi 3 günden 30 güne kadar serbestçe ayarlayabilirsiniz.", "seyahat sürenizi kendiniz belirleyebilirsiniz (e-vize ile ülkede tek seferde en fazla 90 gün kalınabilir)."],
  [
    "<strong>Işık Hızında Onay Süreci:</strong> Günlerce acente kontenjanı beklemek yerine evraklarınız ekibimize ulaştığı andan itibaren 2 saat içinde onaylı vizenize kavuşabilirsiniz.",
    "<strong>Hızlı Onay:</strong> Acente kontenjanı beklemezsiniz; belgeleriniz tamamsa vizeniz 2 iş saati içinde onaylanır.",
  ],
  [
    "<h2>Bireysel Umre Seyahatinizi Adım Adım Nasıl Planlamalısınız?</h2>",
    "<h2>Otel ve Uçak Bileti Olmadan Sadece Vize Alabilir Miyim?</h2>\n<p>Evet. Otelinizi ve uçak biletinizi kendiniz ayarladıysanız bizden yalnızca vize alabilirsiniz. Başvuru için otel rezervasyonunuz, gidiş-dönüş biletiniz, pasaportunuzun ön yüz fotoğrafı ve biyometrik fotoğrafınız yine gereklidir; ücret kişi başı 140 USD'dir. Başvurmak için <a href=\"/umre-vizesi/basvuru\">umre vizesi başvuru sayfamızı</a> kullanabilirsiniz. Umrenizin tamamını bizimle planlarsanız Ravza randevunuzu da biz alırız.</p>\n\n<h2>Bireysel Umre Seyahatinizi Adım Adım Nasıl Planlamalısınız?</h2>",
  ],
];

async function vizeYazisi() {
  const ISARET = "VERI_ADIMI_BLOG_VIZE_2026_10";
  if (await prisma.setting.findUnique({ where: { key: ISARET } })) return;
  const post = await prisma.post.findUnique({ where: { slug: VIZE_SLUG } });
  if (!post) return;
  let content = post.content;
  const sonuc: string[] = [];
  VIZE_DEGISIKLIK.forEach(([eski, yeni], i) => {
    const var_ = content.includes(eski);
    if (var_) content = content.replace(eski, yeni);
    sonuc.push(`${i + 1}:${var_ ? "ok" : "yok"}`);
  });
  const sonVersiyon = await prisma.postVersion.findFirst({ where: { postId: post.id }, orderBy: { version: "desc" }, select: { version: true } });
  await prisma.$transaction([
    prisma.postVersion.create({
      data: { postId: post.id, title: post.title, content: post.content, description: post.description, version: (sonVersiyon?.version ?? 0) + 1, savedBy: "veri adımı (vize düzeltmesi öncesi)" },
    }),
    prisma.post.update({ where: { id: post.id }, data: { content, tldr: VIZE_TLDR, personalExperience: null, faq: JSON.stringify(VIZE_SSS) } }),
    prisma.setting.create({ data: { key: ISARET, value: `${new Date().toISOString()} ${sonuc.join(" ")}` } }),
  ]);
  console.log("[blog] vize yazısı düzeltildi", sonuc.join(" "));
}

/** Vize yazılarının birleştirilmesi (19 Ekim, kullanıcı): ana yazı yeni içerikle güncellenir, dört yazı yayından kalkar
 * (silinmez; adresleri next.config.ts'de ana yazıya 301 ile yönlenir). Ana yazının önceki hali PostVersion'a kaydedilir. */
async function vizeBirlestir() {
  const ISARET = "VERI_ADIMI_BLOG_VIZE_BIRLESTIR_2026_10";
  if (await prisma.setting.findUnique({ where: { key: ISARET } })) return;
  const post = await prisma.post.findUnique({ where: { slug: VIZE_SLUG } });
  if (!post) return;
  const sonVersiyon = await prisma.postVersion.findFirst({ where: { postId: post.id }, orderBy: { version: "desc" }, select: { version: true } });
  const [, , kalkan] = await prisma.$transaction([
    prisma.postVersion.create({
      data: { postId: post.id, title: post.title, content: post.content, description: post.description, version: (sonVersiyon?.version ?? 0) + 1, savedBy: "veri adımı (vize yazıları birleştirilmeden önce)" },
    }),
    prisma.post.update({
      where: { id: post.id },
      data: { title: VIZE_BASLIK, metaTitle: VIZE_BASLIK, description: VIZE_ACIKLAMA, content: VIZE_ICERIK, tldr: BIRLESIK_TLDR, faq: JSON.stringify(BIRLESIK_SSS), personalExperience: null, focusKeyword: "umre vizesi" },
    }),
    prisma.post.updateMany({ where: { slug: { in: VIZE_BIRLESEN_SLUGLAR } }, data: { published: false, scheduledAt: null } }),
  ]);
  await prisma.setting.create({ data: { key: ISARET, value: `${new Date().toISOString()} yayından kalkan: ${kalkan.count}` } });
  console.log("[blog] vize yazıları birleştirildi; yayından kalkan:", kalkan.count);
}

/** Birleştirmede yayından kalkan yazılardan zamanlanmış olanlar cron'la yeniden yayına girmişti; zamanlamasıyla birlikte tekrar kaldırılır. */
async function vizeBirlestirDuzelt() {
  const ISARET = "VERI_ADIMI_BLOG_VIZE_BIRLESTIR_2_2026_10";
  if (await prisma.setting.findUnique({ where: { key: ISARET } })) return;
  const r = await prisma.post.updateMany({ where: { slug: { in: VIZE_BIRLESEN_SLUGLAR } }, data: { published: false, scheduledAt: null } });
  await prisma.setting.create({ data: { key: ISARET, value: `${new Date().toISOString()} yayından kalkan: ${r.count}` } });
}

/** Address Jabal Omar tanıtım yazısı (19 Ekim, kullanıcı): admin → Blog'a TASLAK olarak eklenir. scheduledAt boş kalır;
 * böylece zamanlanmış yayın cron'u yazıyı kendiliğinden yayına almaz. Aynı adresli yazı varsa dokunulmaz. */
async function addressTaslak() {
  const ISARET = "VERI_ADIMI_BLOG_ADDRESS_TASLAK_2026_10";
  if (await prisma.setting.findUnique({ where: { key: ISARET } })) return;
  const var_ = await prisma.post.findUnique({ where: { slug: A.ADDRESS_SLUG }, select: { id: true } });
  if (!var_) {
    const [kategori, yazar] = await Promise.all([
      prisma.category.findUnique({ where: { slug: "otel-ve-ulasim" }, select: { id: true } }),
      prisma.author.findFirst({ where: { name: { contains: "Yasin", mode: "insensitive" } }, select: { id: true, name: true } }),
    ]);
    await prisma.post.create({
      data: {
        slug: A.ADDRESS_SLUG,
        title: A.ADDRESS_BASLIK,
        metaTitle: A.ADDRESS_META_BASLIK,
        description: A.ADDRESS_ACIKLAMA,
        content: A.ADDRESS_ICERIK,
        keywords: A.ADDRESS_ANAHTAR,
        focusKeyword: A.ADDRESS_ODAK,
        imageUrl: A.ADDRESS_GORSEL,
        imageAlt: A.ADDRESS_GORSEL_ALT,
        tldr: A.ADDRESS_TLDR,
        faq: JSON.stringify(A.ADDRESS_SSS),
        references: "https://www.addresshotels.com/en/hotels/address-jabal-omar-makkah/",
        author: yazar?.name ?? "Hadi Umreye Gidelim",
        authorId: yazar?.id ?? null,
        categoryId: kategori?.id ?? null,
        published: false,
        scheduledAt: null,
      },
    });
  }
  await prisma.setting.create({ data: { key: ISARET, value: `${new Date().toISOString()} ${var_ ? "zaten vardı" : "taslak eklendi"}` } });
  console.log("[blog] Address Jabal Omar taslağı", var_ ? "zaten vardı" : "eklendi");
}

/** Ramazan 2027 yazısı (25 Ekim, kullanıcı: rezervasyon sistemini tamamlayan blog; Ramazan sayfasıyla birlikte yayına). Yayında eklenir. */
async function ramazanYazisi() {
  const ISARET = "VERI_ADIMI_BLOG_RAMAZAN_2027";
  if (await prisma.setting.findUnique({ where: { key: ISARET } })) return;
  const var_ = await prisma.post.findUnique({ where: { slug: R.RAMAZAN_YAZI_SLUG }, select: { id: true } });
  if (!var_) {
    const [kategori, yazar] = await Promise.all([
      prisma.category.findUnique({ where: { slug: "bireysel-umre" }, select: { id: true } }),
      prisma.author.findFirst({ where: { name: { contains: "Yasin", mode: "insensitive" } }, select: { id: true, name: true } }),
    ]);
    await prisma.post.create({
      data: {
        slug: R.RAMAZAN_YAZI_SLUG,
        title: R.RAMAZAN_YAZI_BASLIK,
        metaTitle: R.RAMAZAN_YAZI_META,
        description: R.RAMAZAN_YAZI_ACIKLAMA,
        content: R.RAMAZAN_YAZI_ICERIK,
        keywords: R.RAMAZAN_YAZI_ANAHTAR,
        focusKeyword: R.RAMAZAN_YAZI_ODAK,
        imageUrl: R.RAMAZAN_YAZI_GORSEL,
        imageAlt: R.RAMAZAN_YAZI_GORSEL_ALT,
        tldr: R.RAMAZAN_YAZI_TLDR,
        faq: JSON.stringify(R.RAMAZAN_YAZI_SSS),
        author: yazar?.name ?? "Hadi Umreye Gidelim",
        authorId: yazar?.id ?? null,
        categoryId: kategori?.id ?? null,
        published: true,
        scheduledAt: null,
      },
    });
  }
  await prisma.setting.create({ data: { key: ISARET, value: `${new Date().toISOString()} ${var_ ? "zaten vardı" : "yayında eklendi"}` } });
}

/**
 * Paketler giriş metni (26 Ekim): admin'de kayıtlı "tours_lead" metni "umre vizesi ayrıca alınır" diyordu; paket adları "Vize Dahil".
 * Yalnızca bu cümle değişir; metnin geri kalanı ve diğer alanlar korunur.
 */
async function paketlerVizeCumlesi() {
  const ISARET = "VERI_ADIMI_PAKETLER_VIZE_CUMLESI";
  if (await prisma.setting.findUnique({ where: { key: ISARET } })) return;
  const kayit = await prisma.setting.findUnique({ where: { key: "PAGE_TEXTS:paketler" } });
  let sonuc = "kayıt yok";
  if (kayit?.value) {
    const metinler = JSON.parse(kayit.value) as Record<string, string>;
    const eski = metinler.tours_lead ?? "";
    if (eski.includes("umre vizesi ayrıca alınır")) {
      metinler.tours_lead = eski
        .replace("Otel ve transferler paket fiyatına dahildir.", "Otel, transfer ve umre vizesi paket fiyatına dahildir.")
        .replace(/;?\s*umre vizesi ayrıca alınır\.?/, ".")
        .replace("..", ".");
      await prisma.setting.update({ where: { key: kayit.key }, data: { value: JSON.stringify(metinler) } });
      sonuc = `düzeltildi: ${metinler.tours_lead}`;
    } else sonuc = "cümle yok";
  }
  await prisma.setting.create({ data: { key: ISARET, value: `${new Date().toISOString()} ${sonuc}` } });
}

/**
 * Yasaklı "diyanetsiz" (28 Ekim): Google'da /blog/bireysel-umre-vize-maliyet-rehberi açıklaması "Diyanetsiz umreye gitmek mi
 * istiyorsunuz?" diye görünüyordu. Açıklamasında geçen bütün yazılarda yalnızca bu ifade değişir.
 */
async function diyanetsizIfadesi() {
  const ISARET = "VERI_ADIMI_BLOG_DIYANETSIZ";
  if (await prisma.setting.findUnique({ where: { key: ISARET } })) return;
  const yazilar = await prisma.post.findMany({ where: { description: { contains: "iyanetsiz", mode: "insensitive" } }, select: { id: true, slug: true, description: true } });
  for (const y of yazilar) {
    const yeni = (y.description ?? "")
      .replace(/Diyanetsiz umreye gitmek mi istiyorsunuz\?/g, "Tur olmadan, kendi tarihinizde umreye gitmek mi istiyorsunuz?")
      .replace(/diyanetsiz umre/gi, "tur olmadan umre")
      .replace(/diyanetsiz/gi, "tursuz");
    await prisma.post.update({ where: { id: y.id }, data: { description: yeni } });
  }
  await prisma.setting.create({ data: { key: ISARET, value: `${new Date().toISOString()} ${yazilar.map((y) => y.slug).join(", ") || "yok"}` } });
}

/**
 * Bireysel umre SEO programı 1. faz (28 Ekim, docs/BIREYSEL-UMRE-SEO-PROGRAMI.md):
 * - "bireysel umre fiyatları" aramasında 5. sıradaki yazının SEO başlığı aramayla eşleşsin (sayfadaki H1 değişmez).
 * - /bireysel-umre H1 ve girişi admin'den kaydedildiyse ve "bireysel" geçmiyorsa kayıt silinir, koddaki yeni varsayılan görünür.
 */
async function bireyselUmreSeo() {
  const ISARET = "VERI_ADIMI_BIREYSEL_SEO_1";
  if (await prisma.setting.findUnique({ where: { key: ISARET } })) return;
  const notlar: string[] = [];
  const yazi = await prisma.post.findUnique({ where: { slug: "bireysel-umre-vize-maliyet-rehberi" }, select: { id: true, metaTitle: true } });
  if (yazi) {
    await prisma.post.update({ where: { id: yazi.id }, data: { metaTitle: "Bireysel Umre Fiyatları 2026: Tursuz Gitmek Daha mı Ekonomik?" } });
    notlar.push(`metaTitle önceki: ${yazi.metaTitle ?? "boş"}`);
  }
  const anahtar = "PAGE_TEXTS:bireysel-umre";
  const kayit = await prisma.setting.findUnique({ where: { key: anahtar } });
  if (kayit) {
    let metin: Record<string, string> = {};
    try { metin = JSON.parse(kayit.value || "{}"); } catch { metin = {}; }
    for (const k of ["title", "lead"]) {
      if (metin[k] && !/bireysel/i.test(metin[k])) {
        notlar.push(`${k} önceki: ${metin[k]}`);
        delete metin[k];
      }
    }
    // Ayar önbelleği en geç 10 dakikada tazelenir (render sırasında revalidateTag çağrılamaz)
    await prisma.setting.update({ where: { key: anahtar }, data: { value: JSON.stringify(metin) } });
  }
  await prisma.setting.create({ data: { key: ISARET, value: `${new Date().toISOString()} ${notlar.join(" | ") || "değişiklik yok"}` } });
}

/**
 * Yasaklı ifade temizliği (28 Ekim, kullanıcı: "sitemde bu tür amatörlükler istemiyorum"): canlı site taramasında yayındaki
 * blog yazılarında VIP, lüks, eşsiz, 7/24, kesintisiz, "Harem'e sıfır" ve TÜRSAB geçti. Sıra önemlidir (özelden genele).
 * Ürün "garanti"si gibi meşru kullanımlar listede yok. Her değişen yazının önceki hali PostVersion'a kaydedilir. Adres (slug) değişmez.
 */
const YASAKLI_DEGISIM: [RegExp, string][] = [
  [/\(VIP\)\s*ve\s*/g, ""],
  [/balayı\/VIP konseptinde/g, "balayı konseptinde"],
  [/VIP transfer/g, "özel transfer"],
  [/VIP Transfer/g, "Özel Transfer"],
  [/VIP araç/g, "özel araç"],
  [/VIP otel/g, "Harem'e yakın otel"],
  [/VIP Otel/g, "Harem'e Yakın Otel"],
  [/VIP Paketler/g, "Özel Paketler"],
  [/VIP Seçenekler/g, "Özel Seçenekler"],
  [/VIP İpuçları/g, "İpuçları"],
  [/\bVIP\b/g, "özel"],
  [/Harem['’]e sıfır/g, "Harem'e çok yakın"],
  [/Kabe['’]ye sıfır/g, "Kabe'ye çok yakın"],
  [/7\/24'e yakın hizmet/g, "gün boyunca hizmet"],
  [/7\/24 /g, ""],
  [/komisyon farksız ve garantili olarak/g, "komisyon farksız"],
  [/vaktini garanti altına alan/g, "vaktini planlayan"],
  [/Kesintisiz Kabe erişimi/g, "Doğrudan Kabe erişimi"],
  [/(?<!\p{L})(kesintisiz)(?!\p{L})/gu, "sürekli"],
  [/(?<!\p{L})(Kesintisiz)(?!\p{L})/gu, "Sürekli"],
  [/eşsiz bireysel umre deneyimleri sunuyor/g, "bireysel umre planlaması sunuyor"],
  [/eşsiz bir fırsat/g, "değerli bir fırsat"],
  [/eşsiz atmosfer/g, "manevi atmosfer"],
  [/(?<!\p{L})(eşsiz)(?!\p{L})/gu, "özel"],
  [/(?<!\p{L})(Eşsiz)(?!\p{L})/gu, "Özel"],
  [/Lüks Umre Paketleri/g, "Üst Segment Umre Paketleri"],
  [/(?<!\p{L})(LÜKS)(?!\p{L})/gu, "ÜST SEGMENT"],
  [/(?<!\p{L})(Lüks)(?!\p{L})/gu, "Üst segment"],
  [/(?<!\p{L})(lüks)(?!\p{L})/gu, "üst segment"],
  [/TÜRSAB üyeliğini/g, "turizm lisansını"],
  [/TÜRSAB üyelik sorgusu/g, "Turizm lisansı sorgusu"],
  [/TÜRSAB/g, "turizm lisansı"],
];
const yasakliTemizle = (t: string) => YASAKLI_DEGISIM.reduce((s, [re, yeni]) => s.replace(re, yeni), t);

async function yasakliIfadeler() {
  const ISARET = "VERI_ADIMI_BLOG_YASAKLI_IFADE_1";
  if (await prisma.setting.findUnique({ where: { key: ISARET } })) return;
  const yazilar = await prisma.post.findMany({ select: { id: true, slug: true, title: true, metaTitle: true, description: true, content: true, tldr: true, faq: true } });
  const degisen: string[] = [];
  for (const y of yazilar) {
    const yeni = {
      title: yasakliTemizle(y.title),
      metaTitle: y.metaTitle ? yasakliTemizle(y.metaTitle) : y.metaTitle,
      description: y.description ? yasakliTemizle(y.description) : y.description,
      content: yasakliTemizle(y.content),
      tldr: y.tldr ? yasakliTemizle(y.tldr) : y.tldr,
      faq: y.faq ? yasakliTemizle(y.faq) : y.faq,
    };
    if (Object.entries(yeni).every(([k, v]) => v === (y as Record<string, unknown>)[k])) continue;
    const sonVersiyon = await prisma.postVersion.findFirst({ where: { postId: y.id }, orderBy: { version: "desc" }, select: { version: true } });
    await prisma.$transaction([
      prisma.postVersion.create({
        data: { postId: y.id, title: y.title, content: y.content, description: y.description, version: (sonVersiyon?.version ?? 0) + 1, savedBy: "veri adımı (yasaklı ifade temizliği öncesi)" },
      }),
      prisma.post.update({ where: { id: y.id }, data: yeni }),
    ]);
    degisen.push(y.slug);
  }
  await prisma.setting.create({ data: { key: ISARET, value: `${new Date().toISOString()} ${degisen.join(", ") || "yok"}` } });
  console.log("[blog] yasaklı ifade temizliği", degisen.length);
}

/**
 * Yasaklı ifade temizliği 2 (28 Ekim): ilk adım "Yazarın Kişisel Deneyimi" kutusunu (personalExperience) ve yazar
 * biyografisini kapsamıyordu; canlı taramada "VIP araçlar", "(VIP) ve" bunlardan geliyordu. Yeni eklenen kurallar
 * (7/24'e yakın, garantili) için yazı alanları da yeniden geçilir. Yazar biyografisinin önceki hali işarete yazılır.
 */
async function yasakliIfadeler2() {
  const ISARET = "VERI_ADIMI_BLOG_YASAKLI_IFADE_2";
  if (await prisma.setting.findUnique({ where: { key: ISARET } })) return;
  const yazilar = await prisma.post.findMany({ select: { id: true, slug: true, title: true, metaTitle: true, description: true, content: true, tldr: true, faq: true, personalExperience: true } });
  const degisen: string[] = [];
  for (const y of yazilar) {
    const yeni = {
      title: yasakliTemizle(y.title),
      metaTitle: y.metaTitle ? yasakliTemizle(y.metaTitle) : y.metaTitle,
      description: y.description ? yasakliTemizle(y.description) : y.description,
      content: yasakliTemizle(y.content),
      tldr: y.tldr ? yasakliTemizle(y.tldr) : y.tldr,
      faq: y.faq ? yasakliTemizle(y.faq) : y.faq,
      personalExperience: y.personalExperience ? yasakliTemizle(y.personalExperience) : y.personalExperience,
    };
    if (Object.entries(yeni).every(([k, v]) => v === (y as Record<string, unknown>)[k])) continue;
    const sonVersiyon = await prisma.postVersion.findFirst({ where: { postId: y.id }, orderBy: { version: "desc" }, select: { version: true } });
    await prisma.$transaction([
      prisma.postVersion.create({
        data: { postId: y.id, title: y.title, content: y.content, description: y.description, version: (sonVersiyon?.version ?? 0) + 1, savedBy: "veri adımı (yasaklı ifade temizliği 2 öncesi)" },
      }),
      prisma.post.update({ where: { id: y.id }, data: yeni }),
    ]);
    degisen.push(y.slug);
  }
  const yazarlar = await prisma.author.findMany({ select: { id: true, name: true, bio: true, expertise: true } });
  const yazarNot: string[] = [];
  for (const a of yazarlar) {
    const bio = a.bio ? yasakliTemizle(a.bio) : a.bio;
    const expertise = a.expertise ? yasakliTemizle(a.expertise) : a.expertise;
    if (bio === a.bio && expertise === a.expertise) continue;
    await prisma.author.update({ where: { id: a.id }, data: { bio, expertise } });
    yazarNot.push(`${a.name} önceki bio: ${a.bio ?? ""} | expertise: ${a.expertise ?? ""}`);
  }
  await prisma.setting.create({ data: { key: ISARET, value: `${new Date().toISOString()} yazılar: ${degisen.join(", ") || "yok"} || yazarlar: ${yazarNot.join(" ;; ") || "yok"}` } });
  console.log("[blog] yasaklı ifade temizliği 2", degisen.length, yazarNot.length);
}

let calisti: Promise<void> | null = null;
/** Blog yazısı sayfası açılırken çağrılır; süreç başına bir kez çalışır, hata sayfayı durdurmaz. */
export function blogVeriAdimlari() {
  calisti ??= (async () => {
    await vizeYazisi().catch((e) => console.error("[blog] vize yazısı adımı", e));
    await vizeBirlestir().catch((e) => console.error("[blog] vize birleştirme adımı", e));
    await vizeBirlestirDuzelt().catch((e) => console.error("[blog] vize birleştirme düzeltmesi", e));
    await addressTaslak().catch((e) => console.error("[blog] Address taslağı", e));
    await ramazanYazisi().catch((e) => console.error("[blog] Ramazan yazısı", e));
    await paketlerVizeCumlesi().catch((e) => console.error("[blog] paketler vize cümlesi", e));
    await diyanetsizIfadesi().catch((e) => console.error("[blog] diyanetsiz ifadesi", e));
    await bireyselUmreSeo().catch((e) => console.error("[blog] bireysel umre SEO", e));
    await yasakliIfadeler().catch((e) => console.error("[blog] yasaklı ifadeler", e));
    await yasakliIfadeler2().catch((e) => console.error("[blog] yasaklı ifadeler 2", e));
  })();
  return calisti;
}
