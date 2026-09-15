import { randomInt } from "crypto";
import { Prisma, prisma, type TestBatch } from "@vedicneev/db";

import { getInstituteCreditBalance } from "@/lib/institute/credits";

/**
 * Digits in a roster entry's sheetToken — purely numeric so it can be
 * bubbled onto OmrSheetSpec.sheetTokenGrid (packages/engine/src/omr.ts)
 * and read back by the same detection pipeline as answers, no barcode/QR
 * scanner needed. 10 digits (10^10 combinations) keeps collision
 * probability negligible across the whole system's lifetime, not just one
 * batch — @unique on the column is the actual guarantee either way; this
 * just keeps a full-batch regeneration (see below) rare.
 */
export const SHEET_TOKEN_DIGITS = 10;

const MAX_TOTAL_STUDENTS = 2000;
const MAX_TOTAL_QUESTIONS = 200;
const MAX_TOKEN_GENERATION_ATTEMPTS = 5;
// Prisma's interactive-transaction default (5000ms) is too tight once
// totalStudents approaches MAX_TOTAL_STUDENTS — a single createMany of
// ~2000 rows is normally well under a second, but this leaves real margin
// on a slower pooled connection instead of a transaction timeout turning
// into a confusing 500 on a large, otherwise-valid batch.
const TRANSACTION_TIMEOUT_MS = 15_000;

export interface CreateTestBatchInput {
  instituteId: string;
  batchName: string;
  testCode: string;
  subject: string;
  totalStudents: number;
  totalQuestions: number;
}

export type CreateTestBatchResult = { ok: true; testBatch: TestBatch } | { ok: false; status: number; error: string };

function generateNumericToken(): string {
  return String(randomInt(0, 10 ** SHEET_TOKEN_DIGITS)).padStart(SHEET_TOKEN_DIGITS, "0");
}

/** Unique, in-memory-deduped tokens for one batch — collisions WITHIN a batch are guaranteed impossible, not just unlikely. */
function generateUniqueTokens(count: number): string[] {
  const tokens = new Set<string>();
  while (tokens.size < count) tokens.add(generateNumericToken());
  return Array.from(tokens);
}

function isUniqueSheetTokenViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    Array.isArray(error.meta?.target) &&
    (error.meta.target as string[]).includes("sheet_token")
  );
}

/**
 * The pre-download metadata gate's server-side half: validates the four
 * required fields (plus totalQuestions, needed to generate the sheet
 * geometry itself), refuses a testCode already active for this institute,
 * caps totalStudents against the institute's remaining scan-credit balance
 * when one is configured, then creates the TestBatch and every
 * TestBatchRosterEntry row up front — see TestBatchRosterEntry's own
 * comment for why pre-creating them (each with its own sheetToken) before
 * a single sheet is printed is what makes photocopying a downloaded sheet
 * self-defeating.
 *
 * Roster rows are inserted with one createMany, not one create() per
 * student — a sheetToken collision against a PRE-EXISTING row from another
 * batch (never within this batch: tokens are deduped in memory first) is
 * exceedingly rare at 10 digits, so retrying the whole insert a few times
 * with freshly generated tokens is simpler and far faster than a
 * per-row retry loop.
 */
export async function createTestBatch(input: CreateTestBatchInput): Promise<CreateTestBatchResult> {
  const batchName = input.batchName.trim();
  const testCode = input.testCode.trim().toUpperCase();
  const subject = input.subject.trim();

  if (!batchName) return { ok: false, status: 400, error: "Batch Name is required." };
  if (!testCode) return { ok: false, status: 400, error: "Test Code is required." };
  if (!subject) return { ok: false, status: 400, error: "Subject is required." };
  if (!Number.isInteger(input.totalStudents) || input.totalStudents < 1 || input.totalStudents > MAX_TOTAL_STUDENTS) {
    return { ok: false, status: 400, error: `Total Students must be an integer between 1 and ${MAX_TOTAL_STUDENTS}.` };
  }
  if (!Number.isInteger(input.totalQuestions) || input.totalQuestions < 1 || input.totalQuestions > MAX_TOTAL_QUESTIONS) {
    return { ok: false, status: 400, error: `Total Questions must be an integer between 1 and ${MAX_TOTAL_QUESTIONS}.` };
  }

  const duplicate = await prisma.testBatch.findUnique({
    where: { instituteId_testCode: { instituteId: input.instituteId, testCode } },
  });
  if (duplicate) {
    return {
      ok: false,
      status: 409,
      error: `Test code "${testCode}" is already used by "${duplicate.batchName}". Choose a different code.`,
    };
  }

  // Credit-balance cap — skipped entirely for Enterprise (monthlyCreditGrant:
  // null) and for an institute with no subscription row yet (pre-billing
  // pilot state, before Phase 4's Razorpay wiring exists); every other
  // tier can never create a batch larger than what remains this cycle.
  const subscription = await prisma.instituteSubscription.findUnique({ where: { instituteId: input.instituteId } });
  if (subscription && subscription.monthlyCreditGrant != null) {
    const balance = await getInstituteCreditBalance(input.instituteId, subscription.currentPeriodStart);
    if (input.totalStudents > balance) {
      return {
        ok: false,
        status: 402,
        error: `Only ${balance} scan credit(s) remain this billing cycle — reduce Total Students or upgrade your plan.`,
      };
    }
  }

  const rollPadWidth = String(input.totalStudents).length;

  const testBatch = await prisma.$transaction(
    async (tx) => {
      const batch = await tx.testBatch.create({
        data: {
          instituteId: input.instituteId,
          batchName,
          testCode,
          subject,
          totalStudents: input.totalStudents,
          totalQuestions: input.totalQuestions,
        },
      });

      for (let attempt = 0; attempt < MAX_TOKEN_GENERATION_ATTEMPTS; attempt++) {
        const tokens = generateUniqueTokens(input.totalStudents);
        const rosterData = tokens.map((sheetToken, index) => {
          const sequenceNumber = index + 1;
          return {
            testBatchId: batch.id,
            sequenceNumber,
            rollNumber: `${testCode}-${String(sequenceNumber).padStart(rollPadWidth, "0")}`,
            sheetToken,
          };
        });

        try {
          await tx.testBatchRosterEntry.createMany({ data: rosterData });
          return batch;
        } catch (error) {
          if (isUniqueSheetTokenViolation(error) && attempt < MAX_TOKEN_GENERATION_ATTEMPTS - 1) continue;
          throw error;
        }
      }

      // Unreachable (the loop above always returns or throws), but keeps
      // TypeScript's control-flow analysis happy about a guaranteed
      // return value from this callback.
      throw new Error("Could not generate unique sheet tokens for this batch.");
    },
    { timeout: TRANSACTION_TIMEOUT_MS }
  );

  return { ok: true, testBatch };
}
