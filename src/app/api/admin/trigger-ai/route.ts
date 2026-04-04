import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    
    // Asynchronously trigger the cron job with the correct secret bypass
    fetch(`${protocol}://${host}/api/cron/auto-blog?phase=start`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET || ''}`
      }
    }).catch(e => console.error("Trigger fail:", e));

    return NextResponse.json({ success: true, message: "Yapay zeka motoru başarıyla tetiklendi." });
  } catch (err) {
    return NextResponse.json({ error: "Tetikleme başarısız." }, { status: 500 });
  }
}
