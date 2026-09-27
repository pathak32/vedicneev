import { NextResponse } from "next/server";
import { prisma, type Difficulty } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { canAccessTestBatch } from "@/lib/institute/facultyScope";
import { generateQuestionsFromBank, type BankAllocation, type DifficultyMix } from "@/lib/tests/generateFromBank";

// Reads the request's cookie jar via getInstituteSession — never
// prerenderable. Nothing is written here: this only builds a preview, the
// same way /questions/parse does — POST .../questions/save is still the
// only route that persists TestBatchQuestionItem rows.
export const dynamic = "force-dynamic";

const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

interface RequestBody {
  allocations?: { topicId?: string; count?: number }[];
  /** Percentages keyed by EASY/MEDIUM/HARD, must sum to 100 — omit entirely for no difficulty preference. */
  difficultyMix?: Partial<Record<string, number>>;
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const testBatch = await prisma.testBatch.findUnique({ where: { id: params.id } });
  if (!testBatch || !canAccessTestBatch(session, testBatch)) {
    return NextResponse.json({ error: "Test batch not found." }, { status: 404 });
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const allocations: BankAllocation[] = [];
  for (const raw of body.allocations ?? []) {
    if (typeof raw.topicId !== "string" || !raw.topicId) {
      return NextResponse.json({ error: "Every allocation needs a topicId." }, { status: 400 });
    }
    const count = Number(raw.count);
    if (!Number.isInteger(count) || count <= 0) {
      return NextResponse.json({ error: `Invalid question count for topic ${raw.topicId}.` }, { status: 400 });
    }
    allocations.push({ topicId: raw.topicId, count });
  }
  if (allocations.length === 0) {
    return NextResponse.json({ error: "Pick at least one topic and question count." }, { status: 400 });
  }

  let difficultyMix: DifficultyMix | undefined;
  if (body.difficultyMix) {
    difficultyMix = {};
    let total = 0;
    for (const difficulty of DIFFICULTIES) {
      const value = Number(body.difficultyMix[difficulty] ?? 0);
      if (!Number.isFinite(value) || value < 0) {
        return NextResponse.json({ error: `Invalid ${difficulty} percentage.` }, { status: 400 });
      }
      difficultyMix[difficulty] = value;
      total += value;
    }
    if (Math.round(total) !== 100) {
      return NextResponse.json({ error: `Difficulty mix must add up to 100% (got ${total}%).` }, { status: 400 });
    }
  }

  const result = await generateQuestionsFromBank(testBatch, allocations, difficultyMix);
  return NextResponse.json(result);
}
