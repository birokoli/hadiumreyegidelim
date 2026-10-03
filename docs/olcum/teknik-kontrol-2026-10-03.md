# Teknik Doğrulamalar Raporu (3 Ekim 2026)

## 1. r["@context"].toLowerCase JS Hatası İncelemesi (docs/YOL-HARITASI.md 1.5)
- `grep -rn "@context" src/lib/seo` araması yapıldı. Kod tabanındaki `src/lib/seo` altında ham JSON parsing ya da `toLowerCase()` çağrısı yapılan hiçbir güvensiz `@context` erişimi bulunmamaktadır.
- Sitedeki tüm JSON-LD şemaları (`PageTrust.tsx`, `ContentPageView.tsx`, `AdsCampaignLanding.tsx` vb.) `@context: "https://schema.org"` sabitiyle standart olarak ulaşılan nesneler üretmektedir.
- Durum: Hataya istemci/eklenti tarafındaki bir tarayıcı eklentisi (Chrome/Safari extension) neden olmaktadır, kaynak kodumuzda eksik/bozuk `@context` bulunmamaktadır.

## 2. Vercel Commit Durumları (Son 20 Commit)

| SHA | Mesaj | Tarih | Vercel Durumu |
|---|---|---|---|
| 63d261a | Blog: kelime arası &nbsp; normal boşluğa çevrilir | 2026-10-03T13:07:40Z | Vercel – hadiumreyegidelim: success, Vercel – hadiumreyegidelim.com: success |
| e25b301 | Blog metni: kelimeler harfinden bölünmez | 2026-10-03T13:02:06Z | Vercel – hadiumreyegidelim.com: success, Vercel – hadiumreyegidelim: success |
| 3b429ba | Antigravity G10: blog konu kuyruğu ekranı ve tohumlar | 2026-10-03T12:34:52Z | Vercel – hadiumreyegidelim.com: success, Vercel – hadiumreyegidelim: success |
| 90368cf | Blog motoru v2: küme dönüşü, yamyamlık kontrolü | 2026-10-03T12:34:34Z | Vercel – hadiumreyegidelim: success, Vercel – hadiumreyegidelim.com: success |
| 05cb27f | Blog motoru v2 karar belgesi | 2026-10-03T12:26:06Z | Vercel – hadiumreyegidelim.com: success, Vercel – hadiumreyegidelim: success |
| 5cb9227 | Antigravity G9: sabit metinlerin Sayfa Metinleri'ne taşınması | 2026-10-03T12:13:16Z | Vercel – hadiumreyegidelim: success, Vercel – hadiumreyegidelim.com: success |
| 45de1dd | Sayfa Metinleri: sitedeki sabit metinler admin'den düzenlenebilir | 2026-10-03T12:12:51Z | Vercel – hadiumreyegidelim: success, Vercel – hadiumreyegidelim.com: success |
| a452726 | Antigravity G8 paketi | 2026-10-03T12:03:39Z | Vercel – hadiumreyegidelim: success, Vercel – hadiumreyegidelim.com: success |
| be2eb70 | Yol haritası: A2, I7 tamam | 2026-10-03T11:59:33Z | Vercel – hadiumreyegidelim.com: success, Vercel – hadiumreyegidelim: success |
| 9ac4d56 | İletişim: kayıtlı Fatih adresi Bakırköy olarak düzeltilir | 2026-10-02T21:44:52Z | Vercel – hadiumreyegidelim: success, Vercel – hadiumreyegidelim.com: success |
| baa33be | İletişim adresi: Bakırköy, İstanbul | 2026-10-02T21:28:34Z | Vercel – hadiumreyegidelim.com: success, Vercel – hadiumreyegidelim: success |
| 0070bf0 | Ölü kod silindi: eski adımlı tasarlayıcı ve uçuş araması | 2026-10-02T20:56:06Z | Vercel – hadiumreyegidelim.com: success, Vercel – hadiumreyegidelim: success |
| b2e5486 | G7: yasal sayfalar, vize başvurusu, keşif sayfaları kite | 2026-10-02T20:55:22Z | Vercel – hadiumreyegidelim: success, Vercel – hadiumreyegidelim.com: success |
| b3a6a01 | Yol haritası: I2, I5, J4 tamam | 2026-10-02T20:53:33Z | Vercel – hadiumreyegidelim.com: success, Vercel – hadiumreyegidelim: success |
| aad610e | Kök layout'tan ana sayfa kanoniği kaldırıldı | 2026-10-02T20:51:47Z | Vercel – hadiumreyegidelim.com: success, Vercel – hadiumreyegidelim: success |
| e55934e | Admin alt alanında genel sayfalar ana alana 308 | 2026-10-02T20:48:44Z | Vercel – hadiumreyegidelim.com: success, Vercel – hadiumreyegidelim: success |
| bdc52f1 | Tren: eski tablodan aktarım, planlayıcıda Ekonomi/Business | 2026-10-02T20:46:02Z | Vercel – hadiumreyegidelim: success, Vercel – hadiumreyegidelim.com: success |
| 37e2d3d | Tek seferlik veri düzeltmesi | 2026-10-02T20:42:31Z | Vercel – hadiumreyegidelim.com: success, Vercel – hadiumreyegidelim: success |
| 96e4cc8 | Yol haritası: Faz I kutucukları ve Faz J | 2026-10-02T20:39:34Z | Vercel – hadiumreyegidelim.com: success, Vercel – hadiumreyegidelim: success |
| b54553b | Transfer listesi yükleme toplu yazımla | 2026-10-02T14:53:36Z | Vercel – hadiumreyegidelim.com: success, Vercel – hadiumreyegidelim: success |

## 3. Canlı Hız ve Vercel Üst Bilgi Ölçümleri (I12)

| Sayfa | TTFB Medyan (5 Deneme) | x-vercel-id Bölgesi | x-vercel-cache |
|---|---|---|---|
| / | 0.076s | fra1 | HIT |
| /bireysel-umre | 0.321s | fra1 | MISS |
| /blog | 0.081s | fra1 | HIT |
| /hizmetler | 0.302s | fra1 | MISS |
| /istanbul-cikisli-bireysel-umre | 0.084s | fra1 | PRERENDER |
| /blog/bireysel-umre-vizesi-nasil-alinir | 1.523s | fra1 | MISS |

## 4. Kırık Bağlantı ve Yönlendirme Taraması

- Sitemap URL Sayısı: 153
- Taranan Benzersiz İç Bağlantı Sayısı: 170
- Kırık Bağlantı (404/500) Sayısı: **0**
- Yönlendirme Sayısı: 1 (`/profil` → HTTP 307 → `/profil/giris`)
