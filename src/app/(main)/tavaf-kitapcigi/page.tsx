// /tavaf-kitapcigi (9 Ekim, kullanıcı): tavaf duası videosunda "yorumlara tavaf yazana kitapçık" denildi; bu sayfa o
// kitapçığı veren pazarlama sayfası. PDF sayfanın sonunda indirilir (public/indir/tavaf-el-kitabi-2026.pdf, üretici:
// scripts/pdf/tavaf/uret.py). Ara bölümlerde bireysel umre programı infografikle anlatılır. Tasarım ana sayfa v2 ile aynı
// (Pantone, Cairo + Noto Serif italik, Aref Ruqaa hat). Fiyat yok; paket kartları yayındaki gerçek paketlerden gelir.
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { pageTitle } from "@/lib/seo/meta";
import { SITE_URL } from "@/lib/seo/site";
import HugIcon, { type HugIconName } from "@/components/icons/HugIcon";
import Accent from "@/components/home/Accent";
import { cairo, ruqaa } from "@/components/home/fonts";

export const revalidate = 3600;

const PDF = "/indir/tavaf-el-kitabi-2026.pdf";

export const metadata: Metadata = {
  title: pageTitle("Tavaf Duaları: 7 Şavt İçin Tavaf El Kitabı (PDF)"),
  description: "Her şavt için 12–15 dakikalık, okunuşu ve anlamıyla tavaf duaları: Kur'an'dan, hadislerden ve münâcât geleneğinden. Ücretsiz PDF'i indirin.",
  alternates: { canonical: "/tavaf-kitapcigi" },
  openGraph: { images: [{ url: "/indir/tavaf-el-kitabi-kapak.png" }] },
};

const SAVTLAR: { no: number; baslik: string; niyet: string }[] = [
  { no: 1, baslik: "Tevhid, hamd ve teslimiyet", niyet: "Bu evin Sahibi'ni birlemek, O'na hamd etmek ve kendinizi O'na teslim etmek." },
  { no: 2, baslik: "Tövbe, istiğfar ve arınma", niyet: "Bilerek ya da bilmeyerek işlenen bütün günahlardan Allah'a dönmek." },
  { no: 3, baslik: "Aile, anne-baba ve evlat", niyet: "Eşinizi, anne-babanızı, evlatlarınızı ve sizden dua bekleyen herkesi Allah'a emanet etmek." },
  { no: 4, baslik: "Helal rızık, iş ve borç", niyet: "Helal ve bereketli kazanç, borcun edası ve kimseye muhtaç olmamak." },
  { no: 5, baslik: "Hidayet, istikamet ve ilim", niyet: "İman üzere sabit kalmak, faydalı ilim ve kabul olunmuş amel." },
  { no: 6, baslik: "Şifa, sıkıntı ve ümmet", niyet: "Kendinizin, ailenizin, hastaların ve bütün ümmetin şifası ve ferahlığı." },
  { no: 7, baslik: "Kabul, hüsn-i hâtime ve cennet", niyet: "Tavafın ve duaların kabulü, güzel bir son ve sevdiklerinizle cennette buluşmak." },
];

const BOLUMLER: { ad: string; aciklama: string }[] = [
  { ad: "Senâ ve zikir", aciklama: "Allah'ı isimleriyle anarak başlamak" },
  { ad: "Kur'an'dan", aciklama: "Peygamberlerin Kur'an'da geçen duaları" },
  { ad: "Hadislerden", aciklama: "Efendimiz'in (s.a.v.) öğrettiği dualar" },
  { ad: "Münâcât", aciklama: "Kendi dilimizle yazılmış yakarış" },
  { ad: "Şavtın sonu", aciklama: "Salavat ve Rabbenâ âtinâ duası" },
];

// Bireysel umre akışı (infografik). Uçak bileti satılmıyor; uçuş "sizin" adımı.
const ROTA: { ikon: HugIconName; baslik: string; alt: string; biz: boolean }[] = [
  { ikon: "ucak", baslik: "Uçuşunuz", alt: "Bileti siz alırsınız; tarihinize göre planı biz kurarız", biz: false },
  { ikon: "transfer", baslik: "Cidde'de karşılama", alt: "Havalimanından otelinize özel transfer", biz: true },
  { ikon: "kabe", baslik: "Mekke", alt: "Umreniz ve seçtiğiniz otel, seçtiğiniz gece sayısı", biz: true },
  { ikon: "tren", baslik: "Haremeyn treni", alt: "Mekke–Medine arası hızlı tren ya da transfer", biz: true },
  { ikon: "medine", baslik: "Medine", alt: "Mescid-i Nebevi'ye yakın otel ve ziyaretler", biz: true },
  { ikon: "ucak", baslik: "Dönüş", alt: "Otelden havalimanına transfer", biz: true },
];

const SECIM: string[] = ["Gidiş ve dönüş tarihiniz", "Mekke ve Medine'de kaç gece kalacağınız", "Otel tercihiniz (Harem'e yakın ya da servisli)", "Önce Mekke mi, Medine mi", "Rehberlik ve ziyaret isteyip istemediğiniz"];
const AYAR: string[] = ["Umre vizesi", "Mekke ve Medine otelleri", "Havalimanı ve şehirler arası transferler", "Haremeyn hızlı treni", "Ziyaret turları ve rehberlik"];

export default async function TavafKitapcigiPage() {
  const [settings, packages] = await Promise.all([
    getSiteSettings(),
    prisma.package.findMany({ where: { published: true }, select: { slug: true, title: true, duration: true }, orderBy: { createdAt: "desc" }, take: 3 }).catch(() => []),
  ]);
  const wa = (settings.WHATSAPP_NUMBER || "905404010038").replace(/\D/g, "");
  const waHref = `https://wa.me/${wa}?text=${encodeURIComponent("Merhaba, Tavaf El Kitabı'nı indirdim. Bireysel umre için bilgi almak istiyorum.")}`;
  const shareHref = `https://wa.me/?text=${encodeURIComponent(`Tavafta her şavt için okunacak dualar, okunuş ve anlamlarıyla: ${SITE_URL}/tavaf-kitapcigi`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    name: "Tavaf El Kitabı",
    description: "Tavafın yedi şavtı için okunuşu ve anlamıyla dualar.",
    url: `${SITE_URL}/tavaf-kitapcigi`,
    inLanguage: "tr",
    encodingFormat: "application/pdf",
    publisher: { "@type": "Organization", name: "Hadi Umreye Gidelim", url: SITE_URL },
  };

  return (
    <main id="main-content" className={`home-v2 ${cairo.variable} ${ruqaa.variable}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="bg-deep on-dark relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28 text-white">
        <span aria-hidden className="hat pointer-events-none absolute -right-6 top-16 select-none text-[9rem] leading-none text-white/[0.06] md:text-[15rem]">طواف</span>
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-[1.15fr_0.85fr] md:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--h-sand)]">Ücretsiz rehber · PDF</p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.1] md:text-6xl">
              <Accent text="Tavaf *El Kitabı*" />
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
              Kâbe&apos;nin etrafındaki yedi şavtın her biri için 12–15 dakika aralıksız okuyabileceğiniz dualar: Kur&apos;an&apos;dan, hadislerden, Cevşen&apos;den ve münâcât geleneğinden. Okunuşu ve anlamıyla, cebinizde.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#indir" className="inline-flex items-center gap-2 rounded-xl bg-[var(--h-sand)] px-6 py-3.5 text-sm font-bold text-[var(--h-blue-deep)] transition hover:brightness-95">
                Kitapçığı indir <HugIcon name="ok" size={18} />
              </a>
              <a href="#icerik" className="rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">İçinde neler var</a>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-6">
              {[["7", "şavt, 7 niyet"], ["12–15", "dakika her şavt"], ["19", "sayfa, PDF"]].map(([n, t]) => (
                <div key={t}>
                  <dt className="text-2xl font-bold text-white md:text-3xl">{n}</dt>
                  <dd className="text-xs text-white/70">{t}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative mx-auto w-full max-w-xs md:max-w-sm">
            <div className="absolute -inset-4 rounded-[2rem] bg-[var(--h-sky)]/20 blur-2xl" aria-hidden />
            <Image src="/indir/tavaf-el-kitabi-ornek.png" alt="Tavaf El Kitabı iç sayfa örneği" width={640} height={905} className="absolute -right-6 top-10 hidden w-[78%] rotate-6 rounded-xl shadow-2xl ring-1 ring-black/5 md:block" />
            <Image src="/indir/tavaf-el-kitabi-kapak.png" alt="Tavaf El Kitabı kapağı" width={640} height={905} priority className="relative w-[82%] -rotate-3 rounded-xl shadow-2xl ring-1 ring-white/10" />
          </div>
        </div>
      </section>

      {/* Her şavt beş bölüm */}
      <section id="icerik" className="bg-soft py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--h-blue)]/70">Nasıl okunur</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold text-[var(--h-blue)] md:text-4xl">
            <Accent text="Her şavt aynı düzende, *beş bölüm*" />
          </h2>
          <p className="mt-4 max-w-2xl text-on-surface-variant">Kalabalıkta yeriniz kaymaz: her şavt aynı sırayla ilerler. Hacerü&apos;l-Esved hizasına geldiğinizde kaldığınız yeri bırakıp yeni şavtın başına geçersiniz.</p>
          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {BOLUMLER.map((b, i) => (
              <li key={b.ad} className="relative flex items-baseline gap-3 rounded-2xl border border-[var(--h-sky)]/60 bg-white px-4 py-3.5 lg:block lg:p-5">
                <span className="text-xs font-bold text-[var(--h-blue)]/50">0{i + 1}</span>
                <div>
                  <p className="font-bold text-[var(--h-blue)] lg:mt-2">{b.ad}</p>
                  <p className="mt-0.5 text-sm text-on-surface-variant">{b.aciklama}</p>
                </div>
                {i < BOLUMLER.length - 1 && <span aria-hidden className="absolute -right-2.5 top-1/2 hidden h-px w-4 bg-[var(--h-sky)] lg:block" />}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 7 şavt */}
      <section className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--h-blue)]/70">Kitapçığın içinden</p>
              <h2 className="mt-3 text-3xl font-bold text-[var(--h-blue)] md:text-4xl">
                <Accent text="Yedi şavt, *yedi niyet*" />
              </h2>
            </div>
            <a href="#indir" className="text-sm font-bold text-[var(--h-blue)] underline-offset-4 hover:underline">Kitapçığı indir →</a>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SAVTLAR.map((s) => (
              <article key={s.no} className={`rounded-2xl p-6 ${s.no === 7 ? "bg-[var(--h-blue)] text-white md:col-span-2 lg:col-span-1" : "border border-[var(--h-sky)]/60 bg-[var(--h-white)]"}`}>
                <div className="flex items-center gap-3">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${s.no === 7 ? "bg-[var(--h-sand)] text-[var(--h-blue-deep)]" : "bg-[var(--h-blue)] text-white"}`}>{s.no}</span>
                  <span className={`text-[11px] font-bold uppercase tracking-[0.2em] ${s.no === 7 ? "text-[var(--h-sand)]" : "text-[var(--h-blue)]/60"}`}>{s.no}. şavt</span>
                </div>
                <h3 className={`mt-4 text-lg font-bold ${s.no === 7 ? "text-white" : "text-[var(--h-blue)]"}`}>{s.baslik}</h3>
                <p className={`mt-2 text-sm leading-relaxed ${s.no === 7 ? "text-white/80" : "text-on-surface-variant"}`}>{s.niyet}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm text-on-surface-variant">
            Şavtlara özel farz ya da sünnet bir dua yoktur. Bu dualar kalbinizi her şavtta bir niyete toplamak için sıralanmıştır; dilediğiniz duayı kendi dilinizle de edebilirsiniz. Kur&apos;an ve hadis dualarının kaynakları kitapçıkta her duanın başlığında yazılıdır.
          </p>
        </div>
      </section>

      {/* İnfografik: bireysel umre nasıl kurulur */}
      <section className="bg-warm py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--h-blue)]/70">Tavafa giden yol</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-bold text-[var(--h-blue)] md:text-4xl">
            <Accent text="Umrenizi kendi tarihinizde *planlayın*" />
          </h2>
          <p className="mt-4 max-w-2xl text-on-surface-variant">Tur takvimine bağlı kalmadan, kafileyle değil kendi temponuzla. Bireysel umrede yolculuk şöyle ilerler:</p>

          <ol className="relative mt-12 grid gap-4 md:grid-cols-6 md:gap-3">
            <span aria-hidden className="absolute left-5 right-5 top-7 hidden border-t-2 border-dashed border-[var(--h-blue)]/25 md:block" />
            {ROTA.map((r, i) => (
              <li key={i} className="relative flex gap-4 md:flex-col md:gap-3">
                <span className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${r.biz ? "bg-[var(--h-blue)] text-white" : "border-2 border-dashed border-[var(--h-blue)]/40 bg-white text-[var(--h-blue)]"}`}>
                  <HugIcon name={r.ikon} size={28} />
                </span>
                <div>
                  <p className="font-bold text-[var(--h-blue)]">{r.baslik}</p>
                  <p className="mt-1 text-sm leading-snug text-on-surface-variant">{r.alt}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-[var(--h-blue)]" /> Biz ayarlarız</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded border-2 border-dashed border-[var(--h-blue)]/50" /> Siz alırsınız</span>
          </p>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-[var(--h-sky)]/50">
              <p className="flex items-center gap-2 font-bold text-[var(--h-blue)]"><HugIcon name="bireysel" size={22} /> Siz seçersiniz</p>
              <ul className="mt-4 space-y-2.5">
                {SECIM.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-on-surface"><HugIcon name="onay" size={18} className="mt-0.5 text-[var(--h-blue)]" />{t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-[var(--h-blue)] p-7 text-white">
              <p className="flex items-center gap-2 font-bold text-[var(--h-sand)]"><HugIcon name="paket" size={22} /> Biz ayarlarız</p>
              <ul className="mt-4 space-y-2.5">
                {AYAR.map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-white/90"><HugIcon name="onay" size={18} className="mt-0.5 text-[var(--h-sand)]" />{t}</li>
                ))}
              </ul>
            </div>
          </div>

          {packages.length > 0 && (
            <div className="mt-12">
              <p className="font-bold text-[var(--h-blue)]">Hazır programlarımızdan</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {packages.map((p) => (
                  <Link key={p.slug} href={`/paketler/${p.slug}`} className="group flex items-center justify-between gap-3 rounded-2xl bg-white/80 p-5 ring-1 ring-[var(--h-sky)]/50 transition hover:bg-white">
                    <span>
                      <span className="block font-semibold text-on-surface">{p.title}</span>
                      {p.duration && <span className="text-xs text-on-surface-variant">{p.duration}</span>}
                    </span>
                    <HugIcon name="ok" size={18} className="text-[var(--h-blue)] transition group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/bireysel-umre" className="rounded-xl bg-[var(--h-blue)] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--h-blue-deep)]">Umremi planla</Link>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-[var(--h-blue)]/30 bg-white px-6 py-3.5 text-sm font-bold text-[var(--h-blue)] transition hover:border-[var(--h-blue)]">
              <HugIcon name="mesaj" size={18} /> WhatsApp&apos;tan sorun
            </a>
          </div>
        </div>
      </section>

      {/* İndir */}
      <section id="indir" className="bg-deep on-dark scroll-mt-24 py-20 text-white md:py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-5 md:grid-cols-[0.8fr_1.2fr] md:px-8">
          <Image src="/indir/tavaf-el-kitabi-kapak.png" alt="Tavaf El Kitabı kapağı" width={640} height={905} className="mx-auto w-56 rounded-xl shadow-2xl ring-1 ring-white/10 md:w-full md:max-w-[17rem]" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--h-sand)]">Ücretsiz indirin</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              <Accent text="Tavafınızda *yanınızda* olsun" />
            </h2>
            <p className="mt-4 text-white/85">Telefonunuza kaydedin ya da yazdırıp yanınıza alın. PDF, 19 sayfa: yedi şavtın duaları, her şavtın başında ve sonunda okunanlar, tavaftan sonra yapılacaklar ve kaynaklar.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={PDF} download className="inline-flex items-center gap-2 rounded-xl bg-[var(--h-sand)] px-7 py-4 text-base font-bold text-[var(--h-blue-deep)] transition hover:brightness-95">
                <HugIcon name="dua" size={20} /> PDF&apos;i indir
              </a>
              <a href={shareHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10">
                <HugIcon name="mesaj" size={18} /> Umreye gidecek birine gönderin
              </a>
            </div>
            <p className="mt-6 text-xs text-white/60">Tavafta bizleri de dualarınızdan eksik etmeyin.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
