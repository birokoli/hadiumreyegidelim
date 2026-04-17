import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateAndUploadImage } from '@/lib/generate-image';

export const maxDuration = 120;

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

function extractJsonObject(raw: string): any {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error(`AI geçerli JSON döndürmedi. İlk 300 karakter: ${raw.slice(0, 300)}`);
  return JSON.parse(raw.slice(start, end + 1));
}

function extractJsonArray(raw: string): any[] {
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start === -1 || end <= start) return [];
  try { return JSON.parse(raw.slice(start, end + 1)); } catch { return []; }
}

function injectImages(html: string, images: { heading: string; url: string }[]): string {
  for (const { heading, url } of images) {
    const idx = html.toLowerCase().indexOf(`>${heading.toLowerCase()}<`);
    if (idx === -1) continue;
    const closeH = html.indexOf('</h', idx);
    if (closeH === -1) continue;
    const closeEnd = html.indexOf('>', closeH) + 1;
    const img = `\n<img src="${url}" alt="${heading}" style="width:100%;max-width:800px;margin:28px auto;border-radius:14px;display:block;box-shadow:0 6px 24px rgba(0,0,0,0.1);" loading="lazy" />\n`;
    html = html.slice(0, closeEnd) + img + html.slice(closeEnd);
  }
  return html;
}

export async function POST(request: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY tanımlı değil.' }, { status: 500 });
    }

    const { topic, keywords, categories, authors } = await request.json();
    if (!topic) return NextResponse.json({ error: 'Konu (topic) zorunludur.' }, { status: 400 });

    const currentYear = new Date().getFullYear();

    // ── FAZ 1: Claude ile blog yaz ────────────
    const blogPrompt = `Sen, Suudi Arabistan'da uzun yıllar yaşamış, Mekke ve Medine'nin tüm pratik detaylarına hakim, üst düzey (VIP) ve Bireysel Umre organizasyonlarında uzmanlaşmış kıdemli bir İslami Seyahat Editörüsün.

Konu: "${topic}"
Ek Anahtar Kelimeler: "${keywords || ''}"
Mevcut Kategoriler: ${JSON.stringify(categories || [])}
Mevcut Yazarlar: ${JSON.stringify(authors || [])}
Güncel Yıl: ${currentYear}

YAZIM KURALLARI:
- Cümle maksimum 15 kelime. Paragraf maksimum 3 cümle. Metni enterlarla sık böl.
- Üslup: Sıcak, samimi, somut bilgilerle dolu. Bir dostuna kahve içerken anlatır gibi.
- YASAKLI KELİMELER: "Sonuç olarak", "özetlemek gerekirse", "büyüleyici", "eşsiz", "hayati önem taşır", "unutulmamalıdır ki"
- SOMUT BİLGİ: "Oteller yakındır" değil → "Kabe Kapısı'ndan çıkıp 3 dakikada odanıza ulaşırsınız"
- HTML içinde SADECE TEK TIRNAK (') kullan. Çift tırnak JSON yapısını bozar.
- Diyanet veya diğer tur şirketleri yerine "Hadi Umreye Gidelim" Bireysel Umre paketlerinin VIP konforunu ön plana çıkar.

ZORUNLU SEO YAPISI:
1. Odak kelimeyi ana başlıkta, meta açıklamada, ilk 100 kelimede ve bir H2'de doğal akışla kullan.
2. En az 2 <ul><li> listesi, bolca H2 ve H3 başlıkları.
3. İçeriğin can alıcı bir yerine şu linki göm: <a href='https://hadiumreyegidelim.com/bireysel-umre'>Bireysel Umre</a>
4. Son bölüme 3 soruluk SSS ekle.
5. Güçlü bir WhatsApp CTA: <strong>VIP otel fiyatları ve kişisel proforma için sağ alttaki WhatsApp ikonuna tıklayın.</strong>

ÇIKTI KURALI: SADECE geçerli bir JSON objesi döndür. Başka hiçbir şey yazma.
{
  "title": "...",
  "slug": "seo-uyumlu-url",
  "metaDescription": "150-160 karakter",
  "keywords": "virgülle ayrılmış SEO kelimeleri",
  "focusKeyword": "${topic}",
  "categoryId": "mevcut kategorilerden id",
  "authorId": "mevcut yazarlardan id",
  "content": "<p>...</p><h2>...</h2>...",
  "personalExperience": "2-3 cümlelik samimi yazar tecrübesi",
  "references": "kullanılan kaynak adları veya URL'ler"
}`;

    const blogMessage = await claude.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 8000,
      messages: [{ role: 'user', content: blogPrompt }],
    });

    const blogRaw = blogMessage.content[0].type === 'text' ? blogMessage.content[0].text : '';
    const parsedData = extractJsonObject(blogRaw);

    // ── FAZ 2: Claude ile görsel promptları üret ──
    const imgPromptMessage = await claude.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `Blog metnindeki başlıklar için Imagen 4'e gönderilecek görsel üretim JSON array'i oluştur. "SSS" başlığını atla. SADECE JSON array döndür.

Her başlık için şu şablonu kullan:
{"heading":"[Başlığın tam Türkçe hali]","subject":{"primary_object":"[İngilizce]"},"scene":{"environment":"[İngilizce]"},"aesthetic":{"mood":"luxurious, serene, spiritual","color_palette":"warm gold, ivory, soft beige"},"lighting":{"style":"soft golden hour lighting"},"camera":{"lens":"35mm"}}

BLOG BAŞLIĞI: ${parsedData.title}
BLOG İÇERİĞİ:
${parsedData.content.slice(0, 4000)}`,
      }],
    });

    const imgPromptRaw = imgPromptMessage.content[0].type === 'text' ? imgPromptMessage.content[0].text : '[]';
    const imagePromptsJSON: any[] = extractJsonArray(imgPromptRaw);
    parsedData.imagePrompts = JSON.stringify(imagePromptsJSON);

    // ── FAZ 3: Imagen 4 ile görseller üret (paralel) ──
    if (imagePromptsJSON.length > 0) {
      const imageResults = await Promise.allSettled(
        imagePromptsJSON.slice(0, 5).map(async (p: any) => ({
          heading: p.heading as string,
          url: await generateAndUploadImage(p, p.heading || 'blog-image'),
        }))
      );

      const successImages = imageResults
        .filter((r): r is PromiseFulfilledResult<{ heading: string; url: string | null }> =>
          r.status === 'fulfilled' && r.value.url !== null
        )
        .map(r => ({ heading: r.value.heading, url: r.value.url as string }));

      if (successImages.length > 0) {
        parsedData.content = injectImages(parsedData.content, successImages);
        if (!parsedData.imageUrl) parsedData.imageUrl = successImages[0].url;
      }
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('[generate-blog] Hata:', error);
    return NextResponse.json({ error: 'Hata: ' + (error.message || 'Bilinmeyen hata') }, { status: 500 });
  }
}
