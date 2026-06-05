// /api/og/story - React.createElement ile JSX yok, safi .ts
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import React from 'react';

export const runtime = 'nodejs';

async function loadFont(weight: 400 | 700 | 900): Promise<ArrayBuffer | null> {
  const urls: Record<number, string> = {
    400: 'https://fonts.bunny.net/inter/files/inter-latin-400-normal.woff2',
    700: 'https://fonts.bunny.net/inter/files/inter-latin-700-normal.woff2',
    900: 'https://fonts.bunny.net/inter/files/inter-latin-900-normal.woff2',
  };
  try {
    const res = await fetch(urls[weight]);
    if (res.ok) return res.arrayBuffer();
  } catch { /* fallback */ }
  return null;
}

const e = React.createElement;
const NAVY = '#003781';
const GOLD = '#c9a96e';

function buildElement(title: string, code: string, discountLabel: string) {
  return e('div', {
    style: { width: 1080, height: 1920, background: '#ffffff', display: 'flex', flexDirection: 'column', padding: 80, fontFamily: 'Inter' }
  },
    e('div', { style: { width: 80, height: 8, background: NAVY, display: 'flex', marginBottom: 60 } }),
    e('div', { style: { fontSize: 28, fontWeight: 700, color: NAVY, marginBottom: 80 } }, 'HadiUmreyeGidelim.com'),
    e('div', { style: { fontSize: 72, fontWeight: 900, color: NAVY, lineHeight: 1.1, marginBottom: 40 } }, title),
    e('div', { style: { fontSize: 36, color: '#6b7280', marginBottom: 60 } }, discountLabel),
    e('div', { style: { flex: 1 } }),
    e('div', {
      style: { background: NAVY, borderRadius: 24, padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: 8 }
    },
      e('div', { style: { fontSize: 18, color: 'rgba(255,255,255,0.6)', fontWeight: 600 } }, 'OZEL KODUN'),
      e('div', { style: { fontSize: 52, fontWeight: 900, color: GOLD, letterSpacing: '0.1em' } }, code),
    ),
    e('div', { style: { height: 8, background: GOLD, marginTop: 40, display: 'flex' } }),
  );
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignSlug = searchParams.get('campaign') ?? '';
    const refCode      = searchParams.get('ref') ?? '';

    const campaign = await prisma.campaign.findUnique({ where: { slug: campaignSlug } });
    if (!campaign) return new Response('Kampanya bulunamadi', { status: 404 });

    const title = campaign.storyTitle ?? campaign.title;
    const discountLabel = campaign.discountType === 'percent'
      ? `%${campaign.discountValue} Indirim`
      : `${campaign.discountValue}TL Indirim`;
    const code = refCode || 'KODUNUZ';

    const [reg, bold, black] = await Promise.all([loadFont(400), loadFont(700), loadFont(900)]);
    const fonts = [
      ...(reg   ? [{ name: 'Inter', data: reg,   weight: 400 as const, style: 'normal' as const }] : []),
      ...(bold  ? [{ name: 'Inter', data: bold,  weight: 700 as const, style: 'normal' as const }] : []),
      ...(black ? [{ name: 'Inter', data: black, weight: 900 as const, style: 'normal' as const }] : []),
    ];

    return new ImageResponse(buildElement(title, code, discountLabel), {
      width: 1080,
      height: 1920,
      fonts,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[story]', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
