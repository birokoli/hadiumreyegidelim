# G9 · Sitedeki bütün sabit metinleri admin'e taşı (Sayfa Metinleri)

Kullanıcı isteği (3 Ekim): "site tamamen adminden yönetilebilmeli". Altyapı hazır (Claude, 45de1dd):
- Kayıt defteri: `src/lib/page-texts/registry.ts` → `PAGE_TEXTS` (sayfa → alanlar, varsayılan metin koddadır).
- Okuma (sunucu bileşeni): `const t = await getPageTexts("<id>")` → `t("<key>")` (`src/lib/page-texts/index.ts`).
- Admin ekranı: `/admin/sayfa-metinleri` (kayıt defterindeki her alanı otomatik listeler).
- **Örnek:** `src/app/(main)/hakkimizda/page.tsx` (kicker/title/lead). Aynı kalıbı uygula.

G8 bitmeden G9'a başlama. Kurallar G8 ile aynı (commit/push yok, yalnızca listelenen dosyalar, "bu arada" düzeltme yok, tsc+eslint temiz, kanıt TESLIM'e).

## Kapsam

**Dosyalar:** `src/lib/page-texts/registry.ts` (yalnızca `PAGE_TEXTS` dizisine ekleme) + aşağıdaki sayfaların `page.tsx` dosyaları.

Sayfalar (her biri registry'de ayrı `id`):
`/` (ana sayfa), `/bireysel-umre`, `/hizmetler`, `/paketler`, `/blog` (+ kategori sayfasının sabit metinleri `src/components/blog/BlogList.tsx` — bu dosyaya izin var), `/umre-vizesi`, `/umre-vizesi/basvuru`, `/iletisim`, `/hakkimizda` (kalan metinler), `/rehberlik`, `/umre-rehberi`, il sayfası şablonu (`src/app/(main)/[slug]/page.tsx` — **yalnızca sabit metinler**; `{city.name}` gibi değişkenli metinlerde yer tutucu kullan: varsayılan `"{il} Çıkışlı Bireysel Umre"`, sayfada `t("title").replaceAll("{il}", city.name)`; yer tutucuları `help` alanında belirt), alt bilgi (`src/components/layout/Footer.tsx` sunucu bileşeniyse; istemciyse **dokunma**, TESLIM'e yaz).

Her sayfada taşınacaklar: üst etiket, H1, giriş, bölüm başlıkları ve açıklamaları, düğme yazıları, SSS soru ve cevapları (SSS dizisi: `faq1q`, `faq1a`… şeklinde alanlar; **şema da aynı `t()` değerlerinden** üretilmeli ki sayfa metni ve şema aynı kalsın), boş durum yazıları.

**Taşınmayacaklar:** metadata (`title`, `description`) — admin'de SEO alanı ayrı iş; hukuki metinler (kvkk, gizlilik, kullanım şartları); planlayıcı bileşeni (`src/components/planner/**`); admin'den zaten gelen alanlar (kampanya ayarları, site ayarları).

## Kurallar

1. **Varsayılan değer = sayfadaki mevcut metin, harfi harfine.** Dönüşümden sonra sayfanın görünen metni değişmemeli. Kanıt: her sayfa için önce/sonra `curl -s http://localhost:3002<yol> | sed 's/<[^>]*>/ /g' | tr -s ' \n' | md5` aynı olmalı (fark varsa açıkla).
2. Alan `label`'ları Türkçe ve anlaşılır ("SSS 1 · soru", "Planlayıcı bandı · düğme").
3. İstemci bileşenine (`"use client"`) `getPageTexts` çağrılmaz; sunucu sayfasında okunup prop olarak geçirilir.
4. `id`'ler kısa ve sabit (`anasayfa`, `bireysel-umre`, `hizmetler`, `il-sayfasi` …); sonradan değişmez (kayıtlı metinler bu anahtarla saklanır).
5. Kanıt ayrıca: `/admin/sayfa-metinleri` ekranının ekran görüntüsü (sayfa listesi görünür) ve bir sayfada bir alanı değiştirip sitede göründüğünü, sonra "varsayılana dön" ile geri geldiğini gösteren iki ekran görüntüsü (yerelde).

## Bitince

TESLIM.md en üstüne "G9": sayfa başına taşınan alan sayısı, md5 önce/sonra tablosu, değişen dosyalar, tsc/eslint çıktısı.
