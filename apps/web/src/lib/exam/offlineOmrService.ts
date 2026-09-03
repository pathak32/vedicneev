/**
 * Data layer for the offline-hybrid OMR workflow's print step: draws a
 * fresh, frozen question set from the PreviousYearQuestion bank, mints a
 * unique human-readable serial code for it, and persists it as an
 * OfflineMockSession row (packages/db/prisma/schema.prisma) so it can be
 * looked up again later — either to reprint the exact same sheet, or (a
 * later step) to grade a scan of it. Mirrors jnvstMockService.ts's
 * split between pure assembly logic (packages/engine) and the Prisma-backed
 * service that calls it, except this draw isn't section-balanced: an
 * offline set can be a full paper or an arbitrary sectional slice (e.g. 20
 * questions for take-home practice), so it draws flat across whatever's in
 * the bank for that exam/class instead of assuming a fixed blueprint.
 */
import { ExamType, Prisma, prisma } from "@vedicneev/db";
import { BUBBLE_OPTIONS, shuffled, type BubbleOption } from "@vedicneev/engine";

export interface GenerateOfflineMockInput {
  examType: ExamType;
  classLevel: number;
  totalQuestions: number;
  /** Set only when a signed-in student generated this set — see the model comment on OfflineMockSession.userId. */
  userId?: string;
}

export interface OfflineMockSessionPayload {
  serialCode: string;
  examType: ExamType;
  classLevel: number;
  totalQuestions: number;
  /** Ids into PreviousYearQuestion, in print order (question 1 first). */
  questionIds: string[];
  /** 1-based question number -> correct bubble option, e.g. { "1": "B", "2": "D" }. */
  answerKey: Record<string, BubbleOption>;
  createdAt: string;
}

export type OfflineOmrServiceError = { error: string };

const SERIAL_PREFIX_BY_EXAM: Record<ExamType, string> = {
  JNVST: "JNV",
  AISSEE: "AIS",
  RMS: "RMS",
  DPS: "DPS",
  OTHER: "OTH",
};

/**
 * Picks a fresh "VN-<EXAM>-<seq>" code for a new set (e.g. "VN-JNV-007"),
 * sequencing from how many sets already exist for that exam type. Retries a
 * few sequence numbers ahead on a collision (possible under concurrent
 * generation) before falling back to a timestamp-suffixed code that's
 * guaranteed unique.
 */
async function generateUniqueSerialCode(examType: ExamType): Promise<string> {
  const prefix = `VN-${SERIAL_PREFIX_BY_EXAM[examType]}`;
  const existingCount = await prisma.offlineMockSession.count({ where: { examType } });

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const seq = existingCount + 1 + attempt;
    const candidate = `${prefix}-${String(seq).padStart(3, "0")}`;
    const clash = await prisma.offlineMockSession.findUnique({ where: { serialCode: candidate } });
    if (!clash) return candidate;
  }

  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

interface OfflineMockSessionRow {
  serialCode: string;
  examType: ExamType;
  classLevel: number;
  totalQuestions: number;
  questionIds: Prisma.JsonValue;
  answerKey: Prisma.JsonValue;
  createdAt: Date;
}

function toPayload(row: OfflineMockSessionRow): OfflineMockSessionPayload {
  return {
    serialCode: row.serialCode,
    examType: row.examType,
    classLevel: row.classLevel,
    totalQuestions: row.totalQuestions,
    // Trusted cast: these Json columns are only ever written by
    // generateOfflineMockSession below, in exactly this shape.
    questionIds: row.questionIds as string[],
    answerKey: row.answerKey as Record<string, BubbleOption>,
    createdAt: row.createdAt.toISOString(),
  };
}

/**
 * Draws a non-repeating question set from the PreviousYearQuestion bank,
 * freezes it (plus its derived answer key) into a new OfflineMockSession
 * row, and returns the printable payload. Never pads a shortfall with
 * duplicates or invented questions — if the bank has fewer items than
 * requested, the set comes back shorter and a warning says so.
 */
export async function generateOfflineMockSession(
  input: GenerateOfflineMockInput
): Promise<{ session: OfflineMockSessionPayload; warnings: string[] } | OfflineOmrServiceError> {
  const pool = await prisma.previousYearQuestion.findMany({
    where: { examType: input.examType, classLevel: input.classLevel },
    select: { id: true, correctAnswer: true },
  });

  if (pool.length === 0) {
    return {
      error: `No ${input.examType} Class ${input.classLevel} practice content is seeded yet — nothing to assemble an offline set from.`,
    };
  }

  const drawn = shuffled(pool).slice(0, input.totalQuestions);
  const warnings: string[] = [];
  if (drawn.length < input.totalQuestions) {
    warnings.push(
      `Only ${drawn.length} of ${input.totalQuestions} requested questions were available in the ${input.examType} Class ${input.classLevel} pool.`
    );
  }

  const questionIds = drawn.map((q) => q.id);
  const answerKey: Record<string, BubbleOption> = {};
  drawn.forEach((q, index) => {
    answerKey[String(index + 1)] = BUBBLE_OPTIONS[q.correctAnswer] ?? "A";
  });

  const serialCode = await generateUniqueSerialCode(input.examType);

  const created = await prisma.offlineMockSession.create({
    data: {
      serialCode,
      examType: input.examType,
      classLevel: input.classLevel,
      totalQuestions: questionIds.length,
      questionIds,
      answerKey,
      userId: input.userId,
    },
  });

  return { session: toPayload(created), warnings };
}

/**
 * Looks up an already-generated offline set by its serial code, for
 * reprinting. Never reshuffles or redraws — a printed sheet must keep
 * exactly what a student already has in hand, even if the source PYQ
 * content is edited later (see the OfflineMockSession model comment).
 */
export async function getOfflineMockSessionByCode(
  serialCode: string
): Promise<{ session: OfflineMockSessionPayload } | OfflineOmrServiceError> {
  const row = await prisma.offlineMockSession.findUnique({ where: { serialCode } });
  if (!row) {
    return { error: `No offline mock set found for serial code "${serialCode}".` };
  }
  return { session: toPayload(row) };
}
