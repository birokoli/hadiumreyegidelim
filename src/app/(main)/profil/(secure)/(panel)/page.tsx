// Profil özeti (14 Ekim, satış masasına bağlı): yaklaşan umre (gün sayacı, aşama, otel ve karşılama), sizden beklenenler,
// yanıt bekleyen teklif, kitaplık ve admin'den eklenen kampanya.
import Image from "next/image";
import Link from "next/link";
import { getMember, isEmailVerified } from "@/lib/members";
import { asamaLabel, dosyalarOfMember, gunKaldi, onaylandiMi, oteller, profilKampanyalari, toplam, trTarih, usd } from "@/lib/satis";
import { getSiteSettings } from "@/lib/site-settings";
import HugIcon from "@/components/icons/HugIcon";
import Accent from "@/components/home/Accent";
import { AsamaCubugu, GunSayaci, PlanKart } from "@/components/profil/umre";

export default async function ProfilOzet() {
  const m = await getMember();
  if (!m) return null;
  const dogrulandi = await isEmailVerified(m.id);
  const [dosyalar, kampanyalar, settings] = await Promise.all([dosyalarOfMember(m, dogrulandi).catch(() => []), profilKampanyalari(), getSiteSettings()]);
  const wa = (settings.WHATSAPP_NUMBER || "905404010038").replace(/\D/g, "");
  const aktif = dosyalar.filter((d) => onaylandiMi(d.status) && d.status !== "tamamlandi").sort((a, b) => (a.data.gidis ?? "9999").localeCompare(b.data.gidis ?? "9999"))[0];
  const bekleyen = dosyalar.find((d) => d.status === "teklif" && d.data.kalemler.length);
  const kampanya = kampanyalar.find((k) => k.aktif);
  const gun = aktif ? gunKaldi(aktif.data.gidis) : null;
  const ots = aktif ? oteller(aktif.data) : [];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
      {aktif ? (
        <section className="relative overflow-hidden rounded-[28px] bg-white p-6 ring-1 ring-[var(--h-sky)]/60 md:p-8">
          <span aria-hidden className="hat pointer-events-none absolute -bottom-10 -right-2 select-none text-[8rem] leading-none text-[var(--h-blue)]/[0.05]">عمرة</span>
          <div className="relative flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--h-blue)]/60">Yaklaşan umreniz · {aktif.no}</p>
            <span className="rounded-full bg-[#fbf4e1] px-3 py-1 text-xs font-bold text-[#8a6a1c]">{asamaLabel(aktif.status)}</span>
          </div>
          <div className="relative mt-4 flex flex-wrap items-end gap-x-6 gap-y-2">
            <GunSayaci gun={gun} />
            <div className="mb-1.5 text-sm text-[#5b6680] md:border-l md:border-[#e1e6ef] md:pl-6">
              <b className="block text-base text-[#14213d]">{aktif.data.gidis ? `${trTarih(aktif.data.gidis)} – ${trTarih(aktif.data.donus, { day: "numeric", month: "long", year: "numeric" })}` : "Tarihler netleşiyor"}</b>
              {aktif.data.yetiskin} yetişkin{aktif.data.cocuk ? ` · ${aktif.data.cocuk} çocuk` : ""}
            </div>
          </div>
          <div className="relative mt-6"><AsamaCubugu status={aktif.status} etiketli /></div>
          <div className="relative mt-6 grid gap-3 md:grid-cols-3">
            {aktif.data.karsilamaYeri && <PlanKart ikon="transfer" ust="Karşılama" baslik={aktif.data.karsilamaYeri} alt={aktif.data.karsilayanAd} />}
            {ots.map((k) => <PlanKart key={k.id} ikon={k.tur === "otel_mekke" ? "otel" : "medine"} ust={k.tur === "otel_mekke" ? "Mekke" : "Medine"} baslik={k.otel?.ad ?? ""} alt={k.otel?.giris ? `${trTarih(k.otel.giris, { day: "numeric", month: "short" })} → ${trTarih(k.otel.cikis, { day: "numeric", month: "short" })}` : undefined} />)}
          </div>
          <div className="relative mt-6 flex flex-wrap gap-2">
            <Link href={`/profil/umrelerim/${aktif.no}`} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--h-blue)] px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-[var(--h-blue-deep)]"><HugIcon name="paket" size={18} className="text-[var(--h-sand)]" /> Dosyamı aç</Link>
            <a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Merhaba, ${aktif.no} numaralı umre dosyam hakkında yazıyorum.`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-[var(--h-sky)] px-6 py-3.5 text-[15px] font-bold text-[var(--h-blue)]"><HugIcon name="mesaj" size={18} /> WhatsApp&apos;tan sorun</a>
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden rounded-[28px] bg-white p-6 ring-1 ring-[var(--h-sky)]/60 md:p-8">
          <span aria-hidden className="hat pointer-events-none absolute -bottom-10 -right-2 select-none text-[8rem] leading-none text-[var(--h-blue)]/[0.05]">عمرة</span>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--h-blue)]/60">Umreniz</p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--h-blue)] md:text-3xl"><Accent text="Umrenizi buradan *takip edin*" /></h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#5b6680]">Bizden umre aldığınızda otelleriniz, sizi karşılayacak kişi, vize durumunuz, belgeleriniz ve ödemeniz burada görünür. {dogrulandi ? "Teklifiniz başka bir e-postayla hazırlandıysa Teklifler sekmesinden bağlatabilirsiniz." : "Önce e-postanızı doğrulayın; dosyanız kendiliğinden bağlanır."}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/bireysel-umre" className="inline-flex items-center gap-2 rounded-2xl bg-[var(--h-blue)] px-5 py-3 text-sm font-bold text-white"><HugIcon name="takvim" size={18} className="text-[var(--h-sand)]" /> Umremi planla</Link>
            <Link href="/profil/teklifler" className="inline-flex items-center rounded-2xl border border-[var(--h-sky)] px-5 py-3 text-sm font-bold text-[var(--h-blue)]">Tekliflerim</Link>
          </div>
        </section>
      )}

      <div className="space-y-5">
        {aktif && !aktif.data.ucusGidis && (
          <section className="rounded-[28px] bg-[#fbf4e1] p-5 ring-1 ring-[var(--h-sand)] md:p-6">
            <p className="flex items-center gap-2 text-sm font-bold text-[#5a4612]"><HugIcon name="bilgi" size={18} className="text-[#b8862f]" /> Sizden beklenen 1 adım</p>
            <Link href={`/profil/umrelerim/${aktif.no}`} className="mt-3 flex items-center gap-3 rounded-2xl bg-white p-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--h-white)] text-[var(--h-blue)]"><HugIcon name="ucak" size={22} /></span>
              <span className="flex-1"><span className="block text-sm font-bold text-[#14213d]">Uçuş bilgilerinizi ekleyin</span><span className="text-xs text-[#5b6680]">Karşılama saatiniz buna göre ayarlanır</span></span>
              <HugIcon name="ok" size={18} className="text-[var(--h-blue)]" />
            </Link>
          </section>
        )}
        {bekleyen && (
          <section className="rounded-[28px] bg-white p-5 ring-1 ring-[var(--h-sky)]/60 md:p-6">
            <div className="flex items-center justify-between"><p className="text-sm font-bold text-[#14213d]">Yanıt bekleyen teklif</p><Link href="/profil/teklifler" className="text-sm font-bold text-[var(--h-blue)]">Tümü →</Link></div>
            <p className="mt-3 text-[11px] font-bold tracking-[0.12em] text-[#8a94ab]">{bekleyen.no}</p>
            <p className="text-base font-bold text-[#14213d]">{bekleyen.data.gidis ? `${trTarih(bekleyen.data.gidis)} – ${trTarih(bekleyen.data.donus)}` : "Umre teklifi"} · {bekleyen.data.yetiskin + bekleyen.data.cocuk} kişi</p>
            <p className="text-sm text-[#5b6680]">{usd(toplam(bekleyen.data))}{bekleyen.data.gecerlilik ? ` · ${trTarih(bekleyen.data.gecerlilik)} tarihine kadar` : ""}</p>
            <Link href={`/t/${bekleyen.token}`} className="mt-4 flex items-center justify-center rounded-xl bg-[var(--h-blue)] py-3 text-sm font-bold text-white">Teklifi incele ve onayla</Link>
          </section>
        )}
        <Link href="/profil/kitaplik" className="flex items-center gap-5 rounded-[28px] bg-white p-5 ring-1 ring-[var(--h-sky)]/60 md:p-6">
          <span className="relative h-24 w-32 shrink-0">
            <Image src="/indir/tavaf-el-kitabi-kapak.png" alt="" width={160} height={226} className="absolute left-0 top-1 w-16 -rotate-6 rounded-md shadow-lg" />
            <Image src="/indir/say-el-kitabi-kapak.png" alt="" width={160} height={226} className="absolute left-12 top-0 w-16 rotate-6 rounded-md shadow-lg" />
          </span>
          <span>
            <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--h-blue)]/60">Kitaplığınız</span>
            <span className="mt-1 block text-lg font-bold text-[var(--h-blue)]">Tavaf ve Sa&apos;y El Kitabı</span>
            <span className="text-[13px] text-[#5b6680]">Harem&apos;de şavt modunda, büyük yazıyla okuyun.</span>
          </span>
        </Link>
        {kampanya && (
          <Link href={kampanya.link} className="bg-deep on-dark relative block overflow-hidden rounded-[28px] p-6 text-white">
            {kampanya.hat && <span aria-hidden className="hat pointer-events-none absolute -bottom-8 -left-1 select-none text-[6rem] leading-none text-white/[0.06]">{kampanya.hat}</span>}
            <p className="relative text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--h-sand)]">Size uygun · Kampanya</p>
            <h2 className="relative mt-2 text-xl font-bold leading-snug"><Accent text={kampanya.baslik} /></h2>
            {kampanya.aciklama && <p className="relative mt-1 text-[13px] text-white/75">{kampanya.aciklama}</p>}
            <span className="relative mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[var(--h-sand)] px-4 py-2 text-[13px] font-bold text-[var(--h-blue-deep)]">İncele <HugIcon name="ok" size={14} /></span>
          </Link>
        )}
      </div>
    </div>
  );
}
