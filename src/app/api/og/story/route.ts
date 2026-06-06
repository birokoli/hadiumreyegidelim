// /api/og/story?campaign={slug}&ref={code}
// Şablon 1 (campaign.imageUrl varsa): Foto — kırmızı banner, tırtıklı rozetler, yeşil WA CTA
// Şablon 2 (imageUrl yoksa):          Koyu lacivert — büyük beyaz başlık, özellikler, indirim kartı
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import React from 'react';

export const runtime = 'nodejs';

// ─── Stream buffer: async Satori hatalarını try/catch'e düşürür ──────────────
async function toBufferedResponse(ir: Response): Promise<Response> {
  const reader = ir.body!.getReader();
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const len = chunks.reduce((s, c) => s + c.length, 0);
  const buf = new Uint8Array(len);
  let off = 0;
  for (const c of chunks) { buf.set(c, off); off += c.length; }
  return new Response(buf, { status: 200, headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' } });
}

// ─── Font yükleyici (WOFF — Satori woff2 desteklemiyor) ──────────────────────
type W = 400 | 600 | 700 | 800 | 900;
const fontCache = new Map<string, ArrayBuffer>();

async function loadFont(family: string, weight: W): Promise<ArrayBuffer | null> {
  const key = `${family}:${weight}`;
  if (fontCache.has(key)) return fontCache.get(key)!;
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`,
      { headers: { 'User-Agent': 'Mozilla/4.0 (compatible; MSIE 8.0)' } }
    ).then(r => r.text());
    const m = css.match(/url\(([^)]+\.woff)\s*\)/);
    if (m) {
      const r = await fetch(m[1]);
      if (r.ok) { const d = await r.arrayBuffer(); fontCache.set(key, d); return d; }
    }
  } catch { /* fallback */ }
  const bunny: Partial<Record<string, string>> = {
    'Inter:400':        'https://fonts.bunny.net/inter/files/inter-latin-400-normal.woff',
    'Inter:700':        'https://fonts.bunny.net/inter/files/inter-latin-700-normal.woff',
    'Inter:900':        'https://fonts.bunny.net/inter/files/inter-latin-900-normal.woff',
    'Montserrat:600':   'https://fonts.bunny.net/montserrat/files/montserrat-latin-600-normal.woff',
    'Montserrat:700':   'https://fonts.bunny.net/montserrat/files/montserrat-latin-700-normal.woff',
    'Montserrat:800':   'https://fonts.bunny.net/montserrat/files/montserrat-latin-800-normal.woff',
    'Montserrat:900':   'https://fonts.bunny.net/montserrat/files/montserrat-latin-900-normal.woff',
  };
  if (bunny[key]) {
    try {
      const r = await fetch(bunny[key]!);
      if (r.ok) { const d = await r.arrayBuffer(); fontCache.set(key, d); return d; }
    } catch { /* null */ }
  }
  return null;
}

// ─── Tırtıklı rozet SVG → data URI ───────────────────────────────────────────
function scallopUri(w: number, h: number, fill: string): string {
  const bump = Math.min(w, h) * 0.09;
  const rr = bump;
  const iw = w - 2 * rr, ih = h - 2 * rr;
  const nT = Math.max(1, Math.round(iw / (bump * 2)));
  const nS = Math.max(1, Math.round(ih / (bump * 2)));
  const parts: string[] = [`<rect x="${rr}" y="${rr}" width="${iw}" height="${ih}" rx="${rr}" fill="${fill}"/>`];
  const c = (cx: number, cy: number) => parts.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rr}" fill="${fill}"/>`);
  for (let i = 0; i <= nT; i++) { const cx = rr + (iw * i) / nT; c(cx, rr); c(cx, h - rr); }
  for (let i = 0; i <= nS; i++) { const cy = rr + (ih * i) / nS; c(rr, cy); c(w - rr, cy); }
  return 'data:image/svg+xml;base64,' + Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${parts.join('')}</svg>`
  ).toString('base64');
}

const NAVY  = '#203C76';
const RED   = '#FF0000';
const GREEN = '#30BF39';
const GOLD  = '#c9a96e';
const DARK  = '#162040'; // Koyu lacivert arka plan (şablon 2)

const umreSvg  = scallopUri(600, 250, NAVY);
const priceSvg = scallopUri(380, 280, NAVY);
const waIconSvg = 'data:image/svg+xml;base64,' + Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#fff" d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.1 1.6 5.9L4 29l8.3-1.6c1.7.9 3.6 1.4 5.7 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-4.9 1 1-4.8-.2-.4c-1-1.6-1.5-3.4-1.5-5.3C5 9.5 9.9 5 16 5s11 4.5 11 9.8-4.9 10-11 10zm6.1-7.4c-.3-.2-1.9-1-2.2-1.1-.3-.1-.5-.2-.8.2-.2.3-.9 1.1-1.1 1.3-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.7-1.6-1-.9-1.6-2-1.8-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.4-.6.1-.2 0-.4 0-.6 0-.2-.8-1.9-1-2.5-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.5 3.8 6 5.3.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.2-.6-.4z"/></svg>'
).toString('base64');

const e = React.createElement;

// ─────────────────────────────────────────────────────────────────────────────
// ŞABLON 1: Fotoğraflı (kırmızı banner, tırtıklı rozet, yeşil CTA)
// ─────────────────────────────────────────────────────────────────────────────
function buildPhotoTemplate(
  photoUrl: string,
  bannerText: string,
  priceLabel: string,
  durTop: string,
  durMain: string,
  price: string,
  handle: string,
) {
  return e('div', { style: { position: 'relative', width: 1080, height: 1920, display: 'flex', flexDirection: 'column', backgroundColor: '#0a0a0a', fontFamily: 'Montserrat' } },

    // Arka plan fotoğrafı
    e('div', { style: { position: 'absolute', top: 0, left: 0, width: 1080, height: 1920, backgroundImage: `url(${photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex' } }),

    // Vignette
    e('div', { style: { position: 'absolute', top: 0, left: 0, width: 1080, height: 1920, backgroundImage: 'linear-gradient(180deg,rgba(0,0,0,0.18) 0%,transparent 22%,transparent 78%,rgba(0,0,0,0.12) 100%)', display: 'flex' } }),

    // Kırmızı kontenjan bandı
    e('div', { style: { position: 'absolute', top: 150, left: 40, width: 1000, height: 118, backgroundColor: RED, borderRadius: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      e('div', { style: { color: '#ffffff', fontSize: 46, fontWeight: 800 } }, bannerText),
    ),

    // Navy pill (1 KİŞİLİK ÜCRET)
    e('div', { style: { position: 'absolute', top: 1070, left: 70, backgroundColor: NAVY, borderRadius: 24, paddingTop: 24, paddingBottom: 24, paddingLeft: 40, paddingRight: 40, display: 'flex' } },
      e('div', { style: { color: '#ffffff', fontSize: 42, fontWeight: 800 } }, priceLabel),
    ),

    // Sol tırtıklı rozet (süre: "9 GÜNLÜK\nUMRE")
    e('img', { src: umreSvg, width: 600, height: 250, style: { position: 'absolute', top: 1175, left: 70 } }),
    e('div', { style: { position: 'absolute', top: 1175, left: 104, width: 540, height: 250, display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
      durTop ? e('div', { style: { color: '#ffffff', fontSize: 60, fontWeight: 600, lineHeight: 1 } }, durTop) : null,
      e('div', { style: { color: '#ffffff', fontSize: 104, fontWeight: 700, lineHeight: 1 } }, durMain),
    ),

    // Sağ tırtıklı rozet (fiyat: "$360")
    e('img', { src: priceSvg, width: 380, height: 280, style: { position: 'absolute', top: 1162, left: 560 } }),
    e('div', { style: { position: 'absolute', top: 1162, left: 560, width: 380, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      e('div', { style: { color: '#ffffff', fontSize: price.length > 5 ? 80 : 128, fontWeight: 900, lineHeight: 1, textAlign: 'center' } }, price),
    ),

    // Yeşil WhatsApp CTA
    e('div', { style: { position: 'absolute', top: 1470, left: 70, width: 940, height: 152, backgroundColor: GREEN, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      e('img', { src: waIconSvg, width: 78, height: 78, style: { marginRight: 26 } }),
      e('div', { style: { color: '#ffffff', fontSize: 66, fontWeight: 900 } }, 'HEMEN YAZ'),
    ),

    // Logo
    e('div', { style: { position: 'absolute', top: 1700, left: 0, width: 1080, display: 'flex', flexDirection: 'column', alignItems: 'center', color: NAVY } },
      e('div', { style: { display: 'flex', flexDirection: 'row', alignItems: 'flex-end' } },
        e('span', { style: { fontSize: 90, fontWeight: 600 } }, 'hadi'),
        e('span', { style: { fontSize: 90, fontWeight: 800, marginLeft: 16 } }, 'umreye'),
      ),
      e('div', { style: { fontSize: 44, fontWeight: 600, color: NAVY, marginTop: 4 } }, 'gidelim.com'),
      handle ? e('div', { style: { fontSize: 28, color: 'rgba(255,255,255,0.6)', marginTop: 14 } }, handle + ' \u00f6nerisiyle') : null,
    ),
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ŞABLON 2: Koyu lacivert metin (bireysel / genel)
// ─────────────────────────────────────────────────────────────────────────────
function buildDarkTemplate(
  eyebrow: string,
  title: string,
  sub: string,
  feats: string[],
  discountLabel: string,
  code: string,
  handle: string,
) {
  // Özellik satırı
  const featRow = (text: string, i: number) =>
    e('div', { key: String(i), style: { display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 32 } },
      e('div', { style: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 28 } },
        e('div', { style: { fontSize: 28, color: GOLD, fontWeight: 700 } }, '\u2713'),
      ),
      e('div', { style: { fontSize: 36, color: 'rgba(255,255,255,0.88)', fontWeight: 500, display: 'flex' } }, text),
    );

  return e('div', { style: { position: 'relative', width: 1080, height: 1920, backgroundColor: DARK, display: 'flex', flexDirection: 'column', fontFamily: 'Montserrat' } },

    // İçerik
    e('div', { style: { display: 'flex', flexDirection: 'column', paddingLeft: 80, paddingRight: 80, paddingTop: 90 } },

      // Site adı (üst sol)
      e('div', { style: { fontSize: 26, fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: 80, display: 'flex' } },
        'hadiumreyegidelim.com'
      ),

      // Eyebrow — mektup aralıklı, altın rengi
      e('div', { style: { fontSize: 24, fontWeight: 700, color: GOLD, letterSpacing: 5, marginBottom: 36, display: 'flex' } },
        eyebrow.toUpperCase()
      ),

      // Ana başlık — büyük, beyaz, bold
      e('div', { style: { fontSize: title.length > 30 ? 72 : 88, fontWeight: 900, color: '#ffffff', lineHeight: 1.05, marginBottom: 44, display: 'flex', flexWrap: 'wrap' } },
        title
      ),

      // Alt metin
      sub ? e('div', { style: { fontSize: 34, color: 'rgba(255,255,255,0.50)', lineHeight: 1.45, marginBottom: 56, display: 'flex', flexWrap: 'wrap' } }, sub) : null,

      // Özellik listesi
      feats.length > 0
        ? e('div', { style: { display: 'flex', flexDirection: 'column', marginBottom: 56 } },
            ...feats.map((feat, i) => featRow(feat, i)),
          )
        : e('div', { style: { marginBottom: 56, display: 'flex' } }),

      // İndirim kartı
      e('div', { style: { display: 'flex', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 28, paddingTop: 44, paddingBottom: 44, paddingLeft: 52, paddingRight: 44, marginBottom: 52 } },
        // Sol: indirim miktarı
        e('div', { style: { display: 'flex', flexDirection: 'column', flexGrow: 1 } },
          e('div', { style: { fontSize: 22, color: 'rgba(255,255,255,0.40)', fontWeight: 700, marginBottom: 10, display: 'flex' } }, 'Sana \u00f6zel indirim'),
          e('div', { style: { fontSize: 80, fontWeight: 900, color: '#ffffff', lineHeight: 1, display: 'flex' } }, discountLabel),
        ),
        // Sağ: kod butonu
        e('div', { style: { backgroundColor: GOLD, borderRadius: 20, paddingTop: 32, paddingBottom: 32, paddingLeft: 44, paddingRight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
          e('div', { style: { fontSize: code.length > 8 ? 40 : 50, fontWeight: 900, color: DARK, lineHeight: 1, display: 'flex' } }, code),
        ),
      ),

      // CTA
      e('div', { style: { display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 60 } },
        e('div', { style: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 24, flexShrink: 0 } },
          e('div', { style: { fontSize: 30, color: '#ffffff', fontWeight: 700 } }, '\u2192'),
        ),
        e('div', { style: { fontSize: 36, fontWeight: 700, color: '#ffffff', display: 'flex' } }, 'Rezervasyon i\u00e7in DM at'),
      ),

      // Alt bilgi
      e('div', { style: { display: 'flex', flexDirection: 'column' } },
        e('div', { style: { fontSize: 30, color: GOLD, fontWeight: 700, display: 'flex' } }, 'hadiumreyegidelim.com'),
        handle ? e('div', { style: { fontSize: 26, color: 'rgba(255,255,255,0.35)', fontWeight: 400, marginTop: 10, display: 'flex' } }, handle + ' \u00f6nerisiyle') : null,
      ),
    ),
  );
}

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignSlug = searchParams.get('campaign') ?? '';
    const refCode      = searchParams.get('ref') ?? '';

    const [campaign, participant] = await Promise.all([
      prisma.campaign.findUnique({ where: { slug: campaignSlug } }),
      refCode ? prisma.campaignParticipant.findUnique({
        where: { uniqueCode: refCode },
        include: { influencer: { select: { instagramHandle: true } } },
      }) : Promise.resolve(null),
    ]);

    if (!campaign) return new Response('Kampanya bulunamadi', { status: 404 });

    const discountLabel = campaign.discountType === 'percent'
      ? `%${campaign.discountValue}`
      : `${campaign.discountValue}TL`;
    const code   = refCode || 'KODUNUZ';
    const handle = participant?.influencer?.instagramHandle
      ? `@${participant.influencer.instagramHandle}`
      : '';

    // ── Şablon 1: Fotoğraflı ─────────────────────────────────────────────────
    if (campaign.imageUrl) {
      const bannerText = (campaign.storyEyebrow ?? 'SINIRLI KONTENJAN').toUpperCase();
      const priceLabel = (campaign.storySub ?? '1 KİŞİLİK ÜCRET').toUpperCase();
      const words   = (campaign.storyTitle ?? campaign.title).trim().split(/\s+/);
      const durTop  = words.length > 1 ? words.slice(0, -1).join(' ') : '';
      const durMain = words[words.length - 1];
      const price   = discountLabel;

      const [m600, m700, m800, m900] = await Promise.all([
        loadFont('Montserrat', 600), loadFont('Montserrat', 700),
        loadFont('Montserrat', 800), loadFont('Montserrat', 900),
      ]);
      const fonts = [
        ...(m600 ? [{ name: 'Montserrat', data: m600, weight: 600 as const, style: 'normal' as const }] : []),
        ...(m700 ? [{ name: 'Montserrat', data: m700, weight: 700 as const, style: 'normal' as const }] : []),
        ...(m800 ? [{ name: 'Montserrat', data: m800, weight: 800 as const, style: 'normal' as const }] : []),
        ...(m900 ? [{ name: 'Montserrat', data: m900, weight: 900 as const, style: 'normal' as const }] : []),
      ];
      if (fonts.length === 0) return new Response(JSON.stringify({ error: 'Font yuklenemedi' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

      return await toBufferedResponse(new ImageResponse(
        buildPhotoTemplate(campaign.imageUrl, bannerText, priceLabel, durTop, durMain, price, handle),
        { width: 1080, height: 1920, fonts },
      ));
    }

    // ── Şablon 2: Koyu lacivert metin ────────────────────────────────────────
    const eyebrow = campaign.storyEyebrow ?? campaign.type;
    const title   = campaign.storyTitle   ?? campaign.title;
    const sub     = campaign.storySub     ?? campaign.description ?? '';
    const feats: string[] = (() => {
      try { return campaign.storyFeats ? JSON.parse(campaign.storyFeats) : []; }
      catch { return []; }
    })();

    const [m600, m700, m800, m900] = await Promise.all([
      loadFont('Montserrat', 600), loadFont('Montserrat', 700),
      loadFont('Montserrat', 800), loadFont('Montserrat', 900),
    ]);
    const fonts = [
      ...(m600 ? [{ name: 'Montserrat', data: m600, weight: 600 as const, style: 'normal' as const }] : []),
      ...(m700 ? [{ name: 'Montserrat', data: m700, weight: 700 as const, style: 'normal' as const }] : []),
      ...(m800 ? [{ name: 'Montserrat', data: m800, weight: 800 as const, style: 'normal' as const }] : []),
      ...(m900 ? [{ name: 'Montserrat', data: m900, weight: 900 as const, style: 'normal' as const }] : []),
    ];
    if (fonts.length === 0) return new Response(JSON.stringify({ error: 'Font yuklenemedi' }), { status: 500, headers: { 'Content-Type': 'application/json' } });

    return await toBufferedResponse(new ImageResponse(
      buildDarkTemplate(eyebrow, title, sub, feats, discountLabel, code, handle),
      { width: 1080, height: 1920, fonts },
    ));

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[story]', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
