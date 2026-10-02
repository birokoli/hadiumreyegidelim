# Ölü Kod ve Eski Planlayıcı Envanteri (G7-6)

Tarih: 2 Ekim 2026  
Amaç: Yeni planlayıcıya geçiş ve il sayfalarının yenilenmesi sonrası kullanılmayan eski bileşen, API ve durum dosyalarının envanteri.

---

## İçe Aktarma ve Kullanım Analiz Tablosu

| Dosya / Bileşen | Kim İçe Aktarıyor (Dosya:Satır) | Silinebilir mi? (Evet/Hayır + Neden) |
|---|---|---|
| `src/components/features/BireyselUmreClient.tsx` | Yok (0 içe aktarma; `[slug]/page.tsx` yenilendi) | **Evet** — Eski adımlı planlayıcı istemci bileşeni. Hiçbir aktif sayfada kullanılmıyor. |
| `src/components/layout/ConfiguratorSummary.tsx` | `src/components/features/BireyselUmreClient.tsx:6,344` | **Evet** — Yalnızca ölü `BireyselUmreClient` tarafından kullanılıyor. |
| `src/app/api/flights/route.ts` | `src/components/features/BireyselUmreClient.tsx:52,95` | **Evet** — RapidAPI Google Flights arama API uç noktası. Canlıda 503 veriyordu ve uçuş satılmıyor. |
| `useUmrahStore` / `PlannerContext` | Yok (0 içe aktarma) | **Evet** — Projede bu isimle aktif bir Zustand/Context store bulunmuyor. |
| `src/components/home/UmrePlanner.tsx` | `src/app/(main)/page.tsx:7,132` | **Hayır** — Ana sayfadaki aktif WhatsApp hızlı teklif çubuğudur. Uçuş API'sine bağlanmaz, kullanılmaya devam ediyor. |

---

Not: Bu paket kapsamında hiçbir dosya silinmemiştir. Silme işlemi Claude tarafından kontrollü olarak gerçekleştirilecektir.
