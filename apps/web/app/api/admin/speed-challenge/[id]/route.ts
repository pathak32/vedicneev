import { NextResponse } from "next/server";
import { Prisma, prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";

export const dynamic = "force-dynamic";

interface UpdateBody {
  question?: string;
  options?: string[];
  correct?: number;
  topic?: string;
  isActive?: boolean;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: UpdateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.options !== undefined) {
    if (!Array.isArray(body.options) || body.options.length < 2 || body.options.some((o) => !o?.trim())) {
      return NextResponse.json({ error: "options must have at least 2 non-empty entries." }, { status: 400 });
    }
  }
  const optionCount = body.options?.length;
  if (
    body.correct !== undefined &&
    (typeof body.correct !== "number" || !Number.isInteger(body.correct) || body.correct < 0 || (optionCount !== undefined && body.correct >= optionCount))
  ) {
    return NextResponse.json({ error: "correct must be a valid index into options." }, { status: 400 });
  }
  if (body.question !== undefined && !body.question.trim()) {
    return NextResponse.json({ error: "question cannot be empty." }, { status: 400 });
  }
  if (body.topic !== undefined && !body.topic.trim()) {
    return NextResponse.json({ error: "topic cannot be empty." }, { status: 400 });
  }

  try {
    const updated = await prisma.speedChallengeQuestion.update({
      where: { id: params.id },
      data: {
        question: body.question?.trim(),
        options: body.options?.map((o) => o.trim()),
        correct: body.correct,
        topic: body.topic?.trim(),
        isActive: body.isActive,
      },
    });
    return NextResponse.json({ success: true, question: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Question not found." }, { status: 404 });
    }
    throw error;
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  try {
    await prisma.speedChallengeQuestion.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Question not found." }, { status: 404 });
    }
    throw error;
  }
}
