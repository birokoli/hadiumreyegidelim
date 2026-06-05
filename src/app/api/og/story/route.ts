// ─────────────────────────────────────────────────────────────────────────────
// /api/og/story?campaign={slug}&ref={code}
// 1080 × 1920 PNG — beyaz zemin, Apple-sade, Inter font
// Satori (next/og) kullanılır; türkçe karakter desteği için Inter embed edilir.
// ─────────────────────────────────────────────────────────────────────────────
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs'; // Prisma için nodejs runtime

// ── Sabitler ──────────────────────────────────────────────────────────────────
const W = 1080;
const H = 1920;
const NAVY = '#003781';
const NAVY_LIGHT = '#e8edf6';
const GOLD = '#c9a96e';
const GOLD_LIGHT = '#fdf6ec';
const GRAY = '#6b7280';
const GRAY_LIGHT = '#f3f4f6';
const WHITE = '#ffffff';

// ── Font yükle ────────────────────────────────────────────────────────────────
async function loadFont(name: string, style: 'normal' | 'italic' = 'normal', weight: 400 | 700 | 900 = 400) {
  const url = `https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7W0Q5n-wU.woff`;
  // Use a stable Google Fonts CSS approach
  const fontMap: Record<string, string> = {
    'Inter-Regular': 'https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2JL7W0Q5n-wU.woff',
    'Inter-Bold':    'https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7W0Q5n-wU.woff',
    'Inter-Black':   'https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIatJL7W0Q5n-wU.woff',
  };
  const key = weight === 700 ? 'Inter-Bold' : weight === 900 ? 'Inter-Black' : 'Inter-Regular';
  try {
    const res = await fetch(fontMap[key]);
    return await res.arrayBuffer();
  } catch {
    // fallback: any google font endpoint
    const res2 = await fetch(url);
    return await res2.arrayBuffer();
  }
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const campaignSlug = searchParams.get('campaign') ?? '';
  const refCode      = searchParams.get('ref') ?? '';

  // ── Veri çek ────────────────────────────────────────────────────────────────
  const [campaign, participant] = await Promise.all([
    prisma.campaign.findUnique({ where: { slug: campaignSlug } }),
    refCode
      ? prisma.campaignParticipant.findUnique({
          where: { uniqueCode: refCode },
          include: { influencer: { select: { fullName: true, instagramHandle: true } } },
        })
      : Promise.resolve(null),
  ]);

  if (!campaign) {
    return new Response('Kampanya bulunamadı', { status: 404 });
  }

  // ── Görsel veriler ──────────────────────────────────────────────────────────
  const eyebrow   = campaign.storyEyebrow ?? campaign.type.toUpperCase();
  const title     = campaign.storyTitle   ?? campaign.title;
  const sub       = campaign.storySub     ?? campaign.description ?? '';
  const feats: string[] = campaign.storyFeats
    ? JSON.parse(campaign.storyFeats)
    : [];
  const discountLabel = campaign.discountType === 'percent'
    ? `%${campaign.discountValue} İndirim`
    : `₺${campaign.discountValue} İndirim`;
  const commLabel = campaign.commissionPct
    ? `%${campaign.commissionPct} Komisyon`
    : null;
  const code = refCode || 'KODUNUZ';
  const handle = participant?.influencer?.instagramHandle
    ? `@${participant.influencer.instagramHandle}`
    : '';
  const trackingUrl = `hadiumreyegidelim.com/${campaignSlug}?ref=${code}`;

  // ── Font ────────────────────────────────────────────────────────────────────
  const [fontRegular, fontBold, fontBlack] = await Promise.all([
    loadFont('Inter', 'normal', 400),
    loadFont('Inter', 'normal', 700),
    loadFont('Inter', 'normal', 900),
  ]);

  // ── Layout render ───────────────────────────────────────────────────────────
  return new ImageResponse(
    (
      <div
        style={{
          width:  W,
          height: H,
          background: WHITE,
          fontFamily: 'Inter',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          position: 'relative',
        }}
      >
        {/* ── Top accent bar ──────────────────────────────────────────────── */}
        <div style={{ width: W, height: 8, background: NAVY, display: 'flex' }} />

        {/* ── Brand header ────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 56,
            paddingBottom: 40,
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: NAVY,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            HadiUmreyeGidelim
          </span>
          <span style={{ fontSize: 28, color: GOLD, fontWeight: 700, marginLeft: 4 }}>.com</span>
        </div>

        {/* ── Hero accent block ────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 80px',
            height: 320,
            background: NAVY_LIGHT,
            borderRadius: 32,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circle */}
          <div
            style={{
              position: 'absolute',
              right: -60,
              top: -60,
              width: 280,
              height: 280,
              borderRadius: '50%',
              background: NAVY,
              opacity: 0.06,
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: -40,
              bottom: -40,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: GOLD,
              opacity: 0.10,
              display: 'flex',
            }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: NAVY,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: 52, color: WHITE }}>🕌</span>
            </div>
            <span
              style={{
                fontSize: 30,
                fontWeight: 700,
                color: NAVY,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {eyebrow}
            </span>
          </div>
        </div>

        {/* ── Main content ────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '72px 96px 0',
            flex: 1,
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: title.length > 30 ? 68 : 80,
              fontWeight: 900,
              color: NAVY,
              lineHeight: 1.1,
              marginBottom: 28,
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          {sub && (
            <div
              style={{
                fontSize: 36,
                color: GRAY,
                fontWeight: 400,
                lineHeight: 1.4,
                marginBottom: 56,
              }}
            >
              {sub}
            </div>
          )}

          {/* Feature list */}
          {feats.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                marginBottom: 60,
              }}
            >
              {feats.map((feat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: NAVY,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ color: WHITE, fontSize: 22, fontWeight: 700 }}>✓</span>
                  </div>
                  <span style={{ fontSize: 32, color: '#1f2937', fontWeight: 500 }}>{feat}</span>
                </div>
              ))}
            </div>
          )}

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: '#e5e7eb',
              marginBottom: 48,
              display: 'flex',
            }}
          />

          {/* Discount + Code card */}
          <div
            style={{
              display: 'flex',
              background: NAVY,
              borderRadius: 28,
              overflow: 'hidden',
              marginBottom: 40,
            }}
          >
            {/* Left: discount */}
            <div
              style={{
                flex: 1,
                padding: '44px 48px',
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <span
                style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}
              >
                Özel İndirim
              </span>
              <span style={{ fontSize: 56, fontWeight: 900, color: GOLD, lineHeight: 1 }}>
                {discountLabel}
              </span>
              {commLabel && (
                <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.7)', marginTop: 10, fontWeight: 500 }}>
                  + {commLabel}
                </span>
              )}
            </div>
            {/* Right: code */}
            <div
              style={{
                flex: 1,
                padding: '44px 48px',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span
                style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}
              >
                Özel Kodun
              </span>
              <span
                style={{
                  fontSize: 42,
                  fontWeight: 900,
                  color: WHITE,
                  letterSpacing: '0.15em',
                  lineHeight: 1.2,
                  wordBreak: 'break-all',
                }}
              >
                {code}
              </span>
            </div>
          </div>

          {/* Tracking URL pill */}
          <div
            style={{
              background: GRAY_LIGHT,
              borderRadius: 20,
              padding: '24px 36px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 40,
            }}
          >
            <span style={{ fontSize: 26, color: NAVY, fontWeight: 400, opacity: 0.5 }}>🔗</span>
            <span style={{ fontSize: 28, color: NAVY, fontWeight: 600 }}>{trackingUrl}</span>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingBottom: 72,
            paddingTop: 24,
            gap: 12,
          }}
        >
          {handle && (
            <span
              style={{
                fontSize: 34,
                fontWeight: 700,
                color: NAVY,
                letterSpacing: '0.04em',
              }}
            >
              {handle}
            </span>
          )}
          <div style={{ width: 48, height: 4, background: GOLD, borderRadius: 4, display: 'flex' }} />
          <span style={{ fontSize: 24, color: GRAY, fontWeight: 400 }}>
            hadiumreyegidelim.com
          </span>
        </div>

        {/* ── Bottom accent bar ────────────────────────────────────────────── */}
        <div style={{ width: W, height: 8, background: GOLD, display: 'flex' }} />
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [
        { name: 'Inter', data: fontRegular, weight: 400, style: 'normal' },
        { name: 'Inter', data: fontBold,    weight: 700, style: 'normal' },
        { name: 'Inter', data: fontBlack,   weight: 900, style: 'normal' },
      ],
    },
  );
}
