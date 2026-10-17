import type { ContentBlock } from "@vedicneev/db";

/** Only the Vedic maths posts get an image card for now. */
export function shouldHaveCard(block: Pick<ContentBlock, "brand" | "category">): boolean {
  return block.brand === "VEDIC_MIND" && block.category === "VEDIC_MATH";
}

export interface CardContent {
  title: string;
  lines: string[];
  challenge: string;
}

const MAX_LINE = 120;
const MAX_BODY_CHARS = 300;
const MAX_LINES = 6;

function trimLine(line: string): string {
  const clean = line.replace(/\s+/g, " ").trim();
  return clean.length <= MAX_LINE ? clean : `${clean.slice(0, MAX_LINE - 1).trimEnd()}...`;
}

/**
 * Picks what fits on a card from a post: the hook becomes the title, the
 * worked example (first lines of the body) becomes the steps, and the CTA
 * becomes the "your turn" challenge. Stops adding body lines once the card
 * would get crowded, so the image stays readable on a phone.
 */
export function extractCardContent(block: Pick<ContentBlock, "hookText" | "bodyContent" | "ctaText">): CardContent {
  const rawLines = block.bodyContent
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const lines: string[] = [];
  let used = 0;
  for (const raw of rawLines) {
    const line = trimLine(raw);
    if (lines.length >= MAX_LINES) break;
    if (lines.length > 0 && used + line.length > MAX_BODY_CHARS) break;
    lines.push(line);
    used += line.length;
  }

  return {
    title: block.hookText.trim(),
    lines,
    challenge: block.ctaText.trim(),
  };
}
