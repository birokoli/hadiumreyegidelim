# G8 · İçerik düzeltmeleri, vize yazısı, paylaşım görselleri, sayfa dönüşümleri, ölçümler (3 Ekim)

Uzun bir paket. Sırayla git; her madde bağımsız, biri takılırsa TESLIM'e yaz ve sonrakine geç. Claude yalnızca kontrol edip canlıya alacak.

## 0. Kurallar (GOREVLER.md + G6/G7 kurallarının hepsi geçerli)

1. **Commit/push YOK.** Canlı veritabanına yazma YOK (erişimin de yok). İçerik değişiklikleri **JSON/HTML dosyası** olarak hazırlanır; Claude tek seferlik veri düzeltmesiyle uygular.
2. Yalnızca maddenin **Dosyalar** satırındakiler. "Bu arada" düzeltme yok (G6 ve G7'de iki kez kural dışı değişiklik geri alındı).
3. İçerik ve ölçüm **canlıdan** (`https://hadiumreyegidelim.com`). Yerel veritabanı canlıyı temsil etmez.
4. Her kod maddesinden sonra `npx tsc --noEmit` + değişen dosyalara `npx eslint` (0 hata). Kanıt komutları ve **gerçek çıktıları** TESLIM.md en üstüne tek "G8" kaydında.
5. Metin kuralları: rakip adı, TÜRSAB, diyanetsiz, en ucuz, garanti (ürün garantisi hariç), sıfır (konum iddiası), 7/24, %… varan, eşsiz, ayrıcalıklı, lüks, "VIP deneyim" yok. Gerçek bilgiler yalnızca: vize kişi başı 140 USD, belgeler tamamsa 2 iş saati; otel fiyatı 1 oda 1 gece, odada en fazla 4 kişi; uçak bileti ve Nusuk randevusu satmıyoruz; transfer fiyatları araç başı (`src/lib/catalog/transfers.ts`'deki rakamlar). Marka: "Hadi Umreye Gidelim". Adres: Bakırköy, İstanbul. Uydurma rakam/istatistik/yorum yok.
6. Örnek sayfalar: `src/app/(main)/hizmetler/page.tsx`, `src/app/(main)/bireysel-umre/page.tsx`, `src/components/blog/BlogList.tsx`.

**Dokunma:** `src/middleware.ts`, `src/app/layout.tsx`, `src/lib/**`, `src/app/api/**`, `prisma/**`, `src/components/planner/**`, `src/components/ui/kit/**`, `src/app/(admin)/**`, `next.config.ts`, `src/app/sitemap.ts`, `.env*`, `src/app/(main)/[slug]/page.tsx`.

---

## G8-1 · Blog yasaklı ifadeler: uygulanabilir değişiklik dosyası (Faz J5)

**Dosyalar:** yeni `docs/veri/blog-duzeltmeleri.json`, `docs/taslaklar/blog-duzeltmeleri.md` (güncelle)

`blog-duzeltmeleri.md` 15 yazıda 19 satırdı; eksikler var. Canlıdaki **bütün** yayınlanmış yazıları (sitemap'teki `/blog/*`) tara ve her bulgu için **ham HTML'den** birebir alıntı çıkar:
```json
[{ "slug": "…", "find": "<veritabanındaki HTML'de birebir geçen parça>", "replace": "<yeni parça>", "reason": "…" }]
```
- `find`, sayfanın **makale gövdesi** HTML'inde (`curl` çıktısında `<article` içi) aynen geçmeli; Next'in eklediği sınıf/ID'leri içermemeli (gövde veritabanından gelir; başlıklara `id=` eklenir, onları `find`'a koyma). Kısa ve eşsiz tut (tek cümle ya da cümlenin bir kısmı).
- Masum kullanım (ürün garantisi gibi) için kayıt **yazma**; `.md`'de "değişmesin" listesine ekle.
- TÜRSAB geçen her yer: marka adı geçmeden yeniden yaz.
- Kanıt: her kayıt için `curl -s https://hadiumreyegidelim.com/blog/<slug> | grep -c -F '<find>'` → **1** olmalı (betikle bütün kayıtlar; çıktı tablosu TESLIM'e). 1 olmayan kayıt dosyaya girmez.

## G8-2 · Vize yazısı yenileme (H11)

**Dosyalar:** yeni `docs/veri/vize-yazisi.json`, `docs/taslaklar/vize-yazisi.md` (güncelle)

Yazı: `/blog/bireysel-umre-vizesi-nasil-alinir` (1.899 gösterim, sıra 9,9, tıklama oranı %1,7). Mevcut taslağı (`docs/taslaklar/vize-yazisi.md`) canlı yazıyla birleştir ve şu yapıda **tam gövde HTML'i** hazırla:
- İlk paragraf: soruya doğrudan cevap (Suudi Arabistan e-vize; kişi başı 140 USD; belgeler tamamsa 2 iş saati; `/umre-vizesi/basvuru` bağlantısı).
- H2'lerin en az üçü soru biçiminde ("Umre vizesi kaç günde çıkar?", "Umre vizesi ne kadar?", "Hangi belgeler gerekir?" gibi).
- Mevcut yazıdaki doğru bilgiler korunur; kaynaksız iddia kaldırılır. Resmî kaynak bağlantısı yalnızca `visa.visitsaudi.com` ve resmî bakanlık sayfaları.
- Sonda `/bireysel-umre` ve `/umre-vizesi` bağlantıları.
- Biçim: `{ "slug": "...", "title": "Umre Vizesi 2026: Nasıl Alınır, Kaç Günde Çıkar, Ücreti Ne?", "description": "<155 karakter>", "content": "<tam HTML>" }`. Başlık 60, açıklama 155 karakteri geçmez (karakter sayısını yaz).
- HTML yalnızca `p, h2, h3, ul, ol, li, a, strong, em, table, thead, tbody, tr, th, td` etiketleri; görsel yok, satır içi stil yok.

## G8-3 · Paylaşım görselleri (I10)

**Dosyalar:** `docs/taslaklar/og-gorselleri.md`'de "uygun" dediğin sayfaların `page.tsx` dosyaları — **yalnızca** `metadata`/`generateMetadata` içindeki `openGraph.images` (ve varsa `twitter.images`). Liste dışı sayfa yok; `src/app/(main)/[slug]/page.tsx` yok (il sayfaları Claude'da).

- Görsel `public/images/` altında **zaten var olan** dosya; yol mutlak (`${SITE_URL}/images/...` ya da `/images/...` ile `metadataBase`).
- Kanıt: her sayfa için `curl -s http://localhost:3002<yol> | grep -o 'property="og:image" content="[^"]*"'` ve o adresin `curl -sI` durumu 200.
- İl sayfaları için öneriyi `og-gorselleri.md`'ye yaz (Claude uygular).

## G8-4 · /bireysel-umre içerik güçlendirme (B3)

**Dosyalar:** `src/app/(main)/bireysel-umre/page.tsx` — **yalnızca** `STEPS` ve `FAQ` sabitlerinin altına yeni bir sabit ve sayfanın en altına (FAQ bölümünden **önce**) yeni bir `Section`. Planlayıcıya, metadata'ya, JSON-LD'ye, `FAQ` dizisinin mevcut maddelerine dokunma.

Eklenecek bölüm: "Bireysel umre mi, grup umresi mi?" — kısa karşılaştırma (tablo ya da iki `Panel`), **rakam ve rakip adı olmadan**: tarih esnekliği, otel seçimi, kalabalık, rehberlik isteğe bağlı. Altına iç bağlantılar: `/umre-vizesi`, `/hizmetler`, `/umre-rehberi/bireysel-umre-mi-turla-umre-mi`, `/ilk-umrem`. Yeni SSS sorusu eklemek istersen `FAQ` dizisinin **sonuna** en fazla 2 soru (şema otomatik güncellenir); cevaplar yalnızca kural 5'teki gerçek bilgiler.

Kanıt: `grep -c "application/ld+json"` önce/sonra aynı; ekran görüntüsü 1440 + 390.

## G8-5 · Blog yamyamlığı: niyet ayrıştırma taslakları (C1)

**Dosyalar:** `docs/taslaklar/umre-turlari-farklilastirma.md` (güncelle), yeni `docs/veri/ayristirma.json`

Plan dosyadaki gibi (silme/birleştirme yok). Her "umre turları 2026" yazısı için: hedef niyet, yeni başlık (≤60), yeni açıklama (≤155), giriş paragrafı (yeni HTML) ve diğer yazılara verilecek iç bağlantı cümlesi. JSON biçimi G8-1'deki `find/replace` ile aynı (giriş paragrafının eski hali `find`), artı başlık/açıklama alanları. Kanıt G8-1 gibi (`grep -c -F` = 1).

## G8-6 · Kampanya sayfaları kit uyumu (ilk-umrem, hanim-umresi, eylul-umresi)

**Dosyalar:** `src/components/features/AdsCampaignLanding.tsx`, `docs/antigravity/goruntuler/G8-6-*`

Üç sayfa bu bileşeni kullanıyor. Görsel dili kite yaklaştır (renk, köşe, gölge, yazı ölçüleri `docs/TASARIM-DILI.md`); **bütün admin alanları** (`EylulCampaignConfig`) aynen görüntülenmeye devam eder; WhatsApp bağlantıları, SSS şeması ve fiyat tabloları çalışır. Önce işlev listesi (satır numarasıyla), sonra dönüşüm. Ekran görüntüsü üç sayfa × 1440/390. `grep -c "application/ld+json"` üç sayfada önce/sonra aynı.

## G8-7 · Paket detay sayfası checkout kit uyumu

**Dosyalar:** `src/components/packages/PackageCheckoutClient.tsx`, `docs/antigravity/goruntuler/G8-7-*`

Form alanları, gönderim (`fetch`) ve doğrulama mantığı **aynen**; yalnızca görünüm. Formu **gönderme**. Ekran görüntüsü 1440/390.

## G8-8 · Teknik doğrulamalar (yalnızca belge)

**Dosyalar:** yeni `docs/olcum/teknik-kontrol-2026-10-03.md`

1. `docs/YOL-HARITASI.md` 1.5 (`r["@context"].toLowerCase` JS hatası): canlıda SEO Masası'nın kullandığı sayfalarda hâlâ oluyor mu? Kodda `grep -rn "@context" src/lib/seo` ile ilgili yeri bul; hata koşulunu açıkla (düzeltme yok).
2. 1.7 (Vercel iki proje): son 20 commit'in durumu `gh api repos/birokoli/hadiumreyegidelim/commits/<sha>/status --jq '.statuses[]|.context+" "+.state'` → tablo.
3. Hız (I12): `curl -s -o /dev/null -w "%{time_starttransfer}"` ile `/`, `/bireysel-umre`, `/blog`, `/hizmetler`, bir il sayfası, bir blog yazısı; her biri 5 kez, medyan; yanıt başlığındaki `x-vercel-id` bölgesi ve `x-vercel-cache`. Yorum yok, tablo.
4. Kırık bağlantı taraması: sitemap'teki **bütün** adreslerin içindeki iç bağlantılar (`href="/…"`), her hedefin durumu; 404 ve yönlendirme zincirleri listesi.

## G8-9 · AI Görünürlük ve SEO hazırlık listeleri (yalnızca belge)

**Dosyalar:** yeni `docs/taslaklar/ai-gorunurluk-girdileri.md`

Admin'e Claude ya da kullanıcı girecek; sen yalnızca listeyi hazırla:
- 25 hedef kelime (bireysel umre, umre vizesi, umre fiyatları 2026, il çıkışlı umre vb.) — her biri için hedef sayfa (canlıda 200 dönen adres) ve niyet.
- 15 AI sorusu (müşterinin ChatGPT'ye soracağı biçimde; marka adı geçmeyen), her birine cevabın bulunduğu sayfamız.
- Rakip listesi **yazma** (kural: rakip adı yok; kullanıcı girecek).

---

## Bitince

TESLIM.md en üstüne tek "G8" kaydı: her madde durum + kanıt komutu + gerçek çıktı, `git status --short`, `npx tsc --noEmit` çıktısı. Yapamadığın maddeyi "yapılmadı + neden" diye yaz; yarım değişikliği geri al.
