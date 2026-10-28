# Hadi Yönetim — mobil uygulama planı (28 Ekim 2026)

Kullanıcı isteği: admin panelini telefondan ve tabletten yönetmek; düzenli bildirim; "gerçekten bir app gibi düşün, web sitesi uzantısı olmasın".

## Karar: yerel (native) uygulama, web sarmalayıcı değil
- **Teknoloji:** Expo (React Native) + TypeScript + expo-router. Ekranlar yerel bileşen; WebView yok.
- **Neden Expo:** tek kodla Android (APK) ve ileride iOS/iPad; yerel bildirim, Face ID/parmak izi, güvenli anahtar deposu, uygulama içi güncelleme hazır.
- **Görünüm:** marka kiti (Cairo, lacivert #203C76, kum #F2DDA6, altın #B8902A), kendi ikon setimiz (HugIcon SVG'leri react-native-svg ile). Telefonda alt sekmeler; tablette yan menü + liste/ayrıntı bölünmüş ekran.
- **Uygulama adı:** "Hadi Yönetim" (ana ekranda), ikon: logo lacivert zeminde.

## Mimari
```
Uygulama (Expo)  ──Bearer token──▶  /api/mobil/*  (Next.js, aynı sunucu)  ──▶  Postgres (mevcut tablolar)
      ▲                                    │
      └──── anlık bildirim (FCM / Expo Push) ◀── bildir(olay) + zamanlanmış görevler (Vercel Cron)
```
- **Giriş:** kullanıcı adı + şifre bir kez → cihaza özel, iptal edilebilir anahtar (expo-secure-store). Sonra parmak izi / yüz tanıma ile açılır. Admin'deki yetkiler (orders, marketing, content…) aynen geçerli.
- **Yeni sunucu katmanı `/api/mobil/*`:** web admin'in API'lerine dokunmadan, uygulamaya göre şekillenmiş uçlar (liste + sayfalama + sayaçlar tek istekte). Mevcut iş mantığı (src/lib/satis, ramazan, reviews…) yeniden kullanılır.
- **Yeni tablolar (yalnızca eklenir):** `MobilCihaz` (cihaz, anahtar özeti, bildirim anahtarı, son görülme), `MobilBildirim` (gönderilen bildirimler, okundu), `MobilTercih` (hangi olaylar, sessiz saatler).
- **Çevrimdışı:** son açılan listeler cihazda saklanır; internet yokken okunur, işlemler sıraya alınır.

## Bildirimler
**Anlık (olay olunca):**
- Yeni talep / planlayıcıdan plan gönderildi
- Müşteri teklifi açtı (TeklifAcilis), teklif onaylandı
- Ödeme kaydedildi / kapora geldi
- Ramazan rezervasyonu
- Yeni yorum onay bekliyor
- Influencer içerik gönderdi (onay bekliyor)
- Destek mesajı / WhatsApp yapay zekâsı insana devretti

**Zamanlanmış:**
- Her sabah günlük özet (yeni talepler, bugün yola çıkanlar, bekleyen ödemeler, süresi dolan teklifler)
- Teklif geçerliliği yarın bitiyor
- Yolculuğa 7 / 3 / 1 gün kala (vize, uçuş bilgisi, karşılama eksikse uyarı)
- Kalan ödeme vadesi

Her bildirime dokununca ilgili ekran açılır (derin bağlantı). Sessiz saatler ve olay bazında aç/kapat ayarlardan.

## Ekranlar (sürüm planı)
**Sürüm 1 (çekirdek):**
1. Bugün: günün özeti, sayaçlar, yapılacaklar
2. Bildirimler: geçmiş, okundu/okunmadı
3. Satış Masası: dosya listesi (aşama filtresi, arama), dosya ayrıntısı, aşama değiştirme, ödeme ekleme, not, müşteriyi WhatsApp/telefonla arama, teklif bağlantısını paylaşma
4. Talepler: iletişim formu, planlayıcı talepleri, Ramazan rezervasyonları; tek dokunuşla Satış Masası dosyası açma
5. Ayarlar: bildirim tercihleri, cihazlar, çıkış

**Sürüm 2:** yorum onayı, influencer içerik onayı, destek sohbeti, WhatsApp konuşmaları
**Sürüm 3:** raporlar (ciro, dönüşüm, kaynak), katalog/fiyat hızlı düzenleme, yolculuk takvimi
**Sürüm 4:** iOS / iPad, Play Store

## Dağıtım
- APK doğrudan kurulum (bağlantıdan indir, "bilinmeyen kaynak" izni bir kez). Sonra istenirse Play Store "dahili test".
- Kod güncellemeleri uygulama içinden (EAS Update); yeniden APK kurmak yalnızca yerel değişiklikte gerekir.

## Kullanıcıdan gerekenler
- **Expo hesabı** (ücretsiz): derleme ve uygulama içi güncelleme için.
- **Firebase projesi** (ücretsiz): Android bildirimleri için zorunlu (Google'ın bildirim servisi). `google-services.json` ve hizmet hesabı anahtarı; anahtar sohbete yazılmaz, dosya olarak verilir.
- Bu hesapları ben açamam; açılınca kurulumu ben yaparım.

## Güvenlik
- Cihaz anahtarı sunucuda yalnızca özet (hash) olarak tutulur; Ayarlar → Cihazlar'dan tek tek iptal edilebilir.
- Uygulama arka plana alınınca 5 dk sonra biyometrik kilit.
- Bildirim içeriğinde ödeme tutarı ve pasaport gibi hassas veri yok; ayrıntı uygulama açılınca görünür.
