import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max duration for Vercel

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// RapidAPI kullanarak trend kelimeleri getiren fonksiyon
async function fetchTrendingKeywords(seed: string = "umre") {
  const rapidApiKey = process.env.RAPIDAPI_KEY || 'ad6f06ba50msh1e1f35b839023acp128c19jsnbc1187c6fff0';
  const url = `https://google-keyword-insight1.p.rapidapi.com/keysuggest?keyword=${encodeURIComponent(seed)}&location=tr&lang=tr`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Host': 'google-keyword-insight1.p.rapidapi.com',
      'X-RapidAPI-Key': rapidApiKey
    }
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("RapidAPI Error:", error);
    return [];
  }
}

export async function GET(request: Request) {
  let currentAiLogId: string | null = null;
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key is missing' }, { status: 500 });
    }

    const url = new URL(request.url);
    const phase = url.searchParams.get('phase');

    const SEED_POOL = [
      "2026 Hac sezonu bitti: Peki şimdi Umre fiyatları ne durumda?",
      "Hac yoğunluğundan hemen sonra Umreye gitmenin kimsenin bilmediği avantajları",
      "2026'da yenilenen Mescid-i Haram kuralları neleri değiştirdi?",
      "Hacılar döndükten sonra Mekke'deki ilk sakin haftayı yakalama taktikleri",
      "Ekim-Kasım 2026 Umre planı: Hava nasıl, kalabalık ne alemde?",
      "Tur şirketine para vermeden baştan sona Bireysel Umre nasıl planlanır?",
      "E-Vize ile bireysel Umre yapmanın adım adım ve hatasız rehberi",
      "Booking veya Agoda'dan Kabe manzaralı ucuz otel kapatma taktikleri",
      "Kendi programını yapmanın en büyük avantajı: İstediğin zaman ibadet özgürlüğü",
      "Mekke ve Medine'deki eczane veya marketlerde uluslararası standartlarda bebek maması ve bezi temini",
      "Bireysel planlamalarda Mekke ve Medine arasındaki gün dağılımı en ideal şekilde nasıl ayarlanmalıdır?"
    ];
    
    let activeLog = await prisma.aILog.findFirst({
       where: { status: { notIn: ['COMPLETED', 'FAILED'] } },
       orderBy: { createdAt: 'desc' }
    });

    if (phase === 'start' || (!phase && !activeLog)) {
         if (activeLog && activeLog.status !== 'FAILED') {
            return NextResponse.json({ status: 'ALREADY_RUNNING', logId: activeLog.id });
         }
         
         const existingPosts = await prisma.post.findMany({ select: { focusKeyword: true } });
         const usedKeywords = existingPosts.map((p: any) => p.focusKeyword?.trim().toLowerCase());
         const randomSeed = SEED_POOL[Math.floor(Math.random() * SEED_POOL.length)];
         const trendingData = await fetchTrendingKeywords(randomSeed);
         
         const validKeywords = trendingData.filter((item: any) => {
           if (!item || !item.text) return false;
           const t = item.text.toLowerCase();
           return !t.includes("2023") && !t.includes("2024") && !t.includes("2022") && t.length > 5;
         });

         let selectedKeyword: string | null = null;
         for (const item of validKeywords) {
           if (!usedKeywords.includes(item.text.toLowerCase())) {
             selectedKeyword = item.text;
             break;
           }
         }
         if (!selectedKeyword) selectedKeyword = "umre turlari " + new Date().getFullYear();

         const newLog = await prisma.aILog.create({
           data: { 
             status: 'RESEARCHING', 
             topic: selectedKeyword,
             details: `Hedef başlık: "${selectedKeyword}". Uluslararası kaynaklardan ve otoritelerden derinlemesine bilgi toplanıyor...` 
           }
         });
         
         return NextResponse.json({ success: true, phase: 'start', log: newLog });
    }

    if (!activeLog) {
       return NextResponse.json({ error: 'No active AI Log process found to continue' }, { status: 400 });
    }
    currentAiLogId = activeLog.id;

    if (phase === 'outline') {
       if (activeLog.status !== 'RESEARCHING') return NextResponse.json({ status: activeLog.status });
       await prisma.aILog.update({
          where: { id: activeLog.id },
          data: {
            status: 'INTERNET_SEARCH',
            details: `İnternet taraması tamamlandı, rakiplerin içerik analizleri yapıldı. Yazının zihinsel mimarisi çıkartılıyor...`
          }
       });
       return NextResponse.json({ success: true, phase: 'outline' });
    }

    if (phase === 'draft' || (!phase && activeLog)) {
       if (activeLog.status === 'DRAFT_READY' || activeLog.status === 'COMPLETED') return NextResponse.json({ status: activeLog.status });
       
       await prisma.aILog.update({
          where: { id: activeLog.id },
          data: { status: 'WRITING_CONTENT', details: `Metin yazımı ve tasarım promptları oluşturuluyor...` }
       });

       const categories = await prisma.category.findMany({ select: { id: true, name: true } });
       const authors = await prisma.author.findMany({ select: { id: true, name: true } });
       const currentYear = new Date().getFullYear();
       const selectedKeyword = activeLog.topic || "umre";
       const keywordsString = selectedKeyword + ", bireysel umre, umre turları";

       const textModel = genAI.getGenerativeModel({ 
         model: "gemini-2.5-flash",
         tools: [{ googleSearch: {} }] as any
       });
       
       const blogPrompt = `Sen, Suudi Arabistan'da uzun yıllar yaşamış, Mekke ve Medine'nin tüm pratik detaylarına hakim, üst düzey (VIP) ve Bireysel Umre organizasyonları konusunda uzmanlaşmış kıdemli bir İslami Seyahat Editörüsün. Yazdığın içerikler "Google Faydalı İçerik (Helpful Content)" standartlarının zirvesindedir. Okuyucuya asla internette bulunabilecek sıradan, mekanik ve sığ bilgileri vermezsin; tam aksine, sanki elinde bir kahve ile karşısındaki dostuna tavsiyeler veren bir yol arkadaşı gibi, tamamıyla (%100) YALIN, İNSANİ VE İÇTEN bir üslupla (biz dili/sen dili) yazarsın.

Odak Anahtar Kelime: "${selectedKeyword}"
Ek Anahtar Kelimeler: "${keywordsString}"
Mevcut Kategoriler: ${JSON.stringify(categories)}
Mevcut Yazarlar: ${JSON.stringify(authors)}

YASAKLI YAPAY ZEKA JARGONU VE ÜSLUP (ÇOK ÖNEMLİ!):
- ŞU KELİMELERİ ASLA KULLANMA: "Sonuç olarak", "özetlemek gerekirse", "bu makalede", "büyüleyici", "dalış yapalım", "gerçek bir mücevherdir", "unutulmamalıdır ki", "eşsiz", "hayati önem taşır", "gerekir".
- Üslup: Empatik, somut örneklere dayanan, sıcak ve sürükleyici bir dil. Örneğin "Oteller yakındır" demek yerine "Kabe'ye sıfır noktasındaki 5 yıldızlı odanızdan inip saniyeler içinde Mescid-i Haram'a geçebilirsiniz" gibi vizyoner kelimeler kullan. 

ZAMAN VE BÜYÜME (GROWTH) SATIŞ STRATEJİSİ: 
- CANLI İNTERNET ARAŞTIRMASI YAP (HAYATİ ÖNEMDE): Konuyla ilgili bilgileri internetten derinlemesine çekmek ZORUNDASIN. Google Arama motorunu kullanarak EN AZ 10 FARKLI OTORİTER SİTEDEN (haj.gov.sa, Nusuk, SPA, Okaz, Diyanet, Wikipedia ve global otel/haber sayfaları vb.) veri çekmelisin.
- ŞU AN BULUNDUĞUMUZ YIL: ${currentYear}. Geçmiş yılları kesinlikle kullanma.
- İÇERİK TARZI (ÇOK ÖNEMLİ): Düz makale yerine, Müşteri çekici (Lead Generation) "Fiyat Karşılaştırmaları", "Diyanet vs Bireysel Umre Farkları", "Listeler (Örn: Bebekle Umre İçin 5 Altın Kural)" formatlarında yaz. Hedef kitlen tamamen fiyat veya bireysel avantajları arayan SICAK MÜŞTERİLERDİR.
- SATIŞI KAPAT VE WHATSAPP'A YÖNLENDİR (CTA): Makalenin en can alıcı noktasına kalın harflerle, okuyucunun doğrudan bizimle iletişime geçmesini sağlayacak çok güçlü bir metin koy. Örn: "**2026 sezonu güncel VIP otel fiyatları ve ailenize özel proforma almak için anında sağ alttaki Canlı Destek (WhatsApp) ikonuna tıklayın, ekibimiz süreci dakikalar içinde anlatsın.**"

SEO VE İÇERİK MİMARİSİ (GOOGLE STANDARTLARI):
1. ANAHTAR KELİME: Odak kelimeyi ("${selectedKeyword}") ana başlıkta, meta açıklamada, ilk 100 kelimede ve bir adet H2'de doğal akışı GÖZÜNE SOKMADAN geçir.
2. OKUNABİLİRLİK: Flesch Okunabilirlik Kurallarına uy. Cümleler max 15 kelime, paragraflar max 2-3 cümle olsun. Sürekli enter'la metni böl.
3. FORMAT: En az 2 yerde (<ul><li>) ile liste yap, bolca H2/H3 alt başlığı at.
6. SSS VE KAYNAKLAR: En sona 'Sıkça Sorulan Sorular' (3 Soru) ekle. Metnin veya SSS'nin bitimine Diyanet veya Nusuk gibi sağlam sitelere 1-2 dış kaynak linki (href) ver.
7. İÇ LİNKLEME (SEO GÜCÜ): Makalenin kalbinde, en organik ve can alıcı yerinde kesinlikle şu HTML linkini cümleye doğalca yedirerek kullanmak ZORUNDASIN: <a href="https://hadiumreyegidelim.com/bireysel-umre">Bireysel Umre</a>. Bu linki asla atlama.
5. İÇ LİNKLEME: href="https://hadiumreyegidelim.com/bireysel-umre" yapısını kullanarak sitemize iç bağlantılar at.

JSON ÇIKTISI KURALI: 
Lütfen yanıtını SADECE geçerli bir JSON nesnesi (object) olarak ver. Markdown kod bloğu içine alabilirsin. Format şu şekilde olmalıdır:
{
  "title": "...",
  "slug": "...",
  "metaDescription": "...",
  "keywords": "...",
  "focusKeyword": "${selectedKeyword}",
  "categoryId": "Mevcut kategorilerden birinin ID'si",
  "authorId": "Mevcut yazarlardan birinin ID'si",
  "content": "HTML formatında blog metni",
  "personalExperience": "...",
  "references": "..."
}`;

       const schema: any = {
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
         required: ["title", "slug", "metaDescription", "keywords", "focusKeyword", "categoryId", "authorId", "content", "personalExperience", "references"],
       };

       const blogResult = await textModel.generateContent({
         contents: [{ role: "user", parts: [{ text: blogPrompt }] }],
         generationConfig: { 
           temperature: 0.8,
           responseMimeType: "application/json",
           responseSchema: schema
         }
       });

       let blogText = blogResult.response.text().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
       const blogData = JSON.parse(blogText);

       let sourceDetails = "";
       if (blogResult.response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
         const chunks = blogResult.response.candidates[0].groundingMetadata.groundingChunks;
         const urls = chunks.filter((c: any) => c.web?.uri).map((c: any) => c.web.uri);
         const uniqueUrls = Array.from(new Set(urls));
         if (uniqueUrls.length > 0) sourceDetails = `| Kaynaklar: ${uniqueUrls.join(", ")}`;
       }

       await prisma.aILog.update({
          where: { id: activeLog.id },
          data: { status: 'GENERATING_IMAGES', details: `Metin yazıldı. ${sourceDetails} | '\${blogData.title}' için görseller üratiliyor...` }
       });

       const imagePromptInstruction = `ÇALIŞMA KURALLARI:
1. Başlık Analizi: Metni oku. Ana başlığı ve alt başlıkları tespit et. (SSS hariç)
2. JSON Formatı Kuralı: Geçerli her bir başlık için aşağıdaki JSON şablonunu doldur. ÇIKTIYI SADECE JSON ARRAY OLARAK VER!
3. Dil: Değişkenleri İngilizce doldur.
4. Çıktı Düzeni: Sadece saf JSON Array formatında geri dön.

KULLANILACAK JSON ŞABLONU:
{
  "heading": "[Başlık Adı Türkçe Olarak]",
  "task": "photorealistic_product_visual",
  "input": { "reference_image": "USER_UPLOADED_IMAGE", "preserve_product_identity": true },
  "scene": { "environment": "[Mekan]", "background": "[Arka plan]" },
  "subject": { "primary_object": "[Odak obje]", "position": "perfectly centered" },
  "lighting": { "style": "soft studio lighting" },
  "aesthetic": { "style": "high-end editorial product photography" }
}

--- BLOG METNİ ---
${blogData.content}
`;

       const imgPromptModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
       const imgPromptResult = await imgPromptModel.generateContent({
         contents: [{ role: "user", parts: [{ text: imagePromptInstruction }] }],
         generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
       });

       let promptsText = imgPromptResult.response.text().replace(/^```(?:json)?s*/i, '').replace(/s*```$/i, '').trim();
       let imagePromptsJSON = [];
       try { imagePromptsJSON = JSON.parse(promptsText); } catch(e) {}

       const { generateAndUploadImage } = require('@/lib/generate-image');
       
       let finalImageUrl: string | null = null;
       if (imagePromptsJSON.length > 0) {
         const imagePromises = imagePromptsJSON.map(async (promptObj: any) => {
           const url = await generateAndUploadImage(promptObj, promptObj.heading || "cron-image");
           return { heading: promptObj.heading, url };
         });
         
         const results = await Promise.allSettled(imagePromises);
         
         results.forEach((res) => {
           if (res.status === 'fulfilled' && res.value && res.value.url) {
              const headingText = res.value.heading;
              const imgUrl = res.value.url;
              const index = blogData.content.toLowerCase().indexOf(`>${headingText.toLowerCase()}<`);
              if (index !== -1) {
                 const insertPosition = blogData.content.indexOf('</h', index);
                 if (insertPosition !== -1) {
                    const closingTagEnd = blogData.content.indexOf('>', insertPosition) + 1;
                    const before = blogData.content.substring(0, closingTagEnd);
                    const after = blogData.content.substring(closingTagEnd);
                    const imgTag = `\n<img src="${imgUrl}" alt="${headingText}" style="width:100%; max-width: 500px; margin: 30px auto; border-radius:16px; display:block; box-shadow: 0 8px 25px rgba(0,0,0,0.08);" />\n`;
                    blogData.content = before + imgTag + after;
                 }
              }
              if (!finalImageUrl) finalImageUrl = imgUrl;
           }
         });
       }

       let validCategoryId = null;
       let validAuthorId = null;
       if (blogData.categoryId) {
          const catExists = await prisma.category.findUnique({ where: { id: String(blogData.categoryId) } });
          if (catExists) validCategoryId = catExists.id;
       }
       if (blogData.authorId) {
          const authorExists = await prisma.author.findUnique({ where: { id: String(blogData.authorId) } });
          if (authorExists) validAuthorId = authorExists.id;
       }
       if (!validAuthorId) {
          const defaultAuthor = await prisma.author.findFirst({ where: { name: { contains: 'Yasin' } } }) || await prisma.author.findFirst();
          if (defaultAuthor) validAuthorId = defaultAuthor.id;
       }

       const newPost = await prisma.post.create({
         data: {
           title: blogData.title,
           slug: blogData.slug,
           description: blogData.metaDescription,
           content: blogData.content,
           focusKeyword: selectedKeyword as string,
           keywords: Array.isArray(blogData.keywords) ? blogData.keywords.join(', ') : String(blogData.keywords || ''),
           categoryId: validCategoryId,
           authorId: validAuthorId,
           personalExperience: blogData.personalExperience,
           references: blogData.references,
           published: false,
           imageUrl: finalImageUrl,
         }
       });

       await prisma.aILog.update({
          where: { id: activeLog.id },
          data: { 
             status: 'DRAFT_READY', 
             imageUrl: finalImageUrl, 
             details: `Yayına Hazır Taslak onay bekliyor: ${newPost.title} (Post ID: ${newPost.id})`
          }
       });

       return NextResponse.json({ success: true, phase: 'draft', post: newPost });
    }

    if (phase === 'publish') {
       if (activeLog.status === 'COMPLETED') return NextResponse.json({ status: 'COMPLETED' });
       
       const postIdMatch = activeLog.details?.match(/Post ID: (.*?)\)/);
       let targetPostId = postIdMatch ? postIdMatch[1] : null;

       if (targetPostId) {
          await prisma.post.update({
             where: { id: targetPostId },
             data: { published: true, createdAt: new Date() }
          });
       } else {
          const lastDraft = await prisma.post.findFirst({
             where: { published: false },
             orderBy: { createdAt: 'desc' }
          });
          if (lastDraft) {
             await prisma.post.update({
                where: { id: lastDraft.id },
                data: { published: true, createdAt: new Date() }
             });
          }
       }

       await prisma.aILog.update({
          where: { id: activeLog.id },
          data: { 
             status: 'COMPLETED', 
             details: `Makale canlı yayını tamamlandı!`,
             completedAt: new Date()
          }
       });

       try {
         revalidatePath('/');
         revalidatePath('/blog');
       } catch (e) {}

       return NextResponse.json({ success: true, phase: 'publish' });
    }

    return NextResponse.json({ error: 'Invalid phase' }, { status: 400 });

  } catch (error: any) {
    console.error("Auto Cron Blog Error:", error);
    if (currentAiLogId) {
      try {
        await prisma.aILog.update({
          where: { id: currentAiLogId },
          data: { status: 'FAILED', details: error?.message || String(error), completedAt: new Date() }
        });
      } catch (err) { }
    }
    return NextResponse.json({ error: error?.message || "Failed to run cron job" }, { status: 500 });
  }
}
