# G14 · Yardım merkezi admin bağlantıları (6 Ekim)

Kurallar G8–G13 ile aynı: commit/push yok; yalnızca listelenen dosyalar; "bu arada" düzeltme yok; `npx tsc --noEmit` + `npx eslint <dosyalar>` temiz; kanıt (komut + gerçek çıktı + yerel ekran görüntüsü) TESLIM.md en üstüne tek "G14" kaydı. Canlı veritabanına yazma yok. Gizli anahtar/parola yazma, isteme, dosyaya koyma. Uydurma veri yok: API'ye ulaşılamazsa boş/hata durumu gösterilir, örnek veri GÖSTERİLMEZ (G12'de reddedildi).

## Bağlam (Claude yaptı, DOKUNMA)
Sitede yeni yardım merkezi: `/sss`, `/iletisim` (destek), `/grup-talepleri`, `/isletme-kaydi`. Ortak bileşenler `src/components/help/*`. Metinler Sayfa Metinleri'nde (`src/lib/page-texts/registry.ts` → id: `sss`, `iletisim`, `grup-talepleri`, `isletme-kaydi`). Formdan gelen talepler `ContactRequest` tablosuna yazılır; `package` alanında **konu** (ör. "Grup talebi"), `message` alanında talep (+ "E-posta: …" satırı) durur.

Hazır yardımcılar (kullan, değiştirme):
- `src/lib/help/index.ts` → `SUBJECTS` (konu listesi), `ticketOf(id)` → "HUG-ABC123"
- `src/lib/page-texts/faq.ts` → `parseFaq(text)` ve `serializeFaq(items)`; `FaqItem = { cat, q, a }`
- Sayfa Metinleri API'si: `GET /api/admin/page-texts` → `{ pages, values }` (`values.sss.items` yoksa `pages` içindeki `sss` alanının `default`'u geçerlidir); `PUT /api/admin/page-texts` `{ page: "sss", values: { ...tüm alanlar } }` (boş/varsayılanla aynı değer saklanmaz; diğer alanları da göndermeyi unutma, yoksa varsayılana döner).

## G14-1 · Admin → Yardım Merkezi sayfası
**Dosyalar:** yeni `src/app/(admin)/admin/yardim-merkezi/page.tsx`; `src/components/admin/AdminSidebar.tsx` (yalnızca İçerik Stüdyosu grubuna bir satır: `/admin/yardim-merkezi`, ikon `help_center`, etiket "Yardım Merkezi", permission "content").

Bölümler:
1. **SSS düzenleyici** (asıl iş): `sss.items` metnini `parseFaq` ile listeye çevir. Her soru bir satır kartı: kategori (açılır liste: mevcut kategoriler + "Yeni kategori…" ile serbest yazı), soru (input), cevap (textarea). Yukarı/aşağı taşıma, silme (onay sorulur), "Soru ekle". Üstte kategori filtresi ve arama. "Kaydet" → `serializeFaq` ile metne çevir, `PUT /api/admin/page-texts` ile `sss` sayfasının **bütün alanlarıyla** (kicker, title, lead, items) gönder. Kaydedilmemiş değişiklik varsa sayfadan çıkarken uyarı. Başarı/hata mesajı görünür (sahte başarı yok).
2. **Sayfalar**: dört sayfa için kart: sayfa adı, canlı bağlantı (yeni sekme), "Metinleri düzenle" → `/admin/sayfa-metinleri` (sayfa seçimi orada elle yapılır; o dosyaya dokunma).
3. **Gelen talepler özeti**: `GET /api/admin/contact` mevcut uç noktasından (yanıt biçimini dosyayı okuyarak öğren, değiştirme) son 30 günde konuya göre sayılar (SUBJECTS sırasıyla) ve her biri için `/admin/contact?konu=<konu>` bağlantısı.

Görünüm: `src/app/(admin)/admin/yorumlar/page.tsx` ve `influencer-adaylari` ile aynı sınıflar.

## G14-2 · Admin → Talepler: konu ve takip numarası
**Dosya:** yalnızca `src/app/(admin)/admin/contact/page.tsx`
- Her talepte **takip numarası** (`ticketOf(lead.id)`) ve **konu rozeti** (`lead.package` SUBJECTS'ten biriyse rozet; değilse mevcut "paket" gösterimi aynen kalır).
- Üstte konu filtresi (Tümü + SUBJECTS); URL'deki `?konu=` ile açılır (`useSearchParams`), seçim URL'yi günceller.
- Takip numarasıyla arama (müşteri "HUG-…" numarasını söylediğinde bulunabilsin).
- Mevcut WhatsApp mesajı: konu "Grup talebi" ya da "İşletme kaydı / iş ortaklığı" ise mesaj buna uygun olsun (ör. "…grup talebiniz üzerine…"); diğerlerinde mevcut metin aynen.
- Mevcut davranışların hiçbiri bozulmaz (durum değiştirme, silme, planlayıcı mesaj biçimi).

Kanıt: iki ekranın yerel görüntüsü (`docs/antigravity/goruntuler/G14-*.png`), SSS düzenleyicide bir soru ekleyip kaydettikten sonra `/sss` sayfasında görünmesi (yerel), `?konu=Grup talebi` filtresinin çalışması.
