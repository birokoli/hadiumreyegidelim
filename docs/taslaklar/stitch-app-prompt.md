# Google Stitch — Hadi Umreye Gidelim mobil uygulama promptları

Nasıl kullanılır:
1. Stitch'te **Mobile** modunu seç, en iyi modeli (Experimental / Pro) kullan.
2. Önce **1. Ana prompt**'u yapıştır. Bu, tasarım dilini ve ilk ekranları kurar.
3. Sonra **2. Ekran promptları**'nı sırayla, her seferinde bir tane gönder. Stitch tek seferde 4–6 ekranı iyi yapar; hepsini bir anda verirsen ekranları yüzeysel çizer.
4. Promptlar İngilizce, çünkü Stitch İngilizce talimatı daha tutarlı uygular. Ekranlardaki bütün metinler Türkçe istenir; tırnak içindeki Türkçe metinler aynen kullanılsın diye yazıldı.
5. Beğenmediğin ekranda tüm promptu tekrar gönderme; "Edit this screen:" diye başlayan kısa bir düzeltme yaz.

---

## 1. Ana prompt (ilk mesaj)

```
Design a premium iOS/Android mobile app called "Hadi Umreye Gidelim" — the app version of hadiumreyegidelim.com, a Turkish individual (bireysel) umrah planning company. ALL UI TEXT MUST BE IN TURKISH. Text in quotes below must be used exactly.

WHAT THE COMPANY DOES
People plan their umrah on their own dates and budget instead of joining a fixed group tour. The company arranges umrah visa, Makkah and Madinah hotels, airport/city transfers, Haramain high-speed train tickets, guided tours (ziyaret) and extras, then sends a quote via WhatsApp. It does NOT sell flight tickets and does NOT sell Nusuk permits. There are also ready-made umrah packages (paketler) with fixed dates. Audience: religious/conservative Turkish families, women traveling together, first-timers, elderly people with their children, ages 25–65. They value trust, clarity and calm — not flashy travel-agency energy.

DESIGN DIRECTION
- Mood: calm, spiritual, trustworthy, editorial. Like a well-made Apple app crossed with a quiet Islamic manuscript. Lots of white space. Never cluttered, never "tour agency banner" style.
- Base: white theme. Colors cover only 10–17.5% of each screen; the rest is white/near-white.
- Palette (Pantone):
  • Brilliant White #EDF1FE — soft section backgrounds, cards on white
  • Navy 7687C #1D428A — primary color: buttons, headings, icons, active states
  • Light blue 2127C #B8C9E3 — borders, chips, dividers, secondary fills
  • Sand 6234C #F2DDA6 — rare warm accent only (one highlight per screen max: a campaign tag, a selected date)
  • Text: #0F1B33 primary, #5B6680 secondary. Red only for errors.
- Typography:
  • Cairo for all UI and body text (supports Turkish characters ç ğ ı İ ö ş ü).
  • Noto Serif Italic for one accented word inside big headings, e.g. heading "Umrenizi kendiniz *planlayın*" where "planlayın" is serif italic navy.
  • A subtle touch of Arabic calligraphy (Aref Ruqaa style) used decoratively, very sparingly — e.g. a faint "لبيك" watermark behind the home hero, or a small calligraphic ornament on the onboarding screen. Never as UI text.
- Icons: single-color line icons, equal stroke weight, rounded caps, 2D, navy on white or white on navy. Custom umrah set: package, individual traveler, visa, hotel, transfer car, train, guide, first umrah, woman, Kaaba, tawaf (circular arrows around Kaaba), sa'y, zamzam, Madinah green dome, ihram, dua hands, tasbih, calendar, plane, phone, message, email, location pin, price tag, verified shield, review, family, baby, search, arrow, check, info. No Star of David or any non-Islamic religious symbol; no human faces.
- Shapes: 16–20px radius cards, 12px buttons, hairline 1px #B8C9E3 borders instead of heavy shadows. Soft, sparse shadows only on floating elements.
- Photography: real-feeling, warm photos of Masjid al-Haram, Masjid an-Nabawi, Quba Mosque at dawn, Madinah streets; no stock-smile models, no faces in close-up.
- Motion hints: gentle fades and slide-ups, no bouncy effects.
- Tone of copy: short, clear, respectful Turkish. Address the user formally ("siz"). Never use these words: "lüks", "VIP", "eşsiz", "garanti", "7/24", "kesintisiz", "kapıda vize", "Harem'e sıfır", "TÜRSAB", "diyanetsiz". No fake ratings, no invented prices — use price placeholders like "₺ —" or realistic ranges only where marked.

NAVIGATION
Bottom tab bar with 5 tabs: "Ana Sayfa", "Planla", "Paketler", "Rehber", "Hesabım". Persistent floating WhatsApp contact button style chip "WhatsApp'tan yazın" on Home and package/hotel details (navy, not WhatsApp green).

GENERATE THESE FIRST SCREENS
1. Onboarding (3 swipeable slides):
   - "Umrenizi kendi tarihinizde planlayın" — calendar + Kaaba illustration
   - "Otel, vize, transfer tek yerde" — icon row
   - "Teklifiniz WhatsApp'tan gelsin" — chat illustration; buttons "Başlayalım" and "Giriş yap"
2. Home (Ana Sayfa):
   - Top: small logo wordmark "Hadi Umreye Gidelim", notification bell.
   - Hero: heading "Umrenizi kendiniz *planlayın*", subtext "Tarihinizi, otelinizi ve Mekke–Medine gün sayınızı seçin; teklifiniz WhatsApp'tan gelsin.", primary button "Umremi planla", secondary text link "Hazır paketlere bak". Faint calligraphy watermark.
   - "Niyet" band: a thin Brilliant White strip with a short line like "Niyet ettiniz, gerisini birlikte planlayalım."
   - Quick links: horizontal scroll of 8 icon tiles: "Umre paketleri", "Bireysel umre", "Umre vizesi", "Otel ve konaklama", "Transfer ve tren", "Rehberlik", "İlk umrem", "Hanım umresi".
   - Campaign card (sand accent tag "Dönem"): "Eylül umresi" with dates and "İncele".
   - "Nasıl çalışır?" 3 steps: "1 Tasarla — Tarihi, otel tercihini ve Mekke–Medine gün sayısını seçin." "2 Teklif al — Seçimlerinize göre hazırlanan teklifi WhatsApp'tan alın." "3 Yola çık — Vize, otel ve transfer ayarlanır; yolculuk boyunca yanınızdayız."
   - "Öne çıkan paketler" horizontal cards (photo, title, dates, nights in Makkah/Madinah, "₺ — 'den başlayan").
   - "Sizden gelenler" reviews carousel: name, trip month, short quote, small "Doğrulanmış müşteri" badge with shield icon. No star-rating summary.
   - "Rehberden" latest 3 articles.
   - FAQ accordion (3 items) and "Tüm sorular" link.
3. Planner start (Planla tab, step 1 of 6): progress indicator with steps "Tarih ve kişi", "Konaklama", "Transfer", "Tren", "Rehberlik", "Özet". Step 1 shows a month calendar for departure date, a stepper for nights in Makkah and nights in Madinah, "Önce Mekke mi, Medine mi?" segmented control, and traveler counters "Yetişkin", "Çocuk", "Bebek". Sticky bottom bar with "Devam" button.
```

---

## 2. Ekran promptları (sırayla, birer birer)

### 2.1 Planlayıcının kalan adımları
```
Using the same design system, create the remaining planner steps (Planla tab):
- Step 2 "Konaklama": two sections "Mekke otelleri" and "Medine otelleri". Hotel cards: photo, name, star count, walking distance to the Haram in minutes (e.g. "Harem'e 6 dk yürüme"), room type selector (2/3/4 kişilik), board selector ("Oda kahvaltı", "Yarım pansiyon"), select button. Filter chips: "Yürüme mesafesi", "Yıldız", "Bütçe".
- Step 3 "Transfer": list of transfer legs (Cidde Havalimanı → Mekke otel, Mekke → Medine, Medine otel → Medine Havalimanı), each with vehicle type cards ("Sedan", "Minivan", "Minibüs") and capacity icons.
- Step 4 "Tren": Haramain high-speed train option Mekke ⇄ Medine with class selector ("Ekonomi", "Business") and date/time chips; toggle "Tren yerine transfer kullan".
- Step 5 "Rehberlik": cards for guided visits ("Mekke ziyaretleri", "Medine ziyaretleri", "Taif turu", "Uhud ve Kuba", "Hendek bölgesi"), each with duration and "Ekle" toggle; plus an "Ekstralar" section (ihram seti, zemzem, SIM kart, tekerlekli sandalye).
- Step 6 "Özet": clean receipt-style summary grouped by Vize, Konaklama, Transfer, Tren, Rehberlik, Ekstralar; total shown as "Tahmini toplam ₺ —"; note text "Kesin fiyat, otel müsaitliğine göre teklifte netleşir."; primary button "Teklifi WhatsApp'tan iste", secondary "Planı kaydet".
Keep the sticky progress header and bottom action bar consistent.
```

### 2.2 Paketler
```
Same design system. Create:
- "Paketler" list: header "Umre fiyatları 2026 ve umre paketleri", filter chips by month ("Ekim", "Kasım", "Aralık", "Sömestr", "Ramazan"), by duration ("7 gün", "10 gün", "14 gün", "15 gün") and type ("Bireysel", "Aile", "Hanım"). Package cards with photo, title, date range, nights split "Mekke 5 gece · Medine 4 gece", hotel names, "₺ —'den başlayan".
- Package detail: hero photo gallery, title, dates, quick facts row with icons (duration, hotels, transfer, visa included), day-by-day itinerary timeline ("1. gün: Cidde'ye varış, Mekke'ye transfer, umre"), "Pakete dahil olanlar" / "Dahil olmayanlar" lists (flight tickets listed under not included), room type price table, hotel mini-cards, FAQ, sticky bottom bar with price and "Bu paket için teklif al".
```

### 2.3 Oteller ve vize
```
Same design system. Create:
- "Oteller" list with segmented control "Mekke" / "Medine", hotel cards (photo, name, stars, minutes to Haram, short description).
- Hotel detail: photo gallery, name, stars, map snippet with walking route to the Haram, "Otel hakkında" long description, room types, amenities with line icons, "Bu oteli planıma ekle" button.
- "Umre vizesi" screen: short explanation, steps timeline ("Bilgilerinizi gönderin", "Belgeler kontrol edilir", "Vizeniz e-posta ile gelir"), required documents checklist with check icons, FAQ accordion, button "Vize için başvur".
```

### 2.4 Rehber (içerik)
```
Same design system. Create the "Rehber" tab:
- Rehber home: search bar "Rehberde ara", category chips ("Vize", "Bireysel umre", "Tavaf", "Sa'y", "Siyer", "Hazırlık", "Mekke", "Medine"), featured article card, sections "Umre sözlüğü" (ihram, mikat, tavaf, sa'y, tıraş), "Karşılaştırmalar" (Bireysel umre mi turla umre mi?, Önce Mekke mi Medine mi?, Umre mi hac mı?), "Kime göre umre" (İlk umrem, Hanım umresi, Aile umresi, Yaşlı umresi, Öğrenci umresi, Tekerlekli sandalye ile umre), "Döneme göre umre" (month chips Ocak … Aralık, Ramazan, Sömestr).
- Article screen: editorial layout, large serif-italic accented title, reading time, table of contents chips, question-style subheadings, info callout boxes in Brilliant White, related articles, and a soft CTA card "Bu bilgilerle umrenizi planlayın" → "Umremi planla".
- "Keşifler" story-style feature: full-bleed photo article like "Gizli Mücevher: Kuba seher vakti" and "Hendek turu", with chapter sections and photo captions.
```

### 2.5 Yolculuk arkadaşı (uygulamaya özel)
```
Same design system. Create an in-trip companion section reached from "Hesabım > Yolculuğum" (these are app-only features):
- "Yolculuğum" dashboard: countdown card "Umrenize 23 gün kaldı", trip timeline (visa status, hotel check-ins, transfer pickup times, train time), "Belgelerim" wallet (vize PDF, otel voucher, transfer bilgisi) with offline badge.
- "İbadet rehberi": step-by-step umrah guide (İhram → Niyet → Tavaf → Sa'y → Tıraş) with large readable text, Arabic dua with Turkish reading and meaning.
- Tawaf / Sa'y counter: big circular progress showing round "3 / 7", large tap area to count, haptic hint, undo button, works with one hand; calm navy background option for night use.
- "Dualar" list with favorites.
- Help screen: "Rehberinizi arayın", "WhatsApp'tan yazın", hotel address card to show a taxi driver (Arabic + Turkish), emergency info.
```

### 2.6 Hesap, yorumlar ve yardım
```
Same design system. Create:
- "Hesabım": profile header, sections "Planlarım" (saved planner drafts), "Taleplerim" (quote requests with status chips "Teklif hazırlanıyor", "Teklif gönderildi", "Onaylandı"), "Yolculuğum", "Yorum yaz", "Yardım", "Ayarlar".
- Login / sign-up: phone number or email, minimal, calm; calligraphy ornament at top.
- "Yorumlar": list of verified reviews with name, month, trip type, photo optional, "Doğrulanmış müşteri" badge; no star average header.
- "Yorum yaz" form (from a personal link): rating-free, text area "Umreniz nasıl geçti?", optional photo upload, consent checkbox.
- Help center "Yardım": search, topic cards ("Sık sorulan sorular", "Bize ulaşın", "Aile ve Grup talepleri", "İşletme kaydı"), contact form with subject picker, contact info "info@hadiumreyegidelim.com", and a trust card "Hadi Umreye Gidelim güvenilir mi?" linking to a page with company info.
- Empty states and error states for the planner and reviews, plus a loading skeleton for package lists.
```

### 2.7 Son kontrol (düzeltme turu)
```
Review all screens for consistency: same tab bar, same header style, same button sizes (48px height), same card radius, Cairo everywhere, serif italic only for one accented word per big heading, sand accent used at most once per screen, colors under ~17% of each screen, all text in Turkish with correct characters (ç ğ ı İ ö ş ü), minimum 16px body text for older users, touch targets at least 44px, and good contrast. Fix any screen that breaks these rules.
```

---

## 3. Notlar
- "₺ —" fiyat yer tutucuları bilerek konuldu; Stitch uydurma fiyat yazmasın.
- Bölüm 2.5 ("Yolculuk arkadaşı") sitede yok, uygulamaya özel öneridir; istemezsen atla.
- Stitch çıktısı Figma'ya aktarılabilir; uygulama kodlanacaksa önce bu ekranlar üzerinde karar verilir, sonra React Native/Expo ile site API'lerine bağlanır.
