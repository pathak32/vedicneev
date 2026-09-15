/**
 * Canonical origin for the Institute Suite (omrtest.vedicneev.com) —
 * VedicNeev's B2B batch OMR grading/analytics/Mistake Vault product for
 * coaching institutes, on its own subdomain so its deploy cadence and
 * traffic never risk the student-facing app's uptime. Same
 * NEXT_PUBLIC_APP_URL-style override convention as siteConfig.ts: falls
 * back to the real production host so local dev without the var set still
 * links somewhere sensible.
 */
const INSTITUTE_SUITE_ORIGIN = process.env.NEXT_PUBLIC_INSTITUTE_APP_URL || "https://omrtest.vedicneev.com";

/**
 * Builds an outbound Institute Suite link tagged with UTM params. `path`
 * should be "/login" or "/dashboard" — SiteHeader.tsx picks between them
 * based on the vn_institute_admin flag cookie (see partnerFlag.ts); this
 * helper never guesses that on its own.
 */
export function institutePartnerUrl(path: string, utmMedium: string): string {
  const url = new URL(path, INSTITUTE_SUITE_ORIGIN);
  url.searchParams.set("utm_source", "vedicneev");
  url.searchParams.set("utm_medium", utmMedium);
  return url.toString();
}
