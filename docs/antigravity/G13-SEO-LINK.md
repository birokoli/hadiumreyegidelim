# G13 · Otel açıklamaları + link iş listesi + sömestr umresi taslağı (3 Ekim)

Kurallar G8–G12 ile aynı: commit/push yok; yalnızca listelenen dosyalar; "bu arada" düzeltme yok; kanıt (komut + gerçek çıktı) TESLIM.md en üstüne tek "G13" kaydı. Veritabanına yazma yok (yerel veritabanını yalnızca OKUYABİLİRSİN, bkz. docs/antigravity/YEREL-VERITABANI.md). Gizli anahtar/parola yazma, isteme, dosyaya koyma.

Yasak ifadeler (her maddede): TÜRSAB, diyanetsiz, "Harem'e sıfır", "Kabe'ye sıfır", 7/24, kesintisiz, lüks, VIP, eşsiz, garanti, "en ucuz", "en iyi", rakip firma adları, kapıda vize, Schengen. Fiyat yazma (fiyatlar sistemden gelir). Uydurma bilgi yazma: doğrulayamadığın her bilgiyi çıkar.

## G13-1 · Otel açıklamaları
**Dosya:** yeni `docs/veri/otel-aciklamalari.json`

Yerel veritabanında `ServiceLibrary` tablosunda `category = 'hotel'` ve `"isPublic" = true` olan her otel için (slug ile) bir kayıt:
```json
{ "slug": "...", "name": "...", "description": "...", "facts": [{ "text": "...", "source": "https://..." }] }
```
- `description`: 120–200 kelime, Türkçe, sade; otelin konumu (hangi bölge, Harem'e yürüyüş/servis durumu), oda tipleri, kahvaltı/yemek seçenekleri, umreciler için pratik bilgiler. Satış dili yok.
- `facts`: description'daki her somut bilgi (mesafe, yıldız, servis, oda tipi) için **otelin resmî sitesi, Booking/Google Haritalar ya da zincirin sayfası** kaynak bağlantısı. Kaynağı olmayan bilgi description'a girmez.
- Veritabanındaki `distanceMeters` ve `hotelStars` ile çelişen bilgi yazma; çelişki varsa kaydın sonuna `"conflict": "..."` alanı ekle.

Kanıt: kayıt sayısı = yerel veritabanındaki yayımlı otel sayısı (sorgu + çıktı).

## G13-2 · Link iş listesi (kullanıcının yapacağı işler)
**Dosya:** yeni `docs/taslaklar/link-is-listesi.md`

Kullanıcı bu listeyle tek tek kayıt açacak. Her kalem için: site adı, kayıt sayfası bağlantısı, ücretsiz mi ücretli mi (resmî sayfadan, tarihli), gereken bilgiler, **kopyala-yapıştır hazır metinler** (kısa açıklama 160 karakter, uzun açıklama 750 karakter, kategori önerisi), link dofollow mu nofollow mu (doğrulanmadıysa "doğrulanmadı").

Kalemler:
1. Google İşletme Profili, Bing Places, Apple Business Connect, Yandex Haritalar (Yandex Business), Foursquare.
2. turizmrehber.com.tr, nerdeler.com.tr, travelagents10.com (rakiplere link veren rehberler: nasıl listeleniyorlar, ücret).
3. ankaraguncel.com.tr: tanıtım yazısı (advertorial) ücreti ve koşulları; ücretli yazıda bağlantının `rel="sponsored"` olması şartını not et.
4. Sosyal profiller: Instagram, Facebook, YouTube, TikTok, X, LinkedIn, Pinterest biyografi metinleri (her platformun karakter sınırına göre) ve site bağlantısı.
5. İş ortağı mesajı: otel, transfer ve rehber iş ortaklarına "sitenizde iş ortaklarımız bölümüne bağlantı" ricası, WhatsApp (kısa) ve e-posta (uzun). Saygılı, kısa.

İşletme bilgileri (NAP) her yerde aynı olmalı: ad **Hadi Umreye Gidelim**, adres **Bakırköy, İstanbul**, site **https://hadiumreyegidelim.com**. Telefonu sitenin iletişim sayfasından al. Kurum satırı: MBD Tourism L.L.C. bünyesinde, DTCM lisans no 1203162.

## G13-3 · Sömestr umresi sayfa taslağı
**Dosya:** yeni `docs/taslaklar/somestr-umresi.md`

"sömestr umresi" (aylık ~9.900 arama) için sayfa metni taslağı:
- 2026–2027 yarıyıl tatilinin **resmî tarihleri** (MEB kaynağı, bağlantıyla; açıklanmadıysa "MEB henüz açıklamadı" yaz).
- Ocak–şubat Mekke/Medine hava durumu (kaynaklı), kalabalık durumu, çocukla umre için pratik notlar.
- Planlama adımları: bireysel umre tasarlayıcısı (`/bireysel-umre`) ve paketler (`/paketler`) bağlantılarıyla.
- Vize süreci şu şekilde anlatılır (başka türlü anlatma): müşteri otel rezervasyonu, gidiş-dönüş uçak bileti, her yolcu için pasaportun ön yüzü ve biyometrik fotoğrafı WhatsApp'tan gönderir; kişi başı 140 USD ödenir; vize 2 saat içinde hadiumreyegidelim.com tarafından iletilir.
- 6–8 soruluk SSS.
- 900–1300 kelime. Başlık önerisi (60 karakter altı) ve açıklama (155 karakter altı).
