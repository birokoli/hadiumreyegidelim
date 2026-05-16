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

Font.register({ family: 'Cairo', src: path.join(fontsDir, 'Cairo-Regular.ttf') });
Font.register({
  family: 'Poppins',
  fonts: [
    { src: path.join(fontsDir, 'Poppins-Regular.ttf'), fontWeight: 400 },
    { src: path.join(fontsDir, 'Poppins-Medium.ttf'),  fontWeight: 500 },
    { src: path.join(fontsDir, 'Poppins-Bold.ttf'),    fontWeight: 700 },
  ],
});

// ─── Renkler & stil ───────────────────────────────────────────
const BLUE = '#203D76';
const GRAY = '#464646';
const PAD  = 48;

const s = StyleSheet.create({
  page:     { backgroundColor: '#fff', paddingTop: PAD, paddingBottom: PAD + 20, paddingHorizontal: PAD, fontFamily: 'Poppins', color: GRAY },
  hdrRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title:    { fontFamily: 'Cairo', fontSize: 39, color: BLUE, lineHeight: 1.15, fontWeight: 400 },
  logo:     { width: 130, height: 46, objectFit: 'contain' },
  logoTxt:  { fontSize: 10, fontWeight: 700, color: BLUE, textAlign: 'right', lineHeight: 1.5 },
  meta:     { fontSize: 13, color: GRAY, marginBottom: 20 },
  metaBold: { fontWeight: 700, color: BLUE },
  body:     { fontSize: 11, lineHeight: 1.75, color: GRAY, marginBottom: 12, textAlign: 'justify' },
  bodyBlue: { fontSize: 11, lineHeight: 1.75, color: BLUE, fontWeight: 500, marginBottom: 12, textAlign: 'justify' },
  h2:       { fontSize: 11, fontWeight: 700, color: BLUE, marginTop: 18, marginBottom: 6 },
  secSub:   { fontSize: 16, fontWeight: 400, color: GRAY, marginTop: 24, marginBottom: 8 },
  catHdr:   { fontSize: 11, fontWeight: 700, color: BLUE, marginTop: 18, marginBottom: 5 },
  itemName: { fontSize: 11, fontWeight: 700, color: BLUE, marginBottom: 2 },
  itemPrc:  { fontSize: 11, color: GRAY, marginBottom: 2, marginLeft: 12 },
  itemDtl:  { fontSize: 9, color: '#999', marginLeft: 12, marginBottom: 5 },
  tblHead:  { flexDirection: 'row', borderBottomWidth: 1, borderColor: BLUE, paddingBottom: 4, marginBottom: 4 },
  tblRow:   { flexDirection: 'row', borderWidth: 1, borderColor: BLUE, marginBottom: 3, backgroundColor: '#fff' },
  cellLbl:  { flex: 3, fontSize: 10, padding: 7, color: BLUE, fontWeight: 700 },
  cellNum:  { flex: 1, fontSize: 10, padding: 7, color: GRAY, textAlign: 'right' },
  cellNH:   { flex: 1, fontSize: 10, padding: 5, color: BLUE, fontWeight: 700, textAlign: 'right' },
  noteBox:  { marginTop: 22, padding: 16, borderWidth: 1, borderColor: BLUE, borderRadius: 5, backgroundColor: '#f9fafc' },
  noteTxt:  { fontSize: 11, color: BLUE, lineHeight: 1.75, fontWeight: 500 },
  payRow:   { flexDirection: 'row', marginBottom: 10 },
  payLbl:   { fontSize: 11, fontWeight: 700, color: BLUE, marginRight: 5 },
  payTxt:   { fontSize: 11, color: GRAY, flex: 1, lineHeight: 1.65 },
  pgNum:    { position: 'absolute', bottom: 22, right: PAD, fontSize: 10, color: GRAY },
});

// ─── Kategori sırası & etiketler ──────────────────────────────
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

// ─── Sayfa başlığı ────────────────────────────────────────────
function PageHeader({ title, logoPath }: { title: string; logoPath?: string | null }) {
  const logoAbs = logoPath ? path.join(process.cwd(), 'public', logoPath) : null;
  return (
    <View style={s.hdrRow}>
      <Text style={s.title}>{title}</Text>
      {logoAbs
        ? <Image style={s.logo} src={logoAbs} />
        : (
          <Text style={s.logoTxt}>
            {'hadı\numreye\nGİDELİM.COM'}
          </Text>
        )}
    </View>
  );
}

// ─── Meta satırı ──────────────────────────────────────────────
function MetaLine({ startDate, travelDate, adultsCount, childrenCount }: {
  startDate?: string | null; travelDate?: string | null;
  adultsCount: number; childrenCount: number;
}) {
  const date = startDate || travelDate || '';
  const pax  = childrenCount > 0
    ? `${adultsCount} Yetişkin + ${childrenCount} Çocuk`
    : `${adultsCount} Yetişkin`;
  return (
    <Text style={s.meta}>
      <Text style={s.metaBold}>{date}{': '}</Text>
      {pax}
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

// ─── PDF üret ─────────────────────────────────────────────────
export async function renderQuotationPdf(q: QuotationData): Promise<Buffer> {
  const ctx = { adultsCount: q.adultsCount, childrenCount: q.childrenCount, margin: q.margin };

  const grouped: Record<string, QuotationData['items']> = {};
  CAT_ORDER.forEach(c => { grouped[c] = q.items.filter(i => i.category === c); });

  const getCalc = (item: QuotationData['items'][number]) => ({
    pricingType:       item.pricingType as PricingType,
    unitCostUsd:       item.unitCostUsd,
    quantity:          item.quantity,
    childPricePercent: item.childPricePercent,
    vehicleType:       item.vehicleType ?? '',
    extraBedCount:     item.extraBedCount,
    extraBedPriceUsd:  item.extraBedPriceUsd,
  });

  const catTotal = (cats: string[]) =>
    cats.reduce((sum, c) =>
      sum + (grouped[c] ?? []).reduce((s, item) =>
        s + calcSaleTotal(getCalc(item), ctx), 0), 0);

  const totals = [
    { label: 'Yemekli Otel Genel Toplam',              usd: catTotal(CAT_ORDER) },
    { label: 'Yemeksiz Otel \u2013 Tursuz Genel Toplam', usd: catTotal(CAT_ORDER.filter(c => c !== 'tur')) },
    { label: 'Sadece Otel Genel Toplam',               usd: catTotal(CAT_ORDER.filter(c => c !== 'tur' && c !== 'transfer')) },
    { label: 'Transfersiz Otel \u2013 Turlu Genel Toplam', usd: catTotal(CAT_ORDER.filter(c => c !== 'transfer')) },
  ];

  const titleLine = `${q.travelDate || 'Umre'}\nUmre Plan\u0131`;
  const activeCats = CAT_ORDER.filter(cat => grouped[cat]?.length > 0);

  const doc = (
    <Document>

      {/* ═══════ SAYFA 1: HAKKIMIZDA ═══════ */}
      <Page size="A4" style={s.page}>
        <PageHeader title={'Hakkımızda'} logoPath={q.logoPath} />

        <Text style={s.body}>
          {'Hadiumreyegidelim.com, manevi bir yolculuğa çıkan ve misafirlerine huzur dolu bir ibadet deneyimi sunmayı amaçlayan bir turizm platformudur. Medine-i Münevvere\'den Mekke-i Mükerreme\'ye kadar uzanan hizmet yelpazemizle, her müminin hayalindeki kutsal topraklar ziyaretini gerçeğe dönüştürüyoruz.'}
        </Text>
        <Text style={s.bodyBlue}>
          {'Yılların deneyimi ve uzman ekibimizle, butik gruplardan kişiye özel ziyaretlere, manevi keşiflerden konforlu konaklamalara kadar her ihtiyaca uygun çözümler sunuyoruz. Özel transfer hizmetleri, rehberli mukaddes mekan turları, hızlı tren organizasyonları ve daha fazlasını içeren geniş bir hizmet portföyüne sahibiz.'}
        </Text>
        <Text style={s.body}>
          {'Hadiumreyegidelim.com olarak, sadece bir seyahat değil, hayat boyu hatırlanacak manevi bir bağ kuruyoruz. Her misafirimizin özel isteklerini anlayarak, kişiye özel planlamalar yapıyor ve her detayı titizlikle ele alıyoruz. Güven, konfor ve kalite anlayışıyla çıktığımız bu yolda, misafirlerimize unutulmaz bir ibadet deneyimi sunmayı taahhüt ediyoruz.'}
        </Text>
        <Text style={s.body}>
          {'Siz niyet edin, biz gerçekleştirelim.\nHadiumreyegidelim.com ile kutsal topraklar size daha yakın!'}
        </Text>

        <Text style={s.secSub}>{'Vizyonumuz ve Misyonumuz'}</Text>
        <Text style={s.body}>
          {'Ekibimizin her biri, maneviyat ve hizmet aşkıyla dolu profesyonellerden oluşmaktadır. Misafirlerimize en iyi hizmeti sunmak için sürekli eğitimler alıyor, sektördeki yenilikleri takip ediyor ve en güncel bilgileri kullanarak en iyi çözümleri sunuyoruz. Güvenilirlik, şeffaflık ve müşteri odaklılık ilkelerimizle, her adımda yanınızda oluyoruz.'}
        </Text>
        <Text style={s.body}>
          {'Vizyonumuz, sadece bir seyahat şirketi olmanın ötesine geçerek, insanların yaşamlarına manevi değer katan, mukaddes toprakların ruhunu keşfetmelerini sağlayan ve sürdürülebilir turizmi destekleyen bir lider olmaktır. Bu doğrultuda, modern teknolojiyi en iyi şekilde kullanarak, her misafirimizin ihtiyaç ve beklentilerine uygun çözümler sunuyoruz.'}
        </Text>
        <Text style={s.body}>
          {'Misyonumuz ise, misafirlerimize her anlarında konforlu, güvenli ve huzurlu bir ibadet deneyimi yaşatmaktır. Müşteri memnuniyetini en üst düzeyde tutmayı ilke edinen firmamız, kişiye özel planlamalar ve esnek hizmet seçenekleri ile her türlü ziyaret ihtiyacına cevap vermektedir.'}
        </Text>

        <Text style={s.pgNum} render={({ pageNumber }) => String(pageNumber)} fixed />
      </Page>

      {/* ═══════ SAYFA 2: FİYAT DETAYLARI ═══════ */}
      <Page size="A4" style={s.page}>
        <PageHeader title={titleLine} logoPath={q.logoPath} />
        <MetaLine
          startDate={q.startDate} travelDate={q.travelDate}
          adultsCount={q.adultsCount} childrenCount={q.childrenCount}
        />

        {activeCats.length === 0 ? (
          <Text style={s.body}>{'Henüz kalem eklenmemiş.'}</Text>
        ) : (
          activeCats.map(cat => (
            <View key={cat}>
              <Text style={s.catHdr}>{CAT_LABELS[cat]}</Text>
              {grouped[cat].map(item => {
                const calc  = getCalc(item);
                const sale  = calcSaleTotal(calc, ctx);
                const dtl   = formatItemDetail(calc, ctx);
                return (
                  <View key={item.id} wrap={false}>
                    <Text style={s.itemName}>{item.name}</Text>
                    <Text style={s.itemPrc}>{'\u2022 '}{fmtUSD(sale)}</Text>
                    {dtl ? <Text style={s.itemDtl}>{'('}{dtl}{')'}</Text> : null}
                  </View>
                );
              })}
            </View>
          ))
        )}

        <Text style={s.pgNum} render={({ pageNumber }) => String(pageNumber)} fixed />
      </Page>

      {/* ═══════ SAYFA 3: GENEL TOPLAM ═══════ */}
      <Page size="A4" style={s.page}>
        <PageHeader title={titleLine} logoPath={q.logoPath} />
        <MetaLine
          startDate={q.startDate} travelDate={q.travelDate}
          adultsCount={q.adultsCount} childrenCount={q.childrenCount}
        />

        <Text style={s.h2}>{'Genel Toplam'}</Text>
        <View style={{ marginTop: 10 }}>
          <View style={s.tblHead}>
            <Text style={[s.cellNH, { flex: 3, textAlign: 'left' }]}>{' '}</Text>
            {q.usdRate > 0 && <Text style={s.cellNH}>{'TL'}</Text>}
            <Text style={s.cellNH}>{'USD'}</Text>
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
          <Text style={{ fontSize: 9, color: BLUE, textAlign: 'right', marginTop: 10, fontWeight: 700 }}>
            {'1 USD = '}{q.usdRate.toFixed(4)}{' TL'}
          </Text>
        )}
        {q.notes ? (
          <View style={s.noteBox} wrap={false}>
            <Text style={s.h2}>{'Notlar'}</Text>
            <Text style={{ fontSize: 11, color: GRAY, lineHeight: 1.65 }}>{q.notes}</Text>
          </View>
        ) : null}

        <Text style={s.pgNum} render={({ pageNumber }) => String(pageNumber)} fixed />
      </Page>

      {/* ═══════ SAYFA 4: ÖDEME KOŞULLARI ═══════ */}
      <Page size="A4" style={s.page}>
        <PageHeader title={titleLine} logoPath={q.logoPath} />
        <MetaLine
          startDate={q.startDate} travelDate={q.travelDate}
          adultsCount={q.adultsCount} childrenCount={q.childrenCount}
        />

        <Text style={s.h2}>{'Önemli Notlar ve Ödeme Koşulları'}</Text>
        <Text style={s.bodyBlue}>{'Belirtilen fiyatlara %20 KDV dahil değildir.'}</Text>
        <Text style={s.h2}>{'Ödeme Seçenekleri:'}</Text>

        <View style={s.payRow}>
          <Text style={s.payLbl}>{'• Nakit Ödeme: '}</Text>
          <Text style={s.payTxt}>{'Teklifte sunulan tutarlar, ödemenin nakden (elden) yapılması durumunda geçerli olan net fiyatlardır.'}</Text>
        </View>
        <View style={s.payRow}>
          <Text style={s.payLbl}>{'• EFT / Havale: '}</Text>
          <Text style={s.payTxt}>{'Ödemenin banka kanalıyla (EFT/Havale) yapılması durumunda, mevcut tutara %20 KDV ilave edilecektir.'}</Text>
        </View>
        <View style={s.payRow}>
          <Text style={s.payLbl}>{'• Kredi Kartı: '}</Text>
          <Text style={s.payTxt}>{'Ödemenin kredi kartı ile tahsil edilmesi durumunda, işlem maliyetleri nedeniyle mevcut tutar üzerine %20 KDV ve %5 hizmet komisyonu uygulanacaktır.'}</Text>
        </View>

        <Text style={[s.h2, { marginTop: 18 }]}>{'Teklif Esnekliği:'}</Text>
        <Text style={s.body}>
          {'İşbu fiyat teklifi, detaylandırılan hizmet kalemlerinin tamamını kapsamaktadır. Talebiniz doğrultusunda paket içeriğinden ürün veya hizmet çıkarılabilir; bu durumda teklif, güncel tercihleriniz üzerinden yeniden revize edilerek tarafınıza sunulacaktır.'}
        </Text>

        <View style={s.noteBox} wrap={false}>
          <Text style={s.noteTxt}>
            {'Size özel hazırladığımız fiyat teklifi yukarıdaki dosyanın içerisinde detaylıca mevcuttur. Fiyatlarımız Dolar Kuru endeksli olup verdiğimiz bu fiyat teklifi 1 ile 3 iş günü geçerlidir. Fiyatlarımıza Uçak Bileti dahil değildir.\n\nDönüşünüzü Bekliyoruz efendim.'}
          </Text>
        </View>

        <Text style={s.pgNum} render={({ pageNumber }) => String(pageNumber)} fixed />
      </Page>

    </Document>
  );

  return renderToBuffer(doc) as Promise<Buffer>;
}
