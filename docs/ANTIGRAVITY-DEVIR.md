# Antigravity'ye devir — hadiumreyegidelim.com

Son güncelleme: 30 Eylül 2026 (Claude Code). Bu belge, Claude Code'un yaptığı işleri, değişmez kuralları, çalışma yöntemini ve sıradaki işleri anlatır. **Önce bunu, sonra `docs/YOL-HARITASI.md`'yi ve `AGENTS.md`'yi oku.**

---

## 1. Proje ve altyapı

- **Kod:** `~/Projelerim/hadiumreyegidelim` → GitHub `birokoli/hadiumreyegidelim`, dal `main`.
- **Teknoloji:** Next.js 16.2 (App Router, Turbopack; eğitim verindekinden farklı — API'yi `node_modules/next/dist/docs` altından oku), React 19, Tailwind v4, Prisma 6 + Supabase (Postgres), `motion` (animasyon).
- **Yayın:** `main`'e her push iki Vercel projesine gider: `hadiumreyegidelim.com` (alan adları bağlı) ve `hadiumreyegidelim`. İkisi de aynı veritabanını kullanır. Durumu şu komutla izle:
  `gh api repos/birokoli/hadiumreyegidelim/commits/<sha>/status --jq '.statuses[] | "\(.context)=\(.state)"'`
- **Alan adları:** site `www.hadiumreyegidelim.com` (apex www'ye yönleniyor), admin `admin.hadiumreyegidelim.com`.
- **Ortam değişkenleri (değerlerini asla yazma/loglama):** `DATABASE_URL`, `JWT_SECRET` (yoksa DATABASE_URL'den türetilir), `CRON_SECRET`, `ANTHROPIC_API_KEY`, `DATAFORSEO_LOGIN`/`DATAFORSEO_PASSWORD`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_BOT_TOKEN`, isteğe bağlı `ADMIN_INITIAL_PASSWORD`.
- **Yerelde veritabanı yok.** Sayfalar veritabanı yokken de açılır (varsayılan metinler, boş listeler). `npm run build` yerelde önceden üretim aşamasında düşebilir; "✓ Compiled successfully" ve `npx tsc --noEmit` temizse yeterli, gerçek build Vercel'de.

## 2. Değişmez kurallar (kullanıcı kararları)

1. **Renk:** beyaz zemin, lacivert ana renk (`primary` #003781, koyu #001944). Kırmızı yalnızca hata için. Kampanya bantlarındaki altın (#c9a96e) mevcut detay; yayma.
2. **Yasaklı kelimeler:** "TÜRSAB" ve "diyanetsiz" hiçbir yerde geçmez (metin, meta, schema, blog). `src/lib/geo-blog/external-policy.ts` → `BANNED_TERMS`.
3. **Dış link:** yalnızca resmî kurumların **bilgi** sayfaları (diyanet.gov.tr, nusuk.sa, *.gov.sa). Link metni kurum adı değil konu kelimesi. **Sattığımız hizmetler** (vize, paket, otel, uçuş, transfer, tren, rehberlik) asla dışarı linklenmez; kendi sayfalarımıza gider (`/umre-vizesi`, `/paketler`, `/bireysel-umre`, `/hizmetler`, `/rehberlik`). Rakip firma adı/sitesi yok.
4. **Blog satışı desteklemeli:** marka (Hadi Umreye Gidelim = bireysel umre uzmanı) doğal biçimde 2-3 kez geçer, `/bireysel-umre`'ye yönlendirir; grup/Diyanet turu fiyatları ölçü alınmaz, okur başka seçeneğe yönlendirilmez; fiyat yalnızca kendi paketlerimizden.
5. **Uydurma veri yok:** sahte puan/yorum (`aggregateRating`), uydurma istatistik, müşteri hikâyesi, tahmini fiyat yazma. Sitede artık `aggregateRating` yok; gerçek yorum sistemi olmadan ekleme.
6. **Doğrulanmamış iddialar kullanıcı onayı bekliyor:** ana sayfadaki "Nusuk ve vize garantisi", "24 saat içinde e-vize", "%30'a varan tasarruf". Silme, çoğaltma da.
7. **Yazım:** no-ai-slop ("misafirlerimiz", "eşsiz", "son derece", "sonuç olarak" gibi kalıplar yok), kısa ve net Türkçe.
8. **Güvenlik:** sır (anahtar/şifre) koda, commit'e, loga yazılmaz. `.env` kopyalanmaz. Kullanıcı adına şifre/anahtar girilmez.
9. **Büyük arayüz değişikliği** önce ayrı dalda (Vercel önizlemesi ya da yerel), kullanıcı "canlıya al" deyince `main`. Küçük düzeltmeler doğrudan `main`.
10. **Para harcayan işler** (Claude API, DataForSEO) kullanıcı onayıyla ve bütçe sınırıyla: Claude aylık `AI_MONTHLY_BUDGET_USD` (varsayılan 15 $), haftalık ölçüm `WEEKLY_MEASURE_CAP_USD` (2 $).

## 3. Çalışma yöntemi

1. `git pull`; iş büyükse `git checkout -b <dal>`.
2. Kodu yaz; `npx tsc --noEmit -p .` ve değişen dosyalar için `npx eslint <dosyalar>` (eski dosyalardaki `any` uyarıları önceden var).
3. `npm run build` → "✓ Compiled successfully" gör.
4. Commit mesajı: başta adım numarası (`[2.2] …`), sonunda `Co-Authored-By` satırı (kullanıcının kuralı). Push.
5. İki Vercel projesinin durumunu `gh api …/status` ile bekle (ikisi de `success` olmalı).
6. **Canlıda doğrula** (curl ile başlık/HTML, gerekirse headless Chrome: `/Applications/Google Chrome.app` + `puppeteer-core`, scratch klasörde).
7. `docs/YOL-HARITASI.md`: adımı `[x]` yap, altına ne yapıldığını yaz, **Durum günlüğü**ne satır ekle.

## 4. Yapılanlar (özet; ayrıntı yol haritasında)

| Alan | Ne yapıldı | Ana dosyalar |
|---|---|---|
| Güvenlik (1.6) | Admin oturumu imzalı token; açık API'ler kapatıldı; sipariş listesi ve ayarlar sızıntısı giderildi; çıkış düğmesi | `src/middleware.ts`, `src/lib/admin-auth.ts`, `src/lib/jwt-key.ts` |
| Admin ayarları | Kaydet yalnızca değişen alanları yazar; yükleme başarısızsa kilitli (önceden bütün ayarları varsayılana çeviriyordu) | `src/app/(admin)/admin/settings/page.tsx`, `src/app/api/admin/settings/route.ts` |
| Blog motoru (Faz 6) | Araştırma yalnızca resmî sitelerde; yazım; kalite kapısı (dış link, yasaklı kelime, rakip, marka/satış kuralları); taslak → yayın; otomatik yazı; bütçe | `src/lib/geo-blog/*`, `src/lib/ai-budget.ts`, `src/components/admin/content/BlogEngine.tsx` |
| Blog şablonu | Dış link kuralı yayında uygulanır, resmî kaynakça, marka kutuları, taslaklar 404, ilgili yazılar 4, ilk yayında tarih = şimdi | `src/app/(main)/blog/[slug]/page.tsx`, `src/components/blog/BlogBrandCta.tsx` |
| Ana sayfa (Faz 7) | Airbnb tarzı umre planlayıcı (müşterinin 7 sorusu + Mekke/Medine gece → numaralı WhatsApp mesajı), hızlı erişim, umre adımları, arka plan videosu (admin'den MP4) | `src/app/(main)/page.tsx`, `src/components/home/*` |
| Hız (2.2) | Ayarlar önbellekte, sayfalar 5 dk ISR; 1,2–1,6 sn → 0,16–0,33 sn | `src/lib/site-settings.ts`, `src/lib/revalidate-public.ts` |
| Build | Yazı tipleri projede (`public/fonts`); build 4 işçi, yeniden deneme, Prisma bağlantı sınırı | `src/app/globals.css`, `next.config.ts`, `src/lib/prisma.ts` |
| Şehir sayfaları (3.1) | Benzerlik %86 → %49,6; bölge, havalimanı, mesafe, tahmini uçuş, yakın iller, şehre özel SSS | `src/lib/city-geo.ts`, `src/app/(main)/[slug]/page.tsx` |
| Teknik SEO (2.3–2.6) | Çift H1, uzun başlık, og:image, yetim sayfa → 0; taslaklar sitemap'ten çıktı | `src/lib/seo/meta.ts`, `src/app/sitemap.ts` |
| AI hazırlık (4.1) | %50 → %98; güncelleme tarihi, resmî bilgi, soru başlıkları, SSS şemaları | `src/components/seo/PageTrust.tsx` |
| Haftalık ölçüm (5.2) | Pazartesi saatte bir; sıra kontrolü + AI soruları; 2 $ tavan; panel + "Şimdi çalıştır" | `src/lib/weekly-measure.ts`, `/api/cron/weekly-measure`, `WeeklyMeasurePanel.tsx` |

## 5. Sıradaki işler (öncelik sırasıyla)

0. **3.2 Programatik sayfa grupları — ANA İŞ.** Kılavuz: `docs/SAYFA-GRUPLARI.md` (kurallar esnetilmez). Dal `sayfa-gruplari`; altyapı ve örnek sayfa (`/umre-rehberi/ihram-nedir`) hazır, yalnızca içerik dosyaları yazılacak. Her 3–4 sayfada kullanıcıya **lokalde** (`http://localhost:3002/...`) göster, "canlıya al" demeden main'e birleştirme.

1. **Kullanıcıyı 0.2–0.6 için yönlendir** (kod değil): Vercel'de ana alan adı; AI Görünürlük → Rakipler; SEO Masası → Kelimeler (10–20); AI soruları 10–15; ilk blog taslağı. Ayrıca ayar ezilmesi hatasında sıfırlanan değerleri admin'den yeniden girmesi (ana sayfa başlığı "SİZE ÖZEL MANEVİ ROTA", açıklama "Ruhunuzun Ritmini Kafilelere Teslim Etmeyin.", Instagram ve diğer sosyal linkler, logo/iletişim/WhatsApp mesajı kontrolü).
2. **4.2 Temel ölçüm:** 0.3–0.5 bitince AI Görünürlük panelinden "Şimdi çalıştır"; sonuçları durum günlüğüne yaz.
3. **Blog içerik gözden geçirme:** `umre-turlari-2026-fiyat-karsilastirmalari-diyanet-bireysel-vip` ve başlığında "diyanet"/"fiyat karşılaştırma" geçen eski yazılar; bireysel umre lehine düzenle (İçerik Stüdyosu'nda elle ya da "AI ile düzenle").
4. ~~5.3~~ tamamlandı (fiyat teklifleri ve Excel Fiyat Motoru'nda hata raporu düğmesi).
5. **1.5:** Safari'de admin sayfasındaki `r["@context"].toLowerCase` hatası — gizli pencerede tekrar ediyor mu, kullanıcıyla kontrol.
6. **1.7:** Kullanıcıyla iki Vercel projesinden gereksiz olanı kaldırma kararı (şu an ikisi de başarılı build ediyor).
7. **3.2 / 4.3 / 4.4:** yeni sayfa grupları (arama hacmiyle, kullanıcı onayıyla), kaynak fırsatları, içerik boşlukları.
8. **5.4:** AI verisini `Setting` JSON'dan tabloya taşıma (Supabase migration kullanıcı onayıyla, ham SQL; `prisma db push` kullanılmıyor).
9. İsteğe bağlı: `Package` tablosuna kalkış şehri alanı → şehir sayfasında o şehirden paketler (migration onayı gerekir).

## 6. Bilinen tuzaklar

- **Yerel dev sunucusu** (`hadi-seo-dev`, port 3002) dosya değişikliklerini bazen kaçırır: `curl localhost:3002 | grep <yeni-sınıf>` ile kontrol et, gerekirse yeniden başlat. Turbopack dev önbelleği eski CSS verebilir; production build çıktısı (`.next/static/chunks/*.css`) doğruyu gösterir.
- **Safari** yerelde eski CSS'i önbellekten gösterebilir → Cmd+Option+R.
- `src/app/layout.tsx` bütün `.rounded-*` sınıflarını `BUTTON_RADIUS` ayarına zorlar; tam hap için `rounded-[999px]`.
- `(main)` düzeni bölümleri içerik genişliğine daraltabilir; tam genişlik bölümlere `w-full`.
- Izgaralarda mobil taşmayı önlemek için `grid-cols-[minmax(0,1fr)]` + `min-w-0`.
- Next 16: `revalidateTag(tag, "max")` ya da `{ expire: 0 }` (tek argüman kullanımdan kalktı). `unstable_cache` içinde hata yakalayıp boş dönme (boş sonuç önbelleğe girer).
- Sayfalarda `prisma.setting` sorgusu yazma; `getSiteSettings()` kullan. Yeni içerik API'si eklersen `revalidatePublic()` çağır.
- Başlık/açıklama için `pageTitle()` / `metaDescription()`; site adı başlıkta tekrar yazılmaz.
- JS `\b` Türkçe harflerle çalışmaz: `(?<!\p{L})…(?!\p{L})` + `u` bayrağı. Türkçe ekler için şehir sayfasındaki `ablative()` / `dative()`.
