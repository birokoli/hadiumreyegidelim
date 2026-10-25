// Voucher (umre hizmet belgesi, 14 Ekim): satıştan sonra WhatsApp'tan gönderilir. Telefonda açılır, yazdırılabilir.
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDosya, geceSayisi, KALEM_TURLERI, onaylandiMi, oteller, trTarih } from "@/lib/satis";
import { durakSayisi, rotaOf } from "@/lib/satis/ziyaret";
import ZiyaretRotasi from "@/components/satis/ZiyaretRotasi";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Umre belgesi (voucher)" };
import YazdirDugmesi from "@/components/profil/YazdirDugmesi";

const Satir = ({ k, v }: { k: string; v?: string | null }) => (v ? <div className="flex gap-3 border-b border-[#e1e6ef] py-2 text-sm last:border-0"><dt className="w-36 shrink-0 text-[#5b6680]">{k}</dt><dd className="font-semibold text-[#14213d]">{v}</dd></div> : null);

export default async function Voucher({ params }: { params: Promise<{ token: string }> }) {
  const d = await getDosya("token", (await params).token);
  if (!d || !onaylandiMi(d.status)) notFound();
  const x = d.data;
  const ots = oteller(x);
  const hizmet = x.kalemler.filter((k) => !k.tur.startsWith("otel_"));
  const rotalar = hizmet.map((k) => rotaOf(k.rota)).filter((r): r is NonNullable<typeof r> => !!r);
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 print:max-w-none print:px-0">
      <article className="overflow-hidden rounded-[24px] bg-white ring-1 ring-[var(--h-sky)]/60 print:rounded-none print:ring-0">
        <div className="bg-deep on-dark relative flex items-end justify-between gap-4 p-6 text-white print:[-webkit-print-color-adjust:exact] print:[print-color-adjust:exact]">
          <span aria-hidden className="hat pointer-events-none absolute -bottom-10 right-4 select-none text-[8rem] leading-none text-white/[0.06]">عمرة</span>
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--h-sand)]">Umre hizmet belgesi · Voucher</p>
            <h1 className="mt-1 text-2xl font-bold md:text-3xl">{x.musteriAdi}</h1>
            <p className="text-sm text-white/80">{x.yetiskin} yetişkin{x.cocuk ? `, ${x.cocuk} çocuk` : ""}{x.bebek ? `, ${x.bebek} bebek` : ""}{x.gidis ? ` · ${trTarih(x.gidis)} – ${trTarih(x.donus, { day: "numeric", month: "long", year: "numeric" })}` : ""}</p>
          </div>
          <div className="relative text-right">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">Dosya no</p>
            <p className="font-mono text-lg font-bold text-[var(--h-sand)]">{d.no}</p>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {ots.length > 0 && (
            <section>
              <h2 className="border-b-2 border-[var(--h-blue)] pb-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--h-blue)]">Konaklama</h2>
              <table className="mt-2 w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-[#8a94ab]"><tr><th className="py-2">Otel</th><th>Giriş</th><th>Çıkış</th><th>Gece</th><th>Oda</th><th>Onay no</th></tr></thead>
                <tbody className="divide-y divide-[#e1e6ef]">
                  {ots.map((k) => (
                    <tr key={k.id}>
                      <td className="py-2.5 pr-2"><b className="text-[#14213d]">{k.otel?.ad}</b><span className="block text-xs text-[#8a94ab]">{k.tur === "otel_mekke" ? "Mekke" : "Medine"}</span></td>
                      <td className="pr-2">{trTarih(k.otel?.giris, { day: "numeric", month: "short" })}</td>
                      <td className="pr-2">{trTarih(k.otel?.cikis, { day: "numeric", month: "short" })}</td>
                      <td className="pr-2">{geceSayisi(k.otel?.giris, k.otel?.cikis) || "—"}</td>
                      <td className="pr-2">{[k.adet > 1 ? `${k.adet} ×` : "", k.otel?.oda].filter(Boolean).join(" ") || "—"}</td>
                      <td className="font-mono font-bold text-[var(--h-blue)]">{k.otel?.onayNo || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <section>
            <h2 className="border-b-2 border-[var(--h-blue)] pb-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--h-blue)]">Yolculuk</h2>
            <dl className="mt-1">
              <Satir k="Gidiş uçuşu" v={x.ucusGidis} />
              <Satir k="Karşılama" v={[x.karsilamaYeri, x.karsilayanAd, x.karsilayanTel].filter(Boolean).join(" · ")} />
              <Satir k="Hoca / rehber" v={[x.rehberAd, x.rehberTel].filter(Boolean).join(" · ")} />
              <Satir k="Tren" v={x.tren} />
              <Satir k="Dönüş transferi" v={x.donusTransfer} />
              <Satir k="Dönüş uçuşu" v={x.ucusDonus} />
            </dl>
          </section>

          {hizmet.length > 0 && (
            <section>
              <h2 className="border-b-2 border-[var(--h-blue)] pb-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--h-blue)]">Dahil hizmetler</h2>
              <ul className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2">
                {hizmet.map((k) => {
                  const r = rotaOf(k.rota);
                  return <li key={k.id} className="text-[#14213d]">✓ {r?.ad ?? (k.ad || KALEM_TURLERI[k.tur].label)}{r ? <span className="text-[#5b6680]"> · {durakSayisi(r)} durak</span> : k.aciklama ? <span className="text-[#5b6680]"> · {k.aciklama}</span> : null}</li>;
                })}
              </ul>
            </section>
          )}

          {rotalar.length > 0 && (
            <section>
              <h2 className="border-b-2 border-[var(--h-blue)] pb-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--h-blue)]">Ziyaret turları</h2>
              <div className={`mt-4 grid gap-6 ${rotalar.length > 1 ? "sm:grid-cols-2 print:grid-cols-2" : ""}`}>
                {rotalar.map((r) => <ZiyaretRotasi key={r.ad} rota={r} sikisik />)}
              </div>
            </section>
          )}

          {x.musteriyeNot && <p className="rounded-2xl bg-[var(--h-white)] p-4 font-['Noto_Serif',Georgia,serif] italic text-[var(--h-blue)]">{x.musteriyeNot}</p>}

          <section className="flex flex-wrap items-center justify-between gap-4 border-t border-[#e1e6ef] pt-4">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Hadi Umreye Gidelim" width={52} height={54} />
              <div className="text-xs text-[#5b6680]"><p><b className="text-[#14213d]">Hadi Umreye Gidelim</b> · hadiumreyegidelim.com</p><p>WhatsApp +90 540 401 00 38 · info@hadiumreyegidelim.com</p></div>
            </div>
            <YazdirDugmesi />
          </section>
        </div>
      </article>
      <p className="mt-4 text-center text-xs text-[#8a94ab] print:hidden">Bu belgeyi telefonunuza kaydedin; havalimanında ve otelde göstermeniz yeterli.</p>
    </div>
  );
}
