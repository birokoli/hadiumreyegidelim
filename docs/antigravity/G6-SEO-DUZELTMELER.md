# G6 · Dış SEO denetimi düzeltmeleri (2 Ekim, yaklaşık 2 saatlik iş)

Kaynak: `docs/SIRALAMA-YOL-HARITASI.md` → **Faz I** (I1–I4, I7, I10). Claude bu sürede çevrimdışı; döndüğünde her maddeyi aşağıdaki kanıtlara göre kontrol edecek, hatalıysa geri alacak.

## 0. Kurallar (GOREVLER.md'dekilerin hepsi geçerli, özellikle şunlar)

1. **Commit ve push YOK.** Değişiklikler çalışma klasöründe kalır. Canlıya yalnızca Claude alır.
2. **Yalnızca her maddenin "Dosyalar" satırındaki dosyalara** dokun. Başka dosya gerekiyorsa dur, TESLIM.md'ye yaz, sonraki maddeye geç.
3. Her madde bitince `docs/antigravity/TESLIM.md` dosyasının **en üstüne** kayıt: madde kodu, dosyalar, kabul ölçütlerinin **komut + çıktısı**. "Tamamlandı" yazmak kanıt değildir.
4. Next.js 16: `params` ve `searchParams` Promise'tir. Metadata API'sinde emin olmadığın bir şey varsa önce `node_modules/next/dist/docs/` içinde ara; tahminle yazma.
5. Her maddeden sonra: `npx tsc --noEmit` (çıktı boş olmalı) ve değiştirdiğin dosyalara `npx eslint <dosyalar>` (0 hata).
6. Yerel sunucu `http://localhost:3002` çalışıyor (yerel veritabanıyla). Kontroller `curl -s http://localhost:3002/...` ile yapılır.
7. Sıra: **G6-1 → … → G6-15** (numara sırası). Önce teknik maddeler (1–5), sonra belge/ölçüm (6–8, 13–15), en son sayfa dönüşümleri (9–12). Zaman kalmazsa kalan maddeyi TESLIM.md'ye "yapılmadı" diye yaz; yarım bırakılan değişikliği geri al (`git checkout -- <dosya>`).

Dokunulmayacaklar: `src/middleware.ts`, `src/app/layout.tsx`, `src/lib/catalog/**`, `src/lib/pricing/**`, `src/components/planner/**`, `src/components/ui/kit/**`, `prisma/**`, admin sayfaları, `.env*`.

---

## G6-1 · Ödeme sayfaları dizine girmesin (Faz I1)

**Dosyalar:** `src/app/(main)/paketler/[slug]/checkout/page.tsx`

Sorun: 7 checkout sayfası `index, follow` ve ana sayfa kanoniği taşıyor (kök layout'tan miras).

Yapılacak: dosyaya statik `metadata` ekle:
- `robots: { index: false, follow: false }`
- kanonik ana sayfayı göstermesin. Next 16'da miras kanoniği kaldırmanın doğru yolunu belgeden doğrula (`alternates: { canonical: null }` tipten geçiyorsa onu kullan).

Kabul (komut ve çıktıyı TESLIM'e yaz):
```
curl -s http://localhost:3002/paketler/<yerelde var olan bir paket slug'ı>/checkout | grep -oE '<meta name="robots"[^>]*>|<link rel="canonical"[^>]*>'
```
Çıktıda yalnızca `noindex, nofollow` robots etiketi olmalı; `index, follow` ve `canonical href="http://localhost:3002"` / ana sayfa kanoniği **olmamalı**. Sayfa yine açılmalı (HTTP 200, ödeme formu görünür).

## G6-2 · Profil sayfaları dizine girmesin

**Dosyalar:** yeni `src/app/(main)/profil/layout.tsx`

`profil/giris/page.tsx` bir istemci bileşeni (`"use client"`), metadata veremez. Bu yüzden `profil/` klasörüne yalnızca çocuklarını döndüren bir sunucu layout'u ekle: `export const metadata = { robots: { index: false, follow: false }, alternates: { canonical: null } }` (G6-1'de doğruladığın biçimle) ve `export default function ProfilLayout({ children }) { return children; }`.

Kabul: `curl -s http://localhost:3002/profil/giris | grep -oE '<meta name="robots"[^>]*>|<link rel="canonical"[^>]*>'` → yalnızca noindex. Giriş formu çalışır. `robots.txt`'e dokunma.

## G6-3 · Blog yazılarındaki kırık iç bağlantılar (Faz I3)

**Dosyalar:** yeni `src/lib/geo-blog/internal-links.ts`, `src/app/(main)/blog/[slug]/page.tsx` (**yalnızca 156. satır**, başka satıra dokunma), `next.config.ts` (**yalnızca `redirects()` dizisine satır ekleme**)

Bağlantılar veritabanındaki yazı HTML'inde; veritabanını değiştirme. Sayfa gösterilirken düzelt:

1. `internal-links.ts` içinde `export function fixInternalLinks(html: string): string`:
   - `href="/blog/mescid-i-haram-ziyareti"` → `/blog/mescidi-haram-ziyaret-rehberi`
   - `href="/blog/nusuk-uygulamasi-kullanimi"` → `/blog/nusuk-uygulamasi-nasil-kullanilir`
   - `href="/otel-rezervasyonu"` → `/bireysel-umre`
   - `href="/tren-bileti-al"` → `/bireysel-umre`
   - `/blog/medine-gezilecek-yerler` ve `/blog/mekke-hediyelik-esya-rehberi`: karşılığı yok → `<a ...>metin</a>` yerine yalnızca `metin` kalsın (bağlantı kaldırılır, yazı kalır).
   - Tam adresli biçimler de yakalansın: `https://hadiumreyegidelim.com/...` ve `https://www.hadiumreyegidelim.com/...`. Tek ve çift tırnak.
   - Eşleştirme tablosu dosyanın başında tek bir sabit dizi olsun (sonra eklemek kolay olsun).
2. `blog/[slug]/page.tsx` 156. satırda `stripDisallowedLinks(post.content).html` ifadesini `fixInternalLinks(stripDisallowedLinks(post.content).html)` yap, import ekle.
3. `next.config.ts` redirects'e eski 4 adres için kalıcı yönlendirme (mevcut satırların biçimiyle, `permanent: true`). Karşılığı olmayan iki adres için yönlendirme **ekleme**.

Kabul:
- Küçük bir doğrulama betiği ya da `node -e` ile `fixInternalLinks`'e 6 örnek ver, çıktıyı TESLIM'e yapıştır (6'sı da beklenen sonuç).
- `curl -sI http://localhost:3002/otel-rezervasyonu | head -3` → 308 ve `location: /bireysel-umre`. Diğer 3 yönlendirme için de aynı.
- `curl -sI http://localhost:3002/blog/medine-gezilecek-yerler | head -1` → 404 kalır.

## G6-4 · Sitemap tarihleri her istekte değişmesin (Faz I4)

**Dosyalar:** `src/app/sitemap.ts`

Sorun: sabit sayfalar ve 81 il sayfası `lastModified: new Date()` kullanıyor; her istekte "şimdi güncellendi" görünüyor.

Yapılacak:
- Dosyanın başına sabitler: `const STATIC_REVIEWED = "2026-10-02";` (ana sayfa, hakkımızda, kvkk, gizlilik, kullanım şartları, bireysel-umre, paketler listesi, rehberlik, umre-vizesi, umre-vizesi/basvuru, blog listesi) ve `const CITY_TEMPLATE_REVIEWED = "2026-10-02";` (il sayfaları). Yanına yorum: "sayfa içeriği gerçekten değişince elle güncellenir".
- Blog listesi için daha iyisi: en son yayınlanan yazının `updatedAt` değeri (zaten çekilen veriden).
- `new Date()` dosyada **hiç** kalmasın.
- `/iletisim` ve `/hizmetler` girişlerini ekle (`STATIC_REVIEWED`, `monthly`, 0.6). Checkout, profil, kit **eklenmez**.

Kabul:
```
curl -s http://localhost:3002/sitemap.xml > /tmp/s1.xml; sleep 2; curl -s http://localhost:3002/sitemap.xml > /tmp/s2.xml; diff /tmp/s1.xml /tmp/s2.xml && echo AYNI
grep -c "new Date()" src/app/sitemap.ts   # 0
grep -oE "/(iletisim|hizmetler)</loc>" /tmp/s1.xml
```

## G6-5 · Yazar şemasında boşluk (Faz I7, kod kısmı)

**Dosyalar:** `src/app/(main)/blog/[slug]/page.tsx` (**yalnızca 208. satır ve hemen çevresindeki author nesnesi**)

`name: post.authorModel?.name || post.author` → iki değer de `.trim()` edilsin; `jobTitle` da `.trim()`. Başka bir şey değiştirme. (Unvanın büyük harf hatası veride; onu kullanıcı admin'den düzeltecek.)

Kabul: `grep -n "trim()" "src/app/(main)/blog/[slug]/page.tsx"` çıktısı ve bir yazının JSON-LD'sinde `"name":"Yasin` (başta boşluk yok) — yerel yazı slug'ıyla curl.

## G6-6 · Kanonik denetimi (Faz I2 hazırlığı, kod değişikliği YOK)

**Dosyalar:** yeni `docs/antigravity/KANONIK-ENVANTER.md`

Kök layout `alternates.canonical: SITE_URL` veriyor; kendi kanoniği olmayan her sayfa ana sayfayı kanonik gösteriyor. Claude kökten kaldırmadan önce hangi sayfaların etkileneceğini bilmek istiyor.

- `src/app/(main)` altındaki **her** `page.tsx` için tablo: yol (URL), dosya, kendi `alternates.canonical`'ı var mı (satır numarasıyla), `generateMetadata` mı statik `metadata` mı.
- Her satırı curl ile doğrula: `curl -s http://localhost:3002<yol> | grep -o '<link rel="canonical"[^>]*>'` çıktısı tabloya.
- En sonda: "kendi kanoniği olmayan ve dizinde kalması gereken sayfalar" listesi.

Dinamik yollar için yerelde var olan birer örnek slug kullan. Koda dokunma.

## G6-7 · Paylaşım görselleri listesi (Faz I10, yalnızca belge)

**Dosyalar:** yeni `docs/taslaklar/og-gorselleri.md`

122 sayfa aynı Unsplash `og:image`'ı kullanıyor. Hazırla:
- Hangi sayfa grupları (il sayfaları, ay sayfaları, kampanyalar, rehber sayfaları, blog yazıları) hangi `og:image`'ı kullanıyor: `curl -s <url> | grep -o 'property="og:image" content="[^"]*"'` ile her gruptan 2 örnek.
- Her grup için öneri: `public/images/` içinde **zaten var olan** hangi görsel uygun (`ls public/images`), yoksa "görsel gerekli: konu, 1200×630". Yeni görsel indirme veya üretme yok.

---

# İkinci bölüm (G6-8 … G6-15)

## G6-8 · Geçmiş Eylül kampanyası sayfasında "tamamlandı" notu (Faz I8)

**Dosyalar:** `src/app/(main)/eylul-umresi/page.tsx`

Ana sayfa kartı tarihe bağlandı (`homeVisibleUntil`, admin'den). Sayfanın kendisi hâlâ "Yer ayırt" diyor. Yapılacak:
- `isHomeCardLive` ve `istanbulToday` `@/lib/eylul-campaign`'de var (dosyayı **okuma amaçlı** aç, değiştirme).
- Kampanyanın `homeVisibleUntil` değeri doluysa ve bugün ondan sonraysa, `AdsCampaignLanding`'den **önce** bir bilgi bandı göster: kitten `Container` + `Panel tone="muted"`; metin: "Bu program tamamlandı. Önümüzdeki tarihler için bireysel umrenizi planlayabilir ya da bize yazabilirsiniz." + `ButtonLink href="/bireysel-umre"` "Umremi planla" + `ButtonLink tone="secondary" href="/ekim-umresi"` "Ekim umresi".
- Bant sayfanın üst menüsünün altında kalmalı (PageHero gibi üst boşluk `pt-28 md:pt-32`).
- Tarih geçmemişse hiçbir şey değişmez. Sayfa noindex **yapılmaz**.

Kabul: `curl -s http://localhost:3002/eylul-umresi | grep -c "Bu program tamamlandı"` → 1 (yerel veride son gün geçmiş). Ekran görüntüsü 1440 ve 390: `docs/antigravity/goruntuler/G6-8-*.png`.

## G6-9 · /iletisim kit dönüşümü

**Dosyalar:** `src/app/(main)/iletisim/page.tsx`, `docs/antigravity/goruntuler/G6-9-*`

**Örnek al:** Claude'un yazdığı `src/app/(main)/hizmetler/page.tsx` ve `src/components/blog/BlogList.tsx`. Aynı bileşenler, aynı boşluklar, aynı metin tonu. Antigravity'nin G3/G4'ü bu yüzden reddedildi: sayfaya özel gölge/renk, süslü metin ("ayrıcalıklı", "VIP deneyim", "ilim ve irfan"), ham tür adları. Bunları tekrarlama.

1. **Önce** sayfanın bütün işlevlerini satır numarasıyla listele (form, `fetch(`, telefon/WhatsApp/e-posta bağlantıları, harita, şema, metadata). Dönüşümden sonra hepsi aynen çalışmalı.
2. Üst bölüm `PageHero` (sayfa yolu, kısa üst etiket "İletişim", tek H1, kısa giriş). Form varsa `aside`'a.
3. İletişim kanalları `Panel` içinde; WhatsApp `ButtonLink tone="whatsapp"`.
4. Metin: sade, doğrulanabilir. Çalışma saati gibi bilinmeyen bilgi uydurma.
5. Ham `<img>` 0, `npx tsc --noEmit` temiz, 390 px'te yatay taşma 0 (`document.documentElement.scrollWidth - innerWidth`).
6. Önce/sonra ekran görüntüsü 1440 + 390.

## G6-10 · /hakkimizda kit dönüşümü

**Dosyalar:** `src/app/(main)/hakkimizda/page.tsx`, `docs/antigravity/goruntuler/G6-10-*`

G6-9 ile aynı yöntem ve ölçütler. Ek olarak:
- Mevcut `Organization`/`AboutPage` şeması varsa aynen kalır.
- Sayfaya küçük olmayan, normal bir paragraf olarak şu bilgiyi ekle (kullanıcı onaylı metin): "Hadi Umreye Gidelim, MBD Tourism L.L.C. iştirakidir. MBD Tourism L.L.C., Dubai Ekonomi ve Turizm Departmanı (DTCM) tarafından lisanslı seyahat acentesidir. DTCM Lisans No: 1203162."
- Marka adı her yerde "Hadi Umreye Gidelim" (kesme işaretsiz).

## G6-11 · /umre-vizesi kit dönüşümü (dikkat: sıralama alan sayfa)

**Dosyalar:** `src/app/(main)/umre-vizesi/page.tsx`, `docs/antigravity/goruntuler/G6-11-*`

G6-9 yöntemi. Ek kurallar:
- `metadata` (title, description, canonical) **harfi harfine aynı** kalır.
- SSS ve şeması: `Faq` + `faqJsonLd` aynı dizi; soru-cevap metinleri **değişmez**.
- `/umre-vizesi/basvuru` bağlantıları ve tüm düğmeler aynen çalışır.
- Gerçek bilgiler yalnızca: kişi başı 140 USD, belgeler tamamsa 2 iş saati. Başka rakam yazma.
- Önce/sonra `curl -s ... | grep -c "application/ld+json"` sayısı aynı olmalı; ikisini de yaz.

## G6-12 · /rehberlik kit dönüşümü

**Dosyalar:** `src/app/(main)/rehberlik/page.tsx`, `docs/antigravity/goruntuler/G6-12-*`

G6-9 yöntemi. H14'te kısaltılan başlık ("Umre Rehberliği: Mekke ve Medine") aynen kalır.

## G6-13 · Hız ölçümü (canlı, yalnızca belge)

**Dosyalar:** yeni `docs/olcum/lighthouse-2026-10-02.md`

Canlı sitede **mobil** Lighthouse (`npx lighthouse@12 <url> --only-categories=performance,accessibility,seo --form-factor=mobile --screenEmulation.mobile --output=json --output-path=...` ; JSON'lar `docs/olcum/json/` altına, git'e eklenmeyecekse TESLIM'de belirt). Sayfalar: `/`, `/bireysel-umre`, `/umre-vizesi`, `/umre-vizesi/basvuru`, `/paketler`, `/hizmetler`, `/blog`, `/blog/bireysel-umre-vizesi-nasil-alinir`, `/denizli-cikisli-bireysel-umre`, `/eylul-umresi`.

Tablo: sayfa, performans, erişilebilirlik, SEO, LCP, CLS, TBT, en büyük 3 öneri (Lighthouse'un kendi başlığıyla). Her sayfa 2 kez ölçülür, düşük olan değil **ikisi de** yazılır. Yorum ekleme; yalnızca veri.

## G6-14 · Şehir sayfaları envanteri (Faz I11 için veri, yalnızca belge)

**Dosyalar:** yeni `docs/taslaklar/sehir-sayfalari.md`, isteğe bağlı betik `scripts/local/sehir-benzerlik.mts` (yalnızca okur)

Bilinen sorun: il sayfaları (`src/app/(main)/[slug]/page.tsx`) `BireyselUmreClient` ile **uçuş arıyor**, `/api/flights` canlıda 503 dönüyor (uçuş API'si kaldırıldı, uçuş satmıyoruz). Bunu **düzeltme**, Claude il sayfalarını yeni planlayıcıya bağlayacak. Senden istenen:
1. `[slug]/page.tsx` ve `BireyselUmreClient.tsx`'te uçuş/uçak/sefer/aktarma/havalimanı geçen **her** metin ve işlev: dosya:satır + metin. (Hangileri planlayıcıya geçişte kaldırılmalı/değişmeli, öneri sütunu.)
2. Canlı sitemap'teki 81 il sayfasının metnini curl ile çek; her çift için 5 sözcüklük dizi benzerliği (Jaccard) hesapla. Tablo: her il için en benzer 3 il ve oranı; genel medyan ve en yüksek. Betik ve tam çıktı TESLIM'de.
3. 10 öncelikli il (Denizli, Samsun, Kütahya, Tokat, Kırıkkale, Amasya, Diyarbakır, Antalya, Mersin, İstanbul) için sayfada **o ile özgü** cümleler listesi (havalimanı, mesafe, komşu iller dışında bir şey var mı).

Karar verme, öneri yazabilirsin; birleştirme/noindex yapma.

## G6-15 · Blog içerik denetimi (yalnızca belge)

**Dosyalar:** yeni `docs/taslaklar/blog-denetimi.md`, isteğe bağlı betik `scripts/local/blog-denetim.mts` (yalnızca okur)

Canlı sitemap'teki **bütün** `/blog/*` yazıları için (curl, en fazla 4 paralel):
- iç bağlantılar: her hedefin HTTP durumu (G6-3'teki 8 bilinen hariç başka 404 var mı), 301 zinciri olanlar;
- dış bağlantılar: alan adı listesi;
- H1 sayısı, H2 sayısı, soru biçimli H2 sayısı, sözcük sayısı (gövde), görsel sayısı, alt metni boş görsel sayısı;
- başlıkta ve açıklamada geçen yıl (2026 olmayanlar işaretlenir);
- "en ucuz", "garanti", "sıfır", "%", "7/24", "TÜRSAB", "diyanetsiz" ve rakip firma adı geçen cümleler (dosya: yazı adresi + cümle).

Tablo + en sonda "acil" listesi (404 bağlantı, yasaklı ifade). İçeriği düzeltme; veritabanına yazma.

---

## Bitince

TESLIM.md'nin en üstüne tek kayıt: "G6", her madde için durum (yapıldı / yapılmadı + neden), değişen dosyaların tam listesi (`git status --short` çıktısı), `npx tsc --noEmit` çıktısı.
