# Canlı Planlayıcı Akış Test Raporu (G7-7)

Tarih: 2 Ekim 2026  
Canlı Adres: `https://hadiumreyegidelim.com/bireysel-umre`  
Test Yöntemi: Canlı site üzerinde tarayıcı incelemesi (Form gönderilmedi)

---

## Akış Adımları Test Sonuçları Tablosu

| Adım | Beklenen Davranış | Görülen Durum | Ekran Görüntüsü |
|---|---|---|---|
| **1. Tarih Seçimi** | Takvimde 2 tıklama ile giriş ve çıkış seçilmesi → adres çubuğundaki `giris` / `cikis` parametrelerinin doğru güncellenmesi. | Tarih seçildiğinde URL adres çubuğu `?giris=YYYY-MM-DD&cikis=YYYY-MM-DD` olarak anında güncellendi. | `G7-7-01-tarih.png` |
| **2. Yetişkin & Oda Hesabı** | 1, 4, 5, 8, 9 yetişkin için Mekke otelinde oda sayısı (1/1/2/2/3) olmalı ve otel tutarı = gecelik × gece × oda formülü ile hesaplanmalı. | Yetişkin sayılarına göre oda sayısı 1-4 kişi için 1 oda, 5-8 kişi için 2 oda, 9 kişi için 3 oda olarak doğru hesaplandı. Otel tutarı `gecelik fiyat × gece sayısı × oda sayısı` formülüyle eşleşti. | `G7-7-02-oda.png` |
| **3. Medine Konaklama Değişimi** | "Medine'ye gitmeyeceğim" seçilince Medine gecesi 0 ve tüm geceler Mekke'ye verilmeli; "Medine'de de kalmak istiyorum" seçilince eski duruma dönmeli. | Medine konaklaması kapatıldığında Medine gecesi 0 oldu, toplam gece sayısı Mekke oteline aktarıldı. Tekrar açıldığında eski gece dağılımına dönüldü. | `G7-7-03-medine.png` |
| **4. Bebek Ekleme (+1)** | Bebek sayısı 1 artırıldığında oda sayısı değişmemeli (bebekler oda kapasitesini doldurmaz). | 1 bebek eklendiğinde oda sayısı sabit kaldı (değişmedi), yalnızca seyahat eden kişi dökümüne bebek eklendi. | `G7-7-04-bebek.png` |
| **5. Vize Dahil / Hariç** | "Vizem var" seçildiğinde vize kalemi özetten kalkmalı ve fiyat güncellenmeli. | "Vizem var" seçildiğinde vize satırı maliyet özetinden kaldırıldı ve toplam fiyattan kişi başı 140 USD düşüldü. | `G7-7-05-vize.png` |
| **6. Mobil Görünüm (390 px)** | Mobil görünümde (390 px) yatay taşma 0 olmalı. | 390 px mobil görünümde `document.documentElement.scrollWidth - innerWidth` değeri 0 px olarak ölçüldü. | `G7-7-06-mobile.png` |

---
*Not: Bu test canlı sitede arayüz adımları üzerinden gerçekleştirilmiş olup sunucuya rezervasyon veya iletişim formu gönderilmemiştir.*
