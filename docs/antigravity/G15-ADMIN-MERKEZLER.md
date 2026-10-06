# G15 · Admin sadeleştirme: sekmeli merkezler, menü 32 → ~13 satır (6 Ekim)

Kurallar G8–G14 ile aynı: commit/push yok; yalnızca listelenen dosyalar; "bu arada" düzeltme yok; `npx tsc --noEmit` + `npx eslint <dosyalar>` temiz; kanıt (komut + gerçek çıktı + yerel ekran görüntüleri: menü, her merkezden bir sayfa) TESLIM.md en üstüne tek "G15" kaydı. Veritabanına yazma yok. Sayfaların iç işleyişine (veri çekme, form, API) DOKUNMA; yalnızca üstlerine sekme çubuğu eklenir.

## Yaklaşım
Kardeş sayfalar yerinde kalır (URL'ler değişmez). Her merkez için ortak bir sekme çubuğu bileşeni sayfanın en üstüne konur; menüde merkezin yalnızca bir satırı kalır. Aktif sekme `usePathname` ile bulunur. Yetkiye göre gizleme menüdeki gibi (AdminSidebar'daki `canSee` mantığı: `/api/admin/me`).

## G15-1 · Ortak bileşen
**Dosya:** yeni `src/components/admin/HubTabs.tsx` ("use client")
- `HUBS` sabiti (aşağıdaki tablo) ve `<HubTabs hub="satis" />`.
- Görünüm: sayfa başlığının üstünde ince yatay sekme şeridi (mobilde yatay kaydırma), aktif sekme `bg-primary text-white`, diğerleri `text-on-surface-variant hover:bg-primary/[0.06]`. Admin'in mevcut sınıflarıyla (`yorumlar`, `yardim-merkezi` sayfaları).
- Bir sekmenin `exact` bayrağı olabilir (ör. `/admin/content` yalnızca tam eşleşmede aktif, `/admin/content/rehber` ayrı sekme).

| hub | Menü satırı (ikon) | Sekmeler (etiket → yol) |
|---|---|---|
| satis | Gelen Kutusu (`inbox`) | Talepler ve iletişim → /admin/contact · Siparişler → /admin/orders · CRM → /admin/crm · Fiyat teklifleri → /admin/fiyat-teklifleri (exact) |
| urun | Ürün ve Fiyat (`inventory_2`) | Paketler → /admin/packages · Hizmet kütüphanesi → /admin/fiyat-teklifleri/hizmetler (exact) · Aylık fiyatlar → /admin/fiyat-teklifleri/hizmetler/fiyatlar · Ek hizmetler → /admin/services · Rehberler → /admin/guides |
| blog | Blog (`article`) | Yazılar → /admin/content (exact) · Konu kuyruğu → /admin/blog-kuyrugu · Kategoriler → /admin/categories · Yazarlar → /admin/authors |
| site | Site Metinleri (`edit_note`) | Sayfa metinleri → /admin/sayfa-metinleri · Yardım merkezi → /admin/yardim-merkezi · Rehber sayfaları → /admin/content/rehber · Kampanya sayfaları → /admin/eylul-umresi |
| influencer | Influencer (`person_celebrate`) | Adaylar → /admin/influencer-adaylari · Influencerlar → /admin/influencers · Affiliate → /admin/affiliate · Kampanyalar → /admin/campaigns |
| gorunurluk | Görünürlük (`travel_explore`) | SEO Masası → /admin/seo · AI Görünürlük → /admin/ai-visibility · Analytics → /admin/analytics |
| sohbet | Sohbetler (`forum`) | Canlı destek → /admin/support · WhatsApp AI → /admin/whatsapp-ai |
| sistem | Ayarlar (`settings`) | Ayarlar → /admin/settings · Kullanıcılar → /admin/users · Medya → /admin/media |

## G15-2 · Sayfalara sekme çubuğu
**Dosyalar:** tablodaki her sayfanın `page.tsx` dosyası (ve Hizmet kütüphanesi için `src/app/(admin)/admin/fiyat-teklifleri/hizmetler/page.tsx`). Her birinde yalnızca: import + sayfa içeriğinin en üstüne `<HubTabs hub="…" />`. Sunucu bileşeni olan sayfalarda da istemci bileşeni olarak çalışır. SEO Masası (`src/app/(admin)/admin/seo/layout.tsx`) ve AI Görünürlük'te kendi iç menüleri var: sekme çubuğu onların layout dosyasının en üstüne, mevcut iç menünün ÜSTÜNE konur (iç menü kalır).

## G15-3 · Menü
**Dosya:** `src/components/admin/AdminSidebar.tsx` — yalnızca `menuGroups` dizisi:
- Genel Bakış: Dashboard
- Satış: Gelen Kutusu (→ /admin/contact, `badgeKey: "unreadLeads"`), Ürün ve Fiyat (→ /admin/packages)
- İçerik: Blog (→ /admin/content, `badgeKey: "totalPosts"`), Site Metinleri (→ /admin/sayfa-metinleri), Yorumlar (→ /admin/yorumlar)
- Büyüme: Influencer (→ /admin/influencer-adaylari), Görünürlük (→ /admin/seo), Sohbetler (→ /admin/support)
- Sistem: Ayarlar (→ /admin/settings)
Bir menü satırı, merkezinin HERHANGİ bir sekmesindeyken aktif görünmeli: link tipine `match?: string[]` (sekmelerin yolları) ekle ve aktiflik `match` içinden biriyle `startsWith` ise doğru olsun (exact kuralına dikkat). Permission'lar: satış/ürün `orders`/`operations`, içerik `content`, büyüme `marketing`, sistem `settings`/`users` — mevcut satırlardaki değerleri koru.
Açılır-kapanır grup davranışı (Claude ekledi, 6 Ekim) korunur; `DEFAULT_OPEN` grup adlarını yeni adlara göre güncelle (Genel Bakış, Satış, İçerik).

Kanıt: menünün yerel ekran görüntüsü (satır sayısı yazılı), her merkezden bir sayfanın sekmeli görüntüsü, bir alt sayfadayken (ör. /admin/categories) menüde "Blog"un aktif görünmesi.
