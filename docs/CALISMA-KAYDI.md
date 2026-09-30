# Çalışma kaydı (Antigravity → Claude Code geri devir)

Antigravity her iş oturumunda bu dosyanın **en üstüne** bir kayıt ekler. Amaç: Claude Code (ya da başka bir ajan) işi, konuşma geçmişine ihtiyaç duymadan yalnızca bu dosyadan devralabilsin. Kayıt yazılmadan oturum bitmez.

## Kayıt şablonu (kopyala, doldur)

```
## YYYY-AA-GG SS:DD — <kısa başlık>
**Dal / commit:** <dal adı> · <commit kısa sha'ları>
**Yol haritası adımı:** <ör. 3.2>
**Yapılan:**
- <ne değişti, hangi dosyalar>
**Doğrulama:**
- <çalıştırılan komutlar ve sonuçları: check-content-pages, tsc, build, canlı curl>
**Kullanıcıya gösterilen / onay:**
- <hangi localhost adresleri gösterildi, kullanıcı ne dedi, onay var mı>
**Kararlar ve sebepleri:**
- <neden böyle yapıldı; kullanıcının verdiği kararlar>
**Açık kalanlar / riskler:**
- <yarım kalan iş, bilinen hata, kullanıcıdan beklenen>
**Sıradaki adım:**
- <bir sonraki ajanın ilk yapacağı iş>
```

## Kurallar
- Kayıtlar Türkçe, somut ve kısa; "düzeltildi" yerine ne, nerede, nasıl.
- Sır (anahtar, şifre, token) yazılmaz.
- Kod değiştiyse commit sha'sı yazılır; canlıya çıktıysa iki Vercel build sonucu yazılır.
- Kullanıcı onayı olmadan `main`'e birleştirilen iş olmamalı; olduysa sebebi yazılır.
- `docs/YOL-HARITASI.md` Durum günlüğü de güncellenir (bu dosya ayrıntı, günlük özet).
- Oturum sonunda en üst kayıtta **"Sıradaki adım"** mutlaka dolu olur; Claude Code oradan başlar.

---

<!-- Kayıtlar bu çizginin altına, en yeni en üstte -->
