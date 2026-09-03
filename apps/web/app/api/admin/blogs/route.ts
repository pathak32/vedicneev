import { NextResponse } from "next/server";
import { Prisma, prisma } from "@vedicneev/db";

export const dynamic = "force-dynamic";

interface CreateBody {
  title?: string;
  slug?: string;
  category?: string;
  excerpt?: string;
  content?: string;
}

export async function POST(request: Request) {
  let body: CreateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { title, slug, category, excerpt, content } = body;
  if (!title?.trim() || !slug?.trim() || !category?.trim() || !excerpt?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Title, slug, category, excerpt, and content are all required." }, { status: 400 });
  }

  try {
    const post = await prisma.blogPost.create({
      data: { title, slug, category, excerpt, content, status: "DRAFT" },
    });
    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "That slug is already in use by another post." }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not create the post." }, { status: 500 });
  }
}
