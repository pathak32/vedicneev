import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";

export const dynamic = "force-dynamic";

interface UpdateBody {
  status?: "APPROVED" | "DECLINED";
  publishQuote?: string | null;
}

/** Collapses whitespace so a quote still matches after harmless line-break differences. */
function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Approve or decline a response, and pick the quote to feature. The quote
 * must appear word for word in one of the contact's own answers, so a
 * published line is always something they actually wrote. Approval is
 * refused unless they consented to being quoted.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: UpdateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const feedback = await prisma.pilotFeedback.findUnique({ where: { id: params.id } });
  if (!feedback) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (feedback.status === "REQUESTED") {
    return NextResponse.json({ error: "They have not responded yet." }, { status: 400 });
  }

  const quote = body.publishQuote === undefined ? feedback.publishQuote : body.publishQuote?.trim() || null;
  if (body.publishQuote !== undefined && quote) {
    const answers = [feedback.answerBefore, feedback.answerExperience, feedback.answerMissing].filter(Boolean) as string[];
    if (!answers.some((a) => normalize(a).includes(normalize(quote)))) {
      return NextResponse.json({ error: "The featured quote must be copied word for word from their answers." }, { status: 400 });
    }
  }

  if (body.status === "APPROVED") {
    if (!feedback.consentQuote) {
      return NextResponse.json({ error: "They did not consent to being quoted." }, { status: 400 });
    }
    if (!quote) return NextResponse.json({ error: "Pick the quote to feature first." }, { status: 400 });
  }

  const updated = await prisma.pilotFeedback.update({
    where: { id: feedback.id },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(body.publishQuote !== undefined ? { publishQuote: quote } : {}),
    },
  });

  return NextResponse.json({ success: true, feedback: updated });
}
