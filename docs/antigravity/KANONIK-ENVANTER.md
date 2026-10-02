# Kanonik Envanter Raporu (G6-6, 2 Ekim 2026)

Kaynak: `src/app/(main)` altındaki tüm `page.tsx` sayfaları (39 sayfa).
Kök layout (`src/app/layout.tsx`) varsayılan olarak `alternates.canonical: SITE_URL` tanımladığı için kendi kanoniğini belirtmeyen sayfalar ana sayfayı kanonik (`https://hadiumreyegidelim.com`) miras alır.

## 1. Sayfa Kanonik Durum Tablosu

| URL | Dosya | Metadata Tipi | Kendi Kanoniği Var mı? | Canlı / Yerel Kanonik Çıktısı (`curl`) |
| --- | --- | --- | --- | --- |
| `/` | `src/app/(main)/page.tsx` | statik metadata | Evet (Satır 19) | `<link rel="canonical" href="https://hadiumreyegidelim.com"/>` |
| `/hakkimizda` | `src/app/(main)/hakkimizda/page.tsx` | statik metadata | Evet (Satır 10) | `<link rel="canonical" href="https://hadiumreyegidelim.com/hakkimizda"/>` |
| `/iletisim` | `src/app/(main)/iletisim/page.tsx` | statik metadata | Evet (Satır 10) | `<link rel="canonical" href="https://hadiumreyegidelim.com/iletisim"/>` |
| `/hizmetler` | `src/app/(main)/hizmetler/page.tsx` | statik metadata | Evet (Satır 9) | `<link rel="canonical" href="https://hadiumreyegidelim.com/hizmetler"/>` |
| `/blog` | `src/app/(main)/blog/page.tsx` | yok | Evet (Satır 8) | `<link rel="canonical" href="https://hadiumreyegidelim.com/blog"/>` |
| `/blog/bireysel-umre-vizesi-nasil-alinir` | `src/app/(main)/blog/[slug]/page.tsx` | generateMetadata | Evet (Satır 36) | `<link rel="canonical" href="https://hadiumreyegidelim.com/blog/bireysel-umre-vizesi-nasil-alinir"/>` |
| `/blog/kategori/rehberlik` | `src/app/(main)/blog/kategori/[slug]/page.tsx` | generateMetadata | Evet (Satır 15) | `<link rel="canonical" href="https://hadiumreyegidelim.com/blog/kategori/rehberlik"/>` |
| `/paketler` | `src/app/(main)/paketler/page.tsx` | statik metadata | Evet (Satır 22) | `<link rel="canonical" href="https://hadiumreyegidelim.com/paketler"/>` |
| `/paketler/kutlu-rota-ibadet-ve-kesif-886` | `src/app/(main)/paketler/[slug]/page.tsx` | generateMetadata | Evet (Satır 36) | `<link rel="canonical" href="https://hadiumreyegidelim.com/paketler/kutlu-rota-ibadet-ve-kesif-886"/>` |
| `/paketler/kutlu-rota-ibadet-ve-kesif-886/checkout` | `src/app/(main)/paketler/[slug]/checkout/page.tsx` | statik metadata | Evet (Satır 10) | `(yok / miras ana sayfa)` |
| `/bireysel-umre` | `src/app/(main)/bireysel-umre/page.tsx` | statik metadata | Evet (Satır 11) | `<link rel="canonical" href="https://hadiumreyegidelim.com/bireysel-umre"/>` |
| `/bireysel-umre/konaklama` | `src/app/(main)/bireysel-umre/konaklama/page.tsx` | yok | Hayır (Yok) | `<link rel="canonical" href="https://hadiumreyegidelim.com/bireysel-umre"/>` |
| `/bireysel-umre/transfer` | `src/app/(main)/bireysel-umre/transfer/page.tsx` | yok | Hayır (Yok) | `<link rel="canonical" href="https://hadiumreyegidelim.com/bireysel-umre"/>` |
| `/bireysel-umre/tren` | `src/app/(main)/bireysel-umre/tren/page.tsx` | yok | Hayır (Yok) | `<link rel="canonical" href="https://hadiumreyegidelim.com/bireysel-umre"/>` |
| `/bireysel-umre/ekstralar` | `src/app/(main)/bireysel-umre/ekstralar/page.tsx` | yok | Hayır (Yok) | `<link rel="canonical" href="https://hadiumreyegidelim.com/bireysel-umre"/>` |
| `/bireysel-umre/rehber` | `src/app/(main)/bireysel-umre/rehber/page.tsx` | yok | Hayır (Yok) | `<link rel="canonical" href="https://hadiumreyegidelim.com/bireysel-umre"/>` |
| `/bireysel-umre/ozet` | `src/app/(main)/bireysel-umre/ozet/page.tsx` | yok | Hayır (Yok) | `<link rel="canonical" href="https://hadiumreyegidelim.com/bireysel-umre"/>` |
| `/bireysel-umre/yeni` | `src/app/(main)/bireysel-umre/yeni/page.tsx` | statik metadata | Hayır (Yok) | `<link rel="canonical" href="https://hadiumreyegidelim.com/bireysel-umre"/>` |
| `/umre-vizesi` | `src/app/(main)/umre-vizesi/page.tsx` | statik metadata | Evet (Satır 13) | `<link rel="canonical" href="https://hadiumreyegidelim.com/umre-vizesi"/>` |
| `/umre-vizesi/basvuru` | `src/app/(main)/umre-vizesi/basvuru/page.tsx` | statik metadata | Evet (Satır 12) | `<link rel="canonical" href="https://hadiumreyegidelim.com/umre-vizesi/basvuru"/>` |
| `/rehberlik` | `src/app/(main)/rehberlik/page.tsx` | statik metadata | Evet (Satır 10) | `<link rel="canonical" href="https://hadiumreyegidelim.com/rehberlik"/>` |
| `/umre-rehberi` | `src/app/(main)/umre-rehberi/page.tsx` | statik metadata | Evet (Satır 11) | `<link rel="canonical" href="https://hadiumreyegidelim.com/umre-rehberi"/>` |
| `/umre-rehberi/ihram-nedir` | `src/app/(main)/umre-rehberi/[slug]/page.tsx` | generateMetadata | Evet (Satır 26) | `<link rel="canonical" href="https://hadiumreyegidelim.com/umre-rehberi/ihram-nedir"/>` |
| `/eylul-umresi` | `src/app/(main)/eylul-umresi/page.tsx` | generateMetadata | Evet (Satır 16) | `<link rel="canonical" href="https://hadiumreyegidelim.com/eylul-umresi"/>` |
| `/ilk-umrem` | `src/app/(main)/ilk-umrem/page.tsx` | generateMetadata | Evet (Satır 12) | `<link rel="canonical" href="https://hadiumreyegidelim.com/ilk-umrem"/>` |
| `/hanim-umresi` | `src/app/(main)/hanim-umresi/page.tsx` | generateMetadata | Evet (Satır 12) | `<link rel="canonical" href="https://hadiumreyegidelim.com/hanim-umresi"/>` |
| `/agustos-kampanyasi` | `src/app/(main)/agustos-kampanyasi/page.tsx` | yok | Hayır (Yok) | `<link rel="canonical" href="https://hadiumreyegidelim.com"/>` |
| `/denizli-cikisli-bireysel-umre` | `src/app/(main)/[slug]/page.tsx` | generateMetadata | Evet (Satır 125) | `<link rel="canonical" href="https://hadiumreyegidelim.com/denizli-cikisli-bireysel-umre"/>` |
| `/rehber/ornek-rehber` | `src/app/(main)/rehber/[slug]/page.tsx` | yok | Hayır (Yok) | `<link rel="canonical" href="https://hadiumreyegidelim.com"/>` |
| `/kesifler/hendek-turu` | `src/app/(main)/kesifler/hendek-turu/page.tsx` | yok | Hayır (Yok) | `<link rel="canonical" href="https://hadiumreyegidelim.com"/>` |
| `/gizli-mucevher/kuba` | `src/app/(main)/gizli-mucevher/kuba/page.tsx` | yok | Hayır (Yok) | `<link rel="canonical" href="https://hadiumreyegidelim.com"/>` |
| `/kvkk` | `src/app/(main)/kvkk/page.tsx` | statik metadata | Evet (Satır 9) | `<link rel="canonical" href="https://hadiumreyegidelim.com/kvkk"/>` |
| `/gizlilik-politikasi` | `src/app/(main)/gizlilik-politikasi/page.tsx` | statik metadata | Evet (Satır 9) | `<link rel="canonical" href="https://hadiumreyegidelim.com/gizlilik-politikasi"/>` |
| `/kullanim-sartlari` | `src/app/(main)/kullanim-sartlari/page.tsx` | statik metadata | Evet (Satır 9) | `<link rel="canonical" href="https://hadiumreyegidelim.com/kullanim-sartlari"/>` |
| `/profil/giris` | `src/app/(main)/profil/giris/page.tsx` | yok | Hayır (Yok) | `(yok / miras ana sayfa)` |
| `/profil/uye-ol` | `src/app/(main)/profil/uye-ol/page.tsx` | yok | Hayır (Yok) | `(yok / miras ana sayfa)` |
| `/profil` | `src/app/(main)/profil/(secure)/page.tsx` | yok | Hayır (Yok) | `(yok / miras ana sayfa)` |
| `/profil/siparisler` | `src/app/(main)/profil/(secure)/siparisler/page.tsx` | yok | Hayır (Yok) | `(yok / miras ana sayfa)` |
| `/kit` | `src/app/(main)/kit/page.tsx` | statik metadata | Hayır (Yok) | `<link rel="canonical" href="https://hadiumreyegidelim.com"/>` |

## 2. Kendi Kanoniği Olmayan ve Dizinde Kalması Gereken Sayfalar Listesi

Kök layout'tan ana sayfa kanoniğini miras alan ancak arama motorlarında kendi adresiyle dizine girmesi gereken (11 adet) sayfa:

- **`/bireysel-umre/konaklama`** (`src/app/(main)/bireysel-umre/konaklama/page.tsx`)
- **`/bireysel-umre/transfer`** (`src/app/(main)/bireysel-umre/transfer/page.tsx`)
- **`/bireysel-umre/tren`** (`src/app/(main)/bireysel-umre/tren/page.tsx`)
- **`/bireysel-umre/ekstralar`** (`src/app/(main)/bireysel-umre/ekstralar/page.tsx`)
- **`/bireysel-umre/rehber`** (`src/app/(main)/bireysel-umre/rehber/page.tsx`)
- **`/bireysel-umre/ozet`** (`src/app/(main)/bireysel-umre/ozet/page.tsx`)
- **`/bireysel-umre/yeni`** (`src/app/(main)/bireysel-umre/yeni/page.tsx`)
- **`/agustos-kampanyasi`** (`src/app/(main)/agustos-kampanyasi/page.tsx`)
- **`/rehber/ornek-rehber`** (`src/app/(main)/rehber/[slug]/page.tsx`)
- **`/kesifler/hendek-turu`** (`src/app/(main)/kesifler/hendek-turu/page.tsx`)
- **`/gizli-mucevher/kuba`** (`src/app/(main)/gizli-mucevher/kuba/page.tsx`)
