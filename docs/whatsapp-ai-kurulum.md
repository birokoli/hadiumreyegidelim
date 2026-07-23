# WhatsApp AI Kurulumu

Sistem WhatsApp Business Cloud API üzerinden çalışır. Gizli değerler GitHub'a veya yönetim paneline yazılmaz; Vercel proje ortam değişkenlerinde tutulur.

## Gerekli ortam değişkenleri

- `GEMINI_API_KEY`: Google AI Studio'dan üretilen yeni ve gizli anahtar
- `GEMINI_WHATSAPP_MODEL`: İsteğe bağlı, varsayılan `gemini-2.0-flash`
- `WHATSAPP_ACCESS_TOKEN`: Meta kalıcı sistem kullanıcısı erişim anahtarı
- `WHATSAPP_PHONE_NUMBER_ID`: WhatsApp telefon numarası kimliği
- `WHATSAPP_VERIFY_TOKEN`: Sizin belirleyeceğiniz uzun, rastgele webhook doğrulama değeri
- `WHATSAPP_APP_SECRET`: Meta uygulama sırrı; webhook imzasını doğrular

## Meta webhook

- Callback URL: `https://www.hadiumreyegidelim.com/api/whatsapp/webhook`
- Verify token: Vercel'deki `WHATSAPP_VERIFY_TOKEN` ile aynı olmalı
- Abone olunacak alan: `messages`

Bağlantı tamamlanmadan yönetim panelindeki otomatik yanıt anahtarını açmayın. Önce “Yanıt Testi” sekmesinden satış asistanının cevaplarını doğrulayın.

## Güvenlik

Paylaşılmış veya sohbet ekranına yazılmış API anahtarları kullanılmamalıdır. Bu anahtarlar iptal edilip yenileri yalnızca sunucu ortam değişkenlerine eklenmelidir.
