import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max duration for Vercel

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Trending keyword havuzu (Geliştirilebilir)
const TRENDING_KEYWORDS = [
  "bireysel umre nasıl yapılır",
  "diyanet umre fiyatları 2024",
  "umre ile hac arasındaki fark",
  "kadınlar mahremsiz umreye gidebilir mi",
  "umreye giderken alınması gerekenler",
  "çocukla umreye nasıl gidilir",
  "ihrama nasıl girilir",
  "sömestr umre turları",
  "ramazan umresi fiyatları",
  "3 aylar umresi",
  "umre vizesi nasıl alınır",
  "haramain hızlı tren bileti nasıl alınır",
  "mekke'de kabeye en yakın oteller",
  "umrenin farzları nelerdir",
  "taksitle umre turları"
];

export async function GET(request: Request) {
  try {
    // 1. GÜVENLİK KONTROLÜ (Cron Secret)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key is missing' }, { status: 500 });
    }

    // 2. KONU SEÇİMİ
    // Veritabanındaki tüm odak kelimeleri alıp havuza uymayanları (yani hiç yazılmamış olanları) filtreleyelim.
    const existingPosts = await prisma.post.findMany({ select: { focusKeyword: true } });
    const usedKeywords = existingPosts.map(p => p.focusKeyword?.trim().toLowerCase());
    
    let selectedKeyword = null;
    for (const keyword of TRENDING_KEYWORDS) {
      if (!usedKeywords.includes(keyword.toLowerCase())) {
        selectedKeyword = keyword;
        break; // İlk yazılmamış kelimeyi al.
      }
    }

    // Eğer havuzdaki hepsi yazılmışsa rastgele bir tane seç (Tekrar döngüsüne girmemesi için isterseniz hata dönebilirsiniz)
    if (!selectedKeyword) {
      selectedKeyword = TRENDING_KEYWORDS[Math.floor(Math.random() * TRENDING_KEYWORDS.length)];
      console.warn("Tüm kelimeler bitmiş, rastgele tekrar seçiliyor:", selectedKeyword);
    }

    console.log("Seçilen Anahtar Kelime:", selectedKeyword);

    // Bütün kategorileri çek (AI'a referans için)
    const categories = await prisma.category.findMany({ select: { id: true, name: true } });
    // Bütün yazarları çek
    const authors = await prisma.author.findMany({ select: { id: true, name: true } });

    // 3. BLOG İÇERİĞİ ÜRETİMİ (Mevcut generate-blog mantığı)
    const textModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const blogPrompt = `Sen uzman bir SEO uzmanı ve umre/hac, maneviyat konularında profesyonel bir blog yazarısın. Yazılarını %100 bir insan yazmış gibi kurgulamalısın. SEMRUSH ve Google SEO standartlarını en üst düzeyde (Hedef: %100 Orjinallik, 58.9 Readability Skoru) karşılamalısın. Yapay zeka dedektörlerini aşmak için şu kurallara KESİNLİKLE uy:

Konu: "${selectedKeyword}"
Ek Anahtar Kelimeler: "bireysel umre, umre turları, hadiumreyegidelim, mekke, medine"
Mevcut Kategoriler: ${JSON.stringify(categories)}
Mevcut Yazarlar (E-E-A-T): ${JSON.stringify(authors)}

SEMRUSH OKUNABİLİRLİK (READABILITY) KURALLARI:
1. Çok Kısa Paragraflar: Her paragraf MAKSİMUM 2-3 cümle olmalıdır.
2. Basit, Kısa Kelimeler KULLAN.

SEO VE LİNK İNŞASI KURALLARI:
1. İÇ LİNKLEME: Yazının en sonuna ve akışa CTA (Çağrı) niteliğinde DİNAMİK HTML <a href="..."> etiketleri koy (<a href="/bireysel-umre">Bireysel umre</a> vb.).
2. HTML formatında içerik üret. Çift tırnak yerine tek tırnak kullan. H2 ve H3 kullan, H1 KULLANMA.

Lütfen çıktıyı EKSİKSİZ biçimde aşağıdaki JSON şemasına uygun olarak ver.`;

    const blogSchema: any = {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING },
        slug: { type: SchemaType.STRING },
        metaDescription: { type: SchemaType.STRING },
        keywords: { type: SchemaType.STRING },
        focusKeyword: { type: SchemaType.STRING },
        categoryId: { type: SchemaType.STRING },
        authorId: { type: SchemaType.STRING },
        content: { type: SchemaType.STRING },
        personalExperience: { type: SchemaType.STRING },
        references: { type: SchemaType.STRING }
      },
      required: ["title", "slug", "metaDescription", "keywords", "focusKeyword", "categoryId", "content"]
    };

    const blogResult = await textModel.generateContent({
      contents: [{ role: "user", parts: [{ text: blogPrompt }] }],
      generationConfig: { temperature: 0.8, responseMimeType: "application/json", responseSchema: blogSchema }
    });

    let blogText = blogResult.response.text().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const blogData = JSON.parse(blogText);

    // 4. GÖRSEL PROMPT ÜRETİMİ (NANOBANANA & IMAGEN KURALLARI)
    const imagePromptInstruction = `ÇALIŞMA KURALLARI:
1. Başlık Analizi: Sana verilen blog metnini oku. Yazının ana başlığını ve tüm alt başlıklarını tespit et.
2. SSS İstisnası: "Sıkça Sorulan Sorular", "SSS" veya "FAQ" başlıklarını ve bu başlıkların altındaki içerikleri KESİNLİKLE YOKSAY. Bunlar için prompt üretme.
3. JSON Formatı Kuralı: Geçerli her bir başlık için aşağıdaki JSON şablonunu eksiksiz doldur. Şablonun dışına çıkma, yeni anahtar (key) ekleme veya silme. ÇIKTIYI SADECE JSON ARRAY ([{}, {}]) OLARAK VER!
4. Dil: JSON içindeki değişkenleri İngilizce olarak, profesyonel fotoğrafçılık ve 3D render terimleri kullanarak doldur.
5. Kalite: Görseller lüks, estetik ve ticari bir atmosfere sahip olmalıdır. Odak ürün/konsept üzerinde olmalı, ışıklandırma zengin olmalıdır.
6. Çıktı Düzeni: Sadece saf JSON Array formatında geri dön. Başka hiçbir şey yazma.

KULLANILACAK JSON ŞABLONU (Her başlık için bunu üret ve listeye ekle):
{
  "heading": "[Başlık Adı Türkçe Olarak - Örn: Giriş veya İhram Nedir]",
  "task": "photorealistic_product_visual",
  "input": {
    "reference_image": "USER_UPLOADED_IMAGE",
    "preserve_product_identity": true,
    "preserve_label_text": true,
    "preserve_object_shape": true,
    "preserve_centered_composition": true
  },
  "scene": {
    "environment": "[Konsepte uygun mekan, örn: minimalist marble podium in a bright studio]",
    "background": "[Arka plan detayı, örn: soft blurred botanical leaves]",
    "negative_space": "[Boşluk oranı, örn: 30% negative space at the top]",
    "depth_of_field": "[Alan derinliği, örn: shallow depth of field, bokeh]"
  },
  "subject": {
    "primary_object": "[Başlığın anlattığı konsepte uygun odak objesi/ürün]",
    "position": "[Konumlandırma, örn: perfectly centered, eye-level angle]",
    "scale": "[Ölçek, örn: close-up macro shot]",
    "clarity": "ultra-sharp, high micro-contrast"
  },
  "human_elements": {
    "details": "[Eğer başlık gerektiriyorsa 'elegant female hand holding the product', gerektirmiyorsa 'none']"
  },
  "optical_effects": {
    "details": "[Efektler, örn: subtle morning mist, veya 'none']"
  },
  "lighting": {
    "style": "[Işık stili, örn: soft studio lighting, cinematic rim light]",
    "direction": "[Işık yönü, örn: soft directional light from top left]",
    "shadows": "[Gölge karakteristiği, örn: sharp dramatic shadows veya soft diffused shadows]",
    "highlights": "[Parlama, örn: subtle specular highlights on the surface]"
  },
  "materials_rendering": {
    "product_surface": "[Materyal, örn: matte frosted glass, glossy metallic accents]",
    "reflections": "[Yansıma, örn: soft reflection on a glass base]"
  },
  "aesthetic": {
    "mood": "[Duygu, örn: luxurious, clinical, pure, dynamic]",
    "style": "high-end editorial product photography",
    "color_palette": "[Konsepte uygun renkler, örn: white, soft gold, sage green]"
  },
  "camera": {
    "lens": "[Lens, örn: 85mm macro lens, 50mm prime]",
    "aperture": "[Diyafram, örn: f/2.8, f/1.4]",
    "angle": "[Açı, örn: slight high angle, front view]"
  },
  "post_processing": {
    "retouching": "luxury commercial polish",
    "color_grading": "[Renk düzenlemesi, örn: cinematic teal and orange, clean pure whites]"
  },
  "output": {
    "resolution": "ultra_high_resolution",
    "focus_priority": "product only"
  }
}

--- BLOG METNİ ---
BAŞLIK: ${blogData.title}
İÇERİK:
${blogData.content}
`;

    const imgPromptModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const imgPromptResult = await imgPromptModel.generateContent({
      contents: [{ role: "user", parts: [{ text: imagePromptInstruction }] }],
      generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
    });

    let promptsText = imgPromptResult.response.text().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const imagePromptsJSON = JSON.parse(promptsText);

    // TODO: İleride bu JSON çıktıları kullanılarak gerçek görsel üretimi APIsine ('nanobanana') istek atılıp imageUrl elde edilebilir. 
    // Şimdilik sistemin çalışması için promtu string olarak DB'ye ekliyoruz ve imageUrl'i null (veya placeholder) geçiyoruz.
    
    // 5. VERİTABANI KAYDI
    // Prisma modelimizde "imagePrompts" sütunu eklenecektir veya extraData gibi bir alanda da tutulabilir.
    const newPost = await prisma.post.create({
      data: {
        title: blogData.title,
        slug: blogData.slug + '-' + Date.now(), // Benzersiz olması için
        description: blogData.metaDescription,
        content: blogData.content,
        focusKeyword: selectedKeyword,
        keywords: blogData.keywords,
        categoryId: blogData.categoryId || null,
        authorId: blogData.authorId || null,
        personalExperience: blogData.personalExperience,
        references: blogData.references,
        published: true, // Otomatik yayına al
        imageUrl: null, // Görsel şimdilik boş
        imagePrompts: JSON.stringify(imagePromptsJSON), // Modelde bu yeni eklenecek sütun
      }
    });

    return NextResponse.json({ success: true, post: newPost, generatedPromptsCount: imagePromptsJSON.length });

  } catch (error: any) {
    console.error("Auto Cron Blog Error:", error);
    return NextResponse.json({ error: error.message || "Failed to run cron job" }, { status: 500 });
  }
}
