import { NextResponse } from "next/server";
import { Prisma, prisma } from "@vedicneev/db";
import {
  DEFAULT_MARKING_SCHEME,
  evaluateOmrSheet,
  resolveAnswerKeyForSet,
  type OmrQuestionScan,
  type SetMappings,
} from "@vedicneev/engine";

import { getInstituteSession } from "@/lib/institute/session";
import { parseCompactAnswerKey, parseStoredAnswerKey } from "@/lib/tests/answerKey";
import { recordMistakesForGrading } from "@/lib/tests/recordMistakes";

// Reads/writes live DB state on every request — never cache or statically
// collect this route.
export const dynamic = "force-dynamic";

/** Current answer-key state for the admin UI — the compact string (if set) plus how many uploads are waiting on it. */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const testBatch = await prisma.testBatch.findUnique({ where: { id: params.id } });
  if (!testBatch || testBatch.instituteId !== session.institute.id) {
    return NextResponse.json({ error: "Test batch not found." }, { status: 404 });
  }

  const queuedUploadsAwaitingKey = await prisma.omrUpload.count({
    where: { testBatchId: testBatch.id, status: "QUEUED", rosterEntryId: { not: null } },
  });

  const entries = parseStoredAnswerKey(testBatch.answerKey);
  const compactAnswerKey = entries
    ? Array.from({ length: testBatch.totalQuestions }, (_, i) => {
        const entry = entries.find((e) => e.questionNumber === i + 1);
        return entry?.correctOption ?? "?";
      }).join("")
    : null;

  const setMappingsForGet = testBatch.setMappings as unknown as SetMappings | null;

  return NextResponse.json({
    totalQuestions: testBatch.totalQuestions,
    compactAnswerKey,
    queuedUploadsAwaitingKey,
    setLabels: setMappingsForGet ? Object.keys(setMappingsForGet) : null,
  });
}

/**
 * Sets (or replaces) TestBatch.answerKey from the admin UI's compact
 * fast-entry string, then immediately re-grades every QUEUED upload that
 * was only held back for lack of a key — using each row's own
 * OmrUpload.detectedScans captured back at upload time, never re-fetching
 * or re-decoding the image. This is what actually makes "set the answer
 * key" a complete action instead of a dead end for sheets already
 * scanned: without it, every QUEUED-for-no-key upload would stay QUEUED
 * forever unless someone re-uploaded the exact same photo.
 *
 * Each queued row is re-checked for both a race (graded by a concurrent
 * upload in the meantime) and the live credit balance (which can run out
 * partway through a large backlog) before it's actually graded — same
 * guards the upload route itself applies, just replayed per row here.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const testBatch = await prisma.testBatch.findUnique({ where: { id: params.id } });
  if (!testBatch || testBatch.instituteId !== session.institute.id) {
    return NextResponse.json({ error: "Test batch not found." }, { status: 404 });
  }

  let body: { answerKey?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.answerKey !== "string") {
    return NextResponse.json({ error: '"answerKey" is required — a string of A/B/C/D letters, one per question.' }, { status: 400 });
  }

  const parsed = parseCompactAnswerKey(body.answerKey, testBatch.totalQuestions);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Just built from `parsed.storedAnswerKey` above — always non-empty.
  const answerKeyEntries = parseStoredAnswerKey(parsed.storedAnswerKey)!;
  const setMappings = (testBatch.setMappings as unknown as SetMappings | null) ?? null;

  const result = await prisma.$transaction(
    async (tx) => {
      await tx.testBatch.update({ where: { id: testBatch.id }, data: { answerKey: parsed.storedAnswerKey } });

      const queuedUploads = await tx.omrUpload.findMany({
        where: { testBatchId: testBatch.id, status: "QUEUED", rosterEntryId: { not: null } },
      });

      let regradedCount = 0;
      let stillHeldCount = 0;

      for (const upload of queuedUploads) {
        if (!upload.detectedScans || !upload.rosterEntryId) {
          stillHeldCount += 1;
          continue;
        }

        const rosterEntry = await tx.testBatchRosterEntry.findUniqueOrThrow({ where: { id: upload.rosterEntryId } });
        if (rosterEntry.consumedAt) {
          // Superseded by a different upload that already graded this
          // student since this row was queued — leave it as a stale
          // QUEUED record rather than double-counting a credit.
          stillHeldCount += 1;
          continue;
        }

        const subscription = await tx.instituteSubscription.findUnique({ where: { instituteId: testBatch.instituteId } });
        if (subscription && subscription.monthlyCreditGrant != null) {
          const balanceAgg = await tx.instituteCreditLedger.aggregate({
            where: { instituteId: testBatch.instituteId, createdAt: { gte: subscription.currentPeriodStart } },
            _sum: { delta: true },
          });
          if ((balanceAgg._sum.delta ?? 0) <= 0) {
            stillHeldCount += 1;
            continue; // still no credits this cycle — leave it queued.
          }
        }

        const scans = upload.detectedScans as unknown as OmrQuestionScan[];
        // Same resolution analyzeOmrUpload.ts uses at upload time — a
        // multi-set sheet re-grades against ITS detected set, never
        // against the single `answerKeyEntries` blindly, so re-running
        // "Set Answer Key" can't silently misgrade a queued multi-set
        // sheet just because this route only knows one key by name.
        const resolvedAnswerKeyEntries = resolveAnswerKeyForSet(setMappings, upload.detectedSetCode, answerKeyEntries)!;
        const grading = evaluateOmrSheet(scans, resolvedAnswerKeyEntries, DEFAULT_MARKING_SCHEME);

        await tx.omrUpload.update({
          where: { id: upload.id },
          data: {
            status: "GRADED",
            gradingResult: grading as unknown as Prisma.InputJsonValue,
            creditConsumed: true,
            rejectReason: null,
          },
        });
        await tx.testBatchRosterEntry.update({ where: { id: upload.rosterEntryId }, data: { consumedAt: new Date() } });
        await recordMistakesForGrading(tx, {
          testBatchId: testBatch.id,
          rosterEntryId: upload.rosterEntryId,
          omrUploadId: upload.id,
          grading,
          detectedSetCode: upload.detectedSetCode,
          setMappings,
        });
        await tx.instituteCreditLedger.create({
          data: {
            instituteId: testBatch.instituteId,
            delta: -1,
            reason: "SCAN_CONSUMED",
            testBatchId: testBatch.id,
            omrUploadId: upload.id,
          },
        });

        regradedCount += 1;
      }

      return { regradedCount, stillHeldCount };
    },
    { timeout: 30_000 }
  );

  return NextResponse.json({ ok: true, totalQuestions: testBatch.totalQuestions, ...result });
}
