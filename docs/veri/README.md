# Fiyat Kataloğu Veri Şablonu Kullanım Rehberi

Bu klasördeki `katalog-sablonu.csv` dosyası, **Hadi Umreye Gidelim** platformunun yeni nesil satış fiyatı kataloğunu oluşturmak için hazırlanmış veri şablonudur.

---

## 1. Dosya Sütun Yapısı ve Açıklamalar

CSV dosyasındaki sütunlar şu şekildedir:

| Sütun Adı | Açıklama | Örnek Değerler / Kurallar |
|---|---|---|
| `kategori` | Hizmetin ana kategorisi | `hotel`, `vize`, `flight`, `transfer`, `tren`, `tur`, `extra` |
| `ad` | Hizmet veya otel adı | `Swissôtel Makkah`, `İstanbul Çıkışlı Gidiş-Dönüş Uçuş` |
| `şehir` | Hizmetin sunulduğu şehir veya kalkış noktası | `Mekke`, `Medine`, `İstanbul`, `Ankara`, `Tüm Şehirler` |
| `yıldız` | Otel kategorisi (oteller için) | `5`, `4`, `3` veya boş |
| `harem_mesafe_m` | Harem-i Şerif veya Mescid-i Nebevi mesafesi (metre) | `50`, `150`, `400` veya boş |
| `oda_tipi` | Otel oda konfigürasyonu | `2 Kişilik`, `3 Kişilik`, `4 Kişilik` veya boş |
| `fiyat_birimi` | Fiyatın hesaplanma türü | `kisi` (kişi başı), `oda_gece` (oda/gece), `arac` (araç başı), `sabit` (sabit) |
| `2026-10` ... `2027-09` | **Aylık Satış Fiyatları (USD)** | İlgili ay için geçerli USD cinsinden satış fiyatı |
| `not` | Açıklama veya iç not | İsteğe bağlı açıklama metni |

---

## 2. Nasıl Doldurulur?

1. `katalog-sablonu.csv` dosyasını **Excel**, **Google Sheets** veya herhangi bir tablo düzenleyici ile açın.
2. `2026-10` ile `2027-09` arasındaki 12 aylık sütunlarda ilgili dönemin USD cinsinden **satış fiyatını** girin.
   - **Oteller için:** Belirtilen oda tipi için gecelik veya kişi başı satış fiyatı.
   - **Uçuş için:** Seçilen kalkış şehri için tahmini gidiş-dönüş bilet satış fiyatı.
   - **Vize:** Kişi başı **140 USD** olarak tanımlanmıştır (resmî harç + sigorta).
   - **Transfer / Tren / Turlar:** Araç veya kişi başı satış fiyatı.
3. Fiyat girmek istemediğiniz veya o ay sunulmayan hizmetlerin fiyat hücresini **boş bırakın**.
4. Dosyayı tekrar **CSV (Virgülle ayrılmış)** formatında kaydedin.

---

## 3. Önemli Kurallar

- Fiyatlar **USD (Amerikan Doları)** cinsinden olmalıdır.
- Ondalık ayırıcı olarak nokta (`.`) kullanın (Örn: `140` veya `185.50`).
- Uydurma veya tahmini olmayan boş alanları doldurmayın; sistem boş bırakılan ayları satışa kapatacaktır.
- Doldurulan dosya kaydedildikten sonra Admin paneline aktarılacak ve canlı fiyat teklifi motorunu besleyecektir.
