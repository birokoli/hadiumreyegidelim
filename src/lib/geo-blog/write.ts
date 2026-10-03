import { isAllowedExternal } from "@/lib/geo-blog/external-policy";
import { callClaude } from "@/lib/geo-blog/claude";
import { pickLinkTargets, type LinkTarget } from "@/lib/geo-blog/inventory";
import type { TopicResearch } from "@/lib/geo-blog/research";
import { slugify } from "@/lib/seo/programmatic";
import { prisma } from "@/lib/prisma";

export type BlogFaqItem = { question: string; answer: string };

export type GeneratedArticle = {
  title: string;
  slug: string;
  metaDescription: string;
  tldr: string;
  content: string;
  faq: BlogFaqItem[];
  keywords: string;
  internalLinksUsed: string[];
  externalLinksUsed: string[];
};

// Structured outputs: yanıt bu şemaya zorlanır; metinden JSON ayıklamaya gerek kalmaz
const ARTICLE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "slug", "metaDescription", "tldr", "content", "faq", "keywords"],
  properties: {
    title: { type: "string" },
    slug: { type: "string" },
    metaDescription: { type: "string" },
    tldr: { type: "string" },
    content: { type: "string" },
    faq: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "answer"],
        properties: { question: { type: "string" }, answer: { type: "string" } },
      },
    },
    keywords: { type: "array", items: { type: "string" } },
  },
} as const;

const SYSTEM = `Sen hadiumreyegidelim.com için Google'da sıralanacak ve AI arama motorlarının (ChatGPT, Perplexity, Gemini, Google AI Overviews) alıntılayacağı Türkçe rehber yazıları yazan bir editörsün.

BAŞLIK VE META
- title: en fazla 60 karakter, odak kelime başta. Marka adı ekleme (şablon ekler).
- slug: küçük harf, Türkçe karakter yok, tireli, en fazla 6 kelime.
- metaDescription: 130-155 karakter, sorunun cevabını ve bir somut bilgiyi içersin.
- tldr: 40-60 kelime; sorunun cevabı tek başına anlaşılır biçimde.
- keywords: 5-8 hedef kelime.

İÇERİK (content, HTML)
- <h1> kullanma. İzinli etiketler: p, h2, h3, ul, ol, li, table, thead, tbody, tr, th, td, strong, em, a.
- En az 5 <h2>; en az 3'ü insanların soracağı biçimde soru ("… kaç gün sürer?").
- Her <h2>'nin hemen altındaki ilk <p> 40-60 kelimelik doğrudan cevaptır: konuyu adıyla anar (bu, o, bunlar ile başlamaz), tek başına okunduğunda anlaşılır.
- Bölümler 130-170 kelimelik, kendi başına alıntılanabilir pasajlardan oluşsun.
- En az 1 <table> (karşılaştırma, maliyet kalemleri, adımlar).
- 1200-1900 kelime.
- Rakam, tarih, fiyat, süre yalnızca verilen DOĞRULANMIŞ OLGULAR'dan gelir; her birinin yanında o olgunun kaynağına dış link ver. Olgularda olmayan rakam yazma; gerekiyorsa "güncel tutarı … sayfasından kontrol edin" de.
- Uydurma deneyim, müşteri, yorum, istatistik yok. "Misafirlerimiz", "yıllardır gözlemliyoruz" gibi doğrulanamayan iddialar yok.

MARKA VE SATIŞ (en önemli kural)
- Hadi Umreye Gidelim bireysel umre konusunda uzman bir markadır. Yazının amacı okura doğru bilgi verirken onu bireysel umreye ve Hadi Umreye Gidelim'e yönlendirmektir.
- "Hadi Umreye Gidelim" adını metinde 2-3 kez doğal biçimde an (ör. "Hadi Umreye Gidelim'in bireysel umre tasarlayıcısında tarihi ve oteli kendiniz seçebilirsiniz"). Reklam dili, abartı, "en iyi/en ucuz/garanti" yok.
- En az bir yerde /bireysel-umre sayfasına, uygunsa /paketler sayfasına link ver; yazının son bölümü okuru kendi umresini planlamaya davet etsin.
- Grup turu, kafile ya da Diyanet turu fiyatlarını ölçü/referans alma; "grup turu daha ucuz/daha uygun" gibi okuru başka seçeneğe yönelten ifadeler yazma. Karşılaştırma gerekiyorsa bireysel umrenin avantajlarını öne çıkar: kendi takvimi, otel seçimi, kalabalıksız program, aileye özel plan.
- Fiyat verirsen yalnızca BİZİM PAKETLERİMİZ listesindeki gerçek fiyatları kullan ("Hadi Umreye Gidelim paketleri X'den başlar" gibi). Başka firma, piyasa ortalaması ya da tahmini fiyat yazma.
- Başka bir acente, tur şirketi, uygulama ya da hizmet sağlayıcıyı önerme; okuru başka firmaya yönlendirme. Kaynak olarak yalnızca resmî kurumların bilgi sayfaları kullanılır.

LİNKLER
- İç link: yalnızca İZİNLİ İÇ LİNKLER listesindeki path'ler, tam olarak yazıldığı gibi (ör. href="/bireysel-umre"). 5-8 iç link; link metni hedef sayfayı anlatsın ("buraya tıklayın" değil). /bireysel-umre veya /paketler en az birine doğal bir yerde link ver.
- Dış link: yalnızca İZİNLİ DIŞ KAYNAKLAR listesindeki URL'ler (hepsi resmî kurum: Diyanet, Nusuk, Suudi devlet siteleri), birebir aynı; target="_blank" rel="noopener noreferrer".
- Dış linkin metni kurum ya da site adı DEĞİL, konuyla ilgili kelimedir. Doğru: <a href="…">umre vizesi başvurusu</a>, <a href="…">ihram yasakları</a>. Yanlış: "Diyanet'in sitesi", "Nusuk portalı", "resmî sayfa", adres metni.
- Kurum adlarını kaynak göstermek için cümleye yazma ("Diyanet'e göre", "Nusuk'ta belirtildiği gibi" yok); bilgiyi doğrudan ver, linki ilgili kelimeye koy.
- Başka hiçbir acente, tur şirketi ya da rakip firma adı, markası veya sitesi yazıda geçmez.
- "TÜRSAB" ve "diyanetsiz" kelimeleri hiçbir biçimde (başlık, metin, SSS, anahtar kelime) geçmez. Onun yerine "bireysel umre", "kendi programıyla umre" de.
- SATTIĞIMIZ HİZMETLER dış siteye asla linklenmez, müşteri kendi sayfamıza gider: vize → /umre-vizesi, paket ve fiyat → /paketler, rehberlik → /rehberlik, transfer ve tren → /hizmetler, otel ve konaklama → /bireysel-umre. Uçak bileti ve Nusuk randevusu SATMIYORUZ: bunlar için yönlendirme ya da satış cümlesi yazma. Vize portalı, otel, uçuş veya rezervasyon sitesi önerme; "vizenizi … üzerinden alabilirsiniz" gibi dış yönlendirme yok.
- Dış link yalnızca bilgi içindir (ibadet kuralları, sağlık şartları, giriş kuralları, Ravza randevusu gibi); satış yaptığımız bir işlem için değil.

ÜSLUP (no-ai-slop)
- Kısa ve net cümleler; cevap önce, açıklama sonra.
- Yasak: "günümüz dünyasında", "şüphesiz", "kuşkusuz", "sonuç olarak", "özetle", "unutulmaz bir deneyim", "eşsiz", "adeta", "son derece önemli", "hayati önem", "bu yazımızda", "merak ediyorsanız doğru yerdesiniz", "hadi gelin", emoji.
- "Bu X değil, Y" kalıbı, retorik sorular ve dramatik tek kelimelik cümleler yok.
- İnsan editör gibi yaz: cümle uzunluğu değişsin (kısa ve orta karışık), paragraf başları farklı kelimelerle başlasın, her bölüm aynı kalıpla (tanım → liste → özet) kurulmasın. Somut ayrıntı ver (hangi kapı, hangi saat aralığı, hangi belge), genel geçer cümle kurma.
- Aynı bilgiyi farklı bölümlerde tekrar etme; giriş paragrafında "bu rehberde şunları anlatacağız" türü içerik listesi yok.

SİTE GERÇEKLERİ (bunlar dışında rakam yok)
- Suudi Arabistan e-vize: kişi başı 140 USD; belgeler tamamsa 2 iş saatinde çıkar (Hadi Umreye Gidelim üzerinden, /umre-vizesi).
- Vize nasıl alınır (Hadi Umreye Gidelim süreci): müşteri otel rezervasyonunu, gidiş-dönüş uçak biletini, pasaportunun ön yüzünün fotoğrafını ve her yolcu için birer biyometrik fotoğrafı WhatsApp'tan gönderir, ücreti öder; belgeler tamamsa vize 2 saat içinde Hadi Umreye Gidelim tarafından iletilir. "Kapıda vize", "Schengen/ABD vizesiyle", "kendiniz başvurun" gibi başka yol önerme.
- Otel fiyatı 1 oda, 1 gece içindir (giriş 16.00, çıkış 11.00); bir odada en fazla 4 kişi kalır.
- Transfer fiyatı araç başıdır; Haremeyn treni Ekonomi ve Business olarak satılır (/hizmetler).

ARAMA HEDEFİ (yamyamlık yok)
- Bu yazı baş aramaları ("umre", "bireysel umre", "umre vizesi", "umre fiyatları", "Mekke otelleri", "Kâbe'ye yakın oteller") HEDEFLEMEZ; bunlar satış sayfalarımızındır. Başlık ve odak kelime, verilen konunun uzun kuyruk sorusudur; baş aramayı geçen yerde ilgili satış sayfasına link ver.

faq: 4-6 soru; cevaplar 2-3 cümle ve içerikle çelişmesin.`;

export async function writeArticle(research: TopicResearch, inventory: LinkTarget[], feedback: string[] = []): Promise<GeneratedArticle> {
  const linkCandidates = pickLinkTargets(research.topic, inventory, 14);
  const allowedInternal = linkCandidates.map((c) => ({ path: c.path, title: c.title }));
  const allowedExternal = research.sources.filter((s) => isAllowedExternal(s.url)).map((s) => ({ url: s.url, title: s.title ?? s.url }));

  // Fiyat ve paket bilgisi yalnızca kendi paketlerimizden
  const packages = await prisma.package
    .findMany({ where: { published: true }, select: { title: true, slug: true, price: true, currency: true, duration: true }, orderBy: { price: "asc" }, take: 8 })
    .catch(() => []);
  const ourPackages = packages
    .map((p) => `- ${p.title} (${p.duration})${p.price > 0 ? `: ${p.price.toLocaleString("tr-TR")} ${p.currency}'dan` : ""} → /paketler/${p.slug}`)
    .join("\n");

  const prompt = [
    `KONU: ${research.topic}`,
    `ARAYAN KİŞİNİN NİYETİ: ${research.userIntent}`,
    `HEDEF KİTLE: ${research.targetAudience}`,
    `SORULAR:\n${research.keyQuestions.map((q) => `- ${q}`).join("\n") || "- (araştırmadan soru çıkmadı; konuya göre sen belirle)"}`,
    `DOĞRULANMIŞ OLGULAR:\n${research.facts.map((f) => `- ${f.claim} [kaynak: ${f.sourceUrl}]`).join("\n") || "- (doğrulanmış olgu yok: rakam vermeden, süreç ve kontrol listesi odaklı yaz)"}`,
    `İZİNLİ İÇ LİNKLER:\n${JSON.stringify(allowedInternal)}`,
    `İZİNLİ DIŞ KAYNAKLAR:\n${JSON.stringify(allowedExternal)}`,
    `BİZİM PAKETLERİMİZ (fiyat verilecekse yalnızca bunlar):\n${ourPackages || "- (yayında paket yok: fiyat yazma, tasarlayıcıya yönlendir)"}`,
    feedback.length ? `ÖNCEKİ TASLAKTAKİ SORUNLAR (bu kez hepsini düzelt):\n${feedback.map((f) => `- ${f}`).join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const { text } = await callClaude({ system: SYSTEM, prompt, schema: ARTICLE_SCHEMA as unknown as Record<string, unknown>, effort: "medium" });

  let parsed: { title: string; slug: string; metaDescription: string; tldr: string; content: string; faq: BlogFaqItem[]; keywords: string[] | string };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Claude yazı çıktısı JSON olarak okunamadı.");
  }

  const content = String(parsed.content ?? "");
  const hrefs = [...content.matchAll(/href=["']([^"']+)["']/g)].map((m) => m[1]);
  const internalSet = new Set(allowedInternal.map((l) => l.path));
  const externalSet = new Set(allowedExternal.map((s) => s.url));
  const title = String(parsed.title ?? research.topic).trim();

  return {
    title,
    slug: slugify(String(parsed.slug || title)).split("-").slice(0, 8).join("-") || slugify(research.topic),
    metaDescription: String(parsed.metaDescription ?? "").trim(),
    tldr: String(parsed.tldr ?? "").trim(),
    content,
    faq: (Array.isArray(parsed.faq) ? parsed.faq : []).filter((f) => f && typeof f.question === "string" && typeof f.answer === "string" && f.question.trim() && f.answer.trim()),
    keywords: (Array.isArray(parsed.keywords) ? parsed.keywords : String(parsed.keywords ?? "").split(",")).map((k) => String(k).trim()).filter(Boolean).join(", "),
    internalLinksUsed: [...new Set(hrefs.filter((h) => internalSet.has(h)))],
    externalLinksUsed: [...new Set(hrefs.filter((h) => externalSet.has(h)))],
  };
}
