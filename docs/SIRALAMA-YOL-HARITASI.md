# Google sıralama yol haritası

Hazırlanma: 1 Ekim 2026 (Claude Code). Kaynak: SEO Masası → Sıralar, 30 Eylül 17:54 kontrolü (22 kelime, Türkiye, mobil, ilk 50).
Uygulayan: Antigravity (kod ve içerik) + kullanıcı (Vercel, Search Console, iş kararları). Her adım `docs/CALISMA-KAYDI.md`'ye yazılır; bu belgedeki kutular işaretlenir.

## 1. Tablo ne söylüyor?

| Durum | Kelimeler | Sıralanan sayfa |
|---|---|---|
| İlk 10 (3) | bireysel umre fiyatları (5), umre fiyatları 2026 diyanet (7), 15 günlük umre fiyatları 2026 diyanet (8) | 2 blog yazısı |
| 11–50 (3) | umre fiyatları 2026 diyanet tl (26), 2026 umre fiyatları diyanet (23), diyanet umre fiyatları 2026 3 dönem (25) | 1 blog yazısı |
| İlk 50'de yok (16) | **bireysel umre**, bireysel umre nasıl yapılır, umre fiyatları 2026, 2026 umre fiyatları, **umre vizesi** ve 8 vize kelimesi, 3 diyanet varyasyonu | — |

Sonuçlar:
1. **Sıralanan her şey blog yazısı.** Ana satış sayfaları (`/bireysel-umre`, `/umre-vizesi`) hiçbir kelimede ilk 50'de değil; üstelik `/umre-vizesi` 2.000 kelimelik bir sayfa. İçerik varken sıralama yoksa önce **teknik/indeks sorunu** aranır.
2. **Teknik sorun doğrulandı (1 Ekim):** Canonical etiketleri ve sitemap `https://hadiumreyegidelim.com/...` (www'siz) gösteriyor; bu adres **307 (geçici)** ile `https://www.hadiumreyegidelim.com/...`'a yönleniyor. Google'a "asıl adres" diye gösterilen adres başka yere geçici yönleniyor: çelişkili sinyal, indekslemeyi ve sıralamayı bölüyor.
3. **Sıralayan içerik markanın aleyhine konumlanmış:** "Diyanet umre fiyatları" yazıları trafik alıyor ama okuru grup turuna bakmaya itiyor. Silinmeyecek (sıralamayı kaybederiz); bireysel umre lehine yeniden kurgulanacak.
4. **Yamyamlık:** Aynı "umre turları 2026 diyanet fiyat" konusunu işleyen 6 yazı var; Google hangisini göstereceğini seçemiyor, güç bölünüyor.
5. **Fiyat sayfası yok:** "umre fiyatları 2026" ve "10/15 günlük umre fiyatları" için hedef sayfa yok; paketlerde fiyat 0 girili.
6. **Vize kelimeleri** (9 kelime) vize acenteleri ve havayolu sayfalarına gidiyor: "kaç TL", "kaç günde çıkar", "nasıl alınır", "başvuru" sorularını doğrudan cevaplayan ve bizim vize hizmetimize bağlanan bir sayfa gerek.
7. **"bireysel umre"de ilk üç Facebook/Instagram:** rekabet düşük; güçlü, net bir sayfa + sosyal hesap bağlantıları kısa sürede ilk sayfaya taşıyabilir.
8. "veri az": kelime hacimleri henüz çekilmemiş; önceliği hacimle netleştir.

## 2. Hedef kelime → hedef sayfa (tek sayfa, tek niyet)

| Kelime kümesi | Hedef sayfa | Durum |
|---|---|---|
| bireysel umre, bireysel umre nasıl yapılır | `/bireysel-umre` | var, güçlendirilecek |
| bireysel umre fiyatları | `/bireysel-umre` + fiyat sayfası | şu an blog yazısı 5. sırada; yazı kalır, fiyat sayfasına bağlanır |
| umre fiyatları 2026, 2026 umre fiyatları, 10/15 günlük umre fiyatları 2026 | **yeni** `/umre-fiyatlari` | açılacak |
| umre fiyatları 2026 diyanet (ve 5 varyasyonu) | tek konsolide yazı: `/blog/2026-umre-turlari-diyanet-bireysel-fiyatlar-vip-ipuclari` (7. ve 8. sırada olan) | diğer 5 benzer yazı buna 301 |
| umre vizesi (ve 8 varyasyonu) | `/umre-vizesi` | var, yeniden yazılacak |

Kural: Bir kelime kümesini yalnızca bir sayfa hedefler. Diğer sayfalar o sayfaya bağlantı verir, aynı kelimeyi başlıkta hedeflemez.

## 3. Adımlar

### Faz A — Teknik temel (önce bu; hafta 1)
- [ ] **A1 · Tek ana adres (kullanıcı, Vercel)** — Vercel → `hadiumreyegidelim.com` projesi → Settings → Domains: **`hadiumreyegidelim.com` (www'siz) Primary**, `www.hadiumreyegidelim.com` → apex'e **308 (kalıcı)** yönlendirme. Kod zaten www'siz adresi canonical kullanıyor; tek değişiklik Vercel'de. (Yol haritası 0.2 ile aynı karar.)
  - Doğrula: `curl -sI https://www.hadiumreyegidelim.com/umre-vizesi` → `308` ve `location: https://hadiumreyegidelim.com/umre-vizesi`; `curl -sI https://hadiumreyegidelim.com/umre-vizesi` → `200`.
  - Diğer Vercel projesi (`hadiumreyegidelim`) alan adı almıyorsa sorun değil; alıyorsa kaldır.
- [ ] **A2 · Search Console (kullanıcı + Antigravity)** — Google Search Console'da `hadiumreyegidelim.com` alan adı mülkü (DNS doğrulaması). Sitemap: `https://hadiumreyegidelim.com/sitemap.xml` gönder. URL denetimi ile `/`, `/bireysel-umre`, `/umre-vizesi`, `/paketler` için "Dizine eklenmesini iste". Kapsam raporunda "Yönlendirmeli sayfa", "Canonical olmayan", "Keşfedildi, dizine eklenmedi" sayılarını `CALISMA-KAYDI.md`'ye yaz.
- [ ] **A3 · Kod kontrolü (Antigravity)** — A1'den sonra canlıda: bütün sayfalarda canonical = `https://hadiumreyegidelim.com<yol>`, sitemap ve `robots.txt` aynı host, `og:url` aynı host, iç linklerde mutlak `www.` adresi yok (`grep -rn "www.hadiumreyegidelim" src`). Yönlendirme zinciri yok (tek atlama).
- [ ] **A4 · Hacim** — SEO Masası → Kelimeler'de bu 22 kelimenin ve adaylarının arama hacmini çek; `CALISMA-KAYDI.md`'ye tablo olarak yaz. Faz B/C sırası hacme göre güncellenir.

### Faz B — Satış sayfaları (hafta 1–3)
- [ ] **B1 · `/umre-vizesi` yeniden yazımı** (Antigravity; önce kullanıcıdan **vize hizmet fiyatı** ve **ortalama çıkış süresi** alınır — bilinmeden rakam yazılmaz)
  - `<title>`: "Umre Vizesi 2026: Kaç TL, Kaç Günde Çıkar?" (≤60 ile şablon). H1 "Umre vizesi nasıl alınır?".
  - İlk paragraf (40–60 kelime): vize türü, bizim ücretimiz, süre, nasıl başvurulur.
  - Soru başlıkları (her biri ayrı H2, altında doğrudan cevap): "Umre vizesi kaç TL?" (bizim fiyatımız + neyi kapsadığı), "Umre vizesi kaç günde çıkar?", "Umre vizesi nasıl alınır?" (adım listesi), "Başvuru için hangi belgeler gerekir?", "Vize ne kadar geçerli?", "Vize reddedilirse ne olur?" (bildiğin kadarını; uydurma yok).
  - "Vizeni bize bırak" dönüşümü: WhatsApp + tasarlayıcı; `Service` + `Offer` (gerçek fiyat) + `FAQPage` şeması. Vize portalına dış link YOK.
  - Mevcut "Diyanet onayı gereksiz" bölümü markaya uygun kalabilir; "diyanetsiz" kelimesi yasak.
- [ ] **B2 · Yeni `/umre-fiyatlari` sayfası** (Antigravity; önce kullanıcı paketlere **gerçek fiyat** girer — admin → Paketler; fiyatı 0 olan paket gösterilmez)
  - Hedef: "umre fiyatları 2026", "2026 umre fiyatları", "10/15 günlük umre fiyatları 2026".
  - İçerik: güncel paket fiyat tablosu (Package tablosundan, sunucu tarafında; süre, dahil hizmetler, fiyat), süreye göre (7/10/15 gün) bölümler, fiyatı belirleyen kalemler (otel mesafesi, sezon, uçuş), "kendi planını yap" → `/bireysel-umre`. Güncelleme tarihi görünür; `ItemList` + her paket `Offer`.
  - Grup/Diyanet fiyatı ölçü alınmaz; "en ucuz" yok. `revalidatePublic("packages")` bu sayfayı da tazelesin (`src/lib/revalidate-public.ts`'e ekle).
  - Ana sayfa menüsüne eklemek kullanıcı onayı ister; en azından `/paketler`, `/bireysel-umre`, fiyat blog yazılarından bağlantı.
- [ ] **B3 · `/bireysel-umre` güçlendirme** (Antigravity; arayüz değişikliği önce lokalde kullanıcıya)
  - H1'de "Bireysel Umre" (şu an tasarlayıcı başlığı; `BireyselUmreClient` title). İlk ekranda tasarlayıcının üstünde 40–60 kelimelik net tanım.
  - "Bireysel umre nasıl yapılır?" adım adım (6–8 adım, `HowTo` şeması), "Bireysel umre fiyatları neye göre değişir?" (→ `/umre-fiyatlari`), mevcut SSS korunur.
  - Instagram/Facebook profillerine bağlantı ve `Organization.sameAs` (A5'le birlikte).

### Faz C — Sıralanan içeriği kazanca çevirme (hafta 2–4)
- [ ] **C1 · Konsolidasyon (yamyamlık)** — "umre turları 2026 / diyanet / fiyat" konulu yazıları listele (`/blog/umre-turlari-2026`, `…-bireysel-umre`, `…-hadi-umreye-gidelim`, `…-fiyat-karsilastirmalari-diyanet-bireysel-vip`, `…-bireysel-diyanet-fiyat-karsilastirma`, `2026-umre-turlari-diyanet-bireysel-fiyatlar-vip-ipuclari`). **Ana yazı:** en iyi sıralanan `2026-umre-turlari-diyanet-bireysel-fiyatlar-vip-ipuclari` (7. ve 8.). Diğerlerinin işe yarar bölümleri ana yazıya taşınır, sonra `next.config.ts` `redirects()` ile **301** (permanent) ana yazıya yönlendirilir ve yazılar yayından kaldırılır. `umre-turlari-2026-fiyat-karsilastirmalari-diyanet-bireysel-vip` (23–26. sıralar) da birleştirilir. Kullanıcıya liste gösterilip onay alınır.
- [ ] **C2 · Ana yazıyı bireysel umre lehine yeniden kurgula** — URL, başlıktaki ana kelime ("umre fiyatları 2026 diyanet") ve iyi sıralanan bölümler korunur (sıralama düşmesin). Değişen: çerçeve. "Diyanet mi bireysel mi" karşılaştırması tarafsız ama bireysel umrenin avantajlarıyla biter; Diyanet fiyatı yalnızca resmî kaynağa bağlantıyla anılır (rakam tekrar edilmez ya da güncel resmî duyuruya bağlanır), bizim fiyatımız `/umre-fiyatlari`'ndan; marka 2–3 kez; `/bireysel-umre` ve `/umre-fiyatlari` bağlantıları üstte. Değişiklikten sonra 2 hafta sıralamayı izle; düşerse değişiklikleri geri al.
- [ ] **C3 · "bireysel umre fiyatları" yazısı (5. sıra)** — `/blog/bireysel-umre-vize-maliyet-rehberi`: güncel tut, `/umre-fiyatlari` ve `/umre-vizesi`'ye üstte bağlantı ver, başlığa dokunma.

### Faz D — Otorite ve güven (sürekli)
- [ ] **D1 · Google İşletme Profili** (kullanıcı) — "Hadi Umreye Gidelim", kategori seyahat acentesi, gerçek adres/telefon, site bağlantısı `https://hadiumreyegidelim.com`. Yorum istemek için müşterilere bağlantı (gerçek yorumlar; sahte yorum yok).
- [ ] **D2 · Sosyal profiller** — "bireysel umre" aramasında Facebook/Instagram ilk üçte: kendi Instagram/Facebook hesaplarının biyografisinde site bağlantısı, gönderilerde `/bireysel-umre`; sitede `sameAs` (admin → Ayarlar → Sosyal Medya — sıfırlanan linkler yeniden girilmeli).
- [ ] **D3 · Bağlantı ve anılma** — AI Görünürlük → Kaynaklar'daki "kaynak fırsatları" (yol haritası 4.3): forum/soru-cevap yanıtları, yerel rehberler, cami/dernek duyuruları. Satın alınmış bağlantı yok.
- [ ] **D4 · Blog motoru** — yeni yazılar vize ve fiyat kümelerindeki cevapsız sorulara (ör. "umre vizesi kaç günde çıkar") yönlendirilir ve hedef sayfaya bağlanır; hedef sayfanın kelimesini başlıkta hedeflemez.

### Faz E — Ölçüm (her hafta)
- Haftalık otomatik ölçüm pazartesi sıra kontrolünü de yapıyor (AI Görünürlük paneli; tavan 2 $). Sonuçları her hafta `CALISMA-KAYDI.md`'ye tablo olarak ekle.
- Search Console: indekslenen sayfa sayısı, bu 22 kelimenin gösterim/tıklama/ortalama sırası.
- Bir değişikliğin etkisini en az 2 hafta bekle; aynı sayfada üst üste değişiklik yapma.

## 4. Hedefler (gerçekçi)

| Süre | Hedef |
|---|---|
| 2 hafta | Canonical/yönlendirme temiz; Search Console'da ana sayfalar "dizinde"; "yönlendirmeli sayfa" uyarısı yok |
| 4–6 hafta | `/umre-vizesi` ve `/bireysel-umre` en az 5 kelimede ilk 50'ye girer; "bireysel umre" ilk 20 |
| 8–12 hafta | "bireysel umre" ve "bireysel umre fiyatları" ilk 10; "umre fiyatları 2026" ilk 20; diyanet kümesinde ilk 10 korunur |

Sıralama garanti edilemez; hedefler yön göstermek içindir, her 2 haftada gerçek veriyle güncellenir.

## 5. Kullanıcıdan gereken kararlar/veriler

1. Vercel'de ana adres: www'siz `hadiumreyegidelim.com` (A1) — onay ve uygulama.
2. Search Console erişimi (A2).
3. Vize hizmet ücreti ve ortalama çıkış süresi (B1).
4. Paketlerin gerçek fiyatları (B2).
5. Konsolide edilecek yazılar listesinin onayı (C1).
6. Google İşletme Profili bilgileri ve sosyal hesap bağlantıları (D1, D2).

## 6. Değişmez kurallar (hatırlatma)

Yasaklı kelimeler (TÜRSAB, diyanetsiz); dış link yalnızca resmî bilgi sayfalarına ve konu kelimesine; sattığımız hizmetler dışarı linklenmez; rakip adı yok; uydurma fiyat/puan/istatistik yok; grup/Diyanet fiyatı ölçü alınmaz; büyük arayüz değişikliği önce lokalde kullanıcıya; her iş `CALISMA-KAYDI.md`'ye.
