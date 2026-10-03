// Sunucu tarafı: bir sayfanın metinlerini (admin'de değiştirilenler + koddaki varsayılanlar) döndürür.
// Kullanım (sunucu bileşeni): const t = await getPageTexts("hakkimizda"); ... {t("title")}
import { getSiteSettings } from "@/lib/site-settings";
import { pageTextDef, pageTextsSettingKey } from "./registry";

export async function getPageTexts(id: string): Promise<(key: string) => string> {
  const def = pageTextDef(id);
  const settings = await getSiteSettings().catch(() => ({} as Record<string, string>));
  let saved: Record<string, string> = {};
  try {
    saved = JSON.parse(settings[pageTextsSettingKey(id)] || "{}");
  } catch {
    saved = {};
  }
  return (key: string) => {
    const v = saved[key];
    if (typeof v === "string" && v.trim()) return v;
    return def?.fields.find((f) => f.key === key)?.default ?? "";
  };
}
