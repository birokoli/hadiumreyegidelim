// Üyelere özel kampanya kartı (Profil 2, 14 Ekim): tarih, oteller, dahil olanlar, üye fiyatı, kalan yer; altta talep düğmesi.
import Image from "next/image";
import Link from "next/link";
import Accent from "@/components/home/Accent";
import HugIcon from "@/components/icons/HugIcon";
import KampanyaTalep from "@/components/profil/KampanyaTalep";
import { donemLabel, geceToplam, kampanyaDonem, trGun, usdTam, type Kampanya } from "@/lib/uye-kampanya/ortak";

export const KAMPANYA_GORSEL = "/images/hero-kabe.jpg";

export default function KampanyaKart({ k, kalan, eslesme, talepNo, telefonVar, varsayilanKisi }: { k: Kampanya; kalan: number | null; eslesme: boolean; talepNo?: string; telefonVar: boolean; varsayilanKisi: number }) {
  const gece = geceToplam(k);
  const dahil = k.dahil.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
  const indirim = k.normalFiyat && k.uyeFiyat && k.normalFiyat > k.uyeFiyat ? Math.round(k.normalFiyat - k.uyeFiyat) : null;
  return (
    <article className="overflow-hidden rounded-[28px] bg-white ring-1 ring-[var(--h-sky)]/60">
      <div className="relative h-44 md:h-52">
        <Image src={k.gorsel || KAMPANYA_GORSEL} alt="" fill sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12295a]/90 via-[#12295a]/35 to-transparent" />
        {k.hat && <span aria-hidden className="hat pointer-events-none absolute -bottom-4 right-4 select-none text-[5rem] leading-none text-white/[0.12]">{k.hat}</span>}
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[var(--h-sand)] px-3 py-1 text-[11px] font-bold text-[var(--h-blue-deep)]">Üyelere özel</span>
          {eslesme && <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[var(--h-blue)]">Planınıza uygun</span>}
        </div>
        <div className="absolute inset-x-5 bottom-4 text-white">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--h-sand)]">
            {k.gidis ? `${trGun(k.gidis)} – ${trGun(k.donus, { day: "numeric", month: "long", year: "numeric" })}` : donemLabel(kampanyaDonem(k))}
            {gece ? ` · ${gece} gece` : ""}
          </p>
          <h3 className="mt-1 text-xl font-bold leading-snug md:text-2xl"><Accent text={k.baslik} /></h3>
        </div>
      </div>
      <div className="space-y-4 p-5 md:p-6">
        {k.aciklama && <p className="text-sm leading-relaxed text-[#3d4a66]">{k.aciklama}</p>}
        {(k.mekkeOtel || k.medineOtel) && (
          <div className="grid gap-2 sm:grid-cols-2">
            {k.mekkeOtel && (
              <div className="flex items-center gap-3 rounded-2xl bg-[var(--h-white)] p-3">
                <HugIcon name="otel" size={20} className="text-[var(--h-blue)]" />
                <span className="text-sm"><span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--h-blue)]/60">Mekke{k.mekkeGece ? ` · ${k.mekkeGece} gece` : ""}</span><b className="text-[#14213d]">{k.mekkeOtel}</b></span>
              </div>
            )}
            {k.medineOtel && (
              <div className="flex items-center gap-3 rounded-2xl bg-[var(--h-white)] p-3">
                <HugIcon name="medine" size={20} className="text-[var(--h-blue)]" />
                <span className="text-sm"><span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--h-blue)]/60">Medine{k.medineGece ? ` · ${k.medineGece} gece` : ""}</span><b className="text-[#14213d]">{k.medineOtel}</b></span>
              </div>
            )}
          </div>
        )}
        {dahil.length > 0 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-[#3d4a66]">
            {dahil.map((d) => <li key={d} className="flex items-center gap-1.5"><HugIcon name="onay" size={14} className="text-[#2f7d55]" />{d}</li>)}
          </ul>
        )}
        <div className="flex flex-wrap items-end justify-between gap-3 border-t border-[#e1e6ef] pt-4">
          <div>
            {k.uyeFiyat != null ? (
              <>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8a94ab]">Üye fiyatı · kişi başı</p>
                <p className="flex items-baseline gap-2">
                  <b className="text-3xl font-bold text-[var(--h-blue)]">{usdTam(k.uyeFiyat)}</b>
                  {k.normalFiyat != null && k.normalFiyat > k.uyeFiyat && <s className="text-sm text-[#8a94ab]">{usdTam(k.normalFiyat)}</s>}
                </p>
                {indirim && <p className="text-xs font-bold text-[#2f7d55]">Üyelere kişi başı {usdTam(indirim)} daha uygun</p>}
              </>
            ) : (
              <p className="text-sm font-bold text-[#14213d]">Fiyat teklifle bildirilir</p>
            )}
          </div>
          <div className="text-right text-xs text-[#5b6680]">
            {kalan != null && <p className={kalan <= 6 ? "font-bold text-[#b8862f]" : ""}>{kalan} kişilik yer kaldı</p>}
            {k.sonTarih && <p>Son başvuru {trGun(k.sonTarih)}</p>}
          </div>
        </div>
        {talepNo ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#e8f3ec] p-4">
            <p className="text-sm text-[#1f5c3d]"><b>Talebiniz alındı</b> · dosya {talepNo}. Ekibimiz WhatsApp&apos;tan dönecek.</p>
            <Link href="/profil/teklifler" className="text-sm font-bold text-[#1f5c3d] underline underline-offset-4">Tekliflerim</Link>
          </div>
        ) : (
          <KampanyaTalep kampanyaId={k.id} kalan={kalan} telefonVar={telefonVar} varsayilanKisi={varsayilanKisi} />
        )}
      </div>
    </article>
  );
}
