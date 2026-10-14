// Size Özel (Profil 2, 14 Ekim): üyelere ayrılan umre tarihleri. Umre planı dolduysa dönemi tutan kampanyalar önce gelir.
import Link from "next/link";
import { getMember } from "@/lib/members";
import { donemSecenekleri, getTercih, planaGoreSirala, uyeKampanyaTalepleri, yayindakiKampanyalar } from "@/lib/uye-kampanya";
import Accent from "@/components/home/Accent";
import HugIcon from "@/components/icons/HugIcon";
import KampanyaKart from "@/components/profil/KampanyaKart";
import UmrePlanim from "@/components/profil/UmrePlanim";

export default async function SizeOzelPage() {
  const m = await getMember();
  if (!m) return null;
  const [tercih, kampanyalar, talepler] = await Promise.all([getTercih(m.id, m.email), yayindakiKampanyalar(), uyeKampanyaTalepleri(m.id)]);
  const liste = planaGoreSirala(kampanyalar, tercih);
  // Sunucu bileşeninde "şimdi" bir kez okunur; seçenekler ayın başından üretilir
  const donemler = donemSecenekleri(new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--h-blue)]/60">Size özel</p>
          <h2 className="mt-1.5 text-2xl font-bold text-[var(--h-blue)] md:text-3xl"><Accent text="Üyelerimize *ayrılan tarihler*" /></h2>
          <p className="mt-1 max-w-2xl text-sm text-[#5b6680]">Bu tarihler ve fiyatlar yalnızca üyelerimize açıktır. Kontenjan dolunca ya da son başvuru tarihi geçince kapanır.</p>
        </div>
        {!tercih.izinEposta && !tercih.izinWhatsapp && (
          <Link href="/profil/hesap#iletisim" className="inline-flex items-center gap-2 rounded-2xl border border-[var(--h-sky)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--h-blue)]">
            <HugIcon name="eposta" size={18} /> Yeni tarihlerden haberdar olun
          </Link>
        )}
      </div>

      <UmrePlanim plan={{ planDonem: tercih.planDonem, planKisi: tercih.planKisi, planKimle: tercih.planKimle, planOtel: tercih.planOtel }} donemler={donemler} />

      {liste.length === 0 ? (
        <div className="relative overflow-hidden rounded-[28px] bg-white p-8 text-center ring-1 ring-[var(--h-sky)]/60">
          <span aria-hidden className="hat pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 select-none text-[7rem] leading-none text-[var(--h-blue)]/[0.05]">قريبا</span>
          <p className="relative text-lg font-bold text-[var(--h-blue)]">Yeni tarihler hazırlanıyor</p>
          <p className="relative mx-auto mt-1 max-w-md text-sm text-[#5b6680]">Üyelere özel bir tarih açıldığında burada görünür{tercih.izinEposta || tercih.izinWhatsapp ? "; size de haber veririz." : ". Haber almak için iletişim tercihlerinizi açın."}</p>
          <Link href="/bireysel-umre" className="relative mt-5 inline-flex items-center gap-2 rounded-2xl bg-[var(--h-blue)] px-5 py-3 text-sm font-bold text-white"><HugIcon name="takvim" size={18} className="text-[var(--h-sand)]" /> Kendi tarihinizle planlayın</Link>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {liste.map((k) => (
            <KampanyaKart key={k.id} k={k} kalan={k.kalan} eslesme={k.eslesme} talepNo={talepler[k.id]} telefonVar={!!m.phone} varsayilanKisi={tercih.planKisi ?? 2} />
          ))}
        </div>
      )}
    </div>
  );
}
