// Satori (next/og) için JSX component — route.ts'den import edilir
// Bu dosyanın .tsx olması şart, JSX içeriyor

const W = 1080;
const H = 1920;
const NAVY = '#003781';
const NAVY_LIGHT = '#e8edf6';
const GOLD = '#c9a96e';
const GRAY = '#6b7280';
const GRAY_LIGHT = '#f3f4f6';
const WHITE = '#ffffff';

interface StoryImageProps {
  eyebrow: string;
  title: string;
  sub: string;
  feats: string[];
  discountLabel: string;
  commLabel: string | null;
  code: string;
  handle: string;
  trackingUrl: string;
}

export function StoryImage({
  eyebrow, title, sub, feats, discountLabel, commLabel, code, handle, trackingUrl,
}: StoryImageProps) {
  return (
    <div
      style={{
        width: W, height: H, background: WHITE, fontFamily: 'Inter',
        display: 'flex', flexDirection: 'column', padding: '0', position: 'relative',
      }}
    >
      {/* Top accent bar */}
      <div style={{ width: W, height: 8, background: NAVY, display: 'flex' }} />

      {/* Brand header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 56, paddingBottom: 40 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: NAVY, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          HadiUmreyeGidelim
        </span>
        <span style={{ fontSize: 28, color: GOLD, fontWeight: 700, marginLeft: 4 }}>.com</span>
      </div>

      {/* Hero accent block */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 80px', height: 320, background: NAVY_LIGHT, borderRadius: 32,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -60, top: -60, width: 280, height: 280, borderRadius: '50%', background: NAVY, opacity: 0.06, display: 'flex' }} />
        <div style={{ position: 'absolute', left: -40, bottom: -40, width: 200, height: 200, borderRadius: '50%', background: GOLD, opacity: 0.10, display: 'flex' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 52, color: WHITE }}>&#x1F54C;</span>
          </div>
          <span style={{ fontSize: 30, fontWeight: 700, color: NAVY, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {eyebrow}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '72px 96px 0', flex: 1 }}>
        {/* Title */}
        <div style={{ fontSize: title.length > 30 ? 68 : 80, fontWeight: 900, color: NAVY, lineHeight: 1.1, marginBottom: 28 }}>
          {title}
        </div>

        {/* Subtitle */}
        {sub ? (
          <div style={{ fontSize: 36, color: GRAY, fontWeight: 400, lineHeight: 1.4, marginBottom: 56 }}>
            {sub}
          </div>
        ) : null}

        {/* Feature list */}
        {feats.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 60 }}>
            {feats.map((feat, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: NAVY, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: WHITE, fontSize: 22, fontWeight: 700 }}>&#x2713;</span>
                </div>
                <span style={{ fontSize: 32, color: '#1f2937', fontWeight: 500 }}>{feat}</span>
              </div>
            ))}
          </div>
        ) : null}

        {/* Divider */}
        <div style={{ height: 1, background: '#e5e7eb', marginBottom: 48, display: 'flex' }} />

        {/* Discount + Code card */}
        <div style={{ display: 'flex', background: NAVY, borderRadius: 28, overflow: 'hidden', marginBottom: 40 }}>
          <div style={{ flex: 1, padding: '44px 48px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.15)' }}>
            <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Ozel Indirim
            </span>
            <span style={{ fontSize: 56, fontWeight: 900, color: GOLD, lineHeight: 1 }}>{discountLabel}</span>
            {commLabel ? (
              <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.7)', marginTop: 10, fontWeight: 500 }}>+ {commLabel}</span>
            ) : null}
          </div>
          <div style={{ flex: 1, padding: '44px 48px', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
              Ozel Kodun
            </span>
            <span style={{ fontSize: 42, fontWeight: 900, color: WHITE, letterSpacing: '0.15em', lineHeight: 1.2, wordBreak: 'break-all' }}>
              {code}
            </span>
          </div>
        </div>

        {/* Tracking URL */}
        <div style={{ background: GRAY_LIGHT, borderRadius: 20, padding: '24px 36px', display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <span style={{ fontSize: 26, color: NAVY, fontWeight: 400, opacity: 0.5 }}>&#x1F517;</span>
          <span style={{ fontSize: 28, color: NAVY, fontWeight: 600 }}>{trackingUrl}</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 72, paddingTop: 24, gap: 12 }}>
        {handle ? (
          <span style={{ fontSize: 34, fontWeight: 700, color: NAVY, letterSpacing: '0.04em' }}>{handle}</span>
        ) : null}
        <div style={{ width: 48, height: 4, background: GOLD, borderRadius: 4, display: 'flex' }} />
        <span style={{ fontSize: 24, color: GRAY, fontWeight: 400 }}>hadiumreyegidelim.com</span>
      </div>

      {/* Bottom accent bar */}
      <div style={{ width: W, height: 8, background: GOLD, display: 'flex' }} />
    </div>
  );
}
