// Ramazan 2027 umresi yazısı (25 Ekim, kullanıcı: "bu sistemi tamamlayacak bir blog"). Rezervasyon sayfasına (/ramazan-umresi-paketi)
// trafik ve güven getirir; genel rehber /ramazan-umresi ile çakışmaz (o sayfa manevi atmosfer ve genel öneriler).
// Kaynaklar: Diyanet 2027 dini günler takvimi (Ramazan 8 Şubat, Kadir Gecesi 5 Mart, bayram 9 Mart; basında 24 Ağustos 2026'da duyuruldu),
// rezervasyon sistemi (src/lib/ramazan/paketler.ts; fiyatlar 25 Ekim 2026'da sistemden okundu).

export const RAMAZAN_YAZI_SLUG = "ramazan-umresi-2027-tarihler-ve-fiyatlar";
export const RAMAZAN_YAZI_BASLIK = "Ramazan 2027 Umresi: Tarihler, 5–30 Gecelik Seçenekler ve Fiyatlar";
export const RAMAZAN_YAZI_META = "Ramazan Umresi 2027: Tarihler ve Fiyatlar";
export const RAMAZAN_YAZI_ACIKLAMA =
  "Ramazan 2027 ne zaman başlıyor, Kadir Gecesi hangi gün? Ramazan'ın tamamında ya da 5, 10, 15 gecesinde Mekke'de umre: hangi grup kime uygun, fiyatlar ve rezervasyon.";
export const RAMAZAN_YAZI_ODAK = "ramazan umresi 2027";
export const RAMAZAN_YAZI_ANAHTAR = "ramazan umresi 2027, ramazan umresi fiyatları, ramazan umresi ne zaman, kadir gecesi umre, ramazanın son on günü umre, 2027 ramazan ne zaman";
export const RAMAZAN_YAZI_GORSEL = "/images/hero-kabe.jpg";
export const RAMAZAN_YAZI_GORSEL_ALT = "Mescid-i Haram'da Kâbe";

export const RAMAZAN_YAZI_TLDR =
  "Diyanet takvimine göre Ramazan 2027'de ilk oruç 8 Şubat Pazartesi, Kadir Gecesi 5 Mart Cuma akşamı, Ramazan Bayramı 9 Mart Salı'dır; Suudi Arabistan'da hilale göre bir gün fark olabilir. Mekke'de Ramazan'ın tamamını ya da 15, 10 veya 5 gecesini geçirebilirsiniz. Hadi Umreye Gidelim'de Safwah Al Talayie otelinde sahur ve iftar dahil, vize ve Cidde transferiyle kişi başı 261,99 USD'den başlar; yer sitede anında ayrılır.";

export const RAMAZAN_YAZI_SSS = [
  {
    q: "Ramazan 2027 ne zaman başlıyor?",
    a: "Diyanet İşleri Başkanlığı'nın 2027 takvimine göre ilk oruç 8 Şubat 2027 Pazartesi günü tutulur; ilk teravih 7 Şubat Pazar akşamı kılınır. Ramazan Bayramı 9 Mart 2027 Salı günü başlar. Suudi Arabistan'da Ramazan'ın başlangıcı hilalin görülmesine göre bir gün farklı olabilir.",
  },
  {
    q: "2027'de Kadir Gecesi hangi gün?",
    a: "Diyanet takvimine göre Kadir Gecesi 5 Mart 2027 Cuma akşamıdır, yani 5 Mart'ı 6 Mart'a bağlayan gece. Mekke'de bu gecenin tarihi Suudi takvimine göre bir gün farklı olabilir. 26–30 Ramazan grubumuz (4–9 Mart) bu geceyi kapsar.",
  },
  {
    q: "Ramazan umresi için en az kaç gece gerekir?",
    a: "Umrenin kendisi birkaç saatte tamamlanır; süre sizin Ramazan'ın ne kadarını Mekke'de geçirmek istediğinize bağlıdır. Bizde en kısa seçenek 5 gecedir; 10, 15 ya da 30 gece de seçebilirsiniz.",
  },
  {
    q: "Fiyata neler dahil?",
    a: "Safwah Al Talayie otelinde sahur ve iftar dahil konaklama, umre vizesi (e-vize ve zorunlu sağlık sigortası) ve Cidde Havalimanı ile otel arasında Toyota Camry ile gidiş-dönüş transfer. Uçak bileti dahil değildir.",
  },
  {
    q: "Rezervasyon nasıl yapılır?",
    a: "Ramazan umresi sayfasında süreyi, tarih grubunu ve odadaki kişi sayısını seçip yolcu adlarını yazarsınız. Yeriniz o anda ayrılır ve size bir rezervasyon kodu verilir; ödeme bilgilerini WhatsApp'tan iletiriz. Ödeme 24 saat içinde yapılmazsa yer serbest kalır.",
  },
  {
    q: "Oda başkalarıyla paylaşılır mı?",
    a: "Hayır. Seçtiğiniz tarihlerde oda yalnızca sizin grubunuza ayrılır. Oda 4 kişiliktir; 2, 3 ya da 4 kişi kalabilirsiniz ve kişi sayısı arttıkça kişi başı fiyat düşer.",
  },
];

const tablo = (bas: string[], satirlar: string[][]) =>
  `<table><thead><tr>${bas.map((b) => `<th>${b}</th>`).join("")}</tr></thead><tbody>${satirlar.map((r) => `<tr>${r.map((h) => `<td>${h}</td>`).join("")}</tr>`).join("")}</tbody></table>`;

export const RAMAZAN_YAZI_ICERIK = `<p><strong>Ramazan 2027 umresi</strong> için takvim belli: Diyanet İşleri Başkanlığı'nın 2027 takvimine göre ilk oruç <strong>8 Şubat 2027 Pazartesi</strong>, Kadir Gecesi <strong>5 Mart Cuma akşamı</strong>, Ramazan Bayramı <strong>9 Mart Salı</strong>. Ramazan'ı Mekke'de geçirmek isteyenler için asıl soru şu: Ayın tamamı mı, yoksa hangi 5, 10 ya da 15 gecesi? Bu yazıda tarihleri, her seçeneğin kime uygun olduğunu, fiyatları ve rezervasyonun nasıl yapıldığını anlatıyoruz.</p>

<h2>Ramazan 2027 ne zaman başlıyor, ne zaman bitiyor?</h2>
${tablo(["Gün", "Tarih (Diyanet takvimi)"], [
  ["İlk teravih", "7 Şubat 2027 Pazar akşamı"],
  ["İlk oruç", "8 Şubat 2027 Pazartesi"],
  ["Kadir Gecesi", "5 Mart 2027 Cuma akşamı"],
  ["Arefe", "8 Mart 2027 Pazartesi"],
  ["Ramazan Bayramı", "9–11 Mart 2027"],
])}
<p>Hicri aylar hilalin görülmesine göre başladığı için Suudi Arabistan'da Ramazan'ın ilk günü Türkiye'den bir gün farklı olabilir. Otel tarihleri bundan etkilenmez: bizim Ramazan odalarımız <strong>7 Şubat akşamı giriş, 9 Mart sabahı çıkış</strong> olmak üzere 30 gece ayrıldı.</p>

<h2>Ramazan'da umre neden ayrıca planlanır?</h2>
<p>Peygamberimiz Ramazan'da yapılan umrenin hac sevabına denk olduğunu haber vermiştir (Buhârî, Müslim). Bu yüzden Ramazan, Mekke'nin yılın en kalabalık dönemlerinden biridir; özellikle son on gecede Harem ve çevresindeki oteller dolar. Planlamada üç şey öne çıkar:</p>
<ul>
<li><strong>Yer erken biter.</strong> Ramazan için oteller oda sayısını sınırlı ayırır; tarih ne kadar yakınsa seçenek o kadar azalır.</li>
<li><strong>Gün düzeni değişir.</strong> Oruç, iftar, teravih ve sahur gününüzü belirler. Otelde sahur ve iftarın hazır olması, kalabalıkta yemek aramakla geçecek zamanı ibadete bırakır.</li>
<li><strong>Süreyi siz seçersiniz.</strong> Herkesin bir ay izni yoktur. Ramazan'ın bir bölümünü Mekke'de geçirmek de mümkündür.</li>
</ul>

<h2>Hangi 5, 10 ya da 15 gece size uygun?</h2>
<p>Odalarımızın 30 gecesi 5'er gecelik altı bölüme ayrılır. Bu bölümleri tek başına ya da birleşik alabilirsiniz:</p>
${tablo(["Seçenek", "Ramazan günleri", "Tarihler", "Kime uygun?"], [
  ["30 Ramazan", "1–30", "7 Şubat – 9 Mart", "Ramazan'ın tamamını Mekke'de geçirmek isteyenler"],
  ["15 Ramazan · 1. grup", "1–15", "7 – 22 Şubat", "Ramazan'ı Mekke'de karşılamak isteyenler; ilk günler görece sakindir"],
  ["15 Ramazan · 2. grup", "16–30", "22 Şubat – 9 Mart", "Son on geceyi ve bayramı Mekke'de geçirmek isteyenler"],
  ["10 Ramazan · 3 grup", "1–10 / 11–20 / 21–30", "7–17 Şubat / 17–27 Şubat / 27 Şubat – 9 Mart", "İzni kısıtlı olanlar; 3. grup son on geceyi kapsar"],
  ["5 Ramazan · 6 grup", "1–5 … 26–30", "5'er gece", "Kısa izin; 26–30 grubu Kadir Gecesi'ni kapsar"],
])}
<p><strong>Son on gece</strong> (21–30 Ramazan) en çok istenen dönemdir: Kadir Gecesi bu günlerdedir ve itikâfa girenler Harem'de kalır. Kalabalık da en çok bu günlerde artar; yaşlı ya da çocuklu yolcular için ilk ya da orta bölümler daha rahat olabilir.</p>

<h2>Nerede kalınır?</h2>
<p>Ramazan odalarımız Mekke'deki <a href="/oteller/safwah-al-talayie">Safwah Al Talayie</a> otelindedir. Otelden Harem'e ücretsiz servis vardır; Ramazan boyunca <strong>sahur ve iftar fiyata dahildir</strong>. Oda 4 kişiliktir ve seçtiğiniz tarihlerde yalnızca sizin grubunuza ayrılır.</p>

<h2>Ramazan 2027 umresi fiyatları</h2>
<p>Fiyatlar kişi başı ve ABD doları cinsindendir; Safwah Al Talayie'de sahur ve iftar dahil konaklama, umre vizesi ve Cidde ↔ Mekke transfer (Toyota Camry) dahildir. Uçak bileti dahil değildir. Fiyatlar 25 Ekim 2026 itibarıyladır; güncel fiyatı rezervasyon sayfasında görürsünüz.</p>
${tablo(["Seçenek", "2 kişilik oda", "3 kişilik oda", "4 kişilik oda"], [
  ["30 Ramazan", "1.334,99 USD", "933,99 USD", "733,99 USD"],
  ["15 Ramazan", "768,99 USD", "556,99 USD", "450,99 USD"],
  ["10 Ramazan", "580,99 USD", "430,99 USD", "355,99 USD"],
  ["5 Ramazan", "391,99 USD", "304,99 USD", "261,99 USD"],
])}
<p>Oda bedeli kişi sayısından bağımsız olduğu için odada kalan kişi arttıkça kişi başı fiyat düşer.</p>

<h2>Rezervasyon nasıl yapılır?</h2>
<ol>
<li><a href="/ramazan-umresi-paketi"><strong>Ramazan umresi sayfasında</strong></a> süreyi (30, 15, 10 ya da 5 gece), tarih grubunu ve odadaki kişi sayısını seçin.</li>
<li>Yolcuların adını pasaporttaki gibi yazıp gönderin. Yeriniz o anda ayrılır ve bir rezervasyon kodu alırsınız.</li>
<li>Ödeme bilgilerini WhatsApp'tan iletiriz. Ödeme 24 saat içinde yapılmazsa yer serbest kalır.</li>
<li>Vizeniz hazırlanır; Cidde Havalimanı'nda sizi karşılayıp otele götürürüz.</li>
</ol>
<p>Satılan tarihler sayfada “Dolu” görünür; görünen her açık seçenek o an gerçekten müsaittir.</p>

<h2>Ramazan umresinde dikkat edilecekler</h2>
<ul>
<li><strong>Uçak biletini erken alın.</strong> Ramazan'ın son günleri ve bayram dönüşü uçuşları hızla dolar; vize başvurusu için gidiş-dönüş biletiniz gerekir.</li>
<li><strong>Umreyi dinlenmiş olarak yapın.</strong> Oruçluyken tavaf ve sa'y yorucudur; ilk gün dinlenip umreyi iftardan sonra yapmayı planlayabilirsiniz.</li>
<li><strong>Harem'e erken gidin.</strong> Teravih ve son on gecedeki namazlar için yerinizi vakitten önce alın.</li>
<li><strong>Bol su için.</strong> İftarla sahur arasında zemzem ve su tüketimini ihmal etmeyin.</li>
</ul>
<p>Ramazan'da Mekke'nin manevi atmosferi ve genel öneriler için <a href="/ramazan-umresi">Ramazan umresi rehberimizi</a>, vize belgeleri için <a href="/umre-vizesi">umre vizesi sayfamızı</a> okuyabilirsiniz.</p>`;
