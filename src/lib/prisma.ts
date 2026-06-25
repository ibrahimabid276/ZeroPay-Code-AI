import { PrismaClient } from '@prisma/client';

// Singleton pattern to prevent multiple Prisma instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use Proxy to lazily initialize PrismaClient only when actually used
// This allows the module to be imported during build without errors
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient();
      
      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = globalForPrisma.prisma;
      }
    }
    return Reflect.get(globalForPrisma.prisma, prop);
  },
});

export default prisma;
