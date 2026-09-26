import { NextResponse } from "next/server";
import { Prisma, prisma, type OmrUploadStatus } from "@vedicneev/db";
import type { OmrSheetEvaluationSummary, SetMappings } from "@vedicneev/engine";

import { getInstituteSession } from "@/lib/institute/session";
import { buildInstituteOmrSheetSpec } from "@/lib/omr/instituteSheetSpec";
import { computeAverageImageHash, decodeImageToGrayscale } from "@/lib/omr/decodeImage";
import { analyzeOmrUpload, type OmrAnalysisResult, type RosterEntryForMatching } from "@/lib/omr/analyzeOmrUpload";
import { uploadOmrImage } from "@/lib/omr/uploadStorage";
import { parseStoredAnswerKey } from "@/lib/tests/answerKey";
import { recordMistakesForGrading } from "@/lib/tests/recordMistakes";

// Decodes/stores an uploaded image and writes DB rows on every request —
// never cache or statically collect this route.
export const dynamic = "force-dynamic";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB — a phone photo comfortably fits well under this.
const ALLOWED_CONTENT_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

function extensionForContentType(contentType: string): string {
  switch (contentType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    default:
      return "jpg";
  }
}

interface UploadResponseBody {
  omrUploadId: string;
  status: OmrUploadStatus;
  reason?: string;
  rosterEntryId?: string;
  rollNumber?: string;
  gradingResult?: OmrSheetEvaluationSummary;
  /** Which Set bubble was actually read on this sheet — surfaced for display only, never trusted over what analyzeOmrUpload already resolved the grading against. */
  detectedSetCode?: string | null;
}

/**
 * The full ingestion pipeline for one scanned sheet: decode -> dedupe by
 * perceptual hash -> read fiducials/sheetToken/answer bubbles
 * (analyzeOmrUpload.ts, itself built entirely on packages/engine's
 * already-tested pixel-math) -> store the image -> persist exactly one
 * OmrUpload row reflecting whatever happened, in a single transaction with
 * the roster/credit-ledger writes GRADED status implies. A rejection is a
 * normal, fully-logged outcome here, not an error path — see
 * TestBatchRosterEntry/OmrUpload's own schema comments on why every
 * attempt (successful or not) needs its own audit row.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const testBatch = await prisma.testBatch.findUnique({
    where: { id: params.id },
    include: { rosterEntries: true },
  });
  // Not found and wrong-institute are reported identically — see the
  // sheets route's identical comment on why.
  if (!testBatch || testBatch.instituteId !== session.institute.id) {
    return NextResponse.json({ error: "Test batch not found." }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data with a "file" field.' }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: '"file" is required and must be an image.' }, { status: 400 });
  }
  if (!ALLOWED_CONTENT_TYPES.has(file.type)) {
    return NextResponse.json({ error: `Unsupported image type "${file.type}". Use JPEG, PNG, WEBP, or HEIC.` }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: `Image is too large (max ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB).` }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "Uploaded file is empty." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const imageHash = await computeAverageImageHash(buffer);
  const existingByHash = await prisma.omrUpload.findUnique({
    where: { testBatchId_imageHash: { testBatchId: testBatch.id, imageHash } },
  });
  if (existingByHash) {
    return NextResponse.json(
      {
        omrUploadId: existingByHash.id,
        status: existingByHash.status,
        reason: "This exact image has already been uploaded for this test batch — no new credit consumed, no new row created.",
      } satisfies UploadResponseBody,
      { status: 409 }
    );
  }

  let grayscaleImage;
  try {
    grayscaleImage = await decodeImageToGrayscale(buffer);
  } catch (error) {
    return NextResponse.json(
      { error: `Could not decode this image: ${error instanceof Error ? error.message : "unknown error"}` },
      { status: 400 }
    );
  }

  const spec = buildInstituteOmrSheetSpec(testBatch);
  const answerKeyEntries = parseStoredAnswerKey(testBatch.answerKey);
  // Written only by generate-sets/route.ts, in exactly this shape — trusted
  // the same way detectedScans/gradingResult already are elsewhere in this
  // route, not re-validated field-by-field.
  const setMappings = (testBatch.setMappings as unknown as SetMappings | null) ?? null;
  const rosterEntries: RosterEntryForMatching[] = testBatch.rosterEntries.map((entry) => ({
    id: entry.id,
    sheetToken: entry.sheetToken,
    consumedAt: entry.consumedAt,
    rollNumber: entry.rollNumber,
  }));

  const analysis = analyzeOmrUpload(grayscaleImage, spec, rosterEntries, answerKeyEntries, setMappings);

  const stored = await uploadOmrImage({
    instituteId: session.institute.id,
    testBatchId: testBatch.id,
    buffer,
    contentType: file.type,
    fileExtension: extensionForContentType(file.type),
  });
  if (!stored.ok) {
    return NextResponse.json({ error: stored.error }, { status: 502 });
  }

  let result: UploadResponseBody;
  try {
    result = await persistOmrUpload({
      testBatchId: testBatch.id,
      instituteId: session.institute.id,
      imageUrl: stored.imageUrl,
      imageHash,
      analysis,
      setMappings,
    });
  } catch (error) {
    // A genuine race: two near-simultaneous uploads of byte-identical
    // images both passed the pre-check above before either had committed.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "This exact image was uploaded moments ago by a concurrent request." },
        { status: 409 }
      );
    }
    throw error;
  }

  const httpStatus = result.status === "GRADED" || result.status === "QUEUED" ? 200 : 422;
  return NextResponse.json(result, { status: httpStatus });
}

async function persistOmrUpload(params: {
  testBatchId: string;
  instituteId: string;
  imageUrl: string;
  imageHash: string;
  analysis: OmrAnalysisResult;
  setMappings: SetMappings | null;
}): Promise<UploadResponseBody> {
  const { testBatchId, instituteId, imageUrl, imageHash, analysis, setMappings } = params;

  return prisma.$transaction(async (tx) => {
    if (analysis.outcome === "UNREADABLE") {
      const upload = await tx.omrUpload.create({
        data: { testBatchId, imageUrl, imageHash, status: "REJECTED_UNREADABLE", rejectReason: analysis.reason },
      });
      return { omrUploadId: upload.id, status: upload.status, reason: analysis.reason };
    }

    if (analysis.outcome === "ROSTER_MISMATCH") {
      const upload = await tx.omrUpload.create({
        data: { testBatchId, imageUrl, imageHash, status: "REJECTED_ROSTER_MISMATCH", rejectReason: analysis.reason },
      });
      return { omrUploadId: upload.id, status: upload.status, reason: analysis.reason };
    }

    if (analysis.outcome === "DUPLICATE") {
      const upload = await tx.omrUpload.create({
        data: {
          testBatchId,
          imageUrl,
          imageHash,
          status: "REJECTED_DUPLICATE",
          rejectReason: analysis.reason,
          rosterEntryId: analysis.rosterEntryId,
        },
      });
      return { omrUploadId: upload.id, status: upload.status, reason: analysis.reason, rosterEntryId: analysis.rosterEntryId };
    }

    // outcome === "MATCHED" from here on. Every branch past this point
    // persists detectedScans — the raw marks this sheet is scanned once
    // (not re-decoded later) — so /api/tests/[id]/answer-key can grade a
    // QUEUED row the moment a key is set, without touching the image again.
    const detectedScans = analysis.scans as unknown as Prisma.InputJsonValue;

    if (!analysis.grading) {
      // Roster-matched and readable, but TestBatch.answerKey isn't set yet
      // (see that column's own comment) — held as QUEUED, nothing
      // consumed, until an admin sets the key via the answer-key route.
      const upload = await tx.omrUpload.create({
        data: {
          testBatchId,
          imageUrl,
          imageHash,
          status: "QUEUED",
          rosterEntryId: analysis.rosterEntryId,
          detectedScans,
          detectedSetCode: analysis.detectedSetCode,
        },
      });
      return {
        omrUploadId: upload.id,
        status: upload.status,
        rosterEntryId: analysis.rosterEntryId,
        detectedSetCode: analysis.detectedSetCode,
      };
    }

    // Re-read the roster entry INSIDE the transaction — closes the race
    // window between analyzeOmrUpload's read (before this transaction
    // opened) and this write, for two near-simultaneous uploads of the
    // same physical sheet.
    const freshRosterEntry = await tx.testBatchRosterEntry.findUniqueOrThrow({ where: { id: analysis.rosterEntryId } });
    if (freshRosterEntry.consumedAt) {
      const reason = `This sheet (roll number ${freshRosterEntry.rollNumber}) was graded moments ago by a concurrent upload.`;
      const upload = await tx.omrUpload.create({
        data: {
          testBatchId,
          imageUrl,
          imageHash,
          status: "REJECTED_DUPLICATE",
          rejectReason: reason,
          rosterEntryId: analysis.rosterEntryId,
        },
      });
      return { omrUploadId: upload.id, status: upload.status, reason, rosterEntryId: analysis.rosterEntryId };
    }

    // Credit-balance gate — mirrors createTestBatch.ts's same skip rule
    // (Enterprise's null monthlyCreditGrant, or no subscription row yet).
    // An exhausted balance holds the sheet as QUEUED (it's fully readable
    // and matched — a billing problem, not a sheet problem) rather than
    // rejecting it outright.
    const subscription = await tx.instituteSubscription.findUnique({ where: { instituteId } });
    if (subscription && subscription.monthlyCreditGrant != null) {
      const balanceAgg = await tx.instituteCreditLedger.aggregate({
        where: { instituteId, createdAt: { gte: subscription.currentPeriodStart } },
        _sum: { delta: true },
      });
      const balance = balanceAgg._sum.delta ?? 0;
      if (balance <= 0) {
        const reason =
          "No scan credits remain this billing cycle — this sheet is held, ungraded, until the institute upgrades or the cycle renews.";
        const upload = await tx.omrUpload.create({
          data: {
            testBatchId,
            imageUrl,
            imageHash,
            status: "QUEUED",
            rejectReason: reason,
            rosterEntryId: analysis.rosterEntryId,
            detectedScans,
            detectedSetCode: analysis.detectedSetCode,
          },
        });
        return {
          omrUploadId: upload.id,
          status: upload.status,
          reason,
          rosterEntryId: analysis.rosterEntryId,
          detectedSetCode: analysis.detectedSetCode,
        };
      }
    }

    const upload = await tx.omrUpload.create({
      data: {
        testBatchId,
        imageUrl,
        imageHash,
        status: "GRADED",
        rosterEntryId: analysis.rosterEntryId,
        detectedScans,
        detectedSetCode: analysis.detectedSetCode,
        gradingResult: analysis.grading as unknown as Prisma.InputJsonValue,
        creditConsumed: true,
      },
    });

    await tx.testBatchRosterEntry.update({ where: { id: analysis.rosterEntryId }, data: { consumedAt: new Date() } });

    await recordMistakesForGrading(tx, {
      testBatchId,
      rosterEntryId: analysis.rosterEntryId,
      omrUploadId: upload.id,
      grading: analysis.grading!,
      detectedSetCode: analysis.detectedSetCode,
      setMappings,
    });

    // Written only after the GRADED row above successfully committed its
    // own create — same ordering rationale as omrGradingService.ts's
    // Mistake Vault writes: a credit is consumed by a grade that actually
    // happened, never speculatively ahead of it.
    await tx.instituteCreditLedger.create({
      data: { instituteId, delta: -1, reason: "SCAN_CONSUMED", testBatchId, omrUploadId: upload.id },
    });

    return {
      omrUploadId: upload.id,
      status: upload.status,
      rosterEntryId: analysis.rosterEntryId,
      rollNumber: freshRosterEntry.rollNumber,
      gradingResult: analysis.grading,
      detectedSetCode: analysis.detectedSetCode,
    };
  });
}
