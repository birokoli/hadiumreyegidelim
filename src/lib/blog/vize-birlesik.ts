// Birleşik umre vizesi yazısı (19 Ekim, kullanıcı: "vizeleri birleştir, güçlü bir yazı hazırla").
// Hedef: /blog/bireysel-umre-vizesi-nasil-alinir (en çok gösterim alan). Şu dört yazı buraya 301 ile yönlenir ve yayından kalkar:
// umre-vizesi-basvurusu-nasil-yapilir-2, umre-vizesi-ne-kadar-ucret, umre-vizesi-2026-ucreti-kac-tl,
// 2026-bireysel-umre-rehberi-nusuk-vize-surecleri. Nusuk rehberi ve bireysel-umre-vize-maliyet-rehberi ayrı kalır.
// Rakamlar kullanıcıdan (19 Ekim): kişi başı 140 USD = resmî vize harcı + zorunlu sağlık sigortası + başvuru hizmetimiz;
// belgeler tamamsa 2 iş saati; yalnızca vize de satılır; Ravza randevusu yalnızca umresini bizimle planlayanlar için.
// Eski yazılardaki "vize tek başına alınamaz", "45 yaş altı kadınlara mahrem şartı", "son tarih 20 Mart 2026" gibi
// çelişkili ya da eskimiş bilgiler alınmadı.

export const VIZE_BIRLESEN_SLUGLAR = [
  "umre-vizesi-basvurusu-nasil-yapilir-2",
  "umre-vizesi-ne-kadar-ucret",
  "umre-vizesi-2026-ucreti-kac-tl",
  "2026-bireysel-umre-rehberi-nusuk-vize-surecleri",
];

export const VIZE_BASLIK = "Umre Vizesi 2026: Nasıl Alınır, Ücreti ve Kaç Günde Çıkar?";
export const VIZE_ACIKLAMA =
  "Umre vizesi kişi başı 140 USD (harç, zorunlu sigorta ve hizmet dahil), belgeler tamamsa 2 iş saatinde çıkar. Belgeler, adımlar, TL hesabı ve sadece vize.";

export const VIZE_TLDR =
  "Umre vizesi Suudi Arabistan e-vizesidir. Hadi Umreye Gidelim üzerinden kişi başı 140 USD'dir; resmî vize harcı, zorunlu sağlık sigortası ve başvuru hizmetimiz dahildir. Otel rezervasyonu, gidiş-dönüş bileti, pasaport ön yüzü ve biyometrik fotoğraf tamamsa vize 2 iş saatinde PDF olarak gelir. Pasaport, giriş tarihinden itibaren en az 6 ay geçerli olmalıdır. Otelinizi ve biletinizi kendiniz ayarladıysanız yalnızca vize de alabilirsiniz.";

export const VIZE_SSS = [
  { q: "Umre vizesi ne kadar?", a: "Hadi Umreye Gidelim üzerinden umre vizesi kişi başı 140 USD'dir. Bu ücrete Suudi Arabistan'ın resmî vize harcı, zorunlu sağlık sigortası ve başvuru hizmetimiz dahildir; ayrıca sigorta almanız gerekmez." },
  { q: "Umre vizesi kaç TL?", a: "Ücret dolar cinsindendir: TL karşılığı 140 × başvuru günündeki dolar kurudur. Suudi riyali dolara sabit olduğu için (1 USD = 3,75 SAR) bu tutar yaklaşık 525 riyale denk gelir." },
  { q: "Umre vizesi kaç günde çıkar?", a: "Otel rezervasyonu, gidiş-dönüş uçak bileti, pasaport ön yüz fotoğrafı ve biyometrik fotoğraf eksiksiz ulaştığında vize 2 iş saati içinde onaylanır ve PDF olarak WhatsApp ya da e-postayla gönderilir." },
  { q: "Umre vizesi için hangi belgeler gerekir?", a: "Dört belge yeterlidir: Mekke ve Medine otel rezervasyonu, gidiş-dönüş uçak bileti, pasaportun resimli ön yüzünün net fotoğrafı ve her yolcu için birer biyometrik fotoğraf. Pasaport, giriş tarihinden itibaren en az 6 ay geçerli olmalıdır." },
  { q: "Otel ve uçak bileti almadan sadece vize alabilir miyim?", a: "Evet. Otelinizi ve biletinizi kendiniz ayarladıysanız bizden yalnızca vize alabilirsiniz. Başvuru için otel rezervasyonunuz ve gidiş-dönüş biletiniz yine gereklidir; ücret kişi başı 140 USD'dir." },
  { q: "Umre vizesi ile Suudi Arabistan'da kaç gün kalınabilir?", a: "Suudi Arabistan e-vizesi 1 yıl geçerlidir ve çok girişlidir; ülkede tek seferde en fazla 90 gün kalabilirsiniz." },
  { q: "Ravza-i Mutahhara randevusunu kim alır?", a: "Umresini otel ve transferiyle birlikte bizimle planlayan misafirlerimizin Ravza randevularını ekibimiz takip eder ve adlarına alır. Yalnızca vize alan misafirlerimiz randevuyu Nusuk uygulamasından kendileri alır." },
  { q: "Umre vizesine ne zaman başvurmalıyım?", a: "Önce tarih ve oteli, sonra uçak biletini kesinleştirin; vize en son gelir. Ramazan ve okul tatillerinde Harem'e yakın odalar erken dolduğu için seyahatten 6–8 hafta önce planlamaya başlamak iyi olur." },
];

export const VIZE_ICERIK = `<p>Umre vizesi, Suudi Arabistan'a umre için giriş yapmanızı sağlayan elektronik vizedir. Hadi Umreye Gidelim üzerinden <strong>kişi başı 140 USD</strong> ödersiniz; bu ücrete Suudi Arabistan'ın resmî vize harcı, zorunlu sağlık sigortası ve başvuru hizmetimiz dahildir. Otel rezervasyonunuz, gidiş-dönüş biletiniz, pasaportunuzun ön yüz fotoğrafı ve biyometrik fotoğrafınız eksiksiz ulaştığında vizeniz <strong>2 iş saati içinde</strong> PDF olarak gelir. Başvurmak için <a href="/umre-vizesi/basvuru">umre vizesi başvuru sayfamızı</a> kullanabilir ya da WhatsApp'tan yazabilirsiniz.</p>

<h2>Umre Vizesi Ne Kadar?</h2>
<p>Ücret kişi başı <strong>140 USD</strong>'dir. İçinde üç kalem vardır:</p>
<ul>
  <li><strong>Resmî vize harcı:</strong> Suudi Arabistan'ın e-vize için aldığı ücret.</li>
  <li><strong>Zorunlu sağlık sigortası:</strong> Vizeyle birlikte düzenlenir; ayrıca sigorta yaptırmanız gerekmez.</li>
  <li><strong>Başvuru hizmetimiz:</strong> Belgelerin kontrolü, başvurunun yapılması ve vizenin size iletilmesi.</li>
</ul>
<p>Uçak bileti, otel ve transfer bu ücrete dahil değildir. Umrenizin tamamını bizimle planlarsanız vize, teklifinizde ayrı bir kalem olarak yazılır.</p>

<h3>Umre vizesi kaç TL eder?</h3>
<p>Ücret dolar cinsinden sabittir; Türk lirası karşılığı başvuru günündeki kura göre değişir. Hesap basittir: <strong>140 × güncel dolar kuru</strong>. Suudi riyali dolara sabit olduğu için (1 USD = 3,75 SAR) aynı ücret yaklaşık <strong>525 riyale</strong> denk gelir. Bütçe yaparken vizeyi sabit bir TL rakamı olarak değil, kura bağlı bir kalem olarak düşünün.</p>
<table>
  <thead><tr><th>Kalem</th><th>Tutar</th><th>Not</th></tr></thead>
  <tbody>
    <tr><td>Umre vizesi (harç, sigorta ve hizmet dahil)</td><td>140 USD</td><td>Kişi başı</td></tr>
    <tr><td>Riyal karşılığı</td><td>≈ 525 SAR</td><td>1 USD = 3,75 SAR sabit kur</td></tr>
    <tr><td>TL karşılığı</td><td>140 × dolar kuru</td><td>Başvuru günündeki kurla</td></tr>
    <tr><td>Umre izni (Nusuk)</td><td>Ücretsiz</td><td>Nusuk uygulamasından alınır</td></tr>
  </tbody>
</table>

<h2>Umre Vizesi İçin Hangi Belgeler Gerekir?</h2>
<p>Dört belge yeterlidir. Çocuklar dahil her yolcu için aynı set hazırlanır; belgeler birlikte gönderildiğinde başvuru beklemeye girmez.</p>
<table>
  <thead><tr><th>Belge</th><th>Dikkat edilecek nokta</th></tr></thead>
  <tbody>
    <tr><td>Otel rezervasyonu</td><td>Mekke ve Medine'deki konaklama tarihlerini göstermeli</td></tr>
    <tr><td>Gidiş-dönüş uçak bileti</td><td>İsim yazımı pasaportla birebir aynı olmalı</td></tr>
    <tr><td>Pasaport ön yüz fotoğrafı</td><td>Kenarları kesilmemiş, okunaklı, parlamasız; giriş tarihinden itibaren en az 6 ay geçerli</td></tr>
    <tr><td>Biyometrik fotoğraf</td><td>Her yolcu için ayrı, beyaz fonlu ve güncel</td></tr>
  </tbody>
</table>

<h2>Umre Vizesi Nasıl Alınır? Adım Adım</h2>
<ol>
  <li><strong>Belgeleri gönderin:</strong> Otel rezervasyonu, uçak bileti, pasaport ön yüz fotoğrafı ve biyometrik fotoğrafları WhatsApp'tan ya da <a href="/umre-vizesi/basvuru">başvuru sayfasından</a> iletin.</li>
  <li><strong>Kontrol:</strong> Ekibimiz pasaportların geçerlilik süresini, isim yazımlarını ve fotoğrafları kontrol eder; eksik varsa hemen haber verir.</li>
  <li><strong>Ödeme:</strong> Kişi başı 140 USD ödenir.</li>
  <li><strong>Vize:</strong> Belgeler tamamsa vize 2 iş saati içinde onaylanır ve PDF olarak WhatsApp ya da e-postayla gönderilir. Yolculukta telefonunuzda ya da çıktı olarak yanınızda bulundurun.</li>
</ol>

<h2>Umre Vizesi Kaç Günde Çıkar, Ne Zaman Başvurmalı?</h2>
<p>Belgeler eksiksizse vize <strong>2 iş saatinde</strong> çıkar. Bu hız, işi son güne bırakmak için bir sebep değildir: darboğaz genelde vizede değil, otel ve bilettedir. Ramazan ve okul tatillerinde Harem'e yakın odalar erken dolar.</p>
<p>Doğru sıra şudur: seyahatten 6–8 hafta önce tarih ve otel, ardından uçak bileti, en son vize. Vizeyi bekleyip sonra otel aramak hem fiyatı hem Harem'e yakınlık seçeneğini daraltır. Pasaportunuzun süresi kısaysa önce onu yenileyin.</p>

<h2>Sadece Vize Alabilir miyim?</h2>
<p>Evet. Otelinizi ve uçak biletinizi kendiniz ayarladıysanız bizden yalnızca vize alabilirsiniz. Başvuru için otel rezervasyonunuz ve gidiş-dönüş biletiniz yine gereklidir; ücret aynıdır, kişi başı 140 USD. Umrenizin tamamını bizimle planlarsanız vize, otel, transfer ve Ravza randevusu tek elden yürür; bunun için <a href="/bireysel-umre">bireysel umre planlayıcısına</a> bakabilirsiniz.</p>

<h2>Vize Geçerlilik Süresi ve Kalış Şartları</h2>
<p>Suudi Arabistan e-vizesi <strong>1 yıl geçerlidir ve çok girişlidir</strong>; bu süre içinde ülkeye birden fazla kez girip çıkabilirsiniz. Ülkede tek seferde en fazla <strong>90 gün</strong> kalabilirsiniz. Vizenin geçerlilik süresi ile ülkede kalabileceğiniz süre birbirine karıştırılmamalıdır.</p>
<p>Havalimanında pasaportun son geçerlilik tarihine bakılır. Sorun yaşamamak için pasaportunuzun dönüşünüzden sonra da en az 6 ay geçerli olmasına dikkat edin.</p>

<h3>Başka bir yoldan vize alınabilir mi?</h3>
<p>Geçerli ABD, İngiltere ya da Schengen vizesi veya bu ülkelerde oturumu olanlar Suudi Arabistan'ın turist vizesini farklı koşullarla alabilir; Suudi havayollarıyla aktarmalı uçanlar için kısa süreli aktarma (stopover) vizesi de vardır. Bu seçeneklerin şartları sık değişir; başvurmadan önce güncel durumu bize sorun.</p>

<h2>Vizeden Sonra: Nusuk, Umre İzni ve Ravza Randevusu</h2>
<p>Vizeniz çıktıktan sonra Suudi Arabistan'ın resmî uygulaması <strong>Nusuk</strong>'a pasaport ve vize bilgilerinizle kaydolursunuz. Umre izni ve Ravza-i Mutahhara ziyareti için randevular bu uygulamadan alınır; umre izni ücretsizdir.</p>
<p>Umresini otel ve transferiyle birlikte bizimle planlayan misafirlerimizin Ravza randevularını ekibimiz takip eder ve adlarına alır; kadın ve erkekler için ayrılan farklı ziyaret saatleri gözetilir. Yalnızca vize alan misafirlerimiz randevuyu kendileri alır; adım adım anlatımı <a href="/blog/nusuk-uygulamasi-nasil-kullanilir">Nusuk rehberimizde</a> bulabilirsiniz. Medine'ye vardığınızda yer kalmayabildiği için randevuya erkenden bakın.</p>

<h2>Bireysel Umre Vizesi ile Grup Turu Arasındaki Fark</h2>
<p>Vize aynı vizedir; fark, etrafına kurulan yolculuktadır. Grup turunda tarih, otel ve transfer kafileye göre belirlenir. Bireysel umrede ise:</p>
<ul>
  <li><strong>Takvim sizin:</strong> Uçuşunuzu istediğiniz havayolundan, istediğiniz tarihte alırsınız; kaç gün kalacağınıza siz karar verirsiniz.</li>
  <li><strong>Otel sizin:</strong> Harem'e yürüme mesafesindeki otellerden bütçe dostu seçeneklere kadar istediğinizi seçersiniz.</li>
  <li><strong>Ulaşım sizin:</strong> Cidde'den otele ve Mekke–Medine arasında kalabalık otobüs yerine özel transfer ya da Haremeyn hızlı treni.</li>
  <li><strong>Hızlı vize:</strong> Kafile kontenjanı beklemezsiniz; belgeleriniz tamamsa vize 2 iş saatinde çıkar.</li>
</ul>
<p>Masrafların tamamını kalem kalem görmek isterseniz <a href="/blog/bireysel-umre-vize-maliyet-rehberi">bireysel umre maliyet rehberimize</a>, vize hizmetinin ayrıntıları için <a href="/umre-vizesi">umre vizesi sayfamıza</a> bakabilirsiniz.</p>`;
