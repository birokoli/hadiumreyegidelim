// Ana sayfa Ramazan 2027 bandı (25 Ekim, kullanıcı). Kitapçık bantlarıyla aynı dil: lacivert kart, solda metin ve kum düğme,
// sağda kartın dışına taşan ve süzülen görsel (sivri kemer çerçevede Kâbe; logodaki i noktasının biçimi). Hızlı erişim ikonlarının
// altında, eski Tavaf kitapçığı bandının yerinde. En düşük kişi başı fiyat rezervasyon sisteminden okunur.
import Image from "next/image";
import Link from "next/link";
import Accent from "@/components/home/Accent";
import { Arrow } from "@/components/ui/kit";
import { ramazanDurumu } from "@/lib/ramazan";

const usd = (n: number) => `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;
// Sivri kemer (logodaki i noktası): alt köşeler düz; iki yay tepede sivri birleşir. Kemer yüksekliği / genişlik = 0,75
const KEMER = "polygon(0% 100%, 0% 53%, 0.4% 47.4%, 1.6% 41.8%, 3.5% 36.4%, 6.2% 31.1%, 9.6% 26%, 13.6% 21.2%, 18.4% 16.6%, 23.7% 12.5%, 29.6% 8.7%, 36% 5.3%, 42.8% 2.4%, 50% 0%, 57.2% 2.4%, 64% 5.3%, 70.4% 8.7%, 76.3% 12.5%, 81.6% 16.6%, 86.4% 21.2%, 90.4% 26%, 93.8% 31.1%, 96.5% 36.4%, 98.4% 41.8%, 99.6% 47.4%, 100% 53%, 100% 100%)";

export default async function RamazanBandi() {
  const d = await ramazanDurumu().catch(() => null);
  const acik = d?.secenekler.filter((s) => s.musait) ?? [];
  const enDusuk = acik.length ? Math.min(...acik.flatMap((s) => s.fiyatlar.map((f) => f.kisiBasiUsd))) : null;
  return (
    <section aria-labelledby="ramazan-bandi" className="w-full max-w-screen-xl mx-auto px-4 md:px-8 pt-8 md:pt-16 md:pb-6">
      <Link href="/ramazan-umresi-paketi" data-press className="group relative block rounded-3xl text-white">
        <div aria-hidden className="bg-deep absolute inset-0 overflow-hidden rounded-3xl">
          <span className="hat pointer-events-none absolute -left-4 -bottom-12 select-none text-[7rem] leading-none text-white/[0.05] md:text-[9rem]">رمضان</span>
        </div>
        <div className="on-dark relative px-6 py-6 md:py-7 md:pl-9 md:pr-72">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--h-sand)]">Ramazan 2027<span className="hidden md:inline"> · 7 Şubat – 9 Mart</span> · Yer sınırlı</p>
          <h2 id="ramazan-bandi" className="mt-1.5 font-headline text-2xl md:text-[30px] leading-tight font-bold"><Accent text="Ramazan'ı *Mekke'de* geçirin" /></h2>
          <p className="mt-1.5 text-sm md:text-[15px] text-white/80 max-w-2xl">
            Ramazan&apos;ın tamamı ya da 15, 10, 5 gecesi. Sahur ve iftar dahil otel, umre vizesi ve transfer; tarihinizi seçin, yerinizi hemen ayırın.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="inline-flex items-center gap-2 rounded-xl bg-[var(--h-sand)] px-5 py-2.5 text-sm font-bold text-[var(--h-blue-deep)] transition group-hover:brightness-95">
              Yerinizi ayırın <Arrow />
            </span>
            {enDusuk && (
              <span className="text-sm text-white/75">
                Kişi başı <b className="font-headline text-[22px] font-bold text-white">{usd(enDusuk)}</b>&apos;dan
              </span>
            )}
          </div>
        </div>
        <div className="kitap-suzul pointer-events-none absolute right-10 top-1/2 hidden h-[calc(100%+72px)] aspect-[640/905] md:block lg:right-16">
          <div className="relative h-full w-full drop-shadow-[0_24px_30px_rgba(18,41,90,0.55)]">
            <div className="absolute inset-0 overflow-hidden" style={{ clipPath: KEMER }}>
              <Image src="/images/hero-kabe.jpg" alt="Mescid-i Haram'da Kâbe" fill sizes="220px" className="object-cover object-[42%_center]" />
            </div>
            <span className="absolute inset-x-3 bottom-3 rounded-lg bg-white/95 px-2 py-1.5 text-center text-[11px] font-bold text-primary">30 · 15 · 10 · 5 gece</span>
          </div>
        </div>
      </Link>
    </section>
  );
}
