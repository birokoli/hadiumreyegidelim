import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API (Requires GEMINI_API_KEY in .env)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not defined in the environment variables.' }, { status: 500 });
    }

    const { title, content, focusKeyword } = await request.json();

    if (!title || !content || !focusKeyword) {
      return NextResponse.json({ error: 'Title, content, and focusKeyword are required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Aşağıda başlığı ve içeriği verilen blog yazısını, '${focusKeyword}' anahtar kelimesi için SEO açısından analiz et. Google'ın 'Faydalı İçerik' (Helpful Content) güncellemelerini baz al. 

Başlık: "${title}"
İçerik Uzunluğu: ${content.length} karakter

Lütfen bana sadece şu JSON formatında yanıt ver:
{ 
  "okunabilirlik_puani": "0-100 arasi bir sayi (sadece sayi degeri)", 
  "kullanici_amaci_uyumu": "Evet veya Hayır", 
  "gelistirme_onerileri": ["oneri 1", "oneri 2", "oneri 3"], 
  "eksik_lsi_kelimeler": ["Google'da bu konuyla ilgili aranabilecek ama metinde geçmeyen 3 yan anahtar kelime"] 
}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
      }
    });

    const response = result.response;
    let text = response.text();
    
    // Strip markdown formatting if Gemini includes it despite responseMimeType
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    
    // Parse the JSON
    const parsedData = JSON.parse(text);

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("AI SEO Analysis Error:", error);
    return NextResponse.json({ error: `Hata Detayı: ${error.message || 'Bilinmeyen hata'}` }, { status: 500 });
  }
}
