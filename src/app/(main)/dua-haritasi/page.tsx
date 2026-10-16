// /dua-haritasi (16 Ekim, kullanıcı): Tavaf ve Sa'y El Kitabı'nın kardeşi. Harem Dua Haritası'nı veren pazarlama sayfası; PDF
// sonda e-posta doğrulamalı formla indirilir (public/indir/harem-dua-haritasi-2026.pdf, üretici: scripts/pdf/dua-haritasi/uret.py,
// içerik: scripts/pdf/dua-haritasi/icerik.docx). Tasarım /say-kitapcigi ile aynı. Fiyat yok.
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

const PDF = "/indir/harem-dua-haritasi-2026.pdf";
const KAPAK = "/indir/harem-dua-haritasi-kapak.jpg";

export const metadata: Metadata = {
  title: pageTitle("Kâbe'de Duanın Kabul Olduğu Yerler: Harem Dua Haritası PDF"),
  description: "Mescid-i Haram'da 12 dua durağı ve duanın kabul olduğu 10 an: Mültezem, Hatîm, Mîzâb, Makam-ı İbrahim, Zemzem, Safa ve Merve. Ayet, hadis ve dualarıyla ücretsiz PDF.",
  alternates: { canonical: "/dua-haritasi" },
  openGraph: { images: [{ url: KAPAK }] },
};

// Durak adları ve yerleri PDF'teki krokiyle aynı (scripts/pdf/dua-haritasi/harita.py)
const ASAMALAR: { ad: string; duraklar: [number, string, string][] }[] = [
  { ad: "Harem'e giriş", duraklar: [[1, "Kâbe'nin ilk göründüğü an", "Harem kapısından metâfa inerken"]] },
  {
    ad: "Kâbe'nin çevresi",
    duraklar: [
      [2, "Metâf", "Kâbe'nin çevresindeki tavaf alanı"],
      [3, "Hacerü'l-Esved", "Doğu köşesi, tavafın başlangıcı"],
      [4, "Mültezem", "Hacerü'l-Esved ile Kâbe kapısı arası"],
      [5, "Hatîm", "Kâbe'nin kuzeyindeki yarım daire"],
      [6, "Mîzâb-ı Rahmet", "Hatîm tarafındaki altın oluk"],
      [7, "İki rükün arası", "Rükn-i Yemânî ile Hacerü'l-Esved arası"],
    ],
  },
  { ad: "Tavaftan sonra", duraklar: [[8, "Makam-ı İbrahim", "Kâbe kapısının karşısı"], [9, "Zemzem", "Tavaf namazından sonra"]] },
  { ad: "Sa'y", duraklar: [[10, "Safa", "Sa'yin başladığı tepe"], [11, "Mes'â ve yeşil ışıklar", "Safa ile Merve arası"], [12, "Merve", "Sa'yin bittiği tepe"]] },
];

const ANLAR: { no: number; ad: string; kaynak: string }[] = [
  { no: 1, ad: "Ezan ile kamet arası", kaynak: "Ebû Dâvûd, Tirmizî" },
  { no: 2, ad: "Secde", kaynak: "Müslim" },
  { no: 3, ad: "Seher vakti", kaynak: "Buhârî, Müslim" },
  { no: 4, ad: "Farz namazların ardından", kaynak: "Tirmizî" },
  { no: 5, ad: "Cuma günündeki icabet saati", kaynak: "Buhârî, Müslim" },
  { no: 6, ad: "Oruçlunun iftar anı", kaynak: "Tirmizî, İbn Mâce" },
  { no: 7, ad: "Yağmur yağarken", kaynak: "Ebû Dâvûd, Hâkim" },
  { no: 8, ad: "Yolcunun ve Allah'ın misafirinin duası", kaynak: "Tirmizî, İbn Mâce" },
  { no: 9, ad: "Zemzem içerken", kaynak: "İbn Mâce" },
  { no: 10, ad: "Gıyabında kardeşine yapılan dua", kaynak: "Müslim" },
];

const KISIMLAR: { ad: string; metin: string }[] = [
  { ad: "Duanın sırrı", metin: "Kur'an'da, hadislerde ve âlimlerimizin dilinde dua" },
  { ad: "Yola çıkmadan", metin: "Tövbe, helalleşme, niyet ve yolculuk duaları" },
  { ad: "12 dua durağı", metin: "Her durağın hikayesi, ayet ve hadisleri, duaları ve münâcâtı" },
  { ad: "Duanın kabul olduğu 10 an", metin: "Sahih ve hasen hadislerle sabit vakitler ve haller" },
  { ad: "Dua adabı", metin: "Bir duanın yedi adımı ve duayı engelleyen şeyler" },
  { ad: "Dua rotası", metin: "Harem'in sakin saatleri ve saat saat bir dua günü" },
  { ad: "Dua listem", metin: "Sevdiklerinizin emanetlerini yazacağınız sayfalar" },
];

const ROTA: { ikon: HugIconName; baslik: string; alt: string; biz: boolean }[] = [
  { ikon: "ucak", baslik: "Uçuşunuz", alt: "Bileti siz alırsınız; tarihinize göre planı biz kurarız", biz: false },
  { ikon: "transfer", baslik: "Cidde'de karşılama", alt: "Havalimanından otelinize özel transfer", biz: true },
  { ikon: "kabe", baslik: "Mekke", alt: "Umreniz ve seçtiğiniz otel, seçtiğiniz gece sayısı", biz: true },
  { ikon: "tren", baslik: "Haremeyn treni", alt: "Mekke–Medine arası hızlı tren ya da transfer", biz: true },
  { ikon: "medine", baslik: "Medine", alt: "Mescid-i Nebevi'ye yakın otel ve ziyaretler", biz: true },
  { ikon: "ucak", baslik: "Dönüş", alt: "Otelden havalimanına transfer", biz: true },
];

// Soru-cevap: "Kâbe'de duanın kabul olduğu yerler", "Mültezem nedir" aramaları ve yapay zekâ cevapları için. Bilgiler kitapçıktan.
const SSS: { q: string; a: string }[] = [
  { q: "Kâbe'de duanın kabul olduğu yerler nerelerdir?", a: "Hasan-ı Basrî'nin Mekke halkına yazdığı risalede Mekke'de duanın kabul olduğu 15 yer sayılır. Bunların Mescid-i Haram'daki ve umreye ait olanları; tavaf alanı (metâf), Mültezem, Altın Oluk'un (Mîzâb) altı, Hatîm, Zemzem, Makam-ı İbrahim'in arkası, Safa, Merve ve Sa'y yoludur. Harem Dua Haritası bunlara Kâbe'nin ilk göründüğü anı, Hacerü'l-Esved'i ve iki rükün arasını ekleyerek 12 durak anlatır. Risalenin isnadı zayıftır; asırlardır hacılar tarafından uygulanmıştır." },
  { q: "Kâbe'yi ilk görünce yapılan dua kabul olur mu?", a: "Kâbe'yi ilk görünce yapılan duanın reddolunmadığına dair rivayet Taberânî'de geçer ve senedi zayıftır. Âlimler fazilet konusunda bu rivayetle amel etmeyi caiz görmüş, bu yüzden \"ilk bakış duası\" asırlardır hacıların geleneği olmuştur. Kesin kabul olur denmez; ama kalbin en yumuşak olduğu anlardan biridir." },
  { q: "Mültezem nedir, nerededir?", a: "Mültezem, Hacerü'l-Esved ile Kâbe'nin kapısı arasındaki yaklaşık iki metrelik duvardır. Adı \"sıkıca sarılınan yer\" demektir. Sahabeden göğsünü ve yüzünü bu duvara dayayarak dua edenler olduğu rivayet edilir (Ebû Dâvûd). Kalabalıkta ulaşamıyorsanız karşısında durup dua etmeniz yeterlidir; kimseyi itmeyin." },
  { q: "Duanın kabul olduğu vakitler hangileridir?", a: "Sahih ve hasen hadislerle bildirilen vakit ve haller şunlardır: ezan ile kamet arası, secde, seher vakti (gecenin son üçte biri), farz namazların ardı, Cuma günündeki icabet saati, oruçlunun iftar anı, yağmur yağarken, yolcunun ve misafirin duası, Zemzem içerken ve gıyabında kardeşine yapılan dua." },
  { q: "Hanımlar Hatîm'e ne zaman girebilir?", a: "Haremeyn İdaresi'nin Haziran 2026 düzenlemesine göre Hatîm'e giriş hanımlar için her gün 06.00 ile 09.00 arasıdır. Saatler sık değiştiği için gitmeden önce görevlilerden teyit edin." },
  { q: "Harem Dua Haritası ücretsiz mi?", a: "Evet. 66 sayfalık PDF'i bu sayfanın sonundan adınızı ve e-posta ya da telefonunuzu yazarak ücretsiz indirebilirsiniz. E-posta yazarsanız adresinize kısa bir doğrulama kodu gönderilir." },
];

const SECIM: string[] = ["Gidiş ve dönüş tarihiniz", "Mekke ve Medine'de kaç gece kalacağınız", "Otel tercihiniz (Harem'e yakın ya da servisli)", "Önce Mekke mi, Medine mi", "Rehberlik ve ziyaret isteyip istemediğiniz"];
const AYAR: string[] = ["Umre vizesi", "Mekke ve Medine otelleri", "Havalimanı ve şehirler arası transferler", "Haremeyn hızlı treni", "Ziyaret turları ve rehberlik"];

export default async function DuaHaritasiPage() {
  const [settings, packages] = await Promise.all([
    getSiteSettings(),
    prisma.package.findMany({ where: { published: true }, select: { slug: true, title: true, duration: true }, orderBy: { createdAt: "desc" }, take: 3 }).catch(() => []),
  ]);
  const wa = (settings.WHATSAPP_NUMBER || "905404010038").replace(/\D/g, "");
  const waHref = `https://wa.me/${wa}?text=${encodeURIComponent("Merhaba, Harem Dua Haritası'nı indirdim. Bireysel umre için bilgi almak istiyorum.")}`;
  const shareHref = `https://wa.me/?text=${encodeURIComponent(`Kâbe'de duanın kabul olduğu 12 yer ve 10 an, ayet ve hadisleriyle: ${SITE_URL}/dua-haritasi`)}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    name: "Harem Dua Haritası",
    description: "Mescid-i Haram'da duanın kabul olduğu 12 yer ve 10 an; ayet, hadis, sahabe rivayetleri ve dualarıyla.",
    url: `${SITE_URL}/dua-haritasi`,
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
        <span aria-hidden className="hat pointer-events-none absolute -right-6 top-16 select-none text-[9rem] leading-none text-white/[0.06] md:text-[15rem]">دعاء</span>
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-[1.15fr_0.85fr] md:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--h-sand)]">Ücretsiz rehber · PDF</p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.1] md:text-6xl">
              <Accent text="Harem *Dua Haritası*" />
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
              Kâbe&apos;de nerede ve ne zaman dua edeceğinizi bilerek gidin. Mescid-i Haram&apos;daki 12 dua durağı ve duanın kabul olduğu 10 an; her biri ayet, hadis, sahabe rivayetleri ve okunuşu ile anlamı yazılı dualarla.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#indir" className="inline-flex items-center gap-2 rounded-xl bg-[var(--h-sand)] px-6 py-3.5 text-sm font-bold text-[var(--h-blue-deep)] transition hover:brightness-95">
                Haritayı indir <HugIcon name="ok" size={18} />
              </a>
              <a href="#kroki" className="rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">İçinde neler var</a>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-6">
              {[["12", "dua durağı"], ["10", "kabul anı"], ["66", "sayfa, PDF"]].map(([n, t]) => (
                <div key={t}>
                  <dt className="text-2xl font-bold text-white md:text-3xl">{n}</dt>
                  <dd className="text-xs text-white/70">{t}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative mx-auto w-full max-w-xs md:max-w-sm">
            <div className="absolute -inset-4 rounded-[2rem] bg-[var(--h-sky)]/20 blur-2xl" aria-hidden />
            <Image src="/indir/harem-dua-haritasi-ornek.png" alt="Harem Dua Haritası iç sayfa örneği: Hacerü'l-Esved durağı" width={909} height={1286} className="absolute -right-6 top-10 hidden w-[78%] rotate-6 rounded-xl shadow-2xl ring-1 ring-black/5 md:block" />
            <Image src={KAPAK} alt="Harem Dua Haritası kapağı" width={909} height={1286} priority className="relative w-[82%] -rotate-3 rounded-xl shadow-2xl ring-1 ring-white/10" />
          </div>
        </div>
      </section>

      {/* Kroki ve 12 durak */}
      <section id="kroki" className="bg-soft scroll-mt-20 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--h-blue)]/70">Harem krokisi</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold text-[var(--h-blue)] md:text-4xl">
            <Accent text="Umre sırasıyla *12 dua durağı*" />
          </h2>
          <p className="mt-4 max-w-2xl text-on-surface-variant">Duraklar umreyi yaparken geçeceğiniz sıraya göre dizilir: önce Kâbe&apos;nin çevresi, sonra Safa&apos;dan Merve&apos;ye. Her durağın sayfasında mekânın hikayesi, ayet ve hadisler, orada yapabilecekleriniz ve dualar var.</p>

          <div className="mt-10 overflow-hidden rounded-3xl bg-[#f7f9fe] p-3 ring-1 ring-[var(--h-sky)]/50 md:p-6">
            <Image src="/indir/harem-dua-haritasi-kroki.jpg" alt="Harem krokisi: Kâbe'nin çevresinde ve Sa'y yolunda 12 dua durağı" width={1600} height={1100} className="h-auto w-full" />
            <p className="mt-2 text-center text-xs text-on-surface-variant">Şematik kroki, ölçekli değildir. Tavaf, Kâbe solunuzda kalacak şekilde döner.</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {ASAMALAR.map((a) => (
              <div key={a.ad} className="rounded-2xl border border-[var(--h-sky)]/60 bg-white p-5">
                <p className="font-bold text-[var(--h-blue)]">{a.ad}</p>
                <ul className="mt-3 space-y-2.5">
                  {a.duraklar.map(([n, ad, yer]) => (
                    <li key={n} className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--h-blue)] text-xs font-bold text-white">{n}</span>
                      <span>
                        <span className="block text-sm font-semibold text-on-surface">{ad}</span>
                        <span className="block text-xs text-on-surface-variant">{yer}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 an */}
      <section className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--h-blue)]/70">Şerefli anlar</p>
              <h2 className="mt-3 text-3xl font-bold text-[var(--h-blue)] md:text-4xl">
                <Accent text="Duanın kabul olduğu *10 an*" />
              </h2>
            </div>
            <a href="#indir" className="text-sm font-bold text-[var(--h-blue)] underline-offset-4 hover:underline">Haritayı indir →</a>
          </div>
          <p className="mt-4 max-w-3xl text-on-surface-variant">Mekânların çoğunun dayanağı zayıf rivayetler ve âlimlerin tecrübesidir; anların dayanağı ise büyük ölçüde sahih ve hasen hadislerdir. Bu anlar Harem&apos;deki bir durağa denk geldiğinde: şerefli bir yerde, şerefli bir anda.</p>
          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {ANLAR.map((a) => (
              <li key={a.no} className={`rounded-2xl p-5 ${a.no === 3 ? "bg-[var(--h-blue)] text-white" : "border border-[var(--h-sky)]/60 bg-[var(--h-white)]"}`}>
                <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${a.no === 3 ? "bg-[var(--h-sand)] text-[var(--h-blue-deep)]" : "bg-[var(--h-blue)] text-white"}`}>{a.no}</span>
                <p className={`mt-3 font-bold leading-snug ${a.no === 3 ? "text-white" : "text-[var(--h-blue)]"}`}>{a.ad}</p>
                <p className={`mt-1 text-xs ${a.no === 3 ? "text-white/70" : "text-on-surface-variant"}`}>{a.kaynak}</p>
              </li>
            ))}
          </ol>

          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {KISIMLAR.map((k, i) => (
              <div key={k.ad} className="flex items-baseline gap-3 rounded-2xl border border-[var(--h-sky)]/60 bg-white px-4 py-3.5">
                <span className="text-xs font-bold text-[var(--h-blue)]/50">0{i + 1}</span>
                <div>
                  <p className="font-bold text-[var(--h-blue)]">{k.ad}</p>
                  <p className="mt-0.5 text-sm text-on-surface-variant">{k.metin}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center rounded-2xl bg-[var(--h-sand)]/50 px-4 py-3.5 text-sm text-[var(--h-blue-deep)]">
              Her bilginin yanında dayanağı ve derecesi yazılıdır: Kur&apos;an, sahih, hasen ya da zayıf.
            </div>
          </div>
        </div>
      </section>

      {/* İnfografik: bireysel umre nasıl kurulur */}
      <section className="bg-warm py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--h-blue)]/70">Harem&apos;e giden yol</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-bold text-[var(--h-blue)] md:text-4xl">
            <Accent text="Umrenizi kendi tarihinizde *planlayın*" />
          </h2>
          <p className="mt-4 max-w-2xl text-on-surface-variant">Tur takvimine bağlı kalmadan, Harem&apos;in sakin saatlerine göre kendi temponuzla. Bireysel umrede yolculuk şöyle ilerler:</p>

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
            <Accent text="Kâbe&apos;de dua hakkında *sorular*" />
          </h2>
          <div className="mt-8"><Faq items={SSS} /></div>
          <p className="mt-6 text-sm text-on-surface-variant">
            Tavaf ve sa&apos;y duaları için: <Link href="/tavaf-kitapcigi" className="font-semibold text-[var(--h-blue)] underline-offset-4 hover:underline">Tavaf El Kitabı</Link> · <Link href="/say-kitapcigi" className="font-semibold text-[var(--h-blue)] underline-offset-4 hover:underline">Sa&apos;y El Kitabı</Link>
          </p>
        </div>
      </section>

      {/* İndir */}
      <section id="indir" className="bg-deep on-dark scroll-mt-24 py-20 text-white md:py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-5 md:grid-cols-[0.8fr_1.2fr] md:px-8">
          <Image src={KAPAK} alt="Harem Dua Haritası kapağı" width={909} height={1286} className="mx-auto w-56 rounded-xl shadow-2xl ring-1 ring-white/10 md:w-full md:max-w-[17rem]" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--h-sand)]">Ücretsiz indirin</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              <Accent text="Harem&apos;de *yanınızda* olsun" />
            </h2>
            <p className="mt-4 text-white/85">Telefonunuza kaydedin ya da yazdırıp yanınıza alın. PDF, 66 sayfa: Harem krokisi, 12 dua durağı, duanın kabul olduğu 10 an, dua adabı, sakin saatler ve sevdikleriniz için dolduracağınız dua listesi.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LeadGateDownload source="dua-haritasi" title="Harem Dua Haritası" cover={KAPAK} hat="دعاء" fileUrl={PDF} fileName="Harem-Dua-Haritasi-2026.pdf" doneNote="Harem'de bizleri de dualarınızdan eksik etmeyin." className="inline-flex items-center gap-2 rounded-xl bg-[var(--h-sand)] px-7 py-4 text-base font-bold text-[var(--h-blue-deep)] transition hover:brightness-95">
                <HugIcon name="kabe" size={20} /> PDF&apos;i indir
              </LeadGateDownload>
              <a href={shareHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10">
                <HugIcon name="mesaj" size={18} /> Umreye gidecek birine gönderin
              </a>
            </div>
            <p className="mt-6 text-xs text-white/60">İndirmek için adınızı ve e-posta ya da telefonunuzu istiyoruz; bilgileriniz yalnızca Hadi Umreye Gidelim tarafından kullanılır. <Link href="/tavaf-kitapcigi" className="underline underline-offset-2 hover:text-white">Tavaf</Link> ve <Link href="/say-kitapcigi" className="underline underline-offset-2 hover:text-white">Sa&apos;y El Kitabı</Link> da ücretsiz.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
