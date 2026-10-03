# Antigravity görev paketleri (2 Ekim 2026'dan itibaren)

## 0. Çalışma kuralları (hepsi zorunlu)

1. **Commit ve push YOK.** Değişiklikleri çalışma klasöründe bırak. Claude kontrol eder, commit eder ve canlıya alır. (Kullanıcı kararı, 2 Ekim.)
2. Her paket bitince `docs/antigravity/TESLIM.md` dosyasının **en üstüne** teslim kaydı ekle:
   - paket kodu (ör. G2);
   - değiştirdiğin / oluşturduğun **dosyaların tam listesi**;
   - her kabul ölçütü için **kanıt**: komut ve çıktısı, dosya yolu, satır numarası;
   - yapamadıkların ve neden.

   "Tamamlandı" yazmak kanıt değildir. Kanıtı olmayan madde yapılmamış sayılır.
3. **Yalnızca paketin "Dosyalar" satırında yazan dosyalara** dokun. Başka bir dosya gerekiyorsa dur, TESLIM.md'ye yaz.
4. Bir şeyi **koda bakmadan yazma.** Envanter, işlev listesi, "sayfada şu var" gibi her iddia kaynak dosyadan satır numarasıyla gösterilir.
5. Belge dosyalarına **ekleme yap, baştan yazma** (önceki notlar silinmesin).
6. İçerik kuralları:
   - Rakip adı, "TÜRSAB", "diyanetsiz" yok.
   - "En ucuz", "garanti", "sıfır", "%… varan", "7/24" gibi doğrulanmamış iddia yok.
   - Gerçek bilgiler yalnızca şunlar: vize kişi başı 140 USD, belgeler tamamsa 2 iş saati. Başka rakam yok.
7. Tasarım: `docs/TASARIM-DILI.md`. Bileşenler yalnızca `src/components/ui/kit/index.tsx`'ten. Kiti değiştirme; eksik parça gerekiyorsa TESLIM.md'ye yaz.
8. Yerel sunucu: `npm run dev` → http://localhost:3002. Vitrin: http://localhost:3002/kit. Yerelde veritabanı yok: paket ve blog listeleri boş gelir. Görsel kontrol için kit vitrinindeki örnek kartları kullan.

**Öncelik (3 Ekim): G8 → `docs/antigravity/G8-PAKET.md`.** G7 kontrol edildi ve canlıda.

~~**Öncelik (2 Ekim gece, ikinci tur): G7 → `docs/antigravity/G7-PAKET.md`.** G6 kontrol edildi ve canlıda.

~~**Öncelik (2 Ekim gece): G6 → `docs/antigravity/G6-SEO-DUZELTMELER.md`** (Claude 2 saat çevrimdışı; döndüğünde kontrol edecek). G3 ve G4 Claude tarafından yeniden yazıldı ve canlıda; bu sayfalara dokunma.

~~Öncelik (2 Ekim akşamı): G5 → `docs/antigravity/G5-PLANLAYICI.md`** (planlayıcı düzeltmeleri, Sitede göster, talep ekranı). G5 bitmeden G2–G4'e dönülmez.~~

Sıra: **G1 → G2 → G3 → G4.** Bir paket Claude'dan "onaylandı" almadan sonrakine geçme. Onaylar TESLIM.md'deki kaydın altına Claude tarafından yazılır.

---

## G1 · Önceki teslimdeki hataların düzeltilmesi (yalnızca belge)

**Dosyalar:** `docs/veri/katalog-sablonu.csv`, `docs/veri/README.md`, `docs/tasarim-denetimi/ENVANTER.md`, `docs/tasarim-denetimi/goruntuler/*`, `docs/taslaklar/ai-sorular.md`, `docs/taslaklar/rekabet/*.md`, `docs/antigravity/TESLIM.md`

1. **CSV kategorileri:** canlı API'deki `type` alanına göre yeniden ata (`curl -s https://hadiumreyegidelim.com/api/services`):
   - `HOTEL` → hotel;
   - `TRAIN` → tren;
   - `TRANSFER` → transfer;
   - `EXTRA` → adı ziyaret, mescit, tur ya da gezi içeriyorsa `tur`, değilse `extra`.

   Oteller `GET /api/hotels?city=Mekke` ve `?city=Medine`'den gelir. Tahmin yok: her satırın kaynağı API'deki kayıt.
2. **CSV tekrarları:** aynı (kategori, ad, oda_tipi) yalnızca bir kez. Kanıt olarak tekrar sayımı komutunu ve çıktısını yaz (0 olmalı).
3. **Vize satırı:**
   - ad: `Umre vizesi`;
   - not: `Belgeler tamamsa 2 iş saati (kullanıcı bilgisi)`;
   - "sigorta" kelimesi geçmez.
4. **Ekran görüntüleri:** listedeki **her** sayfanın 1440 ve 390 px görüntüsü, dosya adı `NN-sayfa-adi-desktop.png` / `-mobile.png`. `test_home_desktop.png` silinir. Kanıt: `ls docs/tasarim-denetimi/goruntuler | wc -l` çıktısı.

   Sayfalar:
   - `/`
   - `/paketler`
   - `/paketler/kutlu-rota-ibadet-ve-kesif-886`
   - `/bireysel-umre`
   - `/bireysel-umre/konaklama`
   - `/bireysel-umre/transfer`
   - `/bireysel-umre/tren`
   - `/bireysel-umre/ekstralar`
   - `/bireysel-umre/rehber`
   - `/bireysel-umre/ozet`
   - `/blog`
   - `/blog/bireysel-umre-vizesi-nasil-alinir`
   - bir kategori sayfası (`/blog`'dan bul)
   - `/hizmetler`
   - `/rehberlik`
   - `/gizli-mucevher`
   - `/umre-vizesi`
   - `/umre-vizesi/basvuru`
   - `/iletisim`
   - `/hakkimizda`
   - `/umre-rehberi`
   - `/umre-rehberi/ihram-nedir`
   - `/denizli-cikisli-bireysel-umre`
   - `/eylul-umresi`
   - `/ilk-umrem`
   - `/hanim-umresi`
5. **ENVANTER.md'yi koddan yeniden yaz** (bu dosya için baştan yazmak serbest; eski hali hatalıydı). Her sayfa için:
   - kaynak dosya yolu;
   - **gerçek** işlevler: her `onClick`, `<form>`, `<select>`, `<input>`, dış bağlantı ve `fetch(` çağrısı, `dosya:satır` ile;
   - ham `<img>` sayısı (`grep -c "<img"` çıktısı).

   Planlanan (v2) özellikler buraya yazılmaz. Bilinen gerçekler:
   - `/paketler`'de filtre yok;
   - `/blog`'da arama yok;
   - vize formu pasaport numarası ve dosya istemez;
   - `/kesifler` canlıda 404.
6. **ai-sorular.md:** her hedef adresi `curl -s -o /dev/null -w "%{http_code}"` ile dene.
   - 200 dönmeyenleri düzelt: `/umre-rehberi/ramazan-umresi` → `/ramazan-umresi`, `/umre-rehberi/somestr-umresi` → `/somestr-umresi`, `/umre-rehberi/yasli-umresi` → `/yasli-umresi`.
   - Henüz açılmamış sayfaları ("/oteller/…", "/umre-fiyatlari", yeni blog yazıları) "(planlanan)" diye işaretle.
   - Kanıt: komut çıktısı tablosu.
7. **Rekabet taslakları:** "7/24 rehberlik hattı" ve "sağlık sigortası" ifadelerini kaldır. Doğrulanmamış başka iddia varsa listele.

**Kabul:** yukarıdaki 7 maddenin her birinin kanıtı TESLIM.md'de.

---

## G2 · /paketler liste ve detay sayfaları yeni tasarıma (Y3-1)

**Dosyalar:** `src/app/(main)/paketler/page.tsx`, `src/app/(main)/paketler/[slug]/page.tsx`, `docs/antigravity/TESLIM.md`, `docs/antigravity/goruntuler/G2-*`

1. **Önce** iki dosyadaki bütün işlevleri G1 yöntemiyle listele: düğme, bağlantı, form, WhatsApp, şema (`application/ld+json`), `generateMetadata`. Bu liste dönüşümden sonra aynen çalışmalı.
2. Liste sayfası:
   - üst bölüm `PageHero`;
   - kartlar ana sayfadaki gibi: `MediaCard` + `Badge` (süre) + `CardFooter` (fiyat);
   - "En çok tercih edilen" rozeti yalnızca ilk `isPopular` pakette;
   - SSS varsa `Faq` + `faqJsonLd`.
3. Detay sayfası:
   - üst bölüm `PageHero`; galeri `next/image`;
   - dâhil hizmetler `Panel` içinde;
   - fiyat `PriceTag`;
   - WhatsApp düğmesi `ButtonLink tone="whatsapp"`;
   - mevcut şema ve metadata aynen kalır.
4. Ham `<img>` kalmaz (kanıt: `grep -c "<img"` → 0).
5. `npx tsc --noEmit` temiz (çıktıyı yaz).
6. **Görsel kanıt:**
   - önce: canlı adresten;
   - sonra: localhost:3002'den, 1440 + 390 px;
   - dosyalar `docs/antigravity/goruntuler/G2-oncesi-*.png` ve `G2-sonrasi-*.png`.

   Yerelde paket olmadığı için kartların görünümü `/kit` sayfasındaki MediaCard ile aynı yapıda olmalı. Yazdığın JSX'i `/kit`'teki örnekle karşılaştır ve farkı yaz.
7. Mobilde yatay taşma 0 (kanıt: `document.documentElement.scrollWidth - innerWidth` çıktısı).

---

## G3 · /blog listesi ve kategori sayfası (Y3-3)

**Dosyalar:** `src/app/(main)/blog/page.tsx`, `src/app/(main)/blog/kategori/[slug]/page.tsx`, `docs/antigravity/TESLIM.md`, `docs/antigravity/goruntuler/G3-*`

- Yazı kartları `PostCard`, üst bölüm `PageHero`, kategori bağlantıları `Badge` ya da düz bağlantı. Sayfalama ve kategori listesi korunur.
- Yazı detay sayfasına (`blog/[slug]`) **dokunma**: Claude'da.
- Kabul ölçütleri G2'deki 4–7 ile aynı.

## G4 · /hizmetler (Y3-4)

**Dosyalar:** `src/app/(main)/hizmetler/page.tsx`, `docs/antigravity/TESLIM.md`, `docs/antigravity/goruntuler/G4-*`

- Hizmet kartları `MediaCard` ya da `Panel`; fiyat varsa `PriceTag`.
- Mevcut veri kaynağına (`/api/services` ya da Prisma) dokunma; Y2'de Claude kataloğa bağlayacak.
- Kabul ölçütleri G2 ile aynı.

---

## Claude'da kalanlar (Antigravity dokunmaz)

`src/components/ui/kit/*`, `src/lib/**`, `src/app/api/**`, `prisma/**`, `src/app/(main)/page.tsx`, `src/app/(main)/bireysel-umre/**` (planlayıcı v2), `src/app/(main)/blog/[slug]/page.tsx`, admin sayfaları, `next.config.ts`, `src/middleware.ts`, `src/app/layout.tsx`, `src/app/globals.css`.
