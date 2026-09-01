import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

export const dynamic = "force-dynamic";

type MistakeTagType = "CARELESS_RUSHED" | "CALCULATION_GAP" | "CONCEPT_GAP";

interface SubmitResponseItem {
  questionId: string;
  selectedOption?: string | null;
  isCorrect?: boolean;
  timeSpentSeconds?: number;
  mistakeTag?: MistakeTagType;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      phone,
      examTemplateSlug = "demo-jnvst",
      totalScore = 0,
      maxScore = 0,
      percentile = 0,
      timeTakenSeconds = 0,
      responses = [] as SubmitResponseItem[],
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
        OR: [
          { slug: examTemplateSlug },
          { slug: "demo-jnvst" },
          { isActive: true },
        ],
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

    // 4. Load available seeded questions to avoid FK constraint errors
    const dbQuestions = await prisma.question.findMany({ select: { id: true } });
    const dbQuestionIds = new Set(dbQuestions.map((q: { id: string }) => q.id));
    const fallbackQuestionId = dbQuestions[0]?.id;

    if (Array.isArray(responses) && responses.length > 0 && fallbackQuestionId) {
      for (const res of responses) {
        const validQuestionId = dbQuestionIds.has(res.questionId)
          ? res.questionId
          : fallbackQuestionId;

        const testResponse = await prisma.testResponse.upsert({
        where: {
          testSessionId_questionId: {
            testSessionId: session.id,,
            questionId: item.questionId,
          },
        },
        update: {
          selectedOption: item.selectedOption,
          isCorrect: item.isCorrect,
          timeSpentSeconds: item.timeSpentSeconds,
        },
        create: {
          testSessionId,
          questionId: item.questionId,
          selectedOption: item.selectedOption,
          isCorrect: item.isCorrect,
          timeSpentSeconds: item.timeSpentSeconds,
        },
      });

        if (!res.isCorrect) {
          await prisma.mistakeVault.create({
            data: {
              userId: user.id,
              questionId: validQuestionId,
              testResponseId: testResponse.id,
              tagCategory: res.mistakeTag ?? "CARELESS_RUSHED",
            },
          });
        }
      }
    }

    return NextResponse.json({ success: true, sessionId: session.id });
  } catch (error: any) {
    console.error("Exam submission sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
