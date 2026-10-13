// Tekliflerim (14 Ekim): satış masasındaki dosyaların teklifleri. Bekleyen teklif bağlantıdan incelenip onaylanır.
import Link from "next/link";
import { getMember, isEmailVerified } from "@/lib/members";
import { dosyalarOfMember, onaylandiMi, teklifSuresiDoldu, toplam, trTarih, usd } from "@/lib/satis";
import Accent from "@/components/home/Accent";
import TeklifBagla from "@/components/profil/TeklifBagla";

export default async function TekliflerPage() {
  const m = await getMember();
  if (!m) return null;
  const dogrulandi = await isEmailVerified(m.id);
  const dosyalar = (await dosyalarOfMember(m, dogrulandi).catch(() => [])).filter((d) => d.data.kalemler.length > 0);

  return (
    <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--h-blue)]/60">Teklifler</p>
        <h2 className="mt-1.5 text-2xl font-bold text-[var(--h-blue)] md:text-3xl"><Accent text="Teklif*leriniz*" /></h2>
        {dosyalar.length === 0 ? (
          <p className="mt-6 rounded-[24px] bg-white p-6 text-sm text-[#5b6680] ring-1 ring-[var(--h-sky)]/60">Henüz hesabınıza bağlı bir teklif yok. {dogrulandi ? "Teklifiniz başka bir telefon ya da e-postayla hazırlandıysa yandan bağlatın." : "E-postanızı doğrulayınca bu adrese hazırlanmış teklifler kendiliğinden gelir."}</p>
        ) : (
          <div className="mt-6 space-y-3">
            {dosyalar.map((d) => {
              const onay = onaylandiMi(d.status);
              const doldu = !onay && teklifSuresiDoldu(d.data.gecerlilik);
              const st = onay ? { l: "Onaylandı", c: "bg-[#e8f3ec] text-[#2f7d55]" } : doldu ? { l: "Süresi doldu", c: "bg-[var(--h-white)] text-[#8a94ab]" } : d.status === "teklif" ? { l: "Yanıt bekliyor", c: "bg-[#fbf4e1] text-[#8a6a1c]" } : { l: "Hazırlanıyor", c: "bg-[var(--h-white)] text-[var(--h-blue)]" };
              return (
                <article key={d.id} className="rounded-[24px] bg-white p-5 ring-1 ring-[var(--h-sky)]/60 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] font-bold tracking-[0.12em] text-[#8a94ab]">{d.no}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${st.c}`}>{st.l}</span>
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-[#14213d]">{d.data.gidis ? `${trTarih(d.data.gidis)} – ${trTarih(d.data.donus)}` : "Umre teklifi"} · {d.data.yetiskin + d.data.cocuk} kişi</h3>
                  <p className="text-sm text-[#5b6680]">{usd(toplam(d.data))}{!onay && d.data.gecerlilik ? ` · ${trTarih(d.data.gecerlilik)} tarihine kadar` : ""}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {onay ? (
                      <Link href={`/profil/umrelerim/${d.no}`} className="inline-flex rounded-xl bg-[var(--h-blue)] px-4 py-2.5 text-sm font-bold text-white">Umre dosyasını aç</Link>
                    ) : (
                      <Link href={`/t/${d.token}`} className="inline-flex rounded-xl bg-[var(--h-blue)] px-4 py-2.5 text-sm font-bold text-white">{doldu ? "Teklifi gör" : "İncele ve onayla"}</Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <div className="lg:pt-[68px]"><TeklifBagla /></div>
    </section>
  );
}
