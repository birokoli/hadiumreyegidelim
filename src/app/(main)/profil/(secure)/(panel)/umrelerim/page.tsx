// Umrelerim (13 Ekim): üyenin umre dosyaları (yaklaşan ve geçmiş) ve planlayıcıdan verdiği talepler.
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getMember, isEmailVerified } from "@/lib/members";
import { asamaLabel, dosyalarOfMember, gunKaldi, trTarih } from "@/lib/umre";
import HugIcon from "@/components/icons/HugIcon";
import Accent from "@/components/home/Accent";
import { AsamaCubugu } from "@/components/profil/umre";
import { orderStatus } from "@/components/profil/order-status";

export default async function UmrelerimPage() {
  const m = await getMember();
  if (!m) return null;
  const dogrulandi = await isEmailVerified(m.id);
  const [dosyalar, siparisler] = await Promise.all([
    dosyalarOfMember(m, dogrulandi).catch(() => []),
    prisma.order.findMany({ where: { userId: m.id }, orderBy: { createdAt: "desc" }, select: { id: true, status: true, pax: true, totalUSD: true, createdAt: true } }).catch(() => []),
  ]);
  const yaklasan = dosyalar.filter((d) => d.status !== "tamamlandi");
  const gecmis = dosyalar.filter((d) => d.status === "tamamlandi");

  const kart = (d: (typeof dosyalar)[number]) => {
    const gun = gunKaldi(d.data.gidis);
    return (
      <Link key={d.id} href={`/profil/umrelerim/${d.no}`} className="group block rounded-[28px] bg-white p-6 ring-1 ring-[var(--h-sky)]/60 transition hover:shadow-[0_24px_48px_-28px_rgba(18,41,90,0.5)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--h-blue)]/60">{d.no}</p>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${d.status === "tamamlandi" ? "bg-[#e8f3ec] text-[#2f7d55]" : "bg-[#fbf4e1] text-[#8a6a1c]"}`}>{asamaLabel(d.status)}</span>
        </div>
        <h3 className="mt-2 text-xl font-bold text-[var(--h-blue)]">{d.data.gidis ? `${trTarih(d.data.gidis)} – ${trTarih(d.data.donus, { day: "numeric", month: "long", year: "numeric" })}` : "Tarihler netleşiyor"}</h3>
        <p className="mt-0.5 text-sm text-[#5b6680]">
          {d.data.yetiskin} yetişkin{d.data.cocuk ? ` · ${d.data.cocuk} çocuk` : ""}
          {d.data.mekke?.ad ? ` · ${d.data.mekke.ad}` : ""}
          {gun != null && gun > 0 && d.status !== "tamamlandi" ? ` · ${gun} gün kaldı` : ""}
        </p>
        <div className="mt-4"><AsamaCubugu status={d.status} /></div>
        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--h-blue)]">Dosyayı aç <HugIcon name="ok" size={16} className="transition group-hover:translate-x-0.5" /></span>
      </Link>
    );
  };

  return (
    <div className="space-y-10">
      <section>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--h-blue)]/60">Umrelerim</p>
        <h2 className="mt-1.5 text-2xl font-bold text-[var(--h-blue)] md:text-3xl"><Accent text="Umre *dosyalarınız*" /></h2>
        {yaklasan.length === 0 && gecmis.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-[28px] border-2 border-dashed border-[var(--h-sky)] bg-white px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--h-white)] text-[var(--h-blue)]"><HugIcon name="paket" size={28} /></span>
            <p className="mt-4 text-lg font-bold text-[#14213d]">Henüz umre dosyanız yok</p>
            <p className="mt-1 max-w-md text-sm text-[#5b6680]">Teklifiniz onaylanınca satış ekibimiz dosyanızı açar; otelleriniz, karşılama, vize ve belgeleriniz burada görünür. Teklifinizi göremiyorsanız Teklifler sekmesinden bağlayabilirsiniz.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link href="/bireysel-umre" className="inline-flex items-center gap-2 rounded-2xl bg-[var(--h-blue)] px-5 py-3 text-sm font-bold text-white"><HugIcon name="takvim" size={18} className="text-[var(--h-sand)]" /> Umremi planla</Link>
              <Link href="/profil/teklifler" className="inline-flex items-center rounded-2xl border border-[var(--h-sky)] px-5 py-3 text-sm font-bold text-[var(--h-blue)]">Teklifler</Link>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">{yaklasan.map(kart)}</div>
        )}
      </section>
      {gecmis.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-[var(--h-blue)]">Geçmiş umreleriniz</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">{gecmis.map(kart)}</div>
        </section>
      )}
      {siparisler.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-[var(--h-blue)]">Planlayıcıdan talepleriniz</h3>
          <div className="mt-4 space-y-3">
            {siparisler.map((o) => {
              const st = orderStatus(o.status);
              return (
                <div key={o.id} className="flex flex-wrap items-center gap-x-8 gap-y-2 rounded-[22px] bg-white p-5 ring-1 ring-[var(--h-sky)]/60">
                  <p className="font-bold text-[#14213d]">#{o.id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-[#5b6680]">{new Date(o.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} · {o.pax} kişi · {o.totalUSD.toLocaleString("tr-TR")} $</p>
                  <span className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${st.cls}`}>{st.label}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
