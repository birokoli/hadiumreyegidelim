# Kaynak belge — hadiumreyegidelim.com (6 Ekim 2026)

Bu belge, 3–6 Ekim 2026 oturumunda konuşulan, kararlaştırılan ve canlıya alınan her şeyin tek kaynağıdır. Claude Code ve Antigravity yeni bir işe başlamadan önce bunu okur. Eski belgelerle çelişirse **bu belge geçerlidir**; ayrıntı için ilgili dosyaya bakılır.

Okuma sırası: bu belge → `AGENTS.md` → `docs/ANTIGRAVITY-DEVIR.md` (genel kurallar, 30 Eylül) → ilgili G paketi.

---

## 1. Çalışma düzeni

| Kim | Ne yapar |
|---|---|
| **Claude Code** | Kontrol, düzeltme, mimari, canlıya alma (commit + push). Antigravity teslimlerini satır satır doğrular. |
| **Antigravity** | Toplu, mekanik iş. Görevler `docs/antigravity/G*.md` paketleri hâlinde verilir. **Commit/push yapmaz.** Teslim raporunu `docs/antigravity/TESLIM.md`'ye yazar. |
| **Kullanıcı** | Hesap/şifre gerektiren işler, dış başvurular, karar ve onay. |

Antigravity'nin tekrarlayan hataları (her teslimde kontrol et): uydurma/örnek veri, doğrulanmamış iddia, eksik envanter (ör. G17'de 26 yazı varken "2 yazı var" dedi), kaynak göstermeden "platform listesi".

## 2. Değişmez kurallar

- **Sır yok:** anahtar, şifre, token koda, belgeye, sohbete, loga yazılmaz. `.env` okunmaz/kopyalanmaz. Anahtarları kullanıcı Vercel'e kendisi ekler; kullanıcıdan token istenmez.
- **Veritabanı:** canlı şemada yalnızca eklemeli değişiklik, `ensure…()` fonksiyonlarıyla (`CREATE TABLE IF NOT EXISTS`) ve **kullanıcı onayıyla**. `prisma db push` yalnızca yerelde. Canlı veri düzeltmeleri `src/lib/catalog/data-fixes.ts` zinciriyle (Setting bayrağıyla bir kez çalışır; şu an A–K, önbellek anahtarı `catalog-v10`).
- **Yasaklı ifadeler:** TÜRSAB, diyanetsiz, Harem'e sıfır, 7/24, kesintisiz, lüks/VIP/eşsiz, garanti, kapıda vize, Schengen. Rakip firma adı ve linki yok (hiçbir sayfada rakibe dış link yok; 6 Ekim'de kontrol edildi).
- **Satılmayanlar:** Nusuk ve uçak bileti satılmaz. Araç kiralama yok. "Apart" yok, yalnızca "otel".
- **Uydurma yok:** fiyat, puan, yorum, istatistik, müşteri hikâyesi uydurulmaz.
- **Kurumsal bilgi (MBD/DTCM):** sitede ölçülü; yalnızca güven sayfasında açık.
- **Büyük görsel değişiklik** önce yerelde gösterilir, "canlıya al" onayıyla push. Küçük düzeltme doğrudan push.
- **Commit sonu:** `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
- **Yerel test:** önizleme sunucusu `hadi-seo-dev` (port 3002), yerel DB 127.0.0.1:5432. Test admin bilgisi `scripts/local/.test-admin.json`; yalnızca localhost'ta kullanılır, sohbete yazılmaz. Sunucu eski kodu gösterirse yeniden başlatılır.

## 3. Teknik notlar (Next.js 16)

- `params` bir Promise'tir.
- Dinamik rotada ISR için `export async function generateStaticParams(){ return [] }` şarttır; yoksa sayfa her istekte üretilir (1.6–4.3 sn → 0.4 sn düzeldi).
- Önbellek: `unstable_cache` + `revalidateTag(tag, { expire: 0 })`. Site ayarları 600 sn.
- next/og görsellerinde yerel TTF (Poppins); ★ ✓ gibi glifler yok → SVG data URI. Görsel rotası için `outputFileTracingIncludes` (`next.config.ts`).

## 4. Canlıdaki sistemler

### 4.1 Ana sayfa v2
- Renkler (Pantone): Brilliant White 11-4001 `#edf1fe`, 7687C `#1d428a`, 2127C `#b8c9e3`, 6234C `#f2dda6`. Renkli alan sayfanın %10–17,5'i; zemin beyaz.
- Yazı: Cairo (gövde) + Noto Serif italik (`<em>` vurgu) + Aref Ruqaa (hat dokunuşu). `src/components/home/{fonts.ts,Accent.tsx,NiyetBand.tsx}`, CSS `.home-v2` (`globals.css`).
- `Accent`: `*kelime*` → vurgulu; yıldız yoksa son kelime vurgulanır.
- Hero metni HERO_DESC_V2 (data-fix J).

### 4.2 Marka ikon seti
- 32 ikon, `public/ikon/<ad>.svg`, `<HugIcon name="…" size={…} />` (`src/components/icons/HugIcon.tsx`). CSS mask ile yazı rengini alır.
- Kaynak: Recraft V4.1 Pro Vector → Claude tek renge çevirdi, çizgi kalınlığını eşitledi (1024 px'te ~40 px; resvg → mesafe dönüşümü → potrace). Yeni ikon eklenirse aynı işlem uygulanır.
- Galeri: `/kit/ikonlar` (noindex). "Doğrulanmış müşteri" rozeti `guven` ikonunu kullanır.
- Davut yıldızı içeren bir Recraft çıktısı reddedildi; dini sembol içeren çıktılar tek tek kontrol edilir.

### 4.3 Yardım merkezi
- `/sss`, `/iletisim`, `/grup-talepleri`, `/isletme-kaydi` ve güven sayfası `/hadi-umreye-gidelim-guvenilir-mi`.
- E-posta: info@hadiumreyegidelim.com. Konu başlıkları "Aile ve Grup", "Oteller"; vize danışmanlığı, belgeler/politikalar ve araç kiralama yok.
- Metinler admin'den düzenlenir (page-texts kayıt defteri: sss, grup-talepleri, isletme-kaydi, iletisim, yorumlar, oteller, guvenilir). Admin → Yardım Merkezi.
- `/api/contact`: konu, e-posta, bal küpü (honeypot), talep numarası.

### 4.4 Yorumlar
- Review tablosu (onay: 4 Ekim). Müşteriye kişiye özel bağlantı (`/yorum/[token]`) + admin'den elle ekleme. Tümü "Doğrulanmış müşteri" etiketi taşır (elle eklerken onay kutusu zorunlu).
- `/yorumlar` sayfası ve ana sayfa bölümü.
- Story/gönderi PNG üretici: `/api/admin/reviews/[id]/image` — widget kartı, "Sizden gelenler" başlığı, story güvenli alanları (üst 250, alt 300 px), logo 160 px, "WhatsApp'tan yazın".

### 4.5 Oteller
- `/oteller` (kartlar) ve `/oteller/[slug]`. Uzun açıklamalar `src/lib/catalog/hotel-texts.ts` (Setting HOTEL_LONG_DESCRIPTIONS + `src/lib/content-fixes/otel-aciklamalari.json`). Admin → Hizmet Kütüphanesi.
- Açık: Anjum, Sheraton, Le Méridien yıldız sayıları kullanıcı tarafından düzeltilecek.

- **Fiyatsız otel rehberi (7 Ekim):** Mekke'deki bütün oteller satılıyor; anlaşmalılar katalogda (fiyatlı), diğerleri MBD'nin Paximum hesabından (fiyat gösterilmez, API yok; MBD adına talep edilemez). Veri `src/content/hotels/mekke-rehber.json`, kod `src/lib/catalog/hotel-directory.ts` + `src/components/hotels/DirectoryHotelPage.tsx`. Sayfa: konum (OSM), bölge, Kâbe'ye kuş uçuşu, harita, "Bu otelin fiyatını sorun" (WhatsApp hazır mesaj), yakındaki oteller. **Açıklaması olmayan otel canlıda görünmez** (yerelde görünür). Bölgeler: Ajyad, Cebel Ömer, Cerval, Mescid-i Cin, Mahbes, Nüzha (+ Misfele). İçerik G18'den gelir, Claude kontrol eder. Liste: `docs/veri/mekke-otelleri-paximum.md`.

### 4.6 Blog
- 8 kategori (`src/lib/geo-blog/categories.ts`), motor yeni yazıya kategori atar.
- Birleştirilen Diyanet yazıları `next.config.ts`'de yönlendirildi.
- Öne alınan 5 konu (BLOG_TOPIC_PIN, data-fix K), taslak olarak üretilir, kullanıcı onayıyla yayınlanır:
  1. Umre kaç gün olmalı? 7, 10, 14 ve 15 günlük programların farkı
  2. Mahremsiz umre: kadınlar tek başına umreye gidebilir mi? 2026 kuralları
  3. Umre için gerekli belgeler listesi 2026
  4. Diyanet umre kaydı 2026 nasıl yapılır? Bireysel umreden farkı
  5. Umre firması seçerken nelere bakılmalı? Kontrol listesi
- Sömestr umresi sayfası MEB tarihleriyle: 25 Ocak – 5 Şubat 2027.
- `/paketler` başlığı "Umre Fiyatları 2026 ve Umre Paketleri"; sabit tek fiyat yok, fiyat yalnızca paketlerden.

### 4.7 SEO Masası ve AI görünürlük
- SEO Masası → "08 Açıklar" (`/admin/seo/aciklar`): bizim ve rakiplerin link veren alan adları, link açığı (SEO araç siteleri ve spam ≥ 40 elenir), anahtar kelime açığı. DataForSEO 40106 (kısmi sonuç) hatası kabul edilir.
- **Gerçek durum:** görünen 16 backlink'in hepsi PBN/spam; gerçek link 0.
- AI cevaplarında (92 cevap) yalnızca 4 kez geçiyoruz. En çok atıf alan sayfalar "en iyi umre tur şirketleri" listeleri (sefernur 51, oteltavsiyeleri 34, inanctur 24, umredunyasi 13). Şikayetvar ve Ekşi de kaynak. Ayrıntı: `docs/taslaklar/icerik-acigi-ai.md`.
- AI cevapları eski /bireysel-umre metnini (kapıda vize, VIP) alıntılıyor → GSC'den yeniden dizinleme gerekli.
- 5 yeni AI ölçüm sorusu eklendi ("fark" etiketi, data-fix J).

### 4.8 Admin paneli
- Menü 10 satır, gruplar açılır-kapanır (localStorage), en uzun eşleşme kuralıyla tek aktif öğe (`AdminSidebar.tsx`).
- Sekmeli merkezler (`HubTabs.tsx`), "Bugün" iş listesi (`TodayPanel.tsx`).
- Excel Fiyat Motoru menüden kaldırıldı (kod duruyor).

### 4.9 Influencer aday sistemi
- Admin → Influencer Adayları (`/admin/influencer-adaylari`). Kod: `src/lib/influencer/{schema,meta,score,research,prospects}.ts`, API `/api/admin/influencer-prospects`, günlük yenileme cron'u 04:30.
- **Hedef:** 10–50 bin takipçili mikro influencer; dindar/muhafazakâr kitle (tesettür, aile, helal seyahat, umre vlog). Acente, kurum, dernek, haber sayfası, klasik hoca hesabı değil.
- Instagram verisi Meta Business Discovery ile gerçek sayılardan gelir (IG iş hesabı 17841438462611612; token Vercel'de META_ACCESS_TOKEN). Claude yalnızca kullanıcı adı önerir, sayılarına güvenilmez.
- Puanlama: hesap türü Claude'la belirlenir; influencer değilse, 10 binin altıysa, 60 binin üstüyse veya pasifse puan tavanlanır.
- Keşif modları (AI / Google), "Benzerlerini bul" (etiketlenen hesaplardan kartopu; 3'ten az sonuçta Claude araştırması), "Listeyi temizle", "Yeniden puanla".
- Hazır mesaj: ana metin `dm.ts`'deki kurumsal e-posta şablonu (varsayılan) ve değişmez. "Hesabı incele ve doldur" biyografi + son 12 paylaşımı okur; Claude yalnızca `{hitap}` (ilk ad + Hanım/Bey, soyadı ve baş harf yok), `{gozlem}` (tek sade cümle, mecaz yok) ve `{nedenSiz}` cümlesini yazar; davet dili "takipçilerinizin umresine birlikte vesile olmak" çerçevesindedir, uyarı notu verir; biyografideki e-posta gösterilir. `{indirim}` ve `{komisyon}` sayfadaki alanlardan, `{davet}` bağlantı oluşturulunca dolar.
- Davet bağlantısı: `https://marketing.hadiumreyegidelim.com/influencer/apply?davet=…`
- Mesaj şablonları: `src/app/(admin)/admin/influencer-adaylari/dm.ts`.

### 4.10 Affiliate programı (kodda olan kurallar)
Kaynak: `src/lib/affiliate.ts`, `prisma/schema.prisma` → ProgramConfig. Değerler admin'den değiştirilebilir; aşağıdakiler varsayılanlardır.
- Komisyon satış tutarının **%3–7**'si; oran her ay performans skoruna göre (dönüşüm %40, satış adedi %40, tıklama oranı %20) bir sonraki aya uygulanır. Başlangıç %3.
- **Program açılış eşiği: 20 geçerli satış.** Eşiğe ulaşılınca o ana kadarki satışların komisyonu topluca yatar; ulaşılmazsa ödeme yok. Davet ettiği her influencer ilk satışını yapınca eşik 3 düşer (en az 5).
- Komisyon "yıldız" olarak birikir (1 yıldız = 0,10 TL). Yıldızlar nakit, ücretsiz/kısmi umre, hediye veya müşteri indirimi olarak kullanılır.
- Takipçiye özel kupon (yüzde ya da sabit TL indirim) tanımlanabilir.
- **Açık karar (6 Ekim):** 20 satış eşiği mikro influencer için çok yüksek; bkz. bölüm 6.

## 5. Antigravity paketleri

| Paket | Konu | Durum |
|---|---|---|
| G12 | Influencer admin | Teslim, sahte veriler temizlenip canlıya alındı |
| G13 | SEO link / otel | Teslim; MEB tarihi ve otel adı eşleşmesi düzeltildi |
| G14 | Yardım merkezi admin | Teslim, canlıda |
| G15 | Admin merkezleri | Teslim; çift aktif menü düzeltildi |
| G16 | İkon geçişi | Teslim; profil ikonu geri alındı, hızlı link ikonları büyütüldü |
| G17 | İçerik açığı (AI) | **Reddedildi** (yanlış envanter, rakip URL yok, uydurma platform). Claude yeniden yazdı: `docs/taslaklar/icerik-acigi-ai.md` |

Yeni paket yazılırken: kapsam, dokunulacak dosyalar, kabul ölçütleri, yasaklar ve "uydurma veri yok, kaynak göster" maddesi zorunlu.

## 6. Açık işler

### Kullanıcının yapacakları
- GSC → "Dizine eklenmesini iste": `/`, `/bireysel-umre`, `/umre-vizesi`, `/paketler`, güven sayfası.
- Listelenme talebi: oteltavsiyeleri.com, umredunyasi.com, eniyioneri.org.
- Şikayetvar marka sayfası; Google İşletme Profili; dizin kayıtları (`link-is-listesi.md`).
- Eski müşteri yorumlarını elle ekleme.
- SSS'deki ödeme/iptal cevaplarını kontrol.
- Otel yıldız düzeltmeleri (Anjum, Sheraton, Le Méridien).
- Influencer: canlıda temizle / benzerlerini bul / mesaj yaz testi ve ekran görüntüsü. Kartopu yetmezse ücretli veri sağlayıcı kararı (Modash / Influencers.club).
- **Affiliate eşiği kararı:** 20 satış eşiği kalsın mı, düşürülsün mü / ilk satıştan itibaren komisyon mu?

### Claude'un sırasındakiler (onay bekleyen)
- Siyer kümesi (blog motoru).
- `public/_ikon-onizleme` geçici klasörünün silinmesi (commit'lenmedi).
- İsteğe bağlı: say/kabe ikonlarının yeniden üretimi; 52 eski admin lint hatası (Antigravity paketi olabilir).

## 7. Değişiklik günlüğü (bu belge)
- 6 Ekim 2026 — ilk sürüm (Claude Code).
