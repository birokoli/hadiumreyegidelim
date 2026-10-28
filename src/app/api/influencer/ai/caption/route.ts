// Influencer açıklama yardımcısı (27 Ekim): kampanya brief'ine ve marka kurallarına göre 3 açıklama önerisi.
// Claude yalnızca brief'teki bilgileri kullanır; fiyat, tarih, yorum uydurmaz. Aylık AI bütçesi (ai-budget) üzerinden çalışır.
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getInfluencerSession } from '@/lib/influencer-auth';
import { getBrief, GENEL_KURALLAR } from '@/lib/marketing/brief';
import { kampanyaLinki } from '@/lib/marketing/panel';
import { callClaude } from '@/lib/geo-blog/claude';
import { rateLimit } from '@/lib/rate-limit';

const PLATFORM: Record<string, string> = {
  instagram_story: 'Instagram story: en fazla 2–3 kısa satır; story üstüne yazılacak gibi.',
  instagram_post: 'Instagram gönderi açıklaması: 4–8 satır; ilk satır dikkat çeksin.',
  instagram_reel: 'Reels açıklaması: 2–4 satır, ilk cümle videoyu izletecek bir soru ya da cümle.',
  tiktok: 'TikTok açıklaması: en fazla 2 kısa satır.',
  youtube: 'YouTube açıklaması: 4–6 satır, sade.',
};

const SEMA = {
  type: 'object',
  properties: { oneriler: { type: 'array', items: { type: 'string' } } },
  required: ['oneriler'],
  additionalProperties: false,
};

export async function POST(req: NextRequest) {
  const s = await getInfluencerSession();
  if (!s) return NextResponse.json({ error: 'Yetkisiz.' }, { status: 401 });
  const rl = rateLimit(s.id, 'ai-caption', 12, 60 * 60 * 1000);
  if (!rl.allowed) return NextResponse.json({ error: 'Bir saatte en fazla 12 öneri isteyebilirsiniz.' }, { status: 429 });

  const { campaignId, platform, not } = await req.json().catch(() => ({}));
  const kampanya = campaignId ? await prisma.campaign.findUnique({ where: { id: String(campaignId) } }) : null;
  if (!kampanya) return NextResponse.json({ error: 'Kampanya bulunamadı.' }, { status: 404 });
  const katilim = await prisma.campaignParticipant.findUnique({ where: { campaignId_influencerId: { campaignId: kampanya.id, influencerId: s.id } } });
  if (!katilim) return NextResponse.json({ error: 'Önce kampanyaya katılın.' }, { status: 400 });
  const brief = await getBrief(kampanya.id);
  const link = kampanyaLinki(kampanya.slug, katilim.uniqueCode);

  const system = `Sen "Hadi Umreye Gidelim" (bireysel umre) için çalışan bir influencer'a açıklama metni öneren yardımcısın.
Ton: sade, sıcak, samimi; "siz" diye hitap; abartı, ünlem yağmuru ve emoji kalabalığı yok (en fazla 1–2 emoji).
Kurallar:
- Yalnızca aşağıdaki "Bilgiler" listesindeki fiyat, tarih ve dahil olanları kullan. Bilgi yoksa fiyat ve tarih yazma. Asla rakam uydurma.
- Uydurma deneyim, yorum, müşteri sayısı yazma. Influencer'ın notu varsa onu kendi ağzından kullan; yoksa kişisel deneyim iddia etme.
- Doğrulanmamış aciliyet yok ("son yerler", "kaçırmayın" gibi).
- Yasak ifadeler: TÜRSAB, diyanetsiz, Harem'e sıfır, 7/24, kesintisiz, lüks, VIP, eşsiz, garanti, kapıda vize, Schengen, apart. Uçak bileti dahil deme.
- Her öneride kişisel kodu (${katilim.uniqueCode}) ve "#işbirliği" etiketini kullan; linki (${link}) yalnızca gönderi ve YouTube açıklamasına koy.
- Üç öneri birbirinden farklı açıdan girsin (soru ile, kısa bir hikâye ile, doğrudan bilgi ile).
Biçim: ${PLATFORM[String(platform)] ?? PLATFORM.instagram_post}`;

  const prompt = [
    `Kampanya: ${kampanya.title}`,
    brief?.soz && `Kampanya sözü: ${brief.soz}`,
    brief?.anaMesaj && `Ana mesaj: ${brief.anaMesaj}`,
    brief?.amac && `Amaç: ${brief.amac}`,
    brief?.bilgiler.length ? `Bilgiler:\n- ${brief.bilgiler.join('\n- ')}` : 'Bilgiler: (yok; fiyat ve tarih yazma)',
    `Kampanyaya özel yapılmayacaklar:\n- ${[...(brief?.yapma ?? []), ...GENEL_KURALLAR.yapma].join('\n- ')}`,
    brief?.hashtagler && `Önerilen etiketler: ${brief.hashtagler}`,
    not ? `Influencer'ın kendi notu (kendi ağzından kullan): ${String(not).slice(0, 400)}` : '',
    '3 öneri yaz.',
  ].filter(Boolean).join('\n\n');

  try {
    const { text } = await callClaude({ feature: 'other', effort: 'low', maxTokens: 3000, system, prompt, schema: SEMA });
    const oneriler = (JSON.parse(text).oneriler as unknown[]).map(String).filter(Boolean).slice(0, 3);
    return NextResponse.json({ oneriler });
  } catch (e) {
    // Teknik hata ayrıntısı (anahtar, bütçe) influencer'a gösterilmez; sunucu günlüğüne yazılır
    console.error('[ai-caption]', e);
    return NextResponse.json({ error: 'Yapay zekâ şu an öneri yazamıyor; hazır açıklamaları kullanabilir ya da biraz sonra tekrar deneyebilirsiniz.' }, { status: 502 });
  }
}
