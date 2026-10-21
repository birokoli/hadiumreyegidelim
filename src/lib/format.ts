// Ortak biçimlendiriciler (site genelinde fiyat ve tarih tek biçimde görünür)

const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", EUR: "€", TRY: "₺", SAR: "SAR" };

/** 1250, "USD" → "1.250 $" */
export function formatPrice(price: number, currency = "USD") {
  // ",99" fiyatlı paketlerde (21 Ekim) kuruş gösterilir: 215,99 $; diğer fiyatlar tam sayı
  const kurus = Math.round((price % 1) * 100) === 99 ? 2 : 0;
  return `${price.toLocaleString("tr-TR", { minimumFractionDigits: kurus, maximumFractionDigits: kurus })} ${CURRENCY_SYMBOL[currency] ?? currency}`;
}

/** "12 Eylül 2026" */
export function formatDate(d: Date | string, withYear = true) {
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", ...(withYear ? { year: "numeric" } : {}) });
}
