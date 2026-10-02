# G7 · Sayfa dönüşümleri, kanonik, blog düzeltme taslağı, ölü kod envanteri (2 Ekim gece)

Claude bu sırada transfer sistemini (araç × rota) yazıyor. **Transferle ilgili hiçbir dosyaya dokunma** (aşağıdaki yasak listesine bak). Bitince Claude her maddeyi kanıtlarıyla yeniden çalıştırıp kontrol edecek.

## 0. Kurallar (GOREVLER.md + G6'daki kuralların hepsi geçerli)

1. **Commit/push YOK.**
2. Yalnızca maddenin **Dosyalar** satırındaki dosyalar. Satır sınırı varsa başka satıra dokunma; `any` temizliği gibi "bu arada" düzeltmeler **yapma** (G6'da yapıldı, kural dışıydı).
3. Her maddeden sonra `npx tsc --noEmit` (boş) + değişen dosyalara `npx eslint` (0 hata).
4. Kanıtlar **localhost:3002**'de çalıştırılır, ama **içerik denetimleri canlı siteden** yapılır (`https://hadiumreyegidelim.com`). G6-15 yerel veritabanındaki 2 deneme yazısıyla yapıldığı için **reddedildi**; yerel veritabanı canlıyı temsil etmez.
5. TESLIM.md en üstüne tek "G7" kaydı: her madde için durum + kanıt komutu + çıktı, `git status --short`, `npx tsc --noEmit` çıktısı.
6. Metin kuralları: rakip adı, "TÜRSAB", "diyanetsiz", "en ucuz", "garanti", "sıfır", "7/24", "%… varan", "eşsiz", "VIP deneyim", "ayrıcalıklı", "lüks" yok. Gerçek bilgiler yalnızca: vize kişi başı 140 USD, belgeler tamamsa 2 iş saati; otel fiyatı 1 oda 1 gece, odada en fazla 4 kişi; uçak bileti satmıyoruz; Nusuk randevusu satmıyoruz. Marka: "Hadi Umreye Gidelim" (kesme işaretsiz).
7. Örnek alınacak sayfalar (Claude'un yazdıkları): `src/app/(main)/hizmetler/page.tsx`, `src/app/(main)/bireysel-umre/page.tsx`, `src/components/blog/BlogList.tsx`.

**Dokunma:** `src/middleware.ts`, `src/app/layout.tsx`, `src/lib/**` (okuyabilirsin), `src/app/api/**`, `prisma/**`, `src/components/planner/**`, `src/components/ui/kit/**`, `src/app/(main)/bireysel-umre/**`, `src/app/(main)/[slug]/page.tsx`, `src/app/(main)/hizmetler/**`, `src/app/(admin)/**`, `next.config.ts`, `src/app/sitemap.ts`, `.env*`.

Sıra: G7-1 → G7-7.

---

## G7-1 · Kendi kanoniği olmayan sayfalar

**Dosyalar:** `src/app/(main)/agustos-kampanyasi/page.tsx`, `src/app/(main)/rehber/[slug]/page.tsx`, `src/app/(main)/kesifler/hendek-turu/page.tsx`, `src/app/(main)/gizli-mucevher/kuba/page.tsx` (yalnızca metadata bölümü)

Senin `KANONIK-ENVANTER.md` listende 11 sayfa vardı; `/bireysel-umre/*` adım sayfaları artık 308 yönlendirme, onlar listeden çıktı. Kalan 4 sayfa için:
1. Önce canlıda durumunu ölç: `curl -s -o /dev/null -w "%{http_code}" https://hadiumreyegidelim.com<yol>`.
2. 200 dönüyor ve dizinde kalması gereken bir içerikse: `alternates: { canonical: "<kendi yolu>" }` ekle (`generateMetadata` ise dinamik yolla).
3. Eski kampanya (`/agustos-kampanyasi`) ya da örnek/deneme sayfasıysa (`/rehber/ornek-rehber` gibi): **kanonik ekleme**, `robots: { index: false, follow: true }` ekle ve TESLIM'e "neden noindex" yaz.

Kabul: her sayfa için `curl -s http://localhost:3002<yol> | grep -oE '<link rel="canonical"[^>]*>|<meta name="robots"[^>]*>'` çıktısı; hiçbirinde ana sayfa kanoniği kalmamalı.

## G7-2 · /kvkk, /gizlilik-politikasi, /kullanim-sartlari kit dönüşümü

**Dosyalar:** bu üç sayfanın `page.tsx` dosyaları, `docs/antigravity/goruntuler/G7-2-*`

- `PageHero` (kısa üst etiket "Yasal", tek H1) + metin `Section` içinde `max-w-screen-md` (dar okuma genişliği).
- **Hukuki metnin kendisine dokunma** (tek kelime değiştirme yok; yalnızca sarmalayan HTML/sınıflar). Önce/sonra `curl … | sed 's/<[^>]*>//g' | tr -s ' \n' | md5` karşılaştırması TESLIM'e: metin özeti aynı olmalı (başlık bölümü hariç farkı açıkla).
- Metadata aynen kalır.
- Ekran görüntüsü 1440 + 390, yatay taşma 0.

## G7-3 · /umre-vizesi/basvuru kit dönüşümü (form sayfası)

**Dosyalar:** `src/app/(main)/umre-vizesi/basvuru/page.tsx`, `docs/antigravity/goruntuler/G7-3-*`

- Form bileşeni (içe aktarılan istemci bileşeni) **değişmez**; yalnızca sayfa iskeleti `PageHero` + `aside` ya da `Section` olur.
- Metadata ve JSON-LD aynen; önce/sonra `grep -c "application/ld+json"` aynı.
- Form yerelde doldurulup **gönderilmez**; yalnızca alanların göründüğü ekran görüntüsü.
- Sayfadaki fiyat/süre bilgisi: 140 USD, 2 iş saati dışında rakam varsa TESLIM'e yaz, değiştirme.

## G7-4 · /gizli-mucevher/kuba ve /kesifler/hendek-turu kit dönüşümü

**Dosyalar:** bu iki sayfanın `page.tsx` dosyaları, `docs/antigravity/goruntuler/G7-4-*`

G6-9 yöntemi (işlev listesi → dönüşüm → aynı işlevler). Görseller `next/image`. Süslü/doğrulanamaz ifadeleri **kaldırma**, TESLIM'e liste olarak yaz (içerik kararı kullanıcıda).

## G7-5 · Blog yasaklı ifade düzeltme taslağı (yalnızca belge)

**Dosyalar:** yeni `docs/taslaklar/blog-duzeltmeleri.md`

`docs/taslaklar/blog-denetimi.md`'deki 15 yazı için, **canlı** sayfadan (`curl -s https://hadiumreyegidelim.com/blog/<slug>`):
- ifadenin geçtiği **tam cümle** (alıntı) ve önerilen yeni cümle;
- bağlam masumsa (ör. iPhone yazısında ürün garantisi) "değişmesin" yaz ve nedenini;
- "TÜRSAB" geçen her cümle için öneri (marka adı geçmeyecek);
- "Harem'e sıfır" türü konum iddiası yerine metre ya da "yürüme mesafesinde" (yalnızca yazıda metre yazıyorsa metre).

Tablo biçimi: yazı | eski cümle | yeni cümle | not. Veritabanına yazma; kullanıcı/Claude admin'den uygulayacak.

## G7-6 · Ölü kod envanteri (yalnızca belge)

**Dosyalar:** yeni `docs/antigravity/OLU-KOD.md`

`/bireysel-umre` yeni planlayıcıya geçti; il sayfaları da. Şunların **hâlâ bir yerden içe aktarılıp aktarılmadığını** `grep -rn` ile göster:
`src/components/features/BireyselUmreClient.tsx`, `src/components/layout/ConfiguratorSummary.tsx`, `src/app/api/flights/route.ts` (ve onu çağıran her yer), eski adım sayfalarının kullandığı context/store dosyaları (ör. `useUmrahStore`, `PlannerContext` vb. — adını koddan bul), `src/components/home/UmrePlanner.tsx` içindeki uçuş/takvim mantığı.

Tablo: dosya | kim içe aktarıyor (dosya:satır) | silinebilir mi (evet/hayır + neden). **Hiçbir şey silme.**

## G7-7 · Planlayıcı akış testi (yalnızca belge, canlı)

**Dosyalar:** yeni `docs/olcum/planlayici-testi-2026-10-02.md`, `docs/antigravity/goruntuler/G7-7-*`

Canlı `https://hadiumreyegidelim.com/bireysel-umre` üzerinde tarayıcıyla (formu **göndermeden**):
1. Takvimde giriş ve çıkış seç (2 tıklama) → adres çubuğundaki `giris`/`cikis` doğru mu.
2. 1, 4, 5, 8, 9 yetişkin için Mekke otelinde oda sayısı (1/1/2/2/3 olmalı) ve otel tutarı = gecelik × gece × oda mı (ekrandaki sayılarla hesap).
3. "Medine'ye gitmeyeceğim" → Medine gecesi 0, toplam gece Mekke'de mi; tekrar "Medine'de de kalmak istiyorum".
4. Bebek 1 → oda sayısı değişmiyor mu.
5. "Vizem var" → vize satırı özetten kalkıyor mu.
6. Mobil (390 px) aynı akış; yatay taşma 0.

Her adım: beklenen / görülen / ekran görüntüsü adı. Hata bulursan **düzeltme**, yalnızca yaz.
