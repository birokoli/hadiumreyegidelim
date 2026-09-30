// Bütün rehber sayfalarının kaydı. Yeni sayfa: src/content/pages/<slug>.ts dosyasını yaz,
// buraya import et ve CONTENT_PAGES listesine ekle. Sonra: npx tsx scripts/check-content-pages.mts
import type { ContentPage } from "./types";
import ihramNedir from "./ihram-nedir";
import tavafNedir from "./tavaf-nedir";
import sayNedir from "./say-nedir";
import mikatNedir from "./mikat-nedir";
import tirasNedir from "./tiras-nedir";
import bireyselUmreMiTurlaUmreMi from "./bireysel-umre-mi-turla-umre-mi";
import ekonomikUmreMiLuksUmreMi from "./ekonomik-umre-mi-luks-umre-mi";
import onceMekkeMiMedineMi from "./once-mekke-mi-medine-mi";
import umreMiHacMi from "./umre-mi-hac-mi";
import aileUmresi from "./aile-umresi";
import yasliUmresi from "./yasli-umresi";
import tekerlekliSandalyeIleUmre from "./tekerlekli-sandalye-ile-umre";
import ogrenciUmresi from "./ogrenci-umresi";
import ekimUmresi from "./ekim-umresi";
import kasimUmresi from "./kasim-umresi";
import aralikUmresi from "./aralik-umresi";
import ocakUmresi from "./ocak-umresi";
import subatUmresi from "./subat-umresi";
import martUmresi from "./mart-umresi";
import nisanUmresi from "./nisan-umresi";
import ramazanUmresi from "./ramazan-umresi";
import somestrUmresi from "./somestr-umresi";

export const CONTENT_PAGES: ContentPage[] = [
  ihramNedir,
  tavafNedir,
  sayNedir,
  mikatNedir,
  tirasNedir,
  bireyselUmreMiTurlaUmreMi,
  ekonomikUmreMiLuksUmreMi,
  onceMekkeMiMedineMi,
  umreMiHacMi,
  aileUmresi,
  yasliUmresi,
  tekerlekliSandalyeIleUmre,
  ogrenciUmresi,
  ekimUmresi,
  kasimUmresi,
  aralikUmresi,
  ocakUmresi,
  subatUmresi,
  martUmresi,
  nisanUmresi,
  ramazanUmresi,
  somestrUmresi,
];

export const getContentPage = (slug: string) => CONTENT_PAGES.find((p) => p.slug === slug);
export { contentPath } from "./types";
export type { ContentPage, ContentGroup, ContentSection } from "./types";
