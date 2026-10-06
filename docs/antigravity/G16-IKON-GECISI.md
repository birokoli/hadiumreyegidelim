# G16 · Marka ikon setine geçiş (sitenin herkese açık kısmı) (6 Ekim)

Kurallar G8–G15 ile aynı: commit/push yok; yalnızca listelenen klasörler; "bu arada" düzeltme yok; `npx tsc --noEmit` + `npx eslint <dosyalar>` temiz; kanıt (önce/sonra yerel ekran görüntüleri: ana sayfa, /bireysel-umre, bir paket sayfası, /iletisim, /sss, bir otel sayfası) TESLIM.md en üstüne tek "G16" kaydı.

## Bileşen (Claude yaptı, DOKUNMA)
`src/components/icons/HugIcon.tsx` → `<HugIcon name="otel" size={24} className="text-primary" />`. Renk yazı rengini (currentColor) alır. 32 ikon: `/kit/ikonlar` sayfasında hepsi ve adları.

## Kapsam
Yalnızca herkese açık site: `src/app/(main)/**`, `src/components/{home,planner,packages,help,reviews,blog,features,ui,content,seo}/**`. Admin (`src/app/(admin)`, `src/components/admin`) KAPSAM DIŞI.

## Eşleme (Material Symbols / elle çizilmiş SVG → HugIcon)
| Eski | Yeni |
|---|---|
| hotel, apartment, bed | otel |
| flight, flight_takeoff | ucak |
| directions_car, airport_shuttle, local_taxi | transfer |
| train | tren |
| luggage, work, shopping_bag (paket anlamında) | paket |
| group, groups, family_restroom | aile |
| child_friendly, stroller | bebek |
| verified, verified_user, shield | guven |
| check_circle, task_alt | onay |
| arrow_forward, east, chevron_right (bağlantı oku olarak) | ok |
| search | ara |
| calendar_month, event, schedule, calendar_add_on | takvim |
| call, phone | telefon |
| chat, forum, sms | mesaj |
| mail, email | eposta |
| location_on, place, pin_drop | konum |
| sell, payments, price_check | fiyat |
| menu_book, auto_stories, library_books | rehber |
| stars, star, reviews | yorum |
| info | bilgi |
| person (bireysel umre anlamında) | bireysel |
| description, badge (vize anlamında) | vize |
| mosque | medine |

Ana sayfadaki "Hızlı erişim" şeridi (`src/app/(main)/page.tsx` → `QUICK_LINKS`, elle çizilmiş SVG'ler): Umre paketleri→paket, Bireysel umre→bireysel, Umre vizesi→vize, Otel ve konaklama→otel, Transfer ve tren→transfer, Rehberlik→rehber, İlk umrem→ilk, Hanım umresi→hanim.

## DEĞİŞTİRME
Arayüz kontrolleri Material kalır: close, menu, add, remove, expand_more/less, chevron_left, arrow_back, progress_activity, play_arrow, logout, toc, image, camera_enhance, content_copy. WhatsApp logosu kalır. Eşlemede olmayan ikonu tahminle değiştirme, listele.

Boyut: eski `text-[Npx]` neyse `size={N}`; renk sınıfları aynen `className`'e. Hizalama bozulmasın (inline-flex kapsayıcılarda `align-middle` gerekebilir).
