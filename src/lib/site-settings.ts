// Sitenin herkese açık ayarları (renkler, ana sayfa metinleri, kampanyalar, WhatsApp, menü...)
// tek sorguda okunur ve önbelleğe alınır. Her sayfa açılışında veritabanına gidilmez.
// Admin bir ayarı kaydedince revalidateSiteSettings() önbelleği tazeler.

import { revalidateTag, unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const SITE_SETTINGS_TAG = "site-settings";

// Ayarlar tablosunda admin araçlarının büyük JSON verileri de duruyor; siteye taşınmaz
const PRIVATE_PREFIXES = ["SEO_", "AI_VIS_", "ANTHROPIC_", "ADMIN_", "AI_MONTHLY", "AUTO_BLOG", "GEO_BLOG", "WHATSAPP_AI", "WHATSAPP_BOT", "JWT", "CRON", "CONTENT_PAGE", "HOTEL_G:", "HOTEL_C:", "HOTEL_O:"];
// Vercel önbellek girdisi en fazla 2 MB; tek değer 20 KB'ı geçerse siteye taşınmaz
export const MAX_VALUE_LENGTH = 20_000;

export const isPublicKey = (key: string) => !PRIVATE_PREFIXES.some((p) => key.toUpperCase().startsWith(p));

async function querySettings(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany({ select: { key: true, value: true } });
  const out: Record<string, string> = {};
  for (const r of rows) {
    if (isPublicKey(r.key) && r.value.length <= MAX_VALUE_LENGTH) out[r.key] = r.value;
  }
  return out;
}

// Hata fırlatırsa önbelleğe alınmaz (anlık bir veritabanı hatası 10 dk boş ayar olarak kalmasın)
const readSettings = unstable_cache(querySettings, ["site-settings-v2"], { tags: [SITE_SETTINGS_TAG], revalidate: 600 });

/** Önce önbellek; önbellek hata verirse doğrudan veritabanı (site asla boş ayarla açılmasın) */
export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    return await readSettings();
  } catch (e) {
    console.error("[site-settings] önbellekten okunamadı, doğrudan okunuyor", e);
  }
  try {
    return await querySettings();
  } catch (e) {
    console.error("[site-settings] ayarlar okunamadı", e);
    return {};
  }
}

/** Ayar kaydeden uç noktalar çağırır; sonraki ziyarette sayfalar yeni ayarla üretilir */
export function revalidateSiteSettings() {
  try {
    // Hemen düşür: admin kaydettiği değişikliği bir sonraki açılışta görsün
    revalidateTag(SITE_SETTINGS_TAG, { expire: 0 });
  } catch {
    /* önbellek tazeleme kaydı engellemez */
  }
}
