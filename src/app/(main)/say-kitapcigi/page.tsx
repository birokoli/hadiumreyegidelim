// /say-kitapcigi (13 Ekim, kullanıcı): Tavaf El Kitabı'nın kardeşi. Sa'y El Kitabı'nı veren pazarlama sayfası; PDF sonda
// e-posta doğrulamalı formla indirilir (public/indir/say-el-kitabi-2026.pdf, üretici: scripts/pdf/say/uret.py).
// Tasarım /tavaf-kitapcigi ile aynı (ana sayfa v2: Pantone, Cairo + Noto Serif italik, Aref Ruqaa hat). Fiyat yok.
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
import { Faq, faqJsonLd } from "@/components/ui/kit";
import LeadGateDownload from "@/components/leads/LeadGateDownload";

export const revalidate = 3600;

const PDF = "/indir/say-el-kitabi-2026.pdf";

export const metadata: Metadata = {
  title: pageTitle("Sa'y Duaları PDF: Ücretsiz El Kitabı"),
  description: "Safa ile Merve arasında her şavt için okunuşu ve anlamıyla sa'y duaları: tepede tekbir, yeşil ışıklar arası dua ve yedi niyet. Ücretsiz PDF'i indirin.",
  alternates: { canonical: "/say-kitapcigi" },
  openGraph: { images: [{ url: "/indir/say-el-kitabi-kapak.png" }] },
};

const SAVTLAR: { no: number; yon: string; baslik: string; niyet: string }[] = [
  { no: 1, yon: "Safa → Merve", baslik: "Tevekkül ve çıkış yolu", niyet: "Hz. Hâcer validemiz gibi bütün sebepleri geride bırakıp yalnızca Allah'a dayanmak." },
  { no: 2, yon: "Merve → Safa", baslik: "Tövbe ve arınma", niyet: "Bilerek ya da bilmeyerek işlenen bütün günahlardan Allah'a dönmek." },
  { no: 3, yon: "Safa → Merve", baslik: "Aile, yuva ve nesiller", niyet: "Eşinizi, anne-babanızı, evlatlarınızı ve sizden dua bekleyen herkesi Allah'a emanet etmek." },
  { no: 4, yon: "Merve → Safa", baslik: "Helal rızık ve bereket", niyet: "Helal ve bereketli kazanç, borcun edası ve kimseye muhtaç olmamak." },
  { no: 5, yon: "Safa → Merve", baslik: "Şifa ve musibetlerden korunma", niyet: "Kendinizin, ailenizin ve bütün hastaların şifası; nazardan, hasetten ve ani musibetlerden korunmak." },
  { no: 6, yon: "Merve → Safa", baslik: "Hidayet ve istikamet", niyet: "İman üzere sabit kalmak, doğru kararlar, faydalı ilim ve göğüs genişliği." },
  { no: 7, yon: "Safa → Merve", baslik: "Hüsn-i hâtime ve vuslat", niyet: "Sa'yin kabulü, iman üzere güzel bir son ve sevdiklerinizle cennette buluşmak." },
];

const DUZEN: { ad: string; aciklama: string; yesil?: boolean }[] = [
  { ad: "Tepede", aciklama: "Kâbe'ye dönüp üç kez tekbir ve tehlil" },
  { ad: "Zikir ve Esmâ", aciklama: "Yürürken tekrarlanan kısa zikirler" },
  { ad: "Kur'an ve hadis", aciklama: "Şavtın niyetine uygun, kaynağı belli dualar" },
  { ad: "Münâcât", aciklama: "Kendi dilimizle yakarış" },
  { ad: "Yeşil ışıklar arası", aciklama: "Hervele ve Rabbiğfir verham duası", yesil: true },
  { ad: "Tepeye kadar", aciklama: "Şavtı kapatan kısa dua" },
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

// Soru-cevap: "sa'y duaları", "sa'y nasıl yapılır", "hervele nedir" aramaları ve yapay zekâ cevapları için kısa cevaplar.
const SSS: { q: string; a: string }[] = [
  { q: "Sa'y duaları nelerdir?", a: "Safa'ya yaklaşırken \"İnne's-Safâ ve'l-Mervete min şeâirillâh\" ayeti (Bakara, 158) ve \"Nebdeü bi-mâ bedeallâhu bih\" okunur. Safa'da ve Merve'de her varışta Kâbe'ye dönülerek üç kez tekbir ve \"Lâ ilâhe illallâhu vahdehû lâ şerîke leh...\" tehlili getirilir (Müslim). Yeşil ışıklar arasında \"Rabbiğfir verham ve tecâvez ammâ ta'lem\" okunur. Bunların dışında zikir, Kur'an duaları ve kendi dilinizle dua serbesttir." },
  { q: "Sa'yde her şavtta farklı dua okumak zorunlu mu?", a: "Hayır. Şavtlara özel farz ya da sünnet bir dua yoktur. Sa'y El Kitabı, kalbinizi her şavtta bir niyete toplamanız için duaları tevekkül, tövbe, aile, rızık, şifa, hidayet ve kabul başlıklarıyla sıralar." },
  { q: "Sa'y nasıl yapılır?", a: "Tavaf ve iki rekat tavaf namazından sonra Safa tepesine gidilir. Kâbe'ye dönülüp niyet edilir, tekbir ve tehlil getirilir, Merve'ye yürünür; bu birinci şavttır. Merve'den Safa'ya dönüş ikinci şavttır. Yedinci şavt Merve'de biter. Ardından erkekler saçını kazıtır ya da kısaltır, kadınlar saçının ucundan keser ve umre tamamlanır." },
  { q: "Hervele nedir, kadınlar da koşar mı?", a: "Hervele, Safa ile Merve arasında yeşil ışıklarla işaretli bölümde erkeklerin adımlarını sıklaştırarak hızlı yürümesidir ve sünnettir. Kadınlar hervele yapmaz; sa'y boyunca normal yürür. Herkes bu bölümde aynı duayı okuyabilir." },
  { q: "Sa'y ne kadar sürer?", a: "Safa ile Merve arası yaklaşık 400 metredir; yedi şavt toplam 2,8 kilometre kadar yürüyüş eder. Yavaş ve dualı bir yürüyüşle her şavt 6–8 dakika, sa'yin tamamı 45–60 dakika sürer." },
  { q: "Sa'yde abdest şart mı?", a: "Tavafın aksine sa'yde abdestli olmak şart değil, sünnettir. Sa'y sırasında abdest bozulursa ibadete devam edilebilir; imkân varsa tazelemek daha faziletlidir." },
  { q: "Sa'y El Kitabı ücretsiz mi?", a: "Evet. 19 sayfalık PDF'i bu sayfanın sonundan adınızı ve e-posta ya da telefonunuzu yazarak ücretsiz indirebilirsiniz. E-posta yazarsanız adresinize kısa bir doğrulama kodu gönderilir." },
];

const SECIM: string[] = ["Gidiş ve dönüş tarihiniz", "Mekke ve Medine'de kaç gece kalacağınız", "Otel tercihiniz (Harem'e yakın ya da servisli)", "Önce Mekke mi, Medine mi", "Rehberlik ve ziyaret isteyip istemediğiniz"];
const AYAR: string[] = ["Umre vizesi", "Mekke ve Medine otelleri", "Havalimanı ve şehirler arası transferler", "Haremeyn hızlı treni", "Ziyaret turları ve rehberlik"];

export default async function SayKitapcigiPage() {
  const [settings, packages] = await Promise.all([
    getSiteSettings(),
    prisma.package.findMany({ where: { published: true }, select: { slug: true, title: true, duration: true }, orderBy: { createdAt: "desc" }, take: 3 }).catch(() => []),
  ]);
  const wa = (settings.WHATSAPP_NUMBER || "905404010038").replace(/\D/g, "");
  const waHref = `https://wa.me/${wa}?text=${encodeURIComponent("Merhaba, Sa'y El Kitabı'nı indirdim. Bireysel umre için bilgi almak istiyorum.")}`;
  const shareHref = `https://wa.me/?text=${encodeURIComponent(`Safa ile Merve arasında her şavt için okunacak dualar, okunuş ve anlamlarıyla: ${SITE_URL}/say-kitapcigi`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    name: "Sa'y El Kitabı",
    description: "Safa ile Merve arasındaki yedi şavt için okunuşu ve anlamıyla dualar.",
    url: `${SITE_URL}/say-kitapcigi`,
    inLanguage: "tr",
    encodingFormat: "application/pdf",
    publisher: { "@type": "Organization", name: "Hadi Umreye Gidelim", url: SITE_URL },
  };

  return (
    <main id="main-content" className={`home-v2 ${cairo.variable} ${ruqaa.variable}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(SSS)) }} />

      {/* Hero */}
      <section className="bg-deep on-dark relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28 text-white">
        <span aria-hidden className="hat pointer-events-none absolute -right-6 top-16 select-none text-[9rem] leading-none text-white/[0.06] md:text-[15rem]">سعي</span>
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-[1.15fr_0.85fr] md:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--h-sand)]">Ücretsiz rehber · PDF</p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.1] md:text-6xl">
              <Accent text="Sa'y *El Kitabı*" />
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
              Safa ile Merve arasında, Hz. Hâcer validemizin adımlarında okunacak dualar. Her şavt bir niyete ayrılır: tepede tekbir ve tehlil, yürürken zikir ve Kur&apos;an duaları, yeşil ışıklar arasında hervele duası. Okunuşu ve anlamıyla, cebinizde.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#indir" className="inline-flex items-center gap-2 rounded-xl bg-[var(--h-sand)] px-6 py-3.5 text-sm font-bold text-[var(--h-blue-deep)] transition hover:brightness-95">
                Kitapçığı indir <HugIcon name="ok" size={18} />
              </a>
              <a href="#icerik" className="rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">İçinde neler var</a>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-6">
              {[["7", "şavt, 7 niyet"], ["6–8", "dakika her şavt"], ["19", "sayfa, PDF"]].map(([n, t]) => (
                <div key={t}>
                  <dt className="text-2xl font-bold text-white md:text-3xl">{n}</dt>
                  <dd className="text-xs text-white/70">{t}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative mx-auto w-full max-w-xs md:max-w-sm">
            <div className="absolute -inset-4 rounded-[2rem] bg-[var(--h-sky)]/20 blur-2xl" aria-hidden />
            <Image src="/indir/say-el-kitabi-ornek.png" alt="Sa'y El Kitabı iç sayfa örneği" width={909} height={1287} className="absolute -right-6 top-10 hidden w-[78%] rotate-6 rounded-xl shadow-2xl ring-1 ring-black/5 md:block" />
            <Image src="/indir/say-el-kitabi-kapak.png" alt="Sa'y El Kitabı kapağı" width={909} height={1287} priority className="relative w-[82%] -rotate-3 rounded-xl shadow-2xl ring-1 ring-white/10" />
          </div>
        </div>
      </section>

      {/* Safa–Merve güzergâhı ve her şavtın düzeni */}
      <section id="icerik" className="bg-soft py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--h-blue)]/70">Nasıl okunur</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold text-[var(--h-blue)] md:text-4xl">
            <Accent text="Safa'dan Merve'ye, *altı adım*" />
          </h2>
          <p className="mt-4 max-w-2xl text-on-surface-variant">Her şavt aynı sırayla ilerler; tepeye vardığınızda kaldığınız yeri bırakıp yeni şavta geçersiniz. Dualar erken biterse zikirleri tekrarlarsınız.</p>

          <div className="mt-10 rounded-3xl bg-white p-6 ring-1 ring-[var(--h-sky)]/50 md:p-8">
            <div className="flex items-center gap-3 md:gap-5">
              <div className="shrink-0 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--h-blue)] text-xs font-bold tracking-widest text-white md:h-20 md:w-20 md:text-sm">SAFA</span>
                <span className="mt-2 block text-[11px] text-on-surface-variant">Başlangıç</span>
              </div>
              <div className="relative h-1.5 flex-1 rounded-full bg-[var(--h-sky)]">
                <span className="absolute inset-y-[-3px] left-[36%] w-[24%] rounded-full bg-[#2f7d55]" />
                <span className="absolute left-[36%] top-4 w-[24%] text-center text-[11px] font-bold text-[#2f7d55]">Yeşil ışıklar · hervele</span>
              </div>
              <div className="shrink-0 text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--h-blue)] text-xs font-bold tracking-widest text-white md:h-20 md:w-20 md:text-sm">MERVE</span>
                <span className="mt-2 block text-[11px] text-on-surface-variant">Bitiş</span>
              </div>
            </div>
            <p className="mt-8 text-center text-xs text-on-surface-variant">Yaklaşık 400 metre · her şavt 6–8 dakika · 1, 3, 5 ve 7. şavt Safa&apos;dan, 2, 4 ve 6. şavt Merve&apos;den başlar</p>
          </div>

          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {DUZEN.map((b, i) => (
              <li key={b.ad} className={`flex items-baseline gap-3 rounded-2xl border px-4 py-3.5 lg:block lg:p-5 ${b.yesil ? "border-[#2f7d55]/30 bg-[#e8f3ec]" : "border-[var(--h-sky)]/60 bg-white"}`}>
                <span className={`text-xs font-bold ${b.yesil ? "text-[#2f7d55]" : "text-[var(--h-blue)]/50"}`}>0{i + 1}</span>
                <div>
                  <p className={`font-bold lg:mt-2 ${b.yesil ? "text-[#2f7d55]" : "text-[var(--h-blue)]"}`}>{b.ad}</p>
                  <p className="mt-0.5 text-sm text-on-surface-variant">{b.aciklama}</p>
                </div>
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
                  <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${s.no === 7 ? "border-white/30 text-[var(--h-sand)]" : "border-[var(--h-sky)] text-[var(--h-blue)]"}`}>{s.yon}</span>
                </div>
                <h3 className={`mt-4 text-lg font-bold ${s.no === 7 ? "text-white" : "text-[var(--h-blue)]"}`}>{s.baslik}</h3>
                <p className={`mt-2 text-sm leading-relaxed ${s.no === 7 ? "text-white/80" : "text-on-surface-variant"}`}>{s.niyet}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-sm text-on-surface-variant">
            Şavtlara özel farz ya da sünnet bir dua yoktur. Bu sıralama kalbinizi her şavtta bir niyete toplamak içindir; dilediğiniz duayı kendi dilinizle de edebilirsiniz. Kur&apos;an ve hadis dualarının kaynakları kitapçıkta her duanın başlığında yazılıdır.
          </p>
        </div>
      </section>

      {/* İnfografik: bireysel umre nasıl kurulur */}
      <section className="bg-warm py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--h-blue)]/70">Safa&apos;ya giden yol</p>
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

      {/* Soru-cevap */}
      <section className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-3xl px-5 md:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--h-blue)]/70">Sık sorulanlar</p>
          <h2 className="mt-3 text-3xl font-bold text-[var(--h-blue)] md:text-4xl">
            <Accent text="Sa'y ve sa'y duaları hakkında *sorular*" />
          </h2>
          <div className="mt-8"><Faq items={SSS} /></div>
          <p className="mt-6 text-sm text-on-surface-variant">
            Ayrıntılı anlatım için: <Link href="/umre-rehberi/say-nedir" className="font-semibold text-[var(--h-blue)] underline-offset-4 hover:underline">Sa&apos;y nedir, nasıl yapılır?</Link> · Tavaf için: <Link href="/tavaf-kitapcigi" className="font-semibold text-[var(--h-blue)] underline-offset-4 hover:underline">Tavaf El Kitabı</Link>
          </p>
        </div>
      </section>

      {/* İndir */}
      <section id="indir" className="bg-deep on-dark scroll-mt-24 py-20 text-white md:py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-5 md:grid-cols-[0.8fr_1.2fr] md:px-8">
          <Image src="/indir/say-el-kitabi-kapak.png" alt="Sa'y El Kitabı kapağı" width={909} height={1287} className="mx-auto w-56 rounded-xl shadow-2xl ring-1 ring-white/10 md:w-full md:max-w-[17rem]" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--h-sand)]">Ücretsiz indirin</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              <Accent text="Sa'yinizde *yanınızda* olsun" />
            </h2>
            <p className="mt-4 text-white/85">Telefonunuza kaydedin ya da yazdırıp yanınıza alın. PDF, 19 sayfa: Safa&apos;da ve Merve&apos;de okunanlar, yedi şavtın duaları, yeşil ışıklar arası dua, sa&apos;yden sonra yapılacaklar ve kaynaklar.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LeadGateDownload source="say-kitapcigi" title="Sa'y El Kitabı" cover="/indir/say-el-kitabi-kapak.png" hat="سعي" fileUrl={PDF} fileName="Say-El-Kitabi-2026.pdf" doneNote="Sa'yde bizleri de dualarınızdan eksik etmeyin." className="inline-flex items-center gap-2 rounded-xl bg-[var(--h-sand)] px-7 py-4 text-base font-bold text-[var(--h-blue-deep)] transition hover:brightness-95">
                <HugIcon name="say" size={20} /> PDF&apos;i indir
              </LeadGateDownload>
              <a href={shareHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10">
                <HugIcon name="mesaj" size={18} /> Umreye gidecek birine gönderin
              </a>
            </div>
            <p className="mt-6 text-xs text-white/60">İndirmek için adınızı ve e-posta ya da telefonunuzu istiyoruz; bilgileriniz yalnızca Hadi Umreye Gidelim tarafından kullanılır. <Link href="/tavaf-kitapcigi" className="underline underline-offset-2 hover:text-white">Tavaf El Kitabı</Link> da ücretsiz.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
