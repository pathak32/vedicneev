import { NextResponse } from "next/server";
import { ExamType, prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";

export const dynamic = "force-dynamic";

interface PublishMockPaperBody {
  examType?: ExamType;
  classLevel?: number;
  paperNumber?: number;
  action?: "publish" | "unpublish";
}

/**
 * Flips every PreviousYearQuestion row in one (examType, classLevel,
 * paperNumber) paper between DRAFT and PUBLISHED — the approve/rollback
 * action for /admin/mock-papers. Only the exact triple is touched, never a
 * whole board/class's entire pool, so approving one paper can't
 * accidentally publish a sibling still under review.
 */
export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: PublishMockPaperBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { examType, classLevel, paperNumber, action } = body;
  if (!examType || !classLevel || !paperNumber || (action !== "publish" && action !== "unpublish")) {
    return NextResponse.json({ error: "examType, classLevel, paperNumber, and action are required." }, { status: 400 });
  }

  const result = await prisma.previousYearQuestion.updateMany({
    where: { examType, classLevel, paperNumber },
    data: { reviewStatus: action === "publish" ? "PUBLISHED" : "DRAFT" },
  });

  return NextResponse.json({ success: true, updatedCount: result.count });
}
