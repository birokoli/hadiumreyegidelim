# G6 · Dış SEO denetimi düzeltmeleri (2 Ekim, yaklaşık 2 saatlik iş)

Kaynak: `docs/SIRALAMA-YOL-HARITASI.md` → **Faz I** (I1–I4, I7, I10). Claude bu sürede çevrimdışı; döndüğünde her maddeyi aşağıdaki kanıtlara göre kontrol edecek, hatalıysa geri alacak.

## 0. Kurallar (GOREVLER.md'dekilerin hepsi geçerli, özellikle şunlar)

1. **Commit ve push YOK.** Değişiklikler çalışma klasöründe kalır. Canlıya yalnızca Claude alır.
2. **Yalnızca her maddenin "Dosyalar" satırındaki dosyalara** dokun. Başka dosya gerekiyorsa dur, TESLIM.md'ye yaz, sonraki maddeye geç.
3. Her madde bitince `docs/antigravity/TESLIM.md` dosyasının **en üstüne** kayıt: madde kodu, dosyalar, kabul ölçütlerinin **komut + çıktısı**. "Tamamlandı" yazmak kanıt değildir.
4. Next.js 16: `params` ve `searchParams` Promise'tir. Metadata API'sinde emin olmadığın bir şey varsa önce `node_modules/next/dist/docs/` içinde ara; tahminle yazma.
5. Her maddeden sonra: `npx tsc --noEmit` (çıktı boş olmalı) ve değiştirdiğin dosyalara `npx eslint <dosyalar>` (0 hata).
6. Yerel sunucu `http://localhost:3002` çalışıyor (yerel veritabanıyla). Kontroller `curl -s http://localhost:3002/...` ile yapılır.
7. Sıra: **G6-1 → G6-2 → G6-3 → G6-4 → G6-5 → G6-6 → G6-7.** Zaman kalmazsa kalan maddeyi TESLIM.md'ye "yapılmadı" diye yaz; yarım bırakılan değişikliği geri al (`git checkout -- <dosya>`).

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

## Bitince

TESLIM.md'nin en üstüne tek kayıt: "G6", her madde için durum (yapıldı / yapılmadı + neden), değişen dosyaların tam listesi (`git status --short` çıktısı), `npx tsc --noEmit` çıktısı.
