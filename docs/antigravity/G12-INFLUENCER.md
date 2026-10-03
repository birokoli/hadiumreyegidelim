# G12 · Influencer Aday Havuzu: veri sağlayıcı araştırması + admin ekranları + blog düzeltme tamamlama (3 Ekim)

Kurallar G8–G11 ile aynı: commit/push yok; yalnızca listelenen dosyalar; "bu arada" düzeltme yok; tsc + eslint temiz; kanıt (komut + gerçek çıktı) TESLIM.md en üstüne tek "G12" kaydı. Canlı veritabanına yazma yok. Gizli anahtar/parola yazma, isteme, dosyaya koyma.

## Hedef kitle tanımı (kullanıcı, 3 Ekim) — bütün maddelerde esas
Umre için **muhafazakâr / dindar kitleye ulaşan** içerik üreticileri: yalnızca tesettürlü olmak ölçüt değildir; ölçüt **kitlenin dindar olması** (dini içerik, hac/umre, İslami yaşam, aile, sohbet, ilahi, Kur'an, siyer, helal seyahat). **Instagram'da aktif** olmalı (son 30 günde paylaşım). Gereken veriler: **takipçi sayısı, ortalama izlenme (Reels), ortalama beğeni/yorum, etkileşim oranı, son paylaşım tarihi, kitlenin ülke/dil dağılımı (Türkiye/Türkçe), sahte takipçi oranı.**

## G12-1 · Veri sağlayıcı araştırması (yalnızca belge)
**Dosyalar:** yeni `docs/taslaklar/influencer-veri-saglayicilari.md`

Instagram (öncelik), TikTok ve YouTube için yukarıdaki verileri **API ile** veren sağlayıcıları karşılaştır. En az şunlara bak: Modash, HypeAuditor, Phyllo (InsightIQ), Upfluence, Heepsy, Influencers.club, Apify (Instagram aktörleri), StarNgage, Social Blade API, ve DataForSEO'nun bu konuda **ne verip ne vermediği**.
Tablo: sağlayıcı | API var mı | Instagram takipçi / ort. izlenme / etkileşim / kitle ülke-dil / sahte takipçi | Türkiye kapsaması | **arama/keşif** (anahtar kelime, konu, konum ile kreatör bulma) | fiyat (resmî fiyat sayfasından, tarihli bağlantıyla; yoksa "fiyat sayfası yok") | deneme sürümü | Meta kurallarına uyum (resmî API mi, kazıma mı).
Sonda öneri: **en ucuz başlangıç** ve **en iyi veri** seçeneği, gerekçesiyle. Uydurma fiyat/özellik yazma; doğrulayamadığını "doğrulanmadı" diye işaretle.

## G12-2 · Admin "Influencer Adayları" ekranları
**Dosyalar:** yeni `src/app/(admin)/admin/influencer-adaylari/page.tsx`, yeni `src/app/(admin)/admin/influencer-adaylari/[id]/page.tsx`, `src/components/admin/AdminSidebar.tsx` (yalnızca influencer grubuna bir menü satırı: `/admin/influencer-adaylari`, ikon `person_search`, etiket "Influencer Adayları", permission "marketing").

API'yi Claude yazacak; ekranlar şu sözleşmeye göre yazılır (yerelde API yokken boş/ hata durumunu düzgün göster):
- `GET /api/admin/influencer-prospects?stage=&q=&minScore=` → `{ items: Prospect[] }`
- `POST /api/admin/influencer-prospects` `{ action: "add", platform, handle, url?, name?, note? }` | `{ action: "discover", query, platform }` | `{ action: "score", id }` | `{ action: "stage", id, stage }` | `{ action: "note", id, note }` | `{ action: "invite", id }` → `{ ok, item? , inviteUrl? }`
- `Prospect = { id, platform: "instagram"|"tiktok"|"youtube", handle, url, name, followers: number|null, avgViews: number|null, engagementRate: number|null, lastPostAt: string|null, audienceTR: number|null, fitScore: number|null, fitReasons: string[], religiousAudience: boolean|null, stage: "bulundu"|"uygun"|"mesaj"|"yanit"|"anlasildi"|"red", source: string, note: string|null, createdAt }`

Liste ekranı: arama, aşama filtresi (sekmeler + sayılar), en düşük puan filtresi; tablo: hesap (platform simgesi + bağlantı), takipçi, ort. izlenme, etkileşim %, son paylaşım, dindar kitle (evet/hayır/bilinmiyor), uygunluk puanı (renk: ≥70 yeşil değil, ana renk; <40 soluk — kırmızı yalnızca hata), aşama. Üstte "Aday ekle" (platform + kullanıcı adı) ve "Keşif çalıştır" (arama metni + platform) formları.
Detay ekranı: bütün alanlar, puan gerekçeleri listesi, aşama değiştirme düğmeleri, not alanı, "DM taslağı" kutusu (aşağıdaki şablondan adayın adı ve platformuyla doldurulmuş, kopyala düğmesi), "Davet bağlantısı oluştur" (invite) ve dönen bağlantıyı kopyalama.
Görünüm: `src/app/(admin)/admin/blog-kuyrugu/page.tsx` ve `sayfa-metinleri` ile aynı sınıflar. Kanıt: yerelde iki ekranın görüntüsü.

## G12-3 · DM şablonları
**Dosyalar:** yeni `docs/taslaklar/influencer-dm-sablonlari.md` ve aynı metinlerin kullanıldığı sabit dosya `src/app/(admin)/admin/influencer-adaylari/dm.ts`
Instagram DM (kısa), e-posta (uzun), takip mesajı (5 gün sonra). Saygılı, dini hassasiyete uygun dil; abartı/garanti yok; teklif: kişiye özel kupon kodu ve satış başına komisyon (oran yazma, `{komisyon}` yer tutucu). Yer tutucular: `{ad}`, `{platform}`, `{komisyon}`, `{davet}`.

## G12-4 · Blog yasaklı ifadeleri tamamla (G11-1 eksikleri)
**Dosyalar:** `docs/veri/blog-duzeltmeleri-2.json`
Canlıda hâlâ var: "ekonomik-umre-hangi-firma-2026" (TÜRSAB ×7, bir kısmı yazının SSS alanında), "mekke-otel-secimi-ve-konum-rehberi" ("Harem'e sıfır" ×2, "7/24" ×2) ve G8 denetimindeki diğer 15 yazıda kalanlar. G11-1 kuralları aynen (tam cümle, `&nbsp;` yok, masum kullanım değişmez). SSS'teki ifadeler için `{ "slug", "field": "faq", "q": "<soru tam metni>", "find", "replace" }`. Kanıt: her kayıt için canlı makale gövdesi (ya da SSS) metninde `find` sayısı = 1.
