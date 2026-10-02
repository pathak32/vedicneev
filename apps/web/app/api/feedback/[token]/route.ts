import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

export const dynamic = "force-dynamic";

interface FeedbackBody {
  answerBefore?: string;
  answerExperience?: string;
  answerMissing?: string;
  wouldUseAgain?: string;
  consentQuote?: boolean;
  consentName?: boolean;
}

const MAX_ANSWER = 1500;
const WOULD_USE = new Set(["yes", "maybe", "no"]);

function clean(value: string | undefined): string | null {
  const trimmed = (value ?? "").trim().slice(0, MAX_ANSWER);
  return trimmed || null;
}

/**
 * Public answer submission for a /feedback/<token> link. The unguessable
 * token is the only credential: it can be answered once (REQUESTED ->
 * RESPONDED), and a response never becomes public by itself, since
 * publishing also needs the consent box and an admin's approval.
 */
export async function POST(request: Request, { params }: { params: { token: string } }) {
  let body: FeedbackBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const feedback = await prisma.pilotFeedback.findUnique({ where: { token: params.token } });
  if (!feedback) return NextResponse.json({ error: "This link is not valid." }, { status: 404 });
  if (feedback.status !== "REQUESTED") {
    return NextResponse.json({ error: "This feedback has already been submitted. Thank you." }, { status: 409 });
  }

  const answerBefore = clean(body.answerBefore);
  const answerExperience = clean(body.answerExperience);
  const answerMissing = clean(body.answerMissing);
  if (!answerBefore && !answerExperience && !answerMissing) {
    return NextResponse.json({ error: "Please answer at least one question." }, { status: 400 });
  }
  const wouldUseAgain = body.wouldUseAgain && WOULD_USE.has(body.wouldUseAgain) ? body.wouldUseAgain : null;

  // Name consent only counts alongside quote consent.
  const consentQuote = body.consentQuote === true;
  const consentName = consentQuote && body.consentName === true;

  await prisma.pilotFeedback.update({
    where: { id: feedback.id },
    data: {
      status: "RESPONDED",
      answerBefore,
      answerExperience,
      answerMissing,
      wouldUseAgain,
      consentQuote,
      consentName,
      respondedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
