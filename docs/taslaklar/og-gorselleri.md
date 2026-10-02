# Sosyal Medya Paylaşım Görselleri (og:image) Analiz ve Öneri Raporu (G6-7)

Tarih: 2 Ekim 2026

122 sayfanın neredeyse tamamı aynı Unsplash görselini (`photo-1565552645632-d725f8bfc19a`) varsayılan Open Graph görseli (`og:image`) olarak kullanmaktadır. Bu rapor, sayfa gruplarına göre mevcut `og:image` durumunu ve önerilen yerel/yeni görsel haritasını sunar.

---

## 1. Sayfa Gruplarına Göre Mevcut `og:image` Örnekleri

### A. Şehir Sayfaları (81 İl)
Mevcut Durum: Kök layout varsayılan Unsplash görseli miras alınır.
- `/denizli-cikisli-bireysel-umre`: `property="og:image" content="https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=2600&auto=format&fit=crop"`
- `/istanbul-cikisli-bireysel-umre`: `property="og:image" content="https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=2600&auto=format&fit=crop"`

### B. Kampanya ve Tematik Sayfalar
Mevcut Durum: Statik Unsplash görseli.
- `/eylul-umresi`: `property="og:image" content="https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=2600&auto=format&fit=crop"`
- `/ilk-umrem`: `property="og:image" content="https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=2600&auto=format&fit=crop"`

### C. Rehber Sayfaları (`/umre-rehberi/*`)
Mevcut Durum: Varsayılan Unsplash görseli.
- `/umre-rehberi/ihram-nedir`: `property="og:image" content="https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=1200&auto=format&fit=crop"`
- `/umre-rehberi/tavaf-nedir`: `property="og:image" content="https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=1200&auto=format&fit=crop"`

### D. Blog Yazıları (`/blog/*`)
Mevcut Durum: Veritabanındaki `imageUrl` veya öne çıkan görsel.
- `/blog/bireysel-umre-vizesi-nasil-alinir`: `property="og:image" content="https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=1200&auto=format&fit=crop"`
- `/blog/mekkede-gezilecek-kutsal-yerler`: `property="og:image" content="https://images.unsplash.com/photo-1591604466107-ec97de577aff?q=80&w=1200&auto=format&fit=crop"`

### E. Statik & Kurumsal Sayfalar
Mevcut Durum: Kök layout varsayılan Unsplash görseli.
- `/hakkimizda`: `property="og:image" content="https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=2600&auto=format&fit=crop"`
- `/iletisim`: `property="og:image" content="https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=2600&auto=format&fit=crop"`

---

## 2. Görsel Öneri Haritası

| Sayfa Grubu | Mevcut Yerel Görsel Var mı? | Önerilen Görsel Yolu / Durumu | Gereksinim / Açıklama |
| --- | --- | --- | --- |
| Ana Sayfa & Genel Varsayılan | Evet | `public/images/hero-kabe.jpg` veya `public/logo.png` | 1200×630 boyutunda Kabe temalı genel paylaşım kartı. |
| Şehir Sayfaları (81 İl) | Kısmen | `public/images/hero-kabe.jpg` | Şehir bazlı dinamik metinli OG kartı veya genel Kabe görseli. |
| Kampanya Sayfaları (`/eylul-umresi` vb.) | Hayır | Görsel gerekli: Döneme uygun Kabe/Medine manzarası (1200×630 px) | Özel kampanya başlığı içeren özgün kart. |
| Rehber Sayfaları (`/umre-rehberi/*`) | Hayır | Görsel gerekli: İhram, Tavaf, Sa'y konularına özgün çizim/fotoğraf (1200×630 px) | Rehber başlığıyla uyumlu bilgi kartı. |
| Blog Yazıları (`/blog/*`) | Evet | Veritabanındaki `imageUrl` (Yüklenen kapak görseli) | Her yazı için 1200×630 boyutlu özgün blog kapağı. |
| Kurumsal Sayfalar (`/hakkimizda`, `/iletisim`) | Evet | `public/logo.png` veya `public/images/hero-kabe.jpg` | Kurumsal kimlik ve marka logosu içeren kart. |

*Not: Kod değişikliği yapılmamış, görseller indirilmemiş veya üretilmemiştir.*
