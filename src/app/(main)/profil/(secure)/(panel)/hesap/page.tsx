import Link from "next/link";
import { getMember } from "@/lib/members";
import HugIcon, { type HugIconName } from "@/components/icons/HugIcon";
import Accent from "@/components/home/Accent";
import LogoutButton from "@/components/profil/LogoutButton";
import IletisimTercihleri from "@/components/profil/IletisimTercihleri";
import TelefonFormu from "@/components/profil/TelefonFormu";
import UyelikKapat from "@/components/profil/UyelikKapat";
import { getTercih } from "@/lib/uye-kampanya";

export default async function HesapPage() {
  const m = await getMember();
  if (!m) return null;
  const tercih = await getTercih(m.id, m.email);
  const satirlar: { ikon: HugIconName; ad: string; deger: string }[] = [
    { ikon: "bireysel", ad: "Ad soyad", deger: m.name },
    { ikon: "eposta", ad: "E-posta", deger: m.email },
    { ikon: "takvim", ad: "Üyelik tarihi", deger: new Date(m.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) },
  ];
  return (
    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--h-blue)]/60">Hesabım</p>
        <h2 className="mt-1.5 text-2xl font-bold text-[var(--h-blue)] md:text-3xl"><Accent text="Hesap *bilgileriniz*" /></h2>
        <dl className="mt-6 divide-y divide-[var(--h-sky)]/50 rounded-[28px] bg-white px-6 ring-1 ring-[var(--h-sky)]/50">
          {satirlar.map((s) => (
            <div key={s.ad} className="flex items-center gap-4 py-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--h-white)] text-[var(--h-blue)]"><HugIcon name={s.ikon} size={20} /></span>
              <dt className="w-32 shrink-0 text-sm text-[#5b6680]">{s.ad}</dt>
              <dd className="min-w-0 break-words font-semibold text-[#14213d]">{s.deger}</dd>
            </div>
          ))}
          <div className="flex items-center gap-4 py-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--h-white)] text-[var(--h-blue)]"><HugIcon name="telefon" size={20} /></span>
            <dt className="w-32 shrink-0 text-sm text-[#5b6680]">Telefon</dt>
            <dd className="min-w-0 flex-1"><TelefonFormu phone={m.phone} /></dd>
          </div>
        </dl>
        <div className="mt-6"><IletisimTercihleri eposta={tercih.izinEposta} whatsapp={tercih.izinWhatsapp} tarih={tercih.izinTarihi} telefonVar={!!m.phone} /></div>
      </div>
      <div className="space-y-4 lg:pt-[68px]">
        <div className="rounded-[28px] bg-white p-6 ring-1 ring-[var(--h-sky)]/50">
          <p className="font-bold text-[#14213d]">Şifre</p>
          <p className="mt-1 text-sm text-[#5b6680]">E-postanıza gelen kodla yeni şifre belirleyin.</p>
          <Link href={`/profil/sifremi-unuttum?email=${encodeURIComponent(m.email)}`} className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-[var(--h-sky)] px-4 py-2.5 text-sm font-bold text-[var(--h-blue)] transition hover:border-[var(--h-blue)]">
            <HugIcon name="guven" size={18} /> Şifremi değiştir
          </Link>
        </div>
        <div className="rounded-[28px] bg-white p-6 ring-1 ring-[var(--h-sky)]/50">
          <p className="font-bold text-[#14213d]">Üyeliği kapat</p>
          <p className="mt-1 text-sm text-[#5b6680]">Hesabınız ve tercihleriniz silinir. Satın aldığınız umrenin kayıtları yasal saklama süresince ekibimizde kalır.</p>
          <div className="mt-4"><UyelikKapat /></div>
        </div>
        <LogoutButton className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50" />
      </div>
    </section>
  );
}
