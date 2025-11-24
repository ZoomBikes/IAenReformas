// Prisma Client singleton
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Usar DATABASE_URL (estándar de Prisma)
// También verifica POSTGRES_URL como fallback (compatibilidad Vercel)
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.warn('⚠️ DATABASE_URL no está configurada. Algunas funcionalidades no estarán disponibles.');
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

