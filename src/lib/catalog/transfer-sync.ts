// Transfer listesi (araç × rota) → Hizmet Kütüphanesi. Admin düğmesi ve tek seferlik veri düzeltmesi aynı işlevi kullanır.
import { prisma } from "@/lib/prisma";
import { DEFAULT_MARGIN, monthsFrom } from "@/lib/catalog";
import { TRANSFER_ROUTES, TRANSFER_SLUG_PREFIX, TRANSFER_VEHICLES, transferSlug } from "@/lib/catalog/transfers";

export const TRANSFER_EXPECTED = TRANSFER_ROUTES.reduce((n, r) => n + Object.keys(r.prices).length, 0);

export async function syncTransferList() {
  // Toplu yazım: canlıda tek tek 1.300+ sorgu süre sınırına takılıp listeyi yarım bırakıyordu (2 Ekim)
  const months = monthsFrom(undefined, 13);
  const margin = DEFAULT_MARGIN.default;
  const rows = TRANSFER_ROUTES.flatMap((route) =>
    TRANSFER_VEHICLES.flatMap((v) => {
      const price = route.prices[v.key];
      if (price == null) return [];
      return [{
        slug: transferSlug(route.key, v.key),
        price,
        data: {
          category: route.kind === "tur" ? "tur" : "transfer",
          name: `${route.label} · ${v.label}`,
          publicDescription: [route.note, v.note].filter(Boolean).join(" · "),
          defaultPricingType: "per_vehicle",
          defaultVehicleType: v.key,
          // Liste satış fiyatıdır; aylık fiyat yoksa geri düşülen maliyet, kâr payıyla yine bu fiyatı verecek şekilde yazılır
          defaultCostUsd: Math.round((price / (1 + margin / 100)) * 100) / 100,
          isActive: true,
          isPublic: true,
        },
      }];
    }),
  );
  const existing = await prisma.serviceLibrary.findMany({ where: { slug: { in: rows.map((r) => r.slug) } }, select: { slug: true } });
  const have = new Set(existing.map((e) => e.slug));
  const toCreate = rows.filter((r) => !have.has(r.slug));
  if (toCreate.length) await prisma.serviceLibrary.createMany({ data: toCreate.map((r) => ({ ...r.data, slug: r.slug })), skipDuplicates: true });
  const toUpdate = rows.filter((r) => have.has(r.slug));
  for (let i = 0; i < toUpdate.length; i += 25) {
    await prisma.$transaction(toUpdate.slice(i, i + 25).map((r) => prisma.serviceLibrary.update({ where: { slug: r.slug }, data: r.data })));
  }
  const ids = await prisma.serviceLibrary.findMany({ where: { slug: { in: rows.map((r) => r.slug) } }, select: { id: true, slug: true } });
  const priceBySlug = new Map(rows.map((r) => [r.slug, r.price]));
  await prisma.servicePrice.deleteMany({ where: { serviceId: { in: ids.map((x) => x.id) }, month: { in: months }, variant: "" } });
  await prisma.servicePrice.createMany({
    data: ids.flatMap((x) => months.map((month) => ({ serviceId: x.id, month, variant: "", salePriceUsd: priceBySlug.get(x.slug!)! }))),
  });
  const created = toCreate.length;
  const updated = toUpdate.length;
  // Eski araç transferleri (Accord, ECO VIP vb.) sitede gizlenir; kayıtları silinmez. Kişi başı (tren) kalemlerine dokunulmaz.
  const hidden = await prisma.serviceLibrary.updateMany({
    where: { category: "transfer", defaultPricingType: "per_vehicle", isPublic: true, OR: [{ slug: null }, { NOT: { slug: { startsWith: TRANSFER_SLUG_PREFIX } } }] },
    data: { isPublic: false },
  });
  return { created, updated, hiddenOld: hidden.count };
}
