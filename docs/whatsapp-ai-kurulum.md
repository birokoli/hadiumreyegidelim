# WhatsApp AI Kurulumu

Sistem `whatsapp-web.js` ile WhatsApp Business uygulamasındaki **Bağlı Cihazlar** QR yöntemi üzerinden çalışır. Telefon uygulaması kullanılmaya devam eder.

## Gerekli ortam değişkenleri

- `GEMINI_API_KEY`: Google AI Studio'dan üretilen yeni ve gizli anahtar
- `GEMINI_WHATSAPP_MODEL`: İsteğe bağlı, varsayılan `gemini-2.0-flash`
- `WHATSAPP_BOT_URL`: Sürekli çalışan QR bot servisinin HTTPS adresi
- `WHATSAPP_BOT_TOKEN`: Site ve bot servisinde aynı olan uzun, rastgele servis anahtarı

## QR bot servisi

`services/whatsapp-bot` klasörü Docker destekli bir Railway/Render/VPS servisi olarak yayınlanır. Serviste şu değerler tanımlanır:

- `WEBSITE_URL=https://www.hadiumreyegidelim.com`
- `WHATSAPP_BOT_TOKEN=...`
- `WHATSAPP_SESSION_PATH=/data/.wwebjs_auth`

`/data` yolu kalıcı diske bağlanmalıdır. Böylece servis yeniden başladığında QR oturumu kaybolmaz.

Site tarafında aynı `WHATSAPP_BOT_TOKEN` ve servisin açık adresi `WHATSAPP_BOT_URL` olarak tanımlanır. Ardından admin panelindeki **QR Bağlantısı** sekmesinden kod okutulur.

## Güvenlik

Paylaşılmış veya sohbet ekranına yazılmış API anahtarları kullanılmamalıdır. Bu anahtarlar iptal edilip yenileri yalnızca sunucu ortam değişkenlerine eklenmelidir.
