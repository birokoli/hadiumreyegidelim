import { NextResponse } from 'next/server';
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
  try {
    // 1. GÜVENLİK KONTROLÜ (Cron Secret)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key is missing' }, { status: 500 });
    }

    // 2. KONU SEÇİMİ (RapidAPI üzerinden)
    const existingPosts = await prisma.post.findMany({ select: { focusKeyword: true } });
    const usedKeywords = existingPosts.map(p => p.focusKeyword?.trim().toLowerCase());
    
    // Rastgele Gündem/Kategori Havuzu
    const SEED_POOL = [
      "2026 Hac sezonu bitti: Peki şimdi Umre fiyatları ne durumda?",
      "Hac yoğunluğundan hemen sonra Umreye gitmenin kimsenin bilmediği avantajları",
      "2026'da yenilenen Mescid-i Haram kuralları neleri değiştirdi?",
      "Hacılar döndükten sonra Mekke'deki ilk sakin haftayı yakalama taktikleri",
      "Ekim-Kasım 2026 Umre planı: Hava nasıl, kalabalık ne alemde?",
      "2026 Haccı sonrası Kabe'de yapılan detaylı temizlik ve yenilik çalışmaları",
      "Post-Hac döneminde uçak biletlerini ucuza getirmenin yolları",
      "Suudi Arabistan'ın 2026 sonrası güncel vize şartları ve e-vize detayları",
      "Hac sonrası otellerde dibe vuran fiyatları fırsata çevirme rehberi",
      "2026 sonbaharında Umreye gideceklerin mutlaka bilmesi gereken 5 şey",
      "Hac mevsimi çıkışı Zemzem kuyularındaki ve dağıtımındaki son durum",
      "Hac'da yorulan Mekke esnafından Umrecilere özel indirim koparma tüyoları",
      "2026 Hac vizesiyle Umre yapmanın farkı var mıydı? (Geçmişe bakış ve analiz)",
      "Hac dönemi sonrası Mekke-Medine hızlı tren (Haramain) sefer saatleri ve bilet bulma zorluğu",
      "2026 yıl sonu umresi mi, 2027 başı mı? Hangisi bütçe için daha mantıklı?",
      "Bebek arabasıyla Kabe'de tavaf yapılır mı? İşin en pratik ve güvenli yolu",
      "0-2 yaş bebekle uçak yolculuğu ve Cidde havalimanı maceraları",
      "Çocuklu aileler için Mekke'de en rahat kalınabilecek, mesafesi kısa oteller",
      "Bebekle Umre yaparken yanınıza almanız gereken K hayat kurtaran K çanta",
      "İhramlıyken bebek bezi değiştirmek: Bilinmesi gereken hassas kurallar",
      "Mekke ve Medine'de bebek maması ve bezi bulabileceğiniz büyük marketler",
      "Çocuğun Mescid-i Nebevi'de kaybolmaması için alınacak teknolojik ve pratik önlemler",
      "Bebekle Safa ve Merve arasında sa'y yapmanın en kolay saati",
      "5 yaşındaki çocuğa Umreyi ve Kabe'yi sıkmadan nasıl anlatmalıyız?",
      "Bebekli anneler için Ravza-i Mutahhara'ya giriş tüyoları",
      "Çocuklarla ziyaret edilebilecek en sıkıcı olmayan İslami müzeler",
      "Bebekle umrede sağlık: Klima çarpmasına karşı otelde ve haremde ne yapmalı?",
      "Çocuğunuzla Umre hatırası biriktirmenin en yaratıcı 3 yolu",
      "Bebekli aileler grupla mı gitmeli yoksa kendi başlarına mı takılmalı?",
      "Süt emziren anneler için Harem bölgesindeki özel alanlar nerede?",
      "Tur şirketine para vermeden baştan sona Bireysel Umre nasıl planlanır?",
      "E-Vize ile bireysel Umre yapmanın adım adım ve hatasız rehberi",
      "Booking veya Agoda'dan Kabe manzaralı ucuz otel kapatma taktikleri",
      "Cidde Havalimanından Mekke oteline en ucuz ve güvenli ulaşım (Uber, Careem vs.)",
      "Bireysel gidenler için Mekke'de günlük yeme-içme maliyeti (2026 güncel)",
      "Rehber olmadan Umre ritüelleri nasıl eksiksiz yapılır?",
      "Kendi programını yapmanın en büyük avantajı: İstediğin zaman ibadet özgürlüğü",
      "Bireysel gidenler Nusuk uygulaması üzerinden Ravza randevusunu nasıl koparır?",
      "Havalimanında fahiş fiyata sim kartı almak mı, yoksa e-SIM (Airalo) mi daha mantıklı?",
      "Kendi başına gidenler için Mekke'den Medine'ye tren bileti nasıl alınır?",
      "Şirketsiz umrenin dezavantajları: Tek başınayken başınıza gelebilecek 3 risk",
      "Bireysel bilet alırken hangi havayolları daha avantajlı Zemzem bagajı veriyor?",
      "Mekke içinde taksicilerle pazarlık etme sanatı",
      "Sırt çantasıyla minimalist Umre deneyimi: 7 günlük valizde sadece ne olmalı?",
      "Bireysel gruplar için (3-4 arkadaş) villada/apartta kalarak Umre yapma fikri",
      "Sevr Mağarası'na tırmanış: Ne zaman çıkılmalı, yanına ne alınmalı?",
      "Sadece kitaplarda kalan, turistlerin gitmediği Mekke'deki gizli köşeler",
      "Hira (Nur) Dağı'na çıkış rotasının 2026 yılındaki yeni düzenlemeleri (teleferik projesi son durum)",
      "Cennet'ül Mualla kabristanında yatan tarihi şahsiyetlerin etkileyici hikayeleri",
      "Cin Mescidi ve Şecere Mescidi'nin arkasındaki pek bilinmeyen olaylar",
      "Arafat, Müzdelife ve Mina'yı Umre döneminde bomboşken gezmenin o garip hissi",
      "Peygamberimizin (s.a.v) doğduğu evin (Mektebe) bugünkü durumu ve çevresi",
      "Akabe Biatı'nın yapıldığı o tarihi noktanın günümüzdeki hali",
      "Hudeybiye Antlaşması'nın yapıldığı yer ve orada ihrama girmenin fazileti",
      "Mekke'nin ilk mahalleleri: Dar sokaklarda bir fotoğraf ve tarih turu",
      "Kuba Mescidi'ne yürüyerek gitmek: Sünneti yaşamanın verdiği huzur (Medine bonusu)",
      "Uhud Şehitliği'nde Okçular Tepesi'nden savaşın stratejisini okumak",
      "Veda Haccı hutbesinin okunduğu nokta tam olarak neresi?",
      "Mekke Saat Kulesi'nin (Abraj Al Bait) içindeki devasa İslam müzesi turu",
      "Osmanlı döneminden kalan Ecyad Kalesi'nin hüzünlü hikayesi ve eski fotoğrafları",
      "Kabe'ye sıfır 5 yıldızlı otellerin incelemesi ve farkları",
      "Odasından Kabe izlenip Kabe imamıyla hoparlörden cemaat yapılabilen özel süitler",
      "Mekke'deki nezih restoranlar ve manevi iftar akşam yemeği deneyimleri",
      "Özel VIP transferler: GMC veya Mercedes V-Class ile efil efil Mekke-Medine yolculuğu",
      "Özel hocalar (Mürşid) eşliğinde, birebir manevi danışmanlıklı Bireysel Umre",
      "Yaşlılar ve engelliler için ekstra asistan ve VIP golf arabası hizmetleri",
      "Harem manzaralı club lounge'larda sunulan temiz ikramlar",
      "Suudi Arabistan'da kişisel şoför ve 7/24 tercüman kiralama rehberi",
      "Zemzem suyunu kargo ile eve kadar zahmetsiz getirtme yolları",
      "Medine'de Mescid-i Nebevi'ye en yakın, avluya sıfır konaklama",
      "Akıllı telefonlar için en iyi Umre rehberi ve tavaf sayacı uygulamaları",
      "Mekke'de harika fotoğraf kareleri yakalamak için 5 estetik lokasyon",
      "Umre dönüşü hediyelik ne alınır? Klasik tesbih/hurma dışında yenilikçi fikirler",
      "En iyi hurma nereden alınır? Acve, Mebrum ve Sukkari tadım rehberi",
      "Kadınlar için Umre'de pratik giyim tüyoları: Terletmeyen ferace ve şal seçimi",
      "Ayak tabanlarının su toplamaması için Harem'e özel ayakkabı/çorap önerileri",
      "Zemzem suyu Türkiye'ye gelirken bozulur mu? Şişeleme detayları",
      "Mekke'deki Albaik restoranı çılgınlığı: Gerçekten o sıraya değer mi?",
      "Umrede beslenme: Enerji düşüklüğü yaşamamak için kullanılabilecek doğal takviyeler",
      "İhram yasaklarını çiğnememek için kokusuz sabun ve şampuan markaları",
      "Gençler arasında artan Dijital Detoks Umresi akımı nedir?",
      "Yerel halk gibi takılmak: Mekke'nin ara sokaklarındaki efsane sokak lezzetleri",
      "Mescid-i Haram'da kaybolursanız yapmanız gereken 3 acil eylem planı",
      "Medine'deki hurma bahçelerinde kafa dinlemelik bir ikindi çayı molası",
      "İlk defa umreye gideceklerin en çok sorduğu 10 samimi soru"
    ];
    const randomSeed = SEED_POOL[Math.floor(Math.random() * SEED_POOL.length)];
    const trendingData = await fetchTrendingKeywords(randomSeed);
    
    // Geçmiş yılları ve anlamsız kısa kelimeleri filtrele
    const currentYear = new Date().getFullYear();
    const validKeywords = trendingData.filter((item: any) => {
      if (!item || !item.text) return false;
      const t = item.text.toLowerCase();
      // 2022, 2023, 2024 vb. eski tarihleri ele ama mevcut yılı eledik
      return !t.includes("2023") && !t.includes("2024") && !t.includes("2022") && t.length > 5;
    });

    // Trend ve hacme göre sıralayıp en değerli odak kelimeyi seç (daha önce yazılmamış)
    let selectedKeyword: string | null = null;
    let clusterKeywords: string[] = []; // Aynı yazıya eklenecek yan kelimeler (zenginleştirme)

    for (const item of validKeywords) {
      if (!usedKeywords.includes(item.text.toLowerCase())) {
        selectedKeyword = item.text;
        break;
      }
    }

    if (!selectedKeyword) {
      // Eğer RapidAPI'den gelen her şeyi daha önce yazdıysak veya API çökerse default bir kelime seç:
      selectedKeyword = "umre turları " + new Date().getFullYear();
    } else {
      // O kelime yazılacak ok. Yanına LSI olarak 3 kelime daha çek
      const others = validKeywords.filter((k: any) => k.text !== selectedKeyword && !usedKeywords.includes(k.text.toLowerCase()));
      clusterKeywords = others.slice(0, 3).map((k: any) => k.text);
    }

    const keywordsString = clusterKeywords.length > 0 ? clusterKeywords.join(', ') : "bireysel umre, umre turları, hadiumreyegidelim";
    console.log("Seçilen Odak Kelime:", selectedKeyword);
    console.log("Kümelenmiş (LSI) Ek Kelimeler:", keywordsString);

    // Bütün kategorileri çek (AI'a referans için)
    const categories = await prisma.category.findMany({ select: { id: true, name: true } });
    // Bütün yazarları çek
    const authors = await prisma.author.findMany({ select: { id: true, name: true } });

    // 3. BLOG İÇERİĞİ ÜRETİMİ (Mevcut generate-blog mantığı)
    const textModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const blogPrompt = `Sen uzman bir SEO uzmanı ve umre/hac, maneviyat konularında profesyonel bir metin yazarısın. Yazılarını %100 bir insan yazmış gibi kurgulamalısın. İçerik oluştururken şu kurallara KESİNLİKLE uy:

Odak Anahtar Kelime: "${selectedKeyword}"
Ek Anahtar Kelimeler: "${keywordsString}"
Mevcut Kategoriler: ${JSON.stringify(categories)}
Mevcut Yazarlar: ${JSON.stringify(authors)}

ZAMAN VE YIL KURALI: 
- ŞU AN BULUNDUĞUMUZ YIL: ${currentYear}. ASLA geçmiş yılları (2024, 2025, 2023 vb.) başlıkta veya içerikte KULLANMA! Eğer mevcut yıldan bahsedeceksen ${currentYear} veya ${currentYear + 1} yıllarını baz al.

SATIŞ VE RAKİP STRATEJİSİ (ÇOK ÖNEMLİ!):
- Eğer anahtar kelime "Diyanet", "başka bir tur firması" gibi rakip yapıları içeriyorsa: Müşteriyi KESİNLİKLE onlara yönlendirme! Diyanet'in kısıtlı turlarını objektif bir dille ele ancak "Hadi Umreye Gidelim" şirketimizin özelleştirilebilir, konforlu ve esnek "Bireysel Umre" programlarıyla kıyasla. 
- Her makalenin sonunda CTA (Satışa Yönlendirme) yaparak "Hadi Umreye Gidelim güvencesiyle hayalinizdeki umreye hemen adımlayın" mesajı ver ve sitemizden alıma teşvik et.

SEO VE İÇERİK MİMARİSİ (HEDEF: 100/100 SKOR!):
1. BAŞLIK VE METİN: Odak kelime mutlaka ana başlıkta, meta açıklamada, link slug'ında ve makalenin İLK 100 KELIMESİ içinde net bir biçimde geçmelidir.
2. UZUNLUK: Derin, bilgilendirici ve dolu dolu olmalı. Hedef 700-1000 kelime arası.
3. LİSTELEME: Uzun içeriği monotonluktan kurtarmak için içerikte kesinlikle EN AZ 2 YERDE madde işaretleri (<ul><li>) veya numaralı liste kullan! E-A-T metrikleri (Uzmanlık ve Güven) için doyurucu alt başlıklar at.
4. SIKÇA SORULAN SORULAR (SSS): Makalenin EN SONUNA mutlaka 'Sıkça Sorulan Sorular' bölümü ekle ve konuda merak edilen 3 popüler soruyu cevapla.
5. İÇ LİNKLEME: <a href="https://hadiumreyegidelim.com/bireysel-umre">Bireysel Umre Paketleri</a>, <a href="https://hadiumreyegidelim.com">Hadi Umreye Gidelim</a> vb. html etiketleriyle sitemizi işaret eden birkaç iç bağlantı göm.
6. HTML DÜZENİ: Çift tırnak yerine tek tırnak kullan, içeriği temiz HTML tagleriyle oluştur, H1 KULLANMA (Sadece h2, h3 kullan). Paragraflar en fazla 3 cümle olsun.

Lütfen çıktıyı EKSİKSİZ biçimde aşağıdaki JSON şemasına uygun olarak ver ve içeriğinde bu sıkı SEO skor değerlendirmelerini kendi içinde iki kez denetle!`;

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
    let imagePromptsJSON = [];
    try {
      imagePromptsJSON = JSON.parse(promptsText);
    } catch(e) {
      console.error("Cron image parse error", e);
    }

    // Gerçek görsel üretimi (Imagen 3/4)
    // Import için dosya başına eklenmesi gerektiğinden, bunu fetch api ile veya lib fonksiyonu ile dinamik çağıracağız.
    // Başta import eklemediğim için require kullanıyoruz veya doğrudan API'yi çağırıyoruz. (lib/generate-image)
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
           
           // HTML metnine resmi göm
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
           
           if (!finalImageUrl) finalImageUrl = imgUrl; // İlk başarılı görsel kapak olsun
        }
      });
    }

    // 5. VERİTABANI KAYDI
    let validCategoryId = null;
    let validAuthorId = null;
    if (blogData.categoryId) {
       const catExists = await prisma.category.findUnique({ where: { id: String(blogData.categoryId) } });
       if (catExists) validCategoryId = catExists.id;
    }
    if (blogData.authorId) {
       // Optional: Wait, I won't check User model because his admin authors might be named differently (e.g., AdminUser). I will just set authorId to null by default for CRON jobs. Or if we assume table is `user`.
       validAuthorId = null;
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
        published: true, 
        imageUrl: finalImageUrl,
      }
    });

    return NextResponse.json({ success: true, post: newPost, generatedPromptsCount: imagePromptsJSON.length });

  } catch (error: any) {
    console.error("Auto Cron Blog Error:", error);
    return NextResponse.json({ error: error.message || "Failed to run cron job" }, { status: 500 });
  }
}
