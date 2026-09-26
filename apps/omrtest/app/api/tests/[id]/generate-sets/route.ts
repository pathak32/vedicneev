import { NextResponse } from "next/server";
import { Prisma, prisma } from "@vedicneev/db";
import { generateQuestionSets, MAX_SET_COUNT, MIN_SET_COUNT, type TestSection } from "@vedicneev/engine";

import { getInstituteSession } from "@/lib/institute/session";
import { parseStoredAnswerKey } from "@/lib/tests/answerKey";
import { assignRosterToSets } from "@/lib/tests/assignRosterToSets";

// Writes TestBatch.masterQuestions/setMappings and every roster entry's
// setCode — never cache or statically collect this route.
export const dynamic = "force-dynamic";

interface RequestBody {
  setCount?: number;
}

/** Best-effort parse of TestBatch.sections — malformed/absent just means "shuffle the whole paper as one section" rather than a hard error, since this column has no writer UI yet (see its own schema comment). */
function parseSections(raw: unknown): TestSection[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const sections: TestSection[] = [];
  for (const entry of raw) {
    if (
      entry &&
      typeof entry === "object" &&
      typeof (entry as Record<string, unknown>).name === "string" &&
      typeof (entry as Record<string, unknown>).startQuestion === "number" &&
      typeof (entry as Record<string, unknown>).endQuestion === "number"
    ) {
      const e = entry as { name: string; startQuestion: number; endQuestion: number };
      sections.push({ name: e.name, startQuestion: e.startQuestion, endQuestion: e.endQuestion });
    }
  }
  return sections.length > 0 ? sections : undefined;
}

/**
 * Generates SET_1..SET_N from the batch's already-set master answer key
 * (TestBatch.answerKey), snapshots the master into masterQuestions so a
 * later edit to answerKey doesn't retroactively change what this
 * generation shuffled, and round-robin assigns every roster entry a
 * setCode — the print routes (sheets, sets/[setCode]/paper) key off that
 * assignment; grading itself never trusts it (see
 * TestBatchRosterEntry.setCode's own comment).
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  if (session.institute.status !== "ACTIVE") {
    return NextResponse.json({ error: "Your institute is awaiting approval and can't generate sets yet." }, { status: 403 });
  }

  const testBatch = await prisma.testBatch.findUnique({
    where: { id: params.id },
    include: { rosterEntries: { orderBy: { sequenceNumber: "asc" } } },
  });
  if (!testBatch || testBatch.instituteId !== session.institute.id) {
    return NextResponse.json({ error: "Test batch not found." }, { status: 404 });
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const setCount = Number(body.setCount);
  if (!Number.isInteger(setCount) || setCount < MIN_SET_COUNT || setCount > MAX_SET_COUNT) {
    return NextResponse.json({ error: `setCount must be an integer between ${MIN_SET_COUNT} and ${MAX_SET_COUNT}.` }, { status: 400 });
  }

  const masterEntries = parseStoredAnswerKey(testBatch.answerKey);
  if (!masterEntries || masterEntries.length !== testBatch.totalQuestions) {
    return NextResponse.json(
      { error: "Set the master answer key first (every question needs an entry) before generating sets." },
      { status: 400 }
    );
  }
  const masterAnswerKey = Array.from(
    { length: testBatch.totalQuestions },
    (_, i) => masterEntries.find((e) => e.questionNumber === i + 1)!.correctOption
  );

  const sections = parseSections(testBatch.sections);
  const result = generateQuestionSets({ masterAnswerKey, setCount, sections });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const setLabels = Object.keys(result.setMappings);

  await prisma.$transaction(async (tx) => {
    await tx.testBatch.update({
      where: { id: testBatch.id },
      data: {
        masterQuestions: masterEntries as unknown as Prisma.InputJsonValue,
        setMappings: result.setMappings as unknown as Prisma.InputJsonValue,
      },
    });

    await assignRosterToSets(tx, testBatch.id, testBatch.rosterEntries, setLabels);
  });

  return NextResponse.json({ success: true, setLabels });
}
