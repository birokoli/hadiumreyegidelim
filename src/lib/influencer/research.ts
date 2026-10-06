// Influencer araştırmacısı (kullanıcı, 3 Ekim): Google'da "site:instagram.com umre" taraması acenteleri ve küçük
// hesapları getiriyordu. Bunun yerine Claude bir influencer pazarlamacısı gibi web'de araştırır; önerdiği her hesap
// Instagram'dan gerçek sayılarla doğrulanır. Claude'un yazdığı sayılara güvenilmez, yalnızca kullanıcı adı alınır.
import { callClaude, extractJson } from "@/lib/geo-blog/claude";

export type ResearchCandidate = { handle: string; name?: string; why?: string };

const SYSTEM = `Sen Türkiye pazarını tanıyan deneyimli bir influencer pazarlama uzmanısın. Bir umre organizasyonu (hadiumreyegidelim.com) için Instagram'da iş birliği yapılacak içerik üreticisi arıyorsun.

Aranan kişi:
- Gerçek bir MİKRO influencer: kişisel hesap, düzenli Reels ve hikâye, takipçisiyle yakın bağ kuran biri. Takipçisi 10 bin ile 50 bin arası (ünlü ve büyük hesapları ÖNERME; 100 binin üstü işe yaramaz).
- Kitlesi dindar / muhafazakâr Türk kitlesi: tesettür modası ve tesettürlü yaşam, İslami yaşam tarzı, muhafazakâr aile ve anne içerikleri, helal seyahat ve gezi, manevi motivasyon, Kur'an ve dua içerikleri üreten kadın ve erkek üreticiler.
- Türkçe içerik üretiyor ve Instagram'da şu an aktif.

Kesinlikle ÖNERME:
- Turizm acenteleri, umre/hac firmaları, otel ve mağaza hesapları, kurumsal sayfalar, dernek/vakıf hesapları.
- Yalnızca vaaz/sohbet kesitleri paylaşan klasik hoca ve imam hesapları (influencer gibi içerik üretmeyen din adamları).
- Fan sayfaları, alıntı/derleme sayfaları, haber sayfaları.
- Siyasetçiler.

Yöntem: mikro hesaplar listelerde az geçer; şunları ara: "umre vlog", "umre günlüğü", "hanım umresi deneyimi", "Medine günlüğü", "tesettür kombin", "muhafazakar anne blog", "İslami ebeveynlik", "hafızlık yolculuğu", şehir adıyla ("Konya tesettür blogger" gibi), YouTube ve TikTok'taki küçük umre vlogcularının Instagram hesapları, marka iş birliği haberlerinde adı geçen küçük hesaplar. Yalnızca Instagram kullanıcı adından emin olduğun hesapları yaz; tahmin etme. Her hesap için tahmini takipçiyi değil, neden mikro ve uygun olduğunu yaz.

Yanıtın sonunda yalnızca şu JSON'u ver:
{"candidates":[{"handle":"instagram_kullanici_adi","name":"Görünen ad","why":"Tek cümle: neden uygun"}]}`;

export async function researchInfluencers(brief: string, exclude: string[], count = 25): Promise<ResearchCandidate[]> {
  const { text } = await callClaude({
    feature: "other",
    effort: "medium",
    maxTokens: 12000,
    system: SYSTEM,
    prompt: `Arama özeti: ${brief}\nEn fazla ${count} aday öner.${exclude.length ? `\nBu hesaplar zaten listede, tekrar önerme: ${exclude.slice(0, 300).join(", ")}` : ""}`,
    tools: [{ type: "web_search_20260209", name: "web_search", max_uses: 8, user_location: { type: "approximate", country: "TR" } }],
  });
  const parsed = extractJson<{ candidates?: ResearchCandidate[] }>(text);
  return (parsed?.candidates ?? []).filter((c) => typeof c?.handle === "string").slice(0, count);
}
