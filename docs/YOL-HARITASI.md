# Yol haritası: SEO Masası, AI Görünürlük ve site düzeltmeleri

Bu belge hadiumreyegidelim.com için sıradaki işlerin **tek doğru listesidir**. Claude Code ve Antigravity aynı belgeyi kullanır: her ajan işe buradan başlar, bitirdiği adımı burada işaretler. Kaynak: 29 Eylül 2026 canlı hata raporları (commit `acb8c74`).

---

## 1. Ajanlar için çalışma kuralları

Bir oturuma başlarken bu bölümü uygula. Kullanıcı başka bir şey istemedikçe:

1. `git pull` yap, sonra bu belgede **ilk işaretlenmemiş adımı** bul (faz sırası önemli; Faz 0 kullanıcı işidir, atla).
2. Adımın **Dosyalar**, **Yapılacak** ve **Bitti sayılır** kısımlarını oku. Belirsizlik varsa kullanıcıya sor; tahmin etme.
3. **Tek adım = tek commit.** Commit mesajı adım kodunu içersin (ör. `[1.1] AI Mode: depth parametresini kaldır`).
4. Doğrula: `npx tsc --noEmit -p .` (src/ altında hata kalmamalı) ve ilgili dosyalar için `npx eslint <dosya>`. Görünür değişiklikse `npm run dev` ile sayfaya bak.
5. `git push origin main` → Vercel otomatik canlıya alır. `gh api repos/birokoli/hadiumreyegidelim/commits/<sha>/status` ile Vercel durumunun `success` olduğunu gör.
6. Bu belgede adımı `[x]` yap, **Durum günlüğü**ne bir satır ekle (tarih, ajan, commit, not). Bu belge değişikliği aynı commit'e girebilir.
7. Büyük arayüz değişikliğinde (sayfa yeniden tasarımı) push etmeden önce kullanıcıdan onay al. Küçük düzeltmeler doğrudan push edilebilir.

**Asla yapma:** `.env` dosyasını commit etme veya kopyalama; şifre/anahtar değerlerini koda, loglara ya da bu belgeye yazma; `main` dışında dal açıp unutma; `git push --force`.

### Proje bağlamı (kısa)

| Konu | Bilgi |
|---|---|
| Repo | github.com/birokoli/hadiumreyegidelim, yerel kopya `~/Projelerim/hadiumreyegidelim` |
| Çatı | Next.js **16.2** (AGENTS.md: kırıcı değişiklikler var, `node_modules/next/dist/docs/` oku), React 19, Tailwind v4, Prisma + Supabase PostgreSQL |
| Canlı | Vercel, `main`'e push = production. Admin: `admin.hadiumreyegidelim.com` |
| SEO Masası | `/admin/seo`, kod: `src/app/(admin)/admin/seo`, `src/app/api/admin/seo`, `src/lib/seo` |
| AI Görünürlük | `/admin/ai-visibility`, kod: `src/app/(admin)/admin/ai-visibility`, `src/app/api/admin/ai-vis`, `src/lib/ai-vis` |
| Veri | `Setting` tablosunda JSON: `SEO_*` ve `AI_VIS_*` anahtarları (şema değişikliği yok) |
| Ortam değişkenleri | `DATABASE_URL`, `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`, `ANTHROPIC_API_KEY` (Vercel'de tanımlı) |
| Hata raporu | Her SEO/AI sayfasında menüde **Hata raporu** düğmesi: sorunları, bağlantı testlerini ve istek kaydını Markdown olarak verir. Canlıda doğrulama için bunu iste |
| Yerel geliştirme | Yerelde `.env` yok (kopyalanması engellendi); veritabanı ve API anahtarı gerektiren akışlar yerelde çalışmaz, canlıda Hata raporu ile doğrulanır. Yerel admin girişi: `localhost`'ta `admin_session=true` çerezi |
| Tasarım dili | SEO/AI sayfaları: beyaz zemin, lacivert `#003781` / `#001944`, kırmızı `#ba1a1a` yalnızca hata; Schibsted Grotesk; kart yok. Tokenlar `src/app/(admin)/admin/seo/seo.css` |
| Bilinen tuzak | SWC, `&apos;` içeren çok satırlı JSX metninde element sonrası boşluğu siliyor → `</Link>{" "}metin` yaz |

---

## 2. Mevcut durum (29 Eylül 2026)

- **Bağlantılar:** Veritabanı çalışıyor. DataForSEO çalışıyor, bakiye **$50.81**; o günkü harcama $0.19 (24 AI sorgusu). Anthropic anahtarı geçerli ama **kredi yok**.
- **SEO denetimi:** 128 sayfa, puan **83/100**. Canonical host (128 sayfa), yavaş yanıt (86), birden fazla H1 (85), uzun title (103), açıklama uzunluğu (14), link almayan sayfa (5), og:image eksik (5).
- **Programatik:** 81 şehir sayfasının metni ortalama **%86** oranında aynı.
- **AI Görünürlük:** 4 soru. ChatGPT, Gemini ve Perplexity yanıt veriyor, marka **hiçbirinde anılmıyor**. Claude sorguları kredi yüzünden 4/4 hata, Google AI Mode 4/4 hata (kod), Google AI Overview 2/4 hata (DataForSEO geçici). Hazırlık puanı **54/100**. Rakip ve takip edilen kelime henüz girilmedi.

---

## 3. Adımlar

### Faz 0 · Kullanıcı ayarları (kod gerekmez)

- [x] **0.1 Anthropic kredisi.** ($40 yüklendi, 29.09) console.anthropic.com → Plans & Billing'den kredi yükle, **ya da** AI Görünürlük → Sorular'da Claude'un işaretini kaldır. Kredi olmadan her Claude sorgusu hata verir.
- [ ] **0.2 Ana alan adı.** KARAR (2026-09-29): ana adres **www'suz `hadiumreyegidelim.com`**. Kod zaten bu adresi kullanıyor. Kalan iş kullanıcıda: Vercel → Domains'te `hadiumreyegidelim.com`'u primary yap, `www`'yu ona 308 ile yönlendir. Yapılınca bu adımı işaretle ve SEO Masası'nda denetimi yeniden çalıştırarak 2.1'i doğrula.
  - Sorun: Şu an site www'suz adresi `www.hadiumreyegidelim.com`'a yönlendiriyor; canonical, sitemap ve robots ise www'suz adresi gösteriyor.
- [ ] **0.3 Rakipler.** AI Görünürlük → Rakipler'e 3–5 rakip firma (ad + alan adı) gir; SEO Masası → Rakipler'e aynı alan adlarını gir.
- [ ] **0.4 Takip edilen kelimeler.** SEO Masası → Kelimeler'de 10–20 hedef kelime seçip takibe al, Sıralar'da ilk kontrolü çalıştır.
- [ ] **0.5 Sorular.** AI Görünürlük'teki soruları 10–15'e çıkar (öneriler + persona). Markalı soru eklemek gerekmez.

### Faz 1 · Hata düzeltmeleri (kod, öncelikli)

- [x] **1.1 Google AI Mode: `depth` hatası**
  - Belirti: `DataForSEO: Invalid Field: 'depth'. (40501)`, 4/4 sorgu.
  - Dosyalar: `src/lib/ai-vis/engines.ts` → `runGoogle()`.
  - Yapılacak: `google-ai-mode` isteğinden `depth` alanını kaldır (yalnızca organic SERP'te kalsın). DataForSEO dokümanından `serp/google/ai_mode/live/advanced` parametrelerini kontrol et.
  - Bitti sayılır: Sorular'da AI Mode sütununda `!` kalmıyor; Hata raporunda `google-ai-mode` hatası yok.

- [x] **1.2 Google AI Overview: geçici hata ve boş yer tutucu**
  - Belirti: 2 sorguda `Internal SE Server Error. (40101)`. "Başarılı" bir yanıtın metni ise anlamsız: `` `bilsis` :load{skill_names:[travel,shopping,local]} ``.
  - Dosyalar: `src/lib/ai-vis/engines.ts` (`runGoogle`), `src/lib/seo/dataforseo.ts` (`dfsPost` yeniden deneme).
  - Yapılacak: (a) AI Overview için `40101`'de de 2 kez yeniden dene (Elmo `retryTransient` ile aynı; yalnızca bu uç nokta için). (b) Markdown `:load{` içeriyorsa ya da kaynaksız ve 80 karakterden kısaysa `no_surface` say, `note` alanına açıklama yaz.
  - Bitti sayılır: Yer tutucu metinler "AI yanıtı çıkmadı" olarak görünüyor; 40101 tek seferlik hatalarda sorgu başarısız olmuyor.

- [x] **1.3 Claude: kredi hatasını anlaşılır göster**
  - Belirti: Ham JSON hata; tanı testi "ok" diyor çünkü `models.retrieve` kredi gerektirmiyor.
  - Dosyalar: `src/lib/ai-vis/engines.ts` (`runClaude`), `src/app/api/admin/diagnostics/route.ts`, `src/lib/diag/report.ts`.
  - Yapılacak: Anthropic SDK'nın hata sınıflarıyla (`Anthropic.BadRequestError` vb.) mesajı yakala; "credit balance" içeriyorsa "Anthropic kredisi bitti: console.anthropic.com → Plans & Billing" yaz. Rapordaki sorun listesinde aynı hatayı motor başına **tek satırda** grupla (şu an her yanıt ayrı satır çünkü request_id farklı; gruplamadan önce `request_id`'yi çıkar).
  - Bitti sayılır: Yanıtlar sayfasında ve raporda tek, Türkçe, yönlendirici mesaj.

- [x] **1.4 Hata raporunu kısalt**
  - Belirti: DataForSEO `spentToday` alanı raporun ~750 satırını sıfırlarla dolduruyor.
  - Dosyalar: `src/app/api/admin/diagnostics/route.ts` veya `src/lib/seo/dataforseo.ts` (`dfsAccount`).
  - Yapılacak: `spentToday`'dan yalnızca `total` ve `total_*` alanlarından sıfır olmayanları döndür.
  - Bitti sayılır: Rapor 300 satırın altında, harcama bilgisi korunuyor.

- [ ] **1.5 `r["@context"].toLowerCase` JS hatası**
  - Belirti: `/admin/ai-visibility/yanitlar` sayfasında Safari'de. Kodumuzda bu ifade yok; büyük olasılıkla sayfadaki JSON-LD'yi okuyan bir tarayıcı eklentisi.
  - Yapılacak: Kullanıcıdan Safari'de eklentisiz (gizli pencere) sayfayı açıp Hata raporu almasını iste. Hata tekrar etmezse bu adımı "eklenti kaynaklı, yapılacak yok" diye kapat. Tekrar ederse `src/app/layout.tsx`'teki JSON-LD bloklarında `@context` alanı eksik bir nesne ara.
  - Bitti sayılır: Kaynak belirlendi ve not düşüldü.

- [ ] **1.6 Güvenlik: admin oturumu taklit edilebiliyor** *(yüksek öncelik)*
  - Sorun: `admin_session=true` çerezini elle yazan herkes süper admin oluyor (`getAdminSession` ve middleware, token yoksa izin veriyor). Ana alan adında `/api/admin/*` middleware ile hiç korunmuyor.
  - Dosyalar: `src/lib/admin-auth.ts`, `src/middleware.ts`, `src/app/api/admin/login/route.ts`, `src/app/api/admin/quotations/route.ts` (kendi `checkAdmin`'i de çerez bakıyor).
  - Yapılacak: Her yerde imzalı `admin_token` JWT zorunlu olsun; eski çerez yolunu kaldır. Login'in her admin türü için token ürettiğini doğrula. Middleware `/api/admin/*`'ı her host'ta korusun (`/api/admin/login` hariç).
  - Bitti sayılır: Tarayıcıda yalnızca `admin_session=true` yazmak artık giriş sağlamıyor; normal girişle bütün admin sayfaları çalışıyor. **Kullanıcı onayı olmadan push etme** (herkesi dışarıda bırakma riski).

- [ ] **1.7 Vercel'de iki proje, biri build'de başarısız**
  - Belirti: Her push iki Vercel projesine gidiyor: `hadiumreyegidelim.com` ve `hadiumreyegidelim`. `84fd1b5`'ten sonra `hadiumreyegidelim` projesinin build'i iki kez başarısız oldu (`8d56c03`, `cb32308`); `hadiumreyegidelim.com` projesi `cb32308`'de başarılı. Lokal `npx next build` sorunsuz. Ayrıca GitHub'da her commit'te başarısız bir "Workers Builds" (Cloudflare) ve Railway kontrolü görünüyor.
  - Yapılacak (kullanıcı ile): Vercel'de hangi projenin `hadiumreyegidelim.com` ve `admin.hadiumreyegidelim.com` alan adlarına bağlı olduğunu kontrol et. Başarısız projenin build logunu (Vercel → Deployments → son deploy → Build Logs) ajana ver. Alan adı bağlı olmayan eski proje, Cloudflare Workers ve Railway bağlantıları kullanılmıyorsa kaldırılabilir; bu karar kullanıcının.
  - Bitti sayılır: Alan adının bağlı olduğu proje her push'ta `success`; gereksiz entegrasyonlar kaldırıldı ya da nedenleri yazıldı.

### Faz 2 · Teknik SEO (site geneli)

- [ ] **2.1 Canonical host** (0.2 kararına göre)
  - Sorun: 128 sayfada canonical, yönlendirme yapan adresi gösteriyor.
  - Dosyalar: `src/app/layout.tsx` (metadataBase), `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/(main)/[slug]/page.tsx`, `grep -rn "https://hadiumreyegidelim.com" src` ile bulunan her yer. Tek bir `SITE_URL` sabitinde topla (`src/lib/seo/site.ts` hazır).
  - Bitti sayılır: SEO Masası → Denetim'de `canonical-host` sorunu yok.

- [ ] **2.2 Sayfa hızı** (86 sayfa 1,5 sn üstü)
  - Olası neden: Kök layout her istekte `setting.findMany` çağırıyor; şehir ve blog sayfaları dinamik.
  - Yapılacak: Kök layout ve sayfalardaki ayar sorgularını önbelleğe al (Next 16 önbellek API'si için `node_modules/next/dist/docs` oku; `revalidate` / cache bileşenleri). Şehir sayfaları için statik üretim (generateStaticParams zaten var).
  - Bitti sayılır: Denetimde `slow` sayfa sayısı 20'nin altında.

- [ ] **2.3 Birden fazla H1** (85 sayfa; şehir şablonu, blog, `/bireysel-umre`)
  - Dosyalar: `src/components/features/BireyselUmreClient.tsx`, blog yazı şablonu. Sayfada tek `<h1>`, diğerleri `<h2>`.
  - Bitti sayılır: `h1-multiple` sorunu 5 sayfanın altında.

- [ ] **2.4 Uzun title** (103 sayfa)
  - Neden: Başlıklara eklenen `| Hadi Umre'ye Gidelim` son eki. Şehir sayfası title'ı: `{Şehir} Çıkışlı Bireysel Umre 2026 — Fiyat & Paketler`.
  - Yapılacak: Son eki kısalt ya da uzun başlıklarda kaldır; ana kelimeyi başta tut. 60 karakter hedefi.
  - Bitti sayılır: `title-long` sorunu 15 sayfanın altında.

- [ ] **2.5 Meta açıklama uzunluğu** (14 sayfa) ve **og:image** (5 sayfa). Denetimdeki sayfa listesini kullan.
- [ ] **2.6 Link almayan sayfalar** (5): `/umre-vizesi` ve 4 blog yazısı. İlgili hub sayfalarından link ver.

### Faz 3 · Programatik sayfalar ve içerik

- [ ] **3.1 Şehir sayfalarını farklılaştır** (%86 aynı metin)
  - Dosyalar: `src/lib/turkey-cities.ts`, `src/app/(main)/[slug]/page.tsx`, `src/components/features/BireyselUmreClient.tsx`.
  - Yapılacak: Her şehre özgü veri ekle: kalkış havalimanı ve aktarma, tahmini uçuş süresi, o şehirden kalkan paketler (Package tablosu), şehre özgü 3 SSS. Uydurma veri ekleme; bilinmeyen alanı gösterme.
  - Bitti sayılır: SEO Masası → Programatik'te ortak metin oranı %60'ın altında.

- [ ] **3.2 Yeni sayfa grupları.** Programatik sayfasında "Arama hacimlerini getir" ile hacmi olan kalıpları seç (aile/yaşlı umresi, ay bazlı umre). Yalnızca hacmi olan ve gerçek içerik verilebilen sayfaları aç. Kullanıcı onayı gerekir.

### Faz 4 · AI görünürlük (GEO)

- [ ] **4.1 Hazırlık puanını 80'e çıkar** (şu an 54)
  - AI Görünürlük → Hazırlık sayfasındaki eksikler: soru biçimli H2'ler, görünür "Son güncelleme" + JSON-LD `dateModified`, resmî kaynak linkleri (Diyanet, Nusuk, Suudi vize portalı), blog yazılarında yazar.
  - Ana sayfa, `/bireysel-umre`, `/paketler`, `/umre-vizesi`, `/ilk-umrem`, bir şehir sayfası şablonu ve blog şablonundan başla.
- [ ] **4.2 Temel ölçüm.** 0.3–0.5 bittikten sonra bütün soruları bütün motorlarda bir kez çalıştır; sonuçları (anılma %, ses payı, kaynak payı) Durum günlüğüne yaz. Sonraki ölçümler buna göre değerlendirilir.
- [ ] **4.3 Kaynak fırsatları.** AI Görünürlük → Kaynaklar → "Kaynak fırsatları" tablosundaki ilk 10 siteyi incele: hangilerinde yer alınabilir (liste, forum yanıtı, rehber içeriği). Kod işi değil; kullanıcıyla plan.
- [ ] **4.4 İçerik boşlukları.** Rakipler sayfasındaki "İçerik boşlukları" soruları için sitede o soruyu doğrudan cevaplayan bölüm/sayfa yaz (no-ai-slop kurallarıyla, uydurma bilgi olmadan).

### Faz 5 · Otomasyon ve sağlamlık

- [ ] **5.1 `ignoreBuildErrors` kapat.** `tsc` artık `src/` altında temiz (acb8c74). `next.config.ts`'te `typescript.ignoreBuildErrors`'ı kaldır ki tip hataları bir daha canlıya çıkmasın. Önce yerelde `npx next build` çalıştır.
- [ ] **5.2 Haftalık otomatik ölçüm.** Vercel cron ile haftada bir AI sorularını ve sıra kontrolünü çalıştıran uç nokta; harcama sınırı (ör. tek çalıştırmada en fazla $2) ve `CRON_SECRET` kontrolü. Maliyet için kullanıcı onayı gerekir.
- [ ] **5.3 Hata raporu diğer admin sayfalarında.** `DiagButton`'ı Excel Fiyat Motoru ve Fiyat Teklifleri sayfalarına da ekle (şu an yalnızca SEO/AI).
- [ ] **5.4 Depolamayı tabloya taşı.** AI yanıtları ve günlük özetler büyüyünce `Setting` JSON yerine Prisma modelleri (`AiVisRun`, `AiVisDaily`). Supabase migration'ı kullanıcı onayıyla, ham SQL ile (bkz. proje hafızası: `prisma db push` kullanılmıyor).

### Faz 6 · GEO Blog Motoru (Google + AI'da görünür bloglar)

Amaç: Konuyu veriden seç, gerçek kaynaklarla araştır, alıntılanabilir yaz, kaliteyi ölç, taslak olarak kaydet, onayla yayınla ve ölçüme bağla. Mevcut `src/lib/blog-pipeline.ts` rastgele konu seçiyor, araştırmadan yazıyor (uydurma deneyim/rakam isteyen prompt), sabit ve kırık bir link (`/rehber` → 404) koyuyor ve doğrudan yayınlıyor; yerine geçecek.
Kurulan skill'ler: claude-seo eklentisi (seo-content, seo-content-brief, seo-cluster, seo-geo, seo-schema), geo-seo-claude (geo-citability, geo-content, geo-llmstxt), marketingskills (site-architecture, schema-markup). Alıntılanabilirlik ölçütü: cevap ilk cümlede, 134–167 kelimelik kendi başına anlaşılır pasajlar, soru H2'leri, kaynaklı rakamlar, tablo, SSS.

- [x] **6.1 Sayfa envanteri ve link seçici** – `src/lib/geo-blog/inventory.ts` (HUBS canlıda 200 doğrulandı, yazılar, paketler, şehirler; `pickLinkTargets`, `isInternalPath`). Henüz hiçbir yerde kullanılmıyor.
- [x] **6.2 Araştırma** – `src/lib/geo-blog/research.ts`: Claude `claude-opus-5` + `web_search_20260209` (`user_location` TR, max_uses 8) ile konu için niyet, sorular, olgular `{claim, sourceUrl}` ve kaynaklar. Yalnızca web_search sonuçlarında gerçekten görülen URL'leri kabul et. Hata mesajları için `src/lib/ai-vis/engines.ts` içindeki `explainAnthropicError`'ı dışa aktarıp kullan. `fallbacks: "default"` + `server-side-fallback-2026-07-01` (bkz. `runClaude`).
- [x] **6.3 Yazım** – `src/lib/geo-blog/write.ts`: `client.messages.parse` + `jsonSchemaOutputFormat` (`@anthropic-ai/sdk/helpers/json-schema`) ile JSON: title (≤60), slug, metaDescription (120–160), tldr, content (HTML, H1 yok, ≥4 H2 ve ≥3'ü soru, her H2 40–60 kelimelik doğrudan cevapla başlar, 1 tablo, 1200–2000 kelime), faq (4–6), keywords. İç linkler yalnızca `pickLinkTargets` adaylarından (4–8), dış linkler yalnızca araştırma kaynaklarından. Uydurma deneyim, müşteri, rakam yok; her rakam bir kaynağa bağlı. no-ai-slop yasaklı kalıpları.
- [x] **6.4 Kalite kapısı** – `src/lib/geo-blog/gate.ts`: deterministik kontroller (uzunluklar, H1 yok, soru H2, iç linkler `isInternalPath`, dış linkler kaynak listesinde, tablo, SSS, yasaklı ifadeler, birimli rakam sayısı). Kritik hata ya da puan <80 ise hatalarla birlikte bir kez yeniden yazdır.
- [x] **6.5 Boru hattı ve API** – `src/lib/geo-blog/pipeline.ts` + `src/app/api/admin/geo-blog/{opportunities,generate,publish,links}/route.ts`. generate NDJSON ile ilerleme akıtır (maxDuration 300), sonucu **taslak** Post olarak kaydeder (`published:false`, `seoScore`, `faq` JSON, `tldr`, `references` = kaynak listesi). Yetki: `requireSeoAdmin()`.
- [x] **6.6 Fırsat kuyruğu** – AI Görünürlük içerik boşlukları ve anılmadığımız sorular (`src/lib/ai-vis/metrics.ts`: contentGaps, fanOutQueries), SEO'da takip edilip ilk 10'da olmayan kelimeler, mevcut yazılarla çakışmayan konular.
- [ ] **6.7 Arayüz** – SEO Masası'na "07 Blog" bölümü (fırsatlar, konu yaz → üret, taslaklar + kapı puanı, önizleme, Yayınla). AI Görünürlük → Rakipler'deki içerik boşluklarına "Bu soru için yazı üret" linki. Tasarım dili SEO Masası ile aynı.
- [ ] **6.8 Yayın sonrası ölçüm** – Yayınla: `published:true`, odak kelimeyi `SEO_TRACKED_KEYWORDS`'e, ana soruyu `AI_VIS_CONFIG.prompts`'a (etiket "blog") ekle, `revalidatePath`.
- [ ] **6.9 İç link önerileri** – mevcut yazılar için öneri ve tek tıkla uygulama (mevcut `<a>` içine girmeden ilk geçen ifadeye link); eski yazılardaki `/rehber` kırık linklerini düzelt.
- [ ] **6.10 Dinamik llms.txt** – `public/llms.txt`'i kaldırıp `src/app/llms.txt/route.ts`: mevcut başlık metni + hub'lar + son 50 yazı + paketler.
- [ ] **6.11 Cron'u yeni motora bağla** – `src/app/api/cron/auto-blog` yeni motorla **taslak** üretsin; otomatik yayın yalnızca `GEO_BLOG_AUTOPUBLISH=true` ve kapı geçtiyse. Kullanıcı onayı gerekir.

---

## 4. Durum günlüğü

En yeni en üstte. Her tamamlanan adım için bir satır.

| Tarih | Ajan | Adım | Commit | Not |
|---|---|---|---|---|
| 2026-09-29 | Antigravity | 6.6 | (bu commit) | GEO blog fırsat kuyruğu (getBlogOpportunities) yazıldı; AI content gaps, fan-out aramaları ve SEO kelimeleri skorlandı |
| 2026-09-29 | Antigravity | 6.5 | (bu commit) | GEO blog boru hattı (generateBlogDraft) ve API uç noktaları (generate, publish, opportunities, links) yazıldı |
| 2026-09-29 | Antigravity | 6.4 | (bu commit) | GEO blog kalite kapısı (evaluateArticleQuality) yazıldı; kelime sayısı, H1, H2 soru, tablo, link doğrulama ve AI-slop filtreleri uygulandı |
| 2026-09-29 | Antigravity | 6.3 | (bu commit) | GEO blog yazım modülü (writeArticle) yazıldı; SEO+GEO kuralları, H2 soru formatı, HTML tablo ve link kısıtları uygulandı |
| 2026-09-29 | Antigravity | 6.2 | (bu commit) | GEO blog araştırma modülü (researchTopic) yazıldı; web_search entegrasyonu yapıldı |
| 2026-09-29 | Claude Code | 6.1 | (bu commit) | Faz 6 planı yazıldı; envanter eklendi. claude-seo eklentisi ve geo-seo-claude skill'leri kuruldu (Claude + Antigravity). Anthropic'e $40 kredi yüklendi (0.1 tamam) |
| 2026-09-29 | Claude Code | 1.4 | 84fd1b5 | DataForSEO günlük harcama dökümü yalnızca sıfır olmayan toplamlara indirildi |
| 2026-09-29 | Claude Code | 1.3 | 396e648 | Claude hataları Türkçe ve yönlendirici; raporda gruplama |
| 2026-09-29 | Claude Code | 1.1, 1.2 | cf7a443 | AI Mode depth kaldırıldı; AI Overview 40101 yeniden deneme ve yer tutucu tespiti. 0.2 kararı: www'suz ana adres |
| 2026-09-29 | Claude Code | yol haritası | a45bb7c | Canlı hata raporlarından (acb8c74) oluşturuldu |
| 2026-09-29 | Claude Code | önceki iş | acb8c74 | Excel Fiyat Motoru çökmesi ve teklif formu NaN/kişi sayısı düzeltildi |
| 2026-09-29 | Claude Code | önceki iş | 19d3c81 | Hata raporu düğmesi eklendi |
| 2026-09-29 | Claude Code | önceki iş | 6c83697 | AI Görünürlük yeniden kuruldu |
| 2026-09-29 | Claude Code | önceki iş | 02a6446 | SEO Masası (OpenSEO entegrasyonu) |

---

## 5. Antigravity'ye devretme

Yeni bir Antigravity oturumunda şunu yapıştırmak yeterli:

> `docs/YOL-HARITASI.md` dosyasını oku ve "Ajanlar için çalışma kuralları"na göre ilk işaretlenmemiş adımı yap. Bitince belgeyi güncelle, commit'le, push et ve Vercel durumunu kontrol et. Emin olmadığın yerde bana sor.

Canlıda bir şey bozulursa: ilgili admin sayfasında **Hata raporu → Raporu kopyala** ve ajana yapıştır.
