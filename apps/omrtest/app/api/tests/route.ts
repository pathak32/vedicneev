import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { createTestBatch } from "@/lib/tests/createTestBatch";

// Writes a TestBatch and up to 2000 TestBatchRosterEntry rows — never
// cache or statically collect this route.
export const dynamic = "force-dynamic";

interface RequestBody {
  batchName?: string;
  testCode?: string;
  subject?: string;
  classLevel?: string;
  branchId?: string;
  totalStudents?: number;
  totalQuestions?: number;
}

export async function POST(request: Request) {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  // Defense in depth: app/(protected)/layout.tsx already keeps a
  // non-ACTIVE institute off the /tests/new page entirely, but this is the
  // route that actually creates a TestBatch, so it enforces the same rule
  // itself rather than trusting the page never to have been bypassed.
  if (session.institute.status !== "ACTIVE") {
    return NextResponse.json({ error: "Your institute is awaiting approval and can't create test batches yet." }, { status: 403 });
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  let branchId: string | null;
  let subject = body.subject ?? "";
  let classLevel = body.classLevel ?? "";

  if (session.admin.role === "FACULTY") {
    // FACULTY can only ever create a batch inside their own assigned
    // scope — branch is implied (never client-chosen), and the
    // subject/classLevel pair must be one of their own assignment rows,
    // same match facultyScope.ts's canAccessTestBatch uses for reads.
    branchId = session.admin.branchId;
    const matches = session.admin.assignments.some(
      (a) =>
        a.subject.trim().toLowerCase() === subject.trim().toLowerCase() &&
        a.classLevel.trim().toLowerCase() === classLevel.trim().toLowerCase()
    );
    if (!branchId || !matches) {
      return NextResponse.json(
        { error: "Choose a subject and class you're assigned to teach." },
        { status: 403 }
      );
    }
  } else {
    branchId = body.branchId ?? null;
    if (branchId) {
      const branch = await prisma.instituteBranch.findUnique({ where: { id: branchId } });
      if (!branch || branch.instituteId !== session.institute.id) {
        return NextResponse.json({ error: "Choose a valid branch." }, { status: 400 });
      }
    }
  }

  const result = await createTestBatch({
    instituteId: session.institute.id,
    branchId,
    batchName: body.batchName ?? "",
    testCode: body.testCode ?? "",
    subject,
    classLevel,
    totalStudents: Number(body.totalStudents),
    totalQuestions: Number(body.totalQuestions),
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ testBatchId: result.testBatch.id });
}
