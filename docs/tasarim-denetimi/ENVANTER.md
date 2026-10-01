# Sayfa Tasarım ve İşlev Envanteri (Kod Bazlı Kesin İnceleme)

Bu belge, **Hadi Umreye Gidelim** platformundaki tüm herkere açık sayfaların kaynak kodları (`src/app/(main)/...`) taranarak hazırlanmış gerçek işlev ve tasarım envanteridir. **Planlanan veya varsayımsal hiçbir özellik yazılmamış; sadece koda dayalı gerçekler listelenmiştir.**

---

## 1. Sayfa Bazlı Kod ve İşlev Envanteri

### 1.1 Ana Sayfa (`/`)
- **Kaynak Dosya:** `src/app/(main)/page.tsx`
- **Ham `<img>` Sayısı (`grep -c "<img"`):** 0
- **Ekran Görüntüleri:** `docs/tasarim-denetimi/goruntuler/01-ana-sayfa-desktop.png`, `01-ana-sayfa-mobile.png`
- **Gerçek İşlevler ve Kod Konumları:**
  - Planlayıcı Adım Seçimleri & Tarih/Gece Formu: `src/components/home/UmrePlanner.tsx:L12-45` (`onClick`, `select`, `input`)
  - "Teklif Al / Niyet Et" Yönlendirmesi: `src/app/(main)/page.tsx:L168` (`<Link href="/paketler/checkout">`), `L237` (`<Link href="/bireysel-umre">`)
  - İletişim Butonu: `src/app/(main)/page.tsx:L242` (`<Link href="/iletisim">`)
  - Hero Video & Kapak: `src/components/home/HeroVideo.tsx:L10-35`
  - SSS Akordeon Panelleri: `src/components/home/Faq.tsx:L15-40` (`onClick` açılır/kapanır panel)
  - WhatsApp Canlı Desteği: `src/components/common/FloatingWhatsApp.tsx:L20-45` (`https://wa.me/905404010038`)

---

### 1.2 Paketler Liste Sayfası (`/paketler`)
- **Kaynak Dosya:** `src/app/(main)/paketler/page.tsx`
- **Ham `<img>` Sayısı:** 0
- **Ekran Görüntüleri:** `docs/tasarim-denetimi/goruntuler/02-paketler-desktop.png`, `02-paketler-mobile.png`
- **Gerçek Durum & İşlevler:**
  - **Düzeltilmiş Gerçek:** `/paketler` sayfasında arama, kategori veya tarih **filtresi YOKTUR**. Tüm paketler doğrudan Prisma veritabanından çekilip listelenir (`src/app/(main)/paketler/page.tsx:L12-30`).
  - Paket Detayına Geçiş: `src/app/(main)/paketler/page.tsx:L45` (`<Link href={`/paketler/${pkg.slug}`}>`)
  - Paket Kartı Fiyat ve Süre Rozetleri: `src/app/(main)/paketler/page.tsx:L50-65`

---

### 1.3 Paket Detay Sayfası (`/paketler/kutlu-rota-ibadet-ve-kesif-886`)
- **Kaynak Dosya:** `src/app/(main)/paketler/[slug]/page.tsx`
- **Ham `<img>` Sayısı:** 2 (`src/app/(main)/paketler/[slug]/page.tsx:L88, L102` - Otel/galeri görselleri)
- **Ekran Görüntüleri:** `docs/tasarim-denetimi/goruntuler/03-paket-detay-desktop.png`, `03-paket-detay-mobile.png`
- **Gerçek İşlevler ve Kod Konumları:**
  - Dâhil Hizmetler Listesi ve Otel Bilgisi: `src/app/(main)/paketler/[slug]/page.tsx:L60-120`
  - WhatsApp Sorgu Düğmesi: `src/app/(main)/paketler/[slug]/page.tsx:L140` (`https://wa.me/905404010038?text=...`)
  - "Teklif Al / İncele" Yönlendirmesi: `src/app/(main)/paketler/[slug]/page.tsx:L155` (`<Link href="/bireysel-umre">`)

---

### 1.4 Bireysel Umre ve Adım Sayfaları (`/bireysel-umre/*`)
- **Kaynak Dosyalar:** `src/app/(main)/bireysel-umre/...`
  - `/bireysel-umre` -> `src/app/(main)/bireysel-umre/page.tsx` (`<img`: 0)
  - `/bireysel-umre/konaklama` -> `src/app/(main)/bireysel-umre/konaklama/page.tsx` (`<img`: 1)
  - `/bireysel-umre/transfer` -> `src/app/(main)/bireysel-umre/transfer/page.tsx` (`<img`: 1)
  - `/bireysel-umre/tren` -> `src/app/(main)/bireysel-umre/tren/page.tsx` (`<img`: 0)
  - `/bireysel-umre/ekstralar` -> `src/app/(main)/bireysel-umre/ekstralar/page.tsx` (`<img`: 1)
  - `/bireysel-umre/rehber` -> `src/app/(main)/bireysel-umre/rehber/page.tsx` (`<img`: 1)
  - `/bireysel-umre/ozet` -> `src/app/(main)/bireysel-umre/ozet/page.tsx` (`<img`: 0)
- **Ekran Görüntüleri:** `docs/tasarim-denetimi/goruntuler/04-10-bireysel-umre-*.png`
- **Gerçek İşlevler ve Kod Konumları:**
  - Otel Arama & Şehir Değiştirme: `src/app/(main)/bireysel-umre/konaklama/page.tsx:L47` (`fetch('/api/hotels?city=...')`), `L148, L153` (`onClick` şehir değişimi), `L229` (`onClick` otel seçimi)
  - Transfer Servisleri Yükleme: `src/app/(main)/bireysel-umre/transfer/page.tsx:L16` (`fetch('/api/services')`), `L193` (`onClick` araç seçimi)
  - Tren Bilet Seçimi: `src/app/(main)/bireysel-umre/tren/page.tsx:L16` (`fetch('/api/services')`), `L157, L169` (`onClick` sınıf seçimi)
  - Ekstralar Ekleme: `src/app/(main)/bireysel-umre/ekstralar/page.tsx:L15` (`fetch('/api/services')`), `L92` (`onClick` toggleExtra)
  - Rehber Seçimi: `src/app/(main)/bireysel-umre/rehber/page.tsx:L16` (`fetch('/api/guides')`), `L81` (`onClick` rehber seçimi)
  - Sipariş Kaydı & WhatsApp Paylaşımı: `src/app/(main)/bireysel-umre/ozet/page.tsx:L55` (`fetch('/api/orders')`), `L95` (`https://wa.me/...`), `L365` (`onClick={handleWhatsAppShare}`)

---

### 1.5 Blog Ana Sayfa, Yazı ve Kategori (`/blog/*`)
- **Kaynak Dosyalar:**
  - `/blog` -> `src/app/(main)/blog/page.tsx` (`<img`: 0)
  - `/blog/[slug]` -> `src/app/(main)/blog/[slug]/page.tsx` (`<img`: 0 - veritabanı HTML hariç)
  - `/blog/kategori/[slug]` -> `src/app/(main)/blog/kategori/[slug]/page.tsx` (`<img`: 1)
- **Ekran Görüntüleri:** `docs/tasarim-denetimi/goruntuler/11-13-blog-*.png`
- **Gerçek Durum & İşlevler:**
  - **Düzeltilmiş Gerçek:** `/blog` ana sayfasında arama çubuğu veya arama girdisi **YOKTUR**. Yalnızca veritabanındaki kategoriler sekmeler halinde listelenir (`src/app/(main)/blog/page.tsx:L62`).
  - Kategori Sekmeleri Yönlendirmesi: `src/app/(main)/blog/page.tsx:L62` (`<Link href={`/blog/kategori/${cat.slug}`}>`)
  - Kart Tıklama ile Yazıya Geçiş: `src/app/(main)/blog/page.tsx:L141` (`<Link href={`/blog/${post.slug}`}>`)
  - Yazı İçi Dinamik İçindekiler Navigasyonu: `src/app/(main)/blog/[slug]/page.tsx:L319` (`href={`#${item.id}`}`)
  - Sosyal Medya Bağlantıları: `src/app/(main)/blog/[slug]/page.tsx:L423` (LinkedIn), `L428` (X/Twitter)

---

### 1.6 Hizmetler, Rehberlik ve Keşifler (`/hizmetler`, `/rehberlik`, `/gizli-mucevher`, `/kesifler`)
- **Kaynak Dosyalar:**
  - `/hizmetler` -> `src/app/(main)/hizmetler/page.tsx` (`<img`: 1)
  - `/rehberlik` -> `src/app/(main)/rehberlik/page.tsx` (`<img`: 4)
  - `/gizli-mucevher` -> `src/app/(main)/gizli-mucevher/page.tsx` (`<img`: 0)
  - `/kesifler` -> `src/app/(main)/kesifler/page.tsx`
- **Ekran Görüntüleri:** `docs/tasarim-denetimi/goruntuler/14-16-*.png`
- **Gerçek Durum:**
  - **Düzeltilmiş Gerçek:** `/kesifler` adresi canlı ortamda **404 Hatası** vermektedir.
  - Rehberlik Sayfası Bireysel Umre Butonu: `src/app/(main)/rehberlik/page.tsx:L183` (`<Link href="/bireysel-umre">`)

---

### 1.7 Vize ve Vize Başvuru Sayfası (`/umre-vizesi`, `/umre-vizesi/basvuru`)
- **Kaynak Dosyalar:**
  - `/umre-vizesi` -> `src/app/(main)/umre-vizesi/page.tsx` (`<img`: 0)
  - `/umre-vizesi/basvuru` -> `src/app/(main)/umre-vizesi/basvuru/page.tsx` (`<img`: 0)
- **Ekran Görüntüleri:** `docs/tasarim-denetimi/goruntuler/17-18-umre-vizesi-*.png`
- **Gerçek Durum & İşlevler:**
  - **Düzeltilmiş Gerçek:** `/umre-vizesi/basvuru` sayfasındaki form **pasaport numarası veya dosya yükleme istemez**. İstenen gerçek alanlar: Ad Soyad, E-posta, Telefon Numarası, Not/Mesaj'dır (`src/app/(main)/umre-vizesi/basvuru/page.tsx:L70-130`).
  - Vize Başvuru Formu İletişim Butonları: `src/app/(main)/umre-vizesi/basvuru/page.tsx:L85` (`<Link href="/umre-vizesi">`), `L106` (`<Link href="/bireysel-umre">`)
  - Rehber Yönlendirme Düğmeleri: `src/app/(main)/umre-vizesi/page.tsx:L64, L157, L160, L163`

---

### 1.8 İletişim ve Hakkımızda (`/iletisim`, `/hakkimizda`)
- **Kaynak Dosyalar:**
  - `/iletisim` -> `src/app/(main)/iletisim/page.tsx` (`<img`: 0)
  - `/hakkimizda` -> `src/app/(main)/hakkimizda/page.tsx` (`<img`: 0)
- **Ekran Görüntüleri:** `docs/tasarim-denetimi/goruntuler/19-20-*.png`
- **Gerçek İşlevler:**
  - İletişim Sayfası Yönlendirmesi: `src/app/(main)/hakkimizda/page.tsx:L96` (`href="/iletisim"`)

---

### 1.9 Rehber, Şehir ve Sezon Sayfaları (`/umre-rehberi`, `/umre-rehberi/[slug]`, `/[slug]`)
- **Kaynak Dosyalar:**
  - `/umre-rehberi` -> `src/app/(main)/umre-rehberi/page.tsx` (`<img`: 0)
  - `/umre-rehberi/[slug]` -> `src/app/(main)/umre-rehberi/[slug]/page.tsx` (`<img`: 0)
  - Şehir/Sezon Landing Sayfaları -> `src/app/(main)/[slug]/page.tsx` (`<img`: 0)
- **Ekran Görüntüleri:** `docs/tasarim-denetimi/goruntuler/21-26-*.png`
- **Gerçek İşlevler:**
  - Bireysel Umre ve Vize Bağlantıları: `src/app/(main)/[slug]/page.tsx:L222` (`<Link href="/umre-vizesi">`), `L248` (`<Link href="/ilk-umrem">`)
  - Rehber Sayfası Tasarlayıcı Bağlantısı: `src/app/(main)/umre-rehberi/page.tsx:L30` (`<Link href="/bireysel-umre">`)

---

## 2. Özet İstatistikler ve Öncelik Sırası

1. **Toplam Ham `<img>` Sayısı (Tüm Sayfalar):** 11 adet.
2. **Faz Y3 Sayfa Dönüştürme Sırası:**
   - **1.** `/paketler` (Liste ve Detay)
   - **2.** `/bireysel-umre` (Planlayıcı v2 akışı ile)
   - **3.** `/blog` (Liste, Yazı ve Kategori)
   - **4.** `/hizmetler`
   - **5.** `/rehberlik` ve `/gizli-mucevher`
   - **6.** `/umre-vizesi` ve `/umre-vizesi/basvuru`
   - **7.** Kurumsal, rehber ve şehir sayfaları.
