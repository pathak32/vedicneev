/**
 * Grading pipeline for the offline-hybrid OMR workflow's Step 3: takes a
 * scanned sheet's detected bubble marks, grades them against the frozen
 * OfflineMockSession answer key (via packages/engine's already-tested
 * evaluateOmrSheet — no scoring logic is reimplemented here), persists the
 * result back onto the session row, and auto-routes wrong/spoiled answers
 * into the student's Mistake Vault.
 *
 * Mistake Vault routing has one real architectural limit, checked live
 * rather than assumed: MistakeVault.questionId is a required foreign key to
 * Question, not PreviousYearQuestion (packages/db/prisma/schema.prisma) —
 * the exact same constraint apps/web/app/api/exam/submit/route.ts already
 * hit and documented for the online exam flow. Offline sets are drawn from
 * the PYQ bank (see offlineOmrService.ts), so today those ids essentially
 * never match a real Question row; such mistakes are honestly skipped
 * (reported in `mistakeRoutingSkipped`) rather than forcing a schema change
 * or writing a row that would violate the FK constraint. The day
 * OfflineMockSession also draws from the real Question bank, routing for
 * those ids starts working with no further changes here.
 */
import { Prisma, prisma } from "@vedicneev/db";
import {
  DEFAULT_MARKING_SCHEME,
  evaluateOmrSheet,
  scaleScoreToPercent,
  type BubbleOption,
  type EvaluatedOmrResponse,
  type MarkingScheme,
  type OmrAnswerKeyEntry,
  type OmrQuestionScan,
} from "@vedicneev/engine";

import { getOfflineMockSessionByCode, type OfflineMockSessionPayload } from "./offlineOmrService";

export interface GradeOfflineMockInput {
  serialCode: string;
  /** 1-based question number -> marked bubble options. A missing question number is treated as unattempted (blank); 2+ entries mean a spoiled multi-fill. */
  responses: Record<string, BubbleOption[]>;
  /** Defaults to no negative marking (packages/engine's DEFAULT_MARKING_SCHEME) — an offline set isn't necessarily tied to one ExamTemplate's per-question marking rules. */
  markingScheme?: MarkingScheme;
}

export interface SectionBreakdownEntry {
  sectionKey: string;
  sectionName: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  invalidCount: number;
  marks: number;
}

export interface SkippedMistake {
  questionId: string;
  reason: string;
}

export interface OfflineOmrGradingResult {
  serialCode: string;
  gradedAt: string;
  /** Per-question outcome — CORRECT / INCORRECT / UNATTEMPTED / INVALID_MULTIPLE_FILL (packages/engine/src/omrEvaluator.ts's OmrResponseOutcome). */
  responses: EvaluatedOmrResponse[];
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  invalidCount: number;
  sectionBreakdown: SectionBreakdownEntry[];
  mistakesLogged: number;
  mistakeRoutingSkipped: SkippedMistake[];
}

export type OfflineOmrGradingError = { error: string };

const UNCATEGORIZED_SECTION = { key: "uncategorized", name: "Uncategorized" };

/** Auto-logged Mistake Vault entries have no diagnosed root cause yet — a scanned sheet carries no response-time telemetry to classify careless-vs-concept-gap. CARELESS_RUSHED is the same neutral default apps/web/app/api/exam/submit/route.ts already falls back to for an untagged mistake. */
const AUTO_MISTAKE_TAG = "CARELESS_RUSHED";

/**
 * Grades a scanned OMR sheet against its OfflineMockSession's frozen answer
 * key, persists the diagnostic result onto that session row, and routes
 * wrong/spoiled answers into the Mistake Vault. Safe to call again for the
 * same serialCode (e.g. a rescan/correction) — grading overwrites the prior
 * result, and Mistake Vault routing skips any question already logged
 * there instead of duplicating it.
 */
export async function gradeOfflineMockSession(
  input: GradeOfflineMockInput
): Promise<OfflineOmrGradingResult | OfflineOmrGradingError> {
  const lookup = await getOfflineMockSessionByCode(input.serialCode);
  if ("error" in lookup) return lookup;
  const { session } = lookup;

  const scheme = input.markingScheme ?? DEFAULT_MARKING_SCHEME;

  const answerKey: OmrAnswerKeyEntry[] = Object.entries(session.answerKey).map(
    ([questionNumber, correctOption]) => ({
      questionNumber: Number(questionNumber),
      correctOption,
    })
  );

  const scans: OmrQuestionScan[] = session.questionIds.map((_id, index) => {
    const questionNumber = index + 1;
    return { questionNumber, markedOptions: input.responses[String(questionNumber)] ?? [] };
  });

  const evaluation = evaluateOmrSheet(scans, answerKey, scheme);
  const maxMarks = session.totalQuestions * scheme.correctMarks;
  const percentage = scaleScoreToPercent(evaluation.totalMarks, maxMarks);

  const [sectionBreakdown, mistakeRouting] = await Promise.all([
    buildSectionBreakdown(session, evaluation.responses),
    routeMistakes(session, evaluation.responses),
  ]);

  const result: OfflineOmrGradingResult = {
    serialCode: session.serialCode,
    gradedAt: new Date().toISOString(),
    responses: evaluation.responses,
    totalMarks: evaluation.totalMarks,
    maxMarks,
    percentage,
    correctCount: evaluation.correctCount,
    incorrectCount: evaluation.incorrectCount,
    unattemptedCount: evaluation.unattemptedCount,
    invalidCount: evaluation.invalidCount,
    sectionBreakdown,
    mistakesLogged: mistakeRouting.mistakesLogged,
    mistakeRoutingSkipped: mistakeRouting.mistakeRoutingSkipped,
  };

  await prisma.offlineMockSession.update({
    where: { serialCode: session.serialCode },
    // Trusted cast: every field on OfflineOmrGradingResult is a plain
    // string/number/array/object — structurally a valid JSON document,
    // just not spelled as Prisma's recursive InputJsonValue type.
    data: { gradingResult: result as unknown as Prisma.InputJsonValue },
  });

  return result;
}

/** Groups per-question outcomes by the source PreviousYearQuestion's Section, for a sectional score breakdown. */
async function buildSectionBreakdown(
  session: OfflineMockSessionPayload,
  responses: EvaluatedOmrResponse[]
): Promise<SectionBreakdownEntry[]> {
  const pyqRows = await prisma.previousYearQuestion.findMany({
    where: { id: { in: session.questionIds } },
    select: { id: true, section: { select: { key: true, name: true } } },
  });
  const sectionByQuestionId = new Map(pyqRows.map((row) => [row.id, row.section]));

  const breakdownByKey = new Map<string, SectionBreakdownEntry>();

  responses.forEach((response, index) => {
    const questionId = session.questionIds[index];
    const section = questionId ? sectionByQuestionId.get(questionId) : undefined;
    const sectionKey = section?.key ?? UNCATEGORIZED_SECTION.key;
    const sectionName = section ? asSectionNameEn(section.name) : UNCATEGORIZED_SECTION.name;

    const entry = breakdownByKey.get(sectionKey) ?? {
      sectionKey,
      sectionName,
      totalQuestions: 0,
      correctCount: 0,
      incorrectCount: 0,
      unattemptedCount: 0,
      invalidCount: 0,
      marks: 0,
    };

    entry.totalQuestions += 1;
    entry.marks += response.marksAwarded;
    if (response.outcome === "CORRECT") entry.correctCount += 1;
    else if (response.outcome === "INCORRECT") entry.incorrectCount += 1;
    else if (response.outcome === "UNATTEMPTED") entry.unattemptedCount += 1;
    else entry.invalidCount += 1;

    breakdownByKey.set(sectionKey, entry);
  });

  return Array.from(breakdownByKey.values());
}

/** Defensive runtime check, matching jnvstMockService.ts's asMultilingual — Section.name is Prisma's untyped Json. */
function asSectionNameEn(value: Prisma.JsonValue): string {
  if (typeof value === "object" && value !== null && !Array.isArray(value) && typeof value.en === "string") {
    return value.en;
  }
  return UNCATEGORIZED_SECTION.name;
}

interface MistakeRoutingResult {
  mistakesLogged: number;
  mistakeRoutingSkipped: SkippedMistake[];
}

async function routeMistakes(
  session: OfflineMockSessionPayload,
  responses: EvaluatedOmrResponse[]
): Promise<MistakeRoutingResult> {
  const mistakeEntries = responses
    .map((response, index) => ({ response, questionId: session.questionIds[index] }))
    .filter(
      (entry): entry is { response: EvaluatedOmrResponse; questionId: string } =>
        !!entry.questionId &&
        (entry.response.outcome === "INCORRECT" || entry.response.outcome === "INVALID_MULTIPLE_FILL")
    );

  if (mistakeEntries.length === 0) {
    return { mistakesLogged: 0, mistakeRoutingSkipped: [] };
  }

  if (!session.userId) {
    return {
      mistakesLogged: 0,
      mistakeRoutingSkipped: mistakeEntries.map((entry) => ({
        questionId: entry.questionId,
        reason: "Set was generated anonymously (no linked student) — nothing to route the mistake to.",
      })),
    };
  }
  const userId = session.userId;

  const candidateIds = mistakeEntries.map((entry) => entry.questionId);
  const [dbQuestions, existingMistakes] = await Promise.all([
    prisma.question.findMany({ where: { id: { in: candidateIds } }, select: { id: true } }),
    prisma.mistakeVault.findMany({
      where: { userId, questionId: { in: candidateIds } },
      select: { questionId: true },
    }),
  ]);
  const dbQuestionIds = new Set(dbQuestions.map((q) => q.id));
  const alreadyLogged = new Set(existingMistakes.map((m) => m.questionId));

  const skipped: SkippedMistake[] = [];
  let mistakesLogged = 0;

  for (const entry of mistakeEntries) {
    if (!dbQuestionIds.has(entry.questionId)) {
      skipped.push({
        questionId: entry.questionId,
        reason: "Not in the Question bank — this offline set was drawn from the PYQ bank instead.",
      });
      continue;
    }
    if (alreadyLogged.has(entry.questionId)) {
      skipped.push({ questionId: entry.questionId, reason: "Already logged in this student's Mistake Vault." });
      continue;
    }

    await prisma.mistakeVault.create({
      data: {
        userId,
        questionId: entry.questionId,
        tagCategory: AUTO_MISTAKE_TAG,
        note: `Auto-logged from offline OMR grading of set ${session.serialCode} (${entry.response.outcome}).`,
      },
    });
    mistakesLogged += 1;
  }

  return { mistakesLogged, mistakeRoutingSkipped: skipped };
}
