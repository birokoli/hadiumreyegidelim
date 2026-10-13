// Giriş, üye ol ve şifre sıfırlama ekranlarının ortak çerçevesi (13 Ekim): solda lacivert tanıtım paneli (üyelik
// ayrıcalıkları, kitap kapakları, Arapça hat), sağda form.
import Image from "next/image";
import type { ReactNode } from "react";
import HugIcon, { type HugIconName } from "@/components/icons/HugIcon";
import Accent from "@/components/home/Accent";

const AYRICALIKLAR: { ikon: HugIconName; baslik: string; metin: string }[] = [
  { ikon: "rehber", baslik: "Kitaplığınız", metin: "Tavaf ve Sa'y El Kitabı her zaman yanınızda; form doldurmadan indirin." },
  { ikon: "tavaf", baslik: "Şavt modu", metin: "Tavafta ve sa'yde telefonunuzdan şavt şavt, büyük yazıyla okuyun. Kaldığınız yeri hatırlar, ekranı açık tutar." },
  { ikon: "paket", baslik: "Umre planınız", metin: "Planlayıcıdan verdiğiniz talepler ve siparişleriniz tek yerde." },
];

export default function AuthShell({ title, kicker, children }: { title: string; kicker: string; children: ReactNode }) {
  return (
    <section className="px-4 pb-16 pt-24 md:px-8 md:pt-32">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-[0_40px_80px_-40px_rgba(18,41,90,0.45)] ring-1 ring-[var(--h-sky)]/40 md:grid-cols-[0.95fr_1.05fr]">
        <div className="bg-deep on-dark relative overflow-hidden px-6 py-8 text-white md:px-10 md:py-12">
          <span aria-hidden className="hat pointer-events-none absolute -bottom-14 -left-4 select-none text-[9rem] leading-none text-white/[0.05] md:text-[12rem]">لبيك</span>
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--h-sand)]">{kicker}</p>
            <h1 className="mt-3 text-3xl font-bold leading-[1.15] md:text-[40px]"><Accent text={title} /></h1>
            <ul className="mt-7 space-y-4">
              {AYRICALIKLAR.map((a) => (
                <li key={a.baslik} className="flex gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[var(--h-sand)] ring-1 ring-white/10">
                    <HugIcon name={a.ikon} size={22} />
                  </span>
                  <span>
                    <span className="block text-[15px] font-bold">{a.baslik}</span>
                    <span className="mt-0.5 block text-sm leading-snug text-white/70">{a.metin}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="relative mt-10 hidden h-40 md:block" aria-hidden>
              <Image src="/indir/tavaf-el-kitabi-kapak.png" alt="" width={240} height={340} className="absolute left-2 top-2 w-28 -rotate-6 rounded-md shadow-2xl ring-1 ring-white/15" />
              <Image src="/indir/say-el-kitabi-kapak.png" alt="" width={240} height={340} className="absolute left-28 top-0 w-28 rotate-6 rounded-md shadow-2xl ring-1 ring-white/15" />
            </div>
          </div>
        </div>
        <div className="px-6 py-8 md:px-10 md:py-12">{children}</div>
      </div>
    </section>
  );
}
