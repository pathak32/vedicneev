import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { extractCardContent, shouldHaveCard } from "@/lib/linkedin/cardContent";

export const dynamic = "force-dynamic";

/**
 * The text that goes on one post's image card, as JSON. Exists because the
 * card itself is rendered on the edge runtime (this project's established
 * workaround for @vercel/og's Windows font-loading bug, see
 * app/opengraph-image.tsx), and the edge runtime can't use Prisma. Public for
 * the same reason the card is: it only exposes text that is posted publicly.
 */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const block = await prisma.contentBlock.findUnique({
    where: { id: params.id },
    select: { brand: true, category: true, hookText: true, bodyContent: true, ctaText: true },
  });
  if (!block || !shouldHaveCard(block)) return NextResponse.json({ error: "No card for this post." }, { status: 404 });

  return NextResponse.json({ content: extractCardContent(block) });
}
