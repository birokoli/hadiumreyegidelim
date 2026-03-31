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

    const prompt = `Sen uzman bir SEO uzmanı ve umre/hac, maneviyat konularında profesyonel bir blog yazarısın. Yazılarını %100 bir insan yazmış gibi kurgulamalısın. SEMRUSH ve Google SEO standartlarını en üst düzeyde (Hedef: %100 Orjinallik, 58.9 Readability Skoru) karşılamalısın. Yapay zeka dedektörlerini aşmak için şu kurallara KESİNLİKLE uy:

Konu: "${topic}"
Ek Anahtar Kelimeler: "${keywords || ''}"
Mevcut Kategoriler: ${JSON.stringify(categories || [])}
Mevcut Yazarlar (E-E-A-T): ${JSON.stringify(authors || [])}

SEMRUSH OKUNABİLİRLİK (READABILITY) KURALLARI (HEDEF: 58.9 - 8./9. Sınıf Seviyesi):
1. Çok Kısa Paragraflar: Her paragraf MAKSİMUM 2-3 cümle olmalıdır. Okunabilirliği artırmak ve Semrush'tan yüksek puan almak için 'Split long paragraphs' uyarısını aşacak şekilde her 2-3 cümlede bir <p> etiketiyle alt paragraf başlat!
2. Basit, Kısa Kelimeler (Rewrite hard-to-read sentences): "kullanılabiliyor", "gerçekleştirebilirsiniz", "yararlanabilirsiniz" gibi ağır, kurumsal ve karmaşık kelimeler ASLA KULLANMA. Bunlar yerine "kullanılır", "yapabilirsiniz", "alabilirsiniz" gibi basit düzey, sade ifadeler kullan. Çeviri kokan cümleler kurma. 

SEO VE LİNK İNŞASI KURALLARI (ZORUNLU):
1. ZORUNLU ANAHTAR KELİMELER: "bireysel umre", "tursuz umre", "umre vizesi", "nusuk umre", "umre maliyeti", "ucuz umre", "uçak bileti", "e vize", "suudi arabistan a", "mescid i haram", "gidiş dönüş" kelimelerini makale içerisine olabildiğince doğal bir şekilde, en az 1 kez ZORUNLU olarak entegre et!
2. İÇ LİNKLEME (Internal Linking & CTA): Yazının akışında ve YAZININ EN SONUNDA sitemizin hizmetlerine CTA (Çağrı) niteliğinde DİNAMİK HTML <a href="..."> etiketleri kullan. Örnek: <a href="/paketler">Umre paketlerimizi inceleyin</a>, <a href="/bireysel-umre">Bireysel umre danışmanlığı ile tanışın</a>, <a href="/iletisim">Bize anında ulaşabilirsiniz</a>. Blog içerisinde konuya uygun en az 3 adet Internal Link vermen zorunludur!
3. DIŞ LİNKLEME (External Linking): Metin içerisinde adı geçen resmi konulara (Örn: Nusuk, E-vize, Diyanet, Wikipedia) otoriter sitelere <a href="..." target="_blank"> etiketiyle en az 2 adet Dış (External) Link vermelisin. (Örn: <a href="https://nusuk.sa" target="_blank">Nusuk Resmi Sitesi</a>).
4. E-E-A-T ve Orjinallik: Klasik makale giriş/çeliş kullanma. 'Özetle', 'Günümüzde' gibi kelimeleri listeden çıkar. Makaleyi direkt hikayesiyle ve sohbet havasında aç. 'sen/ben' veya 'siz/biz' tonunu doğal kullan. Bilgiyi dümdüz listelemek yerine, sanki yılların umre rehberi olarak kendi tecrübeni masaya koyuyormuş gibi hissettir.

Teknik Kurallar:
- HTML formatında içerik üret. KESİNLİKLE HTML NİTELİKLERİ İÇİNDE (class, href, alt, vb.) SADECE TEK TIRNAK (') KULLAN. ASLA ÇİFT TIRNAK (") KULLANMA. String formatı bozulmasın.
- H2 ve H3 etiketlerini bolca kullan. İçerikte H1 OLMASIN (Biz başlıkları zaten sayfa üstünde <h1/> basıyoruz). Fakat yazının en başında doğrudan içeriğe güçlü bir giriş yap.
- Resim kullanacaksan (<img src="..." alt="Açıklama" />), "alt" etiketlerini MÜKEMMEL derece açıklayıcı doldur! Gerekmiyorsa sahte img kullanma.

Lütfen çıktıyı SADECE AŞAĞIDAKİ YAPIDA VE EKSİKSİZ biçimde bir JSON objesi olarak ver! Tüm anahtarların doldurulması (hiçbirinin boş bırakılmaması) zorunludur. DİKKAT: "title", "metaDescription", "focusKeyword" ve "slug" alanlarını KESİNLİKLE boş bırakma! Çift tırnaklara dikkat et (HTML'de tek tırnak).

{
  "title": "H1 Ana Başlık: Dikkat Çekici SEO Uyumlu...",
  "slug": "seo-uyumlu-cok-kisa-url-slug",
  "metaDescription": "150-160 karakterlik meta açıklaması",
  "keywords": "hedeflenen virgüllü SEO kelimeleri",
  "focusKeyword": "Odak kelimesi",
  "categoryId": "Mevcut Kategorilerden id",
  "authorId": "Mevcut Yazarlardan id",
  "content": "<p class='text-lg'>Hikaye odaklı güçlü giriş cümlen...</p><h2>İlk Alt Başlık</h2><p>Kısa ve basit ilk paragraf...</p><p>Kısa ve basit ikinci paragraf...</p><p>Devamı... İçinde <a href='/paketler'>...</a> linklemesi vb.</p>",
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
        personalExperience: { type: SchemaType.STRING, description: "Bizzat yaşanmış hissi veren, blog yazısıyla %100 uyumlu kişisel deneyim" },
        references: { type: SchemaType.STRING, description: "Makaledeki konulara kanıt niteliğinde güvenilir kaynaklar" }
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
                 const imgTag = `\n<img src="${imgUrl}" alt="${headingText}" style="width:100%; border-radius:12px; margin-top:15px; margin-bottom:15px;" />\n`;
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
