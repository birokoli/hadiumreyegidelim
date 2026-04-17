import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import { generateAndUploadImage } from '@/lib/generate-image';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Keyword Clusters ─────────────────────────────────────────────────────────
// Her cluster ayrı bir konu alanını temsil eder.
// Sistem, daha az kullanılan cluster'ları önceliklendirir.
const KEYWORD_CLUSTERS: Record<string, string[]> = {
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
    'sa\'y safa merve nasıl koşulur',
    'zemzem suyu içme adabı faydaları',
    'mekke medine arası ulaşım seçenekleri',
    'mekke\'de dikkat edilmesi gerekenler',
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
    'cennetül baki ziyareti',
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
    'istanbul\'dan bireysel umre organizasyonu',
    'ankara\'dan mekke uçuş seçenekleri',
    'türkiye\'den umre nasıl gidilir',
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

// ─── Yetkili Dış Link Havuzu ──────────────────────────────────────────────────
const AUTHORITATIVE_LINKS = [
  { url: 'https://www.haj.gov.sa/tr', name: 'Suudi Arabistan Hac ve Umre Bakanlığı', context: 'resmi hac ve umre düzenlemeleri' },
  { url: 'https://nusuk.sa', name: 'Nusuk Platformu', context: 'resmi umre başvuru sistemi' },
  { url: 'https://www.diyanet.gov.tr/tr-TR/Kurumsal/Detay/1', name: 'Diyanet İşleri Başkanlığı', context: 'Türkiye resmi din otoritesi' },
  { url: 'https://www.visitsaudi.com', name: 'Visit Saudi Arabia', context: 'Suudi Arabistan resmi turizm sitesi' },
];

// ─── İç Link Zorunlu Sayfaları ────────────────────────────────────────────────
const INTERNAL_LINKS = [
  { href: '/bireysel-umre', anchor: 'bireysel umre planlama rehberimiz' },
  { href: '/paketler', anchor: 'umre paket seçeneklerimiz' },
  { href: '/rehber', anchor: 'uzman umre rehberlerimiz' },
];

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
        console.warn(`[auto-blog] ${label} retry ${i}/${MAX}: ${msg}`);
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
  if (start === -1 || end <= start) throw new Error(`JSON bulunamadı. İlk 300 kar: ${raw.slice(0, 300)}`);
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

// Türkiye saatiyle bugün kaç tane başarılı blog yazıldı?
async function getCompletedBlogsToday(): Promise<number> {
  // Turkey is UTC+3
  const now = new Date();
  const turkeyOffset = 3 * 60 * 60 * 1000;
  const turkeyNow = new Date(now.getTime() + turkeyOffset);
  const todayStart = new Date(Date.UTC(
    turkeyNow.getUTCFullYear(),
    turkeyNow.getUTCMonth(),
    turkeyNow.getUTCDate(),
    0, 0, 0
  ) - turkeyOffset);

  return prisma.aILog.count({
    where: {
      status: 'COMPLETED',
      createdAt: { gte: todayStart },
    },
  });
}

// Hangi cluster en az kullanılmış?
async function selectKeywordCluster(usedFocusKeywords: Set<string>): Promise<{ cluster: string; keyword: string }> {
  // Son 30 gün içinde hangi cluster'lar kullanıldı?
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentLogs = await prisma.aILog.findMany({
    where: { status: 'COMPLETED', createdAt: { gte: thirtyDaysAgo } },
    select: { topic: true },
  });
  const recentTopics = new Set(recentLogs.map(l => l.topic?.toLowerCase()).filter(Boolean));

  // Her cluster için kullanılmamış kelimeleri say
  const clusterScores: { cluster: string; available: string[] }[] = [];
  for (const [cluster, keywords] of Object.entries(KEYWORD_CLUSTERS)) {
    const available = keywords.filter(k => {
      const kl = k.toLowerCase();
      return !usedFocusKeywords.has(kl) && !recentTopics.has(kl);
    });
    if (available.length > 0) clusterScores.push({ cluster, available });
  }

  if (clusterScores.length === 0) {
    // Tüm cluster'lar tükendiyse herhangi birinden seç
    const allKeywords = Object.values(KEYWORD_CLUSTERS).flat().filter(k => !usedFocusKeywords.has(k.toLowerCase()));
    const kw = allKeywords[Math.floor(Math.random() * allKeywords.length)] ?? `bireysel umre ${new Date().getFullYear()}`;
    return { cluster: 'general', keyword: kw };
  }

  // En fazla available kelimesi olan cluster'dan seç (daha geniş kapsam)
  clusterScores.sort((a, b) => b.available.length - a.available.length);
  const chosen = clusterScores[Math.floor(Math.random() * Math.min(3, clusterScores.length))];
  const keyword = chosen.available[Math.floor(Math.random() * chosen.available.length)];
  return { cluster: chosen.cluster, keyword };
}

// ─── Ana Handler ──────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 });
  }

  const url = new URL(request.url);
  const force = url.searchParams.get('force') === 'true';
  const existingLogId = url.searchParams.get('logId') || null;

  // Auto-blog açık mı? (DB ayarı env var'a tercih edilir)
  let autoBlogEnabled = process.env.AUTO_BLOG_ENABLED === 'true';
  try {
    const dbToggle = await prisma.setting.findUnique({ where: { key: 'AUTO_BLOG_ENABLED' } });
    if (dbToggle) autoBlogEnabled = dbToggle.value === 'true';
  } catch {}

  if (!autoBlogEnabled && !force) {
    return NextResponse.json({ success: true, message: 'Auto-blog devre dışı.' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY eksik' }, { status: 500 });
  }

  // Günlük dedup: bugün zaten yazıldıysa atla (force ile bypass edilir)
  if (!force) {
    const todayCount = await getCompletedBlogsToday();
    if (todayCount > 0) {
      return NextResponse.json({ success: true, message: `Bugün zaten ${todayCount} blog yazıldı.` });
    }
  }

  // Çalışan pipeline var mı? (existingLogId varsa o zaten "çalışıyor" sayılır)
  if (!existingLogId) {
    const running = await prisma.aILog.findFirst({
      where: { status: { notIn: ['COMPLETED', 'FAILED'] } },
      orderBy: { createdAt: 'desc' },
    });
    if (running) {
      return NextResponse.json({ status: 'ALREADY_RUNNING', logId: running.id, topic: running.topic });
    }
  }

  // ── Anahtar Kelime Seçimi ─────────────────────────────────────────────────
  const usedFocusKeywords = new Set(
    (await prisma.post.findMany({ select: { focusKeyword: true } }))
      .map((p: any) => p.focusKeyword?.trim().toLowerCase())
      .filter(Boolean) as string[]
  );

  const { cluster, keyword: seedKeyword } = await selectKeywordCluster(usedFocusKeywords);

  // RapidAPI'den ek keyword sinyalleri al
  const trendingKws = await fetchRapidApiKeywords(seedKeyword);
  const lsiKeywords = trendingKws
    .filter(k => !usedFocusKeywords.has(k.toLowerCase()) && k.toLowerCase() !== seedKeyword.toLowerCase())
    .slice(0, 8)
    .join(', ');

  // ── Log: dışarıdan geldiyse güncelle, yoksa yeni oluştur ─────────────────
  let log: { id: string };
  if (existingLogId) {
    log = await prisma.aILog.update({
      where: { id: existingLogId },
      data: {
        status: 'INTERNET_SEARCH',
        topic: seedKeyword,
        details: `"${seedKeyword}" için araştırma başlıyor... (Cluster: ${cluster})`,
      },
    });
  } else {
    log = await prisma.aILog.create({
      data: {
        status: 'INTERNET_SEARCH',
        topic: seedKeyword,
        details: `"${seedKeyword}" anahtar kelimesi için araştırma başlıyor... (Cluster: ${cluster})`,
      },
    });
  }

  const setStatus = (status: string, details: string) =>
    prisma.aILog.update({ where: { id: log.id }, data: { status, details } }).catch(() => {});

  try {
    const currentYear = new Date().getFullYear();
    const [categories, authors] = await Promise.all([
      prisma.category.findMany({ select: { id: true, name: true } }),
      prisma.author.findMany({ select: { id: true, name: true, expertise: true } }),
    ]);

    // Dış link listesini hazırla
    const extLinks = AUTHORITATIVE_LINKS.slice(0, 2).map(l =>
      `<a href='${l.url}' target='_blank' rel='noopener noreferrer'>${l.name}</a> (${l.context})`
    ).join(' ve ');

    // ── FAZ 1: Blog İçeriği ───────────────────────────────────────────────
    await setStatus('WRITING_CONTENT', `Claude Opus "${seedKeyword}" için araştırıyor ve yazıyor...`);

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

■ DENEYİM (Experience):
- Birinci çoğul şahıs kullan: "Misafirlerimizden öğrendik ki...", "Mekke'deyken şahit olduk..."
- Spesifik anı/gözlem ekle: "Sabahın 4'ünde Kabe'yi ilk kez gören bir misafirimizin yüzündeki o ifade..."
- Konkret deneyim detayları: kaç dakika, hangi kapı, hangi katta, nasıl bir his

■ UZMANLIK (Expertise):
- Spesifik rakamlar: mesafeler (metre), fiyat aralıkları (yaklaşık USD), süreler
- Prosedürel detay: adım adım işlem, hangi belge, hangi platform
- Teknik bilgi: Nusuk sistemi, mahrem kuralları, ihram miqatı noktaları

■ OTORİTE (Authoritativeness):
- Şu iki resmi kaynağa MUTLAKA link ver (HTML'de tek tırnak):
  1. haj.gov.sa — Suudi Arabistan Hac ve Umre Bakanlığı
  2. nusuk.sa — Resmi umre başvuru platformu
- "Nusuk platformuna göre...", "Haj.gov.sa'nın son açıklamasına göre..." ifadeleri kullan

■ GÜVENİLİRLİK (Trustworthiness):
- Güncel ${currentYear} tarihi fiyat/kural bilgileri
- Yanlış bilgi vermektense "yaklaşık", "güncel fiyatlar için nusuk.sa'ya bakın" de
- Yasal ve resmi prosedürleri doğru anlat

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
İÇERİK YAPISI (ZORUNLU)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. H1 BAŞLIK: Odak kelime BAŞTA, 55-65 karakter, merak uyandıran
2. GİRİŞ PARAGRAFI: 80-100 kelime. İlk cümlede odak kelime. Okuyucunun problemini anlat → makalede ne bulacağını söyle
3. İÇİNDEKİLER TABLOSU:
   <nav id='toc'><ul>
   <li><a href='#bolum-1'>Başlık 1</a></li>
   ...
   </ul></nav>
4. ANA BÖLÜMLER (en az 4 H2, her biri id='bolum-N' ile):
   - Her H2 altında 1-3 H3 başlık
   - Her bölüm: 200-350 kelime
   - Toplam 1800-2500 kelime
5. LISTELER: En az 3 adet <ul> veya <ol> (pratik adımlar, tavsiye listesi, kontrol listesi)
6. TABLO VEYA BİLGİ KUTUSU: En az 1 adet <table> veya:
   <div style='background:#f0f4ff;border-left:4px solid #003781;padding:16px 20px;border-radius:8px;margin:20px 0;'>
   <strong>💡 Önemli Bilgi:</strong> ...
   </div>
7. İÇ LİNKLER (3 ADET ZORUNLU — HTML tek tırnak):
   - <a href='/bireysel-umre'>bireysel umre planlama rehberimiz</a>
   - <a href='/paketler'>umre paket seçeneklerimiz</a>
   - <a href='/rehber'>uzman umre rehberlerimiz</a>
   Her birini doğal bağlamda kullan, liste halinde değil
8. DIŞ LİNKLER (2 ADET ZORUNLU — HTML tek tırnak):
   - <a href='https://nusuk.sa' target='_blank' rel='noopener noreferrer'>Nusuk platformu</a>
   - <a href='https://www.haj.gov.sa/tr' target='_blank' rel='noopener noreferrer'>Hac ve Umre Bakanlığı</a>
9. WHATSAPP CTA (makalenin 2/3'üne yerleştir):
   <div style='background:#25D366;color:white;padding:16px 20px;border-radius:12px;margin:28px 0;'>
   <strong>📱 Kişisel Umre Planınız İçin:</strong> ${currentYear} tarihlerine göre uçuş, otel ve vize için sağ alttaki WhatsApp butonuna tıklayın — ücretsiz danışmanlık.
   </div>
10. SSS BÖLÜMÜ (son kısım):
    <h2 id='sss'>Sıkça Sorulan Sorular</h2>
    4 adet H3 soru + 2-3 cümle cevap
11. KAPANIŞ PARAGRAFI: Özet yok, aksiyona davet et

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YAZIM KURALLARI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Cümle max 18 kelime. Paragraf max 4 cümle.
- YASAKLI: "Sonuç olarak", "özetlemek gerekirse", "büyüleyici", "eşsiz", "hayati önem taşır", "unutulmamalıdır ki", "bu makalede ele alacağız"
- SOMUTLUK: "Oteller yakın" değil → "Kabe Kapısı çıkışından 200 metre, 3 dakika yürüyüş"
- HTML içinde SADECE TEK TIRNAK (') kullan — çift tırnak JSON'u bozar
- Yılı max 3 kez kullan (papağan gibi tekrarlama)
- Emojiler: sadece info kutularında ve CTA'larda

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ÇIKTI KURALI: SADECE geçerli JSON objesi döndür. Hiçbir açıklama, markdown, kod bloğu yok.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "title": "...",
  "slug": "seo-uyumlu-tire-ile-url",
  "metaDescription": "150-160 karakter, CTA içermeli",
  "keywords": "virgülle ayrılmış SEO kelimeleri (8-12 adet)",
  "focusKeyword": "${seedKeyword}",
  "categoryId": "kategorilerden biri",
  "authorId": "yazarlardan biri",
  "content": "<p>...</p><h2 id='bolum-1'>...</h2>...",
  "personalExperience": "Bizzat yaşanmış hissi veren 2-3 cümle (yazar sesi)",
  "references": "haj.gov.sa, nusuk.sa, diyanet.gov.tr"
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
    await setStatus('GENERATING_IMAGES', 'Görsel promptları hazırlanıyor...');

    const imgPromptMessage = await retryable(
      () => claude.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Blog makalesinin H2 başlıkları için Imagen 4'e gönderilecek görsel promptları JSON array olarak oluştur.
SSS başlığını atla. Maksimum 4 başlık için prompt üret.
SADECE JSON array döndür, başka hiçbir şey yazma.

Her öğe için format:
{"heading":"[Türkçe başlık]","subject":{"primary_object":"[İngilizce ana obje]"},"scene":{"environment":"[İngilizce mekan/ortam]"},"aesthetic":{"mood":"spiritual, luxurious, serene","color_palette":"warm gold, ivory, deep blue","style":"high-end travel photography"},"lighting":{"style":"soft golden hour lighting"},"camera":{"lens":"35mm f/1.8"}}

BLOG BAŞLIĞI: ${blogData.title}
BLOG H2 BAŞLIKLARI:
${(blogData.content.match(/<h2[^>]*>(.*?)<\/h2>/gi) || []).slice(0, 4).map((h: string) => h.replace(/<[^>]*>/g, '')).join('\n')}`,
        }],
      }),
      'görsel-promptları'
    );

    const imgPromptRaw = imgPromptMessage.content[0].type === 'text' ? imgPromptMessage.content[0].text : '[]';
    const imagePrompts: any[] = extractJsonArray(imgPromptRaw);

    // ── FAZ 3: Görseller Üret (paralel) ──────────────────────────────────
    let finalImageUrl: string | null = null;

    if (imagePrompts.length > 0) {
      await setStatus('GENERATING_IMAGES', `${Math.min(imagePrompts.length, 4)} görsel üretiliyor...`);

      const imageResults = await Promise.allSettled(
        imagePrompts.slice(0, 4).map(async (p: any) => ({
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

    // ── FAZ 4: Kategori & Yazar Doğrulama ─────────────────────────────────
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
    let slug = blogData.slug || seedKeyword.toLowerCase()
      .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
      .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    // ── FAZ 5: Kaydet ve Yayınla ──────────────────────────────────────────
    const post = await prisma.post.create({
      data: {
        title: blogData.title,
        slug,
        description: blogData.metaDescription,
        content: blogData.content,
        focusKeyword: seedKeyword,
        keywords: Array.isArray(blogData.keywords)
          ? blogData.keywords.join(', ')
          : String(blogData.keywords || ''),
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
      where: { id: log.id },
      data: {
        status: 'COMPLETED',
        details: `Yayınlandı: "${post.title}" | Cluster: ${cluster} | ${blogData.content.split(' ').length} kelime`,
        imageUrl: finalImageUrl,
        completedAt: new Date(),
      },
    });

    try {
      revalidatePath('/');
      revalidatePath('/blog');
      revalidatePath(`/blog/${post.slug}`);
    } catch {}

    return NextResponse.json({
      success: true,
      post: { id: post.id, title: post.title, slug: post.slug },
      cluster,
      wordCount: blogData.content.split(' ').length,
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
