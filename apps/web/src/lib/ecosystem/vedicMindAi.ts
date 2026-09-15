/**
 * Canonical origin for Vedic Mind AI (vedicmindai.in) — VedicNeev's sibling
 * product for foundational mental-math/Vedic-sutra practice (see
 * CLAUDE.md: VedicNeev is a child app of Vedic Mind AI).
 */
const VEDIC_MIND_AI_ORIGIN = "https://www.vedicmindai.in";

/**
 * Builds an outbound Vedic Mind AI link tagged with UTM params, so its
 * analytics can attribute the click back to this specific placement
 * (`utmMedium`) on VedicNeev.
 */
export function vedicMindAiUrl(path: string, utmMedium: string): string {
  const url = new URL(path, VEDIC_MIND_AI_ORIGIN);
  url.searchParams.set("utm_source", "vedicneev");
  url.searchParams.set("utm_medium", utmMedium);
  return url.toString();
}
