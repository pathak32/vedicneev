import type { ContentBlock } from "@vedicneev/db";

import { shouldHaveCard } from "./cardContent";

// The public site, not the request's own origin: the card route is public and
// Make.com must be able to reach the same URL from outside.
const CARD_ORIGIN = "https://www.vedicneev.com";
const MAX_BYTES = 4 * 1024 * 1024;

export interface PostCard {
  bytes: Uint8Array;
  url: string;
  altText: string;
}

/**
 * The image card to attach to a post, or null when cards are off, the post
 * isn't a maths post, or the card can't be fetched. Cards are opt-in via
 * LINKEDIN_IMAGE_CARDS=true; any failure here returns null so the post goes
 * out as plain text rather than not at all.
 */
export async function getPostCard(block: Pick<ContentBlock, "id" | "brand" | "category" | "hookText">): Promise<PostCard | null> {
  if (process.env.LINKEDIN_IMAGE_CARDS !== "true") return null;
  if (!shouldHaveCard(block)) return null;

  const url = `${CARD_ORIGIN}/api/content/${block.id}/card`;
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000), cache: "no-store" });
    if (!response.ok || !(response.headers.get("content-type") ?? "").startsWith("image/")) return null;

    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_BYTES) return null;

    return { bytes, url, altText: block.hookText.slice(0, 120) };
  } catch {
    return null;
  }
}
