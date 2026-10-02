import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";
import { composeCaseStudyDraft } from "@/lib/admin/caseStudy";

export const dynamic = "force-dynamic";

/**
 * Turns an APPROVED response into a LinkedIn DRAFT in /admin/content. The
 * draft is built only from the contact's own words (see composeCaseStudyDraft)
 * and, like every content block, is never posted until an admin schedules or
 * publishes it.
 */
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const feedback = await prisma.pilotFeedback.findUnique({ where: { id: params.id } });
  if (!feedback) return NextResponse.json({ error: "Not found." }, { status: 404 });
  if (feedback.status !== "APPROVED") {
    return NextResponse.json({ error: "Approve this response first." }, { status: 400 });
  }

  const draft = composeCaseStudyDraft(feedback);
  if ("error" in draft) return NextResponse.json({ error: draft.error }, { status: 400 });

  const block = await prisma.contentBlock.create({
    data: { brand: "VEDIC_NEEV", category: "INSTITUTIONAL_AUTOMATION", ...draft },
  });

  return NextResponse.json({ success: true, blockId: block.id }, { status: 201 });
}
