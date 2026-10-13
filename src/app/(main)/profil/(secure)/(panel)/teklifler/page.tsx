// Tekliflerim (13 Ekim): üyeye bağlı teklifler; onayla / sor / PDF ve "teklifimi göremiyorum" bağlama talebi.
import Link from "next/link";
import { getMember, isEmailVerified } from "@/lib/members";
import { getDosyaByQuotation, tekliflerOfMember } from "@/lib/umre";
import { getSiteSettings } from "@/lib/site-settings";
import Accent from "@/components/home/Accent";
import TeklifAksiyon from "@/components/profil/TeklifAksiyon";
import TeklifBagla from "@/components/profil/TeklifBagla";

const DURUM: Record<string, { label: string; cls: string }> = {
  sent: { label: "Yanıt bekliyor", cls: "bg-[#fbf4e1] text-[#8a6a1c]" },
  draft: { label: "Hazırlanıyor", cls: "bg-[var(--h-white)] text-[var(--h-blue)]" },
  accepted: { label: "Onaylandı", cls: "bg-[#e8f3ec] text-[#2f7d55]" },
  rejected: { label: "Reddedildi", cls: "bg-[var(--h-white)] text-[#8a94ab]" },
  expired: { label: "Süresi doldu", cls: "bg-[var(--h-white)] text-[#8a94ab]" },
};

export default async function TekliflerPage() {
  const m = await getMember();
  if (!m) return null;
  const dogrulandi = await isEmailVerified(m.id);
  const [teklifler, settings] = await Promise.all([tekliflerOfMember(m, dogrulandi).catch(() => []), getSiteSettings()]);
  const wa = (settings.WHATSAPP_NUMBER || "905404010038").replace(/\D/g, "");
  const dosyalar = await Promise.all(teklifler.map((q) => getDosyaByQuotation(q.id).catch(() => null)));

  return (
    <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[var(--h-blue)]/60">Teklifler</p>
        <h2 className="mt-1.5 text-2xl font-bold text-[var(--h-blue)] md:text-3xl"><Accent text="Teklif*leriniz*" /></h2>
        {teklifler.length === 0 ? (
          <p className="mt-6 rounded-[24px] bg-white p-6 text-sm text-[#5b6680] ring-1 ring-[var(--h-sky)]/60">Henüz hesabınıza bağlı bir teklif yok. {dogrulandi ? "Teklifiniz başka bir telefon ya da e-postayla hazırlandıysa yandan bağlayın." : "E-postanızı doğrulayınca, bu adresle hazırlanmış teklifler kendiliğinden gelir."}</p>
        ) : (
          <div className="mt-6 space-y-3">
            {teklifler.map((q, i) => {
              const st = DURUM[q.status] ?? DURUM.draft;
              const toplam = q.items.reduce((s, it) => s + it.saleTotalUsd, 0);
              const dosya = dosyalar[i];
              return (
                <article key={q.id} className="rounded-[24px] bg-white p-5 ring-1 ring-[var(--h-sky)]/60 md:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] font-bold tracking-[0.12em] text-[#8a94ab]">{q.quotationNo}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${st.cls}`}>{dosya ? "Onaylandı · dosyaya dönüştü" : st.label}</span>
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-[#14213d]">{q.travelDate || "Umre teklifi"} · {q.adultsCount + q.childrenCount} kişi</h3>
                  <p className="text-sm text-[#5b6680]">{toplam ? `${toplam.toLocaleString("tr-TR")} $` : ""}{q.validUntil && q.status === "sent" ? ` · ${q.validUntil} geçerli` : ""}</p>
                  {dosya ? (
                    <Link href={`/profil/umrelerim/${dosya.no}`} className="mt-4 inline-flex rounded-xl bg-[var(--h-blue)] px-4 py-2.5 text-sm font-bold text-white">Umre dosyasını aç</Link>
                  ) : q.status === "sent" || q.status === "draft" ? (
                    <TeklifAksiyon id={q.id} no={q.quotationNo} wa={wa} />
                  ) : (
                    <a href={`/api/profil/teklif/${q.id}/pdf`} className="mt-4 inline-flex rounded-xl border border-[var(--h-sky)] px-4 py-2.5 text-sm font-bold text-[var(--h-blue)]">PDF</a>
                  )}
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
