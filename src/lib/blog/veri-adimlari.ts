// Blog veri adımları (19 Ekim): canlı veritabanındaki yazılara bir kez uygulanan düzeltmeler. Her adımın Setting'te işareti vardır;
// işaret varsa adım bir daha çalışmaz. Değişiklikten önce yazının hali PostVersion'a kaydedilir (admin'den geri alınabilir).
import { prisma } from "@/lib/prisma";

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

let calisti: Promise<void> | null = null;
/** Blog yazısı sayfası açılırken çağrılır; süreç başına bir kez çalışır, hata sayfayı durdurmaz. */
export function blogVeriAdimlari() {
  calisti ??= vizeYazisi().catch((e) => console.error("[blog] vize yazısı adımı", e));
  return calisti;
}
