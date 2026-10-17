import type { ContentBlock } from "@vedicneev/db";

/**
 * Every LinkedIn post, VEDIC_MIND or VEDIC_NEEV alike, closes on the same
 * parent-brand signoff, per the brand hierarchy: Vedic Mind AI is the
 * cognitive-mastery philosophy, VedicNeev is its institutional execution
 * arm, and the LinkedIn voice speaks for the parent brand either way.
 */
const BRAND_SIGNOFF: Record<ContentBlock["brand"], string> = {
  VEDIC_MIND: "— Vedic Mind AI",
  VEDIC_NEEV: "— VedicNeev, powered by Vedic Mind AI",
};

/** Appends campaign tags so /for-institutes sign-ups record which post brought them (see CoachingLead.source). */
function tagged(url: string, campaign: string): string {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}utm_source=linkedin&utm_medium=post&utm_campaign=${campaign}`;
}

/**
 * Three links under every post, chosen to fit who the post is for. Vedic Mind
 * AI posts send readers to the product they can try right now (the speed-math
 * test and the quick demo) plus its blog; VedicNeev posts send institute
 * owners to the free OMR trial, the VedicNeev blog and the parent site.
 */
function linkFooter(brand: ContentBlock["brand"], campaign: string): string {
  if (brand === "VEDIC_MIND") {
    return [
      `Try the free speed-math test: ${tagged("https://www.vedicmindai.in/tools/speed-math-test", campaign)}`,
      `See the quick AI maths demo: ${tagged("https://www.vedicmindai.in/demo", campaign)}`,
      `Vedic Mind AI blog: ${tagged("https://www.vedicmindai.in/blog", campaign)}`,
    ].join("\n");
  }
  return [
    `OMR grading for institutes (10 free credits): ${tagged("https://www.vedicneev.com/for-institutes", campaign)}`,
    `VedicNeev blog: ${tagged("https://www.vedicneev.com/blog", campaign)}`,
    `Vedic Mind AI: ${tagged("https://www.vedicmindai.in/", campaign)}`,
  ].join("\n");
}

/** Joins a ContentBlock's hook/body/CTA, the link footer and the brand signoff into the plain-text shareCommentary LinkedIn's API expects. */
export function composeLinkedInPost(
  block: Pick<ContentBlock, "id" | "brand" | "hookText" | "bodyContent" | "ctaText">
): string {
  const campaign = `post-${block.id.slice(-8)}`;
  return [
    block.hookText,
    "",
    block.bodyContent,
    "",
    block.ctaText,
    "",
    linkFooter(block.brand, campaign),
    "",
    BRAND_SIGNOFF[block.brand],
  ].join("\n");
}
