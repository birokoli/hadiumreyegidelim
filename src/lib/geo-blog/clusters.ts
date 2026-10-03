// Blog konu kümeleri ve satış sayfalarına ayrılmış baş aramalar (docs/BLOG-MOTORU.md, 3 Ekim 2026).
// Küme sözlüğü ve tohum konular genişletilebilir; kümesi bulunamayan aday yazılmaz.

export type Cluster = { id: string; label: string; match: RegExp; seeds: string[] };

export const CLUSTERS: Cluster[] = [
  {
    id: "vize",
    label: "Vize",
    match: /vize|e-vize|pasaport|giriş şart|biyometri/i,
    seeds: [
      "umre vizesi için pasaport kaç ay geçerli olmalı",
      "umre vizesi reddedilirse ne yapılır",
      "çocuklar için umre vizesi hangi belgelerle alınır",
      "yesil pasaporta umre vizesi gerekir mi",
      "umre e vize kaç gün geçerli verilmektedir",
      "pasaport yenileme sonrası umre vizesi aktarımı",
      "umre vizesi başvurusu yaparken fotoğraf nasıl olmalı",
      "bireysel umre vizesi kaç iş gününde çıkar",
      "aile boyu umre vizesi alırken nelere dikkat edilmeli",
      "umre vize onay belgesi çıktısı nasıl alınır",
      "çifte vatandaşlar umre vizesi alırken pasaport seçimi",
      "umre vizesi süresi uzatılabilir mi",
      "turistik e vize ile umre ibadeti yapma kuralları"
    ]
  },
  {
    id: "fiyat",
    label: "Fiyat ve bütçe",
    match: /fiyat|ücret|maliyet|bütçe|kaç tl|kaç dolar|para|harcama|ekonomik/i,
    seeds: [
      "umrede günlük harcama ne kadar olur",
      "mekke ve medinede döviz mi kart mı kullanmalı",
      "umre bütçesi nasıl planlanır",
      "bireysel umrede en büyük masraf kalemleri nelerdir",
      "mekke otel fiyatları döneme göre nasıl değişir",
      "umrede hediyelik eşya bütçesi nasıl ayarlanır",
      "medinede uygun fiyatlı yemek yerleri nerede",
      "umrede taksi ücretleri nasıl pazarlık edilir",
      "kutsal topraklarda nakit para taşıma ipuçları",
      "bireysel umre yapmak grup turlarından daha mı ekonomik",
      "umre seyahatinde beklenmedik harcamalara karşı önlem",
      "umre rezervasyonunda erken kayıt indirimi olur mu",
      "mekkede alışveriş yaparken dikkat edilmesi gerekenler"
    ]
  },
  {
    id: "konaklama",
    label: "Konaklama",
    match: /otel|konaklama|oda|harem'e yakın|kabeye yakın|kâbe'ye yakın|yürüme mesafe/i,
    seeds: [
      "mekkede otel seçerken hangi kapıya yakınlık önemli",
      "medinede otel konumu nasıl seçilir",
      "umrede otel giriş çıkış saatleri",
      "hareme servisli otellerde ulaşım ne kadar sürer",
      "mekkede servisli otel mi yürüme mesafeli otel mi",
      "medinede kadınlar kapısına yakın oteller hangileridir",
      "umre otellerinde kahvaltı ve yemek kalitesi nasıl",
      "üç kişilik veya dört kişilik umre odası rahat mı",
      "mekkede tünel üzerinden hareme ulaşan oteller",
      "medinede mescidi nebevi manzaralı otel özellikleri",
      "umre otel rezervasyonunda çocuk yatağı istenebilir mi",
      "hareme yürüme mesafesindeki otellerin avantajları",
      "mekke otellerinde asansör yoğunluğu nasıl yönetilir"
    ]
  },
  {
    id: "ulasim",
    label: "Ulaşım",
    match: /tren|haremeyn|transfer|araç|havalimanı|cidde|ulaşım|otobüs|taksi/i,
    seeds: [
      "haremeyn treni ekonomi ile business farkı",
      "cidde havalimanından mekkeye nasıl gidilir",
      "medine havalimanından otele ulaşım",
      "mekkeden medineye otobüsle gitmek kaç saat sürer",
      "haremeyn hızlı tren biletinde bagaj hakkı ne kadar",
      "cidde mekke arası özel transfer araç seçenekleri",
      "medine tren istasyonundan otellere ulaşım taksi ücretleri",
      "umrede VIP araç transferi nasıl ayarlanır",
      "mekke içi otobüs ve taksi hatları kullanım rehberi",
      "haremeyn hızlı tren bileti iptal ve değişiklik şartları",
      "gece uçuşunda cidde havalimanından mekkeye ulaşım imkanları",
      "mekkeden medineye özel şoförlü araçla seyahat",
      "umre seyahatinde toplu taşıma kartı gerekli mi"
    ]
  },
  {
    id: "ibadet",
    label: "İbadet rehberi",
    match: /ihram|tavaf|sa'y|say |mikat|tıraş|niyet|telbiye|dua|namaz|ibadet|umre nasıl yapılır|farz|vacip|sünnet/i,
    seeds: [
      "ihram yasakları nelerdir",
      "tavaf sırasında okunacak dualar",
      "umrede kadınlar için ihram kuralları",
      "uçakta ihrama girme noktası ve mikat sınırı",
      "tavaf abdesti bozulursa ne yapmak gerekir",
      "say ibadeti nasıl yapılır adımları nelerdir",
      "umre ibadetinde niyet cümlesi nasıl söylenir",
      "tıraş olmadan ihramdan çıkılır mı kurban gerekir mi",
      "macerasız kolay tavaf yapma saatleri hangileridir",
      "kabe katlarında tavaf yapmak ne kadar sürer",
      "seferilik namazı mekke ve medinede nasıl kılınır",
      "umre ibadetini bozan durumlar ve cezaları",
      "hasta veya yaşlı yerine umre vekaleti nasıl verilir"
    ]
  },
  {
    id: "ziyaret",
    label: "Mekke ve Medine ziyaret",
    match: /ziyaret|uhud|kuba|kıbleteyn|cennetül baki|ravza|müze|cebel|hira|sevr|arafat|mina|taif|gezilecek/i,
    seeds: [
      "ravza ziyareti randevusu nasıl alınır",
      "medinede ziyaret edilecek tarihi mescitler",
      "taif gezisi ne kadar sürer",
      "sevr ve hira mağarasına tırmanmak ne kadar zor",
      "uhud dağı ve okçular tepesi ziyareti",
      "cennetül baki ziyareti saatleri ve giriş kuralları",
      "kuba mescidinde namaz kılmanın fazileti",
      "arafat ve müzdelife ziyareti ne zaman yapılır",
      "mekkede peygamberimizin doğduğu ev ziyareti",
      "medinede hurma bahçesi gezisi nasıl planlanır",
      "cin mescidi ve cennetül mualla ziyareti rehberi",
      "hendek savaşı bölgesindeki yedi mescitler gezisi",
      "mekke ve medinede tarihi kuyular ve mekanlar"
    ]
  },
  {
    id: "ozel",
    label: "Özel durumlar",
    match: /bebek|çocuk|yaşlı|engelli|tekerlekli|hamile|kadın|hanım|aile|grup değil/i,
    seeds: [
      "yaşlı anne babayla umreye gitmek",
      "tekerlekli sandalyeyle tavaf nasıl yapılır",
      "çocuklarla umrede nelere dikkat edilmeli",
      "hamilelikte umre ibadeti yaparken sağlık tavsiyeleri",
      "engelli umreciler için haremde sağlanan imkanlar",
      "kronik hastalığı olanların umre yolculuk hazırlığı",
      "kadınların mahremsiz bireysel umre yapma şartları",
      "bebek pusetiyle hareme girilebilir mi",
      "kendi başına umreye gitmek isteyen kadınlara tavsiyeler",
      "tekerlekli sandalye kiralama mekke ve medine",
      "küçük çocukların ihram giymesi ve ibadet durumu",
      "solunum hastaları için mekke iklim tavsiyeleri",
      "yaşlı umreciler için en rahat otel ve ulaşım konfigürasyonu"
    ]
  },
  {
    id: "donem",
    label: "Dönem",
    match: /ramazan|sömestr|yaz|kış|ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık|hac sonrası|kalabalık|sezon/i,
    seeds: [
      "ramazanda umre yapmanın zorlukları",
      "umre için en sakin aylar hangileri",
      "sömestr tatilinde umre planlama",
      "yaz aylarında umre yaparken sıcaktan korunma yolları",
      "kış aylarında mekke ve medine hava durumu",
      "hac sonrası umre ne zaman açılır",
      "ara tatilde ailece umre seyahati hazırlığı",
      "eylül ve ekim aylarında umre iklimi nasıldır",
      "en kalabalık umre dönemleri ve yoğunluk saatleri",
      "ramazanın son on gününde umre konaklama ipuçları",
      "ilkbaharda mekke ve medine seyahat avantajları",
      "okulların kapanış döneminde umre yoğunluk durumu",
      "fırtına ve yağmur sezonunda kutsal mekan ziyareti"
    ]
  },
  {
    id: "hazirlik",
    label: "Hazırlık ve sağlık",
    match: /hazırlık|eşya|bavul|valiz|sağlık|aşı|ilaç|sıcak|ayakkabı|kıyafet|telefon|internet|sim kart|nusuk/i,
    seeds: [
      "umre çantasında neler olmalı",
      "umre öncesi gerekli aşılar",
      "suudi arabistanda hangi sim kart kullanılır",
      "umre için ayakkabı ve sandalet seçimi nasıl olmalı",
      "kutsal topraklarda pişik ve pişik önleyici kremler",
      "umre seyahatinde sürekli kullanılan ilaçların götürülmesi",
      "suudi arabistan priz tipi ve şarj dönüştürücü",
      "umre valizi hazırlama döküm listesi ve bavul sınırları",
      "suudi arabistanda internet paketi alma yöntemleri",
      "umrede güneş çarpanlara karşı alınacak önlemler",
      "kutsal topraklarda kullanılan sağlık ve acil telefonlar",
      "umre seyahati öncesi fiziksel yürüyüş egzersizleri",
      "ihram altına giyilecek dikişsiz iç çamaşırı veya örtüler"
    ]
  }
];

/** Satış sayfalarına ait baş aramalar: blog bu aramaları hedeflemez */
export const RESERVED_HEADS: { terms: string[]; page: string }[] = [
  { terms: ["umre"], page: "/" },
  { terms: ["bireysel", "umre"], page: "/bireysel-umre" },
  { terms: ["umre", "vizesi"], page: "/umre-vizesi" },
  { terms: ["umre", "fiyatları"], page: "/bireysel-umre" },
  { terms: ["mekke", "otelleri"], page: "/hizmetler" },
  { terms: ["kabeye", "yakın", "oteller"], page: "/hizmetler" },
  { terms: ["umre", "turları"], page: "/paketler" },
];

const FILLER = new Set(["2025", "2026", "2027", "ve", "ile", "için", "en", "iyi", "uygun", "fiyat", "fiyatı", "fiyatları", "ucuz", "nedir", "nasıl", "yapılır", "alınır", "türkiye", "türkiyeden", "istanbul"]);

const norm = (s: string) =>
  s.toLocaleLowerCase("tr").replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);

export function clusterOf(topic: string): Cluster | null {
  return CLUSTERS.find((c) => c.match.test(topic)) ?? null;
}

/** Konu bir baş aramanın kendisi mi (dolgu kelimeler çıkınca yalnızca o terimler kalıyor mu)? */
export function reservedHead(topic: string): string | null {
  const w = norm(topic).filter((x) => !FILLER.has(x));
  if (!w.length) return null;
  for (const r of RESERVED_HEADS) {
    if (w.every((x) => r.terms.includes(x))) return r.page;
  }
  return null;
}
