import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { generateAndUploadImage } from '@/lib/generate-image';

export const maxDuration = 120; // Allow enough time for parallel image generation

// Initialize the API (Requires GEMINI_API_KEY in .env)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not defined in the environment variables.' }, { status: 500 });
    }

    const { topic, keywords, categories, authors } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const currentYear = new Date().getFullYear();

    const prompt = `Sen, Suudi Arabistan'da uzun yıllar yaşamış, Mekke ve Medine'nin tüm pratik detaylarına hakim, üst düzey (VIP) ve Bireysel Umre organizasyonları konusunda uzmanlaşmış kıdemli bir İslami Seyahat Editörüsün. Yazdığın içerikler "Google Faydalı İçerik (Helpful Content)" standartlarının zirvesindedir. Okuyucuya sığ robotik bilgiler değil, vizyoner ve hayata dokunan tecrübeler sunarsın.

Konu: "${topic}"
Ek Anahtar Kelimeler: "${keywords || ''}"
Mevcut Kategoriler: ${JSON.stringify(categories || [])}
Mevcut Yazarlar (E-E-A-T): ${JSON.stringify(authors || [])}

YASAKLI YAPAY ZEKA JARGONU VE ÜSLUP (ÇOK ÖNEMLİ):
- ŞU KELİMELERİ ASLA KULLANMA: "Sonuç olarak", "özetlemek gerekirse", "bu makalede", "büyüleyici", "dalış yapalım", "gerçek bir mücevherdir", "unutulmamalıdır ki", "eşsiz", "hayati önem taşır", "gerekir".
- Üslup: Empatik, somut örneklere dayanan, sıcak bir dil. Süslü sıfatlar yerine pratik, ikna edici çözümler anlat.

ZAMAN VE SATIŞ STRATEJİSİ:
- ŞU AN YIL: ${currentYear}. Geçmiş yılları ASLA kullanma.
- Diyanet veya diğer acentelerin kalabalık yapısı yerine "Hadi Umreye Gidelim" Bireysel Umre paketlerinin VIP konforunu ön plana çıkar.

SEO VE GOOGLE YÖNERGELERİ:
1. Odak kelimeyi ("${topic}") ana başlık, meta açıklama, URL ve ilk 100 kelimede GÖZÜNE SOKMADAN doğal bir akışla kullan.
2. Flesch Okunabilirlik Kurallarına uymak için KISA CÜMLELER kur. Paragraflar 2-3 cümleyi asla geçmesin. Metni bağlaçlarla (örneğin, kaldı ki, hatta) akıcı hale getir.
3. H2 ve H3 başlıklarını zengin tut, aralara madde işaretli HTML listeleri (<ul><li>) serpiştir.
4. Makale sonuna 3 maddelik 'Sıkça Sorulan Sorular (SSS)' ekle.
5. SSS veya içerik bitimine Diyanet / Nusuk gibi güvenilir bir dış kaynak linki (href) ve sitemiz içine (https://hadiumreyegidelim.com/bireysel-umre) en az 2 iç link göm.

Lütfen çıktıyı SADECE AŞAĞIDAKİ YAPIDA VE EKSİKSİZ biçimde bir JSON objesi olarak ver! Çift tırnaklara vb dikkat et.

{
  "title": "H1 Ana Başlık: Dikkat Çekici SEO Uyumlu...",
  "slug": "seo-uyumlu-cok-kisa-url-slug",
  "metaDescription": "150-160 karakterlik meta açıklaması",
  "keywords": "hedeflenen virgüllü SEO kelimeleri",
  "focusKeyword": "Odak kelimesi",
  "categoryId": "Mevcut Kategorilerden id",
  "authorId": "Mevcut Yazarlardan id",
  "content": "<p>Güçlü giriş...</p><h2>...</h2><p>...</p>...",
  "personalExperience": "Bizzat yaşanmış hissi veren, samimi, 2-3 cümlelik yazar tecrübesi",
  "references": "Kullanılan dış bağlantılar, kanıtlar (Diyanet, Nusuk, Wiki vb)"
}`;

    const schema: any = {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING, description: "H1 Ana Başlık: Tamamen dikkat çekici SEO uyumlu makale başlığı" },
        slug: { type: SchemaType.STRING, description: "SEO uyumlu kısa URL slug" },
        metaDescription: { type: SchemaType.STRING, description: "Google'da çıkacak 150-160 karakterlik, tıklamaya teşvik eden meta açıklaması" },
        keywords: { type: SchemaType.STRING, description: "konuyla ilgili virgülle ayrılmış 5-6 adet SEO anahtar kelimesi" },
        focusKeyword: { type: SchemaType.STRING, description: "Bu makale için hedeflenen tek bir ana odak anahtar kelime" },
        categoryId: { type: SchemaType.STRING, description: "Mevcut Kategoriler listesinden en uygun olanın id'si (yoksa boş string)" },
        authorId: { type: SchemaType.STRING, description: "Mevcut Yazarlar listesinden en uygun yazarın id'si (yoksa boş string)" },
        content: { type: SchemaType.STRING, description: "HTML formatında içerik (h2, h3, p). İçinde asla h1 bulunmamalıdır." },
        personalExperience: { type: SchemaType.STRING, description: "Bizzat yaşanmış hissi veren, blog yazısıyla %100 uyumlu kişisel deneyim. ASLA null veya boş bırakma!" },
        references: { type: SchemaType.STRING, description: "Makaledeki konulara kanıt niteliğinde güvenilir İslami veya resmî dış kaynaklar (Diyanet, Nusuk, Wiki). MUTLAKA doldur." }
      },
      required: ["title", "slug", "metaDescription", "keywords", "focusKeyword", "categoryId", "authorId", "content", "personalExperience", "references"],
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const response = result.response;
    let text = response.text();
    
    // Strip markdown formatting if Gemini includes it despite responseMimeType
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    
    // Parse the JSON
    const parsedData = JSON.parse(text);

    // ==========================================
    // FAZ 2 & 3 & 4: Görsel Promptlarını Üret ve Paralel Çiz (Nano Banana)
    // ==========================================
    const imagePromptInstruction = `ÇALIŞMA KURALLARI:
1. Başlık Analizi: Sana verilen blog metnini oku. Yazının ana başlığını ve tüm alt başlıklarını tespit et.
2. SSS İstisnası: "Sıkça Sorulan Sorular", "SSS" veya "FAQ" başlıklarını ve bu başlıkların altındaki içerikleri KESİNLİKLE YOKSAY.
3. JSON Formatı Kuralı: Geçerli her bir başlık için aşağıdaki JSON şablonunu eksiksiz doldur. ÇIKTIYI SADECE JSON ARRAY ([{}, {}]) OLARAK VER!
4. Dil: JSON içindeki değişkenleri İngilizce olarak, profesyonel fotoğrafçılık ve 3D render terimleri kullanarak doldur.
5. Kalite: Görseller lüks, estetik ve ticari bir atmosfere sahip olmalıdır.

KULLANILACAK JSON ŞABLONU:
{
  "heading": "[Başlık Adı Türkçe Olarak - Tamamen eşleşmeli]",
  "task": "photorealistic_product_visual",
  "subject": { "primary_object": "..." },
  "scene": { "environment": "..." },
  "aesthetic": { "mood": "...", "color_palette": "..." },
  "lighting": { "style": "..." },
  "camera": { "lens": "..." }
}

--- BLOG METNİ ---
BAŞLIK: ${parsedData.title}
İÇERİK:
${parsedData.content}
`;

    const imgPromptModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const imgPromptResult = await imgPromptModel.generateContent({
      contents: [{ role: "user", parts: [{ text: imagePromptInstruction }] }],
      generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
    });

    const promptsText = imgPromptResult.response.text().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    let imagePromptsJSON = [];
    try {
      imagePromptsJSON = JSON.parse(promptsText);
      parsedData.imagePrompts = JSON.stringify(imagePromptsJSON);
    } catch(e) {
      console.error("Görsel prompt JSON parse hatası:", e);
    }
    
    if (imagePromptsJSON.length > 0) {
      const imagePromises = imagePromptsJSON.map(async (promptObj: any) => {
        const url = await generateAndUploadImage(promptObj, promptObj.heading || "blog-image");
        return { heading: promptObj.heading, url };
      });

      const results = await Promise.allSettled(imagePromises);
      let htmlContent = parsedData.content;
      
      results.forEach((res) => {
        if (res.status === 'fulfilled' && res.value && res.value.url) {
           const headingText = res.value.heading;
           const imgUrl = res.value.url;
           
           // Using string manipulation instead of regex to be absolutely safe
           const index = htmlContent.toLowerCase().indexOf(`>${headingText.toLowerCase()}<`);
           if (index !== -1) {
              const insertPosition = htmlContent.indexOf('</h', index);
              if (insertPosition !== -1) {
                 const closingTagEnd = htmlContent.indexOf('>', insertPosition) + 1;
                 const before = htmlContent.substring(0, closingTagEnd);
                 const after = htmlContent.substring(closingTagEnd);
                 const imgTag = `\n<img src="${imgUrl}" alt="${headingText}" style="width:100%; max-width: 500px; margin: 30px auto; border-radius:16px; display:block; box-shadow: 0 8px 25px rgba(0,0,0,0.08);" />\n`;
                 htmlContent = before + imgTag + after;
              }
           }
           
           if (!parsedData.imageUrl) parsedData.imageUrl = imgUrl; // Cover image fallback
        }
      });
      
      parsedData.content = htmlContent;
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Hata Detayı: " + (error.message || "Bilinmeyen hata") }, { status: 500 });
  }
}
