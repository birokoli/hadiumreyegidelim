// Kitaplığım (13 Ekim): üyelere özel şavt modu ve PDF'ler.
import { KITAPCIK_LISTESI } from "@/lib/kitapcik";
import HugIcon, { type HugIconName } from "@/components/icons/HugIcon";
import Accent from "@/components/home/Accent";
import KitapKart from "@/components/profil/KitapKart";

const OZELLIK: { ikon: HugIconName; baslik: string; metin: string }[] = [
  { ikon: "tavaf", baslik: "Şavt şavt", metin: "Her ekran bir şavt. Şavtı bitirince alttaki düğmeyle bir sonrakine geçin." },
  { ikon: "dua", baslik: "Büyük yazı", metin: "Yazıyı kalabalıkta rahat okuyacağınız boyuta büyütün." },
  { ikon: "onay", baslik: "Kaldığınız yer", metin: "Telefon kilitlense de, sayfa kapansa da kaldığınız şavttan devam eder." },
  { ikon: "bilgi", baslik: "Ekran açık", metin: "Okurken telefonunuzun ekranı kararmaz." },
];

export default function KitaplikPage() {
  return (
    <div className="space-y-10">
      <section>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--h-blue)]/60">Kitaplığım</p>
        <h2 className="mt-1.5 text-2xl font-bold text-[var(--h-blue)] md:text-3xl"><Accent text="Tavafta ve sa'yde *yanınızda*" /></h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {KITAPCIK_LISTESI.map((k) => <KitapKart key={k.slug} k={k} buyuk />)}
        </div>
      </section>
      <section className="rounded-[28px] bg-white p-6 ring-1 ring-[var(--h-sky)]/50 md:p-8">
        <h3 className="text-lg font-bold text-[var(--h-blue)]">Şavt modu nasıl çalışır?</h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {OZELLIK.map((o) => (
            <div key={o.baslik}>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--h-white)] text-[var(--h-blue)]"><HugIcon name={o.ikon} size={24} /></span>
              <p className="mt-3 font-bold text-[#14213d]">{o.baslik}</p>
              <p className="mt-1 text-sm leading-snug text-[#5b6680]">{o.metin}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 rounded-2xl bg-[var(--h-white)] px-4 py-3 text-sm text-[#3d4a66]">
          İpucu: Harem&apos;e girmeden önce kitapçığı bir kez açın; sayfa telefonunuzda hazır kalır. Şavtlara özel farz ya da sünnet bir dua yoktur; dilediğiniz duayı kendi dilinizle de edebilirsiniz.
        </p>
      </section>
    </div>
  );
}
