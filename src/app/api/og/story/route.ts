// /api/og/story?campaign={slug}&ref={code}
// İki şablon:
//   • campaign.imageUrl varsa → FOTOĞRAFLI ŞABLon (kit tasarımı: kırmızı banner, tırtıklı rozetler, yeşil WA CTA)
//   • yoksa               → BEYAZ METİN ŞABLonu (temiz/minimal)
// NOT: Satori .woff ve .ttf destekler, .woff2 desteklemez → eski UA ile WOFF çekiliyor.

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import React from 'react';

export const runtime = 'nodejs';

// ─── Stream buffer yardımcısı ─────────────────────────────────────────────────
// ImageResponse body'si bir ReadableStream. Satori async hatalarını try/catch
// yakalayabilmek için stream'i tamamen okuyup düz Response olarak döndürüyoruz.
async function toBufferedResponse(imgRes: Response): Promise<Response> {
  const reader = imgRes.body!.getReader();
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const totalLen = chunks.reduce((s, c) => s + c.length, 0);
  const buf = new Uint8Array(totalLen);
  let off = 0;
  for (const c of chunks) { buf.set(c, off); off += c.length; }
  return new Response(buf, {
    status: 200,
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' },
  });
}

// ─── Font yükleyici ───────────────────────────────────────────────────────────
type W = 400 | 600 | 700 | 800 | 900;
const fontCache = new Map<string, ArrayBuffer>();

async function loadFont(family: string, weight: W): Promise<ArrayBuffer | null> {
  const key = `${family}:${weight}`;
  if (fontCache.has(key)) return fontCache.get(key)!;

  // Eski UA → Google Fonts CSS'ten WOFF URL'si (Satori .woff destekler)
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
  try {
    const cssRes = await fetch(cssUrl, {
      headers: { 'User-Agent': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)' },
    });
    if (cssRes.ok) {
      const css = await cssRes.text();
      const m = css.match(/url\(([^)]+\.woff)\s*\)/);
      if (m) {
        const r = await fetch(m[1]);
        if (r.ok) {
          const buf = await r.arrayBuffer();
          fontCache.set(key, buf);
          return buf;
        }
      }
    }
  } catch { /* fallback */ }

  // Yedek: Bunny Fonts WOFF (doğrulanmış)
  const bunny: Partial<Record<string, string>> = {
    'Inter:400': 'https://fonts.bunny.net/inter/files/inter-latin-400-normal.woff',
    'Inter:700': 'https://fonts.bunny.net/inter/files/inter-latin-700-normal.woff',
    'Inter:900': 'https://fonts.bunny.net/inter/files/inter-latin-900-normal.woff',
    'Montserrat:700': 'https://fonts.bunny.net/montserrat/files/montserrat-latin-700-normal.woff',
    'Montserrat:800': 'https://fonts.bunny.net/montserrat/files/montserrat-latin-800-normal.woff',
    'Montserrat:900': 'https://fonts.bunny.net/montserrat/files/montserrat-latin-900-normal.woff',
  };
  if (bunny[key]) {
    try {
      const r = await fetch(bunny[key]!);
      if (r.ok) {
        const buf = await r.arrayBuffer();
        fontCache.set(key, buf);
        return buf;
      }
    } catch { /* null */ }
  }
  return null;
}

// ─── Tırtıklı rozet SVG (kit'ten: scallop.ts) ────────────────────────────────
function scallopSvg(w: number, h: number, fill = '#203C76', bump = 46): string {
  const rr = bump / 2;
  const parts: string[] = [
    `<rect x="${rr}" y="${rr}" width="${w - 2 * rr}" height="${h - 2 * rr}" rx="${rr}" fill="${fill}"/>`,
  ];
  const iw = w - 2 * rr;
  const ih = h - 2 * rr;
  const nT = Math.max(1, Math.round(iw / bump));
  const nS = Math.max(1, Math.round(ih / bump));
  const c = (cx: number, cy: number) =>
    parts.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${rr}" fill="${fill}"/>`);
  for (let i = 0; i <= nT; i++) {
    const cx = rr + (iw * i) / nT;
    c(cx, rr); c(cx, h - rr);
  }
  for (let i = 0; i <= nS; i++) {
    const cy = rr + (ih * i) / nS;
    c(rr, cy); c(w - rr, cy);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${parts.join('')}</svg>`;
}

function svgUri(svg: string): string {
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

// ─── Statik SVG'ler ───────────────────────────────────────────────────────────
const NAVY  = '#203C76';
const RED   = '#FF0000';
const GREEN = '#30BF39';
const GOLD  = '#c9a96e';

const umreShape  = svgUri(scallopSvg(600, 250, NAVY));
const priceShape = svgUri(scallopSvg(380, 280, NAVY));

const waIcon = 'data:image/svg+xml;base64,' + Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#fff" d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.1 1.6 5.9L4 29l8.3-1.6c1.7.9 3.6 1.4 5.7 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-4.9 1 1-4.8-.2-.4c-1-1.6-1.5-3.4-1.5-5.3C5 9.5 9.9 5 16 5s11 4.5 11 9.8-4.9 10-11 10zm6.1-7.4c-.3-.2-1.9-1-2.2-1.1-.3-.1-.5-.2-.8.2-.2.3-.9 1.1-1.1 1.3-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.7-1.6-1-.9-1.6-2-1.8-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.3.4-.6.1-.2 0-.4 0-.6 0-.2-.8-1.9-1-2.5-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.5 3.8 6 5.3.8.4 1.5.6 2 .7.8.3 1.6.2 2.2.1.7-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.2-.6-.4z"/></svg>`
).toString('base64');

const e = React.createElement;

// ─── Fotoğraflı şablon (kit tasarımı) ────────────────────────────────────────
function buildPhotoTemplate(
  photoUrl: string,
  bannerText: string,
  priceLabel: string,
  durTop: string,
  durMain: string,
  price: string,
  code: string,
  handle: string,
) {
  return e('div', {
    style: { position: 'relative', width: 1080, height: 1920, display: 'flex', backgroundColor: '#0a0a0a', fontFamily: 'Montserrat' },
  },

    // Arka plan fotoğraf
    e('img', { src: photoUrl, width: 1080, height: 1920, style: { position: 'absolute', top: 0, left: 0, objectFit: 'cover' } }),

    // Kırmızı kontenjan bandı
    e('div', {
      style: { position: 'absolute', top: 150, left: 40, width: 1000, height: 118, backgroundColor: RED, borderRadius: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    },
      e('div', { style: { color: '#fff', fontSize: 46, fontWeight: 800 } }, bannerText),
    ),

    // "1 KİŞİLİK ÜCRET" pill
    e('div', {
      style: { position: 'absolute', top: 1070, left: 70, backgroundColor: NAVY, borderRadius: 24, paddingLeft: 40, paddingRight: 40, paddingTop: 24, paddingBottom: 24, display: 'flex' },
    },
      e('div', { style: { color: '#fff', fontSize: 42, fontWeight: 800 } }, priceLabel),
    ),

    // Sol tırtıklı rozet (süre)
    e('img', { src: umreShape, width: 600, height: 250, style: { position: 'absolute', top: 1175, left: 70 } }),
    e('div', {
      style: { position: 'absolute', top: 1175, left: 104, width: 540, height: 250, display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#fff' },
    },
      durTop  ? e('div', { style: { fontSize: 60, fontWeight: 600, lineHeight: 1 } }, durTop)  : null,
      e('div', { style: { fontSize: 104, fontWeight: 700, lineHeight: 1 } }, durMain),
    ),

    // Sağ tırtıklı rozet (fiyat / indirim)
    e('img', { src: priceShape, width: 380, height: 280, style: { position: 'absolute', top: 1162, left: 560 } }),
    e('div', {
      style: { position: 'absolute', top: 1162, left: 560, width: 380, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    },
      e('div', { style: { color: '#fff', fontSize: price.length > 5 ? 80 : 100, fontWeight: 800, textAlign: 'center' } }, price),
    ),

    // Yeşil WhatsApp CTA
    e('div', {
      style: { position: 'absolute', top: 1470, left: 70, width: 940, height: 152, backgroundColor: GREEN, borderRadius: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    },
      e('img', { src: waIcon, width: 78, height: 78, style: { marginRight: 26 } }),
      e('div', { style: { color: '#fff', fontSize: 66, fontWeight: 800 } }, 'HEMEN YAZ'),
    ),

    // Logo + handle
    e('div', {
      style: { position: 'absolute', top: 1670, left: 0, width: 1080, display: 'flex', flexDirection: 'column', alignItems: 'center' },
    },
      e('div', { style: { display: 'flex', fontSize: 72, fontWeight: 700, alignItems: 'flex-end', color: '#ffffff' } },
        e('span', null, 'hadi'),
        e('span', { style: { fontWeight: 800, marginLeft: 12 } }, 'umreye'),
      ),
      e('div', { style: { fontSize: 40, fontWeight: 600, letterSpacing: 4, marginTop: 4, color: '#ffffff' } }, 'gidelim.com'),
      handle ? e('div', { style: { fontSize: 30, color: 'rgba(255,255,255,0.7)', marginTop: 12 } }, handle + ' önerisiyle') : null,
    ),

    // Instagram güvenli alan: 200px boş
    e('div', { style: { position: 'absolute', bottom: 0, left: 0, width: 1080, height: 200, background: 'transparent', display: 'flex' } }),
  );
}

// ─── Beyaz metin şablonu (mevcut) ─────────────────────────────────────────────
function buildWhiteTemplate(
  eyebrow: string,
  title: string,
  sub: string,
  feats: string[],
  discountLabel: string,
  code: string,
  handle: string,
  trackingUrl: string,
) {
  const WNAVY  = '#003781';
  const WGOLD  = '#c9a96e';
  const WGRAY  = '#6b7280';
  const WLIGHT = '#f4f6f9';

  return e('div', {
    style: { width: 1080, height: 1920, background: '#ffffff', display: 'flex', flexDirection: 'column', fontFamily: 'Inter' },
  },
    // Üst lacivert çizgi
    e('div', { style: { height: 8, background: WNAVY, display: 'flex' } }),

    // İçerik
    e('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', paddingLeft: 80, paddingRight: 80, paddingTop: 72 } },
      e('div', { style: { fontSize: 22, fontWeight: 600, color: WNAVY, letterSpacing: '0.06em', marginBottom: 52 } }, 'hadiumreyegidelim.com'),
      // Eyebrow pill
      e('div', { style: { display: 'flex', marginBottom: 36 } },
        e('div', { style: { background: WNAVY, color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: '0.14em', paddingLeft: 24, paddingRight: 24, paddingTop: 12, paddingBottom: 12, borderRadius: 100 } }, eyebrow),
      ),
      // Başlık
      e('div', { style: { fontSize: title.length > 28 ? 72 : 84, fontWeight: 900, color: WNAVY, lineHeight: 1.05, marginBottom: 36 } }, title),
      // Alt başlık
      sub ? e('div', { style: { fontSize: 32, color: WGRAY, lineHeight: 1.5, marginBottom: 56 } }, sub) : null,
      // Özellikler
      feats.length > 0 ? e('div', { style: { display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 56 } },
        ...feats.map(feat =>
          e('div', { style: { display: 'flex', alignItems: 'center', gap: 20 } },
            e('div', { style: { width: 44, height: 44, borderRadius: 100, background: WLIGHT, border: `2px solid ${WNAVY}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
              e('div', { style: { fontSize: 22, color: WNAVY, fontWeight: 900, lineHeight: 1 } }, '\u2713'),
            ),
            e('div', { style: { fontSize: 30, color: '#1f2937', fontWeight: 500 } }, feat),
          )
        ),
      ) : null,
      e('div', { style: { flex: 1 } }),
      // İndirim + Kod kartı
      e('div', { style: { background: WLIGHT, borderRadius: 28, marginBottom: 48, border: '2px solid #e2e8f0', display: 'flex', overflow: 'hidden' } },
        e('div', { style: { flex: 1, paddingLeft: 48, paddingRight: 32, paddingTop: 44, paddingBottom: 44, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '2px solid #e2e8f0' } },
          e('div', { style: { fontSize: 16, color: WGRAY, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 8 } }, 'SANA OZEL INDIRIM'),
          e('div', { style: { fontSize: 64, fontWeight: 900, color: WNAVY, lineHeight: 1 } }, discountLabel),
        ),
        e('div', { style: { background: WNAVY, paddingLeft: 40, paddingRight: 40, paddingTop: 44, paddingBottom: 44, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8 } },
          e('div', { style: { fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: '0.14em' } }, 'KODUN'),
          e('div', { style: { fontSize: 40, fontWeight: 900, color: WGOLD, letterSpacing: '0.12em', whiteSpace: 'nowrap' } }, code),
        ),
      ),
      // CTA
      e('div', { style: { display: 'flex', alignItems: 'center', gap: 18, marginBottom: 44 } },
        e('div', { style: { width: 56, height: 56, borderRadius: 100, border: `2.5px solid ${WNAVY}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
          e('div', { style: { fontSize: 28, color: WNAVY, fontWeight: 900, lineHeight: 1 } }, '\u2192'),
        ),
        e('div', { style: { fontSize: 30, fontWeight: 700, color: WNAVY, lineHeight: 1.3 } }, 'Rezervasyon\u00a0i\u00e7in DM at'),
      ),
      // Alt bilgi
      e('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
        e('div', { style: { fontSize: 24, color: WNAVY, fontWeight: 600 } }, trackingUrl),
        handle ? e('div', { style: { fontSize: 20, color: '#9ca3af', fontWeight: 400 } }, handle + ' \u00f6nerisiyle') : null,
      ),
    ),

    // Alt altın çizgi + 200px Instagram boşluğu
    e('div', { style: { display: 'flex', flexDirection: 'column' } },
      e('div', { style: { height: 6, background: WGOLD, display: 'flex' } }),
      e('div', { style: { height: 200, background: '#ffffff', display: 'flex' } }),
    ),
  );
}

// ─── GET handler ──────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignSlug = searchParams.get('campaign') ?? '';
    const refCode      = searchParams.get('ref') ?? '';

    const [campaign, participant] = await Promise.all([
      prisma.campaign.findUnique({ where: { slug: campaignSlug } }),
      refCode
        ? prisma.campaignParticipant.findUnique({
            where: { uniqueCode: refCode },
            include: { influencer: { select: { instagramHandle: true } } },
          })
        : Promise.resolve(null),
    ]);

    if (!campaign) return new Response('Kampanya bulunamadi', { status: 404 });

    const discountLabel = campaign.discountType === 'percent'
      ? `%${campaign.discountValue}`
      : `${campaign.discountValue}TL`;
    const code   = refCode || 'KODUNUZ';
    const handle = participant?.influencer?.instagramHandle
      ? `@${participant.influencer.instagramHandle}` : '';

    // ── Fotoğraflı şablon ────────────────────────────────────────────────────
    if (campaign.imageUrl) {
      const bannerText = campaign.storyEyebrow ?? 'SINIRLI KONTENJAN';
      const priceLabel = campaign.storySub ?? '1 KİŞİLİK ÜCRET';
      const titleWords = (campaign.storyTitle ?? campaign.title).trim().split(/\s+/);
      const durTop  = titleWords.length > 1 ? titleWords.slice(0, -1).join(' ') : '';
      const durMain = titleWords[titleWords.length - 1];

      const [m800, m700] = await Promise.all([loadFont('Montserrat', 800), loadFont('Montserrat', 700)]);
      if (!m800 && !m700) {
        return new Response(JSON.stringify({ error: 'Font yuklenemedi' }), {
          status: 500, headers: { 'Content-Type': 'application/json' },
        });
      }
      const fonts = [
        ...(m800 ? [{ name: 'Montserrat', data: m800, weight: 800 as const, style: 'normal' as const }] : []),
        ...(m700 ? [{ name: 'Montserrat', data: m700, weight: 700 as const, style: 'normal' as const }] : []),
      ];

      return await toBufferedResponse(new ImageResponse(
        buildPhotoTemplate(campaign.imageUrl, bannerText, priceLabel, durTop, durMain, discountLabel, code, handle),
        { width: 1080, height: 1920, fonts },
      ));
    }

    // ── Beyaz metin şablonu (imageUrl yok) ───────────────────────────────────
    const eyebrow = campaign.storyEyebrow ?? campaign.type.toUpperCase();
    const title   = campaign.storyTitle   ?? campaign.title;
    const sub     = campaign.storySub     ?? campaign.description ?? '';
    const feats: string[] = campaign.storyFeats ? JSON.parse(campaign.storyFeats) : [];
    const trackingUrl = `hadiumreyegidelim.com/c/${campaignSlug}?ref=${code}`;

    const [reg, bold, black] = await Promise.all([loadFont('Inter', 400), loadFont('Inter', 700), loadFont('Inter', 900)]);
    if (!reg && !bold && !black) {
      return new Response(JSON.stringify({ error: 'Font yuklenemedi' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      });
    }
    const fonts = [
      ...(reg   ? [{ name: 'Inter', data: reg,   weight: 400 as const, style: 'normal' as const }] : []),
      ...(bold  ? [{ name: 'Inter', data: bold,  weight: 700 as const, style: 'normal' as const }] : []),
      ...(black ? [{ name: 'Inter', data: black, weight: 900 as const, style: 'normal' as const }] : []),
    ];

    return await toBufferedResponse(new ImageResponse(
      buildWhiteTemplate(eyebrow, title, sub, feats, discountLabel, code, handle, trackingUrl),
      { width: 1080, height: 1920, fonts },
    ));

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[story]', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
}
