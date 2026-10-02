// YALNIZCA YEREL TEST: yerel test veritabanına test yöneticisi açar. Şifre her çalıştırmada rastgele üretilir
// ve scripts/local/.test-admin.json'a yazılır (git'e girmez). Canlıda kullanılmaz.
import { randomBytes } from "crypto";
import { writeFileSync } from "fs";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../../src/generated/prisma";

const url = process.env.DATABASE_URL ?? "";
if (!/@(127\.0\.0\.1|localhost):5432\//.test(url)) throw new Error("Güvenlik: yalnızca yerel veritabanı.");
const prisma = new PrismaClient({ datasources: { db: { url } } });
const password = randomBytes(12).toString("base64url");
await prisma.adminUser.upsert({
  where: { username: "yerel-test" },
  update: { password: await bcrypt.hash(password, 10), status: "active", role: "super_admin" },
  create: { name: "Yerel Test", username: "yerel-test", email: "yerel-test@localhost.test", password: await bcrypt.hash(password, 10), role: "super_admin", permissions: "[]" },
});
writeFileSync(new URL("./.test-admin.json", import.meta.url), JSON.stringify({ username: "yerel-test", password }));
console.log("test yöneticisi hazır (bilgiler scripts/local/.test-admin.json)");
await prisma.$disconnect();
