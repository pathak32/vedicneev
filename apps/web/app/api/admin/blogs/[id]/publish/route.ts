import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  // Only actually transitions DRAFT -> PUBLISHED; re-publishing an
  // already-published post is a no-op rather than bumping publishedAt to
  // now, which would otherwise re-surface it at the top of /blog (ordered
  // by publishedAt desc) and reorder it in the sitemap for no real reason.
  if (existing.status === "PUBLISHED") {
    return NextResponse.json({ success: true, post: existing, alreadyPublished: true });
  }

  const post = await prisma.blogPost.update({
    where: { id: params.id },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
  return NextResponse.json({ success: true, post });
}
