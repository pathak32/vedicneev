import { NextResponse } from "next/server";
import { Prisma, prisma } from "@vedicneev/db";
import { BUBBLE_OPTIONS, type BubbleOption, type MasterQuestionItem, type SetMappings } from "@vedicneev/engine";

import { getInstituteSession } from "@/lib/institute/session";
import { assignRosterToSets } from "@/lib/tests/assignRosterToSets";

// Writes TestBatchQuestionItem rows and, depending on setLabel, either
// TestBatch.answerKey/masterQuestions or TestBatch.setMappings — never
// cache or statically collect this route.
export const dynamic = "force-dynamic";

/** "A" -> "SET_1" .. "D" -> "SET_4" — the admin-facing Set Variant letters this feature asks for, mapped onto the internal SET_n codes generate-sets/the sheet renderer/grading already use. */
const SET_LABEL_TO_CODE: Record<string, string> = { A: "SET_1", B: "SET_2", C: "SET_3", D: "SET_4" };

interface SaveQuestionInput {
  questionNumber?: number;
  text?: string;
  options?: Partial<Record<string, string>>;
  correctOption?: string;
}

interface RequestBody {
  /** "A" | "B" | "C" | "D" for a real, independently-uploaded set paper; omitted/null for the base/master paper. */
  setLabel?: string | null;
  examCategory?: string;
  questions?: SaveQuestionInput[];
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  if (session.institute.status !== "ACTIVE") {
    return NextResponse.json({ error: "Your institute is awaiting approval and can't save questions yet." }, { status: 403 });
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

  const setCode = body.setLabel ? SET_LABEL_TO_CODE[body.setLabel.toUpperCase()] : null;
  if (body.setLabel && !setCode) {
    return NextResponse.json({ error: 'setLabel must be "A", "B", "C", or "D".' }, { status: 400 });
  }

  const questions = body.questions ?? [];
  if (questions.length !== testBatch.totalQuestions) {
    return NextResponse.json(
      { error: `This batch has ${testBatch.totalQuestions} questions — got ${questions.length}.` },
      { status: 400 }
    );
  }

  const seenNumbers = new Set<number>();
  const validated: { questionNumber: number; text: string; options: Partial<Record<BubbleOption, string>>; correctOption: BubbleOption }[] = [];
  for (const q of questions) {
    const questionNumber = Number(q.questionNumber);
    if (!Number.isInteger(questionNumber) || questionNumber < 1 || questionNumber > testBatch.totalQuestions) {
      return NextResponse.json({ error: `Invalid question number: ${q.questionNumber}.` }, { status: 400 });
    }
    if (seenNumbers.has(questionNumber)) {
      return NextResponse.json({ error: `Question ${questionNumber} appears more than once.` }, { status: 400 });
    }
    seenNumbers.add(questionNumber);

    const correctOption = (q.correctOption ?? "").toUpperCase();
    if (!BUBBLE_OPTIONS.includes(correctOption as BubbleOption)) {
      return NextResponse.json({ error: `Question ${questionNumber}: choose a valid correct option (A/B/C/D).` }, { status: 400 });
    }

    const options: Partial<Record<BubbleOption, string>> = {};
    for (const option of BUBBLE_OPTIONS) {
      const value = q.options?.[option];
      if (typeof value === "string" && value.trim()) options[option] = value.trim();
    }

    validated.push({
      questionNumber,
      text: typeof q.text === "string" ? q.text.trim() : "",
      options,
      correctOption: correctOption as BubbleOption,
    });
  }
  if (seenNumbers.size !== testBatch.totalQuestions) {
    return NextResponse.json({ error: "Every question number from 1 to the batch's total must be present." }, { status: 400 });
  }

  validated.sort((a, b) => a.questionNumber - b.questionNumber);

  await prisma.$transaction(async (tx) => {
    await tx.testBatchQuestionItem.deleteMany({ where: { testBatchId: testBatch.id, setCode } });
    await tx.testBatchQuestionItem.createMany({
      data: validated.map((q) => ({
        testBatchId: testBatch.id,
        setCode,
        questionNumber: q.questionNumber,
        text: q.text || null,
        optionA: q.options.A ?? null,
        optionB: q.options.B ?? null,
        optionC: q.options.C ?? null,
        optionD: q.options.D ?? null,
        correctOption: q.correctOption,
      })),
    });

    const examCategoryUpdate = body.examCategory?.trim() ? { examCategory: body.examCategory.trim() } : {};

    if (!setCode) {
      // The base/master paper — mirrors straight into the same two
      // columns the compact-textarea AnswerKeyForm and the multi-set
      // generator already read/write, so every existing grading/print
      // path keeps working unchanged (see TestBatch.masterQuestions' own
      // comment). Deliberately does NOT touch an existing setMappings —
      // same conservative "don't silently invalidate already-generated
      // sets" call the answer-key textarea save makes today.
      const answerKeyRecord: Record<string, BubbleOption> = {};
      const masterQuestions: MasterQuestionItem[] = validated.map((q) => {
        answerKeyRecord[String(q.questionNumber)] = q.correctOption;
        return { questionNumber: q.questionNumber, correctOption: q.correctOption, text: q.text || undefined, options: q.options };
      });
      await tx.testBatch.update({
        where: { id: testBatch.id },
        data: {
          answerKey: answerKeyRecord,
          masterQuestions: masterQuestions as unknown as Prisma.InputJsonValue,
          ...examCategoryUpdate,
        },
      });
      return;
    }

    // A real, independently-uploaded set paper — its own native question
    // order IS the identity permutation (position N really is master
    // question N for grading's purposes; see resolveQuestionItem.ts and
    // TestBatchQuestionItem.setCode's own comment), never a random
    // shuffle from packages/engine/src/questionShuffler.ts.
    const existingSetMappings = (testBatch.setMappings as unknown as SetMappings | null) ?? {};
    const identityPermutation = validated.map((_, i) => i);
    const updatedSetMappings: SetMappings = {
      ...existingSetMappings,
      [setCode]: { permutation: identityPermutation, answerKey: validated.map((q) => q.correctOption) },
    };

    await tx.testBatch.update({
      where: { id: testBatch.id },
      data: { setMappings: updatedSetMappings as unknown as Prisma.InputJsonValue, ...examCategoryUpdate },
    });

    await assignRosterToSets(tx, testBatch.id, testBatch.rosterEntries, Object.keys(updatedSetMappings));
  });

  return NextResponse.json({ success: true, setCode });
}
