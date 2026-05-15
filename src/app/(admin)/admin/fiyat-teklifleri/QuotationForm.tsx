'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

// ─── Types ────────────────────────────────────────────────
interface ServiceLibItem {
  id: string;
  category: string;
  name: string;
  description?: string;
  defaultCost: number;
  currency: string;
  unit?: string;
}

interface QuotationItem {
  _key: string;
  category: string;
  name: string;
  costPrice: number;
  salePrice: number;
  currency: string;
  quantity: number;
  unit: string;
  sortOrder: number;
}

const CATEGORIES = [
  { value: 'vize',     label: 'Vize',        icon: 'badge' },
  { value: 'hotel',    label: 'Konaklama',   icon: 'hotel' },
  { value: 'transfer', label: 'Transfer',    icon: 'directions_car' },
  { value: 'tur',      label: 'Gezi & Tur',  icon: 'tour' },
  { value: 'flight',   label: 'Uçuş',        icon: 'flight' },
  { value: 'extra',    label: 'Ekstra',       icon: 'add_circle' },
];

const CAT_LABELS: Record<string, string> = {
  vize: '1. Vize İşlemleri',
  hotel: '2. Konaklama Bilgileri',
  transfer: '3. Transfer ve Ulaşım',
  tur: '4. Gezi ve Ziyaretler',
  flight: '5. Uçuş Bilgileri',
  extra: '6. Ekstra Hizmetler',
};

const STATUS_OPTIONS = [
  { value: 'draft',    label: 'Taslak' },
  { value: 'sent',     label: 'Gönderildi' },
  { value: 'accepted', label: 'Kabul Edildi' },
  { value: 'rejected', label: 'Reddedildi' },
  { value: 'expired',  label: 'Süresi Doldu' },
];

// ─── SVG Logo (inline for PDF) ────────────────────────────
const LOGO_SVG_INLINE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 467.86 346.32" style="width:120px;height:auto;display:block;">
<defs><style>.lc{fill:#203c76;}</style></defs>
<path class="lc" d="M91.67,90.38v67.4h-11.05v-67.4c0-19.94-11.49-32.94-31.86-32.94s-37.92,13.87-37.92,43.13v57.21H0V6.08h10.84v63.93c8.24-16.04,22.1-22.97,38.79-22.97,25.79,0,42.04,17.12,42.04,43.34Z"/>
<path class="lc" d="M228.62,49.43v108.36h-11.05v-24.49c-9.1,16.25-25.79,26.87-46.59,26.87-30.77,0-56.13-24.49-56.13-56.56s25.35-56.56,56.13-56.56c20.8,0,37.49,10.62,46.59,26.87v-24.49h11.05ZM217.57,103.6c0-25.79-19.94-46.16-45.73-46.16s-45.94,20.37-45.94,46.16,20.15,46.16,45.94,46.16,45.73-20.37,45.73-46.16Z"/>
<path class="lc" d="M368.39,6.08v151.7h-10.84v-25.14c-8.88,16.69-25.57,27.52-46.59,27.52-30.99,0-56.13-24.49-56.13-56.56s25.14-56.56,56.13-56.56c21.02,0,37.71,10.84,46.59,27.52V6.08h10.84ZM357.56,103.6c0-25.79-20.16-46.16-45.94-46.16s-45.94,20.37-45.94,46.16,20.15,46.16,45.94,46.16,45.94-20.37,45.94-46.16Z"/>
<path class="lc" d="M67.29,175.18v69.48h-20.84v-6.53c-3.75,5.14-10.7,8.48-19.87,8.48-14.03,0-25.98-10-25.98-28.76v-42.66h20.84v39.6c0,8.62,5.42,12.65,12.09,12.65,7.64,0,12.92-4.45,12.92-14.31v-37.93h20.84Z"/>
<path class="lc" d="M186.78,201.99v42.66h-20.84v-40.85c0-6.95-3.33-11.39-10-11.39s-10.84,4.86-10.84,13.06v39.18h-20.84v-40.85c0-6.95-3.33-11.39-10-11.39s-10.84,4.86-10.84,13.06v39.18h-20.84v-69.48h20.84v6.39c3.2-4.72,9.31-8.34,18.62-8.34,8.2,0,14.31,3.33,18.2,9.17,3.89-5.56,10.28-9.17,20.15-9.17,15.98,0,26.4,11.39,26.4,28.76Z"/>
<path class="lc" d="M242.77,173.79v23.62c-8.61-1.39-20.84,2.08-20.84,15.84v31.4h-20.84v-69.48h20.84v12.37c2.78-9.31,12.09-13.76,20.84-13.76Z"/>
<path class="lc" d="M285.7,227.98c5.7,0,10.56-2.22,13.34-5.28l16.67,9.59c-6.81,9.45-17.09,14.31-30.29,14.31-23.76,0-38.49-15.98-38.49-36.68s15.01-36.68,36.96-36.68c20.29,0,35.29,15.7,35.29,36.68,0,2.92-.28,5.7-.83,8.34h-49.33c2.64,7.23,9.03,9.73,16.67,9.73ZM298.48,202.69c-2.22-8.06-8.48-10.98-14.73-10.98-7.92,0-13.2,3.89-15.15,10.98h29.87Z"/>
<path class="lc" d="M394.22,175.18l-23.76,67.39c-7.78,22.09-20.15,30.85-39.6,29.87v-19.45c9.73,0,14.31-3.06,17.37-11.53l-27.65-66.28h22.93l15.42,42.52,13.06-42.52h22.23Z"/>
<path class="lc" d="M434.37,227.98c5.7,0,10.56-2.22,13.34-5.28l16.67,9.59c-6.81,9.45-17.09,14.31-30.29,14.31-23.76,0-38.49-15.98-38.49-36.68s15.01-36.68,36.96-36.68c20.29,0,35.29,15.7,35.29,36.68,0,2.92-.28,5.7-.83,8.34h-49.33c2.64,7.23,9.03,9.73,16.67,9.73ZM447.16,202.69c-2.22-8.06-8.48-10.98-14.73-10.98-7.92,0-13.2,3.89-15.15,10.98h29.87Z"/>
<path class="lc" d="M47.24,286.03v40.36c0,12.72-9.41,19.93-21.12,19.93-9.92,0-16.96-3.99-20.01-10.18l3.73-2.12c2.2,4.5,6.95,8.23,16.28,8.23,10.6,0,16.88-6.19,16.88-15.86v-7.8c-3.48,6.53-10.01,10.77-18.23,10.77-12.13,0-21.96-9.58-21.96-22.13s9.84-22.13,21.96-22.13c8.23,0,14.76,4.24,18.23,10.77v-9.84h4.24ZM42.99,307.23c0-10.09-7.89-18.06-17.98-18.06s-17.98,7.97-17.98,18.06,7.89,18.06,17.98,18.06,17.98-7.97,17.98-18.06Z"/>
<path class="lc" d="M119.23,269.07v59.36h-4.24v-9.84c-3.48,6.53-10.01,10.77-18.23,10.77-12.13,0-21.96-9.58-21.96-22.13s9.84-22.13,21.96-22.13c8.23,0,14.76,4.24,18.23,10.77v-26.8h4.24ZM114.99,307.23c0-10.09-7.89-18.06-17.98-18.06s-17.98,7.97-17.98,18.06,7.89,18.06,17.98,18.06,17.98-7.97,17.98-18.06Z"/>
<path class="lc" d="M434.37,227.98c5.7,0,10.56-2.22,13.34-5.28l16.67,9.59c-6.81,9.45-17.09,14.31-30.29,14.31-23.76,0-38.49-15.98-38.49-36.68s15.01-36.68,36.96-36.68c20.29,0,35.29,15.7,35.29,36.68,0,2.92-.28,5.7-.83,8.34h-49.33c2.64,7.23,9.03,9.73,16.67,9.73ZM447.16,202.69c-2.22-8.06-8.48-10.98-14.73-10.98-7.92,0-13.2,3.89-15.15,10.98h29.87Z"/>
</svg>`;

// ─── Helpers ──────────────────────────────────────────────
function uid() { return Math.random().toString(36).slice(2, 9); }

function calcSalePrice(cost: number, margin: number) {
  return parseFloat((cost * (1 + margin / 100)).toFixed(2));
}

function fmtUSD(n: number) {
  return n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USD';
}
function fmtTL(n: number, rate: number) {
  return (n * rate).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' TL';
}

// ─── PDF HTML (3-page, matches reference template) ────────
function buildPdfHtml(fields: {
  quotationNo: string;
  customerName: string;
  customerPhone?: string;
  pax: number;
  travelDate: string;
  startDate: string;
  usdRate: number;
  notes?: string;
  items: QuotationItem[];
}) {
  const { quotationNo, customerName, pax, travelDate, startDate, usdRate, notes, items } = fields;

  // Group items by category in order
  const CAT_ORDER = ['vize', 'hotel', 'transfer', 'tur', 'flight', 'extra'];
  const grouped: Record<string, QuotationItem[]> = {};
  CAT_ORDER.forEach(c => { grouped[c] = items.filter(i => i.category === c); });

  // Category totals
  const catTotal = (cats: string[]) =>
    cats.reduce((s, c) => s + (grouped[c] ?? []).reduce((cs, i) => cs + i.salePrice * i.quantity, 0), 0);

  const allCats = CAT_ORDER;
  const withoutTur = CAT_ORDER.filter(c => c !== 'tur');
  const withoutTurTransfer = CAT_ORDER.filter(c => c !== 'tur' && c !== 'transfer');
  const withoutTransfer = CAT_ORDER.filter(c => c !== 'transfer');

  const totals = [
    { label: 'Yemekli Otel Genel Toplam',         usd: catTotal(allCats) },
    { label: 'Yemeksiz Otel - Tursuz Genel Toplam', usd: catTotal(withoutTur) },
    { label: 'Sadece Otel Genel Toplam',           usd: catTotal(withoutTurTransfer) },
    { label: 'Transfersiz Otel-Turlu Genel Toplam', usd: catTotal(withoutTransfer) },
  ];

  // Category items HTML
  const catItemsHtml = CAT_ORDER
    .filter(cat => grouped[cat]?.length > 0)
    .map(cat => {
      const catItems = grouped[cat].map(item => `
        <div style="font-family:'Poppins',sans-serif;font-weight:700;font-size:11px;color:#203D76;margin:8px 0 2px;">${item.name}</div>
        <div style="font-family:'Poppins',sans-serif;font-size:11px;color:#464646;padding-left:14px;position:relative;line-height:18px;">
          <span style="position:absolute;left:4px;">•</span>
          ${fmtUSD(item.salePrice * item.quantity)}${item.quantity > 1 ? ` (${item.quantity} × ${fmtUSD(item.salePrice)})` : ''}
        </div>
      `).join('');
      return `
        <div style="font-family:'Poppins',sans-serif;font-weight:700;font-size:11px;color:#203D76;margin:20px 0 6px;">${CAT_LABELS[cat] || cat}</div>
        ${catItems}
      `;
    }).join('');

  // Summary table rows
  const summaryRows = totals.map(t => `
    <tr>
      <td style="font-family:'Poppins',sans-serif;font-size:11px;padding:8px 12px;border:1px solid #203D76;color:#203D76;font-weight:700;background:white;">${t.label}</td>
      <td style="font-family:'Poppins',sans-serif;font-size:11px;padding:8px 12px;border:1px solid #203D76;color:#464646;text-align:right;background:white;">${usdRate > 0 ? fmtTL(t.usd, usdRate) : '—'}</td>
      <td style="font-family:'Poppins',sans-serif;font-size:11px;padding:8px 12px;border:1px solid #203D76;color:#464646;text-align:right;background:white;">${fmtUSD(t.usd)}</td>
    </tr>
  `).join('');

  const docHeader = (title: string) => `
    <div style="overflow:hidden;margin-bottom:32px;">
      <div style="float:right;text-align:right;margin-top:4px;">
        ${LOGO_SVG_INLINE}
      </div>
      <h1 style="font-family:'Cairo',sans-serif;font-size:39px;font-weight:400;color:#203D76;margin:0;line-height:1.15;">${title}</h1>
    </div>
  `;

  const metaLine = `<p style="font-family:'Poppins',sans-serif;font-size:13px;color:#464646;margin:16px 0 24px;"><strong style="font-weight:700;">${startDate || travelDate}:</strong> ${customerName} ( ${pax} Yetişkin )</p>`;

  const PAGE_STYLE = `background:white;color:#464646;padding:56px 64px;font-family:'Poppins',sans-serif;min-height:1050px;position:relative;`;
  const pageNum = (n: number) => `<div style="position:absolute;bottom:30px;right:50px;font-family:'Poppins',sans-serif;font-size:10px;color:#464646;">${n}</div>`;

  const bodyStyle = `font-family:'Poppins',sans-serif;font-size:11px;line-height:20px;color:#464646;margin:0 0 14px;text-align:justify;`;
  const bodyHighStyle = `font-family:'Poppins',sans-serif;font-size:11px;line-height:20px;color:#203D76;margin:0 0 14px;text-align:justify;font-weight:500;`;
  const h2Style = `font-family:'Poppins',sans-serif;font-weight:700;font-size:11px;color:#203D76;margin:20px 0 6px;`;
  const sectionSubtitle = `font-family:'Poppins',sans-serif;font-size:16px;font-weight:400;color:#464646;margin:28px 0 8px;`;

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Poppins:wght@400;500;700&display=swap" rel="stylesheet"/>
</head>
<body style="background:white;margin:0;padding:0;">

<!-- ══════════════════════ SAYFA 1: HAKKIMIZDA ══════════════════════ -->
<div id="page-1" style="${PAGE_STYLE}">
  ${docHeader('Hakkımızda')}
  <p style="${bodyStyle}">Hadiumreyegidelim.com, manevi bir yolculuğa çıkan ve misafirlerine huzur dolu bir ibadet deneyimi sunmayı amaçlayan bir turizm platformudur. Medine-i Münevvere'den Mekke-i Mükerreme'ye kadar uzanan hizmet yelpazemizle, her müminin hayalindeki kutsal topraklar ziyaretini gerçeğe dönüştürüyoruz.</p>
  <p style="${bodyHighStyle}">Yılların deneyimi ve uzman ekibimizle, butik gruplardan kişiye özel ziyaretlere, manevi keşiflerden konforlu konaklamalara kadar her ihtiyaca uygun çözümler sunuyoruz. Özel transfer hizmetleri, rehberli mukaddes mekan turları, hızlı tren organizasyonları ve daha fazlasını içeren geniş bir hizmet portföyüne sahibiz.</p>
  <p style="${bodyStyle}">Hadiumreyegidelim.com olarak, sadece bir seyahat değil, hayat boyu hatırlanacak manevi bir bağ kuruyoruz. Her misafirimizin özel isteklerini anlayarak, kişiye özel planlamalar yapıyor ve her detayı titizlikle ele alıyoruz. Güven, konfor ve kalite anlayışıyla çıktığımız bu yolda, misafirlerimize unutulmaz bir ibadet deneyimi sunmayı taahhüt ediyoruz.</p>
  <p style="${bodyStyle}">Siz niyet edin, biz gerçekleştirelim.<br/>Hadiumreyegidelim.com ile kutsal topraklar size daha yakın!</p>
  <div style="${sectionSubtitle}">Vizyonumuz ve Misyonumuz</div>
  <p style="${bodyStyle}">Ekibimizin her biri, maneviyat ve hizmet aşkıyla dolu profesyonellerden oluşmaktadır. Misafirlerimize en iyi hizmeti sunmak için sürekli eğitimler alıyor, sektördeki yenilikleri takip ediyor ve en güncel bilgileri kullanarak en iyi çözümleri sunuyoruz. Güvenilirlik, şeffaflık ve müşteri odaklılık ilkelerimizle, her adımda yanınızda oluyoruz.</p>
  <p style="${bodyStyle}">Vizyonumuz, sadece bir seyahat şirketi olmanın ötesine geçerek, insanların yaşamlarına manevi değer katan, mukaddes toprakların ruhunu keşfetmelerini sağlayan ve sürdürülebilir turizmi destekleyen bir lider olmaktır. Bu doğrultuda, modern teknolojiyi en iyi şekilde kullanarak, her misafirimizin ihtiyaç ve beklentilerine uygun çözümler sunuyoruz.</p>
  <p style="${bodyStyle}">Misyonumuz ise, misafirlerimize her anlarında konforlu, güvenli ve huzurlu bir ibadet deneyimi yaşatmaktır. Müşteri memnuniyetini en üst düzeyde tutmayı ilke edinen firmamız, kişiye özel planlamalar ve esnek hizmet seçenekleri ile her türlü ziyaret ihtiyacına cevap vermektedir.</p>
  ${pageNum(1)}
</div>

<!-- ══════════════════════ SAYFA 2: TEKLİF ══════════════════════ -->
<div id="page-2" style="${PAGE_STYLE}">
  ${docHeader(`${travelDate || 'Umre'}<br/>Umre Planı`)}
  ${metaLine}

  ${catItemsHtml}

  <div style="${h2Style}margin-top:28px;">Genel Toplam</div>
  <table style="width:100%;border-collapse:separate;border-spacing:3px;margin-top:8px;">
    <thead>
      <tr>
        <th style="font-family:'Poppins',sans-serif;font-size:11px;padding:4px 12px;text-align:right;color:#203D76;font-weight:700;"></th>
        <th style="font-family:'Poppins',sans-serif;font-size:11px;padding:4px 12px;text-align:right;color:#203D76;font-weight:700;">TL</th>
        <th style="font-family:'Poppins',sans-serif;font-size:11px;padding:4px 12px;text-align:right;color:#203D76;font-weight:700;">USD</th>
      </tr>
    </thead>
    <tbody>
      ${summaryRows}
    </tbody>
  </table>
  ${usdRate > 0 ? `<p style="font-family:'Poppins',sans-serif;font-size:10px;color:#203D76;text-align:right;margin-top:12px;font-weight:700;">1 USD = ${usdRate.toFixed(4)} TL</p>` : ''}

  ${notes ? `
  <div style="margin-top:20px;padding:14px 16px;border:1px solid #203D76;border-radius:6px;background:#f9fafc;">
    <div style="${h2Style}margin-top:0;">Notlar</div>
    <p style="${bodyStyle}margin-bottom:0;white-space:pre-wrap;">${notes}</p>
  </div>` : ''}

  ${pageNum(2)}
</div>

<!-- ══════════════════════ SAYFA 3: ÖDEME KOŞULLARI ══════════════════════ -->
<div id="page-3" style="${PAGE_STYLE}">
  ${docHeader(`${travelDate || 'Umre'}<br/>Umre Planı`)}
  ${metaLine}

  <div style="${h2Style}margin-top:20px;">Önemli Notlar ve Ödeme Koşulları</div>
  <p style="${bodyHighStyle}margin-top:4px;">Belirtilen fiyatlara %20 KDV dahil değildir.</p>

  <div style="${h2Style}">Ödeme Seçenekleri:</div>

  <div style="margin-bottom:12px;">
    <span style="font-family:'Poppins',sans-serif;font-weight:700;font-size:11px;color:#203D76;">• Nakit Ödeme: </span>
    <span style="font-family:'Poppins',sans-serif;font-size:11px;line-height:18px;color:#464646;">Teklifte sunulan tutarlar, ödemenin nakden (elden) yapılması durumunda geçerli olan net fiyatlardır.</span>
  </div>
  <div style="margin-bottom:12px;">
    <span style="font-family:'Poppins',sans-serif;font-weight:700;font-size:11px;color:#203D76;">• EFT / Havale: </span>
    <span style="font-family:'Poppins',sans-serif;font-size:11px;line-height:18px;color:#464646;">Ödemenin banka kanalıyla (EFT/Havale) yapılması durumunda, mevcut tutara %20 KDV ilave edilecektir.</span>
  </div>
  <div style="margin-bottom:12px;">
    <span style="font-family:'Poppins',sans-serif;font-weight:700;font-size:11px;color:#203D76;">• Kredi Kartı: </span>
    <span style="font-family:'Poppins',sans-serif;font-size:11px;line-height:18px;color:#464646;">Ödemenin kredi kartı ile tahsil edilmesi durumunda, işlem maliyetleri nedeniyle mevcut tutar üzerine %20 KDV ve %5 hizmet komisyonu uygulanacaktır.</span>
  </div>

  <div style="${h2Style}margin-top:20px;">Teklif Esnekliği:</div>
  <p style="${bodyStyle}">• İşbu fiyat teklifi, detaylandırılan hizmet kalemlerinin tamamını kapsamaktadır. Talebiniz doğrultusunda paket içeriğinden ürün veya hizmet çıkarılabilir; bu durumda teklif, güncel tercihleriniz üzerinden yeniden revize edilerek tarafınıza sunulacaktır.</p>

  <div style="margin-top:24px;padding:16px 20px;border:1px solid #203D76;border-radius:6px;font-family:'Poppins',sans-serif;font-size:11px;color:#203D76;line-height:20px;font-weight:500;background:#f9fafc;">
    Size özel hazırladığımız fiyat teklifi yukarıdaki dosyanın içerisinde detaylıca mevcuttur. Fiyatlarımız Dolar Kuru endeksli olup verdiğimiz bu fiyat teklifi 1 ile 3 iş günü geçerlidir. Fiyatlarımıza Uçak Bileti dahil değildir.<br/><br/>
    Dönüşünüzü Bekliyoruz efendim.
  </div>

  ${pageNum(3)}
</div>

</body>
</html>`;
}

// ─── Main Component ────────────────────────────────────────
export default function QuotationForm({ editId }: { editId?: string }) {
  const router = useRouter();
  const [html2pdfReady, setHtml2pdfReady] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [pax, setPax] = useState(1);
  const [travelDate, setTravelDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [validUntil, setValidUntil] = useState('3 iş günü');
  const [margin, setMargin] = useState(20);
  const [usdRate, setUsdRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('draft');
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [quotationNo, setQuotationNo] = useState('');
  const [createdAt, setCreatedAt] = useState(new Date().toISOString());

  // UI state
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [serviceLib, setServiceLib] = useState<ServiceLibItem[]>([]);
  const [libOpen, setLibOpen] = useState(false);
  const [libSearch, setLibSearch] = useState('');
  const [addingCategory, setAddingCategory] = useState('vize');

  // Load service library
  useEffect(() => {
    fetch('/api/admin/service-library').then(r => r.json()).then(d => setServiceLib(d.services ?? []));
  }, []);

  // Load existing quotation for edit
  useEffect(() => {
    if (!editId) return;
    fetch(`/api/admin/quotations/${editId}`)
      .then(r => r.json())
      .then(d => {
        const q = d.quotation;
        if (!q) return;
        setCustomerName(q.customerName);
        setCustomerPhone(q.customerPhone ?? '');
        setCustomerEmail(q.customerEmail ?? '');
        setPax(q.pax);
        setTravelDate(q.travelDate ?? '');
        setStartDate(q.startDate ?? '');
        setValidUntil(q.validUntil ?? '3 iş günü');
        setMargin(q.margin);
        setUsdRate(q.usdRate ?? 0);
        setNotes(q.notes ?? '');
        setStatus(q.status);
        setQuotationNo(q.quotationNo);
        setCreatedAt(q.createdAt);
        setItems(q.items.map((i: {
          id: string; category: string; name: string;
          costPrice: number; salePrice: number; currency: string;
          quantity: number; unit?: string; sortOrder: number;
        }) => ({ ...i, _key: i.id, unit: i.unit ?? '' })));
      });
  }, [editId]);

  const recalcItems = useCallback((newMargin: number) => {
    setItems(prev => prev.map(item => ({
      ...item,
      salePrice: calcSalePrice(item.costPrice, newMargin),
    })));
  }, []);

  function handleMarginChange(val: number) {
    setMargin(val);
    recalcItems(val);
  }

  function addItem(category: string) {
    setItems(prev => [...prev, {
      _key: uid(), category, name: '',
      costPrice: 0, salePrice: 0, currency: 'USD',
      quantity: 1, unit: 'kişi', sortOrder: prev.length,
    }]);
  }

  function addFromLib(svc: ServiceLibItem) {
    const sale = calcSalePrice(svc.defaultCost, margin);
    setItems(prev => [...prev, {
      _key: uid(),
      category: svc.category,
      name: svc.name,
      costPrice: svc.defaultCost,
      salePrice: sale,
      currency: svc.currency,
      quantity: 1,
      unit: svc.unit ?? 'kişi',
      sortOrder: prev.length,
    }]);
    setLibOpen(false);
  }

  function updateItem(key: string, field: keyof QuotationItem, value: string | number) {
    setItems(prev => prev.map(item => {
      if (item._key !== key) return item;
      const updated = { ...item, [field]: value };
      if (field === 'costPrice') {
        updated.salePrice = calcSalePrice(Number(value), margin);
      }
      return updated;
    }));
  }

  function removeItem(key: string) {
    setItems(prev => prev.filter(i => i._key !== key));
  }

  const grandTotal = items.reduce((s, i) => s + i.salePrice * i.quantity, 0);
  const totalCost = items.reduce((s, i) => s + i.costPrice * i.quantity, 0);
  const profit = grandTotal - totalCost;

  async function save() {
    if (!customerName.trim()) return alert('Müşteri adı zorunlu.');
    setSaving(true);
    const body = {
      customerName, customerPhone, customerEmail, pax,
      travelDate, startDate, validUntil, margin, usdRate,
      notes, status,
      items: items.map((it, idx) => ({ ...it, sortOrder: idx })),
    };
    const res = editId
      ? await fetch(`/api/admin/quotations/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch('/api/admin/quotations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

    if (res.ok) {
      const data = await res.json();
      if (!editId) {
        router.replace(`/admin/fiyat-teklifleri/${data.quotation.id}`);
      } else {
        setQuotationNo(data.quotation.quotationNo);
      }
    }
    setSaving(false);
  }

  function downloadPdf() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const h2p = (window as any).html2pdf;
    if (!h2p) return alert('PDF kütüphanesi yükleniyor, lütfen bekleyin.');
    setDownloading(true);

    const html = buildPdfHtml({ quotationNo: quotationNo || 'TASLAK', customerName, customerPhone, pax, travelDate, startDate, usdRate, notes, items });

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    wrapper.style.position = 'fixed';
    wrapper.style.left = '-99999px';
    wrapper.style.top = '0';
    wrapper.style.width = '794px';
    wrapper.style.overflow = 'hidden';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.zIndex = '-1';
    document.body.appendChild(wrapper);

    const customerSlug = customerName.replace(/\s+/g, '');
    h2p().set({
      margin: 0,
      filename: `hadiumreyegidelim_com-Fiyat-Teklifi-${customerSlug}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], before: ['#page-2', '#page-3'] },
    }).from(wrapper).save().then(() => {
      document.body.removeChild(wrapper);
      setDownloading(false);
    });
  }

  const filteredLib = serviceLib.filter(s =>
    !libSearch || s.name.toLowerCase().includes(libSearch.toLowerCase())
  );

  // Group items by category for display
  const CAT_ORDER = ['vize', 'hotel', 'transfer', 'tur', 'flight', 'extra'];
  const catGroups = CAT_ORDER.map(catVal => {
    const cat = CATEGORIES.find(c => c.value === catVal)!;
    return { ...cat, items: items.filter(i => i.category === catVal) };
  });

  // PDF preview HTML
  const previewHtml = buildPdfHtml({
    quotationNo: quotationNo || 'TASLAK',
    customerName: customerName || 'Müşteri Adı',
    customerPhone, pax, travelDate, startDate, usdRate, notes, items,
  });

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
        onLoad={() => setHtml2pdfReady(true)}
      />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/admin/fiyat-teklifleri')} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div>
              <h1 className="text-[20px] font-bold text-gray-900">{editId ? 'Teklif Düzenle' : 'Yeni Teklif'}</h1>
              {quotationNo && <p className="text-[12px] text-[#203D76] font-semibold">{quotationNo}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={downloadPdf}
              disabled={downloading || items.length === 0 || !html2pdfReady}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">{downloading ? 'progress_activity' : 'picture_as_pdf'}</span>
              PDF İndir
            </button>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl text-[13px] text-gray-700 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#003781]/15"
            >
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1.5 bg-[#003781] hover:bg-[#002d6a] disabled:opacity-50 text-white text-[13px] font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">{saving ? 'progress_activity' : 'save'}</span>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-0 bg-gray-100 rounded-xl p-1 w-fit">
          {(['form', 'preview'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${activeTab === tab ? 'bg-white text-[#003781] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'form' ? 'Düzenle' : 'PDF Önizleme'}
            </button>
          ))}
        </div>

        {activeTab === 'form' ? (
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">

            {/* ── Left: main form ── */}
            <div className="space-y-4">

              {/* Customer info */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <h2 className="text-[13px] font-bold text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-[#003781]">person</span>
                  Müşteri Bilgileri
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Müşteri Adı *', value: customerName, setter: setCustomerName, placeholder: 'Çilem Hanım', type: 'text' },
                    { label: 'Telefon', value: customerPhone, setter: setCustomerPhone, placeholder: '+90 5xx xxx xx xx', type: 'text' },
                    { label: 'E-posta', value: customerEmail, setter: setCustomerEmail, placeholder: 'ornek@email.com', type: 'email' },
                  ].map(f => (
                    <div key={f.label}>
                      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">{f.label}</label>
                      <input type={f.type} value={f.value} onChange={e => f.setter(e.target.value)} placeholder={f.placeholder}
                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/15 focus:border-[#003781]/40" />
                    </div>
                  ))}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Kişi Sayısı</label>
                    <input type="number" value={pax} onChange={e => setPax(Number(e.target.value))} min={1}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003781]/15" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Tarih Başlığı (PDF)</label>
                    <input type="text" value={travelDate} onChange={e => setTravelDate(e.target.value)} placeholder="8-13 Haziran 2026"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/15 focus:border-[#003781]/40" />
                    <p className="text-[10px] text-gray-400 mt-1">PDF başlığında görünür</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Başlangıç Tarihi</label>
                    <input type="text" value={startDate} onChange={e => setStartDate(e.target.value)} placeholder="8 Haziran 2026"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/15 focus:border-[#003781]/40" />
                    <p className="text-[10px] text-gray-400 mt-1">Meta satırında görünür</p>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">USD / TL Kuru</label>
                    <input type="number" value={usdRate || ''} onChange={e => setUsdRate(Number(e.target.value))} placeholder="38.50" step="0.01"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/15 focus:border-[#003781]/40" />
                    <p className="text-[10px] text-gray-400 mt-1">Özet tabloda TL hesabı için</p>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Notlar (PDF sayfa 2'ye eklenir)</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Ek koşullar, açıklamalar..." rows={2}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/15 resize-none" />
                </div>
              </div>

              {/* Items by category */}
              {catGroups.map(cat => (
                <div key={cat.value} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/30">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[17px] text-[#203D76]" style={{ fontVariationSettings: "'FILL' 1" }}>{cat.icon}</span>
                      <span className="text-[13px] font-bold text-gray-800">{cat.label}</span>
                      {cat.items.length > 0 && <span className="text-[11px] text-gray-400">· {cat.items.length} kalem</span>}
                    </div>
                    <button onClick={() => addItem(cat.value)}
                      className="text-[12px] font-semibold text-[#003781] hover:bg-[#003781]/5 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors">
                      <span className="material-symbols-outlined text-[15px]">add</span>Ekle
                    </button>
                  </div>

                  {cat.items.length === 0 ? (
                    <div className="px-5 py-3.5 text-[12px] text-gray-400 text-center">
                      Kalem yok —{' '}
                      <button onClick={() => addItem(cat.value)} className="text-[#003781] font-semibold hover:underline">Ekle</button>
                      {' '}veya{' '}
                      <button onClick={() => setLibOpen(true)} className="text-[#003781] font-semibold hover:underline">kütüphaneden seç</button>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {cat.items.map(item => (
                        <div key={item._key} className="px-5 py-3.5 space-y-2.5">
                          {/* Name row */}
                          <div className="flex items-center gap-2">
                            <input
                              type="text" placeholder={`${cat.label} adı...`} value={item.name}
                              onChange={e => updateItem(item._key, 'name', e.target.value)}
                              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003781]/10"
                            />
                            <button onClick={() => removeItem(item._key)}
                              className="p-2 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors shrink-0">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </div>
                          {/* Price row */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                              <p className="text-[10px] text-amber-600 font-semibold mb-1">Alış (Gizli)</p>
                              <input
                                type="number" placeholder="0" value={item.costPrice || ''}
                                onChange={e => updateItem(item._key, 'costPrice', Number(e.target.value))}
                                className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-[13px] text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-200"
                              />
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 font-semibold mb-1">Satış (USD)</p>
                              <input
                                type="number" placeholder="0" value={item.salePrice || ''}
                                onChange={e => updateItem(item._key, 'salePrice', Number(e.target.value))}
                                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-[13px] text-[#203D76] font-semibold focus:outline-none focus:ring-2 focus:ring-[#003781]/10"
                              />
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 font-semibold mb-1">Miktar</p>
                              <div className="flex gap-1">
                                <input type="number" placeholder="1" value={item.quantity || ''} min={1}
                                  onChange={e => updateItem(item._key, 'quantity', Number(e.target.value))}
                                  className="w-14 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-900 focus:outline-none"
                                />
                                <input type="text" placeholder="kişi" value={item.unit}
                                  onChange={e => updateItem(item._key, 'unit', e.target.value)}
                                  className="flex-1 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-600 placeholder:text-gray-300 focus:outline-none"
                                />
                              </div>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 font-semibold mb-1">Döviz</p>
                              <select value={item.currency} onChange={e => updateItem(item._key, 'currency', e.target.value)}
                                className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none">
                                {['USD', 'EUR', 'TRY', 'SAR'].map(c => <option key={c}>{c}</option>)}
                              </select>
                            </div>
                          </div>
                          {/* Line total */}
                          {item.costPrice > 0 && (
                            <p className="text-[11px] text-[#203D76] font-semibold">
                              Toplam: {(item.salePrice * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {item.currency}
                              <span className="text-gray-400 font-normal ml-2">· Kar: {(item.salePrice - item.costPrice).toFixed(2)} {item.currency}/birim</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Library button */}
              <button onClick={() => setLibOpen(true)}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-[13px] text-gray-400 hover:border-[#003781]/30 hover:text-[#003781] transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">library_add</span>
                Hizmet Kütüphanesinden Ekle
              </button>
            </div>

            {/* ── Right: sidebar ── */}
            <div className="space-y-4 xl:sticky xl:top-24">

              {/* Margin */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h2 className="text-[12px] font-bold text-gray-700 mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                  Kar Marjı (PDF'e yansımaz)
                </h2>
                <div className="flex items-center gap-2 mb-2">
                  <input type="range" min={0} max={100} value={margin}
                    onChange={e => handleMarginChange(Number(e.target.value))}
                    className="flex-1 accent-[#003781]" />
                  <div className="flex items-center gap-0.5">
                    <input type="number" value={margin} min={0} max={100}
                      onChange={e => handleMarginChange(Number(e.target.value))}
                      className="w-12 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-center font-bold text-[#003781] focus:outline-none" />
                    <span className="text-[11px] text-gray-400">%</span>
                  </div>
                </div>
                <p className="text-[10px] text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-lg">Maliyet değişince satış fiyatı otomatik güncellenir.</p>
              </div>

              {/* Summary */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h2 className="text-[12px] font-bold text-gray-700 mb-3">Özet</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-[12px]">
                    <span className="text-gray-500">Maliyet Toplamı</span>
                    <span className="font-semibold text-amber-700">{totalCost.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} USD</span>
                  </div>
                  <div className="flex justify-between text-[12px]">
                    <span className="text-gray-500">Kar</span>
                    <span className="font-semibold text-emerald-600">+{profit.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} USD</span>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div className="flex justify-between">
                    <span className="text-[13px] font-bold text-gray-800">Satış Toplamı</span>
                    <span className="text-[16px] font-black text-[#203D76]">{grandTotal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} USD</span>
                  </div>
                  {usdRate > 0 && grandTotal > 0 && (
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>TL karşılığı</span>
                      <span>{(grandTotal * usdRate).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} TL</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick add */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h2 className="text-[12px] font-bold text-gray-700 mb-2.5">Hızlı Kalem Ekle</h2>
                <select value={addingCategory} onChange={e => setAddingCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] text-gray-700 focus:outline-none mb-2">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <button onClick={() => addItem(addingCategory)}
                  className="w-full py-2 bg-[#003781]/5 hover:bg-[#003781]/10 text-[#003781] text-[13px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">add</span>Boş Kalem Ekle
                </button>
              </div>

              {/* PDF download shortcut */}
              <button onClick={downloadPdf} disabled={downloading || items.length === 0 || !html2pdfReady}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-[13px] font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">{downloading ? 'progress_activity' : 'picture_as_pdf'}</span>
                {downloading ? 'PDF oluşturuluyor...' : 'PDF İndir (.pdf)'}
              </button>
            </div>
          </div>
        ) : (
          /* ── PREVIEW TAB ── */
          <div className="bg-gray-200 rounded-2xl p-6">
            <div className="text-[12px] text-gray-500 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                Müşteri görünümü — PDF'te bu 3 sayfa çıkacak (kar payı gözükmez)
              </span>
              <button onClick={downloadPdf} disabled={downloading || items.length === 0 || !html2pdfReady}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all">
                <span className="material-symbols-outlined text-[15px]">{downloading ? 'progress_activity' : 'download'}</span>
                PDF İndir
              </button>
            </div>
            <div className="space-y-5">
              {[1, 2, 3].map(pageNum => (
                <div key={pageNum} className="relative">
                  <div className="text-[10px] text-gray-400 mb-1 text-center">Sayfa {pageNum}</div>
                  <div
                    style={{ transform: 'scale(0.72)', transformOrigin: 'top center', width: '794px', marginBottom: '-215px' }}
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                    className="pointer-events-none"
                    ref={el => {
                      if (el) {
                        // Show only the relevant page
                        const pages = el.querySelectorAll('[id^="page-"]');
                        pages.forEach((p, i) => {
                          (p as HTMLElement).style.display = i === pageNum - 1 ? 'block' : 'none';
                        });
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Service Library Modal ── */}
      {libOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={() => setLibOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-gray-900">Hizmet Kütüphanesi</h3>
              <button onClick={() => setLibOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="px-4 py-3 border-b border-gray-50">
              <input type="text" placeholder="Hizmet ara..." value={libSearch}
                onChange={e => setLibSearch(e.target.value)} autoFocus
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#003781]/15" />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredLib.length === 0 ? (
                <div className="px-5 py-8 text-center text-[13px] text-gray-400">
                  {serviceLib.length === 0 ? 'Kütüphane boş.' : 'Sonuç bulunamadı.'}
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredLib.map(svc => {
                    const cat = CATEGORIES.find(c => c.value === svc.category);
                    return (
                      <button key={svc.id} onClick={() => addFromLib(svc)}
                        className="w-full px-5 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3">
                        <span className="material-symbols-outlined text-[18px] text-[#003781] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {cat?.icon ?? 'add_circle'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-gray-900">{svc.name}</p>
                          <p className="text-[11px] text-[#003781] font-semibold">
                            {svc.defaultCost > 0 ? `${svc.defaultCost} ${svc.currency}` : 'Fiyat girilmemiş'}
                            {svc.unit && ` / ${svc.unit}`}
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">{cat?.label ?? svc.category}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
