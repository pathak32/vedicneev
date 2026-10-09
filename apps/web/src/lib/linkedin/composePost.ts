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

/** The three links added under every post: parent site, institute product page, blog. */
function linkFooter(campaign: string): string {
  return [
    `Vedic Mind AI: ${tagged("https://www.vedicmindai.in/", campaign)}`,
    `OMR grading for institutes (10 free credits): ${tagged("https://www.vedicneev.com/for-institutes", campaign)}`,
    `Blog: ${tagged("https://www.vedicneev.com/blog", campaign)}`,
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
    linkFooter(campaign),
    "",
    BRAND_SIGNOFF[block.brand],
  ].join("\n");
}
