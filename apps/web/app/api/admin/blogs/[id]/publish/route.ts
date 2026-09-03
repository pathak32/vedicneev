import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  try {
    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
    return NextResponse.json({ success: true, post });
  } catch {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }
}
