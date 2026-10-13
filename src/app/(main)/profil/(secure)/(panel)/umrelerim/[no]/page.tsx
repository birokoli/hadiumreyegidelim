// Umre dosyası (14 Ekim, satış masasına bağlı): aşama çizelgesi, yolculuk planı (uçuş, karşılama, oteller, tren, dönüş),
// belgeler, ödeme, ekipten not, voucher ve hazırlık listesi. Yalnızca dosyanın sahibi üye görür.
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMember, isEmailVerified } from "@/lib/members";
import { asamaLabel, BELGE_TURLERI, geceSayisi, getDosya, gunKaldi, listBelgeler, memberCanSee, odemeDagilimi, odenen, onaylandiMi, oteller, toplam, trTarih, usd, waNumara, type Kalem } from "@/lib/satis";
import { findDirectoryHotel, kaabaText } from "@/lib/catalog/hotel-directory";
import { getSiteSettings } from "@/lib/site-settings";
import HugIcon, { type HugIconName } from "@/components/icons/HugIcon";
import Accent from "@/components/home/Accent";
import { AsamaCizelgesi, GunSayaci, PlanKart } from "@/components/profil/umre";
import UcusFormu from "@/components/profil/UcusFormu";
import HazirlikListesi from "@/components/profil/HazirlikListesi";

const kisa = (iso?: string) => trTarih(iso, { day: "numeric", month: "short" });
const BELGE_IKON: Record<string, HugIconName> = { vize: "vize", otel: "otel", tren: "tren", ucak: "ucak", diger: "rehber" };

async function OtelKart({ k }: { k: Kalem }) {
  const o = k.otel;
  if (!o?.ad) return null;
  const mekke = k.tur === "otel_mekke";
  const h = o.slug && !o.slug.startsWith("svc:") ? await findDirectoryHotel(o.slug).catch(() => null) : null;
  const g = geceSayisi(o.giris, o.cikis);
  return (
    <PlanKart
      ikon={mekke ? "otel" : "medine"}
      ust={`${o.giris ? `${kisa(o.giris)} – ${kisa(o.cikis)} · ` : ""}${mekke ? "Mekke" : "Medine"}${g ? ` · ${g} gece` : ""}`}
      baslik={o.ad}
      alt={[h?.kaabaMeters != null && `${mekke ? "Kâbe'ye" : "Mescid-i Nebevi'ye"} ${kaabaText(h.kaabaMeters)}`, o.onayNo && `Onay no: ${o.onayNo}`, o.oda].filter(Boolean).join(" · ") || undefined}
    >
      {h && <Link href={`/oteller/${h.slug}`} className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--h-blue)]"><HugIcon name="konum" size={14} /> Haritada ve rehberde gör</Link>}
    </PlanKart>
  );
}

export default async function DosyaPage({ params }: { params: Promise<{ no: string }> }) {
  const m = await getMember();
  if (!m) return null;
  const d = await getDosya("no", decodeURIComponent((await params).no));
  if (!d || !onaylandiMi(d.status) || !memberCanSee(d, m, await isEmailVerified(m.id))) notFound();
  const [belgeler, settings] = await Promise.all([listBelgeler(d.id), getSiteSettings()]);
  const wa = (settings.WHATSAPP_NUMBER || "905404010038").replace(/\D/g, "");
  const x = d.data;
  const gun = d.status === "tamamlandi" ? null : gunKaldi(x.gidis);
  const ots = oteller(x);
  const t = toplam(x);
  const o = odenen(x);
  const dag = odemeDagilimi(x);
  const waKarsilama = waNumara(x.karsilayanTel) || wa;
  const kisiler = `${x.yetiskin} yetişkin${x.cocuk ? ` · ${x.cocuk} çocuk` : ""}${x.bebek ? ` · ${x.bebek} bebek` : ""}`;

  return (
    <div className="space-y-6">
      <section className="bg-deep on-dark relative overflow-hidden rounded-[28px] p-6 text-white md:p-8">
        <span aria-hidden className="hat pointer-events-none absolute -bottom-12 right-6 select-none text-[9rem] leading-none text-white/[0.05]">عمرة</span>
        <Link href="/profil/umrelerim" className="relative inline-flex items-center gap-1.5 text-[13px] text-white/70 hover:text-white"><HugIcon name="ok" size={14} className="rotate-180" /> Umrelerim</Link>
        <div className="relative mt-4 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--h-sand)]">Umre dosyası · {d.no} · {asamaLabel(d.status)}</p>
            <h2 className="mt-1 text-3xl font-bold leading-tight md:text-[40px]"><Accent text={x.gidis ? `${kisa(x.gidis)} – ${kisa(x.donus)} *umreniz*` : "Umre *dosyanız*"} /></h2>
            <p className="mt-1 text-sm text-white/75">{kisiler}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-white/10 px-5 py-4 ring-1 ring-white/15">
            <GunSayaci gun={gun} koyu />
            <div className="flex flex-col gap-2">
              <a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Merhaba, ${d.no} numaralı umre dosyam hakkında yazıyorum.`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[var(--h-sand)] px-4 py-2.5 text-[13px] font-bold text-[var(--h-blue-deep)]"><HugIcon name="mesaj" size={16} /> Dosyam hakkında yaz</a>
              <Link href={`/v/${d.token}`} target="_blank" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-4 py-2 text-[13px] font-bold text-white"><HugIcon name="rehber" size={16} /> Voucher</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-5">
          <div className="rounded-[28px] bg-white p-6 ring-1 ring-[var(--h-sky)]/60">
            <p className="text-[15px] font-bold text-[#14213d]">Dosyanızın durumu</p>
            <AsamaCizelgesi status={d.status} tarihler={x.asamaTarihleri} />
          </div>
          {t > 0 && (
            <div className="rounded-[28px] bg-white p-6 ring-1 ring-[var(--h-sky)]/60">
              <p className="text-[15px] font-bold text-[#14213d]">Ödeme</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--h-white)]"><div className="h-full rounded-full bg-[var(--h-blue)]" style={{ width: `${Math.min(100, Math.round((o / t) * 100))}%` }} /></div>
              <div className="mt-2 flex justify-between text-[13px]">
                <span className="text-[#5b6680]">Ödenen <b className="text-[#14213d]">{usd(o)}</b></span>
                <span className="text-[#5b6680]">Kalan <b className="text-[#14213d]">{usd(Math.max(0, t - o))}</b></span>
              </div>
              <p className="mt-1 text-xs text-[#8a94ab]">Toplam {usd(t)}{x.odemePlani === "bolunmus" ? ` · ${usd(dag.onden)} önden, ${usd(dag.varis)} Cidde'de` : ""}</p>
            </div>
          )}
        </aside>

        <div className="space-y-5">
          {d.status !== "tamamlandi" && <UcusFormu no={d.no} gidis={x.ucusGidis} donus={x.ucusDonus} />}
          <div className="rounded-[28px] bg-white p-6 ring-1 ring-[var(--h-sky)]/60">
            <p className="text-[15px] font-bold text-[#14213d]">Yolculuk planı</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <PlanKart ikon="ucak" ust={`${x.gidis ? `${kisa(x.gidis)} · ` : ""}Gidiş`} baslik={x.ucusGidis || "Uçuşunuz"} alt={x.ucusGidis ? undefined : "Uçuş bilgileriniz henüz eklenmedi"} />
              {x.karsilamaYeri && (
                <PlanKart ikon="transfer" ust={`${x.gidis ? `${kisa(x.gidis)} · ` : ""}Karşılama`} baslik={x.karsilamaYeri} alt={x.karsilayanAd ? `Sizi ${x.karsilayanAd} karşılayacak` : "Ekibimiz sizi karşılayacak"}>
                  <a href={`https://wa.me/${waKarsilama}?text=${encodeURIComponent(`Merhaba, ${d.no} numaralı dosya için karşılama hakkında yazıyorum.`)}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-[#e8f3ec] px-3 py-1.5 text-xs font-bold text-[#2f7d55]"><HugIcon name="mesaj" size={14} /> WhatsApp&apos;tan yazın</a>
                </PlanKart>
              )}
              {ots[0] && <OtelKart k={ots[0]} />}
              {x.tren && <PlanKart ikon="tren" ust="Haremeyn treni" baslik={x.tren} />}
              {ots.slice(1).map((k) => <OtelKart key={k.id} k={k} />)}
              {x.rehberAd && <PlanKart ikon="rehber" ust="Hocanız" baslik={x.rehberAd} alt={x.rehberTel} />}
              {(x.donus || x.donusTransfer || x.ucusDonus) && <PlanKart ikon="ucak" ust={`${x.donus ? `${kisa(x.donus)} · ` : ""}Dönüş`} baslik={x.ucusDonus || "Dönüş"} alt={x.donusTransfer} />}
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-[28px] bg-white p-6 ring-1 ring-[var(--h-sky)]/60">
              <p className="text-[15px] font-bold text-[#14213d]">Belgeleriniz</p>
              {belgeler.length === 0 ? <p className="mt-2 text-sm text-[#5b6680]">Vize, otel ve tren belgeleriniz hazır oldukça burada görünecek.</p> : (
                <div className="mt-2 divide-y divide-[#e1e6ef]">
                  {belgeler.map((b) => (
                    <a key={b.id} href={`/api/profil/belge/${b.id}`} className="flex items-center gap-3 py-3">
                      <HugIcon name={BELGE_IKON[b.tur] ?? "rehber"} size={20} className="text-[var(--h-blue)]" />
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm text-[#14213d]">{BELGE_TURLERI[b.tur] ?? "Belge"}</span><span className="block truncate text-xs text-[#8a94ab]">{b.ad}</span></span>
                      <span className="text-sm font-bold text-[var(--h-blue)]">İndir</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="rounded-[28px] bg-white p-6 ring-1 ring-[var(--h-sky)]/60">
              <p className="text-[15px] font-bold text-[#14213d]">Ekibimizden not</p>
              <p className="mt-2 font-['Noto_Serif',Georgia,serif] text-[16px] italic leading-relaxed text-[var(--h-blue)]">{x.musteriyeNot || "Sorunuz olursa dosya numaranızla WhatsApp'tan yazmanız yeterli; Rabbim umrenizi kolaylaştırsın."}</p>
              <Link href="/profil/kitaplik" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[var(--h-blue)]"><HugIcon name="rehber" size={18} /> Tavaf ve Sa&apos;y El Kitabı kitaplığınızda</Link>
            </div>
          </div>
          {d.status !== "tamamlandi" && <HazirlikListesi no={d.no} />}
        </div>
      </div>
    </div>
  );
}
