import React from 'react';
import {
  renderToBuffer, Document, Page, View, Text, Image, Font, StyleSheet,
} from '@react-pdf/renderer';
import path from 'path';
import {
  calcSaleTotal, formatItemDetail, type PricingType,
} from './quotation-calc';

// ─── Font kayıt ───────────────────────────────────────────────
const fontsDir = path.join(process.cwd(), 'public', 'fonts');

Font.register({
  family: 'Cairo',
  src: path.join(fontsDir, 'Cairo-Regular.ttf'),
});
Font.register({
  family: 'Poppins',
  fonts: [
    { src: path.join(fontsDir, 'Poppins-Regular.ttf'), fontWeight: 400 },
    { src: path.join(fontsDir, 'Poppins-Medium.ttf'),  fontWeight: 500 },
    { src: path.join(fontsDir, 'Poppins-Bold.ttf'),    fontWeight: 700 },
  ],
});

// ─── Stil sabitleri ───────────────────────────────────────────
const BLUE = '#203D76';
const GRAY = '#464646';
const PAD  = 45;

const s = StyleSheet.create({
  page:      { backgroundColor: '#fff', paddingTop: PAD, paddingBottom: PAD + 20, paddingHorizontal: PAD, fontFamily: 'Poppins', color: GRAY },
  hdrRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title:     { fontFamily: 'Cairo', fontSize: 30, color: BLUE, lineHeight: 1.2 },
  logo:      { width: 110, height: 40, objectFit: 'contain' },
  logoTxt:   { fontSize: 11, fontWeight: 700, color: BLUE, textAlign: 'right' },
  meta:      { fontSize: 11, color: GRAY, marginBottom: 20 },
  metaBold:  { fontWeight: 700, color: BLUE },
  body:      { fontSize: 10, lineHeight: 1.7, color: GRAY, marginBottom: 10, textAlign: 'justify' },
  bodyBlue:  { fontSize: 10, lineHeight: 1.7, color: BLUE, fontWeight: 500, marginBottom: 10, textAlign: 'justify' },
  h2:        { fontSize: 10, fontWeight: 700, color: BLUE, marginTop: 16, marginBottom: 5 },
  secSub:    { fontSize: 13, color: GRAY, marginTop: 22, marginBottom: 6 },
  catHdr:    { fontSize: 10, fontWeight: 700, color: BLUE, marginTop: 16, marginBottom: 4 },
  itemName:  { fontSize: 10, fontWeight: 700, color: BLUE, marginBottom: 1 },
  itemPrice: { fontSize: 10, color: GRAY, marginBottom: 2, marginLeft: 10 },
  itemDtl:   { fontSize: 9, color: '#999', marginLeft: 10, marginBottom: 4 },
  tblHead:   { flexDirection: 'row', borderBottomWidth: 1, borderColor: BLUE, paddingBottom: 4, marginBottom: 4 },
  tblRow:    { flexDirection: 'row', borderWidth: 1, borderColor: BLUE, marginBottom: 3, backgroundColor: '#fff' },
  cellLbl:   { flex: 3, fontSize: 9, padding: 6, color: BLUE, fontWeight: 700 },
  cellNum:   { flex: 1, fontSize: 9, padding: 6, color: GRAY, textAlign: 'right' },
  cellNH:    { flex: 1, fontSize: 9, padding: 4, color: BLUE, fontWeight: 700, textAlign: 'right' },
  noteBox:   { marginTop: 20, padding: 14, borderWidth: 1, borderColor: BLUE, borderRadius: 4, backgroundColor: '#f9fafc' },
  noteTxt:   { fontSize: 10, color: BLUE, lineHeight: 1.7, fontWeight: 500 },
  payRow:    { flexDirection: 'row', marginBottom: 8 },
  payLbl:    { fontSize: 10, fontWeight: 700, color: BLUE, marginRight: 4 },
  payTxt:    { fontSize: 10, color: GRAY, flex: 1, lineHeight: 1.6 },
  pgNum:     { position: 'absolute', bottom: 20, right: PAD, fontSize: 9, color: GRAY },
});

// ─── Yardımcılar ──────────────────────────────────────────────
const CAT_LABELS: Record<string, string> = {
  vize:     '1. Vize İşlemleri',
  hotel:    '2. Konaklama Bilgileri',
  transfer: '3. Transfer ve Ulaşım',
  tur:      '4. Gezi ve Ziyaretler',
  flight:   '5. Uçuş Bilgileri',
  extra:    '6. Ekstra Hizmetler',
};
const CAT_ORDER = ['vize', 'hotel', 'transfer', 'tur', 'flight', 'extra'];

const fmtUSD = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USD';
const fmtTL = (n: number, rate: number) =>
  (n * rate).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL';

// ─── Bileşenler ───────────────────────────────────────────────
function PageHeader({ title, logoPath }: { title: string; logoPath?: string | null }) {
  const logoAbs = logoPath ? path.join(process.cwd(), 'public', logoPath) : null;
  return (
    <View style={s.hdrRow}>
      <Text style={s.title}>{title}</Text>
      {logoAbs
        ? <Image style={s.logo} src={logoAbs} />
        : <Text style={s.logoTxt}>hadiumreyegidelim.com</Text>}
    </View>
  );
}

function MetaLine({ startDate, travelDate, adultsCount, childrenCount }: {
  startDate?: string | null; travelDate?: string | null;
  adultsCount: number; childrenCount: number;
}) {
  const date   = startDate || travelDate || '';
  const paxStr = childrenCount > 0
    ? `${adultsCount} Yetişkin + ${childrenCount} Çocuk`
    : `${adultsCount} Yetişkin`;
  return (
    <Text style={s.meta}>
      <Text style={s.metaBold}>{date}: </Text>
      {paxStr}
    </Text>
  );
}

// ─── Tip tanımı ───────────────────────────────────────────────
export interface QuotationData {
  quotationNo:   string;
  customerName:  string;
  adultsCount:   number;
  childrenCount: number;
  travelDate:    string | null;
  startDate:     string | null;
  margin:        number;
  usdRate:       number;
  notes:         string | null;
  logoPath:      string | null;
  items: Array<{
    id:                string;
    category:          string;
    name:              string;
    pricingType:       string;
    unitCostUsd:       number;
    quantity:          number;
    childPricePercent: number;
    vehicleType:       string | null;
    extraBedCount:     number;
    extraBedPriceUsd:  number;
  }>;
}

// ─── PDF Buffer üret ──────────────────────────────────────────
export async function renderQuotationPdf(q: QuotationData): Promise<Buffer> {
  const ctx = { adultsCount: q.adultsCount, childrenCount: q.childrenCount, margin: q.margin };

  const grouped: Record<string, QuotationData['items']> = {};
  CAT_ORDER.forEach(c => { grouped[c] = q.items.filter(i => i.category === c); });

  const catTotal = (cats: string[]) =>
    cats.reduce((sum, c) =>
      sum + (grouped[c] ?? []).reduce((s, item) => {
        const calc = {
          pricingType:       item.pricingType as PricingType,
          unitCostUsd:       item.unitCostUsd,
          quantity:          item.quantity,
          childPricePercent: item.childPricePercent,
          vehicleType:       item.vehicleType ?? '',
          extraBedCount:     item.extraBedCount,
          extraBedPriceUsd:  item.extraBedPriceUsd,
        };
        return s + calcSaleTotal(calc, ctx);
      }, 0),
    0);

  const totals = [
    { label: 'Yemekli Otel Genel Toplam',             usd: catTotal(CAT_ORDER) },
    { label: 'Yemeksiz Otel \u2013 Tursuz Genel Toplam', usd: catTotal(CAT_ORDER.filter(c => c !== 'tur')) },
    { label: 'Sadece Otel Genel Toplam',              usd: catTotal(CAT_ORDER.filter(c => c !== 'tur' && c !== 'transfer')) },
    { label: 'Transfersiz Otel \u2013 Turlu Genel Toplam', usd: catTotal(CAT_ORDER.filter(c => c !== 'transfer')) },
  ];

  const titleLine = `${q.travelDate || 'Umre'}\nUmre Plan\u0131`;

  const doc = (
    <Document>

      {/* SAYFA 1: HAKKIMIZDA */}
      <Page size="A4" style={s.page}>
        <PageHeader title="Hakk\u0131m\u0131zda" logoPath={q.logoPath} />
        <Text style={s.body}>
          Hadiumreyegidelim.com, manevi bir yolculu\u011fa \u00e7\u0131kan ve misafirlerine huzur dolu bir ibadet deneyimi sunmay\u0131 ama\u00e7layan bir turizm platformudur. Medine-i M\u00fcnevvere&apos;den Mekke-i M\u00fckerre me&apos;ye kadar uzanan hizmet yelpazemizle, her m\u00fcminin hayalindeki kutsal topraklar ziyaretini ger\u00e7e\u011fe d\u00f6n\u00fc\u015ft\u00fcr\u00fcyoruz.
        </Text>
        <Text style={s.bodyBlue}>
          Y\u0131llar\u0131n deneyimi ve uzman ekibimizle, butik gruplardan ki\u015fiye \u00f6zel ziyaretlere, manevi ke\u015fiflerden konforlu konaklamalara kadar her ihtiyaca uygun \u00e7\u00f6z\u00fcmler sunuyoruz.
        </Text>
        <Text style={s.body}>
          Hadiumreyegidelim.com olarak, sadece bir seyahat de\u011fil, hayat boyu hat\u0131rlanacak manevi bir ba\u011f kuruyoruz. Her misafirimizin \u00f6zel isteklerini anlayarak, ki\u015fiye \u00f6zel planlamalar yap\u0131yor ve her detay\u0131 titizlikle ele al\u0131yoruz.
        </Text>
        <Text style={s.body}>Siz niyet edin, biz ger\u00e7ekle\u015ftirelim.{'\n'}Hadiumreyegidelim.com ile kutsal topraklar size daha yak\u0131n!</Text>

        <Text style={s.secSub}>Vizyonumuz ve Misyonumuz</Text>
        <Text style={s.body}>
          Ekibimizin her biri, maneviyat ve hizmet a\u015fk\u0131yla dolu profesyonellerden olu\u015fmaktad\u0131r. Misafirlerimize en iyi hizmeti sunmak i\u00e7in s\u00fcrekli e\u011fitimler al\u0131yor, sekt\u00f6rdeki yenilikleri takip ediyor ve en g\u00fcncel bilgileri kullanarak en iyi \u00e7\u00f6z\u00fcmleri sunuyoruz.
        </Text>
        <Text style={s.body}>
          Vizyonumuz, sadece bir seyahat \u015firketi olman\u0131n \u00f6tesine ge\u00e7erek, insanlar\u0131n ya\u015famlar\u0131na manevi de\u011fer katan, mukaddes topraklar\u0131n ruhunu ke\u015ffetmelerini sa\u011flayan ve s\u00fcrd\u00fcr\u00fclebilir turizmi destekleyen bir lider olmakt\u0131r.
        </Text>
        <Text style={s.body}>
          Misyonumuz ise, misafirlerimize her anlar\u0131nda konforlu, g\u00fcvenli ve huzurlu bir ibadet deneyimi ya\u015fatmakt\u0131r.
        </Text>
        <Text style={s.pgNum} render={({ pageNumber }) => String(pageNumber)} fixed />
      </Page>

      {/* SAYFA 2: FİYAT DETAYLARI */}
      <Page size="A4" style={s.page}>
        <PageHeader title={titleLine} logoPath={q.logoPath} />
        <MetaLine startDate={q.startDate} travelDate={q.travelDate} adultsCount={q.adultsCount} childrenCount={q.childrenCount} />

        {CAT_ORDER.filter(cat => grouped[cat]?.length > 0).map(cat => (
          <View key={cat}>
            <Text style={s.catHdr}>{CAT_LABELS[cat]}</Text>
            {grouped[cat].map(item => {
              const calc = {
                pricingType:       item.pricingType as PricingType,
                unitCostUsd:       item.unitCostUsd,
                quantity:          item.quantity,
                childPricePercent: item.childPricePercent,
                vehicleType:       item.vehicleType ?? '',
                extraBedCount:     item.extraBedCount,
                extraBedPriceUsd:  item.extraBedPriceUsd,
              };
              const sale   = calcSaleTotal(calc, ctx);
              const detail = formatItemDetail(calc, ctx);
              return (
                <View key={item.id} wrap={false}>
                  <Text style={s.itemName}>{item.name}</Text>
                  <Text style={s.itemPrice}>{'\u2022'} {fmtUSD(sale)}</Text>
                  {detail ? <Text style={s.itemDtl}>({detail})</Text> : null}
                </View>
              );
            })}
          </View>
        ))}

        <Text style={s.pgNum} render={({ pageNumber }) => String(pageNumber)} fixed />
      </Page>

      {/* SAYFA 3: GENEL TOPLAM */}
      <Page size="A4" style={s.page}>
        <PageHeader title={titleLine} logoPath={q.logoPath} />
        <MetaLine startDate={q.startDate} travelDate={q.travelDate} adultsCount={q.adultsCount} childrenCount={q.childrenCount} />

        <Text style={s.h2}>Genel Toplam</Text>
        <View style={{ marginTop: 10 }}>
          <View style={s.tblHead}>
            <Text style={[s.cellNH, { flex: 3, textAlign: 'left' }]}> </Text>
            {q.usdRate > 0 && <Text style={s.cellNH}>TL</Text>}
            <Text style={s.cellNH}>USD</Text>
          </View>
          {totals.map((t, i) => (
            <View key={i} style={s.tblRow} wrap={false}>
              <Text style={s.cellLbl}>{t.label}</Text>
              {q.usdRate > 0 && <Text style={s.cellNum}>{fmtTL(t.usd, q.usdRate)}</Text>}
              <Text style={s.cellNum}>{fmtUSD(t.usd)}</Text>
            </View>
          ))}
        </View>
        {q.usdRate > 0 && (
          <Text style={{ fontSize: 9, color: BLUE, textAlign: 'right', marginTop: 8, fontWeight: 700 }}>
            1 USD = {q.usdRate.toFixed(4)} TL
          </Text>
        )}
        {q.notes ? (
          <View style={s.noteBox} wrap={false}>
            <Text style={s.h2}>Notlar</Text>
            <Text style={{ fontSize: 10, color: GRAY, lineHeight: 1.6 }}>{q.notes}</Text>
          </View>
        ) : null}

        <Text style={s.pgNum} render={({ pageNumber }) => String(pageNumber)} fixed />
      </Page>

      {/* SAYFA 4: ÖDEME KOŞULLARI */}
      <Page size="A4" style={s.page}>
        <PageHeader title={titleLine} logoPath={q.logoPath} />
        <MetaLine startDate={q.startDate} travelDate={q.travelDate} adultsCount={q.adultsCount} childrenCount={q.childrenCount} />

        <Text style={s.h2}>\u00d6nemli Notlar ve \u00d6deme Ko\u015fullar\u0131</Text>
        <Text style={s.bodyBlue}>Belirtilen fiyatlara %20 KDV dahil de\u011fildir.</Text>
        <Text style={s.h2}>\u00d6deme Se\u00e7enekleri:</Text>

        {[
          { lbl: '\u2022 Nakit \u00d6deme: ', txt: 'Teklifte sunulan tutarlar, \u00f6demenin nakden (elden) yap\u0131lmas\u0131 durumunda ge\u00e7erli olan net fiyatlard\u0131r.' },
          { lbl: '\u2022 EFT / Havale: ', txt: '\u00d6demenin banka kanal\u0131yla (EFT/Havale) yap\u0131lmas\u0131 durumunda, mevcut tutara %20 KDV ilave edilecektir.' },
          { lbl: '\u2022 Kredi Kart\u0131: ', txt: '\u00d6demenin kredi kart\u0131 ile tahsil edilmesi durumunda, mevcut tutar \u00fczerine %20 KDV ve %5 hizmet komisyonu uygulanacakt\u0131r.' },
        ].map((item, i) => (
          <View key={i} style={s.payRow}>
            <Text style={s.payLbl}>{item.lbl}</Text>
            <Text style={s.payTxt}>{item.txt}</Text>
          </View>
        ))}

        <Text style={[s.h2, { marginTop: 16 }]}>Teklif Esnekli\u011fi:</Text>
        <Text style={s.body}>
          \u0130\u015fbu fiyat teklifi, detayland\u0131r\u0131lan hizmet kalemlerinin tamam\u0131n\u0131 kapsamaktad\u0131r. Talebiniz do\u011frultusunda paket i\u00e7eri\u011finden \u00fcr\u00fcn veya hizmet \u00e7\u0131kar\u0131labilir.
        </Text>

        <View style={s.noteBox} wrap={false}>
          <Text style={s.noteTxt}>
            Size \u00f6zel haz\u0131rlad\u0131\u011f\u0131m\u0131z fiyat teklifi yukar\u0131daki dosyan\u0131n i\u00e7erisinde detayl\u0131ca mevcuttur. Fiyatlar\u0131m\u0131z Dolar Kuru endeksli olup verdi\u011fimiz bu fiyat teklifi 1 ile 3 i\u015f g\u00fcn\u00fc ge\u00e7erlidir. Fiyatlar\u0131m\u0131za U\u00e7ak Bileti dahil de\u011fildir.{'\n\n'}D\u00f6n\u00fc\u015f\u00fcn\u00fcz\u00fc Bekliyoruz efendim.
          </Text>
        </View>

        <Text style={s.pgNum} render={({ pageNumber }) => String(pageNumber)} fixed />
      </Page>

    </Document>
  );

  return renderToBuffer(doc) as Promise<Buffer>;
}
