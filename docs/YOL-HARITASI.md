# Yol haritası: SEO Masası, AI Görünürlük, blog motoru ve site düzeltmeleri

Bu belge hadiumreyegidelim.com için sıradaki işlerin **tek doğru listesidir**. Claude Code ve Antigravity aynı belgeyi kullanır: her ajan işe buradan başlar, bitirdiği adımı burada işaretler. İlk sürüm 29 Eylül 2026 canlı hata raporlarından çıkarıldı; son güncelleme 30 Eylül 2026.

**Nasıl okunur:** Önce "Admin'de ne nerede" bölümüne bakın, sistemin parçalarını anlatır. Sonra "Görev dağılımı" tablosunda kimin neyi yaptığını görün. Adımlar fazlara ayrılmıştır; her adımda *neden* yapıldığı, *ne* yapılacağı ve *ne zaman bitmiş sayılacağı* yazar. `[x]` biten, `[ ]` bekleyen adımdır.

---

## 0. Admin'de ne nerede (sistem haritası)

| Admin'deki yer | Ne işe yarar | Kod |
|---|---|---|
| **SEO Masası** (`/admin/seo`, menü: Pazarlama & Büyüme) | Google tarafı. 01 Durum özeti · 02 Denetim: sitemap'teki her sayfayı 33 kuralla kontrol eder (ücretsiz) · 03 Kelimeler: arama hacmi ve zorluk (DataForSEO) · 04 Sıralar: seçilen kelimelerde Google sırası · 05 Rakipler: alan adı karşılaştırması · 06 Programatik: şehir sayfalarının benzerliği ve açılabilecek sayfa grupları | `src/app/(admin)/admin/seo`, `src/app/api/admin/seo`, `src/lib/seo` |
| **AI Görünürlük** (`/admin/ai-visibility`, menü: Sistem) | AI arama tarafı. Seçilen soruları ChatGPT, Gemini, Perplexity, Google AI Overview/AI Mode (DataForSEO) ve Claude'a sorar; markanın anılıp anılmadığını, sırasını, kaynakları ve rakipleri ölçer. 06 Hazırlık: sitenin AI'a uygunluk denetimi (ücretsiz) | `src/app/(admin)/admin/ai-visibility`, `src/app/api/admin/ai-vis`, `src/lib/ai-vis` |
| **İçerik Stüdyosu → Blog İçerikleri** (`/admin/content`) | **Blog yazılarının tek yeri.** Üstte *Blog motoru* (Otomatik yazı · Yeni yazı üret · İç linkler), altta bütün yazılar (taslaklar dahil), düzenleyici ve yayınlama. Eski "Yapay Zeka (AI)" sayfası ve SEO Masası "07 Blog" buraya yönlenir | Sayfa: `src/app/(admin)/admin/content/page.tsx`, motor: `src/components/admin/content/BlogEngine.tsx`, `src/lib/geo-blog`, `src/app/api/admin/geo-blog` |
| **Hata raporu** (SEO Masası ve AI Görünürlük menüsünde) | Sorunları, bağlantı testlerini (veritabanı, DataForSEO bakiyesi, Anthropic) ve son istekleri tek Markdown'da toplar; ajana yapıştırılır | `src/lib/diag`, `src/components/admin/seo/DiagButton.tsx` |
| **Claude bütçesi** (Blog motoru → Otomatik yazı) | Bu ayki tahmini Claude harcaması ve aylık sınır | `src/lib/ai-budget.ts` |

### Blog motoru nasıl çalışır

1. **Konu seçimi (fırsat kuyruğu):** Öncelik sırası: rakiplerin AI yanıtlarında anılıp markanın anılmadığı sorular → AI'ın yanıt öncesi arattığı ama sitemizi kaynak göstermediği aramalar → takip edilen ve Google'da ilk 10'da olmayan kelimeler → markanın hiç anılmadığı AI soruları. Mevcut bir yazıyla örtüşen konular elenir.
2. **Araştırma:** Claude web araması yapar (en fazla 6 arama). Yalnızca aramada gerçekten görülen URL'ler kaynak sayılır; doğrulanamayan bilgi atılır.
3. **Yazım:** Kesin JSON şemasıyla yazılır: soru biçimli H2'ler, her bölümün başında 40–60 kelimelik doğrudan cevap, tablo, SSS. Rakamlar yalnızca doğrulanmış bilgilerden gelir ve kaynağına link verilir. İç linkler sitenin gerçek sayfa envanterinden seçilir.
4. **Kalite kapısı:** Kod tarafında ölçülebilir kontroller (uzunluk, H1 yok, soru başlıkları, link geçerliliği, yasaklı AI kalıpları, tablo, SSS). Geçemezse ve süre varsa bir kez düzelttirilir.
5. **Taslak:** Yazı `published:false` olarak kaydedilir ve İçerik Stüdyosu listesinde "Taslak · Kalite 85" gibi görünür. Otomatik yazıda her adım panelin "Son çalıştırmalar" listesine yazılır.
6. **Yayın:** Listeden **Yayınla** ya da düzenleyiciden kaydetme. Yayına geçen her yazı (elle, zamanlanmış ya da otomatik) ölçüme bağlanır: odak kelime SEO sıra takibine, yazının cevapladığı soru AI Görünürlük sorularına eklenir.
7. **Otomatik mod:** Cron her gün 09:00 ve 11:00'de (TSİ) dener, günde en fazla bir taslak üretir. "Kalite kapısını geçen taslağı otomatik yayınla" kapalıysa (varsayılan) yazılar onay bekler.

### Dış link kuralı (kullanıcı kararı, 30.09)

- Blog yazılarında dış link **yalnızca** resmî kurumların **bilgi** sayfalarına verilir: Diyanet (`diyanet.gov.tr` ve alt alan adları), Nusuk (`nusuk.sa`), Suudi devlet siteleri (`*.gov.sa`).
- **Sattığımız hizmetler asla dışarı linklenmez** (müşteri kaçmasın): vize → `/umre-vizesi`, paket/fiyat → `/paketler`, rehberlik → `/rehberlik`, transfer/tren → `/hizmetler`, otel/konaklama/uçuş → `/bireysel-umre`. Vize portalları (`visa.*`, `visitsaudi.com`), Nusuk paket/otel sayfaları ve adresinde visa/hotel/booking/package geçen sayfalar resmî olsa da yasak. Dış link yalnızca ibadet kuralları, sağlık şartları, giriş kuralları, Ravza randevusu gibi bilgi konularına.
- Rakip firma (acente, tur şirketi) sitelerine link verilmez; rakip adları yazıda geçmez.
- Link metni kurum adı değil konu kelimesidir: `umre vizesi başvurusu` → vize portalı. "Diyanet'in sitesi", "Nusuk portalı" gibi metinler ve "Diyanet'e göre" gibi atıflar yok.
- Nerede uygulanıyor: `src/lib/geo-blog/external-policy.ts`.
  - Araştırmada web araması yalnızca bu sitelerde yapılır (`allowed_domains`).
  - Yazım talimatı kuralları anlatır.
  - Kalite kapısı izinsiz alan adını, sattığımız hizmete verilmiş dış linki, kurum adıyla yazılmış link metnini ve rakip adını (AI Görünürlük → rakipler listesi) kritik hata sayar.
  - Kayıttan önce: sattığımız hizmeti anlatan dış link kendi sayfamıza çevrilir, diğer izinsiz linkler silinir.
  - Eski yazılar: İçerik Stüdyosu → Blog motoru → İç linkler sekmesinde "izinsiz dış linki düzelt" düğmesi (hizmet linklerini kendi sayfamıza çevirir, gerisini kaldırır); rakip adı geçen yazılar kırmızı etiketle gösterilir (metin elle düzeltilir).
- Ajanlar: bu kuralı gevşetme; yeni resmî alan adı eklemek kullanıcı onayı ister.
- **Yasaklı kelimeler:** "TÜRSAB" ve "diyanetsiz" sitede, blogda, meta ve schema'da hiç geçmez (`BANNED_TERMS`, `external-policy.ts`). Onun yerine "bireysel umre", "kendi programıyla umre".

### Claude bütçesi ve maliyet (Anthropic'te 40 $ yüklü)

- Bir blog yazısı (araştırma + yazım, gerekirse düzeltme) tahmini **0,5–1 $**. AI Görünürlük'te Claude'a sorulan bir soru tahmini **0,05–0,2 $**. ChatGPT/Gemini/Perplexity/Google sorguları DataForSEO bakiyesinden düşer, Anthropic'ten değil.
- Varsayılan **aylık sınır 15 $** (Blog motoru → Otomatik yazı panelinden değiştirilir). Sınır dolunca yeni Claude çağrısı yapılmaz, hata mesajı neden durduğunu söyler. Bu sınırla 40 $ en az 2–3 ay yeter.
- Harcama liste fiyatıyla **tahmindir** (Opus 5: 5 $ / 25 $ milyon token, web araması 0,01 $). Kesin tutar: console.anthropic.com → Usage.
- Tasarrufa yönelik kararlar: günde en fazla bir otomatik yazı; araştırmada en fazla 6 arama ve orta düzey düşünme (`effort: medium`); ikinci yazım yalnızca kalite kapısı geçilmezse; AI Görünürlük'te Claude motoru isteğe bağlı (Sorular sayfasından kapatılabilir).

---

> **Devir:** Claude Code'un yaptığı işlerin özeti, değişmez kurallar ve sıradaki işler `docs/ANTIGRAVITY-DEVIR.md`'de. Yeni bir ajan önce onu okumalı.

## 1. Ajanlar için çalışma kuralları

Bir oturuma başlarken bu bölümü uygula. Kullanıcı başka bir şey istemedikçe:

1. `git pull` yap. "Görev dağılımı" tablosunda **sana atanmış** ilk işaretlenmemiş adımı bul (Faz 0 ve kullanıcı adımları senin değil). Claude Code ayrıca "(Claude incelemesi bekliyor)" notlu adımları inceler.
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
| Veri | `Setting` tablosunda JSON: `SEO_*`, `AI_VIS_*`, `ANTHROPIC_SPEND`, `AI_MONTHLY_BUDGET_USD`, `AUTO_BLOG_ENABLED`, `GEO_BLOG_AUTOPUBLISH` (şema değişikliği yok). Blog yazıları `Post`, otomatik yazı kayıtları `AILog` tablosunda |
| Blog | Tek yer: İçerik Stüdyosu (`/admin/content`). Motor: `src/lib/geo-blog`; ortak Claude çağrısı `src/lib/geo-blog/claude.ts` (bütçe kontrolü burada) |
| Ortam değişkenleri | `DATABASE_URL`, `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`, `ANTHROPIC_API_KEY` (Vercel'de tanımlı) |
| Hata raporu | Her SEO/AI sayfasında menüde **Hata raporu** düğmesi: sorunları, bağlantı testlerini ve istek kaydını Markdown olarak verir. Canlıda doğrulama için bunu iste |
| Yerel geliştirme | Yerelde `.env` yok (kopyalanması engellendi); veritabanı ve API anahtarı gerektiren akışlar yerelde çalışmaz, canlıda Hata raporu ile doğrulanır. Yerel admin girişi: `localhost`'ta `admin_session=true` çerezi |
| Tasarım dili | SEO/AI sayfaları: beyaz zemin, lacivert `#003781` / `#001944`, kırmızı `#ba1a1a` yalnızca hata; Schibsted Grotesk; kart yok. Tokenlar `src/app/(admin)/admin/seo/seo.css` |
| Bilinen tuzak | SWC, `&apos;` içeren çok satırlı JSX metninde element sonrası boşluğu siliyor → `</Link>{" "}metin` yaz |

---

## 2. Mevcut durum

**30 Eylül 2026 itibarıyla:** Blog motoru İçerik Stüdyosu'nda tek yerde. Anthropic'e 40 $ yüklendi, aylık 15 $ sınırlı bütçe takibi çalışıyor. Otomatik yazı varsayılan olarak kapalı: açmak için İçerik Stüdyosu → Blog motoru → Otomatik yazı. `ignoreBuildErrors` kapatıldı, tip hataları artık build'i durduruyor.

**29 Eylül 2026 ilk ölçüm:**

- **Bağlantılar:** Veritabanı çalışıyor. DataForSEO çalışıyor, bakiye **$50.81**; o günkü harcama $0.19 (24 AI sorgusu). Anthropic anahtarı geçerli ama **kredi yok**.
- **SEO denetimi:** 128 sayfa, puan **83/100**. Canonical host (128 sayfa), yavaş yanıt (86), birden fazla H1 (85), uzun title (103), açıklama uzunluğu (14), link almayan sayfa (5), og:image eksik (5).
- **Programatik:** 81 şehir sayfasının metni ortalama **%86** oranında aynı.
- **AI Görünürlük:** 4 soru. ChatGPT, Gemini ve Perplexity yanıt veriyor, marka **hiçbirinde anılmıyor**. Claude sorguları kredi yüzünden 4/4 hata, Google AI Mode 4/4 hata (kod), Google AI Overview 2/4 hata (DataForSEO geçici). Hazırlık puanı **54/100**. Rakip ve takip edilen kelime henüz girilmedi.

---

## 3. Adımlar

### Görev dağılımı (30.09)

| Kim | Adımlar |
|---|---|
| **Kullanıcı** | 0.2 (Vercel ana alan adı), 0.3–0.5 (rakip, kelime, soru girişi), 0.6 (ilk blog taslağı ve otomatik yazıyı açma), 1.5 (Safari gizli pencere testi), 1.7 (Vercel projeleri) |
| **Antigravity** | 2.3 H1 · 2.4 title · 2.5 meta/og:image · 2.6 link almayan sayfalar · 4.1 hazırlık puanı · 5.3 hata raporu diğer sayfalarda |
| **Claude Code** | 1.6 güvenlik · 2.2 hız · 3.1 şehir sayfaları · 5.1 ignoreBuildErrors · 5.2 haftalık ölçüm (maliyet sınırıyla) |

**İnceleme protokolü:** Antigravity bir adımı bitirince `[x]` yapar ve adım satırının sonuna ` *(Claude incelemesi bekliyor)*` ekler. Claude Code bu adımları inceler; sorun yoksa notu ` *(incelendi ✓)*` yapar, sorun varsa düzeltir ve 6.12 gibi bir alt maddeyle ne düzeltildiğini yazar.

### Bu incelemeden çıkan kurallar (tüm ajanlar)

- `Setting` anahtarlarını elle yazma; `src/lib/seo/store.ts` (`SEO_KEYS`, `readJson`) ve `src/lib/ai-vis/store.ts` (`loadConfig`, `loadCells`) yardımcılarını kullan. Veri biçimini tahmin etme, tipini import et (`TrackedKeyword`, `AiVisConfig`).
- Veritabanına bir alanı yazmadan önce onu **okuyan** kodu bul (`grep -rn "post.faq"` gibi) ve biçimi ona göre ver.
- Kaynak/URL doğrulamasında "bulunamazsa ilkini kullan" gibi yedekler yasak: doğrulanamayan veri atılır.
- Link veya içerik dönüştürmeden önce hedefin canlıda çalıştığını `curl -s -o /dev/null -w "%{http_code}" https://hadiumreyegidelim.com/<yol>` ile doğrula.
- Saf fonksiyonları (regex, dönüştürücü, puanlama) gerçek Türkçe örneklerle test et: `npx -y tsx --tsconfig tsconfig.json <geçici-test>.ts`. JavaScript `\b` Türkçe harfleri tanımaz; `(?<!\p{L})…(?!\p{L})` ve `u` bayrağını kullan.
- Uzun Claude işleri Vercel'in 300 sn sınırına takılır; süre bütçesi koy, yarıda kalırsa bile kaydedilecek bir sonuç bırak.


### Faz 0 · Kullanıcı ayarları (kod gerekmez)

- [x] **0.1 Anthropic kredisi.** ($40 yüklendi, 29.09) console.anthropic.com → Plans & Billing'den kredi yükle, **ya da** AI Görünürlük → Sorular'da Claude'un işaretini kaldır. Kredi olmadan her Claude sorgusu hata verir.
- [ ] **0.2 Ana alan adı.** KARAR (2026-09-29): ana adres **www'suz `hadiumreyegidelim.com`**. Kod zaten bu adresi kullanıyor. Kalan iş kullanıcıda: Vercel → Domains'te `hadiumreyegidelim.com`'u primary yap, `www`'yu ona 308 ile yönlendir. Yapılınca bu adımı işaretle ve SEO Masası'nda denetimi yeniden çalıştırarak 2.1'i doğrula.
  - Sorun: Şu an site www'suz adresi `www.hadiumreyegidelim.com`'a yönlendiriyor; canonical, sitemap ve robots ise www'suz adresi gösteriyor.
- [ ] **0.3 Rakipler.** AI Görünürlük → Rakipler'e 3–5 rakip firma (ad + alan adı) gir; SEO Masası → Rakipler'e aynı alan adlarını gir.
- [ ] **0.4 Takip edilen kelimeler.** SEO Masası → Kelimeler'de 10–20 hedef kelime seçip takibe al, Sıralar'da ilk kontrolü çalıştır.
- [ ] **0.5 Sorular.** AI Görünürlük'teki soruları 10–15'e çıkar (öneriler + persona). Markalı soru eklemek gerekmez.
- [ ] **0.6 İlk blog taslağı.** İçerik Stüdyosu → Blog motoru → Otomatik yazı → **Şimdi bir taslak yaz**. 2–4 dakika sonra taslak aşağıdaki listede "Taslak · Kalite …" olarak çıkar; açıp okuyun, uygunsa **Yayınla**. Sonucu beğenirseniz "Her gün otomatik taslak üret" kutusunu açın. Beklenen maliyet yazı başına 0,5–1 $.

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

- [x] **1.6 Güvenlik: admin oturumu taklit edilebiliyor** *(yüksek öncelik)*
  - Sorun: `admin_session=true` çerezini elle yazan herkes süper admin oluyor (`getAdminSession` ve middleware, token yoksa izin veriyor). Ana alan adında `/api/admin/*` middleware ile hiç korunmuyor.
  - Dosyalar: `src/lib/admin-auth.ts`, `src/middleware.ts`, `src/app/api/admin/login/route.ts`, `src/app/api/admin/quotations/route.ts` (kendi `checkAdmin`'i de çerez bakıyor).
  - Yapılacak: Her yerde imzalı `admin_token` JWT zorunlu olsun; eski çerez yolunu kaldır. Login'in her admin türü için token ürettiğini doğrula. Middleware `/api/admin/*`'ı her host'ta korusun (`/api/admin/login` hariç).
  - Bitti sayılır: Tarayıcıda yalnızca `admin_session=true` yazmak artık giriş sağlamıyor; normal girişle bütün admin sayfaları çalışıyor. **Kullanıcı onayı olmadan push etme** (herkesi dışarıda bırakma riski).
  - **Durum (30.09, Claude Code):** Canlıda (dal 23:42'de main'e birleştirildi). Kullanıcı admin şifresini değiştirdi. `JWT_SECRET` henüz eklenmediyse sistem DATABASE_URL'den türetilmiş anahtarla çalışır; eklemek önerilir. Yapılanlar:
    - Oturum yalnızca imzalı `admin_token` ile geçerli; eski ayarlar girişi de token alıyor (`id: legacy-admin`).
    - Kaynak koddaki yedek admin şifresi kaldırıldı. Ayarlarda şifre yoksa yalnızca `ADMIN_INITIAL_PASSWORD` ortam değişkeni geçer.
    - JWT anahtarı artık `JWT_SECRET`'tan, yoksa `DATABASE_URL`'den türetiliyor (kaynak koddaki sabit anahtar kaldırıldı; admin, influencer ve üye oturumları için ortak: `src/lib/jwt-key.ts`).
    - Middleware her alan adında korur: `/api/admin/*` (login hariç), `/api/ai/*`, `/api/posts`, `/api/upload*`, `GET /api/orders` (müşteri bilgisi açıktaydı). `categories/authors/packages/services/guides/hotels/settings` için yalnızca yazma yöntemleri korunur, site GET ile okumaya devam eder.
    - `GET /api/settings` ziyaretçiye yalnızca `whatsappNumber` döndürür (önceden şifre özeti dahil tüm ayarlar açıktı).
    - Lokal test: çerezsiz, yalnızca `admin_session=true` ve eski anahtarla imzalanmış sahte token → 401; geçerli token → geçiyor; sitenin GET istekleri geçiyor.
  - **Birleştirmeden önce kullanıcı yapacak (sırayla):**
    1. Canlı sitede admin şifresini değiştir (Ayarlar → şifre değiştir). Eski yedek şifre depoda herkese açıktı; bu adım olmadan birleştirilirse ve DB'de admin kullanıcısı yoksa giriş yapılamaz.
    2. Vercel → Settings → Environment Variables → `JWT_SECRET` ekle (uzun rastgele bir değer, Production + Preview). Eklenmezse sistem yine çalışır (DATABASE_URL'den türetir) ama ayrı sır daha iyidir.
    3. Önizleme adresinde (Vercel → Deployments → `guvenlik-1-6`) giriş yap, Blog İçerikleri, SEO Masası ve Siparişler sayfalarını aç; çalışıyorsa Claude'a "birleştir" de.
  - Not: Birleştirince herkesin oturumu bir kez kapanır (anahtar değişti); yeniden giriş yeterli. Üye (B2C) ve influencer oturumları da bir kez kapanır.
  - Sonra yapılabilir: çıkış (logout) uç noktası yok; eski ayarlar şifresi sabit tuzlu SHA-256 (bcrypt'e geçirilmeli).

- [ ] **1.7 Vercel'de iki proje, biri build'de başarısız**
  - **Sebep bulundu (30.09):** `.com` projesinde build ara ara `next/font/google` hatasıyla düşüyordu (Schibsted Grotesk indirilemiyordu; aynı commit bir projede geçip diğerinde düşüyordu). Masa yazı tipleri artık `public/fonts/desk` altında, `seo.css`'te `@font-face` ile (d0… commit "Masa yazı tipleri projede barındırılıyor"). Kök düzendeki Inter ve Noto Serif hâlâ `next/font/google`; aynı hata onlarda görülürse aynı yöntemle yerele al. Kalan iş kullanıcıda: hangi projenin gereksiz olduğuna karar verip kaldırmak.
  - Belirti: Her push iki Vercel projesine gidiyor: `hadiumreyegidelim.com` ve `hadiumreyegidelim`. `84fd1b5`'ten sonra `hadiumreyegidelim` projesinin build'i iki kez başarısız oldu (`8d56c03`, `cb32308`); `hadiumreyegidelim.com` projesi `cb32308`'de başarılı. Lokal `npx next build` sorunsuz. Ayrıca GitHub'da her commit'te başarısız bir "Workers Builds" (Cloudflare) ve Railway kontrolü görünüyor.
  - Yapılacak (kullanıcı ile): Vercel'de hangi projenin `hadiumreyegidelim.com` ve `admin.hadiumreyegidelim.com` alan adlarına bağlı olduğunu kontrol et. Başarısız projenin build logunu (Vercel → Deployments → son deploy → Build Logs) ajana ver. Alan adı bağlı olmayan eski proje, Cloudflare Workers ve Railway bağlantıları kullanılmıyorsa kaldırılabilir; bu karar kullanıcının.
  - Bitti sayılır: Alan adının bağlı olduğu proje her push'ta `success`; gereksiz entegrasyonlar kaldırıldı ya da nedenleri yazıldı.

### Faz 2 · Teknik SEO (site geneli)

- [ ] **2.1 Canonical host** (0.2 kararına göre)
  - Sorun: 128 sayfada canonical, yönlendirme yapan adresi gösteriyor.
  - Dosyalar: `src/app/layout.tsx` (metadataBase), `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/(main)/[slug]/page.tsx`, `grep -rn "https://hadiumreyegidelim.com" src` ile bulunan her yer. Tek bir `SITE_URL` sabitinde topla (`src/lib/seo/site.ts` hazır).
  - Bitti sayılır: SEO Masası → Denetim'de `canonical-host` sorunu yok.

- [x] **2.2 Sayfa hızı** (86 sayfa 1,5 sn üstü)
  - Olası neden: Kök layout her istekte `setting.findMany` çağırıyor; şehir ve blog sayfaları dinamik.
  - Yapılacak: Kök layout ve sayfalardaki ayar sorgularını önbelleğe al (Next 16 önbellek API'si için `node_modules/next/dist/docs` oku; `revalidate` / cache bileşenleri). Şehir sayfaları için statik üretim (generateStaticParams zaten var).
  - Bitti sayılır: Denetimde `slow` sayfa sayısı 20'nin altında.
  - **Tamamlandı (30.09, Claude Code, f308349 + düzeltmeler):** Önce: bütün sayfalar `MISS`, ilk bayt 1,2–1,6 sn. Sonra: bütün sayfalar `HIT`, ilk bayt **0,16–0,33 sn**.
    - `src/lib/site-settings.ts`: `getSiteSettings()` (`unstable_cache`, etiket `site-settings`, 10 dk; önbellek hata verirse doğrudan veritabanı). Admin anahtarları (`SEO_`, `AI_VIS_`, `ANTHROPIC_`, `ADMIN_`…) ve 20 KB üstü değerler siteye taşınmaz. Kök düzen, site düzeni, footer, ana sayfa, kampanya, iletişim ve hizmetler bunu kullanır; sayfalarda `prisma.setting` sorgusu yazma.
    - `(main)/layout.tsx`: `force-dynamic` yerine `revalidate = 300`. Paketler, paket detayı, blog yazısı, rehberlik de 300. Profil sayfaları çerez okuduğu için kendiliğinden dinamik.
    - Anında tazeleme: ayar kaydeden uçlar `revalidateSiteSettings()`, paket/rehber/yazı/hizmet API'leri `revalidatePublic(kind)` (`src/lib/revalidate-public.ts`) çağırır. Yeni bir içerik API'si eklersen bunu da çağır.
    - Not: Sayfalar artık build sırasında önceden üretiliyor; build'de veritabanı erişimi gerekir (Vercel'de var).

- [x] **2.3 Birden fazla H1** (85 sayfa; şehir şablonu, blog, `/bireysel-umre`)
  - Dosyalar: `src/components/features/BireyselUmreClient.tsx`, blog yazı şablonu. Sayfada tek `<h1>`, diğerleri `<h2>`.
  - Bitti sayılır: `h1-multiple` sorunu 5 sayfanın altında.

- [x] **2.4 Uzun title** (103 sayfa)
  - Neden: Başlıklara eklenen `| Hadi Umre'ye Gidelim` son eki. Şehir sayfası title'ı: `{Şehir} Çıkışlı Bireysel Umre 2026 — Fiyat & Paketler`.
  - Yapılacak: Son eki kısalt ya da uzun başlıklarda kaldır; ana kelimeyi başta tut. 60 karakter hedefi.
  - Bitti sayılır: `title-long` sorunu 15 sayfanın altında.

- [x] **2.5 Meta açıklama uzunluğu** (14 sayfa) ve **og:image** (5 sayfa). Denetimdeki sayfa listesini kullan.
- [x] **2.6 Link almayan sayfalar** (5): `/umre-vizesi` ve 4 blog yazısı. İlgili hub sayfalarından link ver.

  - **2.3–2.6 tamamlandı (30.09, Claude Code; Antigravity'nin listesindeydi, kullanıcı "devam et" dedi).** Canlı tarama (sitemap'teki 124 sayfa): çift H1 4 → 0, uzun başlık 104 → 0, og:image eksik 6 → 0, bağlantı almayan sayfa 6 → 0. Açıklaması 120'den kısa 6 sayfa kaldı (kampanya açıklamaları admin'den geliyor: Ayarlar/Kampanya; KVKK ve kullanım şartları) — kısa açıklama hata değil.
    - `src/lib/seo/meta.ts`: `pageTitle()` (sayfa başlığındaki site adını temizler; sığarsa şablonla bir kez ekler, sığmazsa `absolute`), `metaDescription()` (158, kelime ortasında kesmez), `DEFAULT_OG_IMAGE`. Yeni sayfalarda bunları kullan.
    - Blog içeriğindeki `<h1>` render'da `<h2>` olur; ilgili yazılar 4 (önce aynı kategori, eksikse diğerleri).
    - **Hata düzeltmesi:** Sitemap yayınlanmamış yazıları listeliyor, `/blog/[slug]` taslakları herkese açıyordu (6 "yetim" sayfa aslında taslaktı). Artık yalnızca yayındakiler; taslak 404. Admin listesinde taslaklar için bağlantı yerine not.
    - **Build:** Site ve masa yazı tipleri `public/fonts` altında (`next/font/google` kaldırıldı). `next.config.ts`: build 4 işçi, sayfa başına 2 yeniden deneme; `src/lib/prisma.ts` build'de bağlantı sınırı 2. `.com` projesinin ara ara düşmesine karşı.

### Faz 3 · Programatik sayfalar ve içerik

- [x] **3.1 Şehir sayfalarını farklılaştır** (%86 aynı metin)
  - Dosyalar: `src/lib/turkey-cities.ts`, `src/app/(main)/[slug]/page.tsx`, `src/components/features/BireyselUmreClient.tsx`.
  - Yapılacak: Her şehre özgü veri ekle: kalkış havalimanı ve aktarma, tahmini uçuş süresi, o şehirden kalkan paketler (Package tablosu), şehre özgü 3 SSS. Uydurma veri ekleme; bilinmeyen alanı gösterme.
  - Bitti sayılır: SEO Masası → Programatik'te ortak metin oranı %60'ın altında.
  - **Tamamlandı (30.09, Claude Code):** Canlı ölçüm (İstanbul, Ankara, Konya, Erzurum, Antalya; SEO Masası'yla aynı 5 kelimelik Jaccard): **%86 → %49,6**.
    - `src/lib/city-geo.ts`: 81 il merkezinin yaklaşık koordinatı + bölgesi; Cidde/Medine kuş uçuşu mesafe, tahmini direkt uçuş (~800 km/sa + 30 dk), en yakın iller. Sayfada "yaklaşık" diye yazılır.
    - `src/app/(main)/[slug]/page.tsx`: şehre özel giriş, bilgi tablosu, yolculuk planı, bölge notu (7 bölge), 3 SSS + FAQPage şeması, en yakın 4 il bağlantısı. Türkçe ekler `ablative()` / `dative()` ile.
    - Uydurma `AggregateRating` (4.9/12) ve sabit fiyatlı `Product` şeması kaldırıldı → `Service`. Şablondaki ikinci H1 h2 yapıldı (2.3'ün şehir kısmı).
    - Şehir sayfalarında 81 illik footer listesi gizli (`SeoCitiesFooter`), yerine yakın iller.
    - Veri düzeltmesi: Adana/Mersin/Osmaniye → Çukurova (COV); Artvin → Rize-Artvin (RZV). Direkt sefer yalnızca IST/SAW için yazılır; diğerleri "çoğunlukla aktarmalı".
    - Kalan fikir (kullanıcı onayıyla): Package tablosuna kalkış şehri alanı eklenirse şehir sayfasında o şehirden kalkan paketler de gösterilebilir.

- [ ] **3.2 Yeni sayfa grupları.** Programatik sayfasında "Arama hacimlerini getir" ile hacmi olan kalıpları seç (aile/yaşlı umresi, ay bazlı umre). Yalnızca hacmi olan ve gerçek içerik verilebilen sayfaları aç. Kullanıcı onayı gerekir.
  - **Altyapı hazır (30.09, Claude Code), içerik Antigravity'de:** Uygulama kılavuzu `docs/SAYFA-GRUPLARI.md` (kurallar, 20 sayfanın özeti, lokal önizleme ve onay akışı). Dal: `sayfa-gruplari` (main'e kullanıcı onayıyla). Kayıt `src/content/pages/`, şablon `ContentPageView`, adresler `/umre-rehberi/<slug>` (sözlük, karşılaştırma) ve kök `/<slug>` (kişi, zaman), merkez `/umre-rehberi`, sitemap ve llms.txt otomatik, denetim `npx tsx scripts/check-content-pages.mts`.
  - **Açılan sayfalar (30.09):** `/umre-rehberi/ihram-nedir` (örnek), `/umre-rehberi/tavaf-nedir`, `/umre-rehberi/say-nedir`, `/umre-rehberi/mikat-nedir`, `/umre-rehberi/tiras-nedir`.


### Faz 4 · AI görünürlük (GEO)

- [x] **4.1 Hazırlık puanını 80'e çıkar** (şu an 54)
  - AI Görünürlük → Hazırlık sayfasındaki eksikler: soru biçimli H2'ler, görünür "Son güncelleme" + JSON-LD `dateModified`, resmî kaynak linkleri (Diyanet, Nusuk, Suudi vize portalı), blog yazılarında yazar.
  - Ana sayfa, `/bireysel-umre`, `/paketler`, `/umre-vizesi`, `/ilk-umrem`, bir şehir sayfası şablonu ve blog şablonundan başla.
  - **Tamamlandı (30.09, Claude Code):** Canlı denetim (`runReadiness`, 8 sayfa + site) **%50 → %96+**; ana sayfa, bireysel umre, paketler, vize, ilk umrem, paket detayı, şehir sayfası 100.
    - `src/components/seo/PageTrust.tsx`: `LastUpdated` (görünür tarih, `<time>`), `OfficialInfo` (diyanet.gov.tr + moh.gov.sa, konu kelimesine link — dış link kuralına uygun), `webPageJsonLd` (dateModified). `CONTENT_REVIEWED` sabiti: sayfa içeriği değişince güncelle.
    - SSS'ler sayfadaki veriden: paketler (yayındaki paketlerin süre aralığı, ortak hizmetler), paket detayı (süre, dahil hizmetler), vize (genel kabul görmüş temel bilgiler), kampanyalar (admin'deki SSS). Soru başlıkları H2.
    - **Uydurma puanlar kaldırıldı:** paket detayında "Simulated" AggregateRating (4.9, sahte yorum sayısı) ve sabit fiyat; şehir sayfalarındaki (3.1'de) de. Sitede artık `aggregateRating` yok; gerçek yorum sistemi olmadan ekleme.

- [ ] **4.2 Temel ölçüm.** 0.3–0.5 bittikten sonra bütün soruları bütün motorlarda bir kez çalıştır; sonuçları (anılma %, ses payı, kaynak payı) Durum günlüğüne yaz. Sonraki ölçümler buna göre değerlendirilir.
- [ ] **4.3 Kaynak fırsatları.** AI Görünürlük → Kaynaklar → "Kaynak fırsatları" tablosundaki ilk 10 siteyi incele: hangilerinde yer alınabilir (liste, forum yanıtı, rehber içeriği). Kod işi değil; kullanıcıyla plan.
- [ ] **4.4 İçerik boşlukları.** Rakipler sayfasındaki "İçerik boşlukları" soruları için sitede o soruyu doğrudan cevaplayan bölüm/sayfa yaz (no-ai-slop kurallarıyla, uydurma bilgi olmadan).

### Faz 5 · Otomasyon ve sağlamlık

- [x] **5.1 `ignoreBuildErrors` kapat.** *(30.09, Claude: kaldırıldı; build artık tip kontrolü yapıyor)* `tsc` artık `src/` altında temiz (acb8c74). `next.config.ts`'te `typescript.ignoreBuildErrors`'ı kaldır ki tip hataları bir daha canlıya çıkmasın. Önce yerelde `npx next build` çalıştır.
- [x] **5.2 Haftalık otomatik ölçüm.** Vercel cron ile haftada bir AI sorularını ve sıra kontrolünü çalıştıran uç nokta; harcama sınırı (ör. tek çalıştırmada en fazla $2) ve `CRON_SECRET` kontrolü. Maliyet için kullanıcı onayı gerekir.
  - **Tamamlandı (30.09, Claude Code; kullanıcı onayı: haftada en fazla 2 $):** `src/lib/weekly-measure.ts` + `/api/cron/weekly-measure` (vercel.json: `20 * * * 1`, pazartesi saatte bir). Önce takip edilen kelimelerin sırası, sonra her soru × açık motor. Fonksiyon 300 sn ile sınırlı olduğu için kuyruk (`WEEKLY_MEASURE_STATE`), çağrı başına ~230 sn, 3 eş zamanlı iş. Her işten önce tavan kontrolü (`WEEKLY_MEASURE_CAP_USD`, varsayılan 2; motor maliyeti geçmiş yanıtlardan tahmin). AI Görünürlük ana sayfasında durum paneli: tavan ayarı (0 = kapalı) ve "Şimdi çalıştır". Claude sorguları ayrıca aylık Claude bütçesine (`AI_MONTHLY_BUDGET_USD`) tabidir.
- [x] **5.3 Hata raporu diğer admin sayfalarında.** `DiagButton`'ı Excel Fiyat Motoru ve Fiyat Teklifleri sayfalarına da ekle (şu an yalnızca SEO/AI).
  - **Tamamlandı (30.09, Claude Code):** Rapor mantığı `src/lib/diag/useDiagReport.ts` hook'una taşındı (SEO Masası düğmesi de onu kullanıyor). `src/components/admin/FloatingDiagButton.tsx` (admin tasarımında, sağ alt) `src/app/(admin)/admin/fiyat-teklifleri/layout.tsx` ile teklif listesi, yeni teklif, teklif detayı, hizmet kütüphanesi ve Excel Fiyat Motoru sayfalarında. Rapor kapsamı `fiyat` (ilgili dosyalar: ExcelPricingCalculator, QuotationForm, quotations ve service-library API'leri). Excel motorunun koduna dokunulmadı. Başka bir admin bölümüne eklemek için o bölümün layout'una `<FloatingDiagButton />` koymak yeterli.
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
- [x] **6.7 Arayüz** – SEO Masası'na "07 Blog" bölümü (fırsatlar, konu yaz → üret, taslaklar + kapı puanı, önizleme, Yayınla). AI Görünürlük → Rakipler'deki içerik boşluklarına "Bu soru için yazı üret" linki. Tasarım dili SEO Masası ile aynı.
- [x] **6.8 Yayın sonrası ölçüm** – Yayınla: `published:true`, odak kelimeyi `SEO_TRACKED_KEYWORDS`'e, ana soruyu `AI_VIS_CONFIG.prompts`'a (etiket "blog") ekle, `revalidatePath`.
- [x] **6.9 İç link önerileri** – mevcut yazılar için öneri ve tek tıkla uygulama (mevcut `<a>` içine girmeden ilk geçen ifadeye link); eski yazılardaki `/rehber` kırık linklerini düzelt.
- [x] **6.10 Dinamik llms.txt** – `public/llms.txt`'i kaldırıp `src/app/llms.txt/route.ts`: mevcut başlık metni + hub'lar + son 50 yazı + paketler.
- [x] **6.11 Cron'u yeni motora bağla** – `src/app/api/cron/auto-blog` yeni motorla **taslak** üretsin; otomatik yayın yalnızca `GEO_BLOG_AUTOPUBLISH=true` ve kapı geçtiyse. Kullanıcı onayı gerekir.
- [x] **6.12 Claude incelemesi ve düzeltmeler** (Antigravity'nin 6.2–6.11 çalışması, 30.09)
  - Kritik: SSS `{question, answer}` kaydediliyordu, blog şablonu `{q, a}` okuyor → SSS ve FAQPage şeması hiç görünmezdi. Kaynaklar JSON dizi olarak kaydediliyordu (sitede `["https://…"]` görünürdü). Artık `{q,a}` ve "Başlık — URL" satırları.
  - Kritik: `research.ts` modelin yazdığı her URL'yi "gerçek" sayıyor, doğrulanamayan bilgiyi ilk kaynağa **yanlış atfediyordu**. Artık yalnızca `web_search_tool_result` bloklarında ve alıntılarda görülen URL'ler geçerli; doğrulanamayan bilgi atılıyor.
  - Kritik: `opportunities.ts` yanlış anahtarı (`AI_VIS_RUNS`; doğrusu `AI_VIS_CELLS`) ve yanlış veri biçimini (SEO kelimeleri nesne, düz metin değil) okuyordu, "umre" gibi tek kelimeler neredeyse her konuyu eliyordu → kuyruk boş, cron hep sabit konuya düşüyordu. Store yardımcılarıyla ve kelime benzerliğiyle yeniden yazıldı.
  - Kritik: `fixRehberLinks` `/rehber/{slug}` rehber profil linklerini (çalışan sayfalar) `/blog/…`'a çevirip bozacaktı. Artık yalnızca kırık `/rehber` → `/rehberlik`.
  - `write.ts` artık structured outputs (JSON şeması) kullanıyor, düzeltme notlarını ayrı alıyor, slug Türkçe karakterleri doğru çeviriyor, keywords dizisi normalleştiriliyor.
  - Slug benzersizleştirme sayım yerine gerçek kontrol (çakışmada kayıt çöküyordu). 300 sn sınırı için ikinci yazım yalnızca süre kalırsa; ikinci deneme daha kötüyse ilki tutuluyor.
  - Her üretim "Yapay Zeka (AI)" sayfasının okuduğu `AILog`'a yazılıyor; cron atladığında nedeni de kaydediliyor. 07 Blog'a "Otomatik yazı" paneli (ayarlar, sıradaki konu, son çalıştırmalar, Şimdi yaz).
  - `/api/admin/trigger-ai` yetkisizdi ve eski (araştırmasız, doğrudan yayınlayan) boru hattını çalıştırıyordu → yetki eklendi, yeni motora bağlandı. `src/lib/blog-pipeline.ts` artık hiçbir yerden çağrılmıyor.
  - Kalite kapısı: soru başlığı tespitinde Türkçe `\b` hatası (ç/ş/ı), "cevap önce" paragraf kontrolü, izin verilmeyen etiket kontrolü, dış link URL normalleştirmesi. Yayınlama tek fonksiyonda (`src/lib/geo-blog/publish.ts`): 50 kelime / 60 soru sınırlarına uyuyor, `/llms.txt`'i yeniliyor.
- [x] **6.13 Blog tek yerde: İçerik Stüdyosu** *(30.09, Claude)*
  - Neden: Blog iki üç yerde duruyordu (İçerik Stüdyosu, SEO Masası 07 Blog, Yapay Zeka sayfası); kullanıcı tek yer istedi.
  - Yapılan: Blog motoru (`src/components/admin/content/BlogEngine.tsx`) İçerik Stüdyosu'nun üstünde. Üretilen taslak doğrudan düzenleyicide açılır; listede taslaklara "Kalite" puanı ve "Yayınla". İçerik Stüdyosu'ndan, zamanlanmış yayından ve motordan yayına geçen her yazı ölçüme bağlanır (`connectMeasurement`). Eski "Claude AI Asistanı", `/api/ai/generate-blog`, `src/lib/blog-pipeline.ts` silindi; `/admin/seo/blog` ve `/admin/ai-logs` yönlendirme.
- [x] **6.14 Claude bütçesi** *(30.09, Claude)*
  - Neden: Anthropic'teki 40 $'ın kontrolsüz harcanmaması.
  - Yapılan: `src/lib/ai-budget.ts`; blog motoru, AI Görünürlük'ün Claude motoru ve editördeki "AI ile düzenle" çağrıdan önce sınırı kontrol eder, sonra tahmini maliyeti yazar. Panelde harcama ve sınır ayarı.

---

### Faz 7 · Ana sayfa yenileme (başladı: 30.09, Claude Code)

**Nasıl çalışılır:** Bu büyük bir arayüz değişikliği. `main`'e doğrudan gönderilmez. İş `anasayfa` dalında yapılır; Vercel bu dal için ayrı bir önizleme adresi üretir (Vercel → Deployments → `anasayfa`). Kullanıcı önizlemeyi beğenip "canlıya al" demeden birleştirme yok. Dal yoksa `git checkout -b anasayfa origin/main` ile aç; varsa `git checkout anasayfa && git pull`.

**Dosya:** `src/app/(main)/page.tsx` (tek dosya, sunucu bileşeni). Metinlerin çoğu admin'den (Ayarlar tablosu) geliyor: `HERO_TITLE`, `HERO_DESC`, `HERO_TAGLINE`, `HOME_CTA`, `WHATSAPP_CTA`, `HOME_TOURS_*`, `HOME_STEPS_*`, `HOME_BLOG_*`, `HOME_FAQ_*` ve kampanya ayarları (`src/lib/eylul-campaign.ts`). **Bu ayar anahtarlarını silme ya da yeniden adlandırma**; kullanıcı admin'den düzenliyor. Görünümü değiştir, veri kaynağını koru.

**Değişmez kurallar (kullanıcı kararları):**
- Renk: beyaz zemin, lacivert (`primary` #003781, koyu #001944) ana renk. Kırmızı yalnızca hata için. Kampanya bantlarındaki altın (#c9a96e) mevcut marka detayı, kalabilir; yeni yerlere yayma.
- "TÜRSAB" ve "diyanetsiz" kelimeleri hiçbir yerde geçmez (metin, meta, schema, alt yazı).
- Sattığımız hizmetler (vize, otel, uçuş, transfer, tren, paket, rehberlik) için dış link yok; kendi sayfalarımıza link.
- Rakip firma adı yok.
- Doğrulanmamış iddia ekleme. Mevcut "Nusuk ve vize garantisi", "24 saat içinde e-vize", "%30'a varan tasarruf" ifadeleri **kullanıcı onayı bekliyor**: silme, ama yeni yerlere de çoğaltma.
- Yazım: no-ai-slop kuralları (bkz. Faz 6); "misafirlerimiz", "son derece", "eşsiz" gibi kalıplar yok.
- Animasyon: `data-reveal` kullanılabilir (MotionInit rota değişiminde yeniden tarıyor, b6c6f09). Hero'daki ilk ekran öğelerine `data-reveal` koyma (ilk boyamada görünmez kalır, LCP'yi bozar).

**Adımlar (sırayla; her biri ayrı commit, mesaj başında `[7.x]`):**

- [x] **7.1 Hero.** H1 şu an ekranda "SİZE ÖZEL MANEVİ ROTA" gösteriyor, "Bireysel Umre" yalnızca `sr-only` içinde gizli. Yapılacak: H1 içinde üstte görünür küçük satır "Bireysel Umre 2026", altında büyük `HERO_TITLE`. Yükseklik `min-h-[82vh]`; butonlar: birincil "Planlamaya başla" (`HOME_CTA`, /bireysel-umre), ikincil WhatsApp. Hero altına 3 kısa bilgi satırı (ör. "Tarihi siz seçersiniz · Otel ve uçuş dahil planlama · Türkçe rehberlik"), iddia içermeyen. Görsel `priority` kalsın.
  - Bitti sayılır: H1 metni ekranda "Bireysel Umre" içeriyor; mobilde (375px) başlık 3 satırı geçmiyor; ilk ekranda görünmez öğe yok.
- [x] **7.2 Güven şeridi.** 5 ikonlu satır sade bir bantta; ikon + kısa etiket + tek satır açıklama. Metinler aynı (onay bekleyen iddialar dahil, değiştirme).
- [x] **7.3 Paketler.** "En Çok Tercih Edilen" rozeti en fazla **bir** pakette (ilk `isPopular` olanda) görünsün; şu an üçünde de var. Kartta fiyat göster: `price` + `currency` → "1.250 $'dan başlayan" (`toLocaleString('tr-TR')`). Kart başlığı `h3`.
- [x] **7.4 Nasıl çalışır (3 adım).** Aynı içerik, daha sıkı düzen; tırnaklı slogan kalkabilir.
- [x] **7.5 Blog bölümü.** Yazar olarak `post.author` ("ADMİN") yerine `authorModel.name` (Author ilişkisi; `include: { authorModel: { select: { name: true } } }`), yoksa yazar satırı gösterilmez. Tarih biçimi "12 Eylül 2026".
- [x] **7.6 SSS.** 4 soruyu `<details>/<summary>` ile açılır yap. **FAQPage JSON-LD'yi `src/app/layout.tsx`'ten kaldır** (şu an admin dahil her sayfada basılıyor, sayfadaki SSS ile de uyuşmuyor) ve ana sayfada görünen 4 soruyla birebir aynı metinle `page.tsx` içine taşı.
- [x] **7.7 Hız.** `page.tsx` ayarları ikinci kez `prisma.setting.findMany()` ile çekiyor; üç sorguyu `Promise.all` ile paralel çalıştır (2.2 ile birlikte kök layout önbelleği yapılınca oradaki yardımcıyı kullan).
- [x] **7.8 Kontrol ve önizleme.** *(30.09: kullanıcı onayladı, main'e birleştirildi.)* *(Durum 30.09: 7.1–7.7 `anasayfa` dalında, commit ab6c324 + c01e234; build ve tipler temiz. Önizleme adresi: `https://hadiumreyegidelimcom-git-anasayfa-yatos-projects-2b9810f4.vercel.app/` — Vercel girişi ister, kullanıcı kendi tarayıcısında açar. Ajan tarayıcısı Vercel'e giriş yapamadığı için görsel kontrol kullanıcının geri bildirimiyle yapılacak. Kullanıcı düzeltme isterse aynı dalda devam et.)* `npx tsc --noEmit`, `npm run build`. Dalı gönder, önizleme adresinde masaüstü + mobil ekran görüntüsü al, kullanıcıya göster. Onaydan sonra `main`'e birleştir ve Durum günlüğüne yaz.

**Kullanıcı geri bildirimi (30.09) ve ikinci tur:** İlk hali "yeterince etkileşimli değil" bulundu. İstekler: daha etkileşimli ve göze hitap eden, gerçek WhatsApp logosu, "BOUTİQUE UMRE EXPERİENCE" etiketi ve "Sıfır bürokrasi"li güven şeridi **olmayacak**. Yapılanlar:
- Hero iki sütun: solda başlık (H1 üst satırı sabit "Bireysel Umre 2026"; `HERO_TAGLINE` artık gösterilmiyor), sağda **planlama kartı** `src/components/home/HeroPlanner.tsx` (kalkış şehri, önümüzdeki 6 ay, 7/10/15/21 gün, kişi sayısı → seçimlerle dolu WhatsApp mesajı; "Otel ve uçuşu kendim seçeyim" → /bireysel-umre). Seçili kutucuk `motion` ile kayar.
- Güven şeridi (TRUST_ITEMS) kaldırıldı.
- Yeni bölüm **"Umre nasıl yapılır?"** `src/components/home/UmrahSteps.tsx`: İhram, Tavaf, Sa'y, Tıraş; tıklanabilir sekmeler, 6 sn'de bir kendiliğinden ilerler (kullanıcı dokununca durur), /ilk-umrem'e link.
- `src/components/home/WhatsAppIcon.tsx`: SVG logo. Yeni bölümlerde Material Symbols yerine satır içi SVG kullanılıyor (yazı tipi yüklenmezse "task_alt" gibi adlar görünüyordu).
- Mobil taşma düzeltildi: ızgaralarda `grid-cols-[minmax(0,1fr)]` ve `min-w-0` şart (kutucuk satırları sütunu genişletiyordu).
- Lokal önizleme: `hadi-seo-dev` sunucusu (port 3002). Veritabanı bağlantısı yoksa sayfa varsayılan metinlerle ve boş paket/blog listesiyle açılır.

**Üçüncü tur (30.09, kullanıcı: "her şey çok büyük, kullanıcı deneyimine katkısı yok; Airbnb/Skyscanner gibi olsun, mbdtravel.com/tr ve guideofdubai.com örnek"):**
- Ana sayfa baştan sıkı düzende yazıldı (`src/app/(main)/page.tsx`): kısa hero, **Airbnb tarzı arama çubuğu** `src/components/home/UmrePlanner.tsx`, altında hızlı erişim sekmeleri (paketler, bireysel umre, vize, otel, transfer ve tren, rehberlik, ilk umrem, hanım umresi), kompakt Eylül bandı, paket kartları (mobilde yatay kaydırma), 3 adımlık "nasıl çalışır" şeridi, "Umre nasıl yapılır?" (UmrahSteps, küçültüldü), iki kampanya kartı yan yana, kompakt blog ve SSS. Büyük "bento" bölümü ve HeroPlanner kaldırıldı.
- UmrePlanner, müşteriye WhatsApp'ta sorulan 7 soruyu toplar: kişi sayısı (yetişkin, 65+, çocuk 2–12, bebek 0–2), tarih aralığı (kendi aralık takvimi + "tarihlerim esnek"), yaş durumu, otel tercihi (Harem'e yürüme mesafesi / ekonomik / önerin), transfer, uzman hoca, vize; ayrıca Mekke ve Medine gece sayısı ve program sırası. Tarih aralığı seçilince geceler Mekke/Medine'ye ~5:4 dağıtılır. "Teklif al" numaralı (1️⃣–7️⃣) WhatsApp mesajı açar. Masaüstünde paneller çubuğun altında kart olarak, mobilde satırın altında açılır.
- Dikkat: `src/app/layout.tsx` bütün `.rounded-full/.rounded-xl/...` sınıflarını `BUTTON_RADIUS` ayarına zorluyor; tam hap şekli için `rounded-[999px]` kullan. `(main)` düzeni bölümleri içerik genişliğine daraltıyor; tam genişlik bölümlere `w-full` ver.
- Lokal dev sunucusu dosya değişikliklerini bazen kaçırıyor: `curl localhost:3002 | grep` ile kontrol et, gerekirse sunucuyu yeniden başlat.

**Arka plan videosu (a21d44a):** Admin → Ayarlar → Anasayfa → "Arka plan videosu" alanından MP4/WebM yüklenir (`/api/upload-sign` ile doğrudan Supabase'e; Vercel 4,5 MB sınırı yok, en fazla 50 MB). Ayar anahtarı `HOME_HERO_VIDEO`; boşsa `home_banner_image` görseli gösterilir. Video sessiz, döngülü, `playsInline` (Safari/iOS için şart); "hareketi azalt" açık cihazlarda gizlenir. Önerilen: 10–20 sn, ≤20 MB, 1080p H.264.
**Safari notu:** Lokal dev'de Safari eski CSS'i önbellekten gösterebilir (yeni sınıflar yok gibi görünür); Cmd+Option+R ile yenile. Canlıda dosya adları hash'li olduğu için sorun olmaz.

**Sonra (kullanıcı onayıyla):** Üst menü etiketleri kısaltılabilir ("Rehberler & Keşifler Portalı" → "Keşifler", "Manevi Rehberlik Blogu" → "Blog"); menü `src/components/layout/` altında, tüm siteyi etkiler.

## 4. Durum günlüğü

En yeni en üstte. Her tamamlanan adım için bir satır.

| Tarih | Ajan | Adım | Commit | Not |
|---|---|---|---|---|
| 2026-09-30 | Antigravity | 3.2 (Sözlük) | sayfa-gruplari dalı | 4 Sözlük rehber sayfası eklendi: tavaf-nedir, say-nedir, mikat-nedir, tiras-nedir (0 hata, tsc temiz) |

| 2026-09-30 | Claude Code | 3.2 altyapı | sayfa-gruplari dalı | Rehber sayfaları altyapısı + örnek ihram-nedir; kılavuz docs/SAYFA-GRUPLARI.md |
| 2026-09-30 | Claude Code | 5.3 ✓ | FloatingDiagButton | Fiyat teklifleri ve Excel Fiyat Motoru'nda hata raporu düğmesi |
| 2026-09-30 | Claude Code | blog satış + devir | BlogBrandCta, ANTIGRAVITY-DEVIR.md | Blog şablonunda marka kutuları, resmî kaynakça, dış link kuralı yayında; motor marka/satış kuralları; ilk yayında tarih = şimdi. Devir belgesi: docs/ANTIGRAVITY-DEVIR.md |
| 2026-09-30 | Claude Code | 4.1 ✓ | PageTrust | Hazırlık %50 → %96+; sahte paket puanı kaldırıldı |
| 2026-09-30 | Claude Code | 5.2 ✓ | weekly-measure | Haftalık otomatik ölçüm, 2 $ tavan, pazartesi |
| 2026-09-30 | Claude Code | 2.3–2.6 ✓ | seo/meta.ts | H1 4→0, uzun başlık 104→0, og:image 6→0, yetim 6→0; taslaklar sitemap'ten ve siteden çıkarıldı; yazı tipleri yerelde; build sınırları |
| 2026-09-30 | Claude Code | 3.1 ✓ | şehir sayfaları | Benzerlik %86 → %49,6; uydurma puan kaldırıldı; havalimanı verisi düzeltildi |
| 2026-09-30 | Claude Code | 2.2 ✓ | f308349 | Sayfalar 1,2–1,6 sn → 0,16–0,33 sn (ISR + ayar önbelleği) |
| 2026-09-30 | Claude Code | 1.7 (sebep) | masa yazı tipleri | .com build'i Google Fonts indirmesinde düşüyordu; yazı tipleri yerelde |
| 2026-09-30 | Claude Code | ayar ezilmesi | admin ayarları | Kaydet, yükleme başarısız olunca bütün ayarları varsayılana çeviriyordu (ana sayfa başlığı ve Instagram linki sıfırlandı). GET küçültüldü, yalnızca değişen alanlar yazılıyor |
| 2026-09-30 | Claude Code | Faz 7 ✓ canlı | anasayfa → main | Yeni ana sayfa: Airbnb tarzı umre planlayıcı (7 müşteri sorusu, WhatsApp teklif), hızlı erişim, umre adımları, arka plan videosu desteği |
| 2026-09-30 | Claude Code | yasaklı kelimeler | (bu commit) | "TÜRSAB" ve "diyanetsiz" siteden kaldırıldı; blog motoru kalite kapısı, konu seçimi ve eski yazı taraması bu kelimeleri engelliyor. Faz 7 (ana sayfa) planı yazıldı |
| 2026-09-30 | Claude Code | görünmez bölüm hatası | b6c6f09 | Site içi gezinmede data-reveal bölümleri görünmez kalıyordu; düzeltildi, headless Chrome ile doğrulandı (21/21) |
| 2026-09-30 | Claude Code | dış link kuralı | (bu commit) | Dış link yalnızca Diyanet/Nusuk/Suudi resmî; konu kelimesine link; rakip adı ve sitesi yasak; eski yazılar için temizleme düğmesi |
| 2026-09-30 | Claude Code | çıkış | a4e37ec, 75b8d4c | Admin paneline Çıkış yap düğmesi; geçersiz oturumda da çalışır |
| 2026-09-30 | Claude Code | 1.6 ✓ canlı | e854365 (main'e 5c5d13c ile birleşti) | Admin oturumu imzalı token'a bağlandı; sipariş listesi ve ayarlar açığı kapatıldı. Canlıda doğrulandı: /api/orders 401, /api/settings yalnızca whatsappNumber |
| 2026-09-30 | Claude Code | 6.13, 6.14 | f1a3bd4 | Blog İçerik Stüdyosu'nda tek yerde; Claude aylık bütçe (15 $) ve harcama takibi; yol haritası açıklayıcı hale getirildi |
| 2026-09-30 | Claude Code | 5.1 | b737aef | ignoreBuildErrors kaldırıldı |
| 2026-09-30 | Claude Code | 6.12 | f856d5a | Faz 6 incelendi: 4 kritik hata ve 10+ iyileştirme düzeltildi; otomatik yazı paneli; görev dağılımı yazıldı |
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
