import { PrismaClient } from '@prisma/client';

// Singleton pattern to prevent multiple Prisma instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Only initialize Prisma if DATABASE_URL is available
// This prevents build-time errors when env vars aren't set
export const prisma = globalForPrisma.prisma ?? (
  process.env.DATABASE_URL
    ? new PrismaClient()
    : null as unknown as PrismaClient
);

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
