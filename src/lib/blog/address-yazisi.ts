// Address Jabal Omar Makkah tanıtım yazısı (19 Ekim, kullanıcı): admin'e taslak olarak eklenir, kullanıcı onayıyla yayınlanır.
// Bilgi kaynakları: otelin resmî sayfası (addresshotels.com, 19 Ekim 2026'da okundu), otelin Türkiye pazarı acente fiyat listesi
// (yarım pansiyon, giriş/çıkış saatleri, çocuk kuralı) ve katalogdaki satış fiyatları (src/lib/catalog/veri-adimlari.ts).
// Dış bağlantılar kullanıcı onaylı: src/lib/geo-blog/external-policy.ts → ONAYLI_DIS_LINKLER.

export const ADDRESS_SLUG = "address-jabal-omar-makkah-otel-rehberi";
export const ADDRESS_BASLIK = "Address Jabal Omar Makkah: Harem'e Mesafe, Odalar ve 2026 Fiyatları";
export const ADDRESS_META_BASLIK = "Address Jabal Omar Makkah: Harem'e Mesafe ve Fiyatlar";
export const ADDRESS_ACIKLAMA =
  "Address Jabal Omar Makkah Harem'e kaç dakika, hangi kule daha yakın, odalardan Kâbe görünüyor mu? Yarım pansiyon oda fiyatları, çocuk kuralı ve giriş saatleri.";
export const ADDRESS_ODAK = "address jabal omar makkah";
export const ADDRESS_ANAHTAR = "address jabal omar makkah, address jabal omar, address otel mekke, jabal omar otelleri, harem'e yakın otel mekke";
export const ADDRESS_GORSEL = "/images/oteller/address-jabal-omar-makkah/01-dis-cephe-gece.jpg";
export const ADDRESS_GORSEL_ALT = "Address Jabal Omar Makkah ve arkada Saat Kulesi, gece";

export const ADDRESS_TLDR =
  "Address Jabal Omar Makkah, Mescid-i Haram'ın yanındaki Cebel Ömer bölgesinde, iki kuleli ve 1.484 oda ile süitten oluşan 5 yıldızlı bir oteldir. 1. kuleden Harem'e doğrudan yürünür; 2. kuleden yürüyüş yoluyla yaklaşık 5–7 dakika sürer. Hadi Umreye Gidelim üzerinden kahvaltı ve akşam yemeği dahil satılır; Ekim 2026'da iki kişilik oda gecelik 296 USD'den başlar. 0–5 yaş çocuklar ücretsizdir.";

export const ADDRESS_SSS = [
  {
    q: "Address Jabal Omar Makkah Harem'e kaç dakika?",
    a: "Otelin 1. kulesinden Mescid-i Haram'a doğrudan yürünür. 2. kuleden otelin yürüyüş yolu (Address Walk Way) ile yaklaşık 5–7 dakika sürer; bu kulede servis aracı ve tekerlekli sandalyeye uygun bir güzergâh da vardır.",
  },
  {
    q: "Address Jabal Omar'da odalardan Kâbe görünür mü?",
    a: "Otelin odaları şehir manzaralı ya da Kâbe manzaralı olarak ayrılır. Manzara oda tipine ve kata göre değişir; Kâbe ya da Harem manzarası istiyorsanız teklif isterken bunu belirtin, fiyat oda tipine göre hazırlanır.",
  },
  {
    q: "Address Jabal Omar Makkah fiyatına yemek dahil mi?",
    a: "Evet. Hadi Umreye Gidelim üzerinden satılan odalar yarım pansiyondur: kahvaltı ve akşam yemeği fiyata dahildir. Yemekler otelin The Restaurant adlı restoranında verilir.",
  },
  {
    q: "Address Jabal Omar'da çocuklar ücretli mi?",
    a: "Otelin fiyat listesine göre 0–5 yaş çocuklar ücretsizdir. 6–12 yaş çocuklar için yemeklerin yarısı kadar ücret alınır.",
  },
  {
    q: "Address Jabal Omar'a giriş ve çıkış saatleri nedir?",
    a: "Odaya giriş saat 16:00'dan sonra, çıkış saat 12:00'ye kadardır. Erken giriş ve geç çıkış otelin müsaitliğine bağlıdır.",
  },
  {
    q: "Cidde havalimanından Address Jabal Omar'a ne kadar sürer?",
    a: "Otelin verdiği bilgiye göre Cidde Kral Abdülaziz Havalimanı'ndan otele karayoluyla yaklaşık 95 km vardır ve yolculuk 55–75 dakika sürer.",
  },
];

const IMG = (dosya: string, alt: string) =>
  `<figure><img src="/images/oteller/address-jabal-omar-makkah/${dosya}.jpg" alt="${alt}" loading="lazy" /><figcaption>${alt}</figcaption></figure>`;

export const ADDRESS_ICERIK = `<p><strong>Address Jabal Omar Makkah</strong>, Mekke'de Mescid-i Haram'ın hemen yanındaki Cebel Ömer (Jabal Omar) bölgesinde bulunan, iki kuleden oluşan 5 yıldızlı bir oteldir. Otelde 1.484 oda ve süit vardır. 1. kulede kalanlar Harem'e doğrudan yürür; 2. kuleden yürüyüş yoluyla yaklaşık 5–7 dakika sürer. Hadi Umreye Gidelim üzerinden kahvaltı ve akşam yemeği dahil satılır.</p>

<p>Mekke'de otel seçerken çoğu kişinin sorduğu üç soru vardır: Harem'e kaç dakika, odadan Kâbe görünüyor mu, gecesi ne kadar? Bu yazıda Address Jabal Omar için üçünün de cevabını, otelin resmî bilgileri ve bizim sattığımız güncel fiyatlarla veriyoruz.</p>

${IMG("01-dis-cephe-gece", "Address Jabal Omar Makkah ve arkada Saat Kulesi, gece")}

<h2>Address Jabal Omar Makkah Harem'e ne kadar uzak?</h2>
<p>Mesafe, hangi kulede kaldığınıza göre değişir. Otelin resmî bilgilerine göre:</p>
<ul>
<li><strong>1. kule:</strong> Misafirler Mescid-i Haram'a doğrudan yürüyerek gider.</li>
<li><strong>2. kule:</strong> Otelin yürüyüş yolu (Address Walk Way) ile Harem'e yaklaşık 5–7 dakika sürer. Bu kulede servis aracı ve tekerlekli sandalyeye uygun bir güzergâh da vardır.</li>
</ul>
<p>Günde beş vakit Harem'e gidip gelecekseniz bu fark önemlidir. Yaşlı bir yakınınızla ya da tekerlekli sandalyeyle geliyorsanız teklif isterken kule tercihinizi yazın; talebinizi otele iletiriz, kesinleşmesi otelin o günkü müsaitliğine bağlıdır.</p>

<h2>Odalardan Kâbe ya da Harem görünüyor mu?</h2>
<p>Odalar iki manzarayla ayrılır: <strong>şehir manzaralı</strong> ve <strong>Kâbe manzaralı</strong>. Bazı odalar Harem'i kısmen görür. Manzara oda tipine ve kata göre değiştiği için fiyat da buna göre farklılaşır. Teklif isterken "Harem manzaralı oda" diye belirtirseniz fiyatı o oda tipine göre hazırlarız.</p>
${IMG("05-harem-manzarasi", "Otel odasından Mescid-i Haram manzarası")}
<p>Odalarda yüksek hızlı internet, Mescid-i Haram'dan canlı yayın ve zemzem suyu bulunur. Yorgun düştüğünüz bir günde Harem'deki namazı ve hutbeyi odadan canlı izleyebilirsiniz.</p>
${IMG("03-deluxe-oda-sehir-manzarali", "Deluxe oda, iki yataklı, şehir manzaralı")}

<h2>Yemek: Yarım pansiyonda neler var?</h2>
<p>Bizim üzerimizden satılan odalarda <strong>kahvaltı ve akşam yemeği</strong> fiyata dahildir. Yemekler otelin <strong>The Restaurant</strong> adlı restoranında, canlı pişirme istasyonlarıyla verilir. Gün içinde kahve ve hafif yiyecekler için lobi kafesi (Lobby Lounge &amp; Café) vardır. Otelin hemen yanındaki çarşı katında yemek alanı da bulunur.</p>
<p>Yarım pansiyonun pratik faydası şudur: sabah namazından sonra ve akşam Harem'den döndüğünüzde yemek aramak için kalabalığa çıkmazsınız. Öğle yemeğini Harem çevresindeki lokantalarda yemek kolaydır.</p>
${IMG("07-restoran", "The Restaurant: kahvaltı ve akşam yemeği")}

<h2>Sky Musallah: Otelin üst katındaki mescit</h2>
<p>Address Jabal Omar'ın iki kulesini birleştiren köprüde, yalnızca otel misafirlerine açık bir mescit vardır: <strong>Sky Musallah</strong>. Deniz seviyesinden yaklaşık 483 metre yükseklikteki bu mescit, Guinness Dünya Rekorları'nda "bir gökköprüdeki en yüksek ibadet alanı" olarak kayıtlıdır. Buradan Kâbe ve Mescid-i Haram görünür.</p>
<p>Mescit her vakitte ezandan yaklaşık 30 dakika önce açılır ve namazdan sonra yaklaşık 30 dakika açık kalır. Harem'e inemediğiniz bir vakitte namazı Kâbe'ye bakarak kılabileceğiniz sakin bir yerdir.</p>
${IMG("08-mescit", "Otelin üst katındaki mescit")}

<h2>Address Jabal Omar Makkah fiyatları 2026–2027</h2>
<p>Aşağıdaki fiyatlar 19 Ekim 2026 itibarıyla sitemizdeki fiyatlardır. Fiyatlar <strong>oda başına, gecelik</strong>, ABD doları cinsindendir ve kahvaltı ile akşam yemeği dahildir.</p>
<table>
<thead><tr><th>Dönem</th><th>2 kişilik oda</th><th>3 kişilik oda</th><th>4 kişilik oda</th></tr></thead>
<tbody>
<tr><td>Ekim 2026</td><td>296 USD</td><td>355 USD</td><td>413 USD</td></tr>
<tr><td>Kasım 2026</td><td>310 USD</td><td>372 USD</td><td>433 USD</td></tr>
<tr><td>Aralık 2026</td><td>479 USD</td><td>540 USD</td><td>602 USD</td></tr>
<tr><td>Ocak 2027</td><td>479 USD</td><td>540 USD</td><td>602 USD</td></tr>
<tr><td>Nisan 2027</td><td>273 USD</td><td>329 USD</td><td>384 USD</td></tr>
</tbody>
</table>
<p>Örnek: Ekim ayında 4 kişilik odada kişi başı gecelik maliyet yaklaşık 103 USD'dir. Aralık ve Ocak'ta yılbaşı ve okul tatili dönemi nedeniyle fiyatlar yükselir. Şubat ve Mart 2027 (Ramazan dönemi) için şu an satış yapmıyoruz.</p>
<p>Oda sayısı sınırlıdır; oda dolduğunda fiyat otelin o günkü fiyatına göre değişir. Kesin tutar, tarihlerinize ve kişi sayınıza göre hazırladığımız teklifte netleşir. Güncel fiyatı <a href="/oteller/address-jabal-omar-makkah">Address Jabal Omar otel sayfamızda</a> görebilirsiniz.</p>

<h2>Çocuklar, giriş ve çıkış saatleri</h2>
<ul>
<li><strong>0–5 yaş çocuklar:</strong> Ücretsiz.</li>
<li><strong>6–12 yaş çocuklar:</strong> Yemeklerin yarısı kadar ücret alınır.</li>
<li><strong>Odaya giriş:</strong> Saat 16:00'dan sonra.</li>
<li><strong>Odadan çıkış:</strong> Saat 12:00'ye kadar.</li>
</ul>
<p>Erken giriş ve geç çıkış otelin müsaitliğine bağlıdır. Uçağınız sabah iniyorsa umrenizi yapıp odaya öğleden sonra yerleşecek şekilde plan yapmak en rahatıdır.</p>

<h2>Cidde havalimanından otele nasıl gidilir?</h2>
<p>Otelin verdiği bilgiye göre Cidde Kral Abdülaziz Havalimanı'ndan otele karayoluyla yaklaşık 95 km vardır ve yolculuk trafiğe göre 55–75 dakika sürer. İhramlı ve yorgun varacağınız için sizi havalimanında karşılayıp otelin kapısına bırakan bir <a href="/hizmetler">transfer</a> ayarlamak işinizi kolaylaştırır.</p>

<h2>Address Jabal Omar kimler için uygun?</h2>
<p><strong>Uygun olduğu durumlar:</strong></p>
<ul>
<li>Harem'e yürüyerek gidip gelmek, vakitler arasında otele dönüp dinlenmek isteyenler.</li>
<li>Kahvaltı ve akşam yemeğini otelde çözmek isteyen aileler; 4 kişilik odada kişi başı maliyet düşer.</li>
<li>Odadan Harem'i görmek ya da namazı Sky Musallah'ta Kâbe'ye bakarak kılmak isteyenler.</li>
</ul>
<p><strong>Başka bir otel düşünebileceğiniz durumlar:</strong></p>
<ul>
<li>Bütçeniz Aralık–Ocak fiyatlarına uygun değilse Kasım ya da Nisan tarihlerine bakın veya <a href="/oteller">diğer Mekke otellerimizi</a> karşılaştırın.</li>
<li>Yürümekte zorlanan bir yakınınız varsa 1. kuleyi isteyin; kule kesinleşmezse Harem'e daha az yürünen bir otel öneririz.</li>
</ul>

<h2>Otelin tanıtım videosu ve resmî sayfası</h2>
<p>Otelin içini, odaları ve Harem'e çıkan yolu görmek için <a href="https://www.instagram.com/reel/DeroB8HuMtE/" target="_blank" rel="noopener nofollow">Address Jabal Omar tanıtım videosunu</a> izleyebilirsiniz. Odalar, restoranlar ve Sky Musallah'ın ayrıntıları <a href="https://www.addresshotels.com/en/hotels/address-jabal-omar-makkah/" target="_blank" rel="noopener">Address Jabal Omar Makkah'ın resmî sayfasında</a> (İngilizce) yer alır.</p>

<h2>Address Jabal Omar'da konaklamayı nasıl planlarsınız?</h2>
<ol>
<li><strong>Tarihlerinizi ve kişi sayınızı belirleyin.</strong> Oda fiyatı 2, 3 ya da 4 kişilik odaya göre değişir.</li>
<li><strong>Teklif isteyin.</strong> <a href="/oteller/address-jabal-omar-makkah">Otel sayfamızdan</a> ya da WhatsApp'tan yazın; kule ve manzara tercihinizi belirtin.</li>
<li><strong>Vizenizi ayarlayın.</strong> Otel rezervasyonunuz vize başvurusunda kullanılır; süreci <a href="/blog/bireysel-umre-vizesi-nasil-alinir">umre vizesi rehberimizde</a> anlattık.</li>
<li><strong>Umrenizin geri kalanını planlayın.</strong> Medine oteli, transfer ve uçuşla birlikte <a href="/bireysel-umre">bireysel umre</a> programınızı tek seferde hazırlayabiliriz.</li>
</ol>
<p>Harem'de hangi kapının, hangi duanın nerede olduğunu yola çıkmadan görmek isterseniz <a href="/dua-haritasi">Harem Dua Haritası</a> kitapçığımızı ücretsiz indirebilirsiniz.</p>
`;
