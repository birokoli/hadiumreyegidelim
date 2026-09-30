// Admin'de içerik değişince ilgili herkese açık sayfaların önbelleğini tazeler.
// Sayfalar 5 dakikalık önbellekte tutulur; bu çağrı değişikliğin beklemeden görünmesini sağlar.

import { revalidatePath } from "next/cache";

const PATHS = {
  packages: [["/"], ["/paketler"], ["/paketler/[slug]", "page"]],
  guides: [["/rehberlik"], ["/rehber/[slug]", "page"]],
  posts: [["/"], ["/blog"], ["/blog/[slug]", "page"], ["/sitemap.xml"]],
  services: [["/hizmetler"]],
} as const;

export function revalidatePublic(kind: keyof typeof PATHS) {
  for (const [path, type] of PATHS[kind] as readonly (readonly [string, ("page" | "layout")?])[]) {
    try {
      if (type) revalidatePath(path, type);
      else revalidatePath(path);
    } catch {
      /* önbellek tazeleme kaydı engellemez */
    }
  }
}
