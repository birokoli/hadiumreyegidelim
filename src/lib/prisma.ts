import { PrismaClient } from '../generated/prisma'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Build sırasında her işçi az bağlantı açsın (sayfalar önceden üretilirken bağlantı sınırı dolmasın)
function databaseUrl() {
  const url = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres"
  if (process.env.NEXT_PHASE !== "phase-production-build" || /[?&]connection_limit=/.test(url)) return url
  return `${url}${url.includes("?") ? "&" : "?"}connection_limit=2&pool_timeout=30`
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl(),
      },
    },
    log: [],
  })

globalForPrisma.prisma = prisma
