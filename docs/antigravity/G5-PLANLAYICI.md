# G5 · Planlayıcı v2 düzeltmeleri + admin talep ekranı (kullanıcı isteği, 2 Ekim akşamı)

**Durum:** Claude bir saat yok. Bu paketi Antigravity yapar, Claude dönünce kontrol edip canlıya alır.
**Kurallar:** `docs/antigravity/GOREVLER.md` §0 aynen geçerli: **commit ve push YOK**, kanıtlı teslim `docs/antigravity/TESLIM.md`, koda bakmadan yazma.
**Bu paket için dosya izni:** aşağıda her maddenin "Dosyalar" satırında yazanlar. Bu paket süresince bu dosyalar Antigravity'de; Claude dönünce geri alır.
**G2–G4 bekler:** G5 önce. G2'ye başladıysan değişikliklerini bırak, G5'e geç.

## Kullanıcının istekleri (aynen)

1. Hizmet Kütüphanesi'ne bazı oteller vb. eklendi. **"Sitede göster" seçeneği admin'de görünmüyor**, düzeltilsin. Eklenen kayıtlar siteye çekilsin.
2. Alış fiyatları kütüphanede var. **Otelde satış fiyatı = alış × 1,15.**
3. Yeni planlayıcı beğenilmedi:
   - **Uçuş bizde yok, kaldırılacak.**
   - Tarih ay ay değil, **takvimle tarih aralığı** seçilecek.
   - **Otel, otel listesinden müşteri tarafından seçilecek.**
   - **Vize eklenip çıkarılabilmeli:** bazıları kendi alıyor ya da vizesi var.
   - Transfer için kullanıcının daha önce eklediği araçlar şimdilik kullanılacak (kullanıcı yarın bakacak).
4. Admin'de talep görünüyor ama **talebin ne olduğu ve hangi hizmetlerin seçildiği görünmüyor.**

## Mevcut durum (Claude, kod okundu)

- **Planlayıcı ekranı:** `src/components/planner/PlannerV2.tsx`. Önizleme sayfası `src/app/(main)/bireysel-umre/yeni/page.tsx`. Fiyat motoru `src/lib/pricing/plan.ts`. Katalog `src/lib/catalog/index.ts` (yalnızca `isPublic` + `isActive` kalemler; ad "nusuk" içerenler hariç). Talep `src/app/api/plan-request/route.ts`.
- **Hizmet Kütüphanesi:** `src/app/(admin)/admin/fiyat-teklifleri/hizmetler/page.tsx`. "Sitede göster" yalnızca **düzenleme penceresinin içinde** (kalemin kalem simgesine basınca) ve tabloda "Sitede" sütununda yazı olarak var. Kullanıcı bunu görmemiş: ana ekranda doğrudan açılıp kapanan bir anahtar yok.
- **Eski veriler:** `/admin/services` ("Ek Hizmetler", `Service` tablosu: tür HOTEL/TRANSFER/TRAIN/EXTRA, tek `price`) ve `Hotel` tablosu (canlı `/api/hotels`: 18 otel). Kullanıcının "eklediğim oteller" bunlardan birinde ya da kütüphanede olabilir.
- **Talep ekranı:** `src/app/(admin)/admin/contact/page.tsx` `message` alanını **hiç göstermiyor** (`grep -n "message"` → yalnızca 10. satırda tip tanımı). Plan metni `ContactRequest.message`'ta duruyor.

---

## G5.1 · "Sitede göster" görünür olsun + kâr oranları

**Dosyalar:** `src/app/(admin)/admin/fiyat-teklifleri/hizmetler/page.tsx`

1. Tablodaki "Sitede" sütunu **tıklanabilir anahtar** olsun.
   - Tıklayınca `PUT /api/admin/service-library/<id>`; gövdede o satırın mevcut alanları + `isPublic: !isPublic`. (PUT tüm alanları bekliyor; `openEdit`'teki gibi satırdan doldur.)
   - Kaydedince satır güncellenir; hata olursa satırda kırmızı yazı.
2. Sayfanın üstüne **"Sitede göster" filtresi** (Tümü / Sitede / Gizli) ve **"Hepsini sitede göster"** düğmesi (yalnızca o anki kategori filtresindekiler; onay sorusuyla).
3. Düzenleme penceresinde "Sitede göster" kutusu en üste, ad alanının hemen altına taşınsın.
4. Kanıt: değişen satırların `git diff` çıktısı + yerelde sahte API ile (`/kit` yöntemi ya da istek yakalama) anahtarın gönderdiği gövde.

## G5.2 · Satış fiyatı alıştan otomatik (otel %15, diğerleri %10)

**Dosyalar:** `src/lib/catalog/index.ts`, `src/lib/pricing/plan.ts`

Kural:
- **Ayın satış fiyatı girilmişse o** (Aylık Satış Fiyatları ekranı).
- Girilmemişse **alış × (1 + kâr)**.
  - Kâr: `hotel` %15 (kullanıcı kararı), diğer kategoriler %10 (Excel fiyat motoru varsayılanı).
  - Sabit bir nesnede tutulsun: `export const DEFAULT_MARGIN: Record<string, number> = { hotel: 15, default: 10 }`.

1. `queryCatalog()` `select`'ine `defaultCostUsd` ekle. Ama **dışarı verilen `CatalogItem`'a maliyeti koyma.** Yerine yeni alan `basePriceUsd: number | null` = `round2(cost × (1 + kâr/100))`; maliyet 0 ise `null`. Maliyet hiçbir zaman tarayıcıya gitmez.
2. `plan.ts` → `unitPrice()`: ay fiyatı yoksa `item.basePriceUsd`'yi kullan (otel tüm oda tiplerinde aynı fiyat: oda/gece).
3. `PlannerV2.tsx`'teki `price()` yardımcı fonksiyonu da aynı sırayla çalışsın (ay fiyatı → `basePriceUsd`).
4. Kanıt: `src/lib/pricing/plan.ts` için küçük bir tsx testi. Alış 100 olan otel, 2 gece, 1 oda → **230 USD**; alış 50 olan kişi başı transfer, 2 kişi → **110 USD**. Komut çıktısını yapıştır.

## G5.3 · Eski otel ve hizmetleri kütüphaneye aktar

**Dosyalar:** yeni `src/app/api/admin/service-library/import-legacy/route.ts`, `src/app/(admin)/admin/fiyat-teklifleri/hizmetler/page.tsx`

1. `POST /api/admin/service-library/import-legacy`. Oturum kontrolü ve `ensureCatalogSchema()` `src/app/api/admin/service-library/route.ts`'deki gibi.
   - `Hotel` tablosu (`isActive`) → `ServiceLibrary`:
     - `category` hotel; `name`;
     - `city`: "Mekke…" → mekke, "Medine…" → medine;
     - `hotelStars` = stars, `distanceMeters`, `imageUrl` = images'in ilk adresi;
     - `defaultPricingType` per_room, `defaultCostUsd` = price;
     - `isPublic` false.
   - `Service` tablosu → `ServiceLibrary`:
     - tür eşlemesi: HOTEL → hotel (per_room), TRANSFER → transfer (per_vehicle), TRAIN → transfer (per_person), EXTRA → tur (flat);
     - `defaultCostUsd` = price; `isPublic` false.
   - **Kütüphanede aynı ad (büyük-küçük harf duyarsız) varsa atla.** Yanıt: `{ created, skipped }`.
   - `revalidateCatalog()` çağır.
2. Kütüphane sayfasının üstüne "Eski otel ve hizmetleri aktar" düğmesi: onay sorusu → sonuç mesajı ("X kayıt eklendi, Y zaten vardı").
3. Kanıt: uç noktanın kodu + yerelde (veritabanı yok) en azından `tsc` temiz. Gerçek veride Claude canlıda deneyecek.

## G5.4 · Planlayıcı v2 yeniden düzen

**Dosyalar:** `src/components/planner/PlannerV2.tsx`, `src/lib/pricing/plan.ts`, `src/app/api/plan-request/route.ts`, yeni `src/components/planner/DateRangePicker.tsx`

1. **Uçuş tamamen kalkar:**
   - `PlanInput.flight` silinir; `quotePlan`, `planToText`, `/api/plan-request` güncellenir;
   - planlayıcıda uçuş adımı ve uçuş metinleri kalkar;
   - adres parametrelerinden `ucus`, `kalkis` çıkar.
2. **Takvimle tarih aralığı:**
   - Adım 1'de **giriş ve çıkış tarihi** seçilir (`DateRangePicker`). Ana sayfa planlayıcısındaki takvimi örnek al: `src/components/home/UmrePlanner.tsx` (MONTHS, WEEKDAYS, `dayKey`, `nightsBetween`). Aynı görünüm; geçmiş tarih seçilemez.
   - Toplam gece = çıkış − giriş.
   - Mekke ve Medine gece sayıları stepper'larla bölüştürülür; toplam gece sayısını geçemez. Varsayılan: Mekke = ceil(toplam × 0,55), Medine = kalan.
   - `PlanInput`'a `checkIn`, `checkOut` (YYYY-MM-DD) eklenir.
   - Fiyat ayı = giriş tarihinin ayı (`month = checkIn.slice(0,7)`).
   - Adres parametreleri: `giris=2026-11-12&cikis=2026-11-21`.
3. **Otel listeden seçilir:**
   - "Bana uygun oteli önerin" seçeneği **kalkar**.
   - Mekke ve Medine'de gece > 0 ise otel seçimi **zorunlu**. Seçilmeden "Planı gönder" pasif ve uyarı gösterilir.
   - Liste: Harem'e mesafeye göre sıralı; görsel, yıldız, mesafe, oda/gece fiyatı (G5.2'ye göre).
   - Listede otel yoksa: "Otel listemiz güncelleniyor, WhatsApp'tan yazın" + WhatsApp düğmesi.
4. **Vize ayrı bir seçim olur:**
   - Adım "Vize": iki seçenek, "Vizemi siz alın (kişi başı 140 USD)" / "Vizem var ya da kendim alacağım". Varsayılan birincisi.
   - Vize kalemi katalogdaki `category === "vize"` kalemidir. Katalogda yoksa 140 USD sabit **yazılmaz**; "teklifte" gösterilir.
5. **Transfer:** katalogdaki `category === "transfer"` kalemleri (kullanıcının eklediği araçlar) çoklu seçim olarak kalır. Değişiklik yok.
6. **Kalan ekstralar** (`tur`, `extra`; hoca dahil) ayrı adımda, çoklu seçim.
7. **Özet:** toplam, kişi başı, ödeme seçenekleri (nakit / IBAN / kart, ≈ TL). Mevcut kod korunur.
8. `planToText` yeni sıraya göre: tarih aralığı ve gece, Mekke ve Medine oteli + gece, kişi ve oda, vize (istiyor / kendisi), transfer, ekstralar, toplam, ödeme.
9. **Kanıt:**
   - `tsc` temiz;
   - lint temiz (`npx eslint src/components/planner src/lib/pricing src/app/api/plan-request`);
   - yerelde sahte katalogla test sayfası (`src/app/(main)/zz-planlayici-test/page.tsx`, `notFound()` üretimde) üzerinden masaüstü ve 390 px ekran görüntüleri: `docs/antigravity/goruntuler/G5-*.png`;
   - test sayfası teslimden önce **silinir**;
   - örnek bir planın `planToText` çıktısı TESLIM.md'ye yapıştırılır.

## G5.5 · Admin talep ekranında talebin içeriği

**Dosyalar:** `src/app/(admin)/admin/contact/page.tsx`

1. Her talep satırında **mesajın tamamı** görünsün:
   - satıra tıklayınca açılan detay paneli ya da satır altı açılır alan;
   - `whitespace-pre-line`, satır sonları korunur.
2. `package` alanı rozet olarak görünsün: "Bireysel umre planı", "Umre vizesi başvurusu", "· AI: ChatGPT" vb.
3. "Bireysel umre planı" talebinde mesajdaki seçim satırları (`   - ` ile başlayanlar) madde listesi olarak, toplam satırı kalın gösterilsin. Metin ayrıştırılamazsa düz metin gösterilir.
4. Mevcut işlevler korunur: durum değiştirme, silme vb. Önce `grep -n "onClick\|fetch(" src/app/(admin)/admin/contact/page.tsx` çıktısını TESLIM.md'ye yapıştır, dönüşümden sonra aynısını tekrar yapıştır.
5. Kanıt: sahte veriyle ekran görüntüsü `docs/antigravity/goruntuler/G5-talep.png`.

---

## Teslim

`docs/antigravity/TESLIM.md` en üstüne "G5" kaydı:
- değişen ve oluşturulan **tüm** dosyalar;
- her alt madde (G5.1–G5.5) için kanıt.

Commit ve push yapma. Claude dönünce denetler, canlıda gerçek veriyle dener ve yayına alır. `/bireysel-umre/yeni` önizleme olarak kalır; asıl adrese taşıma kullanıcı onayından sonra.
