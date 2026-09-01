import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __vedicneevPrisma: PrismaClient | undefined;
}

// Reuse a single PrismaClient across hot reloads in dev, and across
// serverless invocations sharing a container, to avoid exhausting the
// Supabase connection pool.
export const prisma =
  globalThis.__vedicneevPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__vedicneevPrisma = prisma;
}

export * from "@prisma/client";
