// Yardım merkezi ortak tanımları (sunucu ve istemci). Konu listesi formda ve admin → Talepler filtresinde kullanılır.
export const SUBJECTS = ["Umre planlama ve rezervasyon", "Umre vizesi", "Ödeme ve fatura", "Rezervasyon değişikliği", "İptal ve iade", "Grup talebi", "İşletme kaydı / iş ortaklığı", "Diğer"] as const;
export type Subject = (typeof SUBJECTS)[number];

/** ContactRequest kimliğinden müşteriye gösterilen takip numarası */
export const ticketOf = (id: string) => `HUG-${id.slice(-6).toUpperCase()}`;
