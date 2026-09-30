// Rehber sayfalarında bağlantı verilebilecek site içi yollar (denetim betiği ve admin düzenleyicisi ortak kullanır)
import { turkeyCities } from "@/lib/turkey-cities";
import { CONTENT_PAGES } from "./index";
import { contentPath } from "./types";

export const HUB_PATHS = [
  "/", "/bireysel-umre", "/paketler", "/umre-vizesi", "/umre-vizesi/basvuru", "/ilk-umrem", "/hanim-umresi", "/eylul-umresi", "/rehberlik",
  "/hizmetler", "/blog", "/iletisim", "/hakkimizda", "/umre-rehberi",
];

export function knownContentPaths(): Set<string> {
  return new Set<string>([
    ...HUB_PATHS,
    ...turkeyCities.map((c) => `/${c.slug}-cikisli-bireysel-umre`),
    ...CONTENT_PAGES.map(contentPath),
  ]);
}
