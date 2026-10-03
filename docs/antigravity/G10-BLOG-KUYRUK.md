# G10 · Blog konu kuyruğu ekranı ve tohum konular (G9'dan sonra)

Tasarım: `docs/BLOG-MOTORU.md`. API hazır (Claude, 90368cf): `GET /api/admin/blog-topics` → `{ queue, updates, blocked, pinned }`; `POST` `{ action: "refresh" | "pin" | "unpin" | "block" | "unblock" | "dismissUpdate", topic?, postSlug? }`.
Kurallar G8/G9 ile aynı (commit/push yok, yalnızca listelenen dosyalar, kanıt TESLIM'e).

## G10-1 · Admin ekranı
**Dosyalar:** yeni `src/app/(admin)/admin/blog-kuyrugu/page.tsx`, `src/components/admin/AdminSidebar.tsx` (yalnızca "Blog İçerikleri" satırının altına bir menü satırı: `/admin/blog-kuyrugu`, ikon `queue`, etiket "Blog Konu Kuyruğu", permission "content").
- Üstte "Kuyruğu yenile" (refresh). Tablo: konu, küme, puan (`finalScore`), gerekçe (`reason`), düğmeler: Öne al (pin) · Bir daha önerme (block).
- "Güncelleme önerileri" bölümü: yazı başlığı (`/blog/<postSlug>` bağlantısı), konu, gerekçe, "Kapat" (dismissUpdate).
- Öne alınanlar ve engellenenler listeleri, geri alma düğmeleriyle.
- Görünüm `src/app/(admin)/admin/sayfa-metinleri/page.tsx` ile aynı sınıflar. Kanıt: yerelde ekran görüntüsü (refresh sonrası dolu tablo).

## G10-2 · Tohum konular
**Dosyalar:** `src/lib/geo-blog/clusters.ts` — **yalnızca** her kümenin `seeds` dizisi.
- Her kümeye 12–15 uzun kuyruk soru (insanların gerçekten aradığı biçimde; en az 4 kelime). Baş aramalar yok ("umre vizesi", "bireysel umre", "umre fiyatları", "mekke otelleri", "kabeye yakın oteller", "umre turları").
- Canlı blogdaki mevcut yazılarla çakışan soru ekleme: her tohum için canlı sitemap'teki yazı başlıklarıyla karşılaştır; benzer olanı yazma.
- Rakip adı, TÜRSAB, diyanetsiz, fiyat rakamı yok.
