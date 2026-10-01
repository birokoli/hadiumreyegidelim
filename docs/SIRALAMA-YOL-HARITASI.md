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
2. **Teknik sorun doğrulandı (1 Ekim):** Canonical etiketleri ve sitemap `https://hadiumreyegidelim.com/...` (www'siz) gösteriyor; bu adres **307 (geçici)** ile `https://hadiumreyegidelim.com/...`'a yönleniyor. Google'a "asıl adres" diye gösterilen adres başka yere geçici yönleniyor: çelişkili sinyal, indekslemeyi ve sıralamayı bölüyor.
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
- [x] **A1 · Tek ana adres — kodla çözüldü (1 Ekim, Claude Code)** — Kullanıcı kararı: Vercel'de www kaldırılmayacak. Bu yüzden asıl adres **`https://hadiumreyegidelim.com`** yapıldı: `src/lib/seo/site.ts` → `SITE_URL` (tek kaynak). Canonical, sitemap, robots, llms.txt, JSON-LD, og:url bu adresi gösterir; gösterilen adres doğrudan 200 döner, çelişki kalmadı. `SITE_DOMAIN` www'siz kalır (sıra takibinde karşılaştırma için).
  - İsteğe bağlı iyileştirme (kullanıcı, Vercel): www'siz adresin www'ye yönlenmesi şu an **307 (geçici)**. Vercel → Domains → `hadiumreyegidelim.com` → Edit → yönlendirme kodunu **308 (kalıcı)** seçmek yeterli; www silinmez.
  - Yeni kodda adres yazma; her zaman `SITE_URL` kullan.
- [ ] **A2 · Search Console (kullanıcı + Antigravity)** — Google Search Console'da `hadiumreyegidelim.com` alan adı mülkü (DNS doğrulaması). Mülk `https://hadiumreyegidelim.com` (ya da alan adı mülkü) olmalı; sitemap `https://hadiumreyegidelim.com/sitemap.xml` olarak **yeniden gönderilir** (adresler www'ye döndü). URL denetimi ile `/`, `/bireysel-umre`, `/umre-vizesi`, `/paketler` için "Dizine eklenmesini iste". Kapsam raporunda "Yönlendirmeli sayfa", "Canonical olmayan", "Keşfedildi, dizine eklenmedi" sayılarını `CALISMA-KAYDI.md`'ye yaz.
- [ ] **A3 · Kod kontrolü (Antigravity)** — canlıda: bütün sayfalarda canonical = `https://hadiumreyegidelim.com<yol>`, sitemap ve `robots.txt` aynı host, `og:url` aynı host, kodda elle yazılmış adres yok (`grep -rn "https://hadiumreyegidelim.com" src` yalnızca site.ts). Yönlendirme zinciri yok (tek atlama).
- [ ] **A4 · Hacim** — SEO Masası → Kelimeler'de bu 22 kelimenin ve adaylarının arama hacmini çek; `CALISMA-KAYDI.md`'ye tablo olarak yaz. Faz B/C sırası hacme göre güncellenir.

### Faz B — Satış sayfaları (hafta 1–3)
- [ ] **B1 · `/umre-vizesi` yeniden yazımı** — *(1 Ekim: başvuru sayfası `/umre-vizesi/basvuru` açıldı; "umre vizesi başvuru/başvurusu" kelimelerinin hedefi bu sayfa. Ücret ve süre kullanıcıdan gelince hem rehbere hem başvuru sayfasına eklenecek.)* (Antigravity; önce kullanıcıdan **vize hizmet fiyatı** ve **ortalama çıkış süresi** alınır — bilinmeden rakam yazılmaz)
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

### Faz H — Hız ve 1 Ekim raporu bulguları (ayrıntı: `docs/SITE-RAPORU-2026-10-01.md`)
Kim: **C** Claude Code, **A** Antigravity, **S** kullanıcı. Görünümü değiştiren işler (H1, H3) önce lokalde kullanıcıya gösterilir.

**İş bölümü (1 Ekim, paralel çalışma):** Claude: H1–H10 (H6 blog yazı gövdesinde bağlantı düzeltmesi kodla, bütün yazılar için). Antigravity: H11 taslağı, H14, C1 birleştirme listesi ve taslağı, hacim tablosu. **Dosya sınırı:** Antigravity yalnızca `src/app/(main)/rehberlik/page.tsx`, `docs/taslaklar/*`, `docs/CALISMA-KAYDI.md` ve bu dosyadaki kendi maddelerinin kutucuklarına dokunur. Diğer her dosya o sırada Claude'da.

**Hemen (kod)**
- [x] **H1 · Ana sayfa videosu (C, S)** — 20,8 MB mp4 `preload="auto"` ile iniyor. Mobilde oynatma yok ya da `preload="none"`, kapak görseli kalsın; video 720p ~2–3 MB'a sıkıştırılsın (dosya S'den); admin'de video yüklerken boyut uyarısı. *(1 Ekim, 2302504: mobilde video yok, masaüstünde yüklemeden sonra; kullanıcı onayı)*
- [x] **H2 · Video kapağı (C)** — `lh3.googleusercontent.com/aida-public/…` geçici adres (357 KB, 1 gün önbellek) yerine kalıcı, küçültülmüş görsel. *(videonun ilk karesi `public/images/hero-kabe.jpg`)*
- [x] **H3 · Kampanya ve /paketler görselleri (C)** — Unsplash `w=2600` → 1200; ana sayfa kampanya kartı, `/paketler` üst görseli ve paket kartları `next/image` ile.
- [x] **H4 · Blog içerik görselleri (C)** — veritabanı HTML'indeki `<img>`'lere genişlik/yükseklik, ilk görsel hariç `loading="lazy"`, küçültme servisi. Hedef: vize yazısı mobil 57 → 85+. *(1 Ekim, acda0a4: vize yazısı mobil 57→92, LCP 14,9→2,8 sn, 6,3→2,2 MB)*
- [x] **H5 · 404 blog adreslerine 301 (C)** — `mekke-medine-bebek-mamasi-bezi-temini-kolay-mi-2026` → `bebekle-umre-kolay-mi-2026-kurallar-ve-ipuclari`; `umre-turlari-2026-bireysel-umre` ve `2026-umre-turlari-hadi-umreye-gidelim-manevi-yenilenme` → `2026-umre-turlari-diyanet-bireysel-fiyatlar-vip-ipuclari`; `ayak-tabanlarinin-su-toplamamasi-…` → en yakın yazı. *(1 Ekim, acda0a4)*
- [x] **H6 · Vize yazısında kırık bağlantı (C/A)** — iki `href="visa.visitsaudi.com"` (https yok, biri metinsiz). *(1 Ekim, acda0a4: https'siz bağlantılar kodla düzeltiliyor, vize bağlantısı /umre-vizesi'ye; tüm yazılar için)*
- [x] **H7 · Doğrulanamayan vaatler (C)** — ana sayfa açıklaması "En ucuz fiyatlar", tasarlayıcı açıklaması "en ucuz … sıfır lüks"; yeni doğrulanabilir metin.
- [x] **H8 · Erişilebilirlik (C)** — ana sayfada `<main>`; `UmrahSteps` sekme rolleri; `text-primary/60` küçük etiketlerde kontrast; blog ve şehir sayfalarında başlık sırası.
- [x] **H9 · İkon yazı tipi (C)** — Google Material Symbols 343 KB, oluşturmayı engelliyor → kullanılan ikonlarla alt küme ya da SVG. *(1 Ekim, acda0a4: 343 → 11 KB, `public/fonts/icons/ICONS.txt`; yeni ikon eklenirse alt küme yeniden üretilir)*
- [x] **H10 · Logo (C)** — 110 KB PNG → WebP/SVG. *(1 Ekim, acda0a4: sekme simgesi 2–9 KB)*

**Kısa vade (içerik)**
- [ ] **H11 · Vize yazısı yenileme (A, S rakamlar)** — `/blog/bireysel-umre-vizesi-nasil-alinir`: 1.899 gösterim, sıra 9,9, TO %1,7. Başlık "Nusuk Vize Başvurusu 2026: Umre Vizesi Nasıl Alınır?"; süre/ücret sorularına doğrudan cevap; başta `/umre-vizesi/basvuru` bağlantısı. *(taslak hazır: `docs/taslaklar/vize-yazisi.md` + Claude notları; süre/ücret ve uygulama bekliyor)*
- [ ] **H12 · Paket fiyatları (S)** — B2 ve H13'ün ön koşulu.
- [ ] **H13 · Şehir sayfası başlıkları (C)** — fiyatlar gelince "{İl} Umre Fiyatları 2026: {İl} Çıkışlı Bireysel Umre" + gerçek "başlayan fiyat" kutusu. Önce 10 il (Denizli, Samsun, Kütahya, Tokat, Kırıkkale, Amasya, Diyarbakır, Antalya, Mersin, İstanbul), 2 hafta izle.
- [x] **H14 · /rehberlik başlığı (A)** — "Umre Rehberliği: Mekke ve Medine'de Türkçe Rehber" (274 gösterim, 0 tık). *(Claude: başlık site adıyla 71 karakterdi → "Umre Rehberliği: Mekke ve Medine", 55)*
- [ ] **H15 · Kararlar (S)** — "Kutlu Rota" paket adı başka bir firma adıyla karışıyor (114 gösterim); "iPhone 18 Pro" yazısı konu dışı.
- [ ] **H16 · Tekrar ölçüm (A)** — H1–H10 bitince ve 2 hafta sonra Search Console + PageSpeed yeniden; sonuç CALISMA-KAYDI.md'ye.

## 4. Hedefler (gerçekçi)

| Süre | Hedef |
|---|---|
| 2 hafta | Canonical/yönlendirme temiz; Search Console'da ana sayfalar "dizinde"; "yönlendirmeli sayfa" uyarısı yok |
| 4–6 hafta | `/umre-vizesi` ve `/bireysel-umre` en az 5 kelimede ilk 50'ye girer; "bireysel umre" ilk 20 |
| 8–12 hafta | "bireysel umre" ve "bireysel umre fiyatları" ilk 10; "umre fiyatları 2026" ilk 20; diyanet kümesinde ilk 10 korunur |

Sıralama garanti edilemez; hedefler yön göstermek içindir, her 2 haftada gerçek veriyle güncellenir.

## 5. Kullanıcıdan gereken kararlar/veriler

1. ~~Vercel'de ana adres~~ — kodla çözüldü (www asıl adres). İsteğe bağlı: Vercel'de 307 → 308.
2. Search Console erişimi (A2).
3. Vize hizmet ücreti ve ortalama çıkış süresi (B1).
4. Paketlerin gerçek fiyatları (B2).
5. Konsolide edilecek yazılar listesinin onayı (C1).
6. Google İşletme Profili bilgileri ve sosyal hesap bağlantıları (D1, D2).

## 6. Değişmez kurallar (hatırlatma)

Yasaklı kelimeler (TÜRSAB, diyanetsiz); dış link yalnızca resmî bilgi sayfalarına ve konu kelimesine; sattığımız hizmetler dışarı linklenmez; rakip adı yok; uydurma fiyat/puan/istatistik yok; grup/Diyanet fiyatı ölçü alınmaz; büyük arayüz değişikliği önce lokalde kullanıcıya; her iş `CALISMA-KAYDI.md`'ye.
