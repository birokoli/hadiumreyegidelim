import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

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

    const prompt = `Sen uzman bir SEO uzmanı ve umre/hac, maneviyat konularında profesyonel bir blog yazarısın. Yazılarını %100 bir insan yazmış gibi kurgulamalısın. Yapay zeka dedektörlerini aşmak için şu kurallara KESİNLİKLE uy:

Konu: "${topic}"
Anahtar Kelimeler: "${keywords || ''}"
Mevcut Kategoriler: ${JSON.stringify(categories || [])}
Mevcut Yazarlar (E-E-A-T): ${JSON.stringify(authors || [])}

1. Burstiness (Değişkenlik): Cümle uzunluklarını rastgele değiştir. Bazı cümleler 3 kelime olsun, bazıları 25 kelime.
2. Perplexity (Beklenmezlik): Sıradan kelimeler yerine daha az tahmin edilebilir, zengin kelimeler ve eşanlamlılar kullan. Günlük konuşma dilini, retorik soruları ve deyimleri metne yedir.
3. Mekaniklikten Kaçın: 'Sonuç olarak', 'Özetle', 'Günümüzde', 'Önemlidir ki' gibi klasik yapay zeka kalıplarını ASLA kullanma.
4. Kusurluluk ve Doğallık: Çok hafif anlatım bozuklukları veya doğal duran geçişler yap. Bilgiyi dümdüz listelemek yerine, sanki kendi deneyimini anlatıyormuşsun gibi bir hikaye akışı (storytelling) kur.
5. Formu Tamamen Doldur: Gönderilen "Mevcut Kategoriler" ve "Mevcut Yazarlar" listelerini incele. Yazının konusuna en uygun Kategorinin ve Yazarın "id" değerini JSON'da döndür!

Teknik Kurallar:
- Okuyucuyu sıkmayan akıcı, etkileyici ve otoriter bir dil kullan. 
- HTML formatında içerik üret. KESİNLİKLE HTML NİTELİKLERİ İÇİNDE (class, src, alt, vb.) SADECE TEK TIRNAK (') KULLAN. ASLA ÇİFT TIRNAK (") KULLANMA.
- H2 ve H3 etiketlerini semantik kullan. Makalenin ana başlığı (H1) "title" alanında olacak, içerik ("content") SADECE H2 veya H3 ile başlayıp alt başlıklarla devam etmeli. İçerikte H1 olmasın!
- Paragrafları <p> ile sarmala. Gerektiğinde okunaklı listeler (<ul> <li>) ekle.

Lütfen çıktıyı SADECE AŞAĞIDAKİ YAPIDA VE EKSİKSİZ biçimde bir JSON objesi olarak ver! Tüm anahtarların doldurulması (hiçbirinin boş bırakılmaması) zorunludur. DİKKAT: "title", "metaDescription", "focusKeyword" ve "slug" alanlarını KESİNLİKLE boş bırakma, bunlar makalenin en önemli SEO alanlarıdır! Çift tırnaklara ve kaçış karakterlerine dikkat et:

{
  "title": "H1 Ana Başlık: Tamamen dikkat çekici SEO uyumlu makale başlığı",
  "slug": "seo-uyumlu-cok-kisa-url-slug",
  "metaDescription": "Google'da çıkacak 150-160 karakterlik, tıklamaya teşvik eden meta açıklaması",
  "keywords": "konuyla ilgili virgülle ayrılmış 5-6 adet SEO anahtar kelimesi (yukarıdakileri de içerebilir)",
  "focusKeyword": "Bu makale için hedeflenen tek bir ana odak anahtar kelime",
  "categoryId": "Mevcut Kategoriler listesinden en uygun olanın id'si (yoksa boş string)",
  "authorId": "Mevcut Yazarlar listesinden en uygun yazarın id'si (yoksa boş string)",
  "content": "<h2>...</h2><p class='text-lg'>...</p>",
  "personalExperience": "Bizzat yaşanmış hissi veren, blog yazısıyla %100 uyumlu, samimi, 2-3 cümlelik bir kişisel anekdot veya deneyim",
  "references": "Makaledeki konulara kanıt niteliğinde, güvenilir kaynak gösterimleri (örn: Diyanet İşleri Başkanlığı Hac Rehberi 2024, Wikipedia, vb)."
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

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: `Hata Detayı: ${error.message || 'Bilinmeyen hata'}` }, { status: 500 });
  }
}
