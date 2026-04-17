import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { generateAndUploadImage } from '@/lib/generate-image';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Claude — blog yazımı ve görsel prompt üretimi için
const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Gemini — sadece görsel prompt JSON'unu structured çıktı olarak almak için (opsiyonel fallback)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SEED_POOL = [
  "2026 hac sonrası umre fiyatları",
  "bireysel umre nasıl planlanır",
  "umre vizesi nasıl alınır 2026",
  "mekke otel tavsiye kabe yakını",
  "medine ziyaret rehberi",
  "umre hazırlık listesi",
  "umre için en iyi ay",
  "bireysel umre avantajları tur şirketine gerek yok",
  "suudi arabistan seyahat ipuçları",
  "umre maliyeti 2026 gerçekçi bütçe",
];

// 429 / 503 hatalarında bekleyip tekrar dener
async function retryable<T>(fn: () => Promise<T>, label = ''): Promise<T> {
  const MAX = 5;
  let lastErr: any;
  for (let i = 1; i <= MAX; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const msg: string = err?.message ?? '';
      if (msg.includes('429') || msg.includes('503') || msg.includes('overloaded')) {
        console.warn(`[auto-blog] ${label} retry ${i}/${MAX}: ${msg}`);
        await new Promise(r => setTimeout(r, i * 4000));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

// Ham metinden ilk { ... } bloğunu çıkarır
function extractJsonObject(raw: string): any {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error(`JSON objesi bulunamadı. İlk 300 karakter: ${raw.slice(0, 300)}`);
  return JSON.parse(raw.slice(start, end + 1));
}

// Ham metinden ilk [ ... ] bloğunu çıkarır
function extractJsonArray(raw: string): any[] {
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start === -1 || end <= start) return [];
  try { return JSON.parse(raw.slice(start, end + 1)); } catch { return []; }
}

// Başlıkların kapanış tag'ından hemen sonra resim tag'i ekler
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

async function fetchTrendingKeywords(seed: string): Promise<string[]> {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return [];
  try {
    const res = await fetch(
      `https://google-keyword-insight1.p.rapidapi.com/keysuggest?keyword=${encodeURIComponent(seed)}&location=tr&lang=tr`,
      { headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': 'google-keyword-insight1.p.rapidapi.com' } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data)
      ? data.filter((d: any) => d?.text && d.text.length > 4).map((d: any) => d.text as string)
      : [];
  } catch (e) {
    console.error('[auto-blog] RapidAPI error:', e);
    return [];
  }
}

// ─────────────────────────────────────────────
// Ana GET handler — Vercel Cron veya manuel trigger tarafından çağrılır
// ─────────────────────────────────────────────
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  if (process.env.AUTO_BLOG_ENABLED !== 'true') {
    return NextResponse.json({ success: true, message: 'Auto-blog devre dışı. AUTO_BLOG_ENABLED=true yapın.' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY eksik' }, { status: 500 });
  }

  // Halihazırda çalışan bir işlem varsa başlama
  const running = await prisma.aILog.findFirst({
    where: { status: { notIn: ['COMPLETED', 'FAILED'] } },
    orderBy: { createdAt: 'desc' },
  });
  if (running) {
    return NextResponse.json({ status: 'ALREADY_RUNNING', logId: running.id, topic: running.topic });
  }

  // ── Anahtar Kelime Seçimi ──────────────────
  const seed = SEED_POOL[Math.floor(Math.random() * SEED_POOL.length)];
  const trendingKeywords = await fetchTrendingKeywords(seed);

  const usedKeywords = new Set(
    (await prisma.post.findMany({ select: { focusKeyword: true } }))
      .map((p: any) => p.focusKeyword?.trim().toLowerCase())
      .filter(Boolean)
  );

  const validKeywords = trendingKeywords.filter(k => {
    const lower = k.toLowerCase();
    return (
      !usedKeywords.has(lower) &&
      !lower.includes('2022') &&
      !lower.includes('2023') &&
      !lower.includes('2024')
    );
  });
  const selectedKeyword = validKeywords[0] ?? `bireysel umre ${new Date().getFullYear()}`;

  // ── Log Oluştur ────────────────────────────
  const log = await prisma.aILog.create({
    data: {
      status: 'WRITING_CONTENT',
      topic: selectedKeyword,
      details: `"${selectedKeyword}" için Claude makale yazıyor...`,
    },
  });

  const setStatus = (status: string, details: string) =>
    prisma.aILog.update({ where: { id: log.id }, data: { status, details } }).catch(() => {});

  try {
    const currentYear = new Date().getFullYear();
    const [categories, authors] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true } }),
      prisma.author.findMany({ select: { id: true, name: true, expertise: true } }),
    ]);

    // ── FAZ 1: Claude ile blog içeriği yaz ────
    // claude-opus-4-6 veya claude-sonnet-4-6 kullanılabilir.
    // Kalite önceliği: opus. Hız/maliyet önceliği: sonnet.
    const blogPrompt = `Sen, Suudi Arabistan'da uzun yıllar yaşamış, Mekke ve Medine'nin tüm pratik detaylarına hakim, üst düzey (VIP) ve Bireysel Umre organizasyonlarında uzmanlaşmış kıdemli bir İslami Seyahat Editörüsün.

Odak Anahtar Kelime: "${selectedKeyword}"
Ek Anahtar Kelimeler: "${selectedKeyword}, bireysel umre, umre turları ${currentYear}"
Mevcut Kategoriler: ${JSON.stringify(categories)}
Mevcut Yazarlar: ${JSON.stringify(authors)}
Güncel Yıl: ${currentYear}

YAZIM KURALLARI:
- Cümle maksimum 15 kelime. Paragraf maksimum 3 cümle. Metni enterlarla sık böl.
- Üslup: Sıcak, samimi, somut bilgilerle dolu. Bir dostuna kahve içerken anlatır gibi.
- YASAKLI KELİMELER: "Sonuç olarak", "özetlemek gerekirse", "büyüleyici", "eşsiz", "hayati önem taşır", "unutulmamalıdır ki", "bu makalede"
- SOMUT BİLGİ: "Oteller yakındır" değil → "Kabe Kapısı'ndan çıkıp 3 dakikada odanıza ulaşırsınız"
- HTML içinde SADECE TEK TIRNAK (') kullan. Çift tırnak JSON yapısını bozar.
- Yılı papağan gibi tekrarlama. "${currentYear}" ifadesini sadece 1-2 kez kullan.
- Google Arama, Nusuk, Diyanet ve haj.gov.sa gibi kaynaklardan eğitim verilerindeki güncel bilgileri kullan.

ZORUNLU SEO YAPISI:
1. Odak kelimeyi H1 başlıkta, meta açıklamada, ilk 100 kelimede ve bir H2'de doğal akışla kullan.
2. En az 2 adet <ul><li> listesi, bolca H2 ve H3 başlıkları kullan.
3. İçeriğin can alıcı bir yerine şu linki göm: <a href='https://hadiumreyegidelim.com/bireysel-umre'>Bireysel Umre</a>
4. Son bölüme 3 soruluk SSS ekle (H2 "Sıkça Sorulan Sorular", her soru H3).
5. Makalenin en güçlü yerinde WhatsApp CTA: <strong>2026 VIP otel rezervasyonu ve kişisel proforma için sağ alttaki WhatsApp ikonuna tıklayın.</strong>

ÇIKTI KURALI: SADECE aşağıdaki formatta geçerli bir JSON objesi döndür. Başka hiçbir şey yazma, açıklama yapma, kod bloğu açma.
{
  "title": "...",
  "slug": "seo-uyumlu-tire-ile-ayrilmis-url",
  "metaDescription": "150-160 karakter arası",
  "keywords": "virgülle ayrılmış SEO kelimeleri",
  "focusKeyword": "${selectedKeyword}",
  "categoryId": "mevcut kategorilerden birinin id'si",
  "authorId": "mevcut yazarlardan birinin id'si",
  "content": "<p>...</p><h2>...</h2>...",
  "personalExperience": "Bizzat yaşanmış hissi veren 2-3 cümlelik yazar tecrübesi",
  "references": "kullanılan kaynak URL'leri veya site adları"
}`;

    const blogMessage = await retryable(
      () => claude.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 8000,
        messages: [{ role: 'user', content: blogPrompt }],
      }),
      'blog-yazımı'
    );

    const blogRawText = blogMessage.content[0].type === 'text' ? blogMessage.content[0].text : '';
    const blogData = extractJsonObject(blogRawText);

    // ── FAZ 2: Claude ile görsel promptları üret ──
    await setStatus('GENERATING_IMAGES', 'Görsel promptları hazırlanıyor...');

    const imgPromptMessage = await retryable(
      () => claude.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Blog metnindeki başlıklar için Imagen 4'e gönderilecek görsel üretim JSON array'i oluştur. "SSS" / "Sıkça Sorulan Sorular" başlığını ve altındakileri atla. SADECE JSON array döndür, başka hiçbir şey yazma.

Her başlık için şu şablonu kullan:
{"heading":"[Başlığın tam Türkçe hali]","subject":{"primary_object":"[İngilizce ana obje]"},"scene":{"environment":"[İngilizce mekan]"},"aesthetic":{"mood":"luxurious, serene, spiritual","color_palette":"warm gold, ivory, soft beige"},"lighting":{"style":"soft golden hour lighting"},"camera":{"lens":"35mm"}}

BLOG BAŞLIĞI: ${blogData.title}
BLOG İÇERİĞİ:
${blogData.content.slice(0, 4000)}`,
        }],
      }),
      'görsel-promptları'
    );

    const imgPromptRaw = imgPromptMessage.content[0].type === 'text' ? imgPromptMessage.content[0].text : '[]';
    const imagePrompts: any[] = extractJsonArray(imgPromptRaw);

    // ── FAZ 3: Imagen 4 ile görseller üret ve Supabase'e yükle (paralel) ──
    let finalImageUrl: string | null = null;

    if (imagePrompts.length > 0) {
      await setStatus('GENERATING_IMAGES', `${Math.min(imagePrompts.length, 5)} görsel paralel üretiliyor...`);

      const imageResults = await Promise.allSettled(
        imagePrompts.slice(0, 5).map(async (p: any) => ({
          heading: p.heading as string,
          url: await generateAndUploadImage(p, p.heading || 'umre-blog'),
        }))
      );

      const successImages = imageResults
        .filter((r): r is PromiseFulfilledResult<{ heading: string; url: string | null }> =>
          r.status === 'fulfilled' && r.value.url !== null
        )
        .map(r => ({ heading: r.value.heading, url: r.value.url as string }));

      if (successImages.length > 0) {
        blogData.content = injectImages(blogData.content, successImages);
        finalImageUrl = successImages[0].url;
      }
    }

    // ── FAZ 4: Kategori ve Yazar ID'lerini doğrula ──
    let validCategoryId: string | null = null;
    let validAuthorId: string | null = null;

    if (blogData.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: String(blogData.categoryId) } });
      if (cat) validCategoryId = cat.id;
    }
    if (blogData.authorId) {
      const author = await prisma.author.findUnique({ where: { id: String(blogData.authorId) } });
      if (author) validAuthorId = author.id;
    }
    if (!validAuthorId) {
      const fallback =
        (await prisma.author.findFirst({ where: { name: { contains: 'Yasin' } } })) ??
        (await prisma.author.findFirst());
      if (fallback) validAuthorId = fallback.id;
    }

    // Slug çakışmasını önle
    let slug = blogData.slug || selectedKeyword.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    // ── FAZ 5: Kaydet ve yayınla ──
    const post = await prisma.post.create({
      data: {
        title: blogData.title,
        slug,
        description: blogData.metaDescription,
        content: blogData.content,
        focusKeyword: selectedKeyword,
        keywords: Array.isArray(blogData.keywords)
          ? blogData.keywords.join(', ')
          : String(blogData.keywords || ''),
        categoryId: validCategoryId,
        authorId: validAuthorId,
        personalExperience: blogData.personalExperience,
        references: blogData.references,
        imageUrl: finalImageUrl,
        published: true,
      },
    });

    await prisma.aILog.update({
      where: { id: log.id },
      data: {
        status: 'COMPLETED',
        details: `Yayınlandı: "${post.title}"`,
        imageUrl: finalImageUrl,
        completedAt: new Date(),
      },
    });

    try {
      revalidatePath('/');
      revalidatePath('/blog');
    } catch {}

    return NextResponse.json({
      success: true,
      post: { id: post.id, title: post.title, slug: post.slug },
    });

  } catch (err: any) {
    console.error('[auto-blog] Pipeline hatası:', err);
    await prisma.aILog.update({
      where: { id: log.id },
      data: {
        status: 'FAILED',
        details: err?.message ?? String(err),
        completedAt: new Date(),
      },
    }).catch(() => {});

    return NextResponse.json({ error: err?.message ?? 'Pipeline hatası' }, { status: 500 });
  }
}
