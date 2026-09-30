import Link from "next/link";
import WhatsAppIcon from "@/components/home/WhatsAppIcon";

// Blog yazılarında markaya doğal yönlendirme. Yalnızca gerçekten sunulan hizmetler anlatılır;
// "en ucuz", "garanti" gibi doğrulanmamış iddia yok.

export function BlogInlineCta({ whatsappNumber, topic }: { whatsappNumber: string; topic: string }) {
  const wa = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Merhaba, "${topic}" yazısını okudum. Bireysel umre için bilgi almak istiyorum.`)}`;
  return (
    <aside className="not-prose my-14 rounded-2xl border border-primary/15 bg-primary/[0.04] p-6 md:p-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary/70">Hadi Umreye Gidelim</p>
      <p className="mt-2 font-headline text-xl md:text-2xl font-bold text-primary">Bireysel umrenizi kendiniz planlayın</p>
      <p className="mt-2 text-[15px] leading-relaxed text-on-surface-variant">
        Tarihi, oteli ve Mekke–Medine gün sayısını siz seçin; vize, uçuş ve transferle birlikte size özel teklifi biz hazırlayalım.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/bireysel-umre" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white no-underline hover:bg-primary/90">
          Umreni tasarla
        </Link>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[#25D366]/40 px-5 py-3 text-sm font-bold text-[#128C7E] no-underline hover:bg-[#25D366]/10">
          <WhatsAppIcon className="h-4 w-4" /> WhatsApp&apos;tan sor
        </a>
      </div>
    </aside>
  );
}

const REASONS = [
  { title: "Kendi takviminiz", text: "Kafile tarihine bağlı kalmadan gidiş ve dönüş gününü siz belirlersiniz." },
  { title: "Otelinizi siz seçersiniz", text: "Harem'e yürüme mesafesinde ya da bütçe dostu otel; tercih sizin." },
  { title: "Tek planda her şey", text: "Vize, uçuş, transfer ve isteğe bağlı ilahiyatçı rehber aynı teklifte." },
];

export function BlogEndCta({ whatsappNumber }: { whatsappNumber: string }) {
  const wa = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Merhaba, blogunuzu okudum. Bireysel umre için teklif almak istiyorum.")}`;
  return (
    <section className="max-w-3xl mx-auto px-6 mt-16">
      <div className="rounded-3xl bg-primary p-7 md:p-10 text-white">
        <h2 className="font-headline text-2xl md:text-3xl font-bold">Neden Hadi Umreye Gidelim?</h2>
        <p className="mt-2 text-white/80">Bireysel umreyi ailenize ve takviminize göre planlıyoruz.</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {REASONS.map((r) => (
            <li key={r.title} className="rounded-2xl bg-white/10 p-4">
              <p className="font-semibold">{r.title}</p>
              <p className="mt-1 text-sm text-white/80">{r.text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/bireysel-umre" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-primary hover:bg-white/90">
            Bireysel umreni tasarla
          </Link>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white hover:bg-[#1fb857]">
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp&apos;tan teklif al
          </a>
        </div>
      </div>
    </section>
  );
}
