// Önizleme botlarına giden sabit teklif sayfası (src/lib/satis/onizleme.ts). Derlemede bir kez üretilir, veritabanına gitmez.
import { TEKLIF_ONIZLEME } from "@/lib/satis/onizleme";

export const dynamic = "force-static";
export const metadata = TEKLIF_ONIZLEME;

export default function TeklifOnizleme() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16">
      <section className="bg-deep on-dark rounded-[28px] p-6 text-white md:p-8">
        <h1 className="text-3xl font-bold">Umre teklifiniz hazır</h1>
        <p className="mt-2 text-sm text-white/80">Teklif detayını görmek için bağlantıya dokunun.</p>
      </section>
    </div>
  );
}
