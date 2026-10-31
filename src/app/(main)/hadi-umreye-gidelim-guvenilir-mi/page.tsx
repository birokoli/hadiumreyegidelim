// "Hadi Umreye Gidelim güvenilir mi?" (6 Ekim): marka sorusunun cevabı bizim sayfamızdan gelsin.
// Yalnızca doğrulanabilir bilgi: lisans, açık fiyat, yazılı vize süreci, gerçek yorum sayısı, yapmadıklarımız.
import type { Metadata } from "next";
import { ogGorsel } from "@/lib/seo/og";
import Link from "next/link";
import HelpLayout from "@/components/help/HelpLayout";
import ReviewCard from "@/components/reviews/ReviewCard";
import HugIcon from "@/components/icons/HugIcon";
import { faqJsonLd } from "@/components/ui/kit";
import { getPageTexts } from "@/lib/page-texts";
import { parseFaq } from "@/lib/page-texts/faq";
import { getApprovedReviews } from "@/lib/reviews";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Hadi Umreye Gidelim Güvenilir mi?",
  description: "Hadi Umreye Gidelim kimdir, fiyatlar ve ödeme nasıl işler, vize süreci, misafir yorumları ve yapmadıklarımız: güvenle karar vermeniz için açık bilgiler.",
  alternates: { canonical: "/hadi-umreye-gidelim-guvenilir-mi" },
  openGraph: { images: [ogGorsel("yorumlar", "Hadi Umreye Gidelim güvenilir mi?", "Hakkımızda")] },
};

// Paranız adım adım (31 Ekim): ChatGPT "ödeme yapmadan önce teyit edin" dedi. Hukuki beyan yerine müşterinin kendisinin
// doğrulayabileceği adımlar: onaysız ödeme yok, bölünmüş ödeme (satış masası odemePlani), voucher'da otel onay numarası,
// profilde dosya ve belgeler. Yalnızca sistemde gerçekten olan şeyler yazılır.
const ADIMLAR = [
  { ikon: "fiyat" as const, para: "Ödeme yok", baslik: "Teklifi okursunuz", metin: "Oteller, tarihler, oda tipleri, araç ve toplam fiyat size yazılı bir bağlantıyla gelir. Birden fazla seçenek varsa yan yana karşılaştırırsınız. Onaylamadan tek kuruş istemeyiz." },
  { ikon: "onay" as const, para: "Önden ödeme", baslik: "Onaylar, ödersiniz", metin: "Kartla ya da havaleyle. İsterseniz ödemeyi bölersiniz: otel, vize ve rehberliğin yarısı önden; transfer ve rehberliğin diğer yarısı Cidde'de, sizi karşıladığımızda." },
  { ikon: "otel" as const, para: "Kendiniz doğrularsınız", baslik: "Belgeleriniz gelir", metin: "Voucher'ınızda her otelin onay numarası yazar; yola çıkmadan otele bu numarayla kendiniz sorabilirsiniz. Vizeniz 2 saat içinde gelir. Dosyanızın durumu, ödemeleriniz ve belgeleriniz profilinizdeki Umrelerim sayfasında durur." },
  { ikon: "transfer" as const, para: "Kalan Cidde'de", baslik: "Yola çıkarsınız", metin: "Cidde'de sizi karşılarız. Yolculuk boyunca WhatsApp hattımızdasınız; her talebiniz dosya numaranızla kayda geçer." },
];
const ADIM_SSS = [
  { q: "Ödemeyi ne zaman yapıyorum?", a: "Size gönderilen yazılı teklifi onayladıktan sonra. Teklif aşamasında ödeme istenmez. Kart ya da havaleyle ödenir; isterseniz otel, vize ve rehberliğin yarısı önden, transfer ve rehberliğin diğer yarısı Cidde'de karşılandığınızda ödenir." },
  { q: "Otel rezervasyonumun gerçek olduğunu nasıl anlarım?", a: "Voucher'ınızda her otelin onay numarası yer alır. Yola çıkmadan önce otelle bu numarayla doğrudan iletişime geçip rezervasyonunuzu kendiniz teyit edebilirsiniz." },
  { q: "İptal edersem param iade edilir mi?", a: "Oteller ve transfer firmaları kesinleşen rezervasyon için ücret iadesi yapmadığından, onaydan sonra otel ve transfer ücretleri iade edilmez; vize başvurusu yapıldıktan sonra vize ücreti de iade edilmez. Bu yüzden onaydan önce tarihleri, otelleri ve oda tiplerini sizinle yazılı olarak netleştiririz." },
];

export default async function TrustPage() {
  const [t, reviews] = await Promise.all([getPageTexts("guvenilir"), getApprovedReviews()]);
  const items = parseFaq(t("items"));
  const rated = reviews.filter((r) => r.rating);
  const avg = rated.length ? rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length : null;

  return (
    <HelpLayout active="/hadi-umreye-gidelim-guvenilir-mi" crumb="Güvenilir mi?" kicker="Hakkımızda" title={t("title")} lead={t("lead")}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd([...ADIM_SSS, ...items.map((i) => ({ q: i.q, a: i.a }))])) }} />

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: "guven" as const, k: "Lisans", v: "DTCM 1203162", s: "MBD Tourism L.L.C." },
          { icon: "yorum" as const, k: "Misafir yorumu", v: reviews.length ? `${reviews.length} yorum` : "Yeni", s: avg ? `Ortalama ${avg.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} / 5` : "Doğrulanmış müşterilerden" },
          { icon: "vize" as const, k: "Umre vizesi", v: "2 saatte", s: "Kişi başı 140 USD" },
        ].map((c) => (
          <div key={c.k} className="rounded-2xl border border-outline-variant/20 bg-white p-5">
            <HugIcon name={c.icon} size={28} className="text-primary" />
            <p className="mt-3 text-[12px] uppercase tracking-[0.12em] text-on-surface-variant">{c.k}</p>
            <p className="font-headline text-xl font-bold text-primary">{c.v}</p>
            <p className="text-sm text-on-surface-variant">{c.s}</p>
          </div>
        ))}
      </section>


      <section className="rounded-3xl border border-outline-variant/20 bg-white p-5 md:p-8">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#8a6a1c]">Paranız adım adım</p>
        <h2 className="mt-1 font-headline text-2xl font-bold text-primary md:text-3xl">Neye, ne zaman ödediğinizi bilirsiniz</h2>
        <p className="mt-2 max-w-2xl leading-relaxed text-on-surface-variant">Güveni söz vererek değil, her adımı sizin kontrol edebileceğiniz şekilde kurarak kazanmak istiyoruz.</p>
        <ol className="relative mt-7 grid gap-6 md:grid-cols-4 md:gap-4">
          <span aria-hidden className="absolute left-[19px] top-2 bottom-2 w-px bg-outline-variant/40 md:left-5 md:right-5 md:top-[19px] md:bottom-auto md:h-px md:w-auto" />
          {ADIMLAR.map((a, i) => (
            <li key={a.baslik} className="relative flex gap-4 md:block">
              <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-white ring-4 ring-white">
                <HugIcon name={a.ikon} size={20} />
              </span>
              <div className="md:mt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">{i + 1}. adım</p>
                <h3 className="font-headline text-lg font-bold text-primary">{a.baslik}</h3>
                <span className="mt-1 inline-block rounded-full bg-[#F2DDA6]/50 px-2.5 py-0.5 text-[11px] font-bold text-[#6b5216]">{a.para}</span>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">{a.metin}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-8 rounded-2xl bg-[#F7F4EC] p-4 md:p-5">
          <h3 className="font-headline text-base font-bold text-primary">{ADIM_SSS[2].q}</h3>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{ADIM_SSS[2].a}</p>
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-outline-variant/20 bg-white p-5 md:p-8">
        {items.map((i) => (
          <div key={i.q} className="border-b border-outline-variant/15 pb-5 last:border-0 last:pb-0">
            <h2 className="font-headline text-xl font-bold text-primary">{i.q}</h2>
            <p className="mt-2 leading-relaxed text-on-surface-variant">{i.a}</p>
          </div>
        ))}
      </section>

      {reviews.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-headline text-2xl font-bold text-primary">Misafirlerimiz ne diyor?</h2>
            <Link href="/yorumlar" className="text-sm font-semibold text-primary underline">Tüm yorumlar</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.slice(0, 3).map((r) => <ReviewCard key={r.id} r={r} clamp />)}
          </div>
        </section>
      )}

      <p className="text-sm text-on-surface-variant">
        Başka bir sorunuz mu var? <Link href="/sss" className="font-semibold text-primary underline">Sık sorulan sorulara</Link> bakın ya da <Link href="/iletisim" className="font-semibold text-primary underline">bize yazın</Link>.
      </p>
    </HelpLayout>
  );
}
