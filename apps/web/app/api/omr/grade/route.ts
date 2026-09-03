import { NextRequest, NextResponse } from "next/server";

import { BUBBLE_OPTIONS, type BubbleOption } from "@vedicneev/engine";

import { gradeOfflineMockSession } from "@/lib/exam/omrGradingService";

// Grades against the live answer key, writes gradingResult back onto the
// OfflineMockSession row, and may insert Mistake Vault rows — never cache.
export const dynamic = "force-dynamic";

const BUBBLE_OPTION_SET = new Set<string>(BUBBLE_OPTIONS);

function isBubbleOption(value: unknown): value is BubbleOption {
  return typeof value === "string" && BUBBLE_OPTION_SET.has(value);
}

/** Validates the untrusted request body's `responses` shape before it reaches the grading service, which expects it pre-typed as Record<string, BubbleOption[]>. */
function parseResponses(raw: unknown): Record<string, BubbleOption[]> | { error: string } {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return {
      error: `"responses" must be an object mapping question numbers to arrays of marked options, e.g. { "1": ["B"], "2": [] }.`,
    };
  }

  const parsed: Record<string, BubbleOption[]> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^[1-9]\d*$/.test(key)) {
      return { error: `"responses" keys must be positive question numbers, got "${key}".` };
    }
    if (!Array.isArray(value) || !value.every(isBubbleOption)) {
      return { error: `"responses.${key}" must be an array of "A" | "B" | "C" | "D" — [] for a blank question, 2+ entries for a spoiled multi-fill.` };
    }
    parsed[key] = Array.from(new Set(value));
  }
  return parsed;
}

/**
 * Grades a scanned offline OMR sheet: looks up the OfflineMockSession by
 * serialCode, scores the submitted bubble marks against its frozen answer
 * key, persists the diagnostic result, and routes wrong/spoiled answers
 * into the student's Mistake Vault — see omrGradingService.ts for the full
 * pipeline and its documented Mistake Vault routing limits.
 */
export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }

  const { serialCode, responses } = body as Record<string, unknown>;
  if (typeof serialCode !== "string" || !serialCode.trim()) {
    return NextResponse.json({ error: `"serialCode" is required.` }, { status: 400 });
  }

  const parsedResponses = parseResponses(responses);
  if ("error" in parsedResponses) {
    return NextResponse.json({ error: parsedResponses.error }, { status: 400 });
  }

  const result = await gradeOfflineMockSession({ serialCode: serialCode.trim(), responses: parsedResponses });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ success: true, grading: result });
}
