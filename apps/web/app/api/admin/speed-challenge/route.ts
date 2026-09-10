import { NextResponse } from "next/server";
import { Prisma, prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";

export const dynamic = "force-dynamic";

interface CreateBody {
  question?: string;
  options?: string[];
  correct?: number;
  topic?: string;
  isActive?: boolean;
}

function validate(body: CreateBody): string | null {
  if (!body.question?.trim()) return "question is required.";
  if (!body.topic?.trim()) return "topic is required.";
  if (!Array.isArray(body.options) || body.options.length < 2) return "options must have at least 2 entries.";
  if (body.options.some((o) => !o?.trim())) return "options cannot be empty.";
  if (
    typeof body.correct !== "number" ||
    !Number.isInteger(body.correct) ||
    body.correct < 0 ||
    body.correct >= body.options.length
  ) {
    return "correct must be a valid index into options.";
  }
  return null;
}

export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const questions = await prisma.speedChallengeQuestion.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ success: true, questions });
}

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: CreateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validationError = validate(body);
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });

  try {
    const created = await prisma.speedChallengeQuestion.create({
      data: {
        question: body.question!.trim(),
        options: body.options!.map((o) => o.trim()),
        correct: body.correct!,
        topic: body.topic!.trim(),
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json({ success: true, question: created }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: "Could not create the question." }, { status: 500 });
    }
    throw error;
  }
}
