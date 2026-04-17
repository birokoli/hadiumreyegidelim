import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY tanımlı değil.' }, { status: 500 });
    }

    const { content, instruction } = await request.json();
    if (!content || !instruction) {
      return NextResponse.json({ error: 'content ve instruction zorunludur.' }, { status: 400 });
    }

    const message = await claude.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `Sen uzman bir Editör, Metin Yazarı ve SEO Mühendisisin.
Aşağıda bir blog makalesinin HTML içeriği ve kullanıcının düzenleme talimatı verilecek.
Mevcut HTML yapısını (tag'leri, semantic yapıyı) bozmadan metni talimata göre düzenle.
SADECE HTML kodunu döndür. Markdown işaretleyicisi veya açıklama yazma.

--- KULLANICININ TALİMATI ---
${instruction}

--- MEVCUT HTML İÇERİK ---
${content}`,
      }],
    });

    let text = message.content[0].type === 'text' ? message.content[0].text : '';
    text = text.replace(/^```(?:html|xml)?\s*/i, '').replace(/\s*```$/i, '').trim();

    return NextResponse.json({ optimizedContent: text });

  } catch (error: any) {
    console.error('[edit-blog] Hata:', error);
    return NextResponse.json({ error: `Hata: ${error.message || 'Bilinmeyen hata'}` }, { status: 500 });
  }
}
