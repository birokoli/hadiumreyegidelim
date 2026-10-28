// /bireysel-umre rehber bölümü (28 Ekim, SEO programı 1. faz): "bireysel umre", "nasıl yapılır", "rehberi" ve
// "maliyeti" aramalarına sayfanın kendisi cevap versin. Fiyatlar uydurulmaz: hepsi kataloğun bu ayki fiyatlarından hesaplanır.
// Program: docs/BIREYSEL-UMRE-SEO-PROGRAMI.md
import Link from "next/link";
import { currentMonth, monthLabel, priceFor, type CatalogItem } from "@/lib/catalog";
import { parseTransferSlug } from "@/lib/catalog/transfers";
import { formatPrice } from "@/lib/format";
import { Panel, Section, SectionHead } from "@/components/ui/kit";

/** Rehberde anlatılan altı adım; HowTo yerine düz içerik (Google HowTo zengin sonucunu kaldırdı) */
export const NASIL_ADIMLAR = [
  { title: "Tarihi ve süreyi seçin", text: "Bireysel umrede tarihi siz belirlersiniz. İlk umre için 7–10 gün yeterlidir; çoğu kişi 4 gece Mekke, 3 gece Medine ya da 5+5 gece planlar. Ramazan ve sömestr dönemleri en yoğun, dolayısıyla en pahalı aylardır." },
  { title: "Uçak biletini alın", text: "Bileti kendiniz alırsınız. İstanbul'dan Cidde ve Medine'ye direkt seferler var; diğer illerden çoğunlukla aktarmalı gidilir. Cidde'ye inip Mekke'den başlamak, ihrama girip umreyi ilk gün yapmanızı sağlar." },
  { title: "Umre vizesini alın", text: "Suudi Arabistan e-vizesi pasaport bilgilerinizle çevrim içi alınır; otel rezervasyonu, uçak bileti, pasaport ve biyometrik fotoğraf tamamsa 2 iş saatinde çıkar. Pasaportunuz Suudi Arabistan'a giriş tarihinden itibaren en az 6 ay geçerli olmalıdır." },
  { title: "Mekke ve Medine otelini seçin", text: "Otel fiyatı oda başına ve gecelik hesaplanır; bir odada en fazla 4 kişi kalır. Harem'e yürüme mesafesi fiyatı en çok etkileyen şeydir: yaşlı ya da çocuklu yolcular için yakın otel, günlük yorgunluğu belirgin biçimde azaltır." },
  { title: "Transferi ayarlayın", text: "Havalimanı, Mekke–Medine arası ve dönüş için özel araç (sedan, minivan, minibüs) ya da Haremeyn hızlı treni kullanılır. Araç fiyatı kişi değil araç başınadır; aile ya da arkadaş grubunda kişi başı maliyet düşer." },
  { title: "Umrenizi yapın, Ravza randevusu alın", text: "Mekke'de ihram, tavaf, sa'y ve tıraşla umre tamamlanır. Medine'de Ravza-i Mutahhara ziyareti için Nusuk uygulamasından randevu alınır; umrenizi bizimle planlarsanız randevuyu biz alırız. İsterseniz ilahiyatçı rehber eşliği ve ziyaret turları eklenir." },
];

type Fiyat = { ad: string; usd: number } | null;

const ay = currentMonth();
const fiyat = (i: CatalogItem) => priceFor(i, ay);

function enUygun(items: CatalogItem[]): Fiyat {
  let best: Fiyat = null;
  for (const i of items) {
    const p = fiyat(i);
    if (p != null && (!best || p < best.usd)) best = { ad: i.name, usd: p };
  }
  return best;
}

/** Katalogdan maliyet kalemleri: en uygun ve Harem'e yakın (≤ 400 m) otel, sedan transferler, vize */
export function maliyetVerisi(catalog: CatalogItem[]) {
  const otel = (sehir: string) => catalog.filter((i) => i.category === "hotel" && i.city?.toLocaleLowerCase("tr") === sehir);
  const yakin = (list: CatalogItem[]) => list.filter((i) => i.distanceMeters != null && i.distanceMeters <= 400);
  const transfer = (rota: string) => {
    const i = catalog.find((x) => {
      const t = parseTransferSlug(x.slug);
      return t?.route.key === rota && t.vehicle === "camry";
    });
    const p = i ? fiyat(i) : null;
    return p != null ? { ad: "Toyota Camry", usd: p } : null;
  };
  const vize = catalog.find((i) => i.category === "vize");
  const vizeUsd = vize ? fiyat(vize) : null;
  return {
    ay,
    mekke: enUygun(otel("mekke")),
    mekkeYakin: enUygun(yakin(otel("mekke"))),
    medine: enUygun(otel("medine")),
    medineYakin: enUygun(yakin(otel("medine"))),
    ciddeMekke: transfer("cidde-hav-mekke"),
    mekkeMedine: transfer("mekke-medine"),
    medineHav: transfer("medine-otel-hav"),
    vize: vizeUsd != null ? { ad: "Suudi Arabistan e-vize", usd: vizeUsd } : null,
  };
}

/** Örnek hesap: 2 yetişkin, 1 oda, 4 gece Mekke + 3 gece Medine, en uygun oteller, sedan transfer, vize. Eksik kalem varsa null. */
export function ornekHesap(m: ReturnType<typeof maliyetVerisi>) {
  if (!m.mekke || !m.medine || !m.ciddeMekke || !m.mekkeMedine || !m.medineHav || !m.vize) return null;
  const satirlar = [
    { kalem: `Mekke oteli · 4 gece (${m.mekke.ad})`, usd: m.mekke.usd * 4 },
    { kalem: `Medine oteli · 3 gece (${m.medine.ad})`, usd: m.medine.usd * 3 },
    { kalem: "Transfer · Cidde Havalimanı → Mekke", usd: m.ciddeMekke.usd },
    { kalem: "Transfer · Mekke → Medine", usd: m.mekkeMedine.usd },
    { kalem: "Transfer · Medine oteli → Medine Havalimanı", usd: m.medineHav.usd },
    { kalem: "Umre vizesi · 2 kişi", usd: m.vize.usd * 2 },
  ];
  const toplam = satirlar.reduce((s, x) => s + x.usd, 0);
  return { satirlar, toplam, kisiBasi: toplam / 2 };
}

const LINKLER = [
  { href: "/umre-vizesi", baslik: "Bireysel umre vizesi", metin: "E-vize nasıl alınır, hangi belgeler gerekir, kaç günde çıkar." },
  { href: "/blog/bireysel-umre-vize-maliyet-rehberi", baslik: "Bireysel umre fiyatları", metin: "Tursuz gitmek gerçekten daha mı ekonomik? Kalem kalem maliyet." },
  { href: "/blog/7-gunluk-bireysel-umre-programi-2026", baslik: "7 günlük bireysel umre programı", metin: "Gün gün Mekke ve Medine programı." },
  { href: "/blog/10-gunluk-bireysel-umre-programi", baslik: "10 günlük bireysel umre", metin: "5 gece Mekke, 5 gece Medine planı." },
  { href: "/blog/14-gunluk-bireysel-umre-2026", baslik: "14 günlük bireysel umre", metin: "Uzun kalmak isteyen ilk umreciler için." },
  { href: "/oteller", baslik: "Mekke ve Medine otelleri", metin: "Harem'e mesafe, yıldız ve bu ayın fiyatı." },
  { href: "/umre-rehberi/bireysel-umre-mi-turla-umre-mi", baslik: "Bireysel umre mi, turla umre mi?", metin: "Hangisi size uygun, artı ve eksileriyle." },
  { href: "/blog/tursuz-umre-otel-transfer-kim-ayarlar", baslik: "Tursuz umrede otel ve transfer", metin: "Kim ayarlar, nelere dikkat edilir." },
  { href: "/yorumlar", baslik: "Bireysel umre yapanların yorumları", metin: "Bizimle gidenlerin anlattıkları." },
];

const SEHIRLER = [
  ["istanbul", "İstanbul"], ["ankara", "Ankara"], ["izmir", "İzmir"], ["bursa", "Bursa"], ["konya", "Konya"], ["antalya", "Antalya"], ["kayseri", "Kayseri"], ["gaziantep", "Gaziantep"],
] as const;

const usd = (n: number) => formatPrice(Math.round(n));

export default function BireyselUmreRehberi({ catalog }: { catalog: CatalogItem[] }) {
  const m = maliyetVerisi(catalog);
  const ornek = ornekHesap(m);
  const tablo = [
    { kalem: "Mekke oteli (1 oda, 1 gece)", en: m.mekke, yakin: m.mekkeYakin },
    { kalem: "Medine oteli (1 oda, 1 gece)", en: m.medine, yakin: m.medineYakin },
  ];
  const tek = [
    { kalem: "Transfer · Cidde Havalimanı → Mekke (araç başı)", f: m.ciddeMekke },
    { kalem: "Transfer · Mekke → Medine (araç başı)", f: m.mekkeMedine },
    { kalem: "Transfer · Medine oteli → Havalimanı (araç başı)", f: m.medineHav },
    { kalem: "Umre vizesi (kişi başı)", f: m.vize },
  ].filter((x) => x.f);

  return (
    <>
      <Section tone="white" id="bireysel-umre-nedir">
        <div className="max-w-screen-md mx-auto">
          <SectionHead kicker="Rehber" title="Bireysel umre nedir?" />
          <div className="space-y-4 text-[15px] leading-relaxed text-on-surface-variant">
            <p>
              <strong className="text-on-surface">Bireysel umre</strong>, bir tur kafilesine katılmadan; tarihini, Mekke ve Medine otelini, transferini ve vizesini kendinizin seçtiği umredir.
              Sabit bir grup takvimi yoktur: istediğiniz gün gider, istediğiniz kadar kalır, ailenizle ya da arkadaşlarınızla kendi temponuzda ibadet edersiniz.
            </p>
            <p>
              Bireysel umre &quot;her şeyi tek başına yapmak&quot; demek değildir. Uçak biletini siz alırsınız; otel, transfer, vize ve isterseniz rehberlik gibi hizmetleri bir firmadan tek tek seçebilirsiniz.
              Yukarıdaki planlayıcı tam olarak bunu yapar: seçtiğiniz her kalemin bu ayki fiyatını toplar ve toplamı gösterir.
            </p>
          </div>
        </div>
      </Section>

      <Section id="bireysel-umre-nasil-yapilir">
        <div className="max-w-screen-md mx-auto">
          <SectionHead kicker="Adım adım" title="Bireysel umre nasıl yapılır?" />
          <ol className="space-y-5">
            {NASIL_ADIMLAR.map((a, i) => (
              <li key={a.title} className="flex gap-4">
                <span className="w-9 h-9 shrink-0 rounded-full bg-primary text-white font-bold flex items-center justify-center">{i + 1}</span>
                <div>
                  <h3 className="font-semibold text-on-surface text-[16px]">{a.title}</h3>
                  <p className="mt-1 text-[14.5px] leading-relaxed text-on-surface-variant">{a.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {(tablo.some((x) => x.en) || tek.length > 0) && (
        <Section tone="white" id="bireysel-umre-maliyeti">
          <div className="max-w-screen-md mx-auto">
            <SectionHead kicker={`${monthLabel(m.ay)} fiyatları`} title="Bireysel umre ne kadar tutar?" />
            <p className="text-[15px] leading-relaxed text-on-surface-variant mb-6">
              Bireysel umrenin fiyatı dört kalemden oluşur: otel, transfer, vize ve uçak bileti. Aşağıdaki fiyatlar kataloğumuzun {monthLabel(m.ay)} fiyatlarıdır ve her ay güncellenir; uçak bileti dahil değildir.
            </p>
            <div className="overflow-x-auto border border-outline-variant/30 bg-white">
              <table className="w-full text-[14px]">
                <thead className="bg-surface-container-low text-left text-on-surface">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Kalem</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">En uygun</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Harem&apos;e 400 m içinde, en uygun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-on-surface-variant">
                  {tablo.filter((x) => x.en || x.yakin).map((x) => (
                    <tr key={x.kalem}>
                      <td className="px-4 py-3">{x.kalem}</td>
                      <td className="px-4 py-3 font-semibold text-on-surface whitespace-nowrap">{x.en ? usd(x.en.usd) : "—"}</td>
                      <td className="px-4 py-3 font-semibold text-on-surface whitespace-nowrap">{x.yakin ? usd(x.yakin.usd) : "—"}</td>
                    </tr>
                  ))}
                  {tek.map((x) => (
                    <tr key={x.kalem}>
                      <td className="px-4 py-3">{x.kalem}</td>
                      <td className="px-4 py-3 font-semibold text-on-surface whitespace-nowrap" colSpan={2}>{usd(x.f!.usd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {ornek && (
              <Panel tone="muted" className="mt-6 p-5 md:p-6">
                <h3 className="font-headline text-lg font-bold text-primary">Örnek hesap: 2 kişi, 7 gece</h3>
                <p className="text-[13px] text-on-surface-variant mt-1">1 oda, 4 gece Mekke + 3 gece Medine, en uygun oteller, sedan araçla transfer, 2 vize. Uçak bileti hariç.</p>
                <ul className="mt-4 space-y-1.5 text-[14px]">
                  {ornek.satirlar.map((s) => (
                    <li key={s.kalem} className="flex justify-between gap-4">
                      <span className="text-on-surface-variant">{s.kalem}</span>
                      <span className="font-semibold text-on-surface whitespace-nowrap">{usd(s.usd)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-outline-variant/40 flex flex-wrap justify-between gap-2 text-on-surface">
                  <span className="font-semibold">Toplam: {usd(ornek.toplam)}</span>
                  <span className="font-bold text-primary">Kişi başı: {usd(ornek.kisiBasi)}</span>
                </div>
                <p className="mt-3 text-[12.5px] text-on-surface-variant">
                  Aynı odada 3–4 kişi kaldığınızda ve araç paylaşıldığında kişi başı tutar düşer. Kendi tarihinizle kesin fiyatı görmek için yukarıdaki planlayıcıyı kullanın.
                </p>
              </Panel>
            )}
          </div>
        </Section>
      )}

      <Section id="bireysel-umre-rehberi">
        <div className="max-w-screen-lg mx-auto">
          <SectionHead kicker="Bireysel umre rehberi" title="Planlamadan önce okuyun" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {LINKLER.map((l) => (
              <Link key={l.href} href={l.href} className="block bg-white border border-outline-variant/30 p-4 hover:border-primary/40 transition-colors">
                <span className="block font-semibold text-primary">{l.baslik}</span>
                <span className="block mt-1 text-[13px] text-on-surface-variant">{l.metin}</span>
              </Link>
            ))}
          </div>
          <h3 className="mt-10 font-semibold text-on-surface">Şehrinizden bireysel umre</h3>
          <p className="mt-1 text-[13.5px] text-on-surface-variant">81 ilin her biri için uçuş seçenekleri, süre ve mesafe bilgisi:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SEHIRLER.map(([slug, ad]) => (
              <Link key={slug} href={`/${slug}-cikisli-bireysel-umre`} className="px-3 py-1.5 text-[13px] font-semibold bg-white border border-outline-variant/30 text-primary hover:border-primary/40">
                {ad} çıkışlı bireysel umre
              </Link>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
