# Yeni nesil hadiumreyegidelim.com: ana plan (2 Ekim 2026)

**Hedef:** Kendi fiyatlarımızla çalışan, tek tasarım dilinde, Google ve yapay zekâ asistanlarının kaynak gösterdiği ve müşteri yönlendirdiği bir umre sitesi.

**Rakip konumu:** Otelde büyük otel rezervasyon siteleriyle, bireysel umrede bireysel umre platformlarıyla yarışıyoruz. Fark: **otel + vize + transfer + tren + rehberlik tek planda, aylık güncel kendi fiyatımızla, Türkçe ve insan desteğiyle.**

**İş bölümü:** Claude Code mimariyi, veri modelini, fiyat motorunu, temel bileşenleri ve denetimi yapar. Antigravity sayfa dönüşümlerini, veri girişi hazırlığını ve içerik taslaklarını yapar ("angarya"). Kullanıcı fiyatları, kararları ve onayları verir.

## 0. Değişmez kurallar (bu plan için ek)

- Fiyat yalnızca bizim verimizden gelir (admin). Dış fiyat servisi kalmaz (RapidAPI uçuş servisi kaldırılacak).
- Sabit kalanlar: Haremeyn hızlı treni ve bazı araç tipleri (fiyatları yine admin'den).
- Rakip firma adı içerikte geçmez (önceki kural). Rekabet, kategori karşılaştırmasıyla yapılır ("otel sitesi mi, umre planlayıcısı mı?").
- Görünümü değiştiren her iş önce yerelde (localhost:3002) gösterilir; onay olmadan canlıya çıkmaz.
- Veritabanı değişikliği yalnızca kullanıcı onayıyla, ham SQL ile (Supabase; `prisma db push` kullanılmaz).
- Paralel çalışmada dosya sahipliği: aşağıdaki paketlerde yazan dosyalar dışına çıkılmaz.

## 1. Fazlar

### Y0 · Hazırlık (Claude) — başladı
- [x] Uçuş servisindeki açık RapidAPI anahtarı koddan kaldırıldı (2 Ekim). **Kullanıcı: RapidAPI panelinden anahtarı iptal et.** Anahtar GitHub geçmişinde duruyor.
- [x] **Tasarım temel bileşenleri** `src/components/ui/kit/` *(2 Ekim; vitrin: localhost:3002/kit; ana sayfa kitle yeniden kuruldu, görünüm aynı)*: ana sayfanın dilinden çıkarılır. İçerik: SectionHead, Card (görselli/görselsiz), PriceTag ("… USD'den"), Badge, Button (birincil, ikincil, WhatsApp), Stepper, EmptyState, PageHero, Breadcrumb. Ana sayfa bunlarla yeniden kurulur (görünüm aynı kalır).
- [x] **Tasarım kılavuzu** `docs/TASARIM-DILI.md`: renk, yazı, boşluk, köşe, gölge, ikon (alt küme kuralı), görsel (`next/image` zorunlu), hareket.

### Y1 · Kendi fiyat kataloğumuz (Claude; DB onayı alındı 2 Ekim)
- [x] Şema: `ServiceLibrary` + yeni alanlar, `ServicePrice` (aylık satış fiyatı). İlk admin erişiminde `ensureCatalogSchema()` ile oluşur (yalnızca ekleme).
- [x] Admin: Hizmet Kütüphanesi formunda "Sitede göster" bölümü + Temmuz'da kaybolan alanlar geri geldi (açıklama, fiyatlandırma tipi, araç, çocuk %, ek yatak). Yeni ekran: **Aylık Satış Fiyatları** (`/admin/fiyat-teklifleri/hizmetler/fiyatlar`), ay kopyalama + % artış.
- [x] Site okuma katmanı `src/lib/catalog` (maliyet seçilmez, önbellek + anında tazeleme).
- [ ] Kullanıcı: otelleri ve hizmetleri "Sitede göster" ile işaretleyip aylık fiyatları girer (ya da Antigravity'nin CSV şablonu).
- [ ] Eski `Service`/`Hotel` → kütüphane taşıma ve eski uç noktaların kaldırılması (Y2 ile).
Bugünkü durum:
- `Service` (eski; tek fiyat) ve `Hotel` (eski; tek fiyat) planlayıcıyı besliyor.
- `ServiceLibrary` (admin Hizmet Kütüphanesi) yalnızca **maliyet** tutuyor ve fiyat teklifi motorunu besliyor.

Hedef: **tek katalog, aylık satış fiyatı.**
- `ServiceLibrary`'ye eklenecek alanlar:
  - `isPublic`: sitede görünsün mü;
  - `slug`, `imageUrl`, `publicDescription`;
  - `city`: Mekke, Medine, Cidde, Türkiye kalkış;
  - `hotelStars`, `distanceMeters`: otel ise;
  - `fixed`: tren gibi sabit kalemler.
- Yeni tablo `ServicePrice`:
  - alanlar: `serviceId`, `month` (YYYY-MM), `roomType` (oteller: 2, 3, 4 kişilik), `salePriceUsd`, `note`;
  - **aylık bazda artan fiyatlar** buradan gelir;
  - maliyet ayrı kalır, sitede **asla** gösterilmez.
- Admin → Hizmet Kütüphanesi'ne **"Aylık satış fiyatları"** ekranı:
  - 12 aylık tablo;
  - "önceki ayı kopyala + %x artır" düğmesi.
- Eski `Service` ve `Hotel` kayıtları kütüphaneye taşınır (taşıma betiği Claude; kontrol listesi Antigravity). Taşımadan sonra eski uç noktalar (`/api/hotels`, `/api/services`, `/api/flights`) kaldırılır.
- **Uçuş:** canlı bilet araması yok. Kütüphanede kalkış şehri × ay için "tahmini uçuş fiyatı" kalemi var; teklifte "uçuşu biz ayarlarız" ya da "kendim alacağım" seçeneği.

### Y2 · Bireysel umre planlayıcısı v2 (Claude)
- [x] Fiyat motoru `src/lib/pricing/plan.ts` (`quotePlan`, `planToText`); birim testi: 3 kişi / 2 oda örneği elle hesapla aynı.
- [x] Ekran `src/components/planner/PlannerV2.tsx`: 6 adım + sağda canlı özet (mobilde alt çubuk); seçimler adres çubuğunda (`?ay=&mekke=&medine=&yetiskin=&cocuk=&oda=&mekkeotel=&medineotel=&ucus=&kalkis=&ek=`).
- [x] Talep uç noktası `POST /api/plan-request`: fiyat sunucuda yeniden hesaplanır; admin → İletişim'e "Bireysel umre planı" (AI'dan geldiyse "· AI: ChatGPT" vb.) olarak düşer + yönetici bildirimi.
- [x] Önizleme: **`/bireysel-umre/yeni`** (noindex, sitemap'te yok). Katalog dolunca ve kullanıcı onaylayınca `/bireysel-umre`'ye taşınır, eski 6 adım sayfası 301.
- [ ] Admin'de talepten tek tıkla Fiyat Teklifi oluşturma.
- Ana sayfadaki planlayıcı çubuğu ile aynı dil. Tek sayfa, adım adım:
  1. tarih ve gece;
  2. kişi ve oda;
  3. Mekke oteli;
  4. Medine oteli;
  5. ulaşım (uçuş seçeneği, transfer, hızlı tren);
  6. ekstralar (rehber, ziyaretler, vize 140 USD);
  7. özet.
- **Fiyat motoru** (`src/lib/pricing/`, Claude):
  - seçilen ayın satış fiyatlarıyla canlı toplam ("kişi başı … USD");
  - fiyat teklifi motoru (`quotation-calc.ts`) ile aynı hesap kuralları: kişi başı, araç başı, oda başı.
- Özet ekranında üç çıkış:
  1. WhatsApp'a numaralı plan;
  2. talep olarak CRM'e düşer;
  3. admin'de tek tıkla **Fiyat Teklifi'ne** dönüşür (PDF).
- Eski 7 sayfalık akış (`/bireysel-umre/konaklama`, `/transfer`, `/tren`, `/ekstralar`, `/rehber`, `/ozet`) yeni sayfaya 301.

### Y3 · Tasarım birliği (Antigravity sayfa sayfa, Claude denetim)
Sıra (trafik ve satış önemine göre):
1. `/paketler` liste ve detay (ürün kartları);
2. `/bireysel-umre` (Y2 ile birlikte);
3. `/blog`, yazı sayfası, kategori;
4. `/hizmetler`;
5. `/rehberlik`, `/kesifler`, `/gizli-mucevher`;
6. `/umre-vizesi`, `/iletisim`, `/hakkimizda`;
7. kampanya sayfaları.

Her sayfa için:
- yalnızca kit bileşenleri kullanılır;
- görseller `next/image` ile;
- yeni ikon eklenirse alt küme güncellenir;
- yerelde önce/sonra ekran görüntüsü alınır (masaüstü + 390 px);
- Lighthouse mobil ≥ 85, erişilebilirlik ≥ 95;
- kullanıcı onayı;
- hiçbir düğme, alan ya da işlev kaldırılmaz (Temmuz yenilemesindeki işlev kaybı tekrarlanmaz).

### Y4 · Rekabet sayfaları (kendi fiyatlarımızla)
- `/oteller/mekke`, `/oteller/medine`, `/oteller/<otel>`:
  - kendi otellerimiz, Harem'e mesafe, oda tipleri;
  - **ayın fiyatı** ve "bu otelle plan yap" düğmesi;
  - Hotel ve Offer şeması.
- `/umre-fiyatlari`: ayın paket ve bireysel umre başlangıç fiyatları, aylık tablo (B2).
- Şehir sayfaları: "{İl} Umre Fiyatları 2026" + gerçek başlangıç fiyatı (H13).
- Karşılaştırma rehberleri (rakip adı yok):
  - "Umre oteli nereden alınır? Otel sitesi mi, umre planlayıcısı mı?";
  - "Bireysel umre platformu seçerken 7 soru".

### Y5 · Yapay zekâ asistanlarında kaynak olmak ve müşteri almak
Durum: son 4 günde 1 öneri (AI Görünürlük). Hedef: fiyat ve otel sorularında kaynak gösterilmek, bağlantıyla müşteri almak.

1. **Ölçüm (Claude):**
   - yapay zekâdan gelen ziyareti ayırt et: referrer'da chatgpt.com, perplexity.ai, gemini.google.com, copilot.microsoft.com; `utm_source`;
   - talep ve siparişe "kaynak: AI / hangi asistan" yaz;
   - admin'de rapor.
2. **Alıntılanabilir gerçekler:**
   - her fiyat sayfasında "Ekim 2026 itibarıyla … USD'den" cümlesi ve tarih;
   - Offer şeması;
   - `llms.txt`'e ayın fiyatları, oteller ve "nasıl rezervasyon yapılır".
3. **Varlık sinyalleri:**
   - Organization şemasında adres, telefon, kurucu, `sameAs`;
   - Google İşletme Profili (kullanıcı);
   - tutarlı ad: "Hadi Umreye Gidelim".
4. **Asistanın doğrudan yönlendirebileceği adresler:**
   - planlayıcı sorgu parametreleriyle açılır: `/bireysel-umre?ay=2026-11&gece=9&kisi=2&otel=…`;
   - fiyat sayfaları ve "teklif al" bağlantısı düz, kalıcı adresler.
5. **Site dışı anılma (kullanıcı + Antigravity taslak):** soru-cevap siteleri, forumlar, YouTube açıklamaları, yerel rehberler. Satın alınmış bağlantı yok (D3).
6. **Haftalık ölçüm:** AI Görünürlük soruları fiyat ve otel sorularıyla genişletilir.

### Y6 · Altyapı ve skill'ler
- Her faz sonunda denetimler `claude-seo` / `geo-*` ajanlarıyla yapılır: teknik SEO, şema, GEO, performans. Sonuç CALISMA-KAYDI'na yazılır.
- Kod sağlığı: eski, kullanılmayan sayfalar ve API'ler; `any` temizliği; tip güvenliği.

## 2. Sıra ve bağımlılıklar

```
Y0 (kit + kılavuz) ──► Y3 (Antigravity sayfa dönüşümleri, paralel)
Y1 (katalog, DB onayı) ──► Y2 (planlayıcı v2) ──► Y4 (oteller, fiyatlar) ──► Y5.2/Y5.4
Y5.1 (AI ölçümü) hemen başlayabilir
```

## 3. Kullanıcıdan gerekenler

1. RapidAPI anahtarını iptal etmek (güvenlik).
2. Y1 veritabanı değişikliğine onay (yeni alanlar + `ServicePrice` tablosu).
3. Kendi otellerimizin listesi, oda tipleri ve aylık satış fiyatları; transfer, araç ve tren fiyatları; tahmini uçuş fiyatları (kalkış şehri × ay). Antigravity bunun için bir Excel/CSV şablonu hazırlar.
4. Y3'te her sayfa grubu için onay.
5. Google İşletme Profili, sosyal hesaplar (Y5.3).
