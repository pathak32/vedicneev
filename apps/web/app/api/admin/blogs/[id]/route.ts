import { NextResponse } from "next/server";
import { Prisma, prisma } from "@vedicneev/db";

export const dynamic = "force-dynamic";

interface UpdateBody {
  title?: string;
  slug?: string;
  category?: string;
  excerpt?: string;
  content?: string;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  let body: UpdateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { title, slug, category, excerpt, content } = body;
  if (
    (title !== undefined && title.trim().length === 0) ||
    (slug !== undefined && slug.trim().length === 0) ||
    (category !== undefined && category.trim().length === 0) ||
    (excerpt !== undefined && excerpt.trim().length === 0) ||
    (content !== undefined && content.trim().length === 0)
  ) {
    return NextResponse.json({ error: "Fields cannot be empty." }, { status: 400 });
  }

  try {
    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: { title, slug, category, excerpt, content },
    });
    return NextResponse.json({ success: true, post });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ error: "That slug is already in use by another post." }, { status: 409 });
      }
      if (error.code === "P2025") {
        return NextResponse.json({ error: "Post not found." }, { status: 404 });
      }
    }
    return NextResponse.json({ error: "Could not update the post." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.blogPost.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }
}
