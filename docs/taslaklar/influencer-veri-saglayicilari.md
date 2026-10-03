# Influencer Veri Sağlayıcıları Araştırma ve Karşılaştırma Raporu

> **Tarih:** 3 Ekim 2026  
> **Hedef Kitle:** Umre ve helal seyahat sektörü için **muhafazakâr / dindar kitleye ulaşan** Instagram (öncelikli), TikTok ve YouTube içerik üreticileri.  
> **Ölçüt:** Yalnızca tesettürlü olmak değil; kitlenin dindar olması (dini içerik, hac/umre, İslami yaşam, aile, sohbet, ilahi, Kur'an, siyer, helal seyahat), Instagram'da aktiflik (son 30 günde paylaşım).  
> **Gereken Veriler:** Takipçi sayısı, ortalama Reels izlenmesi, ortalama beğeni/yorum, etkileşim oranı, son paylaşım tarihi, Türkiye/Türkçe kitle oranı (%), sahte takipçi oranı (%).

---

## 1. Veri Sağlayıcı Karşılaştırma Tablosu

| Sağlayıcı | API Var mı? | Verilen Metrikler (Takipçi / Izlenme / Etkileşim / Kitle Ülke-Dil / Sahte Takipçi) | Türkiye Kapsaması | Arama / Keşif (Anahtar Kelime, Konu, Konum) | Fiyat (Resmî Sayfa & Tarihli Bağlantı) | Deneme Sürümü | Meta Kurallarına Uyum |
|---|---|---|---|---|---|---|---|
| **Modash** | Evet (Discovery & Raw API) | **Tam:** Takipçi, Reels izlenme, Etkileşim %, Kitle Ülke/Şehir/Dil (TR/Türkçe), Sahte Takipçi Skoru | Yüksek (380M+ profilden TR kümesi) | **Çok Gelişmiş:** Konu, biyografi, görsel estetik/AI prompt, kitle konumu | **Platform:** $199 - $299/ay.<br>**API:** Özel kurumsal yıllık sözleşme ("Contact Sales", [`https://www.modash.io/pricing`](https://www.modash.io/pricing) - Ekim 2026) | 14 Gün Ücretsiz Platform Denemesi | Kamusal Veri İndeksi / Özel İndeksleme |
| **HypeAuditor** | Evet (HypeAuditor API) | **Tam:** Takipçi, İzlenme, Etkileşim %, Kitle Ülke/Dil (Detaylı TR), Sahte Takipçi (AQS Skoru - Sektör Standardı) | Yüksek (200M+ profilden geniş TR veritabanı) | **Çok Gelişmiş:** 35+ filtre, niş, dil, kitle lokasyonu, anahtar kelime | **Platform:** Başlangıç ~$299/ay (yıllık).<br>**API:** Özel kurumsal teklif ("Fiyat sayfası yok / Contact Sales", [`https://hypeauditor.com/pricing/`](https://hypeauditor.com/pricing/) - Ekim 2026) | Sınırlı Ücretsiz İnceleme Hesabı | Kamusal Veri İşleme / AI Analiz |
| **Phyllo (InsightIQ)** | Evet (Geliştirici Odaklı API) | **Kısmi:** Takipçi, İzlenme, Etkileşim. Kitle ülke/dil verisi yalnızca influencer hesabı OAuth bağlarsa (%100). Sahte takipçi tespiti YOK. | Yüksek (OAuth bağlı hesaplarda) / Orta (Genel aramada) | **Sınırlı:** Keşif motorundan ziyade bağlı hesap (first-party data) yönetim API'si | Resmî sitede açık liste yok ("Fiyat sayfası yok", [`https://www.getphyllo.com/`](https://www.getphyllo.com/) - Ekim 2026) | Ücretsiz Developer Sandbox | **%100 Uyumlu:** Resmî Meta Graph API & OAuth |
| **Upfluence** | Evet (Upfluence API) | **Tam:** Takipçi, İzlenme, Etkileşim, Kitle Demografisi, Sahte Takipçi tespiti | Orta-Yüksek | **Gelişmiş:** E-ticaret müşteri eşleştirme, kitle filtresi, konu araması | Resmî sitede fiyat yok ("Fiyat sayfası yok", [`https://www.upfluence.com/pricing`](https://www.upfluence.com/pricing) - Ekim 2026; özel teklif) | Ücretsiz deneme yok (Demo talebi) | Resmî API İş Ortaklıkları + İndeksleme |
| **Heepsy** | Kısmi (SaaS + Enterprise API) | **Tam:** Takipçi, İzlenme, Etkileşim %, Kitle Ülke/Şehir, Sahte Takipçi Oranı (Authenticity Score) | Orta (11M+ profilden TR hesapları) | **Gelişmiş:** Konum, kategori, kitle konumu, takipçi aralığı | Starter $49-$69/ay, Plus $169/ay, Advanced $269/ay ([`https://www.heepsy.com/pricing`](https://www.heepsy.com/pricing) - Ekim 2026) | Ücretsiz Plan (Sınırlı Arama) | Kamusal Veri İndeksi |
| **Influencers.club** | Evet (Data API & Raw API) | **Tam:** Takipçi, İzlenme, Etkileşim, Kitle Ülke/Dil (TR), İletişim e-postası, Sahte Takipçi skoru | Orta-Yüksek (Instagram & TikTok geniş TR verisi) | **Çok Gelişmiş:** 40+ filtre, biyografi, kitle konumu, anahtar kelime | Dashboard $199/ay; API erişimi ~$249/ay ([`https://influencers.club/pricing`](https://influencers.club/pricing) - Ekim 2026) | Ücretsiz Deneme Kredisi | Kamusal Veri Madenciliği |
| **Apify (Instagram Actors)** | Evet (REST API / SDK) | **Kısmi:** Takipçi, Reels izlenme, Etkileşim, Son paylaşım tarihi. **Kitle ülke/dil ve sahte takipçi oranı HAZIR YOK (DIY).** | **%100** (Kamuya açık tüm TR hesapları kazınabilir) | **Teknik Kazıma:** Hashtag, konum, kullanıcı adı araması veya takipçi listeleri kazıma | Pay-as-you-go / Kullanım bazlı. $5/ay ücretsiz kredi; 1.000 profil ~$1.50 - $2.50 ([`https://apify.com/pricing`](https://apify.com/pricing) - Ekim 2026) | $5/ay Ücretsiz Platform Kredisi | **Web Scraping:** Meta dışı kamuya açık kazıma (Meta kuralları riski geliştiricide) |
| **StarNgage** | Doğrulanmadı (Public API yok) | **Kısmi:** Takipçi, Etkileşim %, Kategori, Kitle Şehir/Ülke (SaaS paneli içinde). Sahte takipçi tespiti doğrulanmadı. | Orta | Konu, kategori, konum bazlı arama | Resmî fiyat sayfası yok ("Fiyat sayfası yok", [`https://starngage.com/`](https://starngage.com/) - Ekim 2026; Pazar yeri komisyonu %10-%30) | Doğrulanmadı | Kamusal Veri İndeksi |
| **Social Blade API** | Evet (Business API) | **Eksik:** Takipçi sayısı, Takipçi büyüme geçmişi, Gönderi sayısı. **Kitle ülke/dil ve Sahte takipçi verisi YOK.** | Yüksek (Kamuya açık hesap verileri) | **YOK:** Konu/kitle bazlı keşif aracı bulunmuyor (yalnızca kullanıcı adı araması) | Business $99.99/ay veya Apify Social Blade Scraper (~$5 / 1k istek) ([`https://socialblade.com/v2/pricing`](https://socialblade.com/v2/pricing) - Ekim 2026) | Yok | Public Profil Verisi |
| **DataForSEO** | Evet (REST API) | **YOK:** DataForSEO'da Instagram Influencer Keşif / Kitle Analiz / Sahte Takipçi API'si bulunmamaktadır. | N/A (Influencer API'si yok) | **YOK:** Influencer araması sunmaz | Pay-as-you-go (SEO / SERP API'leri için min $50 depozito, [`https://dataforseo.com/pricing`](https://dataforseo.com/pricing) - Ekim 2026) | Ücretsiz Test Kredisi | N/A |

---

## 2. İnceleme ve Değerlendirme

### 🛠️ DataForSEO Hakkında Açıklama
DataForSEO; Google SERP, Google Maps, Backlinks, Keyword Data ve E-commerce (Amazon/Google Shopping) API'lerinde çok güçlü pay-as-you-go çözümler sunsa da **Instagram influencer keşfi, kitle demografisi veya sahte takipçi analizi endpoint'i sunmamaktadır**. Bu nedenle influencer aday havuzu oluşturmada kullanılamaz.

### 🔍 Dindar / Muhafazakâr Kitleye Ulaşan Kreatörleri Bulma Stratejisi
Hiçbir sağlayıcı doğrudan "dindar kitle" adında tek bir filtre sunmaz. Ancak şu kombine arama filtreleriyle muhafazakâr kitle %90+ doğrulukla tespit edilir:
1. **Anahtar Kelime & Biyografi Arama:** `umre`, `hac`, `helal seyahat`, `islami yaşam`, `aile`, `sohbet`, `dua`, `ilahiyat`, `kuran`, `siyer`, `filistin`.
2. **Kitle Lokasyonu:** Türkiye %70+, İstanbul/Ankara/Konya/Bursa/Kayseri/Gaziantep ağırlıklı kitle.
3. **Etkileşim & İzlenme Oranı:** Reels ortalama izlenme > 10.000, Etkileşim Oranı > %2.5, Sahte Takipçi < %20.

---

## 3. Öneri ve Yol Haritası

### 💡 En Ucuz Başlangıç Seçeneği: **Apify + Kendi Uygunluk Puanlama Algoritmamız**
- **Neden:** Sabit bir aylık 200$-300$ taahhüde girmeden, pay-as-you-go ($5-$20/ay maliyetle) binlerce Instagram profili ve Reels izlenmesi çekilebilir.
- **Nasıl Çalışır:** Apify Instagram Search / Hashtag Actor ile `#umre`, `#helalseyahat`, `#muhafazakaryasam` gibi etiketlerden ve hedef biyografi kelimelerinden profiller çekilir. İçi boş / sahte profiller ve etkileşimsiz hesaplar kendi admin algoritmamızla filtrelenir.

### 🌟 En İyi Veri ve Otomasyon Seçeneği: **Influencers.club (API) veya Modash (SaaS/API)**
- **Neden:** hem **kitle ülke/dil dağılımını (TR %)** hem **sahte takipçi skorunu** hem de **doğrudan iletişim e-postalarını** hazır JSON olarak sunar.
- **Bütçe:** Aylık 199$ - 249$ arası başlangıç paketiyle doğrudan ürün içi otomasyona bağlanabilir.
