/**
 * Mints (or updates) one PromoCode row — the per-video "digital tag" for a
 * /buy/[productId]?promo=CODE deep link. Pair one code per video: even at
 * 0% discount, PromoCode.usageCount increments on every confirmed PAID
 * purchase made with that code (see /api/webhook/payment), so this doubles
 * as a free per-video conversion count with no separate analytics needed.
 * No admin UI exists for this yet (seed-store.ts's own header note: only
 * one illustrative code is seeded) — this script is the practical way to
 * create one from the command line in the meantime.
 *
 * Run with:
 *   npx tsx apps/web/scripts/create-promo-code.mts --code=UPSSVIDEO1 --name="YouTube: UPSS Sainik School" [--discount=10] [--type=PERCENTAGE|FIXED] [--commission=0]
 *
 * --discount defaults to 0 (a pure tracking tag, no viewer discount).
 * --type defaults to PERCENTAGE. --commission (an influencer revenue-share
 * percentage) defaults to 0 — set it only for a real affiliate deal.
 */
import fs from "node:fs";
import path from "node:path";

for (const line of fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8").split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)="?(.*?)"?$/);
  if (m) process.env[m[1]!] = m[2];
}

import { prisma } from "@vedicneev/db";

function parseArgs() {
  const get = (name: string, fallback?: string) => {
    const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
    return arg ? arg.slice(name.length + 3) : fallback;
  };
  const code = get("code");
  const name = get("name");
  if (!code || !name) {
    console.error('Usage: npx tsx apps/web/scripts/create-promo-code.mts --code=UPSSVIDEO1 --name="YouTube: UPSS Sainik School" [--discount=10] [--type=PERCENTAGE|FIXED] [--commission=0]');
    process.exit(1);
  }
  const discountType = (get("type", "PERCENTAGE") as "PERCENTAGE" | "FIXED");
  if (discountType !== "PERCENTAGE" && discountType !== "FIXED") {
    console.error("--type must be PERCENTAGE or FIXED");
    process.exit(1);
  }
  const discountValue = Number(get("discount", "0"));
  const commissionRate = Number(get("commission", "0"));
  return { code: code.trim().toUpperCase(), name, discountType, discountValue, commissionRate };
}

async function main() {
  const { code, name, discountType, discountValue, commissionRate } = parseArgs();

  const promo = await prisma.promoCode.upsert({
    where: { code },
    update: { discountType, discountValue, influencerName: name, commissionRate, isActive: true },
    create: { code, discountType, discountValue, influencerName: name, commissionRate, isActive: true },
  });

  console.log(`Promo code ready: ${promo.code}`);
  console.log(`  ${discountType === "PERCENTAGE" ? `${discountValue}% off` : `Rs.${discountValue} off`} · tracked as "${name}"`);
  console.log(`  Append ?promo=${promo.code} to any /buy/<productId> link to auto-apply it.`);
  console.log(`  Check conversions any time with: SELECT usage_count FROM promo_codes WHERE code = '${promo.code}';`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
