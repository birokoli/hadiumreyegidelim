// Ortak biçimlendiriciler (site genelinde fiyat ve tarih tek biçimde görünür)

const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", EUR: "€", TRY: "₺", SAR: "SAR" };

/** 1250, "USD" → "1.250 $" */
export function formatPrice(price: number, currency = "USD") {
  return `${price.toLocaleString("tr-TR", { maximumFractionDigits: 0 })} ${CURRENCY_SYMBOL[currency] ?? currency}`;
}

/** "12 Eylül 2026" */
export function formatDate(d: Date | string, withYear = true) {
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", ...(withYear ? { year: "numeric" } : {}) });
}
