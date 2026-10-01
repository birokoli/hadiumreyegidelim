// Hizmet Kütüphanesi formundan gelen katalog alanları (yalnızca gönderilenler güncellenir)
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const int = (v: unknown) => (v === "" || v == null || Number.isNaN(Number(v)) ? null : Math.round(Number(v)));
const slugify = (v: string) =>
  v.toLocaleLowerCase("tr").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function catalogFields(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  if ("isPublic" in body) out.isPublic = Boolean(body.isPublic);
  if ("slug" in body) out.slug = str(body.slug) ? slugify(String(body.slug)) : null;
  if ("city" in body) out.city = str(body.city);
  if ("imageUrl" in body) out.imageUrl = str(body.imageUrl);
  if ("publicDescription" in body) out.publicDescription = str(body.publicDescription);
  if ("hotelStars" in body) out.hotelStars = int(body.hotelStars);
  if ("distanceMeters" in body) out.distanceMeters = int(body.distanceMeters);
  // Sitede görünen kalemin adresi olsun: slug boşsa addan üret
  if (out.isPublic && !out.slug && typeof body.name === "string") out.slug = slugify(body.name);
  return out;
}
