// Ramazan rezervasyonlarında ödeme (25 Ekim, kullanıcı): "yakında ödeme altyapısı API'si gelecek; gelince ödemeler doğrudan
// sistemden alınacak, şimdilik WhatsApp". Bugün sağlayıcı yok: müşteriye ödeme bilgisi WhatsApp'tan gider, yönetici admin'de
// "Ödendi"ye basar. API gelince yapılacaklar:
//   1. Aşağıdaki OdemeSaglayici arayüzünü sağlayıcının API'siyle uygulayan bir nesne yazılır (baslat + bildirimDogrula).
//   2. SAGLAYICILAR'a eklenir; Vercel'de RAMAZAN_ODEME_SAGLAYICI=<ad> ve sağlayıcının anahtarları tanımlanır.
//   3. Sağlayıcının panelinde ödeme bildirimi (webhook) adresi: https://hadiumreyegidelim.com/api/ramazan/odeme/bildirim
// Bundan sonra rezervasyonun onay ekranında "Şimdi öde" düğmesi çıkar; ödeme bildirimi gelince kayıt kendiliğinden "ödendi" olur.

export type OdemeBaslat = { kod: string; toplamUsd: number; adSoyad: string; telefon: string; eposta: string | null; aciklama: string };
export type OdemeBildirimi = { kod: string; ref: string; tutarUsd: number; basarili: boolean };

export interface OdemeSaglayici {
  /** Kısa ad (veritabanına "odemeYontemi" olarak yazılır) */
  ad: string;
  /** Ödeme sayfası oluşturur; müşteri bu adrese yönlendirilir */
  baslat(g: OdemeBaslat): Promise<{ url: string; ref: string }>;
  /** Sağlayıcıdan gelen bildirimi imzasıyla doğrular; geçersizse null */
  bildirimDogrula(req: Request): Promise<OdemeBildirimi | null>;
}

const SAGLAYICILAR: Record<string, OdemeSaglayici> = {
  // örnek: paytr: paytrSaglayici,
};

/** Etkin sağlayıcı; tanımlı değilse null (WhatsApp ile ödeme) */
export function odemeSaglayici(): OdemeSaglayici | null {
  const ad = process.env.RAMAZAN_ODEME_SAGLAYICI?.trim();
  return ad ? SAGLAYICILAR[ad] ?? null : null;
}
