# "Umre turları 2026" yazıları: silmeden ve birleştirmeden ayrıştırma planı (C1 yerine)

**Kullanıcı kararı (1 Ekim):** Yazılar silinmeyecek, birleştirilmeyecek; birbirinin rakibi olmaktan çıkarılacak. `umre-turlari-birlestirme.md` planı bu nedenle **uygulanmayacak**.

## Sorun

6 yazı aynı aramaya yarışıyor. Hepsinin başlığı "2026 Umre Turları: …" ile başlıyor; üçünün ara başlıkları neredeyse aynı (Diyanet mi bireysel mi + VIP + fiyat + bebekle umre + SSS). Google aynı soruya cevap veren birkaç sayfadan hangisini göstereceğini seçemiyor ve hepsini aşağıda tutuyor (Search Console: 28. ile 90. sıra arası).

**Kategori tek başına çözmez.** Google sıralamayı kategoriye göre değil, sayfanın hangi soruya cevap verdiğine göre yapar. Aynı soruyu cevaplayan iki yazı aynı kategoride de olsa rakiptir. Kategori yalnızca toparlayıcı bir merkez sayfa olarak işe yarar (aşağıda 3. adım).

## Çözüm: her yazıya ayrı bir soru

Her yazı farklı bir aramanın cevabı olacak. Seçimler Search Console'da gerçekten aranan kelimelerden yapıldı (son 3 ay).

| Yazı (adres aynı kalır) | Yeni tek görevi | Search Console'daki kanıt | Yeni başlık önerisi |
|---|---|---|---|
| `/blog/2026-umre-turlari-diyanet-bireysel-fiyatlar-vip-ipuclari` | **ANA YAZI:** Diyanet ile bireysel umrenin fiyat karşılaştırması | "umre fiyatları 2026 diyanet", "diyanet umre fiyatları 2026", "2026 diyanet umre fiyatları" (30–65. sıra) | Umre Fiyatları 2026: Diyanet mi, Bireysel mi? |
| `/blog/2026-umre-fiyatlari-rehberi` | Bireysel umrenin **kalem kalem maliyeti** (uçak, otel, vize, transfer) | "bireysel umre ne kadara mal olur", "umre maliyeti", "bireysel umre maliyeti", "umreye gitmek kaç tl 2026" | Bireysel Umre Maliyeti 2026: Kalem Kalem Ne Tutar? |
| `/blog/umre-turlari-2026-fiyat-karsilastirmalari-diyanet-bireysel-vip` | **VIP umre** | "vip umre fiyatları 2026" (16. sıra), "diyanet vip umre" (15,9), "vip umre" | VIP Umre 2026: Harem'e Yakın Otel ve Özel Transfer |
| `/blog/umre-turlari-2026-bireysel-diyanet-fiyat-karsilastirma` | **Çocukla ve kalabalık aileyle** umrede kişi sayısına göre maliyet | "çocuk umre fiyatları 2026 diyanet" (28,5), "çocuk umre fiyatları 2026", "umre fiyatları 2026 2 kişilik" | Çocukla ve Aileyle Umre 2026: Kişi Sayısına Göre Maliyet |
| `/blog/umre-turlari-2026` | **2026 umre dönemleri** ve hangi dönemde ne değişir | "diyanet umre fiyatları 2026 1/2/3/4. dönem" (toplam ~17 gösterim, 22–46. sıra) | 2026 Umre Dönemleri: Hangi Dönemde Ne Değişir? |
| `/blog/umre-turlari-2026-hadi-umreye-gidelim` | **Marka:** Hadi Umreye Gidelim ile umre nasıl işler | "umre turları 2026 hadi umreye gidelim" (1,75. sıra) | Hadi Umreye Gidelim ile Umre: Nasıl Çalışıyoruz? |

## Uygulama adımları

1. **Başlık, açıklama, H1:** tablodaki gibi; her yazının ana kelimesi başlığın başında. Hiçbir yazının başlığı "2026 Umre Turları" ile başlamaz (o ifade yalnızca ana yazının metninde geçer).
2. **Tekrarı temizle (en önemli adım):**
   - "Diyanet mi, bireysel mi?" karşılaştırması **yalnızca ana yazıda** kalır. Diğerlerinde tek cümle ve ana yazıya bağlantı olur.
   - "VIP" bölümü yalnızca VIP yazısında kalır.
   - "Bebekle umre 5 altın kural" yalnızca çocuk/aile yazısında kalır; ayrıntı için `/blog/bebekle-umre-kolay-mi-2026-kurallar-ve-ipuclari`'ye bağlantı verilir.
   - Her yazı kendi konusunu derinleştirir; yeni bölümler kendi sorusuna cevap verir.
3. **İç bağlantılar (merkez + uydular):**
   - Diğer 5 yazı ana yazıya "umre fiyatları 2026" metniyle bağlanır.
   - Ana yazı her birine kendi konusuyla bağlanır ("bireysel umre maliyeti", "VIP umre", "çocukla umre maliyeti", "2026 umre dönemleri").
   - Uydu yazılar birbirine bağlanmaz; her biri ana yazıya ve kendi satış sayfasına bağlanır (`/bireysel-umre`, `/paketler`, `/umre-vizesi/basvuru`).
4. **Kategori (merkez sayfa):** altı yazı tek kategoride toplanır: "Umre Fiyatları ve Turları". Kategori sayfası kısa bir giriş metni ve altı yazının listesiyle konu merkezi olur. Kategori sistemi zaten var (`/blog/kategori/...`).
5. **Rehber sayfalarıyla çakışma yok:** `/umre-rehberi/bireysel-umre-mi-turla-umre-mi`, `/umre-rehberi/ekonomik-umre-mi-luks-umre-mi` ve `/aile-umresi` farklı sorulara cevap veriyor. Yazılar bunlara bağlantı verir; aynı karşılaştırmayı tekrar yazmaz.

## Kurallar (değişmez)

- Fiyat yalnızca gerçek veriden yazılır: vize **kişi başı 140 USD** (kullanıcı); paket fiyatları admin'e girildikten sonra.
- Diyanet fiyatı yalnızca resmî duyuruya bağlantıyla anılır, rakam tekrarlanmaz. "TÜRSAB", "diyanetsiz", rakip firma adı yok.
- "Sıfır", "en ucuz", "garanti" yok. Emoji yok.
- Adresler **değişmez** (sıralama ve gelen bağlantılar korunur); yalnızca başlık, açıklama ve içerik değişir.

## Sonuç ve ölçüm

Birleştirmeye göre daha yavaş ve garantisi daha az bir yol: altı sayfa ayrı ayrı güçlenmek zorunda. Karşılığında altı ayrı aramada görünme şansı doğar. Değişiklikten sonra 2–4 hafta Search Console'da her yazının kendi kelimesindeki sırası izlenir. İki yazı hâlâ aynı kelimede yarışıyorsa o ikisi için yeniden karar verilir.

## İş bölümü

- **Antigravity:** her yazı için ayrı taslak, `docs/taslaklar/ayristirma/<adres>.md`. İçinde yeni başlık, açıklama (120–158), H1, kalacak/çıkacak bölümler, yeni bölümlerin metni ve iç bağlantılar. Önce ana yazı, sonra diğerleri.
- **Kullanıcı:** taslakları onaylar. Uygulama admin → Blog İçerikleri'nden yapılır (yazılar veritabanında).
- **Claude:** kategori sayfasının merkez sayfa olarak çalıştığını kontrol eder; uygulamadan sonra denetim ve ölçüm yapar.


## G8-5 Uygulama Durumu (3 Ekim 2026)

Altı yazı için niyet ayrıştırma ve yeni giriş paragrafı değişiklikleri  dosyasına işlendi. Canlı sitedeki ()  çıktıları üzerinde  ile her  parçası aranmış ve hepsinin tam 1 kez geçtiği doğrulanmıştır.


## G8-5 Uygulama Durumu (3 Ekim 2026)

Altı yazı için niyet ayrıştırma ve yeni giriş paragrafı değişiklikleri  dosyasına işlendi. Canlı sitedeki  çıktıları üzerinde  ile her  parçası aranmış ve hepsinin tam 1 kez geçtiği doğrulanmıştır.


## G8-5 Uygulama Durumu (3 Ekim 2026)

Altı yazı için niyet ayrıştırma ve yeni giriş paragrafı değişiklikleri `docs/veri/ayristirma.json` dosyasına işlendi. Canlı sitedeki `curl` çıktıları üzerinde `grep -c -F` ile her `find` parçası aranmış ve hepsinin tam 1 kez geçtiği doğrulanmıştır.
