# Programatik sayfa grupları (adım 3.2) — Antigravity için uygulama kılavuzu

Son güncelleme: 30 Eylül 2026 (Claude Code). **Altyapı hazır; yalnızca içerik dosyaları yazılacak.** Bu belgedeki kurallar esnetilemez. Belirsiz bir durumda kullanıcıya sor, tahmin etme.

## 0. Hazır olan altyapı (dokunma, yalnızca kullan)

| Parça | Dosya | Ne yapar |
|---|---|---|
| İçerik tipi | `src/content/pages/types.ts` | `ContentPage` alanları ve grup → adres kuralı |
| Kayıt | `src/content/pages/index.ts` | Bütün sayfalar `CONTENT_PAGES` listesinde |
| **Örnek sayfa** | `src/content/pages/ihram-nedir.ts` | Yapı, uzunluk, ton, link kullanımı için **altın standart** |
| Denetim | `src/content/pages/validate.ts` + `scripts/check-content-pages.mts` | Kuralları otomatik kontrol eder; **0 hata olmadan commit yok** |
| Şablon | `src/components/content/ContentPageView.tsx` | Sayfayı çizer: H1, giriş, bölümler, marka kutuları, SSS, resmî kaynak, ilgili sayfalar, JSON-LD (Article, FAQPage, BreadcrumbList, sözlükte DefinedTerm), "Son güncelleme" |
| Adresler | `src/app/(main)/umre-rehberi/[slug]/page.tsx` (sözlük, karşılaştırma) · `src/app/(main)/[slug]/page.tsx` (kişi, zaman — kök adres) | `generateStaticParams` kayıttan üretir |
| Merkez sayfa | `/umre-rehberi` | Bütün rehber sayfalarını gruplu listeler |
| Keşfedilme | `src/app/sitemap.ts`, `src/app/llms.txt/route.ts` | Kayda eklenen her sayfa otomatik girer |
| SEO Masası | `src/lib/seo/programmatic.ts` | Programatik sekmesinde "sayfa var" durumunu bu adreslerle gösterir |

**Ana sayfaya hiçbir şey eklenmez.** Sayfalar Google'a sitemap, `/umre-rehberi` merkezi, `llms.txt` ve sayfalar arası "İlgili sayfalar" bağlantılarıyla ulaşır. Ana sayfa düzeni, menü ve footer değişmez.

## 1. Yeni sayfa ekleme (her sayfa için aynı 5 adım)

1. `src/content/pages/<slug>.ts` dosyasını `ihram-nedir.ts`'i kopyalayarak oluştur.
2. `src/content/pages/index.ts` içinde import et, `CONTENT_PAGES` listesine ekle.
3. `npx tsx scripts/check-content-pages.mts` → **0 hata**.
4. `npx tsc --noEmit -p .` temiz.
5. Lokal sunucuda sayfayı aç, kontrol listesini (bölüm 6) uygula.

## 2. Keskin içerik kuralları

**Yapı (denetim zorunlu kılar):**
- `title` + " | Hadi Umre'ye Gidelim" ≤ 60 karakter; hedef kelime başta.
- `description` 120–158 karakter; cevabı ve bir somut bilgiyi içerir.
- `lead` 40–60 kelime; sorunun **doğrudan cevabı**, tek başına anlaşılır, "bu/o" ile başlamaz.
- En az 4 bölüm; en az 2 H2 soru biçiminde ("…?"). Paragraf başına 40–120 kelime; her paragraf kendi başına alıntılanabilir.
- Toplam en az 700 kelime (tablolar ve SSS dahil). Doldurma cümlesi yazma; bilgi yoksa bölüm açma.
- SSS 3–6 soru; cevaplar 2–3 cümle ve metinle çelişmez.
- En az 1 resmî kaynak; 3–6 iç bağlantı; `/bireysel-umre` bağlantısı zorunlu.
- Marka "Hadi Umreye Gidelim" en az 1, en fazla 3 kez doğal biçimde geçer.

**Doğruluk:**
- **Uydurma veri yok.** İstatistik, fiyat, tarih, kişi, müşteri hikâyesi, yorum uydurma. Doğrulayamadığın rakamı yazma.
- **Fiyat:** yalnızca yayındaki `Package` kayıtlarından (admin → Paketler) ve fiyatı 0'dan büyükse. Yoksa "güncel teklif için tasarlayıcı/WhatsApp" de.
- **Dinî hükümler:** yalnızca genel kabul görmüş temel bilgiler (örnek sayfadaki gibi). Görüş ayrılığı ya da fetva gerektiren konuda "resmî dinî bilgilere ya da rehberinize danışın" deyip `diyanet.gov.tr`'ye konu kelimesiyle bağlantı ver. "Diyanet'e göre" gibi atıf cümlesi kurma.
- **Hicri tarihler** (Ramazan vb.): "yaklaşık; hilalin görülmesine göre kesinleşir" diye yaz.
- Sağlık ve giriş şartları için `moh.gov.sa` gibi resmî sayfaya bağlantı ver, şart uydurma.

**Satış ve marka (kullanıcı kararı):**
- Hadi Umreye Gidelim bireysel umre uzmanıdır. Sayfa okuru bireysel umreye ve tasarlayıcıya yönlendirir.
- Grup, kafile ya da Diyanet turu fiyatları ölçü alınmaz. "Grup turu daha ucuz/uygun" gibi cümle yok. Karşılaştırmada bireysel umrenin avantajları dürüstçe öne çıkar (takvim, otel seçimi, kalabalıksız program, aileye özel plan); karşı tarafa haksızlık da yapılmaz.
- "En ucuz", "garanti", "%… varan", "eşsiz", "misafirlerimiz", "son derece", "sonuç olarak" yok (denetim yakalar).

**Bağlantılar:**
- Metin içinde `[görünen metin](/ic-sayfa)` ya da `[konu kelimesi](https://resmi-kurum…)`.
- Dış bağlantı yalnızca `diyanet.gov.tr`, `nusuk.sa`, `*.gov.sa` **bilgi** sayfalarına. Vize portalı, otel, uçuş, paket, rezervasyon sayfası yasak. Bağlantı metni konu kelimesidir ("ihram yasakları"), kurum adı değil ("Diyanet'in sitesi" değil).
- Sattığımız hizmetler (vize, paket, otel, uçuş, transfer, tren, rehberlik) için yalnızca iç sayfa: `/umre-vizesi`, `/paketler`, `/bireysel-umre`, `/hizmetler`, `/rehberlik`.
- Yeni bir resmî adres kullanmadan önce `curl -sIL <adres>` ile açıldığını doğrula.
- Rakip firma adı/sitesi yok. "TÜRSAB" ve "diyanetsiz" yok.

**Farklılık:** Aynı gruptaki sayfalar birbirinin şablon kopyası olamaz. Her sayfanın konusuna özgü en az 3 bölümü olmalı. Ay sayfaları için özellikle geçerli (bölüm 4).

## 3. Arama hacmi kuralı (sayfa açmadan önce)

Admin → SEO Masası → Programatik → **Arama hacimlerini getir** (DataForSEO, kuruşluk maliyet). Kullanıcıya hacimleri göster. **Hacmi 0 olan kelimeye sayfa açma**; listeyi kullanıcıyla netleştir. Hacim verisi gelmezse kullanıcıya sor.

## 4. Sayfa özetleri

Adresler şablon tarafından belirlenir; `slug` aşağıdaki gibi olmalı (SEO Masası bu adreslere bakıyor).

### Sözlük (`group: "sozluk"`, adres `/umre-rehberi/<slug>`, `term` zorunlu)
| slug | kelime | işlenecekler |
|---|---|---|
| `ihram-nedir` | ihram nedir | ✅ Hazır (örnek) |
| `tavaf-nedir` | tavaf nedir | Tanım; umre tavafının adımları (Hacerülesved hizası, 7 şavt, remel/ıztıba erkeklere); tavaf namazı; kalabalıkta pratik öneriler (saat, kat); tavaf çeşitleri tablosu (umre, veda, nafile — kısa) |
| `say-nedir` | say nedir | Sa'y tanımı ve tarihçesi (Hz. Hacer); Safa'dan başlayıp Merve'de biten 7 kez; yeşil ışıklar arasında erkeklerin hızlı yürümesi (hervele); sa'yda abdest şartı olmaması gibi temel bilgiler (emin değilsen yazma); tekerlekli sandalye imkânı → `/tekerlekli-sandalye-ile-umre` |
| `mikat-nedir` | mikat nedir | Mikat tanımı; beş mikat yeri tablosu (Zülhuleyfe, Cuhfe, Karnü'l-menazil, Yelemlem, Zatü'l-ırk ve hangi yönden gelenler); Türkiye'den uçakla gidenler için uygulama; Medine'den gelenler |
| `tiras-nedir` | tıraş nedir (umrede) | Umrenin son adımı; erkek tıraş/kısaltma, kadın saç ucundan kesme; nerede yapılır (Merve çıkışı berberler); tıraşla ihramdan çıkış |

`umre-vizesi-nedir` gerekmez: `/umre-vizesi` sayfası var.

### Karşılaştırma (`group: "karsilastirma"`, adres `/umre-rehberi/<slug>`)
| slug | kelime | işlenecekler |
|---|---|---|
| `bireysel-umre-mi-turla-umre-mi` | bireysel umre mi turla umre mi | Karşılaştırma tablosu (takvim, otel seçimi, grup büyüklüğü, program esnekliği, rehberlik, hazırlık yükü); kimin için hangisi; bireysel umrede rehberlik ve vize nasıl çözülür (bizim hizmetimiz); **fiyat karşılaştırması yapma** (grup fiyatı ölçü alınmaz) |
| `ekonomik-umre-mi-luks-umre-mi` | ekonomik umre mi lüks umre mi | Farkı yaratan kalemler: otelin Harem'e uzaklığı, sezon, süre, uçuş; tabloda kalem kalem; bütçeyi korurken konfor için öneriler; fiyat yalnızca `Package` verisinden |
| `once-mekke-mi-medine-mi` | umre önce mekke mi medine mi | İki rotanın akışı (Cidde iniş → Mekke; Medine iniş → Medine); ihram açısından farkı (Zülhuleyfe); yorgunluk ve program dengesi; aileler ve yaşlılar için öneri; tasarlayıcıdaki "Önce Mekke / Önce Medine" seçimine bağlantı (`/bireysel-umre`) |
| `umre-mi-hac-mi` | umre mi hac mı | Tanım farkı (zaman, farz/sünnet, menasik); umrenin yıl içinde yapılabilmesi; süre ve kalabalık farkı; tablo; hac ile ilgili ayrıntıda resmî kaynağa yönlendir. **Hac organizasyonu satmıyoruz**; hac için firma önerme |

### Kişi (`group: "kisi"`, adres `/<slug>`)
| slug | kelime | işlenecekler |
|---|---|---|
| `aile-umresi` | aile umresi | Aile için bireysel umrenin faydası; çocuklu planlama (yaş gruplarına göre); oda düzeni ve otel mesafesi; program temposu; mahremiyet; planlayıcıdaki kişi seçimi (yetişkin/çocuk/bebek) |
| `yasli-umresi` | yaşlılar için umre | Yürüme mesafesi ve otel seçimi; tekerlekli sandalye ile tavaf/sa'y imkânı (genel bilgi); sağlık hazırlığı (resmî sağlık sayfası bağlantısı); refakatçi ve rehber; dinlenme günleri. Tıbbi tavsiye verme |
| `tekerlekli-sandalye-ile-umre` | tekerlekli sandalye ile umre | Harem'de sandalye kullanımı (genel), hareket kısıtı olanlar için otel ve transfer seçimi; refakatçi; önceden bildirilmesi gerekenler (havayolu engelli yardımı genel bilgi). Kural uydurma; emin olmadığında "havayolunuz ve rehberinizle teyit edin" |
| `ogrenci-umresi` | öğrenci umresi | Sömestr/yaz tatili zamanlaması; bütçe kalemleri; genç gruplar için program; ilk umre hazırlığı (`/ilk-umrem`, sözlük sayfaları). İndirim uydurma |

### Zaman (`group: "zaman"`, adres `/<slug>`) — hacim kuralı özellikle önemli
| slug | kelime |
|---|---|
| `ekim-umresi`, `kasim-umresi`, `aralik-umresi`, `ocak-umresi`, `subat-umresi`, `mart-umresi`, `nisan-umresi` | {ay} umresi {yıl} |
| `ramazan-umresi` | ramazan umresi {yıl} |
| `somestr-umresi` | sömestr umresi |

Her ay sayfasında **aya özgü** en az 3 bölüm: o ayın Mekke/Medine hava durumu (genel, "ortalama" diye, uç rakam uydurmadan), kalabalık yoğunluğu ve sebebi (okul tatili, Ramazan, hac dönemi), o aya düşen dinî günler (Hicri takvim, yaklaşık), o ay için pratik öneri (kıyafet, saat planı). Fiyat yalnızca `Package` verisinden. `/eylul-umresi` bir kampanya sayfası; ona dokunma, ay sayfalarından bağlantı verilebilir. Ay sayfaları birbirinin kopyası olursa açma.

### Profil — oteller (`/oteller/<otel>`) — **şimdilik açılmaz**
Hotel tablosunda aktif otel yok. Kâbe'ye metre cinsinden mesafe kendi verimiz olmalı; tahmin ya da internetten kopya mesafe yazılmaz. Kullanıcı admin'den otelleri gerçek verisiyle girince ayrı bir şablonla ele alınacak (kullanıcıya sor).

## 5. Lokal önizleme ve kullanıcı onayı (zorunlu akış)

1. `git pull` → `git checkout -b sayfa-gruplari`.
2. Lokal sunucu: `npm run dev -- -p 3002` (Claude Desktop'ta `hadi-seo-dev` yapılandırması aynı işi yapar). Yerelde veritabanı yoktur; bu sayfalar veritabanına ihtiyaç duymadan çalışır.
3. Her **3–4 sayfalık** grupta: denetim 0 hata → kullanıcıya adresleri ver ve **sayfaları kendi tarayıcısında açmasını iste**: `http://localhost:3002/umre-rehberi/<slug>`, `http://localhost:3002/<slug>`, merkez `http://localhost:3002/umre-rehberi`. Telefondan bakmak için aynı ağda `http://<bilgisayar-ip>:3002` (terminalde `ipconfig getifaddr en0`).
4. Kullanıcının düzeltmelerini uygula. **Kullanıcı "canlıya al" demeden `main`'e birleştirme yok.**
5. Onaydan sonra: `git checkout main && git merge sayfa-gruplari && git push`; iki Vercel projesinin build'ini `gh api …/status` ile bekle; canlıda her yeni adresi `curl` ile kontrol et (200, tek `<h1`, `<title>` ≤ 60).
6. Canlıdan sonra SEO Masası → Programatik'te "sayfa var" görünmeli; AI Görünürlük → Hazırlık'ı yeniden çalıştır.
7. `docs/YOL-HARITASI.md` 3.2'nin altına açılan sayfaları ve durum günlüğüne satır yaz.

Not: Lokal dev sunucusu dosya değişikliğini bazen kaçırır; sayfa güncellenmezse sunucuyu yeniden başlat. Safari'de eski CSS görünürse Cmd+Option+R.

## 6. Her sayfa için kontrol listesi (kullanıcıya göstermeden önce)

- [ ] `npx tsx scripts/check-content-pages.mts` → 0 hata
- [ ] Sayfada tek H1; giriş paragrafı sorunun cevabı
- [ ] Rakamların her biri doğrulanabilir; fiyat yalnızca paket verisinden
- [ ] Dış bağlantılar açılıyor (`curl -sIL`) ve resmî bilgi sayfası
- [ ] Marka doğal; satış dili abartısız; grup turu ölçü alınmamış
- [ ] Aynı gruptaki diğer sayfalardan belirgin farklı
- [ ] Mobilde (390 px) taşma yok
- [ ] Ana sayfa değişmedi
