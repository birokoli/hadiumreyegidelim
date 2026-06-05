// Satorinin temeli: sadece renk blokları, emoji yok, overflow yok
export function StoryImage({ title, code }: { title: string; code: string; eyebrow?: string; sub?: string; feats?: string[]; discountLabel?: string; commLabel?: string | null; handle?: string; trackingUrl?: string }) {
  return (
    <div style={{ width: 1080, height: 1920, background: '#ffffff', display: 'flex', flexDirection: 'column', padding: 80, fontFamily: 'Inter' }}>
      <div style={{ width: 80, height: 8, background: '#003781', display: 'flex', marginBottom: 60 }} />
      <div style={{ fontSize: 28, fontWeight: 700, color: '#003781', marginBottom: 80 }}>
        HadiUmreyeGidelim.com
      </div>
      <div style={{ fontSize: 72, fontWeight: 900, color: '#003781', lineHeight: 1.1, marginBottom: 40 }}>
        {title}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ background: '#003781', borderRadius: 24, padding: '40px 48px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>OZEL KODUN</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: '#c9a96e', letterSpacing: '0.1em' }}>{code}</div>
      </div>
      <div style={{ height: 8, background: '#c9a96e', marginTop: 40, display: 'flex' }} />
    </div>
  );
}
