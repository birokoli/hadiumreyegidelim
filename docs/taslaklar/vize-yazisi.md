# Vize Yazısı Yenileme Taslağı (H11)

**Hedef Adres:** `https://hadiumreyegidelim.com/blog/bireysel-umre-vizesi-nasil-alinir`
**Gözden Geçirme Nedeni:** 1.899 gösterim, 9,9 ortalama sıra, %1,7 TO (düşük). Başlık ve meta açıklama yenilemesi, giriş paragrafı eklenmesi, kırık link bildirimi ve vize başvuru sayfasına bağlantı.

---

## 1. Yeni Meta Bilgileri

- **Yeni Title (≤60 Karakter):** `Nusuk Vize Başvurusu 2026: Umre Vizesi Nasıl Alınır?` (49 karakter)
- **Yeni Meta Açıklama (120–158 Karakter):** `Suudi Arabistan Nusuk e-vize başvurusu ile bireysel umre vizesi alma adımları, gerekli evraklar, süre ve güncel başvuru rehberi.` (134 karakter)

---

## 2. Yazının Başına Eklenecek Giriş Paragrafı (40–60 Kelime)

> [Umre vizesi ön başvurusu yapmak için umre vizesi başvuru formumuzu doldurabilirsiniz](/umre-vizesi/basvuru).
> 
> Bireysel umre vizesi, Suudi Arabistan'a seyahat edecek vatandaşlarımızın kısıtlayıcı grup turlarına bağlı kalmadan e-vize veya Nusuk uygulaması üzerinden kendileri için alabileceği resmî giriş iznidir. Pasaport, biyometrik fotoğraf ve seyahat planlaması ile kolayca başvuru yapılabilmekte ve doğrudan Mekke ile Medine'ye ulaşım sağlanmaktadır.

---

## 3. Eklenecek Yeni H2 Bölümleri

### Umre vizesi kaç günde çıkar?

Suudi Arabistan e-vize ve Nusuk sistemi üzerinden yapılan bireysel vize başvuruları genellikle **[SÜRE: kullanıcıdan]** içerisinde sonuçlanmaktadır. Pasaport bilgilerinin eksiksiz ve doğru girilmesi sürecin hızlanmasını sağlar.

### Umre vizesi kaç TL?

2026 yılı güncel bireysel umre vizesi ve harç ücreti **[ÜCRET: kullanıcıdan]** olarak belirlenmiştir. Vize ücretine zorunlu sağlık sigortası ve işlem bedelleri dâhildir. Detaylı bilgi ve hizmet paketlerimiz için [paketler sayfamızı](/paketler) inceleyebilirsiniz.

---

## 4. Kırık Bağlantı Bildirimi (Claude Code Tarafı)

Canlı veritabanı HTML içeriğinde iki adet kırık `visa.visitsaudi.com` bağlantısı bulunmaktadır (başında `https://` protokolü eksik ve biri metinsizdir):
1. `visa.visitsaudi.com` → `https://www.visitsaudi.com/` veya resmî portal bilgisine çevrilmeli/iç link yapılmalı (`/umre-vizesi`).
2. Metinsiz `<a href="visa.visitsaudi.com"></a>` etiketi temizlenmeli.

---

## 5. Mevcut Yazıda Değişecek Diğer Noktalar

1. **Bağlantı Güncellemeleri:**
   - Yazı içerisindeki dış bağlantılar resmî sağlık duyuruları için Suudi Arabistan Sağlık Bakanlığı `[umreci sağlığı ve aşı şartları](https://www.moh.gov.sa/en/healthawareness/pilgrims-health/pages/default.aspx)` sayfasına yönlendirilmelidir (curl 200 OK ile doğrulandı).
   - Vize, konaklama, transfer ve paketle ilgili konular site içi sayfalara (`/umre-vizesi`, `/bireysel-umre`, `/paketler`, `/hizmetler`) bağlanmalıdır.
2. **Kelimelerin Temizliği:**
   - Yasaklı kelimeler ("TÜRSAB", "diyanetsiz") ve rakip firma isimleri yazıda yer almamaktadır, bu durum korunmalıdır.
3. **Çağrı Kutusu (CTA):**
   - Yazının ortasında ve sonunda yer alan VIP başvuru ve iletişim butonları `/umre-vizesi/basvuru` ve `/bireysel-umre` sayfalarına yönlendirilmelidir.


---

## Claude incelemesi (1 Ekim) — uygulamadan önce düzeltilecekler

1. **Giriş paragrafı yorum içeriyor ve doğrulanamıyor:** "kısıtlayıcı grup turlarına bağlı kalmadan" ve "kolayca başvuru yapılabilmekte" çıkarılmalı. Giriş, "umre vizesi nasıl alınır?" sorusuna doğrudan cevap olmalı: kim başvurur, nereden (e-vize / Nusuk), hangi belgelerle, sonra ne olur.
2. **"Vize ücretine zorunlu sağlık sigortası ve işlem bedelleri dâhildir."** cümlesi kaynaksız. Ya resmî bir kaynakla doğrulanmalı ya da çıkarılmalı. Ayrıca `[ÜCRET]` alanında hangi ücretin yazılacağı belli değil: **resmî vize harcı mı, bizim vize hizmet bedelimiz mi?** İkisi ayrı satır olmalı; resmî harç resmî kaynağa bağlanır, bizim bedelimiz kullanıcıdan gelir.
3. **§4'teki öneri kural dışı:** "`https://www.visitsaudi.com/` … çevrilmeli" yazıyor. Vize sattığımız hizmet; dışarıya bağlanmaz. Bağlantılar zaten kodla düzeltildi ve `/umre-vizesi`'ye gidiyor (commit `acda0a4`). Bu madde kapandı.
4. **Başlık** site adı eklenmeden gösteriliyor (blog yazıları tam başlık kullanır); 52 karakter, uygun.
5. **Sağlık Bakanlığı bağlantısı** vize yazısında ancak "aşı şartları" bölümü varsa anlamlı; yoksa eklenmemeli.

**Durum:** taslak. Kullanıcıdan süre ve ücret gelince düzeltilmiş metin admin → Blog İçerikleri'nden uygulanır.


---

## Kullanıcıdan gelen bilgi (1 Ekim)

- **Süre:** vize 2 iş saati içinde çıkar (belgeler eksiksiz ulaştıktan sonra).
- **Ücret:** kişi başı 140 USD (bizim umre vizesi hizmetimizin ücreti).
- `[SÜRE]` ve `[ÜCRET]` yer tutucularına bu değerler yazılır. Resmî harçla karşılaştırma yapılmaz, "sigorta dâhil" gibi kaynaksız ek bilgi yazılmaz.
- Aynı bilgiler canlıda: `/umre-vizesi` (SSS + üst bölüm) ve `/umre-vizesi/basvuru` (açıklama, SSS, Service şemasında Offer 140 USD).
