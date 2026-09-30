// İç bağlantı kartlarında gösterilen sayfa adları
import { turkeyCities } from "@/lib/turkey-cities";
import { CONTENT_PAGES, contentPath, type ContentPage } from "./index";

const HUBS: Record<string, string> = {
  "/": "Ana sayfa",
  "/bireysel-umre": "Bireysel umre tasarlayıcı",
  "/paketler": "Umre paketleri",
  "/umre-vizesi": "Umre vizesi",
  "/umre-vizesi/basvuru": "Umre vizesi başvurusu",
  "/ilk-umrem": "İlk umrem rehberi",
  "/hanim-umresi": "Hanım umresi",
  "/eylul-umresi": "Eylül umresi",
  "/rehberlik": "Umre rehberliği",
  "/hizmetler": "Transfer ve tren",
  "/blog": "Umre rehber yazıları",
  "/iletisim": "İletişim",
  "/hakkimizda": "Hakkımızda",
  "/umre-rehberi": "Umre rehberi",
};

export function pageTitles(pages: ContentPage[] = CONTENT_PAGES): Record<string, string> {
  const out: Record<string, string> = { ...HUBS };
  for (const c of turkeyCities) out[`/${c.slug}-cikisli-bireysel-umre`] = `${c.name} çıkışlı umre`;
  for (const p of pages) out[contentPath(p)] = p.h1;
  return out;
}
