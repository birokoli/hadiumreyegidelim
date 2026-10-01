# Sayfa Tasarım ve İşlev Envanteri (Y3 Dönüşüm Rehberi)

Bu belge, **Hadi Umreye Gidelim** platformundaki tüm herkese açık sayfaların tasarım tutarsızlıklarını, kullanılan bileşenlerini, işlev envanterini ve Faz Y3 için dönüştürme önceliklerini sıralar.

---

## 1. Sayfa Bazlı Envanter ve Denetim Listesi

### 1.1 Ana Sayfa (`/`)
- **Ekran Görüntüleri:** `goruntuler/01-ana-sayfa-desktop.png`, `goruntuler/01-ana-sayfa-mobile.png`
- **Kullanılan Bileşenler:** Header Navbar, Hero Video/Kapak (`HeroVideo`), Umre Planlayıcı Bar (`UmrePlanner`), Kampanya Kartları, Paket Kartları, VIP Vurgu Bloğu, Blog Kartları, SSS Akordeonu, Footer, WhatsApp Yüzen Düğme.
- **Tasarım Standartları:** Ana sayfa referans tasarım sistemidir (Primary `#003781`, Koyu Yeşil CTA `#15803d`, Köşe yarıçapı `1rem / 16px`, Inter & Noto Serif fontları).
- **Sayfa İşlevleri Listesi (Dönüşümde Korunacak):**
  - [x] Tarih, gece, kişi, Mekke ve Medine otel seçimli Umre Planlayıcı formu.
  - [x] "Teklif Al" ve "Niyet Et" butonları ile planlayıcı yönlendirmesi.
  - [x] Kampanya kartları tıklama ve teklif alma aksiyonu.
  - [x] Öne çıkan paket kartlarından paket detayına geçiş.
  - [x] Manevi rehberlik blog yazıları listesi ve detayına geçiş.
  - [x] SSS akordeon açılır/kapanır bilgi panelleri.
  - [x] WhatsApp hızlı iletişim yüzen butonu.

---

### 1.2 Paketler Liste ve Detay (`/paketler`, `/paketler/<slug>`)
- **Ekran Görüntüleri:** `goruntuler/02-paketler-desktop.png`, `goruntuler/03-paket-detay-desktop.png`
- **Kullanılan Bileşenler:** PageHero, Paket Filtre Barı, Paket Kartları GRID, Dahil Hizmet Çipleri, Detay Modalı / Sayfası, İncele & WhatsApp Butonları.
- **Tasarım Sapmaları:**
  - Bazı paket kartlarında rounded-2xl ve rounded-3xl karmaşası mevcuttur; kit/Card ile rounded-2xl (16px) standardına getirilecektir.
  - Fiyat gösteriminde "… USD'den başlayan" etiketlerinde font büyüklükleri tutarsızdır; kit/PriceTag kullanılacaktır.
- **Sayfa İşlevleri Listesi:**
  - [x] Paket arama ve filtreleme (süre, otel yıldızı, dönem).
  - [x] Paket kartından detaya geçiş.
  - [x] Paket detayında dâhil olan hizmetlerin (vize, otel, transfer, rehberlik) listelenmesi.
  - [x] "Teklif Al / İncele" butonu ile başvuru modali veya planlayıcıya aktarım.
  - [x] Doğrudan paket özelinde WhatsApp üzerinden iletişim başlatma.

---

### 1.3 Bireysel Umre ve Akış Adımları (`/bireysel-umre/*`)
- **Ekran Görüntüleri:** `goruntuler/04-bireysel-umre-desktop.png` (ve `04a-e` adım görüntüleri)
- **Kullanılan Bileşenler:** Stepper (Adım Göstergesi), Form Panelleri, Otel Seçim Kartları, Transfer Seçim Kartları, Vize Seçim Kartı, Özet Bütçe Kutusu, Fiyat Teklifi Butonu.
- **Tasarım Sapmaları:**
  - Eski 7 adımlı akışta form elemanları farklı Tailwind input ve select sınıfları kullanmaktadır. Y2 ve Y3 fazında tek sayfa adımlı kit/Stepper yapısına geçirilecektir.
- **Sayfa İşlevleri Listesi:**
  - [x] Adım 1: Tarih, gece ve kişi sayısı seçimi.
  - [x] Adım 2: Mekke oteli seçimi (Harem mesafesi ve yıldız bilgisiyle).
  - [x] Adım 3: Medine oteli seçimi.
  - [x] Adım 4: Ulaşım seçimi (Uçuş, transfer, Haramain hızlı tren).
  - [x] Adım 5: Ekstralar (Vize 140 USD, manevi rehberlik, ziyaretler).
  - [x] Adım 6: Özet bütçe hesabı ve teklif alma / WhatsApp / CRM kaydı.

---

### 1.4 Blog, Yazı Detay ve Kategoriler (`/blog`, `/blog/<slug>`, `/blog/kategori/<slug>`)
- **Ekran Görüntüleri:** `goruntuler/05-blog-desktop.png`, `goruntuler/06-blog-yazi-desktop.png`, `goruntuler/07-blog-kategori-desktop.png`
- **Kullanılan Bileşenler:** BlogHero, Kategori Sekmeleri, Blog Kartları GRID, İçindekiler Navigasyonu (TOC), Yazar İnceleme Kutusu, Çağrı Kutusu (aside CTA), İlgili Yazılar.
- **Tasarım Sapmaları:**
  - Veritabanından gelen HTML içeriklerde ham img etiketleri bulunmaktadır. next/image dönüştürücü servis kullanılmaktadır.
  - Yazı detayındaki blockquote ve aside alanlarındaki yeşil/mavi renk tonları ana sayfa renk paletiyle (kit) eşcellenecektir.
- **Sayfa İşlevleri Listesi:**
  - [x] Blog yazıları arama ve kategori sekmeleriyle filtreleme.
  - [x] Yazı içi dinamik içindekiler (TOC) tıklanabilir başlık navigasyonu.
  - [x] Yazar profil kartı ve biyografisi.
  - [x] Yazı içi ve sonu WhatsApp / Bireysel Umre yönlendirme kutuları.
  - [x] Benzer / İlgili blog yazıları listesi.

---

### 1.5 Hizmetler, Rehberlik, Keşifler ve Gizli Mücevher (`/hizmetler`, `/rehberlik`, `/kesifler`, `/gizli-mucevher`)
- **Ekran Görüntüleri:** `goruntuler/08-hizmetler-desktop.png`, `goruntuler/09-rehberlik-desktop.png`, `goruntuler/10-kesifler-desktop.png`, `goruntuler/11-gizli-mucevher-desktop.png`
- **Kullanılan Bileşenler:** Rehber Kartları, Lokasyon Kartları, Harita/Şehir Filtreleri, Detay Butonları.
- **Tasarım Sapmaları:**
  - Rehberlik sayfasında başlık ve ikon kullanımlarında küçük tipografi farkları vardır. kit/SectionHead ile standartlaşacaktır.
- **Sayfa İşlevleri Listesi:**
  - [x] Türkçe ilahiyatçı manevi rehber listeleme ve rehber detayı inceleme.
  - [x] Mekke ve Medine tarihi ziyaret durakları ve keşif rehberleri.
  - [x] Rehber veya keşif detayından WhatsApp desteği başlatma.

---

### 1.6 Vize ve Vize Başvuru (`/umre-vizesi`, `/umre-vizesi/basvuru`)
- **Ekran Görüntüleri:** `goruntuler/12-umre-vizesi-desktop.png`, `goruntuler/13-umre-vizesi-basvuru-desktop.png`
- **Kullanılan Bileşenler:** Vize Şartları Bilgi Kartları, Adım Adım Başvuru Şeması, Başvuru Formu (Ad, Soyad, Pasaport No, Telefon, E-posta, Dosya Yükleme).
- **Tasarım Sapmaları:**
  - Başvuru formundaki butonlar kit/Button birincil yeşil/lacivert stillerine çekilecektir.
- **Sayfa İşlevleri Listesi:**
  - [x] Vize ücreti (140 USD) ve gerekli evraklar bilgi paneli.
  - [x] Vize başvuru formu doldurma ve evrak gönderme.
  - [x] Başvuru sonrası WhatsApp veya e-posta teyidi alma.

---

### 1.7 İletişim ve Hakkımızda (`/iletisim`, `/hakkimizda`)
- **Ekran Görüntüleri:** `goruntuler/14-iletisim-desktop.png`, `goruntuler/15-hakkimizda-desktop.png`
- **Kullanılan Bileşenler:** İletişim Formu, Harita Bilgisi, Kurumsal Değerler Kartları, Ekip Üyeleri.
- **Sayfa İşlevleri Listesi:**
  - [x] İletişim formu gönderme.
  - [x] Doğrudan telefon arama ve WhatsApp iletişim bağlantıları.

---

### 1.8 Rehber, Şehir ve Sezon Sayfaları (`/umre-rehberi`, `/umre-rehberi/*`, `/*-cikisli-bireysel-umre`, `/eylul-umresi`, `/ilk-umrem`, `/hanim-umresi`)
- **Ekran Görüntüleri:** `goruntuler/16-21-*.png`
- **Kullanılan Bileşenler:** Rehber Sözlük Kartları, Şehir Çıkışlı Bilgi Panelleri, Özel Sezon / Konsept Kartları.
- **Sayfa İşlevleri Listesi:**
  - [x] Terim ve sözlük içeriklerini inceleme.
  - [x] Şehir çıkışlı paket ve bireysel umre teklifi alma.
  - [x] Konsept seyahatler (Kadınlar için, ilk umre, Eylül umresi) bilgi ve paket yönlendirmesi.

---

## 2. Faz Y3 Sayfa Dönüştürme Öncelik Sırası

Trafik hacmi, dönüşüm etkisi ve satış bağımlılıklarına göre önerilen dönüşüm sırası:

1. **`/paketler` (Liste ve Detay):** Satış dönüşümünün en yüksek olduğu ürün kartları (kit/Card, kit/PriceTag, kit/Button).
2. **`/bireysel-umre`:** Y2 Fazı v2 Planlayıcı akışı ile birlikte kit bileşenlerine aktarım.
3. **`/blog`, Yazı Detayı ve Kategoriler:** Organik trafiğin giriş noktası; tipografi ve next/image bütünleşmesi.
4. **`/hizmetler`:** Hizmet ve rehber teklif panelleri.
5. **`/rehberlik`, `/kesifler`, `/gizli-mucevher`:** Rehber ve lokasyon içerik kartları.
6. **`/umre-vizesi` ve `/umre-vizesi/basvuru`:** Vize başvuru formu ve bilgi panelleri.
7. **`/iletisim`, `/hakkimizda`, Rehber ve Şehir Sayfaları:** Kurumsal ve açılmış SEO landing sayfaları.
