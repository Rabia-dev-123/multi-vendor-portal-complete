import {
  PrismaClient,
  type Prisma,
  type UserRole,
} from "@/app/generated/prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma, type Prisma, type UserRole };
export default prisma;
