# Tasarım dili (2026 ana sayfası esas alınır)

Herkese açık her sayfa bu kurallara uyar. Bileşenler `src/components/ui/kit/index.tsx` içinde. Canlı vitrin yalnızca yerelde açılır: **http://localhost:3002/kit** (canlıda 404).

## 1. Temel değerler

| Öğe | Kural |
|---|---|
| Renk | Zemin beyaz ve `bg-surface`. Ana renk lacivert `text-primary` / `bg-primary` (#003781), koyu lacivert #001944. Altın vurgu yalnızca küçük rozetlerde #c9a96e. WhatsApp düğmesi koyu yeşil #15803d (açık #25D366 üzerine beyaz yazı okunmuyor). Kırmızı yalnızca hata. |
| Yazı | Başlıklar `font-headline` (Noto Serif), metin Inter. H1 `text-3xl md:text-5xl`, H2 `text-2xl md:text-3xl`, kart başlığı `text-lg`. Üst etiket: `text-[11px] font-bold uppercase tracking-[0.18em] text-primary/80`. `text-primary/60` ve daha soluk tonlar küçük yazıda kullanılmaz (kontrast). |
| Genişlik | `Container`: `max-w-screen-xl`, yan boşluk `px-4 md:px-8`; dar metin `narrow` (`max-w-screen-md`). |
| Dikey boşluk | `Section`: `py-12 md:py-16`. Bant tonları: `plain` / `white` (ince kenarlı beyaz) / `muted` (açık gri). |
| Köşe | Kart ve kutular `rounded-2xl`, düğme `rounded-xl`, rozet `rounded-lg`. |
| Gölge | Varsayılan yok; kartlarda yalnızca üzerine gelince `shadow-[0_18px_40px_-20px_rgba(0,25,68,0.4)]`. |
| Kenar | `border border-outline-variant/20`. |
| Hareket | Kartlarda `data-reveal` (kaydırınca belirir; `MotionInit` yalnızca `(main)` düzeninde çalışır). Görsel üzerine gelince `scale-105`. Abartılı animasyon yok. |

## 2. Bileşenler (yalnızca bunlar)

| Bileşen | Ne için |
|---|---|
| `PageHero` | İç sayfa başı: sayfa yolu, üst etiket, tek H1, giriş, sağda isteğe bağlı form/görsel (`aside`). |
| `Section`, `Container`, `SectionHead` | Bölüm iskeleti ve bölüm başlığı (sağda "Tümü →" bağlantısı). |
| `MediaCard` | Paket, otel, hizmet, kampanya kartı. Görsel yoksa marka yedeği. Rozetler `topLeft` / `topRight`. Alt kısım `CardFooter`. |
| `CardFooter`, `PriceTag` | "Başlangıç 1.250 $" + "İncele →". **Fiyat 0 ya da yoksa gösterilmez** (uydurma fiyat yok). |
| `PostCard` | Blog listesi (mobilde yatay). |
| `Panel` | Görselsiz kutu (beyaz, gri, lacivert). |
| `Badge` | Süre, "En çok tercih edilen", "Ekim fiyatı". |
| `ButtonLink` | Birincil (lacivert), ikincil (beyaz), WhatsApp (koyu yeşil), açık (lacivert zemin üstü). Dış adresler yeni sekmede. |
| `Steps` | 3'lü numaralı adımlar. |
| `Faq` + `faqJsonLd(items)` | Açılır SSS ve şema. Şema metni sayfadaki metinle birebir aynı (aynı dizi). |
| `EmptyState` | "Henüz … yok" kutusu. |
| `Breadcrumb` | Sayfa yolu (PageHero içinde). |

Yeni bir parça gerekiyorsa sayfanın içine yazılmaz, **kite eklenir**. Antigravity kite ekleme yapmaz; ihtiyacı CALISMA-KAYDI'na yazar, Claude ekler.

## 3. Görseller ve ikonlar

- Görsel yalnızca `next/image` (`fill` + `sizes`, ya da `width`/`height`). Ham `<img>` yok. İlk ekrandaki büyük görselde `priority`.
- İkonlar: satır içi SVG tercih edilir. Material Symbols kullanılıyorsa ikon adı `public/fonts/icons/ICONS.txt` listesinde olmalı. Yoksa alt küme yeniden üretilir (Claude), aksi halde ikon adı yazı olarak görünür.

## 4. Metin kuralları

- Her sayfada tek H1. Ara başlıkların en az ikisi soru biçiminde (AI ve öne çıkan sonuçlar için).
- Doğrulanamayan iddia yok: "en ucuz", "garanti", "sıfır", "%… varan", "24 saatte".
- Gerçek bilgiler: vize kişi başı 140 USD, belgeler tamamsa 2 iş saati. Paket ve otel fiyatları yalnızca admin verisinden.
- "TÜRSAB", "diyanetsiz" ve rakip firma adları geçmez.

## 5. Sayfa dönüşüm kontrol listesi (Y3)

1. Sayfanın tüm işlevleri listelenir (`docs/tasarim-denetimi/ENVANTER.md`); dönüşümden sonra **hepsi çalışır** (düğme, form, seçim, bağlantı).
2. Yalnızca kit bileşenleri; sayfaya özel renk, gölge ya da yazı tipi yok.
3. `npx tsc --noEmit` temiz; `npm run build` yerelde veritabanı olmadığı için `/blog` gibi sayfalarda düşebilir, bu bilinen bir durum. Sayfa `npm run dev`'de açılmalı.
4. Yerelde masaüstü (1440) ve mobil (390) önce/sonra ekran görüntüsü; yatay taşma 0.
5. Lighthouse mobil: performans ≥ 85, erişilebilirlik ≥ 95.
6. Kullanıcı onayı → push.
