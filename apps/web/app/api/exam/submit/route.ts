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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SubmitRequestBody;
    const {
      phone,
      examTemplateSlug = "demo-jnvst",
      totalScore = 0,
      maxScore = 0,
      percentile = 0,
      timeTakenSeconds = 0,
      responses = [],
    } = body;

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

    // 4. Load available seeded questions. The client's exam content (the
    // in-memory demo/mock session — see apps/web/src/lib/exam/mock-data.ts)
    // uses its own fixture ids (e.g. "q-ma-1"), which don't exist in the
    // seeded `questions` table yet. TestResponse.questionId is a foreign key
    // to Question, so writing one of those ids directly would violate the FK
    // constraint (Prisma P2003) and 500 the whole request — which is exactly
    // what was happening here: the previous code computed a
    // `validQuestionId` fallback but never actually used it in the upsert
    // below, so every response with an unrecognized id still hit the FK
    // violation. Collapsing every unmatched question onto one fallback id
    // isn't a real fix either — it makes multiple mistakes in the same
    // session collide on the same [testSessionId, questionId] unique key,
    // and then on MistakeVault.testResponseId's unique constraint the moment
    // a second mistake tried to reuse the same (rewritten) TestResponse row.
    // Until the client is wired to real DB-backed questions, the honest fix
    // is to skip responses that don't reference a real question rather than
    // fabricate a mapping that corrupts or crashes on the next one.
    const dbQuestions = await prisma.question.findMany({ select: { id: true } });
    const dbQuestionIds = new Set(dbQuestions.map((q) => q.id));
    const skippedQuestionIds: string[] = [];

    if (Array.isArray(responses) && responses.length > 0) {
      for (const item of responses) {
        if (!item?.questionId || !dbQuestionIds.has(item.questionId)) {
          skippedQuestionIds.push(item?.questionId ?? "<missing>");
          continue;
        }

        const testResponse = await prisma.testResponse.upsert({
          where: {
            testSessionId_questionId: {
              testSessionId: session.id,
              questionId: item.questionId,
            },
          },
          update: {
            selectedOption: item.selectedOption,
            isCorrect: item.isCorrect,
            timeSpentSeconds: item.timeSpentSeconds,
          },
          create: {
            testSessionId: session.id,
            questionId: item.questionId,
            selectedOption: item.selectedOption,
            isCorrect: item.isCorrect,
            timeSpentSeconds: item.timeSpentSeconds,
          },
        });

        if (!item.isCorrect) {
          await prisma.mistakeVault.create({
            data: {
              userId: user.id,
              questionId: item.questionId,
              testResponseId: testResponse.id,
              tagCategory: item.mistakeTag ?? "CARELESS_RUSHED",
            },
          });
        }
      }
    }

    if (skippedQuestionIds.length > 0) {
      console.warn(
        `Exam submit: skipped ${skippedQuestionIds.length} response(s) with unrecognized questionId(s):`,
        skippedQuestionIds
      );
    }

    return NextResponse.json({ success: true, sessionId: session.id, skippedQuestionIds });
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
