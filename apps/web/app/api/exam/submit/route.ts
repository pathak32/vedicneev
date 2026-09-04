import { NextResponse } from "next/server";
import { Prisma, prisma } from "@vedicneev/db";

export const dynamic = "force-dynamic";

type MistakeTagType = "CARELESS_RUSHED" | "CALCULATION_GAP" | "CONCEPT_GAP";

interface SubmitResponseItem {
  questionId: string;
  selectedOption?: string | null;
  isCorrect?: boolean;
  timeSpentSeconds?: number;
  mistakeTag?: MistakeTagType;
}

interface SubmitRequestBody {
  phone?: string;
  examTemplateSlug?: string;
  totalScore?: number;
  maxScore?: number;
  percentile?: number;
  timeTakenSeconds?: number;
  responses?: SubmitResponseItem[];
}

/**
 * Reads and parses the request body defensively. `req.json()` throws a bare
 * "Unexpected end of JSON input" SyntaxError for an empty body — which
 * happens in practice (a truncated/aborted fetch during navigation, a
 * client bug, or the body having already been read by something upstream,
 * e.g. middleware) — and previously reached the outer catch as an
 * undifferentiated 500. Reading as text first lets an empty/whitespace-only
 * body short-circuit before JSON.parse ever runs, and isolates a genuine
 * malformed-JSON body to its own clear 400 instead of either case
 * surfacing as a crash-shaped 500.
 */
async function readJsonBody(req: Request): Promise<{ ok: true; body: SubmitRequestBody } | { ok: false; error: string }> {
  let raw: string;
  try {
    raw = await req.text();
  } catch {
    return { ok: false, error: "Could not read the request body." };
  }

  if (!raw || raw.trim().length === 0) {
    return { ok: false, error: "Request body is empty." };
  }

  try {
    return { ok: true, body: JSON.parse(raw) as SubmitRequestBody };
  } catch {
    return { ok: false, error: "Request body is not valid JSON." };
  }
}

export async function POST(req: Request) {
  const parsed = await readJsonBody(req);
  if (!parsed.ok) {
    console.warn(`Exam submit: rejected request — ${parsed.error}`);
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const {
      phone,
      examTemplateSlug = "demo-jnvst",
      totalScore = 0,
      maxScore = 0,
      percentile = 0,
      timeTakenSeconds = 0,
      responses = [],
    } = parsed.body;

    if (!phone) {
      return NextResponse.json({ error: "User phone required" }, { status: 400 });
    }

    // 1. Find or create user
    let user = await prisma.user.findUnique({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: { phone, phoneVerifiedAt: new Date(), role: "PARENT" },
      });
    }

    // 2. Find template
    const template = await prisma.examTemplate.findFirst({
      where: {
        OR: [{ slug: examTemplateSlug }, { slug: "demo-jnvst" }, { isActive: true }],
      },
    });

    if (!template) {
      return NextResponse.json({ error: "No exam template found" }, { status: 404 });
    }

    // 3. Create Test Session
    const session = await prisma.testSession.create({
      data: {
        userId: user.id,
        examTemplateId: template.id,
        status: "SUBMITTED",
        submittedAt: new Date(),
        totalScore: Number(totalScore),
        maxScore: Number(maxScore),
        percentile: Number(percentile),
        timeTakenSeconds: Number(timeTakenSeconds),
      },
    });

    // 4. Load available seeded questions. TestResponse.questionId and
    // MistakeVault.questionId are both foreign keys to Question
    // specifically — writing an id from anywhere else violates the FK
    // constraint (Prisma P2003) and 500s the whole request. Two different
    // ids show up here that aren't in Question:
    //  - the client's in-memory demo/mock fixture (mock-data.ts) uses its
    //    own ids (e.g. "q-ma-1"), which were never seeded anywhere;
    //  - the real PYQ-bank live mock (jnvstMockService.ts) draws from
    //    PreviousYearQuestion, a genuine seeded table, but a different one
    //    from Question — same FK problem, different cause. Collapsing
    //    every unmatched question onto one fallback id isn't a real fix
    //    either — it makes multiple mistakes in the same session collide
    //    on the same [testSessionId, questionId] unique key, and then on
    //    MistakeVault.testResponseId's unique constraint the moment a
    //    second mistake tried to reuse the same (rewritten) TestResponse
    //    row. Until either the client is wired to real Question-table
    //    content, or TestResponse/MistakeVault gain a second FK for the
    //    PYQ bank, the honest fix is to skip both kinds — but distinguish
    //    them, since "sourced from a real, known bank we just can't link
    //    yet" and "not found anywhere" are different situations worth
    //    telling apart in the response and the logs.
    const [dbQuestions, pyqQuestions] = await Promise.all([
      prisma.question.findMany({ select: { id: true } }),
      prisma.previousYearQuestion.findMany({ select: { id: true } }),
    ]);
    const dbQuestionIds = new Set(dbQuestions.map((q) => q.id));
    const pyqQuestionIds = new Set(pyqQuestions.map((q) => q.id));
    const skipped: { questionId: string; reason: string }[] = [];
    const failed: { questionId: string; reason: string }[] = [];

    if (Array.isArray(responses) && responses.length > 0) {
      for (const item of responses) {
        // Defensive per-field defaults — `item` is untrusted client input,
        // and a malformed entry (missing fields, wrong types) here should
        // degrade that one response, not take down the rest of the batch.
        const {
          questionId,
          selectedOption = null,
          isCorrect = false,
          timeSpentSeconds = 0,
          mistakeTag = "CARELESS_RUSHED",
        } = item ?? ({} as SubmitResponseItem);

        if (!questionId) {
          skipped.push({ questionId: "<missing>", reason: "Response had no questionId." });
          continue;
        }
        if (!dbQuestionIds.has(questionId)) {
          skipped.push(
            pyqQuestionIds.has(questionId)
              ? {
                  questionId,
                  reason:
                    "Sourced from the PreviousYearQuestion bank — TestResponse/MistakeVault require a Question-table foreign key, which PYQ ids don't satisfy.",
                }
              : { questionId, reason: "Not found in either the Question or PreviousYearQuestion bank." }
          );
          continue;
        }

        // Each response is written independently — a Prisma error on one
        // (e.g. a P2003 from a question that got deleted between the lookup
        // above and this write, or a P2002 from a genuinely concurrent
        // duplicate) shouldn't abort responses that haven't been written
        // yet, and shouldn't turn an otherwise-successful submission (the
        // TestSession itself is already committed) into a full 500.
        try {
          const testResponse = await prisma.testResponse.upsert({
            where: {
              testSessionId_questionId: {
                testSessionId: session.id,
                questionId,
              },
            },
            update: { selectedOption, isCorrect, timeSpentSeconds },
            create: { testSessionId: session.id, questionId, selectedOption, isCorrect, timeSpentSeconds },
          });

          if (!isCorrect) {
            await prisma.mistakeVault.create({
              data: {
                userId: user.id,
                questionId,
                testResponseId: testResponse.id,
                tagCategory: mistakeTag,
              },
            });
          }
        } catch (itemError) {
          const reason =
            itemError instanceof Prisma.PrismaClientKnownRequestError
              ? `Database error (${itemError.code}) writing this response.`
              : "Unexpected error writing this response.";
          console.error(`Exam submit: failed to save response for question ${questionId}:`, itemError);
          failed.push({ questionId, reason });
        }
      }
    }

    if (skipped.length > 0) {
      const pyqSkipped = skipped.filter((s) => s.reason.startsWith("Sourced from the PreviousYearQuestion")).length;
      console.warn(
        `Exam submit: skipped ${skipped.length} response(s) — ${pyqSkipped} from the PYQ bank (no Question-table FK), ${skipped.length - pyqSkipped} truly unrecognized:`,
        skipped
      );
    }
    if (failed.length > 0) {
      console.warn(`Exam submit: ${failed.length} response(s) failed to save due to database errors:`, failed);
    }

    return NextResponse.json({ success: true, sessionId: session.id, skipped, failed });
  } catch (error) {
    console.error("Exam submit error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2003 = foreign key constraint failed, P2002 = unique constraint failed —
      // the two ways this route can violate the schema; surface which one it was
      // instead of a bare "Internal Server Error".
      const message =
        error.code === "P2003"
          ? "A referenced record (user, exam template, or question) does not exist."
          : error.code === "P2002"
            ? "A duplicate record violated a unique constraint."
            : `Database error (${error.code}).`;
      return NextResponse.json({ error: message, code: error.code }, { status: 500 });
    }

    const message = error instanceof Error ? error.message : "Unknown error during exam submission.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
