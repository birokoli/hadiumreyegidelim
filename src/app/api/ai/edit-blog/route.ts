import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not defined.' }, { status: 500 });
    }

    const { content, instruction } = await request.json();

    if (!content || !instruction) {
      return NextResponse.json({ error: 'Content and instruction are required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Sen uzman bir Editor, Metin Yazarı ve SEO Mühendisisin.
Aşağıda sana bir blog makalesinin tamamı veya bir kısmı (HTML formatında) ve kullanıcının bu metni nasıl düzeltmek istediğine dair bir talimat (instruction) verilecektir.

Lütfen mevcut HTML yapısını bozmadan (tagleri, semantic yapıyı koruyarak) metni talimata uygun olarak baştan aşağı düzenle, mükemmelleştir veya eklemeler yap.
Geriye SADECE HTML kodunu döndür, markdown işaretleyicisi (\`\`\`html vs) veya ekstra bir ön konuşma yazma. 

--- MÜŞTERİNİN TALİMATI ---
${instruction}

--- MEVCUT HTML İÇERİK ---
${content}
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
      }
    });

    const response = result.response;
    let text = response.text();
    
    // Clean markdown blocks if present
    text = text.replace(/^```(?:html|xml)?\s*/i, '').replace(/\s*```$/i, '').trim();

    return NextResponse.json({ optimizedContent: text });

  } catch (error: any) {
    console.error("AI Edit Error:", error);
    return NextResponse.json({ error: `Hata Detayı: ${error.message || 'Bilinmeyen hata'}` }, { status: 500 });
  }
}
