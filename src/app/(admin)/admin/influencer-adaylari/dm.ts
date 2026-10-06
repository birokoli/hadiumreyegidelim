export interface DmTemplate {
  id: string;
  name: string;
  channel: "instagram_dm" | "email" | "followup";
  subject?: string;
  content: string;
}

// Şablonlar (6 Ekim): Mayıs 2026'daki ilk davet "yüksek kazanç / yeni nesil program" diliyle ve toplantı şartıyla
// gönderilmiş, çoğu red almıştı. Yeni dil: kişiye özel bir gözlem, kim olduğumuzun kanıtı (19,5 bin takipçi,
// doğrulanmış yorumlar), sade teklif, yük getirmeyen tek adım. {komisyon} ve {indirim} gönderilmeden önce elle yazılır;
// [köşeli parantezli] satırlar kişiye göre doldurulur.
export const DM_TEMPLATES: DmTemplate[] = [
  {
    id: "instagram_dm_short",
    name: "Instagram DM (ilk temas)",
    channel: "instagram_dm",
    content: `Selamün aleyküm {ad} 🌿

[İçeriğinden somut bir şey: "Medine'de sabah namazı sonrası paylaştığınız video" gibi] çok güzeldi, bu yüzden yazıyoruz.

Biz Hadi Umreye Gidelim'iz; umreyi kişinin kendi tarihine ve bütçesine göre planlayan bireysel umre ekibiyiz. Sizinle bir ortaklık kurmak isteriz: takipçilerinize özel {indirim} indirim kodu, kodunuzla gelen her umre kaydından size {komisyon}. Paylaşım sayısı ya da takvim şartı yok.

Uygunsa e-postanızı yazın, detayları oradan gönderelim. Ya da doğrudan bakabilirsiniz: {davet}`
  },
  {
    id: "email_long",
    name: "E-posta (iş birliği teklifi)",
    channel: "email",
    subject: "Umre içerikleriniz için bir ortaklık önerisi",
    content: `Selamün aleyküm {ad},

Hadi Umreye Gidelim'den yazıyorum. [İçeriğinden somut bir gözlem, tek cümle.] Takipçilerinizle kurduğunuz bu bağ, size yazmamızın sebebi.

Kısaca biz: insanların umresini kendi tarihine ve bütçesine göre planlayan bireysel umre ekibiyiz. Vize, otel, transfer ve rehberliği tek elden ayarlıyoruz. Instagram'da 19.500 kişilik bir topluluğumuz var; misafirlerimizin yorumlarını sitemizde doğrulanmış olarak yayınlıyoruz: hadiumreyegidelim.com/yorumlar

Önerimiz basit bir ortaklık:
• Takipçilerinize özel {indirim} indirim kodu
• Kodunuz ya da bağlantınızla gelen her umre kaydından {komisyon} komisyon
• Tıklamaları, kayıtları ve kazancınızı kendi panelinizden anlık görürsünüz
• Kazancınızı nakit alabilir ya da kendi umreniz için kullanabilirsiniz

Sizden belirli sayıda paylaşım ya da sabit bir takvim istemiyoruz. Umreyi zaten konuştuğunuz anlarda kodunuzu paylaşmanız yeterli; hikâyelerinizde kullanabileceğiniz hazır görselleri de biz hazırlıyoruz.

İlginizi çekerse bu e-postaya kısa bir cevap yeterli; detayları yazışarak ya da istersiniz 15 dakikalık bir görüşmeyle anlatırız. Başvuru bağlantınız da hazır:
{davet}

Hayırlı çalışmalar dilerim,
[Ad Soyad]
Hadi Umreye Gidelim
info@hadiumreyegidelim.com · [WhatsApp numarası]`
  },
  {
    id: "followup_5days",
    name: "Takip (5–7 gün sonra, tek sefer)",
    channel: "followup",
    content: `Selamün aleyküm {ad},

Geçen hafta gönderdiğim ortaklık önerisi araya kaçmış olabilir diye kısaca yazıyorum. Özeti: takipçilerinize özel {indirim} indirim kodu, kodunuzla gelen her umre kaydından {komisyon} komisyon, paylaşım şartı yok.

Şu an uygun değilse hiç sorun değil, bir cevap yazmanız bile yeter. Bakmak isterseniz: {davet}

Hayırlı günler dilerim.`
  }
];

export function fillTemplate(
  templateContent: string,
  params: { ad?: string; platform?: string; komisyon?: string; davet?: string }
): string {
  return templateContent
    .replaceAll("{ad}", params.ad || "Değerli İçerik Üreticisi")
    .replaceAll("{platform}", params.platform || "Instagram")
    .replaceAll("{komisyon}", params.komisyon || "{komisyon}")
    .replaceAll("{davet}", params.davet || "[DAVET_BAGLANTISI]");
}
