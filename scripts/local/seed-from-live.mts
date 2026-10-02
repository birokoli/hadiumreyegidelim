// YALNIZCA YEREL TEST: canlı sitenin herkese açık API'lerinden (yalnızca GET) okunan verileri yerel test veritabanına yazar.
// Kullanım: DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres npx tsx scripts/local/seed-from-live.mts
import { PrismaClient } from "../../src/generated/prisma";

const url = process.env.DATABASE_URL ?? "";
if (!/@(127\.0\.0\.1|localhost):5432\//.test(url)) throw new Error("Güvenlik: bu betik yalnızca yerel veritabanında çalışır.");
const prisma = new PrismaClient({ datasources: { db: { url } } });
const BASE = "https://hadiumreyegidelim.com";
const get = (p: string) => fetch(BASE + p).then((r) => r.json());

const packages = await get("/api/packages");
for (const p of packages) {
  await prisma.package.upsert({ where: { slug: p.slug }, update: {}, create: { ...p, createdAt: new Date(p.createdAt), updatedAt: new Date(p.updatedAt) } });
}
const hotels = [...(await get("/api/hotels?city=Mekke")), ...(await get("/api/hotels?city=Medine"))];
for (const h of hotels) {
  await prisma.service.upsert({ where: { id: h.id }, update: {}, create: { id: h.id, type: "HOTEL", name: h.name, description: h.description ?? null, price: Number(h.price) || 0, extraData: JSON.stringify({ city: h.city, stars: h.stars, distanceText: h.distanceText, images: h.images }) } }).catch(() => {});
}
const services = await get("/api/services");
for (const s of services) {
  await prisma.service.upsert({ where: { id: s.id }, update: {}, create: { id: s.id, type: s.type, name: s.name, description: s.description ?? null, price: Number(s.price) || 0, extraData: s.extraData ?? null } }).catch(() => {});
}
await prisma.setting.upsert({ where: { key: "WHATSAPP_NUMBER" }, update: {}, create: { key: "WHATSAPP_NUMBER", value: "905404010038" } });
console.log({ packages: packages.length, hotels: hotels.length, services: services.length, servicesInDb: await prisma.service.count() });
await prisma.$disconnect();
