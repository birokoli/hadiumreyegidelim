# GEO / AI arama analizi — hadiumreyegidelim.com (3 Ekim 2026)

Kaynaklar: canlı site (curl, SSR HTML), Search Console API (3 Eyl–1 Eki 2026, 28 gün), robots.txt, llms.txt, JSON-LD.
AI platformlarındaki (ChatGPT, Perplexity, AI Overviews) görünürlük bu çalışmada **ölçülmedi**; admin → AI Görünürlük ölçümleri ayrıca okunmalı.

## GEO hazırlık puanı: 63/100

| Ölçüt | Ağırlık | Puan | Not |
|---|---|---|---|
| Teknik erişim | 20 | 18 | SSR (Next.js), bütün botlara açık, temiz kanonik; llms.txt'de doğrulanamayan iddia |
| Yapı | 20 | 16 | Soru biçimli H2, SSS, tablo var; /hizmetler'de sayfa şeması yok |
| Alıntılanabilirlik | 25 | 15 | Rehber sayfaları iyi; blogda doğrulanamayan rakam/iddia (15 yazı), vize yazısında yanlış süreç |
| Çoklu ortam | 15 | 8 | Görsel var; video yok, karşılaştırma tablosu az |
| Otorite ve marka | 20 | 6 | Wikipedia/Reddit/İşletme Profili yok; dış anılma çok az; marka araması küçük |

## Search Console: durum (28 gün)

- **3.700 gösterim, 192 tıklama, ortalama sıra 10,3.** Tıklamaların 48'i marka araması ("hadi umreye gidelim").
- 172 sorgunun 48'i ilk 10'da, 32'si 11–20 arası, 92'si 20'nin altında.
- **Para kelimelerinde görünürlük yok:** "umre fiyatları", "umre fiyatları 2026", "mekke otelleri", "kabeye yakın oteller", "umre turları", "umre vizesi nasıl alınır" → 28 günde **0 gösterim**. "bireysel umre" 35,8. sırada, "bireysel umre vizesi" 33,9. sırada (51 gösterim).
- **Çalışan alan: il + fiyat aramaları.** "denizli umre fiyatları 2026" 5,1. sırada (41 gösterim, 7 tık); samsun/kütahya/tokat/kırıkkale/elazığ "umre fiyatları" aramaları 6–11. sıralarda. Bu sayfalarda **fiyat yok** (H13 paket fiyatı bekliyor).
- **Soru aramaları 9. sırada:** "umreye tursuz gidilir mi" (32 gösterim), "tursuz umreye gidilir mi" (24), "nusuk vize" (64), "nusuk vize başvurusu" (36).
- **En büyük sayfa:** `/blog/bireysel-umre-vizesi-nasil-alinir` (723 gösterim, 9,7. sıra) — Search Console hâlâ **www** adresini raporluyor (eski kayıt; www → apex 308 var, birkaç hafta içinde taşınır). İçeriğinde yanlış süreç ve "300 riyal" var (G11-2 bunu yeniden yazıyor).
- **"kutlu rota turizm"** 28 gösterim: paket adı başka bir firmanın adıyla karışıyor (H15) — bizim için değersiz trafik.

## AI tarayıcı erişimi

robots.txt yalnızca `User-Agent: *` için `/admin/`, `/api/`, `/profil/` kapatıyor; özel AI kuralı yok. Buna göre:
- **Arama/alıntı botları açık:** Googlebot (Google Arama + AI Overviews + AI Mode), OAI-SearchBot (ChatGPT Search), Claude-SearchBot, PerplexityBot, Applebot.
- **Eğitim botları da açık:** GPTBot, ClaudeBot, Google-Extended, CCBot, Applebot-Extended. Görünürlük açısından engel gerekmez; lisans tercihi kullanıcıya ait.

## llms.txt

Var (17 KB). Google bunu kullanmaz; diğer sistemler için zararsız. **Sorun:** "Türkiye'nin en kapsamlı rehberlik platformu" (doğrulanamaz) ve "hac turları" (satmıyoruz) yazıyor → düzeltilmeli.

## Şema durumu

| Sayfa | Var | Eksik / öneri |
|---|---|---|
| Tüm sayfalar | WebSite, Organization (+TravelAgency üst kuruluş, DTCM lisansı) | Organization'a `sameAs` (Instagram/YouTube/TikTok) var; İşletme Profili açılınca `hasMap`/adres eklenecek |
| / | WebPage, FAQPage | — |
| /bireysel-umre | Service, FAQPage, Breadcrumb | Planlayıcı için `offers` yok (fiyat değişken; doğru) |
| /umre-vizesi | FAQPage | `Service` + `Offer` (140 USD, kişi başı) eklenmeli — fiyat sabit ve sayfada görünür |
| /hizmetler | yalnızca site geneli | `WebPage` + `ItemList` (oteller) ve transfer tablosu için `Offer`'lar; Breadcrumb |
| Blog yazısı | BlogPosting, Person, FAQPage, Breadcrumb | Yazar sayfası (`/yazar/...`) ve `sameAs` |
| İl sayfası | Service, City, FAQPage | Fiyat gelince `AggregateOffer` |
| Paket | Product (fiyatsız) | Fiyat gelince `Offer` (I9) |

## En yüksek etkili 5 değişiklik

1. **Paket fiyatlarını gir → il sayfalarına "{İl} umre fiyatları 2026" başlığı ve gerçek başlangıç fiyatı (H12/H13).** Zaten 5–11. sırada olduğumuz tek ticari arama kümesi bu; fiyat olmadan tıklanmıyor.
2. **Vize yazısını doğru süreçle yeniden yayınla (G11-2) ve /umre-vizesi'ye `Service+Offer` şeması.** En çok gösterim alan sayfa; "nusuk vize", "bireysel umre vizesi" aramalarına da cevap olacak.
3. **"Umreye tursuz gidilir mi?" sorusuna tek, net bir cevap sayfası** (rehber sayfası olarak; ilk paragrafta doğrudan cevap + /bireysel-umre). 56 gösterim, 9. sıra; AI asistanlarının en sık sorduğu türden soru.
4. **Marka anılması (AI görünürlüğünün en güçlü sinyali):** Google İşletme Profili (Bakırköy), YouTube kanalına bireysel umre/vize kısa videoları ve açıklamalarda site bağlantısı, Instagram/TikTok bio bağlantısı; ekşi sözlük/Reddit/forumlarda gerçek soru-cevap katılımı (reklam değil).
5. **Benzersiz veri sayfası:** transfer fiyat tablosu ve otellerin Harem'e mesafesi zaten sitede; bunları "Mekke otelleri Harem'e mesafe tablosu" ve "Cidde–Mekke transfer fiyatları 2026" gibi tek konulu, tarihli sayfalara dönüştür. AI'ın alıntılayacağı türden özgün veri.

## İçerik düzeltmeleri

- 15 blog yazısında doğrulanamayan ifade (TÜRSAB, 7/24, garanti, "Harem'e sıfır", en ucuz) — G11-1.
- "2026 umre turları diyanet" kümesindeki 5 yazı birbiriyle yarışıyor ve 38–54. sıralarda — G8-5 ayrıştırma taslakları (6 kayıt hazır, onay bekliyor).
- llms.txt'deki iki iddia.

## 90 günlük plan

| Hafta | İş | Kim |
|---|---|---|
| 1 | Paket fiyatları; G11 (vize yazısı + blog düzeltmeleri) uygula; llms.txt; /umre-vizesi ve /hizmetler şeması | Kullanıcı + Claude |
| 2 | İl sayfalarına fiyatlı başlık (önce 10 il); "Umreye tursuz gidilir mi" sayfası; ayrıştırma uygula | Claude + Antigravity |
| 3–4 | Google İşletme Profili; sosyal bio bağlantıları; 2 veri sayfası (otel mesafe, transfer fiyat) | Kullanıcı + Antigravity |
| 5–8 | Blog motoru v2 günde 3 taslak (uzun kuyruk, küme dönüşü); haftalık Search Console takibi | Motor + kullanıcı onayı |
| 9–12 | YouTube kısa videolar (vize süreci, transfer, otel seçimi); forum/soru-cevap katılımı; ölçüm ve kümelerin yeniden önceliklendirilmesi | Kullanıcı |

Hedef (gerçekçi, garanti değil): 12 haftada il+fiyat aramalarında ilk 5, "bireysel umre vizesi" ilk 10, "bireysel umre" ilk 20; marka dışı tıklama payının %75'in üstüne çıkması.
