/**
 * Read-only sanity check, run BEFORE the real (non-dry-run)
 * package-question-books.mts, to confirm the environment variables in
 * .env actually point at a real, reachable Supabase/Postgres project —
 * without writing, uploading, or changing anything. Prints just enough
 * identifying detail (project URL host, a row count, bucket names) for a
 * human to visually confirm "yes, that's production" before the real run.
 *
 * Run with: npx tsx apps/web/scripts/verify-production-connection.mts
 */
import fs from "node:fs";
import path from "node:path";

for (const line of fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8").split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)="?(.*?)"?$/);
  if (m) process.env[m[1]!] = m[2];
}

import authRuntime from "@vedicneev/auth";
const { createSupabaseAdminClient } = authRuntime as unknown as typeof import("@vedicneev/auth");
import { prisma } from "@vedicneev/db";

async function main() {
  console.log("--- Environment ---");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  console.log("NEXT_PUBLIC_SUPABASE_URL host:", supabaseUrl ? new URL(supabaseUrl).host : "NOT SET");
  console.log("SUPABASE_SERVICE_ROLE_KEY set:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log("DATABASE_URL set:", !!process.env.DATABASE_URL);
  console.log("DIRECT_URL set:", !!process.env.DIRECT_URL);

  console.log("\n--- Database (Prisma) ---");
  const [userCount, productCount, purchaseCount] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.purchase.count(),
  ]);
  console.log("Existing users:", userCount);
  console.log("Existing products:", productCount);
  console.log("Existing purchases:", purchaseCount);

  console.log("\n--- Storage (Supabase) ---");
  const admin = createSupabaseAdminClient();
  const { data: buckets, error } = await admin.storage.listBuckets();
  if (error) {
    console.error("Could not list storage buckets:", error.message);
  } else {
    console.log("Buckets found:", buckets.map((b) => b.name).join(", "));
  }

  console.log("\nIf the host above matches your real Supabase project, and the counts/buckets look like your real live data (not zero/empty, unless this genuinely is a brand-new project), you're pointed at production.");
}

main()
  .catch((err) => {
    console.error("Connection check FAILED:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
