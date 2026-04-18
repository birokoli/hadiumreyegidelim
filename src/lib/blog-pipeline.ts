import { revalidatePath } from 'next/cache';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { generateAndUploadImage } from '@/lib/generate-image';

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Keyword Clusters ─────────────────────────────────────────────────────────
export const KEYWORD_CLUSTERS: Record<string, string[]> = {
  seasonal: [
    'ramazan umresi nasıl yapılır 2026',
    'ramazan ayında umre fiyatları',
    'ramazan son on gün mekke deneyimi',
    'kadir gecesi mescid-i haram nasıl',
    'hac sonrası umre yapılır mı',
    'hac umre birleştirme rehberi 2026',
    'şaban ayında umre sevabı',
    'recep ayında umre yapılır mı',
    'kurban bayramı döneminde umre',
    'arefe günü tavaf deneyimi',
  ],
  budget: [
    'ucuz umre paketleri 2026',
    'en uygun umre nasıl yapılır',
    'umre maliyeti 2026 gerçekçi hesaplama',
    'umre ne kadar tutar dolar bazlı',
    'bütçe dostu umre planı adımları',
    'ucuz mekke uçak bileti nasıl alınır',
    'ekonomik umre otel seçimi',
    'umre bütçesi nasıl planlanır',
  ],
  diy: [
    'bireysel umre nasıl yapılır adım adım',
    'diyanetsiz umre mümkün mü',
    'kendi imkanlarıyla umre organizasyonu',
    'tur şirketi olmadan umre',
    'nusuk uygulaması umre başvurusu nasıl',
    'suudi arabistan e-vize başvurusu 2026',
    'bireysel umre izni alma rehberi',
    'umre için mahrem şartı 2026',
  ],
  hotel: [
    'mekke kabe yakını otel seçimi',
    'mescid-i harama en yakın oteller hangisi',
    'medine otel seçimi ravza yakını',
    'mekke 5 yıldızlı otel karşılaştırması 2026',
    'medine mescid-i nebevi yürüme mesafesi otel',
    'umrede otel seçimi nelere dikkat',
    'mekke otel tavsiye 2026',
  ],
  practical: [
    'umre hazırlık listesi eksiksiz 2026',
    'umre kıyafetleri ne giyilir erkek kadın',
    'ihram nasıl giyilir niyet duası',
    'tavaf nasıl yapılır yedi şavt',
    "sa'y safa merve nasıl koşulur",
    'zemzem suyu içme adabı faydaları',
    'mekke medine arası ulaşım seçenekleri',
    "mekke'de dikkat edilmesi gerekenler",
    'umre duaları türkçe anlam',
    'haramein uygulaması kullanımı',
  ],
  family: [
    'çocukla umre kaç yaşında gidilebilir',
    'aile umresi organizasyonu nasıl yapılır',
    'yaşlı anne baba ile umre rehberi',
    'ilk kez umre gidenler için tam rehber',
    'engelli umre hizmetleri mescid-i haram',
    'hamileyken umre gidilir mi',
  ],
  destination: [
    'mescid-i haram ziyaret rehberi',
    'kabe tarihi ve mimari',
    'zemzem kuyusu nerede tarihi',
    'mina çadır şehri nedir hac',
    'arafat dağı ve miktad önemi',
    'uhud dağı şehitler ziyareti',
    'medine ziyaret edilecek yerler',
    'mekke tarihi mekanlar turu',
    'cennetül baki ziyaret rehberi',
    'efendimiz in kabrini ziyaret adabı',
  ],
  vip: [
    'vip umre paketi özellikleri nedir',
    'lüks umre organizasyonu farkı',
    'özel rehberle umre deneyimi',
    'butik umre neden tercih edilmeli',
    'aile özel umre organizasyonu',
  ],
  visa: [
    'umre vizesi nasıl alınır 2026',
    'suudi arabistan turist vizesi umre',
    'nusuk platformu kayıt rehberi',
    'umre vizesi kaç günde çıkar 2026',
    'umre vize reddi nedenleri çözüm',
    'e-vize vs umre vizesi fark',
  ],
  cities: [
    "istanbul'dan bireysel umre organizasyonu",
    "ankara'dan mekke uçuş seçenekleri",
    "türkiye'den umre nasıl gidilir",
    'thy mekke uçuş saatleri 2026',
    'pegasus umre uçuşları',
  ],
  comparison: [
    'bireysel umre vs tur şirketi karşılaştırma',
    'umre grupla mı bireysel mi daha iyi',
    'özel umre vs diyanet turu farklar',
    'umre ve hac arasındaki farklar',
    'umre kaç kere yapılabilir sevabı',
  ],
};

// ─── Yardımcılar ──────────────────────────────────────────────────────────────
async function retryable<T>(fn: () => Promise<T>, label = ''): Promise<T> {
  const MAX = 4;
  let lastErr: any;
  for (let i = 1; i <= MAX; i++) {
    try { return await fn(); }
    catch (err: any) {
      lastErr = err;
      const msg: string = err?.message ?? '';
      if (msg.includes('429') || msg.includes('503') || msg.includes('overloaded')) {
        console.warn(`[blog-pipeline] ${label} retry ${i}/${MAX}: ${msg}`);
        await new Promise(r => setTimeout(r, i * 5000));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

function extractJsonObject(raw: string): any {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error(`JSON bulunamadı: ${raw.slice(0, 200)}`);
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
    const imgTag = `\n<img src="${url}" alt="${heading} — Umre Rehberi" style="width:100%;max-width:820px;margin:24px auto 32px;border-radius:16px;display:block;box-shadow:0 8px 32px rgba(0,0,0,0.12);" loading="lazy" />\n`;
    html = html.slice(0, closeEnd) + imgTag + html.slice(closeEnd);
  }
  return html;
}

async function fetchRapidApiKeywords(seed: string): Promise<string[]> {
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
      ? data.filter((d: any) => d?.text && d.text.length > 5).slice(0, 15).map((d: any) => d.text as string)
      : [];
  } catch { return []; }
}

export async function getCompletedBlogsToday(): Promise<number> {
  const now = new Date();
  const turkeyOffset = 3 * 60 * 60 * 1000;
  const turkeyNow = new Date(now.getTime() + turkeyOffset);
  const todayStart = new Date(Date.UTC(
    turkeyNow.getUTCFullYear(), turkeyNow.getUTCMonth(), turkeyNow.getUTCDate(), 0, 0, 0
  ) - turkeyOffset);
  return prisma.aILog.count({ where: { status: 'COMPLETED', createdAt: { gte: todayStart } } });
}

export async function selectKeywordCluster(usedFocusKeywords: Set<string>): Promise<{ cluster: string; keyword: string }> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentLogs = await prisma.aILog.findMany({
    where: { status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } },
    select: { topic: true },
  });
  const recentTopics = new Set(recentLogs.map(l => l.topic?.toLowerCase()).filter(Boolean));

  const clusterScores: { cluster: string; available: string[] }[] = [];
  for (const [cluster, keywords] of Object.entries(KEYWORD_CLUSTERS)) {
    const available = keywords.filter(k => {
      const kl = k.toLowerCase();
      return !usedFocusKeywords.has(kl) && !recentTopics.has(kl);
    });
    if (available.length > 0) clusterScores.push({ cluster, available });
  }

  if (clusterScores.length === 0) {
    const allKeywords = Object.values(KEYWORD_CLUSTERS).flat().filter(k => !usedFocusKeywords.has(k.toLowerCase()));
    const kw = allKeywords[Math.floor(Math.random() * allKeywords.length)] ?? `bireysel umre ${new Date().getFullYear()}`;
    return { cluster: 'general', keyword: kw };
  }

  clusterScores.sort((a, b) => b.available.length - a.available.length);
  const chosen = clusterScores[Math.floor(Math.random() * Math.min(3, clusterScores.length))];
  const keyword = chosen.available[Math.floor(Math.random() * chosen.available.length)];
  return { cluster: chosen.cluster, keyword };
}

// ─── Ana Pipeline Fonksiyonu ──────────────────────────────────────────────────
// logId: trigger-ai tarafından önceden oluşturulmuş log kaydının id'si
export async function runBlogPipeline(logId: string): Promise<void> {
  const setStatus = (status: string, details: string) =>
    prisma.aILog.update({ where: { id: logId }, data: { status, details } }).catch(() => {});

  try {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY eksik');

    const usedFocusKeywords = new Set(
      (await prisma.post.findMany({ select: { focusKeyword: true } }))
        .map((p: any) => p.focusKeyword?.trim().toLowerCase())
        .filter(Boolean) as string[]
    );

    const { cluster, keyword: seedKeyword } = await selectKeywordCluster(usedFocusKeywords);

    // Log'u keyword ile güncelle
    await prisma.aILog.update({
      where: { id: logId },
      data: {
        topic: seedKeyword,
        details: `"${seedKeyword}" için araştırma başlıyor... (Cluster: ${cluster})`,
        status: 'INTERNET_SEARCH',
      },
    });

    const trendingKws = await fetchRapidApiKeywords(seedKeyword);
    const lsiKeywords = trendingKws
      .filter(k => !usedFocusKeywords.has(k.toLowerCase()) && k.toLowerCase() !== seedKeyword.toLowerCase())
      .slice(0, 8).join(', ');

    const currentYear = new Date().getFullYear();
    const [categories, authors] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true } }),
      prisma.author.findMany({ select: { id: true, name: true, expertise: true } }),
    ]);

    // ── FAZ 1: Blog İçeriği ───────────────────────────────────────────────
    await setStatus('WRITING_CONTENT', `Claude Opus "${seedKeyword}" için yazıyor...`);

    const blogPrompt = `Sen, 15 yıldır Suudi Arabistan'da yaşayan, Mekke-Medine'yi bir avucunun içi gibi bilen, bireysel ve VIP umre organizasyonlarında uzmanlaşmış bir İslami Seyahat Editörüsün. Samimi, sıcak, ve verdiği bilgilerle fark yaratan bir kalem sahibisin.

ODAK ANAHTAR KELİME: "${seedKeyword}"
LSI / DESTEK KELİMELER: ${lsiKeywords || 'bireysel umre, umre organizasyonu ' + currentYear}
MEVCUT KATEGORİLER: ${JSON.stringify(categories)}
MEVCUT YAZARLAR: ${JSON.stringify(authors)}
GÜNCEL YIL: ${currentYear}
KONU CLUSTER'I: ${cluster}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GOOGLE E-E-A-T STANDARTLARI (KESİNLİKLE UYGULANACAK)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ DENEYİM: "Misafirlerimizden öğrendik ki...", somut gözlemler, spesifik detaylar
■ UZMANLIK: rakamlar (metre, USD, gün), prosedürel detay, platform isimleri
■ OTORİTE: haj.gov.sa ve nusuk.sa'ya MUTLAKA link ver (HTML'de tek tırnak)
■ GÜVENİLİRLİK: güncel ${currentYear} bilgileri, belirsizse "yaklaşık" de

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
İÇERİK YAPISI (ZORUNLU)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. H1: Odak kelime başta, 55-65 karakter
2. Giriş: 80-100 kelime, odak kelime ilk cümlede
3. İçindekiler: <nav id='toc'><ul><li><a href='#bolum-1'>...</a></li>...</ul></nav>
4. En az 4 H2 (id='bolum-N'), her biri altında 1-3 H3, toplam 1800-2500 kelime
5. En az 3 adet <ul> veya <ol>
6. 1 adet <table> veya bilgi kutusu
7. İÇ LİNKLER (3 ADET — doğal bağlamda):
   <a href='/bireysel-umre'>bireysel umre planlama rehberimiz</a>
   <a href='/paketler'>umre paket seçeneklerimiz</a>
   <a href='/rehber'>uzman umre rehberlerimiz</a>
8. DIŞ LİNKLER (2 ADET):
   <a href='https://nusuk.sa' target='_blank' rel='noopener noreferrer'>Nusuk platformu</a>
   <a href='https://www.haj.gov.sa/tr' target='_blank' rel='noopener noreferrer'>Hac ve Umre Bakanlığı</a>
9. WhatsApp CTA:
   <div style='background:#25D366;color:white;padding:16px 20px;border-radius:12px;margin:28px 0;'>
   <strong>📱 Kişisel Umre Planınız İçin:</strong> ${currentYear} tarihlerine göre ücretsiz danışmanlık için sağ alttaki WhatsApp butonuna tıklayın.
   </div>
10. SSS: <h2 id='sss'>Sıkça Sorulan Sorular</h2> + 4 adet H3 soru + 2-3 cümle cevap

YASAKLI: "Sonuç olarak", "özetlemek", "büyüleyici", "eşsiz", "hayati önem", "bu makalede"
HTML'de SADECE TEK TIRNAK (') kullan.

ÇIKTI: SADECE JSON objesi, başka hiçbir şey:
{
  "title": "...",
  "slug": "seo-uyumlu-url",
  "metaDescription": "150-160 karakter",
  "keywords": "8-12 adet virgülle",
  "focusKeyword": "${seedKeyword}",
  "categoryId": "...",
  "authorId": "...",
  "content": "<p>...</p>...",
  "personalExperience": "2-3 cümle yazar deneyimi",
  "references": "haj.gov.sa, nusuk.sa"
}`;

    const blogMessage = await retryable(
      () => claude.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 10000,
        messages: [{ role: 'user', content: blogPrompt }],
      }),
      'blog-yazımı'
    );

    const blogRaw = blogMessage.content[0].type === 'text' ? blogMessage.content[0].text : '';
    const blogData = extractJsonObject(blogRaw);

    // ── FAZ 2: Görsel Promptları ──────────────────────────────────────────
    await setStatus('GENERATING_IMAGES', 'Görseller hazırlanıyor...');

    const imgPromptMessage = await retryable(
      () => claude.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Blog H2 başlıkları için Imagen 4 promptları JSON array olarak üret. SSS hariç max 4 başlık. SADECE JSON array:
{"heading":"[Türkçe]","subject":{"primary_object":"[EN]"},"scene":{"environment":"[EN]"},"aesthetic":{"mood":"spiritual, luxurious","color_palette":"warm gold, ivory","style":"high-end travel photography"},"lighting":{"style":"soft golden hour"},"camera":{"lens":"35mm"}}

BAŞLIK: ${blogData.title}
H2'LER:
${(blogData.content.match(/<h2[^>]*>(.*?)<\/h2>/gi) || []).slice(0, 4).map((h: string) => h.replace(/<[^>]*>/g, '')).join('\n')}`,
        }],
      }),
      'görsel-promptları'
    );

    const imgPromptRaw = imgPromptMessage.content[0].type === 'text' ? imgPromptMessage.content[0].text : '[]';
    const imagePrompts: any[] = extractJsonArray(imgPromptRaw);

    // ── FAZ 3: Görseller ─────────────────────────────────────────────────
    let finalImageUrl: string | null = null;
    if (imagePrompts.length > 0) {
      const imageResults = await Promise.allSettled(
        imagePrompts.slice(0, 4).map(async (p: any) => ({
          heading: p.heading as string,
          url: await generateAndUploadImage(p, p.heading || 'umre-blog'),
        }))
      );
      const successImages = imageResults
        .filter((r): r is PromiseFulfilledResult<{ heading: string; url: string | null }> =>
          r.status === 'fulfilled' && r.value.url !== null)
        .map(r => ({ heading: r.value.heading, url: r.value.url as string }));

      if (successImages.length > 0) {
        blogData.content = injectImages(blogData.content, successImages);
        finalImageUrl = successImages[0].url;
      }
    }

    // ── FAZ 4: Doğrulama & Kaydet ─────────────────────────────────────────
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

    let slug = blogData.slug || seedKeyword.toLowerCase()
      .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
      .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const post = await prisma.post.create({
      data: {
        title: blogData.title,
        slug,
        description: blogData.metaDescription,
        content: blogData.content,
        focusKeyword: seedKeyword,
        keywords: Array.isArray(blogData.keywords) ? blogData.keywords.join(', ') : String(blogData.keywords || ''),
        categoryId: validCategoryId,
        authorId: validAuthorId,
        personalExperience: blogData.personalExperience,
        references: blogData.references,
        imageUrl: finalImageUrl,
        imagePrompts: JSON.stringify(imagePrompts.slice(0, 4)),
        published: true,
      },
    });

    await prisma.aILog.update({
      where: { id: logId },
      data: {
        status: 'COMPLETED',
        details: `Yayınlandı: "${post.title}" | ${cluster} | ${blogData.content.split(' ').length} kelime`,
        imageUrl: finalImageUrl,
        completedAt: new Date(),
      },
    });

    try {
      revalidatePath('/');
      revalidatePath('/blog');
      revalidatePath(`/blog/${post.slug}`);
    } catch {}

  } catch (err: any) {
    console.error('[blog-pipeline] Hata:', err);
    await prisma.aILog.update({
      where: { id: logId },
      data: { status: 'FAILED', details: err?.message ?? String(err), completedAt: new Date() },
    }).catch(() => {});
  }
}
