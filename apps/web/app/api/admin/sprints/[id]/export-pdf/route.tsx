import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";
import { renderToBuffer } from "@react-pdf/renderer";

import { getAuthenticatedAdmin } from "@/lib/admin/user";
import { localize } from "@/lib/exam/localize";
import type { Multilingual } from "@/lib/exam/types";
import { loadSprintQuestionPool } from "@/lib/admin/sprintQuestionPool";
import { SprintMasterBookletDocument } from "@/components/admin/pdf/SprintMasterBookletDocument";

// PDF rendering needs Node's Buffer/streams — never cache or statically
// collect this route.
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  // The real, DB-backed admin check — middleware.ts already rejects any
  // request without a validly-signed admin cookie before this runs, but
  // that's only a signature check (Edge Runtime, no Prisma). This route
  // downloads the full answer key, so it checks the actual ADMIN role
  // itself too, the same way app/admin/(protected)/layout.tsx does.
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Not authenticated as an admin." }, { status: 401 });
  }

  const sprint = await prisma.nationalSprint.findUnique({ where: { id: params.id } });
  if (!sprint) {
    return NextResponse.json({ error: "Test not found." }, { status: 404 });
  }

  const pool = await loadSprintQuestionPool(sprint.examTemplateId);
  if (!pool) {
    return NextResponse.json({ error: "Exam template not found for this sprint." }, { status: 404 });
  }

  const sprintTitle = localize(sprint.title as Multilingual, "en");
  const targetDate = sprint.startTime.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const buffer = await renderToBuffer(
    <SprintMasterBookletDocument sprintTitle={sprintTitle} targetDate={targetDate} pool={pool} />
  );

  const filename = `${sprint.examType.toLowerCase()}-class-${sprint.classLevel}-sprint-${sprint.id}-master-booklet.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
