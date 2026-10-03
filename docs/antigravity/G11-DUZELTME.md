# G11 · G8-1 ve G8-2'nin yeniden yapılması (reddedildi, 3 Ekim)

Gerekçeler TESLIM.md'deki "Claude incelemesi: G8 ve G9" kaydında. Kurallar G8 ile aynı; commit/push yok; veritabanına yazma yok.

## G11-1 · Blog düzeltmeleri — cümle cümle, anlamı koruyarak

**Dosyalar:** `docs/veri/blog-duzeltmeleri.json` (baştan yaz), `docs/taslaklar/blog-duzeltmeleri.md`

Kaynak: **veritabanındaki ham içerik**, yani yayın sayfasında makale gövdesi. Canlı sayfa artık `&nbsp;`'leri normal boşluğa çeviriyor; veritabanında ise `&nbsp;` duruyor. Bu yüzden:
- `find` alanını **`&nbsp;` içermeden**, düz metin olarak yaz (boşluklar normal). Claude uygularken ham içerikteki `&nbsp;`'leri boşluk sayarak eşleştirecek.
- `find` yalnızca makale gövdesinden; JSON-LD, içindekiler (TOC) ve SSS kutusu otomatik üretilir, **onları hedefleme** (SSS'teki yasaklı ifade varsa yazının `faq` alanındadır: kayda `"field": "faq"` ekle ve sorunun tam metnini yaz).
- Her kayıt **tam cümle** değiştirir (cümlenin başından sonuna). Kelime takası yok.

Ne değişir, ne değişmez:
- **TÜRSAB:** cümle marka adı olmadan yeniden kurulur ("Firmanın Kültür ve Turizm Bakanlığı belgeli bir seyahat acentesi olup olmadığını kontrol edin." gibi).
- **7/24:** "kesintisiz/her an" vaadi kaldırılır ("WhatsApp'tan bize yazabilirsiniz").
- **"Harem'e sıfır", "Kâbe'ye sıfır":** konum iddiası; yazıda metre geçiyorsa metre, yoksa "Harem'e yürüme mesafesinde".
- **"en ucuz":** kıyas iddiası kaldırılır ("bütçeye uygun", "daha düşük maliyetli" gibi, bağlama göre).
- **"garanti":** bizim vaadimizse kaldırılır; ürün garantisi gibi masum kullanım **değişmez**.
- **"lüks" ve "sıfır" kelimesinin konum dışı anlamı ("ihtimal sıfır", "lüks mağazalar") DEĞİŞMEZ.** Yasak yalnızca bizim reklam dilimiz içindir.
- Yeni cümlede rakam, fiyat, kurum adı uydurma yok.

Kanıt: her kayıt için `find` metninin, canlı sayfanın makale gövdesi metninde (etiketler çıkarılmış, boşluklar sadeleştirilmiş) **1 kez** geçtiğini gösteren betik çıktısı. Ayrıca `.md`'de tablo: yazı | eski cümle | yeni cümle.

## G11-2 · Vize yazısı — tam yazı

**Dosyalar:** `docs/veri/vize-yazisi.json` (baştan yaz), `docs/taslaklar/vize-yazisi.md`

Yazı: `/blog/bireysel-umre-vizesi-nasil-alinir`. **1.200–1.600 kelime**, mevcut yazıdaki doğru bilgiler korunur (canlı yazıyı oku).
- **Süreç (kullanıcı bilgisi, aynen):** müşteri otel rezervasyonunu, gidiş-dönüş uçak biletini, pasaportunun ön yüzünün fotoğrafını ve her yolcu için birer biyometrik fotoğrafı **WhatsApp'tan** Hadi Umreye Gidelim'e gönderir, vize ücretini öder (kişi başı **140 USD**); belgeler tamamsa vize **2 saat içinde** Hadi Umreye Gidelim tarafından iletilir.
- **Yazılmayacaklar:** "kapıda vize", "Schengen/ABD/İngiltere vizesiyle", "kendiniz başvurun", "300 riyal" ya da başka ücret, visa.visitsaudi.com'a başvuru yönlendirmesi.
- Yapı: ilk paragrafta doğrudan cevap (süreç + 140 USD + 2 saat + `/umre-vizesi/basvuru` bağlantısı); en az 5 H2, en az 3'ü soru; süreç adımları `<ol>`; belgeler `<ul>`; bir tablo (belge | neden gerekli | nasıl gönderilir); sonda `/bireysel-umre` ve `/umre-vizesi` bağlantıları; SSS için ayrı `faq` dizisi (4–6 soru, `{q,a}`).
- Üslup: `src/lib/geo-blog/write.ts` içindeki SYSTEM kuralları (yasak kalıplar, insan editör üslubu).
- Biçim: `{ "slug", "title" (≤60), "description" (≤155), "content" (HTML), "faq": [{q,a}], "wordCount" }`. Kelime sayısını betikle hesapla, yaz.
