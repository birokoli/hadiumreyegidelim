// Ana sayfa Ramazan 2027 bandı (25 Ekim, kullanıcı: "ana sayfanın en görünür alanına, paketlerden ayrı"). Hero'nun hemen altında.
// En düşük kişi başı fiyat rezervasyon sisteminden okunur; okunamazsa fiyatsız gösterilir.
import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/ui/kit";
import { ramazanDurumu } from "@/lib/ramazan";

const usd = (n: number) => `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $`;

export default async function RamazanBandi() {
  const d = await ramazanDurumu().catch(() => null);
  const acik = d?.secenekler.filter((s) => s.musait) ?? [];
  const enDusuk = acik.length ? Math.min(...acik.flatMap((s) => s.fiyatlar.map((f) => f.kisiBasiUsd))) : null;
  return (
    <section aria-labelledby="ramazan-bandi" className="w-full bg-white pt-6 md:pt-10">
      <Link href="/ramazan-umresi-paketi" className="group mx-auto block max-w-screen-xl px-4 md:px-8">
        <div className="bg-deep on-dark relative grid overflow-hidden rounded-3xl text-white shadow-[0_24px_50px_-24px_rgba(18,41,90,0.6)] md:grid-cols-[1.25fr_0.75fr]">
          <span aria-hidden className="hat pointer-events-none absolute -bottom-6 right-[38%] select-none text-[7rem] leading-none text-white/[0.05] md:text-[10rem]">رمضان</span>
          <div className="relative p-6 md:p-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--h-sand)] md:text-[12px]">Ramazan 2027 · Yer sınırlı</p>
            <h2 id="ramazan-bandi" className="mt-2 font-headline text-[26px] font-bold leading-[1.1] md:text-[40px]">Ramazan&apos;ı Mekke&apos;de geçirin</h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/80 md:text-[16px]">
              Ramazan&apos;ın tamamı ya da 15, 10, 5 gecesi. Sahur ve iftar dahil otel, umre vizesi ve transfer; tarihinizi seçin, yerinizi hemen ayırın.
            </p>
            <div className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-4">
              {enDusuk && (
                <div>
                  <p className="text-[12px] text-white/70">Kişi başı</p>
                  <p className="font-headline text-[32px] font-bold leading-none md:text-[38px]">{usd(enDusuk)}<span className="text-[15px] font-semibold text-white/70">&apos;dan</span></p>
                </div>
              )}
              <span className="inline-flex min-h-[50px] items-center gap-2 rounded-xl bg-[var(--h-sand)] px-6 text-[15px] font-bold text-[var(--h-blue-deep)] transition group-hover:brightness-95">
                Yerinizi ayırın <Arrow />
              </span>
            </div>
          </div>
          <div className="relative hidden min-h-[220px] md:block">
            <Image src="/images/oteller/safwah-al-talayie/01-giris.jpg" alt="Safwah Al Talayie oteli girişi, Mekke" fill sizes="(min-width: 1280px) 460px, 35vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#12295a] via-[#12295a]/20 to-transparent" />
            <span className="absolute bottom-4 right-4 rounded-lg bg-white/95 px-3 py-1.5 text-[12px] font-bold text-primary">7 Şubat – 9 Mart 2027</span>
          </div>
        </div>
      </Link>
    </section>
  );
}
