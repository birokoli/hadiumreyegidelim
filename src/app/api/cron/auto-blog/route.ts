import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max duration for Vercel

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// RapidAPI kullanarak trend kelimeleri getiren fonksiyon
async function fetchTrendingKeywords(seed: string = "umre") {
  const rapidApiKey = process.env.RAPIDAPI_KEY || 'ad6f06ba50msh1e1f35b839023acp128c19jsnbc1187c6fff0';
  const url = `https://google-keyword-insight1.p.rapidapi.com/keysuggest?keyword=${encodeURIComponent(seed)}&location=tr&lang=tr`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Host': 'google-keyword-insight1.p.rapidapi.com',
      'X-RapidAPI-Key': rapidApiKey
    }
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("RapidAPI Error:", error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    // 1. GÜVENLİK KONTROLÜ (Cron Secret)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key is missing' }, { status: 500 });
    }

    // 2. KONU SEÇİMİ (RapidAPI üzerinden)
    const existingPosts = await prisma.post.findMany({ select: { focusKeyword: true } });
    const usedKeywords = existingPosts.map(p => p.focusKeyword?.trim().toLowerCase());
    
    // Rastgele Gündem/Kategori Havuzu
    const SEED_POOL = [
      "2026 Hac sezonu bitti: Peki şimdi Umre fiyatları ne durumda?",
      "Hac yoğunluğundan hemen sonra Umreye gitmenin kimsenin bilmediği avantajları",
      "2026'da yenilenen Mescid-i Haram kuralları neleri değiştirdi?",
      "Hacılar döndükten sonra Mekke'deki ilk sakin haftayı yakalama taktikleri",
      "Ekim-Kasım 2026 Umre planı: Hava nasıl, kalabalık ne alemde?",
      "2026 Haccı sonrası Kabe'de yapılan detaylı temizlik ve yenilik çalışmaları",
      "Post-Hac döneminde uçak biletlerini ucuza getirmenin yolları",
      "Suudi Arabistan'ın 2026 sonrası güncel vize şartları ve e-vize detayları",
      "Hac sonrası otellerde dibe vuran fiyatları fırsata çevirme rehberi",
      "2026 sonbaharında Umreye gideceklerin mutlaka bilmesi gereken 5 şey",
      "Hac mevsimi çıkışı Zemzem kuyularındaki ve dağıtımındaki son durum",
      "Hac'da yorulan Mekke esnafından Umrecilere özel indirim koparma tüyoları",
      "2026 Hac vizesiyle Umre yapmanın farkı var mıydı? (Geçmişe bakış ve analiz)",
      "Hac dönemi sonrası Mekke-Medine hızlı tren (Haramain) sefer saatleri ve bilet bulma zorluğu",
      "2026 yıl sonu umresi mi, 2027 başı mı? Hangisi bütçe için daha mantıklı?",
      "Bebek arabasıyla Kabe'de tavaf yapılır mı? İşin en pratik ve güvenli yolu",
      "0-2 yaş bebekle uçak yolculuğu ve Cidde havalimanı maceraları",
      "Çocuklu aileler için Mekke'de en rahat kalınabilecek, mesafesi kısa oteller",
      "Bebekle Umre yaparken yanınıza almanız gereken K hayat kurtaran K çanta",
      "İhramlıyken bebek bezi değiştirmek: Bilinmesi gereken hassas kurallar",
      "Mekke ve Medine'de bebek maması ve bezi bulabileceğiniz büyük marketler",
      "Çocuğun Mescid-i Nebevi'de kaybolmaması için alınacak teknolojik ve pratik önlemler",
      "Bebekle Safa ve Merve arasında sa'y yapmanın en kolay saati",
      "5 yaşındaki çocuğa Umreyi ve Kabe'yi sıkmadan nasıl anlatmalıyız?",
      "Bebekli anneler için Ravza-i Mutahhara'ya giriş tüyoları",
      "Çocuklarla ziyaret edilebilecek en sıkıcı olmayan İslami müzeler",
      "Bebekle umrede sağlık: Klima çarpmasına karşı otelde ve haremde ne yapmalı?",
      "Çocuğunuzla Umre hatırası biriktirmenin en yaratıcı 3 yolu",
      "Bebekli aileler grupla mı gitmeli yoksa kendi başlarına mı takılmalı?",
      "Süt emziren anneler için Harem bölgesindeki özel alanlar nerede?",
      "Tur şirketine para vermeden baştan sona Bireysel Umre nasıl planlanır?",
      "E-Vize ile bireysel Umre yapmanın adım adım ve hatasız rehberi",
      "Booking veya Agoda'dan Kabe manzaralı ucuz otel kapatma taktikleri",
      "Cidde Havalimanından Mekke oteline en ucuz ve güvenli ulaşım (Uber, Careem vs.)",
      "Bireysel gidenler için Mekke'de günlük yeme-içme maliyeti (2026 güncel)",
      "Rehber olmadan Umre ritüelleri nasıl eksiksiz yapılır?",
      "Kendi programını yapmanın en büyük avantajı: İstediğin zaman ibadet özgürlüğü",
      "Bireysel gidenler Nusuk uygulaması üzerinden Ravza randevusunu nasıl koparır?",
      "Havalimanında fahiş fiyata sim kartı almak mı, yoksa e-SIM (Airalo) mi daha mantıklı?",
      "Kendi başına gidenler için Mekke'den Medine'ye tren bileti nasıl alınır?",
      "Şirketsiz umrenin dezavantajları: Tek başınayken başınıza gelebilecek 3 risk",
      "Bireysel bilet alırken hangi havayolları daha avantajlı Zemzem bagajı veriyor?",
      "Mekke içinde taksicilerle pazarlık etme sanatı",
      "Sırt çantasıyla minimalist Umre deneyimi: 7 günlük valizde sadece ne olmalı?",
      "Bireysel gruplar için (3-4 arkadaş) villada/apartta kalarak Umre yapma fikri",
      "Sevr Mağarası'na tırmanış: Ne zaman çıkılmalı, yanına ne alınmalı?",
      "Sadece kitaplarda kalan, turistlerin gitmediği Mekke'deki gizli köşeler",
      "Hira (Nur) Dağı'na çıkış rotasının 2026 yılındaki yeni düzenlemeleri (teleferik projesi son durum)",
      "Cennet'ül Mualla kabristanında yatan tarihi şahsiyetlerin etkileyici hikayeleri",
      "Cin Mescidi ve Şecere Mescidi'nin arkasındaki pek bilinmeyen olaylar",
      "Arafat, Müzdelife ve Mina'yı Umre döneminde bomboşken gezmenin o garip hissi",
      "Peygamberimizin (s.a.v) doğduğu evin (Mektebe) bugünkü durumu ve çevresi",
      "Akabe Biatı'nın yapıldığı o tarihi noktanın günümüzdeki hali",
      "Hudeybiye Antlaşması'nın yapıldığı yer ve orada ihrama girmenin fazileti",
      "Mekke'nin ilk mahalleleri: Dar sokaklarda bir fotoğraf ve tarih turu",
      "Kuba Mescidi'ne yürüyerek gitmek: Sünneti yaşamanın verdiği huzur (Medine bonusu)",
      "Uhud Şehitliği'nde Okçular Tepesi'nden savaşın stratejisini okumak",
      "Veda Haccı hutbesinin okunduğu nokta tam olarak neresi?",
      "Mekke Saat Kulesi'nin (Abraj Al Bait) içindeki devasa İslam müzesi turu",
      "Osmanlı döneminden kalan Ecyad Kalesi'nin hüzünlü hikayesi ve eski fotoğrafları",
      "Kabe'ye sıfır 5 yıldızlı otellerin incelemesi ve farkları",
      "Odasından Kabe izlenip Kabe imamıyla hoparlörden cemaat yapılabilen özel süitler",
      "Mekke'deki nezih restoranlar ve manevi iftar akşam yemeği deneyimleri",
      "Özel VIP transferler: GMC veya Mercedes V-Class ile efil efil Mekke-Medine yolculuğu",
      "Özel hocalar (Mürşid) eşliğinde, birebir manevi danışmanlıklı Bireysel Umre",
      "Yaşlılar ve engelliler için ekstra asistan ve VIP golf arabası hizmetleri",
      "Harem manzaralı club lounge'larda sunulan temiz ikramlar",
      "Suudi Arabistan'da kişisel şoför ve 7/24 tercüman kiralama rehberi",
      "Zemzem suyunu kargo ile eve kadar zahmetsiz getirtme yolları",
      "Medine'de Mescid-i Nebevi'ye en yakın, avluya sıfır konaklama",
      "Akıllı telefonlar için en iyi Umre rehberi ve tavaf sayacı uygulamaları",
      "Mekke'de harika fotoğraf kareleri yakalamak için 5 estetik lokasyon",
      "Umre dönüşü hediyelik ne alınır? Klasik tesbih/hurma dışında yenilikçi fikirler",
      "En iyi hurma nereden alınır? Acve, Mebrum ve Sukkari tadım rehberi",
      "Kadınlar için Umre'de pratik giyim tüyoları: Terletmeyen ferace ve şal seçimi",
      "Ayak tabanlarının su toplamaması için Harem'e özel ayakkabı/çorap önerileri",
      "Zemzem suyu Türkiye'ye gelirken bozulur mu? Şişeleme detayları",
      "Mekke'deki Albaik restoranı çılgınlığı: Gerçekten o sıraya değer mi?",
      "Umrede beslenme: Enerji düşüklüğü yaşamamak için kullanılabilecek doğal takviyeler",
      "İhram yasaklarını çiğnememek için kokusuz sabun ve şampuan markaları",
      "Gençler arasında artan Dijital Detoks Umresi akımı nedir?",
      "Yerel halk gibi takılmak: Mekke'nin ara sokaklarındaki efsane sokak lezzetleri",
      "Mescid-i Haram'da kaybolursanız yapmanız gereken 3 acil eylem planı",
      "Medine'deki hurma bahçelerinde kafa dinlemelik bir ikindi çayı molası",
      "İlk defa umreye gideceklerin en çok sorduğu 10 samimi soru",
      "2026 Hac sezonunun tamamlanmasının ardından Mekke ve Medine'deki yoğunluk durumu nasıldır?",
      "Hac dönemi bitiminde Mescid-i Haram'da yapılan genel temizlik ve düzenleme çalışmaları umrecileri nasıl etkiler?",
      "2026 Sonbahar aylarında umre yapmanın iklim ve konaklama açısından avantajları nelerdir?",
      "Hac mevsimi sonrası umre seyahatlerinde uçak bileti ve otel rezervasyonlarında maliyet avantajı sağlanabilir mi?",
      "Suudi Arabistan yetkili makamlarının 2026 Hac sonrası e-vize ve umre vizelerindeki güncel uygulamaları nelerdir?",
      "Hac dönemi sonrasında Nusuk uygulaması üzerinden Ravza-i Mutahhara randevusu almak daha mı kolaydır?",
      "Hac sonrası dönemde Mescid-i Haram çevresindeki ticari alanlarda ve alışveriş merkezlerinde durum nasıldır?",
      "Eylül - Ekim 2026 döneminde umre planlayanlar için hava durumu ve fiziksel hazırlık tavsiyeleri neler olmalıdır?",
      "Hac ibadetini tamamlayanların tecrübelerinden yola çıkarak yeni sezon umre planlaması nasıl yapılmalıdır?",
      "Hac sonrası sakinleşen Mekke'de manevi atmosferi en verimli şekilde değerlendirmenin yolları nelerdir?",
      "Bebek arabası (puset) ile Kabe'de tavaf yapmanın güncel kuralları ve kısıtlamaları nelerdir?",
      "Mescid-i Haram ve Mescid-i Nebevi çevresinde bebek bakım ve emzirme odaları hangi noktalarda bulunur?",
      "Bebekle umre seyahatine çıkacak aileler için uçak yolculuğu ve havalimanı transferlerinde dikkat edilmesi gerekenler nelerdir?",
      "İhram yasakları kapsamında bebek bakımı (alt değiştirme, ıslak mendil kullanımı) sırasında nelere dikkat edilmelidir?",
      "Mekke ve Medine'deki eczane veya marketlerde uluslararası standartlarda bebek maması ve bezi temini kolay mıdır?",
      "Bebekli aileler için Kabe'ye yürüme mesafesinde olan, asansör ve rampa erişimi kolay otel konseptleri hangileridir?",
      "Mekke'nin iklim koşullarında bebekleri güneşten, isilikten ve klima çarpmalarından koruma rehberi",
      "Bebekle umre yaparken ibadet saatlerini bebeğin uyku ve beslenme düzenine göre nasıl optimize edebilirsiniz?",
      "Mescid-i Nebevi'deki kalabalık ortamlarda çocukların güvenliği için alınabilecek pratik ve teknolojik önlemler nelerdir?",
      "Ailece yapılan umre ziyaretlerinde çocuklara manevi atmosferi yaşatırken onları bedenen yormamanın yolları nelerdir?",
      "Seyahat acentesine bağlı kalmadan, kişiye özel bağımsız bir umre programı adım adım nasıl planlanır?",
      "Bireysel umre seyahatlerinde Suudi Arabistan e-Vizesi başvuru süreci ve gerekli evraklar nelerdir?",
      "Cidde Havalimanı'ndan Mekke'deki otele ulaşımda kullanılabilecek güvenli ve ekonomik transfer seçenekleri (Haramain, Uber vb.) nelerdir?",
      "Bireysel planlamalarda Mekke ve Medine arasındaki gün dağılımı en ideal şekilde nasıl ayarlanmalıdır?",
      "Nusuk uygulaması üzerinden ibadet ve ziyaret randevularını bireysel olarak yönetmenin püf noktaları nelerdir?",
      "Bireysel giden umreciler için Mekke ve Medine'de yeme-içme bütçesi ve güvenilir restoran alternatifleri",
      "Rehber olmaksızın umre menasikini (tavaf, sa'y) eksiksiz yerine getirebilmek için hangi dijital kaynaklardan faydalanılabilir?",
      "Bireysel umre programlarında acil durum, sağlık sorunları veya iletişim ihtiyaçları için alınması gereken önlemler",
      "Bireysel seyahat edenlerin Hira ve Sevr dağları gibi tarihi mekanlara ulaşımında dikkat etmesi gereken güvenlik kuralları",
      "Esnek zamanlı umre yapmanın ibadet kalitesine ve manevi odaklanmaya sağladığı katkılar nelerdir?",
      "Diyanet İşleri Başkanlığı umre turları ile acentelerin sunduğu esnek umre paketleri arasındaki temel farklılıklar nelerdir?",
      "Belirli bir programa sadık kalmak isteyenler için grup turlarının sunduğu avantajlar nelerdir?",
      "İbadet saatlerini kendi fiziksel durumuna göre ayarlamak isteyenler için özel (esnek) paketlerin faydaları",
      "Grup turlarında sunulan rehberlik ve irşad hizmetlerinin, bireysel ibadet deneyimiyle entegrasyonu nasıl sağlanır?",
      "Diyanet turlarında yer alan standart konaklama seçeneklerine karşın, kişiselleştirilmiş programlarda otel seçimi özgürlüğü",
      "Kalabalık kafilelerle toplu hareket etmenin getirdiği fiziki zorluklar ve bunlara karşı alternatif çözümler",
      "İptal, iade veya tarih değişikliği gibi durumlarda farklı umre organizasyon türlerinin sunduğu esneklik payları",
      "Özellikle yaşlı ve yardıma muhtaç umreciler için hangi tur konsepti daha güvenilir bir altyapı sunar?",
      "Genç ve dinamik umrecilerin zamanı daha verimli kullanabilmesi için esnek programlar neden daha sık tercih ediliyor?",
      "Umre öncesi eğitim seminerlerinin manevi hazırlıktaki yeri ve bu eğitimin farklı konseptlerdeki işleniş biçimleri",
      "Ramazan ayında yapılan umrenin fazileti ve Hacca bedel olmasının manevi derinliği nedir?",
      "Mescid-i Haram'da Ramazan ayında iftar yapma adabı ve kalabalık yönetimi konusunda bilinmesi gerekenler",
      "Ramazan sıcağında oruçlu halde tavaf ve sa'y ibadetlerini sağlıklı bir şekilde yerine getirmek için zaman planlaması",
      "Mescid-i Haram'da ve Mescid-i Nebevi'de Teravih namazı süreçleri ve cemaate katılım için dikkat edilecek hususlar",
      "Ramazan umresinde artan otel ve uçak fiyatlarını bütçeye uygun hale getirebilmek için erken rezervasyon stratejileri",
      "Ramazan'ın son 10 gününde (İtikaf dönemi) Mekke ve Medine'deki yoğunluk artışına karşı alınabilecek fiziki önlemler",
      "Mekke ve Medine'deki otellerde sahur ve iftar açık büfe hizmetlerinin organizasyonu nasıldır?",
      "Ramazan ayında tavaf alanı (Mataf) kullanım kuralları ve ihramlı/ihramsız ziyaretçi ayrımı",
      "Kadir Gecesi'ni Kutsal Topraklarda ihya etmek isteyen umreciler için Mescid-i Haram'da konumlanma rehberi",
      "Medine'de Ramazan atmosferi: Yerel halkın iftar sofraları ve Mescid-i Nebevi'nin manevi iklimi",
      "Sevr Mağarası'nın İslam tarihindeki yeri ve günümüzde bu zorlu tırmanışı gerçekleştirmek isteyenlere tavsiyeler",
      "İlk vahyin indiği Hira (Nur) Dağı'na ziyaret adabı, ulaşım detayları ve bölgedeki yeni projeler",
      "Cennet'ül Mualla kabristanında medfun bulunan önemli İslam şahsiyetleri ve burayı ziyaretin kuralları",
      "Hudeybiye Antlaşması'nın yapıldığı bölgenin tarihi önemi ve burada mikat sınırına girerek ihramlanma süreci",
      "Peygamber Efendimiz'in (s.a.v.) doğduğu evin (Mektebe-i Mekke) bugünkü konumu ve ziyaret durumu",
      "Arafat, Müzdelife ve Mina bölgelerinin Hac mevsimi dışında umreciler tarafından ziyaret edilmesinin manevi boyutu",
      "Cin Mescidi ve Şecere Mescidi gibi Mekke'deki daha az bilinen tarihi mescitlerin hikayeleri",
      "Akabe Biatları'nın gerçekleştiği noktanın günümüzdeki yeri ve İslam tarihindeki dönüm noktası olarak önemi",
      "Mekke'de Osmanlı döneminden izler taşıyan mimari yapılar ve geçmişten günümüze Kabe revaklarının tarihi",
      "Mescid-i Haram sınırları içindeki önemli noktaları anlamlandırmak: İslam coğrafyasının kalbine tarihi bir bakış",
      "İslam'ın ilk mescidi olan Kuba Mescidi'nin fazileti ve cumartesi günleri burayı ziyaret etme sünneti",
      "Uhud Dağı ve Okçular Tepesi: Uhud Savaşı'nın stratejik analizi ve şehitliği ziyaret adabı",
      "Kıbleteyn (İki Kıbleli) Mescidi'nin İslam tarihindeki dönüm noktası ve günümüzdeki mimari yapısı",
      "Yedi Mescidler ve Hendek Savaşı'nın yapıldığı alanın tarihi bağlamda incelenmesi",
      "Cennet'ül Baki mezarlığının ziyaret saatleri, genel kuralları ve burada yatan sahabelerin önemi",
      "Medine'nin meşhur hurma bahçeleri: Acve hurmasının fazileti ve yerinde tadım deneyimi",
      "Mescid-i Nebevi'nin hemen yakınında bulunan Gammame (Bulut) Mescidi'nin bilinmeyen hikayesi",
      "Hicaz Demiryolu ve Medine Tren İstasyonu: Osmanlı'nın kutsal topraklara uzanan tarihi mirası",
      "Bedir Savaşı'nın gerçekleştiği alanın konumu ve Medine merkezine uzaklığı sebebiyle ziyaret lojistiği",
      "Hz. Osman (r.a.) tarafından satın alınan Rume Kuyusu'nun İslam vakıf kültüründeki yeri ve güncel durumu",
      "Mikat sınırları nedir ve ihrama girme niyetinin fıkhi gereklilikleri nelerdir?",
      "Kabe'ye ilk giriş anında okunacak dualar ve Mescid-i Haram'ı selamlama adabı",
      "Tavaf ibadetinin şartları, şavtların sayımı ve tavaf sırasında dikkat edilmesi gereken fıkhi kurallar",
      "Hacer'ül Esved'i selamlama (İstilam) usulü ve izdiham anında uzaktan selamlama hükmü",
      "Tavaf namazının önemi, Makam-ı İbrahim'in arkasında veya mescidin uygun bir yerinde eda edilmesi",
      "Safa ve Merve tepeleri arasında gerçekleştirilen Sa'y ibadetinin tarihi arka planı ve yapılış şekli",
      "Sa'y sırasında yeşil ışıklarla belirlenmiş alanda erkeklerin Hervele yapmasının sünnetteki yeri",
      "Umre ibadetini tamamlamak için saç tıraşı (Halk) veya saç kısaltma (Taksir) kuralları nelerdir?",
      "Umre menasiki boyunca okunması sünnet olan Telbiye, Tekbir ve Tehlil dualarının anlamları",
      "Sadece bedeni değil, kalbi de Kabe'ye yöneltmek: Umrenin ruhunu ve manevi boyutunu tam anlamıyla idrak etmek",
      "İhramlıyken kaçınılması gereken kişisel bakım yasakları (koku sürünmek, tırnak kesmek, tıraş olmak) nelerdir?",
      "Erkek umreciler için dikişli kıyafet giyme yasağının sınırları ve iç çamaşırı kullanımı ile ilgili fıkhi hükümler",
      "İhramlı durumdayken çevresel faktörlere (bitki koparmak, hayvanlara zarar vermek) yönelik yasaklar ve manevi hikmetleri",
      "Refes, Füsuk ve Cidal: İhramlıyken kötü söz söylemenin, tartışmanın ve günah işlemenin ibadete olumsuz etkileri",
      "Kadın umreciler için ihram kıyafeti nasıldır ve erkeklere kıyasla istisna tutulan kurallar nelerdir?",
      "İhram kurallarının bilerek veya unutarak ihlal edilmesi durumunda uygulanması gereken cezalar (Dem ve Sadaka) nelerdir?",
      "Mekke sıcağında güneşten korunmak amacıyla şemsiye kullanımı veya kemer takmak ihram yasaklarını ihlal eder mi?",
      "İhramda ayak sağlığı: İhrama uygun terlik veya ayakkabı seçimi nasıl yapılmalıdır?",
      "İhramlıyken otelde duş almanın kuralları: Kokusuz sabun kullanımı ve dökülen saçların hükmü",
      "İhram yasaklarının insan psikolojisine, sabra ve nefs terbiyesine sağladığı derin manevi katkılar",
      "Dünyanın manevi merkezi olan Kabe-i Muazzama'ya karşı bedeni ve ruhi saygının temel kuralları",
      "Mescid-i Haram içerisinde cep telefonu kullanımı, fotoğraf çekimi ve canlı yayın yapmanın ibadet adabına etkisi",
      "Tavaf esnasında diğer umrecileri itmemek, hakkına girmemek ve kul hakkı hassasiyeti",
      "Kabe'ye bakarak tefekkür etmenin ibadet sayılmasının hikmeti ve mescitte oturma adabı",
      "Mültezem, Altınoluk ve Hatim bölgesi gibi Kabe'nin faziletli noktalarında dua etmenin önemi",
      "Mescid-i Haram'da namaz kılanların önünden geçmenin hükmü ve safların düzenine riayet etmek",
      "Zemzem suyunu adabına uygun olarak, Kabe'ye yönelerek ve şifa niyetiyle içme usulü",
      "Mescid-i Haram görevlilerine, güvenlik güçlerine ve temizlik personeline karşı sergilenmesi gereken İslami nezaket",
      "Yorgunluk anlarında Mescid-i Haram içerisinde dinlenme kuralları ve kıbleye ayak uzatmama hassasiyeti",
      "Veda Tavafı umreciler için farz mıdır? Mekke'den ayrılırken Kabe'ye veda etmenin manevi hüznü",
      "Mescid-i Nebevi'de kılınan namazların diğer mescitlere göre fazilet derecesi ve sevabı",
      "Evimle minberim arası cennet bahçelerinden bir bahçedir hadisi şerifi bağlamında Ravza-i Mutahhara'nın önemi",
      "Peygamber Efendimiz (s.a.v.) ve Hz. Ebubekir ile Hz. Ömer'in kabirlerini selamlama adabı nasıl olmalıdır?",
      "Yeşil Kubbe'nin (Kubbe-i Hadra) mimari tarihi ve İslam dünyasındaki sembolik önemi",
      "Nusuk uygulaması üzerinden Ravza-i Mutahhara randevusu oluşturma adımları ve dikkat edilmesi gerekenler",
      "Mescid-i Nebevi içerisindeki tarihi sütunların (Tövbe, Aişe, Muhafızlar Sütunu vb.) anlamları ve yerleri",
      "Ashab-ı Suffa'nın Mescid-i Nebevi'deki yeri: İslam'ın ilk üniversitesi ve ilim geleneği",
      "Mekke'nin celali yapısına karşın Medine'nin cemali ve huzur veren atmosferinin manevi analizi",
      "Medine halkının misafirperverliği ve Mescid-i Nebevi avlusunda sunulan ikramların kardeşlik bağlarına etkisi",
      "Peygamber Efendimiz'in mescidinde bulunmanın getirdiği manevi sorumluluk ve edep kuralları",
      "Tavafın her bir şavtında okunması tavsiye edilen özel Arapça dualar ve bu duaların Türkçe anlamları",
      "Rukn-ü Yemani ile Hacer-ül Esved arasında sünnet olarak okunan Rabbena duasının manevi derinliği",
      "Safa ve Merve tepelerine çıkıldığında Kabe'ye yönelerek okunacak tekbir, tehlil ve tahmid duaları",
      "Arapça dua ezberlemekte zorlanan umreciler için kendi anadilinde, içtenlikle dua etmenin kabulü",
      "Makam-ı İbrahim'in arkasında kılınan tavaf namazı sonrasında yapılması tavsiye edilen şükür ve istiğfar duaları",
      "Zemzem suyu içerken Peygamber Efendimiz'in (s.a.v.) yaptığı şifa ve faydalı ilim duası",
      "Mescid-i Nebevi'de Peygamber Efendimiz'in (s.a.v.) huzurunda okunacak salat-ü selam ve tahiyyat duaları",
      "Umre yolculuğuna çıkarken, ihrama girerken ve niyet ederken okunacak standart kabul görmüş dualar",
      "Başkalarının selamlarını ve dua emanetlerini kutsal topraklarda usulüne uygun olarak teslim etmek",
      "Umre ibadeti sırasında günahların affı için yapılacak kapsamlı Seyyidül İstiğfar duasının önemi",
      "Umre seyahati öncesinde aile, akraba ve iş çevresiyle helalleşmenin ibadetin kabulündeki önemi",
      "Kutsal topraklara gitmeden önce zihni ve kalbi hazırlamak için okunması tavsiye edilen siyer ve tasavvuf kitapları",
      "Sadece bedeni bir yolculuk değil, ruhi bir arınma: Umre öncesi samimi bir tövbe ve istiğfar süreci",
      "Allah'ın misafiri olma şuurunu idrak etmek: Harem bölgelerinin kutsiyetini zihinsel olarak kabullenmek",
      "Helal kazanç hassasiyeti: Umre ibadetinin finansmanının helal yollardan sağlanmasının fıkhi ve manevi boyutu",
      "Kutsal topraklarda karşılaşılabilecek fiziksel zorluklara (kalabalık, sıcak) karşı psikolojik sabır eğitimi",
      "Umre esnasında sosyal medya ve dünyevi iletişimden uzaklaşarak (dijital detoks) ibadete odaklanmanın yolları",
      "Umre dönüşü kazanılan manevi alışkanlıkları ve temiz sayfayı günlük hayata taşıma stratejileri",
      "Tur öncesinde acenteler veya Diyanet tarafından verilen eğitim seminerlerine katılımın pratik faydaları",
      "Kabe'yi ilk defa görme heyecanını yönetmek ve o anki huşu halini ibadet boyunca muhafaza edebilmek",
      "Bağımsız umre planlaması yapacaklar için Suudi Arabistan Turist/Umre E-vizesi başvuru portalı kullanımı",
      "Herhangi bir acenteye bağlı olmaksızın Haramain Hızlı Treni üzerinden Mekke-Medine bilet rezervasyonu nasıl yapılır?",
      "Bireysel uçak bileti alımlarında bagaj hakları ve Türkiye'ye Zemzem suyu getirme prosedürleri",
      "Tursuz seyahat edenler için Mekke ve Medine'de güvenilir, uluslararası zincir oteller üzerinden rezervasyon taktikleri",
      "Rehberlik hizmeti almayan bireysel umreciler için dijital tavaf sayacı, kıble bulucu ve sesli rehber uygulamaları",
      "Tam pansiyon otel paketleri yerine, sadece oda konaklaması seçenler için yerel yeme-içme maliyet analizleri",
      "İlk kez yurt dışına çıkacak veya Arapça/İngilizce bilmeyen vatandaşlar için bireysel umrenin zorluk derecesi nedir?",
      "Beklenmedik durumlara (uçuş iptali, hastalık) karşı bireysel umre seyahat sağlık sigortasının kapsamı ve önemi",
      "Havalimanı transferleri için Suudi Arabistan'da yasal olarak faaliyet gösteren mobil taksi uygulamalarının kullanımı",
      "Aracı komisyonlarını devreden çıkararak kendi turunu hazırlamanın sunduğu toplam bütçe tasarrufu ve esneklik"
    ];
    const randomSeed = SEED_POOL[Math.floor(Math.random() * SEED_POOL.length)];
    const trendingData = await fetchTrendingKeywords(randomSeed);
    
    // Geçmiş yılları ve anlamsız kısa kelimeleri filtrele
    const currentYear = new Date().getFullYear();
    const validKeywords = trendingData.filter((item: any) => {
      if (!item || !item.text) return false;
      const t = item.text.toLowerCase();
      // 2022, 2023, 2024 vb. eski tarihleri ele ama mevcut yılı eledik
      return !t.includes("2023") && !t.includes("2024") && !t.includes("2022") && t.length > 5;
    });

    // Trend ve hacme göre sıralayıp en değerli odak kelimeyi seç (daha önce yazılmamış)
    let selectedKeyword: string | null = null;
    let clusterKeywords: string[] = []; // Aynı yazıya eklenecek yan kelimeler (zenginleştirme)

    for (const item of validKeywords) {
      if (!usedKeywords.includes(item.text.toLowerCase())) {
        selectedKeyword = item.text;
        break;
      }
    }

    if (!selectedKeyword) {
      // Eğer RapidAPI'den gelen her şeyi daha önce yazdıysak veya API çökerse default bir kelime seç:
      selectedKeyword = "umre turları " + new Date().getFullYear();
    } else {
      // O kelime yazılacak ok. Yanına LSI olarak 3 kelime daha çek
      const others = validKeywords.filter((k: any) => k.text !== selectedKeyword && !usedKeywords.includes(k.text.toLowerCase()));
      clusterKeywords = others.slice(0, 3).map((k: any) => k.text);
    }

    const keywordsString = clusterKeywords.length > 0 ? clusterKeywords.join(', ') : "bireysel umre, umre turları, hadiumreyegidelim";
    console.log("Seçilen Odak Kelime:", selectedKeyword);
    console.log("Kümelenmiş (LSI) Ek Kelimeler:", keywordsString);

    // Bütün kategorileri çek (AI'a referans için)
    const categories = await prisma.category.findMany({ select: { id: true, name: true } });
    // Bütün yazarları çek
    const authors = await prisma.author.findMany({ select: { id: true, name: true } });

    // 3. BLOG İÇERİĞİ ÜRETİMİ (Mevcut generate-blog mantığı)
    const textModel = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      tools: [{ googleSearch: {} }] as any
    });
    
    const blogPrompt = `Sen, Suudi Arabistan'da uzun yıllar yaşamış, Mekke ve Medine'nin tüm pratik detaylarına hakim, üst düzey (VIP) ve Bireysel Umre organizasyonları konusunda uzmanlaşmış kıdemli bir İslami Seyahat Editörüsün. Yazdığın içerikler "Google Faydalı İçerik (Helpful Content)" standartlarının zirvesindedir. Okuyucuya asla internette bulunabilecek sıradan, mekanik ve sığ bilgileri vermezsin; tam aksine sahada test edilmiş somut, hayat kurtaran ve vizyoner tavsiyeler sunarsın.

Odak Anahtar Kelime: "${selectedKeyword}"
Ek Anahtar Kelimeler: "${keywordsString}"
Mevcut Kategoriler: ${JSON.stringify(categories)}
Mevcut Yazarlar: ${JSON.stringify(authors)}

YASAKLI YAPAY ZEKA JARGONU VE ÜSLUP (ÇOK ÖNEMLİ!):
- ŞU KELİMELERİ ASLA KULLANMA: "Sonuç olarak", "özetlemek gerekirse", "bu makalede", "büyüleyici", "dalış yapalım", "gerçek bir mücevherdir", "unutulmamalıdır ki", "eşsiz", "hayati önem taşır", "gerekir".
- Üslup: Empatik, somut örneklere dayanan, sıcak ve sürükleyici bir dil. Örneğin "Oteller yakındır" demek yerine "Kabe'ye sıfır noktasındaki 5 yıldızlı odanızdan inip saniyeler içinde Mescid-i Haram'a geçebilirsiniz" gibi vizyoner kelimeler kullan. 

ZAMAN VE SATIŞ STRATEJİSİ: 
- CANLI İNTERNET ARAŞTIRMASI YAP: Hukuki sorumluluğumuz olduğu için Suudi Krallığı (Nusuk), Diyanet ve Haramain (Hızlı Tren) gibi kurumların güncel kurallarını Google Search ile anlık tara! Asla tahmin yürütme (hallucinate). Bilgiler %100 güncel ve hatasız olmalıdır.
- ŞU AN BULUNDUĞUMUZ YIL: ${currentYear}. Geçmiş yılları (2024, 2023 vb.) kesinlikle kullanma.
- Diyanet veya dev turların kalabalık dezavantajları yerine; "Hadi Umreye Gidelim" Bireysel Umre paketlerinin esnekliğini (istenilen gün, istenilen lüks otel) ve VIP konforunu doğal bir dille öv. Sona satışı kapatan bir CTA (Yönlendirme) ekle.

SEO VE İÇERİK MİMARİSİ (GOOGLE STANDARTLARI):
1. ANAHTAR KELİME: Odak kelimeyi ("${selectedKeyword}") ana başlıkta, meta açıklamada, ilk 100 kelimede ve bir adet H2'de doğal akışı GÖZÜNE SOKMADAN geçir.
2. OKUNABİLİRLİK: Flesch Okunabilirlik Kurallarına uy. Cümleler max 15 kelime, paragraflar max 2-3 cümle olsun. Sürekli enter'la metni böl. "Bununla birlikte, örneğin, ancak" gibi bağlaçlarla metni akıcı kıl.
3. FORMAT: En az 2 yerde (<ul><li>) ile liste yap, bolca H2/H3 alt başlığı at.
4. SSS VE KAYNAKLAR: En sona 'Sıkça Sorulan Sorular' (3 Soru) ekle. Metnin veya SSS'nin bitimine Diyanet veya Nusuk gibi sağlam sitelere 1-2 dış kaynak linki (href) ver.
5. İÇ LİNKLEME: href="https://hadiumreyegidelim.com/bireysel-umre" yapısını kullanarak sitemize iç bağlantılar at.`;

    const blogSchema: any = {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING },
        slug: { type: SchemaType.STRING },
        metaDescription: { type: SchemaType.STRING },
        keywords: { type: SchemaType.STRING },
        focusKeyword: { type: SchemaType.STRING },
        categoryId: { type: SchemaType.STRING },
        authorId: { type: SchemaType.STRING },
        content: { type: SchemaType.STRING },
        personalExperience: { type: SchemaType.STRING, description: "Bizzat yaşanmış hissi veren 2-3 cümlelik gerçek bir hikaye/deneyim olmalı. ASLA null bırakma!" },
        references: { type: SchemaType.STRING, description: "Diyanet, Nusuk, Wiki gibi 1-2 güvenilir dış kaynak bağlantısı/bilgisi taşıyan HTML veya metin listesi. MUTLAKA DOLDUR, asla null bırakma." }
      },
      required: ["title", "slug", "metaDescription", "keywords", "focusKeyword", "categoryId", "authorId", "content", "personalExperience", "references"]
    };

    const blogResult = await textModel.generateContent({
      contents: [{ role: "user", parts: [{ text: blogPrompt }] }],
      generationConfig: { temperature: 0.8, responseMimeType: "application/json", responseSchema: blogSchema }
    });

    let blogText = blogResult.response.text().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const blogData = JSON.parse(blogText);

    // 4. GÖRSEL PROMPT ÜRETİMİ (NANOBANANA & IMAGEN KURALLARI)
    const imagePromptInstruction = `ÇALIŞMA KURALLARI:
1. Başlık Analizi: Sana verilen blog metnini oku. Yazının ana başlığını ve tüm alt başlıklarını tespit et.
2. SSS İstisnası: "Sıkça Sorulan Sorular", "SSS" veya "FAQ" başlıklarını ve bu başlıkların altındaki içerikleri KESİNLİKLE YOKSAY. Bunlar için prompt üretme.
3. JSON Formatı Kuralı: Geçerli her bir başlık için aşağıdaki JSON şablonunu eksiksiz doldur. Şablonun dışına çıkma, yeni anahtar (key) ekleme veya silme. ÇIKTIYI SADECE JSON ARRAY ([{}, {}]) OLARAK VER!
4. Dil: JSON içindeki değişkenleri İngilizce olarak, profesyonel fotoğrafçılık ve 3D render terimleri kullanarak doldur.
5. Kalite: Görseller lüks, estetik ve ticari bir atmosfere sahip olmalıdır. Odak ürün/konsept üzerinde olmalı, ışıklandırma zengin olmalıdır.
6. Çıktı Düzeni: Sadece saf JSON Array formatında geri dön. Başka hiçbir şey yazma.

KULLANILACAK JSON ŞABLONU (Her başlık için bunu üret ve listeye ekle):
{
  "heading": "[Başlık Adı Türkçe Olarak - Örn: Giriş veya İhram Nedir]",
  "task": "photorealistic_product_visual",
  "input": {
    "reference_image": "USER_UPLOADED_IMAGE",
    "preserve_product_identity": true,
    "preserve_label_text": true,
    "preserve_object_shape": true,
    "preserve_centered_composition": true
  },
  "scene": {
    "environment": "[Konsepte uygun mekan, örn: minimalist marble podium in a bright studio]",
    "background": "[Arka plan detayı, örn: soft blurred botanical leaves]",
    "negative_space": "[Boşluk oranı, örn: 30% negative space at the top]",
    "depth_of_field": "[Alan derinliği, örn: shallow depth of field, bokeh]"
  },
  "subject": {
    "primary_object": "[Başlığın anlattığı konsepte uygun odak objesi/ürün]",
    "position": "[Konumlandırma, örn: perfectly centered, eye-level angle]",
    "scale": "[Ölçek, örn: close-up macro shot]",
    "clarity": "ultra-sharp, high micro-contrast"
  },
  "human_elements": {
    "details": "[Eğer başlık gerektiriyorsa 'elegant female hand holding the product', gerektirmiyorsa 'none']"
  },
  "optical_effects": {
    "details": "[Efektler, örn: subtle morning mist, veya 'none']"
  },
  "lighting": {
    "style": "[Işık stili, örn: soft studio lighting, cinematic rim light]",
    "direction": "[Işık yönü, örn: soft directional light from top left]",
    "shadows": "[Gölge karakteristiği, örn: sharp dramatic shadows veya soft diffused shadows]",
    "highlights": "[Parlama, örn: subtle specular highlights on the surface]"
  },
  "materials_rendering": {
    "product_surface": "[Materyal, örn: matte frosted glass, glossy metallic accents]",
    "reflections": "[Yansıma, örn: soft reflection on a glass base]"
  },
  "aesthetic": {
    "mood": "[Duygu, örn: luxurious, clinical, pure, dynamic]",
    "style": "high-end editorial product photography",
    "color_palette": "[Konsepte uygun renkler, örn: white, soft gold, sage green]"
  },
  "camera": {
    "lens": "[Lens, örn: 85mm macro lens, 50mm prime]",
    "aperture": "[Diyafram, örn: f/2.8, f/1.4]",
    "angle": "[Açı, örn: slight high angle, front view]"
  },
  "post_processing": {
    "retouching": "luxury commercial polish",
    "color_grading": "[Renk düzenlemesi, örn: cinematic teal and orange, clean pure whites]"
  },
  "output": {
    "resolution": "ultra_high_resolution",
    "focus_priority": "product only"
  }
}

--- BLOG METNİ ---
BAŞLIK: ${blogData.title}
İÇERİK:
${blogData.content}
`;

    const imgPromptModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const imgPromptResult = await imgPromptModel.generateContent({
      contents: [{ role: "user", parts: [{ text: imagePromptInstruction }] }],
      generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
    });

    let promptsText = imgPromptResult.response.text().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    let imagePromptsJSON = [];
    try {
      imagePromptsJSON = JSON.parse(promptsText);
    } catch(e) {
      console.error("Cron image parse error", e);
    }

    // Gerçek görsel üretimi (Imagen 3/4)
    // Import için dosya başına eklenmesi gerektiğinden, bunu fetch api ile veya lib fonksiyonu ile dinamik çağıracağız.
    // Başta import eklemediğim için require kullanıyoruz veya doğrudan API'yi çağırıyoruz. (lib/generate-image)
    const { generateAndUploadImage } = require('@/lib/generate-image');
    
    let finalImageUrl: string | null = null;
    if (imagePromptsJSON.length > 0) {
      const imagePromises = imagePromptsJSON.map(async (promptObj: any) => {
        const url = await generateAndUploadImage(promptObj, promptObj.heading || "cron-image");
        return { heading: promptObj.heading, url };
      });
      
      const results = await Promise.allSettled(imagePromises);
      
      results.forEach((res) => {
        if (res.status === 'fulfilled' && res.value && res.value.url) {
           const headingText = res.value.heading;
           const imgUrl = res.value.url;
           
           // HTML metnine resmi göm
           const index = blogData.content.toLowerCase().indexOf(`>${headingText.toLowerCase()}<`);
           if (index !== -1) {
              const insertPosition = blogData.content.indexOf('</h', index);
              if (insertPosition !== -1) {
                 const closingTagEnd = blogData.content.indexOf('>', insertPosition) + 1;
                 const before = blogData.content.substring(0, closingTagEnd);
                 const after = blogData.content.substring(closingTagEnd);
                 const imgTag = `\n<img src="${imgUrl}" alt="${headingText}" style="width:100%; max-width: 500px; margin: 30px auto; border-radius:16px; display:block; box-shadow: 0 8px 25px rgba(0,0,0,0.08);" />\n`;
                 blogData.content = before + imgTag + after;
              }
           }
           
           if (!finalImageUrl) finalImageUrl = imgUrl; // İlk başarılı görsel kapak olsun
        }
      });
    }

    // 5. VERİTABANI KAYDI
    let validCategoryId = null;
    let validAuthorId = null;
    if (blogData.categoryId) {
       const catExists = await prisma.category.findUnique({ where: { id: String(blogData.categoryId) } });
       if (catExists) validCategoryId = catExists.id;
    }
    
    if (blogData.authorId) {
       const authorExists = await prisma.author.findUnique({ where: { id: String(blogData.authorId) } });
       if (authorExists) validAuthorId = authorExists.id;
    }
    
    // Fallback: AI seçemezse veya bulamazsa Yasin Toktaş'ı (veya sistemdeki ilk yazarı) zorunlu ata
    if (!validAuthorId) {
       const defaultAuthor = await prisma.author.findFirst({ where: { name: { contains: 'Yasin' } } }) 
                             || await prisma.author.findFirst();
       if (defaultAuthor) {
          validAuthorId = defaultAuthor.id;
       }
    }

    const newPost = await prisma.post.create({
      data: {
        title: blogData.title,
        slug: blogData.slug,
        description: blogData.metaDescription,
        content: blogData.content,
        focusKeyword: selectedKeyword as string,
        keywords: Array.isArray(blogData.keywords) ? blogData.keywords.join(', ') : String(blogData.keywords || ''),
        categoryId: validCategoryId,
        authorId: validAuthorId,
        personalExperience: blogData.personalExperience,
        references: blogData.references,
        published: true, // Direkt canlıya al
        imageUrl: finalImageUrl,
      }
    });

    return NextResponse.json({ success: true, post: newPost, generatedPromptsCount: imagePromptsJSON.length });

  } catch (error: any) {
    console.error("Auto Cron Blog Error:", error);
    return NextResponse.json({ error: error.message || "Failed to run cron job" }, { status: 500 });
  }
}
