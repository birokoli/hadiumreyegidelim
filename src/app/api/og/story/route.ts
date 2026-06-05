// /api/og/story?campaign={slug}&ref={code}
// 1080x1920 — Beyaz zemin, lacivert yazı, altın aksanlar, 200px Instagram padding
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import React from 'react';

export const runtime = 'nodejs';

type FontWeight = 400 | 700 | 900;

async function loadFont(weight: FontWeight): Promise<ArrayBuffer | null> {
  // Google Fonts CSS2 + eski UA → WOFF formatı (Satori woff2 desteklemiyor)
  const cssUrl = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`;
  try {
    const cssRes = await fetch(cssUrl, {
      headers: { 'User-Agent': 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0)' },
    });
    if (cssRes.ok) {
      const css = await cssRes.text();
      const m = css.match(/url\(([^)]+\.woff)\s*\)/);
      if (m) {
        const r = await fetch(m[1]);
        if (r.ok) return r.arrayBuffer();
      }
    }
  } catch { /* fallback */ }

  // Bunny Fonts WOFF yedek
  try {
    const bunny: Record<FontWeight, string> = {
      400: 'https://fonts.bunny.net/inter/files/inter-latin-400-normal.woff',
      700: 'https://fonts.bunny.net/inter/files/inter-latin-700-normal.woff',
      900: 'https://fonts.bunny.net/inter/files/inter-latin-900-normal.woff',
    };
    const r = await fetch(bunny[weight]);
    if (r.ok) return r.arrayBuffer();
  } catch { /* null */ }

  return null;
}

const e = React.createElement;
const NAVY  = '#003781';
const GOLD  = '#c9a96e';
const GRAY  = '#6b7280';
const LIGHT = '#f4f6f9';

function buildElement(
  eyebrow: string,
  title: string,
  sub: string,
  feats: string[],
  discountLabel: string,
  code: string,
  handle: string,
  trackingUrl: string,
) {
  return e('div', {
    style: {
      width: 1080, height: 1920,
      background: '#ffffff',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter',
    },
  },

    // ── Üst lacivert çizgi ──────────────────────────────────────────
    e('div', { style: { height: 8, background: NAVY, display: 'flex' } }),

    // ── İçerik alanı ────────────────────────────────────────────────
    e('div', {
      style: {
        flex: 1, display: 'flex', flexDirection: 'column',
        paddingLeft: 80, paddingRight: 80, paddingTop: 72,
      },
    },

      // Marka adı
      e('div', { style: { fontSize: 22, fontWeight: 600, color: NAVY, letterSpacing: '0.06em', marginBottom: 52 } },
        'hadiumreyegidelim.com'
      ),

      // Eyebrow etiketi
      e('div', { style: { display: 'flex', marginBottom: 36 } },
        e('div', {
          style: {
            background: NAVY, color: '#ffffff',
            fontSize: 18, fontWeight: 700, letterSpacing: '0.14em',
            paddingLeft: 24, paddingRight: 24, paddingTop: 12, paddingBottom: 12,
            borderRadius: 100,
          },
        }, eyebrow),
      ),

      // Ana başlık
      e('div', {
        style: {
          fontSize: title.length > 28 ? 72 : 84,
          fontWeight: 900, color: NAVY,
          lineHeight: 1.05, marginBottom: 36,
        },
      }, title),

      // Alt başlık
      sub ? e('div', {
        style: { fontSize: 32, color: GRAY, lineHeight: 1.5, marginBottom: 56 },
      }, sub) : null,

      // Özellik listesi
      feats.length > 0 ? e('div', {
        style: { display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 56 },
      },
        ...feats.map((feat) =>
          e('div', { style: { display: 'flex', alignItems: 'center', gap: 20 } },
            e('div', {
              style: {
                width: 44, height: 44, borderRadius: 100,
                background: LIGHT,
                border: `2px solid ${NAVY}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              },
            },
              e('div', { style: { fontSize: 22, color: NAVY, fontWeight: 900, lineHeight: 1 } }, '\u2713')
            ),
            e('div', { style: { fontSize: 30, color: '#1f2937', fontWeight: 500 } }, feat),
          )
        ),
      ) : null,

      // Esnek boşluk
      e('div', { style: { flex: 1 } }),

      // ── İndirim + Kod kartı ──────────────────────────────────────
      e('div', {
        style: {
          background: LIGHT,
          borderRadius: 28, marginBottom: 48,
          border: `2px solid #e2e8f0`,
          display: 'flex', overflow: 'hidden',
        },
      },
        // Sol: indirim miktarı
        e('div', {
          style: {
            flex: 1, paddingLeft: 48, paddingRight: 32,
            paddingTop: 44, paddingBottom: 44,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            borderRight: '2px solid #e2e8f0',
          },
        },
          e('div', {
            style: { fontSize: 16, color: GRAY, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 8 },
          }, 'SANA OZEL INDIRIM'),
          e('div', {
            style: { fontSize: 64, fontWeight: 900, color: NAVY, lineHeight: 1 },
          }, discountLabel),
        ),

        // Sağ: kod kutusu
        e('div', {
          style: {
            background: NAVY, paddingLeft: 40, paddingRight: 40,
            paddingTop: 44, paddingBottom: 44,
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            alignItems: 'center', gap: 8,
          },
        },
          e('div', { style: { fontSize: 14, color: 'rgba(255,255,255,0.55)', fontWeight: 700, letterSpacing: '0.14em' } }, 'KODUN'),
          e('div', {
            style: { fontSize: 40, fontWeight: 900, color: GOLD, letterSpacing: '0.12em', whiteSpace: 'nowrap' },
          }, code),
        ),
      ),

      // ── CTA satırı ───────────────────────────────────────────────
      e('div', {
        style: { display: 'flex', alignItems: 'center', gap: 18, marginBottom: 44 },
      },
        e('div', {
          style: {
            width: 56, height: 56, borderRadius: 100,
            border: `2.5px solid ${NAVY}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          },
        },
          e('div', { style: { fontSize: 28, color: NAVY, fontWeight: 900, lineHeight: 1 } }, '\u2192')
        ),
        e('div', {
          style: { fontSize: 30, fontWeight: 700, color: NAVY, lineHeight: 1.3 },
        }, 'Rezervasyon\u00a0i\u00e7in DM at'),
      ),

      // ── Alt bilgi ────────────────────────────────────────────────
      e('div', {
        style: { display: 'flex', flexDirection: 'column', gap: 8 },
      },
        e('div', { style: { fontSize: 24, color: NAVY, fontWeight: 600 } }, trackingUrl),
        handle ? e('div', { style: { fontSize: 20, color: '#9ca3af', fontWeight: 400 } }, handle + ' \u00f6nerisiyle') : null,
      ),
    ),

    // ── Alt altın çizgi + Instagram boşluğu (200px) ─────────────
    e('div', { style: { display: 'flex', flexDirection: 'column' } },
      e('div', { style: { height: 6, background: GOLD, display: 'flex' } }),
      e('div', { style: { height: 200, background: '#ffffff', display: 'flex' } }),
    ),
  );
}

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

    const eyebrow = campaign.storyEyebrow ?? campaign.type.toUpperCase();
    const title   = campaign.storyTitle   ?? campaign.title;
    const sub     = campaign.storySub     ?? campaign.description ?? '';
    const feats: string[] = campaign.storyFeats ? JSON.parse(campaign.storyFeats) : [];
    const discountLabel = campaign.discountType === 'percent'
      ? `%${campaign.discountValue}`
      : `${campaign.discountValue}TL`;
    const code         = refCode || 'KODUNUZ';
    const handle       = participant?.influencer?.instagramHandle
      ? `@${participant.influencer.instagramHandle}` : '';
    const trackingUrl  = `hadiumreyegidelim.com/c/${campaignSlug}?ref=${code}`;

    const [reg, bold, black] = await Promise.all([loadFont(400), loadFont(700), loadFont(900)]);

    if (!reg && !bold && !black) {
      return new Response(JSON.stringify({ error: 'Font yuklenemedi' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fonts = [
      ...(reg   ? [{ name: 'Inter', data: reg,   weight: 400 as const, style: 'normal' as const }] : []),
      ...(bold  ? [{ name: 'Inter', data: bold,  weight: 700 as const, style: 'normal' as const }] : []),
      ...(black ? [{ name: 'Inter', data: black, weight: 900 as const, style: 'normal' as const }] : []),
    ];

    return new ImageResponse(
      buildElement(eyebrow, title, sub, feats, discountLabel, code, handle, trackingUrl),
      { width: 1080, height: 1920, fonts },
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[story]', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
