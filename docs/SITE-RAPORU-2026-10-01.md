# Site raporu: Search Console (son 3 ay) + PageSpeed, 1 Ekim 2026

Kaynaklar: Search Console dışa aktarımı (29 Haziran – 28 Eylül 2026, web araması), kullanıcının PageSpeed raporu (www adresi, 1 Ekim 21:46) ve aynı gün `hadiumreyegidelim.com` üzerinde yerelde çalıştırılan Lighthouse 12 (mobil + masaüstü). Search Console'daki 109 adres canlıda tek tek açıldı.

## 1. Kısa özet

| Ne | Durum |
|---|---|
| Toplam | 783 tıklama, 7.874 gösterim (3 ay) |
| Tıklamaların kaynağı | **%41'i marka araması** ("hadi umreye gidelim" ve türevleri: 324 tıklama). Marka dışı aramadan gelen tıklama çok az. |
| Eğilim | Günlük gösterim Temmuz'da ~45, Eylül sonunda ~150–200 (**4 kat**). Ortalama sıra 15–25'ten 8–10'a geldi. Tıklama 23 Ağustos–2 Eylül'de zirve yaptı (24 Ağustos: 88), sonra günde 5–15'e indi. |
| Mobil / masaüstü | Mobil: 655 tıklama, ortalama sıra **8,2**. Masaüstü: 121 tıklama, ortalama sıra **23,7**. |
| Hız (mobil) | Ana sayfa **58/100**, en büyük içerik 15,7 sn'de görünüyor, sayfa 19,8 MB. Vize yazısı 57/100 (LCP 14,9 sn). Rehber ve tasarlayıcı sayfaları 89–93 (iyi). |
| SEO puanı | 100 (teknik temel sağlam) |
| Erişilebilirlik | 86–96 |

**En büyük üç sorun:**
1. Ana sayfa videosu 20,8 MB ve sayfa açılır açılmaz iniyor.
2. Tıklama marka adına bağlı; Google'da görünen sayfalar üst sıralarda ama tıklanmıyor (ör. vize yazısı: 1.899 gösterim, %1,7).
3. Fiyat ve vize aramalarında gerçek rakam olmadığı için sayfalar zayıf kalıyor.

## 2. Search Console bulguları

### 2.1 Fırsat sayfaları (çok gösterim, az tıklama)

| Sayfa | Gösterim | Tık | TO | Sıra | Yorum |
|---|---|---|---|---|---|
| /blog/bireysel-umre-vizesi-nasil-alinir | 1.899 | 33 | %1,7 | 9,9 | **En büyük fırsat.** "nusuk vize başvurusu" (101 gösterim, 9,4), "nusuk vize" (74), "nusuk umre vizesi" (25), "umre vizesi ne kadar sürede çıkar" (14, 9,3), "umre vize ücreti 2026" (11,8). 1. sayfanın altında; başlık ve açıklama tıklatmıyor. Mobil hız 57. |
| /bireysel-umre | 688 | 23 | %3,3 | 4,7 | "bireysel umre" aramasında 35. sıra; gösterimlerin çoğu marka ve site bağlantısı. |
| /paketler | 616 | 38 | %6,2 | 2,1 | Çoğunlukla marka aramasında site bağlantısı. |
| /iletisim | 609 | 9 | %1,5 | 2,2 | Site bağlantısı; normal. |
| /blog | 493 | 2 | %0,4 | 1,8 | Site bağlantısı. |
| /istanbul-cikisli-bireysel-umre | 363 | 5 | %1,4 | 2,0 | |
| /rehberlik | 274 | 0 | %0 | 1,4 | Başlık "Manevi Rehberler & Gizli Mücevherler" ne olduğunu anlatmıyor. |
| /blog/2026-umre-turlari-diyanet-bireysel-fiyatlar-vip-ipuclari | 275 | 5 | %1,8 | 28,2 | "umre fiyatları 2026 diyanet" kümesi 30–90. sıralarda. |
| /blog/umre-turlari-2026-fiyat-karsilastirmalari-diyanet-bireysel-vip | 229 | 0 | %0 | 27,9 | Aynı konudaki 6 yazıdan biri (yamyamlık). |

### 2.2 Şehir sayfaları çalışıyor

Şehir sayfaları toplam ~150 tıklama getirdi. Kalıp net: insanlar **"{il} umre fiyatları"** ve **"{il} diyanet umre fiyatları"** arıyor, sayfalar 5–10. sırada çıkıyor:

| Arama | Gösterim | Tık | Sıra |
|---|---|---|---|
| denizli umre fiyatları 2026 | 78 | 13 | 5,1 |
| samsun diyanet umre fiyatları | 23 | 0 | 7,6 |
| kütahya diyanet umre fiyatları | 19 | 0 | 8,2 |
| tokat diyanet umre fiyatları | 14 | 0 | 6,4 |
| kırıkkale umre fiyatları | 9 | 0 | 9,4 |

Sayfa başlıkları "{İl} Çıkışlı Bireysel Umre 2026". Aranan kelime "fiyat", ama sayfada gerçek fiyat yok. Paketlere fiyat girilince başlık ve içerik "{İl} Umre Fiyatları 2026" yönüne çevrilmeli: en hızlı marka dışı tıklama kazancı buradan gelir. "{il} umre turları" aramalarında 75–90. sıradayız; bu kelime şimdilik hedef değil.

### 2.3 Dikkat çeken diğer noktalar

- **"Yorum snippet'i": 3.183 gösterim, 154 tıklama.** Arama sonuçlarındaki yıldızlar, 30 Eylül'de kaldırılan **uydurma paket puanından** geliyordu. Yıldızlar birkaç hafta içinde kaybolacak, tıklama oranı biraz düşebilir. Kaldırmak doğruydu: sahte puan Google'da elle uygulanan cezaya yol açar. Gerçek yıldızın yolu Google İşletme Profili'nde gerçek müşteri yorumları.
- **"Ürün snippet'leri": 600 gösterim.** Paket sayfalarındaki Product şeması işe yarıyor. Paketlere gerçek fiyat girilince fiyatlı görünür.
- **"kutlu rota turizm": 114 gösterim, 0 tık.** "Kutlu Rota: İbadet ve Keşif" paket adı, aynı adı taşıyan bir firmanın aramalarında çıkıyor. Bu trafik bize dönmüyor ve marka karışıklığı yaratıyor. Paket adını değiştirmeyi düşün (senin kararın). "öze dönüş", "ilgi tur" gibi aramalar da benzer.
- **Sohbet gibi aramalar** ("evet", "olur", "ne kadar ödicem", "sola kaydır", "kendim gideceğim"). Bunlar Google'ın yapay zekâ modunda sorulan takip sorularında sitenin gösterildiğini düşündürüyor. AI Görünürlük ölçümü bu yüzden önemli.
- **Yurt dışı:** Almanya 17, Suudi Arabistan 14, Hollanda, İngiltere tıklaması var. Sonraya not: "Avrupa'dan bireysel umre" içeriği.
- **Aynı sayfanın iki adresi:** Search Console'da www'li ve www'siz adresler ayrı görünüyor (örneğin vize yazısı www'li, Adana sayfası ikisiyle de). 1 Ekim'de asıl adres www'siz yapıldı ve www 308 ile yönleniyor. Veriler birkaç hafta içinde tek adreste toplanacak.
- **4 blog yazısı 404 veriyor, hâlâ gösterim alıyor:**
  - `/blog/mekke-medine-bebek-mamasi-bezi-temini-kolay-mi-2026` (118 gösterim, **6 tıklama**)
  - `/blog/umre-turlari-2026-bireysel-umre` (12)
  - `/blog/2026-umre-turlari-hadi-umreye-gidelim-manevi-yenilenme` (6)
  - `/blog/ayak-tabanlarinin-su-toplamamasi-icin-harem-e-ozel-ayakkabi-corap-onerileri-2026` (2)

  En yakın yaşayan yazıya 301 ile yönlendirilmeli. Search Console'daki diğer 105 adres sorunsuz açılıyor.

## 3. Hız ve kalite (PageSpeed / Lighthouse)

| Sayfa (mobil) | Performans | Erişilebilirlik | LCP | Sayfa boyutu |
|---|---|---|---|---|
| Ana sayfa | **58** | 86 | **15,7 sn** | **19,8 MB** |
| Vize yazısı (blog) | **57** | 91 | **14,9 sn** | 6,3 MB |
| Denizli şehir sayfası | 60 | 95 | 8,9 sn | 2,4 MB |
| Bireysel umre tasarlayıcı | 89 | 94 | 3,1 sn | 2,4 MB |
| Rehber: ihram nedir | 93 | 96 | 3,1 sn | 2,3 MB |
| Ana sayfa (masaüstü) | 89 | 86 | 1,6 sn | 25,3 MB |

İyi olanlar: SEO 100, en iyi uygulamalar 100, sayfa kayması (CLS) neredeyse sıfır, JavaScript engellemesi (TBT) yok. Sorun neredeyse tamamen **ağır görseller ve video**.

### 3.1 Bulgular

1. **Ana sayfa videosu 20,8 MB** (`anasayfa-video-….mp4`) ve `preload="auto"` ile sayfa açılır açılmaz iniyor; mobil ölçümde 11,4 MB'ı indi. Mobil veride en büyük maliyet bu. PageSpeed raporunda bu dosya bir kez de yüklenemedi (bağlantı hatası).
2. **Video kapak resmi** Google'ın geçici bir adresinden geliyor (`lh3.googleusercontent.com/aida-public/…`, 357 KB, önbellek süresi 1 gün). Kalıcı ve küçültülmüş bir görselle değişmeli.
3. **Kampanya ve sayfa görselleri 2.600 px genişlikte** (Unsplash, 847–931 KB). Ana sayfadaki kampanya kartı ve `/paketler` üst görseli küçültülmeden `<img>` ile basılıyor. Kampanya görseli şehir sayfalarında ve blogda da iniyor.
4. **Paket görsellerinin aslı çok büyük:** "Mescidin Gölgesinde" 2,6 MB, diğerleri 600–700 KB JPG. Ana sayfa bunları küçültüp sunuyor (75 KB AVIF), ama `/paketler` sayfası **küçültmeden** basıyor.
5. **Blog yazılarındaki görseller küçültülmüyor.** Yazı içindeki görseller veritabanındaki HTML'den ham `<img>` olarak geliyor: boyutsuz, hemen yükleniyor, JPG. Vize yazısında ekran dışı görsellerden 3,4 MB, modern biçimden 2,3 MB tasarruf mümkün. Yazının LCP görseli de ham dosya.
6. **İkon yazı tipi Google'dan geliyor** (Material Symbols, 343 KB, oluşturmayı engelleyen CSS). Sitede kullanılan ~30 ikon için 343 KB'lık bir dosya iniyor. Yalnızca kullanılan ikonlarla küçük bir alt küme ya da SVG ikonlar 300 KB'tan fazla kazandırır.
7. **Logo 110 KB PNG** (`/logo.png?v=5`). WebP/SVG ile 10–20 KB olur.
8. **Eski tarayıcı kodu:** 14 KB gereksiz polyfill (Array.at, flat, Object.hasOwn…). Tarayıcı hedefi güncellenince gider.

### 3.2 Erişilebilirlik

- Ana sayfada **`<main>` yok**; ekran okuyucular ana içeriği bulamıyor.
- **"Umre adımları" sekmeleri** (`UmrahSteps`) `role="tablist"` ile işaretli ama düzeni rol kurallarına uymuyor (sekmeler `<ul>/<li>` içinde).
- **Düşük kontrast:**
  - Küçük büyük harfli etiketler (`text-primary/60`, 11 px): "KİŞİSELLEŞTİRİLMİŞ LÜKS TURLAR", "ADIM ADIM YOLCULUK", "MESCİD-İ HARAM" vb.
  - Kampanya şeridindeki "Teklif al" düğmesi.
- **Başlık sırası atlıyor** (H2'den H4'e) blog ve şehir sayfalarında.
- **Vize yazısında** iki `href="visa.visitsaudi.com"` bağlantısının başında `https://` yok; biri de metinsiz. Bağlantılar kırık: site içinde olmayan bir sayfaya gidiyor.

### 3.3 İçerik ve vaat sorunları

- **Ana sayfa ve tasarlayıcı açıklamalarında doğrulanamayan vaatler var.** Ana sayfa: "…En ucuz fiyatlar ve butik hizmet." Tasarlayıcı: "2026 en ucuz Mekke ve Medine uçak biletleri, Mescid-i Haram sıfır lüks o…". Bu metin Google'da görünüyor; kendi kuralımıza da aykırı ("en ucuz", "sıfır" kanıtlanamaz).
- **Konu dışı yazı:** "Umre sırasında iPhone 18 Pro ve Duo almak" ana sayfadaki blog listesinde duruyor. Umre niyetiyle gelen ziyaretçiye ve sitenin konu bütünlüğüne katkısı zayıf.
- **6 yazı aynı aramaya yarışıyor:** "umre turları 2026 / diyanet / fiyat" yazıları birbirini eziyor (yol haritası C1).

## 4. Yapılacaklar (öncelik sırasıyla)

**Kim:** C = Claude Code, A = Antigravity, S = sen.

### Hemen (bu hafta, kod: küçük–orta iş)

| # | İş | Kim | Etki |
|---|---|---|---|
| 1 | Ana sayfa videosunu hafiflet: `preload="none"` ya da yalnızca masaüstünde oynat. Mobilde kapak görseli kalsın. Videoyu 720p, ~2–3 MB olacak şekilde yeniden sıkıştır (dosyayı sen yükleyeceksen admin'e boyut uyarısı eklerim). | C (+S video) | Mobil ana sayfa ~58 → 80+; 11 MB az veri |
| 2 | Kapak resmini kalıcı, küçültülmüş bir görsele çevir (lh3 geçici adresi yerine). | C | LCP |
| 3 | Kampanya ve `/paketler` görsellerini `next/image` ile küçültülmüş sun; Unsplash adreslerini 2600 → 1200 px yap. | C | Tüm sayfalarda −1 MB |
| 4 | Blog içeriğindeki görselleri işle: genişlik/yükseklik, `loading="lazy"`, ilk görsel hariç; görsel adresini küçültme servisine yönlendir. | C | Vize yazısı 57 → 85+ |
| 5 | 4 ölü blog adresine 301 yönlendirme (bebek maması → bebekle umre yazısı vb.). | C | Kayıp tıklamaları kurtarır |
| 6 | Vize yazısındaki kırık `visa.visitsaudi.com` bağlantısını düzelt. | C/A | |
| 7 | Ana sayfa ve tasarlayıcı açıklamalarından "en ucuz", "sıfır" vaatlerini çıkar; doğrulanabilir, tıklatan bir metin yaz. | C | TO + güven |
| 8 | Ana sayfaya `<main>`; adım sekmelerinde rol düzeni; küçük etiketlerde kontrast (`text-primary/60` → `text-primary/80`). | C | Erişilebilirlik 86 → 95+ |
| 9 | İkon yazı tipini 343 KB'tan alt kümeye indir ya da SVG'ye geç. | C | −300 KB her sayfada |
| 10 | Logo PNG → WebP/SVG. | C | −100 KB |

### Kısa vade (2–4 hafta, içerik)

| # | İş | Kim | Not |
|---|---|---|---|
| 11 | **Vize yazısını yenile:** başlık "Nusuk Vize Başvurusu 2026: Umre Vizesi Nasıl Alınır?", açıklamada süre ve ücret. Başa `/umre-vizesi/basvuru` bağlantısı. "Ne kadar sürede çıkar" ve "kaç TL" sorularına doğrudan cevap. | A (+S rakamlar) | 1.899 gösterim, sıra 9,9: TO %1,7 → %5 olursa ayda ~30 ek tıklama |
| 12 | **Paketlere gerçek fiyat gir** (admin → Paketler). | S | Şehir sayfası ve fiyat aramalarının ön koşulu |
| 13 | Fiyatlar girilince **şehir sayfası başlıkları:** "{İl} Umre Fiyatları 2026: {İl} Çıkışlı Bireysel Umre"; sayfada gerçek paket fiyatlarından "başlayan fiyat" kutusu. Önce 10 il (Denizli, Samsun, Kütahya, Tokat, Kırıkkale, Amasya, Diyarbakır, Antalya, Mersin, İstanbul); 2 hafta izle, sonra hepsine. | C | "{il} diyanet umre fiyatları" 6–8. sıralarda, tıklama 0 |
| 14 | `/umre-fiyatlari` sayfası (yol haritası B2). | A | |
| 15 | 6 "umre turları 2026" yazısını birleştir (C1/C2). | A (+S onay) | |
| 16 | `/rehberlik` başlığını anlaşılır yap: "Umre Rehberliği: Mekke ve Medine'de Türkçe Rehber". | A | 274 gösterim, 0 tıklama |
| 17 | "Kutlu Rota" paket adının başka firmayla karışmasına karar ver. | S | |
| 18 | iPhone yazısının yerine karar ver: yayından kaldırıp en yakın yazıya yönlendir ya da ana sayfa listesinden çıkar. | S | |

### Sürekli

- **Google İşletme Profili ve gerçek yorumlar** (S). Yıldızların meşru yolu bu.
- **Search Console** (S): "alan adı" mülkü kullanılsın, sitemap `https://hadiumreyegidelim.com/sitemap.xml` gönderilsin. 2 hafta sonra bu raporu yeni veriyle tekrar alalım.
- **Haftalık sıra ve AI Görünürlük ölçümü** (A): sonuçlar CALISMA-KAYDI.md'ye yazılır.

## 5. Beklenen sonuç (gerçekçi)

- **İlk 10 madde (hız + düzeltmeler):** mobil ana sayfa 58'den 80–90'a, sayfa 19,8 MB'tan 3 MB'ın altına iner. Google'ın gerçek kullanıcı ölçümleri 28 günde güncellenir.
- **Vize yazısı ve şehir sayfaları:** fiyat ve vize bilgisi gelince marka dışı tıklama ayda yüzlerle ölçülür hale gelir. Bu sıralamaya ve gerçek rakamlara bağlı, garanti değil.
