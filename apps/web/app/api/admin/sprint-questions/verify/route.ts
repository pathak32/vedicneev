import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";

// middleware.ts already bounces any request without a validly-signed
// admin cookie before this ever runs — but that's only a signature check
// (Edge Runtime, no Prisma). This route calls getAuthenticatedAdmin()
// itself too, the same real DB-backed role check app/admin/(protected)/
// layout.tsx uses, since it mutates review state and shouldn't rely on
// the Edge check alone.
export const dynamic = "force-dynamic";

interface VerifyBody {
  source?: "QUESTION" | "PYQ";
  questionId?: string;
  verified?: boolean;
}

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Not authenticated as an admin." }, { status: 401 });
  }

  let body: VerifyBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { source, questionId, verified } = body;
  if ((source !== "QUESTION" && source !== "PYQ") || !questionId || typeof verified !== "boolean") {
    return NextResponse.json({ error: "source (QUESTION|PYQ), questionId, and verified (boolean) are required." }, { status: 400 });
  }

  const verifiedAt = verified ? new Date() : null;

  try {
    if (source === "QUESTION") {
      await prisma.question.update({ where: { id: questionId }, data: { verifiedAt } });
    } else {
      await prisma.previousYearQuestion.update({ where: { id: questionId }, data: { verifiedAt } });
    }
  } catch {
    return NextResponse.json({ error: "Question not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, verifiedAt: verifiedAt ? verifiedAt.toISOString() : null });
}
