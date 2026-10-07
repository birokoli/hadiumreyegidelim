# G18 · Mekke otel rehberi verisi (7 Ekim)

Kurallar G8–G17 ile aynı: commit/push yok; yalnızca listelenen dosyalar; "bu arada" düzeltme yok; kanıt (komut + gerçek çıktı) TESLIM.md en üstüne tek "G18" kaydı. Veritabanına yazma yok. Gizli anahtar/parola yazma, isteme, dosyaya koyma.

Yasak ifadeler: TÜRSAB, diyanetsiz, "Harem'e sıfır", "Kabe'ye sıfır", 7/24, kesintisiz, lüks, VIP, eşsiz, garanti, "en ucuz", "en iyi", rakip firma adları, kapıda vize. **Fiyat yazma** (oteller Paximum'dan, fiyat değişiyor ve herkese açık gösterilmeyecek). **Uydurma bilgi yazma:** kaynağını gösteremediğin her bilgiyi çıkar. G17'de uydurma platform listesi yüzünden ret yedin; burada her somut bilgi kaynaklı olmalı.

Girdi: `docs/veri/mekke-otelleri-paximum.md` (Claude'un OSM'den doğruladığı 43 otel + doğrulanamayan 48 otel).

## G18-1 · Doğrulanamayan 48 otelin konumu
**Dosya:** yeni `docs/veri/mekke-otelleri-dogrulama.json`

Belgedeki "Konumu doğrulanamayanlar" listesindeki her otel için:
```json
{ "name": "Paximum'daki ad", "officialName": "...", "lat": 21.0, "lon": 39.0, "district": "Ajyad | Cebel Ömer | Cerval | Mescid-i Cin | Mahbes | Nüzha | Misfele | Aziziye | diğer", "kaabaMeters": 0, "source": "https://www.google.com/maps/place/... ya da otelin resmî sitesi" }
```
- Koordinatı Google Haritalar'daki otel kaydından al (kaydın bağlantısı `source`). Otel bulunamazsa `"lat": null` ve `"note": "bulunamadı"`; tahmin yazma.
- `kaabaMeters`: Kâbe (21.42250, 39.82620) ile kuş uçuşu mesafe, haversine ile hesapla. Hesap betiğini ve çıktısını kanıta koy.
- Aynı ada sahip birden fazla otel varsa (ör. "Violet Hotel" / "Violet Al Shisha"), Paximum adındaki semt ipucuna uyanı seç ve `note` yaz.

## G18-2 · Bölgelerde Paximum listesinde olmayan oteller (aday listesi)
**Dosya:** aynı JSON'a `"candidates": [...]` dizisi

Kullanıcı şu bölgelerden toplam ~50 otel istiyor: **Ajyad, Cebel Ömer, Cerval, Mescid-i Cin, Mahbes, Nüzha**. Nüzha (An-Nuzhah): Kâbe'nin batısında, araçla 8–11 dk; Google Haritalar'da "An Nuzhah, Makkah" olarak bul, sınırını kanıta ekran görüntüsüyle koy. Bölge başına en az 4 otel hedefle (Mescid-i Cin, Mahbes, Nüzha listede zayıf). Paximum listesindeki bu bölge otelleri yetmezse, Google Haritalar'da bu bölgelerdeki **puanı ve yorumu olan** otellerden aday ekle (aynı alanlar + `"inPaximum": false`). Kullanıcı bunları Paximum'da arayıp satılabilir olduğunu teyit edecek; teyit edilmeyen otel sayfaya girmez.

## G18-3 · Otel sayfa içerikleri (yalnızca bölgedeki oteller)
**Dosya:** yeni `docs/veri/mekke-otel-icerikleri.json`

Bölgesi Ajyad, Cebel Ömer, Cerval, Mescid-i Cin, Mahbes veya Nüzha olan her otel için (G13-1 biçimi):
```json
{ "slug": "anjum-hotel-makkah", "name": "Anjum Hotel Makkah", "stars": 5, "district": "Cerval", "description": "...", "roomTypes": ["..."], "meals": ["Oda kahvaltı", "..."], "shuttle": "var | yok | bilinmiyor", "walkMinutes": null, "faq": [{ "q": "...", "a": "..." }], "facts": [{ "text": "...", "source": "https://..." }] }
```
- `description`: 120–200 kelime, Türkçe, sade; bölge, Harem'e ulaşım (yürüyüş ya da servis), oda tipleri, yemek seçenekleri, umreciler için pratik bilgi. Satış dili yok.
  - **İlk cümle tek başına alıntılanabilir bir tanım olsun** (yapay zekâ aramaları bunu alır): "[Otel adı], Mekke'nin [bölge] bölgesinde, Mescid-i Haram'a [yürüyüşle yaklaşık X dakika / servisle ulaşılan] [N] yıldızlı bir oteldir." Bilinmeyen kısmı yazma, cümleyi kısalt.
  - Otelin adı metinde en az 2 kez, bölge adı en az 1 kez geçsin. Paximum'daki ad ile yaygın Türkçe aramayı da bir kez an (ör. "Anjum Hotel Makkah (Anjum Otel Mekke)").
  - Sayılar somut olsun ("yaklaşık 9 dakika", "4 kişilik oda"); "yakın", "konforlu", "ideal" gibi boş sıfatlar yok.
- `faq`: 3–5 soru-cevap. Sorular insanların gerçekten aradığı biçimde: "[Otel] Harem'e kaç dakika?", "[Otel]'in Harem'e servisi var mı?", "[Otel]'de kahvaltı dahil mi?", "[Otel] hangi bölgede?", "[Otel]'de kaç kişilik oda var?". Cevap ilk cümlede doğrudan (evet/hayır ya da sayı), en fazla 2 cümle, yalnızca `facts`'teki kaynaklı bilgiyle. Kaynağı olmayan soru eklenmez. Fiyat sorusu yok.
- `stars`, `roomTypes`, `meals`, `shuttle`: otelin resmî sitesinden ya da zincirin sayfasından; her biri `facts` içinde kaynaklı. Kaynak yoksa alanı boş bırak.
- `walkMinutes`: yalnızca Google Haritalar yürüme rotasından (Harem'in en yakın kapısına); rota ekran görüntüsü yolu `facts`'e. Doğrulamadıysan `null`.
- Fotoğraf indirme, kopyalama yok (telif). Görsel işini Claude ayrıca çözecek.
- Mevcut otel sayfaları (`/oteller/...`) olan 9 otelin içeriğini yeniden yazma; sadece `"existing": true` işaretle.

## Kabul ölçütleri
- G18-1: 48 kaydın her biri ya koordinatlı ve kaynaklı ya da "bulunamadı".
- G18-3: her `facts` kaydında çalışan bir bağlantı; yasak ifade taraması (`grep -niE "lüks|vip|eşsiz|garanti|7/24|kesintisiz|sıfır"`) boş.
- Fiyat geçen tek satır yok (`grep -niE "usd|\\$|tl|₺|riyal"` çıktısı kanıtta).
