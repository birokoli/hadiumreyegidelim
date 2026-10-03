# Blog motoru v2: konu seçimi (karar belgesi, 3 Ekim 2026)

Sorun: motor fırsat listesinin en üstündeki konuyu seçiyordu (`pickTopic` → `opportunities[0]`); liste başı hep vize sorularıydı, tekrar kontrolü (%75 kelime örtüşmesi) yeni başlık kurgusunu yakalamıyordu. 2 günde 3 vize yazısı çıktı.

## Kullanıcı kararları (3 Ekim)
- **Yamyamlık yok:** hiçbir yeni yazı mevcut bir sayfayla aynı aramaya yarışmaz. Risk varsa yazılmaz; güncellemek mantıklıysa güncelleme önerilir; değilse başka konu bulunur. Trafik ve site güvenliği önce.
- **Para kelimeleri korunur:** "umre", "bireysel umre", "umre vizesi", "Kâbe'ye yakın oteller", "Mekke otelleri" gibi baş aramalar **satış sayfalarının** (`/bireysel-umre`, `/umre-vizesi`, `/hizmetler`, il sayfaları). Blog bu aramaları hedeflemez; uzun kuyruk soruları cevaplar ve satış sayfasına bağlantı verir.
- **Taslak:** her yazı taslak kalır, kullanıcı onaylar.
- **Sıklık:** günde 3 taslak.
- **Kalite:** insan gibi okunan, kaynak gösterilebilir (GEO) içerik. "AI dedektöründe %100 insan" garanti edilemez (dedektörler güvenilir değil); hedef: somut bilgi, gerçek deneyim cümleleri, değişken cümle yapısı, kalıp giriş/sonuç yok, uydurma rakam yok.

## Algoritma
1. **Aday havuzu:** AI Görünürlük boşlukları, fan-out aramaları, takip edilen kelimeler, **Search Console** (gösterim alan ama iyi sayfası olmayan aramalar), küme başına uzun kuyruk tohum listesi, mevsimsel konular (Ramazan, sömestr, ay umresi: 6–8 hafta önce).
2. **Küme ataması** (sözlük): vize · fiyat/bütçe · konaklama · ulaşım · ibadet rehberi · Mekke/Medine ziyaret · özel durumlar · dönem · hazırlık/sağlık · il çıkışlı. Kümesi bulunamayan aday elenir.
3. **Rezerve aramalar:** adayın odağı bir para kelimesiyse ve o kelimenin satış sayfası varsa aday **elenir** (blog o kelimeyi hedeflemez).
4. **Yamyamlık kontrolü** (mevcut yazılar + satış sayfaları; başlık, odak kelime, adres, H2'ler):
   - Benzerlik ≥ 0,5 ve aynı küme → yeni yazı yok. Mevcut sayfa Search Console'da gösterim alıyor ve 4–20. sıradaysa **güncelleme önerisi**; değilse aday atlanır.
   - Search Console'da aday aramada zaten bizim bir sayfamız ilk 10'daysa → aday elenir.
5. **Küme doygunluğu:** küme başına yayımlanmış yazı sayısı ve son yazı tarihi; aynı gün aynı kümeden ikinci taslak yok; son 7 günde bir kümeye en fazla 2 taslak. Az yazısı olan küme öne geçer.
6. **Puan:** talep (GSC gösterimi / takip / AI sıklığı) × küme tazeliği × niyet açıklığı − yamyamlık cezası. Günde 3 seçim: üç **farklı** kümeden en yüksek puanlılar.
7. **Kuyruk ekranı (admin):** sıradaki 15 aday küme, puan, gerekçe ve çakışma bilgisiyle; düğmeler: öne al · atla · bir daha önerme · "güncelleme önerileri" listesi.
8. **Yazım kuralları (prompt):** ilk paragrafta doğrudan cevap; en az 3 soru biçimli H2; satış sayfasına 1 bağlantı + 2–4 ilgili yazı bağlantısı; site gerçekleri (vize 140 USD / 2 iş saati; oda en fazla 4 kişi; uçak/Nusuk satılmaz); yasaklı ifadeler kapısı; kalıp cümle listesi (ör. "Sonuç olarak", "Unutmayın ki", "Bu yazımızda") yasak.

## İş bölümü
- Claude: 1–6 ve 8 (`src/lib/geo-blog/*`), cron sıklığı.
- Antigravity: küme sözlüğü ve uzun kuyruk tohum listesi (belge), 7 (admin kuyruk ekranı; API'yi Claude verir).
