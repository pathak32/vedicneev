/**
 * Client-safe subset of @vedicneev/auth — import from "@vedicneev/auth/client"
 * (never the bare "@vedicneev/auth" specifier) from any code that ends up
 * in a browser bundle. The default barrel (./index.ts) re-exports
 * supabaseServerClient.ts, which imports next/headers — valid only in a
 * Server Component/Route Handler, and a hard webpack build failure if it
 * reaches client code. env.ts and phoneFormat.ts are plain functions over
 * process.env/strings with no server-only or Node-only dependency, so
 * they're the only two safe to re-export here.
 */
export * from "./env";
export * from "./phoneFormat";
