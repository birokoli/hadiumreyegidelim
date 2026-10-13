// Profil paneli (13 Ekim): lacivert başlık (selam, hat), altında sekmeler; içerik açık zeminde.
import { getMember, isEmailVerified } from "@/lib/members";
import DogrulamaBandi from "@/components/profil/DogrulamaBandi";
import Accent from "@/components/home/Accent";
import ProfilTabs from "@/components/profil/ProfilTabs";

function selam() {
  const saat = Number(new Intl.DateTimeFormat("tr-TR", { hour: "numeric", hour12: false, timeZone: "Europe/Istanbul" }).format(new Date()));
  if (saat < 11) return "Hayırlı sabahlar";
  if (saat >= 18) return "Hayırlı akşamlar";
  return "Hoş geldiniz";
}

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const member = await getMember();
  const first = member?.name.split(" ")[0] ?? "";
  const dogrulandi = member ? await isEmailVerified(member.id) : true;
  return (
    <>
      <section className="bg-deep on-dark relative overflow-hidden pt-28 text-white md:pt-32">
        <span aria-hidden className="hat pointer-events-none absolute -bottom-10 right-0 select-none text-[8rem] leading-none text-white/[0.05] md:right-10 md:text-[12rem]">لبيك</span>
        <div className="relative mx-auto max-w-6xl px-4 md:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--h-sand)]">Hesabım</p>
          <h1 className="mt-2 text-3xl font-bold md:text-[42px]"><Accent text={`${selam()}, *${first}*`} /></h1>
          <p className="mt-1.5 text-sm text-white/70">{member?.email}</p>
          <div className="mt-8"><ProfilTabs /></div>
        </div>
      </section>
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-8 md:px-8 md:pt-10">
        {member && !dogrulandi && <div className="mb-6"><DogrulamaBandi email={member.email} /></div>}
        {children}
      </div>
    </>
  );
}
