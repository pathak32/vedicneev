import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __vedicneevPrisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

let prismaSingleton: PrismaClient | undefined;

// Reuse a single PrismaClient across hot reloads in dev (via `globalThis`,
// Prisma's documented pattern for surviving HMR) and, in production, across
// requests handled by the same warm process/container (a plain module-scoped
// singleton — no `globalThis` needed there, since the module is only
// imported once per process).
function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV !== "production") {
    return (globalThis.__vedicneevPrisma ??= createPrismaClient());
  }
  return (prismaSingleton ??= createPrismaClient());
}

// A Proxy defers the actual `new PrismaClient()` call (which resolves
// DATABASE_URL immediately) until the first property access, not module
// import — so a build step that merely imports this package (type
// resolution, workspace dependency tracing, etc.) can't crash ahead of any
// real query, even when DATABASE_URL isn't set yet.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = Reflect.get(client as object, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

export * from "@prisma/client";
