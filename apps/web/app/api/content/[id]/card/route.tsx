import type { CardContent } from "@/lib/linkedin/cardContent";
import { renderMathsCard } from "@/lib/linkedin/cardImage";

// Edge runtime: the default (nodejs) ImageResponse fails on Windows (see
// app/opengraph-image.tsx). Edge can't use Prisma, so the text comes from the
// sibling card-data route.
export const runtime = "edge";

/**
 * The image card for one maths post, as a PNG. Public on purpose: it only
 * shows text that is posted publicly, and Make.com fetches it by URL when it
 * publishes to the Company Page.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const dataUrl = new URL(`/api/content/${params.id}/card-data`, request.url);
  const response = await fetch(dataUrl, { cache: "no-store" });
  if (!response.ok) return new Response("No card for this post.", { status: 404 });

  const { content } = (await response.json()) as { content: CardContent };
  return renderMathsCard(content);
}
