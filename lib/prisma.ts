import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () =>
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

type PrismaClientType = ReturnType<typeof prismaClientSingleton>;

type PrismaGlobal = typeof globalThis & {
  prisma?: PrismaClientType;
};

const globalForPrisma = globalThis as PrismaGlobal;

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
