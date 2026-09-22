import type { ContentBlock } from "@vedicneev/db";

/**
 * Every LinkedIn post — VEDIC_MIND or VEDIC_NEEV block alike — closes on
 * the same parent-brand signoff, per the brand hierarchy: Vedic Mind AI is
 * the cognitive-mastery philosophy, VedicNeev is its institutional
 * execution arm, and the LinkedIn page speaks in the parent brand's voice
 * either way rather than switching identity per post.
 */
const BRAND_SIGNOFF: Record<ContentBlock["brand"], string> = {
  VEDIC_MIND: "— Vedic Mind AI",
  VEDIC_NEEV: "— VedicNeev, powered by Vedic Mind AI",
};

/** Joins a ContentBlock's hook/body/CTA into the exact plain-text shareCommentary LinkedIn's UGC Posts API expects. */
export function composeLinkedInPost(block: Pick<ContentBlock, "brand" | "hookText" | "bodyContent" | "ctaText">): string {
  return [block.hookText, "", block.bodyContent, "", block.ctaText, "", BRAND_SIGNOFF[block.brand]].join("\n");
}
