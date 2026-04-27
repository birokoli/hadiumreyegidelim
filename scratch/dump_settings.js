
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.setting.findMany();
  console.log('--- ALL SETTINGS ---');
  console.log(JSON.stringify(settings, null, 2));
  
  const posts = await prisma.post.findMany({ select: { title: true, slug: true } });
  console.log('--- ALL POST TITLES ---');
  console.log(JSON.stringify(posts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
