/**
 * Edge-Runtime-safe subset of @vedicneev/auth — import from
 * "@vedicneev/auth/edge" (never the bare "@vedicneev/auth" specifier) from
 * any middleware.ts, which Next.js always runs on the Edge Runtime. The
 * default barrel (./index.ts) re-exports otpCrypto.ts (Node's `crypto`
 * module) and resolveDbUser.ts/whatsappOtp.ts (Prisma) transitively —
 * none of that is Edge-compatible, even though middleware only ever needs
 * refreshSession.ts's session refresh. env.ts and refreshSession.ts have no
 * Node-only or Prisma dependency (just next/server and @supabase/ssr, both
 * Edge-safe), so they're the only two re-exported here. See client.ts for
 * the analogous client-bundle split.
 */
export * from "./env";
export * from "./refreshSession";
