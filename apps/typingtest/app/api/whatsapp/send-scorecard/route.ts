import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";
import { formatWhatsAppTypingScorecardPayload } from "@vedicneev/engine";

import { getAuthenticatedUserId } from "@/lib/supabase/server";
import { localize } from "@/lib/localize";
import { sendWhatsAppTemplateMessage } from "@/lib/whatsapp/sendWhatsApp";

/**
 * Sends the candidate their own attempt's scorecard over WhatsApp. Reads
 * the attempt + phone server-side (never trusts client-supplied numbers or
 * scores) — see formatWhatsAppTypingScorecardPayload's own comment for the
 * Meta template ("typing_scorecard_ready") this depends on being approved.
 */
export async function POST(request: Request) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body.attemptId !== "string") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const [attempt, user] = await Promise.all([
    prisma.typingAttempt.findUnique({ where: { id: body.attemptId }, include: { exam: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { phone: true } }),
  ]);

  if (!attempt || attempt.userId !== userId) {
    return NextResponse.json({ error: "Attempt not found." }, { status: 404 });
  }
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const payload = formatWhatsAppTypingScorecardPayload(
    {
      examName: attempt.exam ? localize(attempt.exam.name) : "Custom Text Practice",
      grossSpeedWpm: attempt.grossSpeedWpm,
      netSpeedWpm: attempt.netSpeedWpm,
      accuracyPercent: attempt.accuracyPercent,
      fullMistakes: attempt.fullMistakes,
      halfMistakes: attempt.halfMistakes,
    },
    `+91${user.phone}`
  );

  const result = await sendWhatsAppTemplateMessage(payload);

  if (!result.success) {
    // Meta's own error text (e.g. a template still "In review"/rejected,
    // rate limits, WABA config issues) is logged for us to act on but never
    // shown to the candidate as-is — it's technical and would read as a
    // confusing app bug mid-test-flow. The test/results flow itself never
    // depends on this send succeeding.
    console.error("WhatsApp scorecard delivery failed", { attemptId: attempt.id, error: result.error });
    return NextResponse.json({
      success: false,
      messageId: null,
      error: "WhatsApp delivery isn't available right now — your scorecard is still saved on this results page.",
    });
  }

  return NextResponse.json(result);
}
