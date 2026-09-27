import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { createFaculty, type FacultyAssignmentInput } from "@/lib/institute/createFaculty";

// Reads/writes InstituteAdmin(role: FACULTY) for the caller's own
// institute — never cache or statically collect this route.
export const dynamic = "force-dynamic";

interface RequestBody {
  name?: string;
  phone?: string;
  branchId?: string;
  assignments?: FacultyAssignmentInput[];
}

export async function GET() {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  if (session.admin.role !== "OWNER") {
    return NextResponse.json({ error: "Only the institute owner can view faculty." }, { status: 403 });
  }

  const faculty = await prisma.instituteAdmin.findMany({
    where: { instituteId: session.institute.id, role: "FACULTY" },
    include: { user: true, branch: true, assignments: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    faculty: faculty.map((f) => ({
      id: f.id,
      name: f.user.name,
      phone: f.user.phone,
      branchName: f.branch?.name ?? null,
      hasPassword: Boolean(f.passwordHash),
      assignments: f.assignments.map((a) => ({ subject: a.subject, classLevel: a.classLevel })),
    })),
  });
}

export async function POST(request: Request) {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  if (session.admin.role !== "OWNER") {
    return NextResponse.json({ error: "Only the institute owner can add faculty." }, { status: 403 });
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await createFaculty({
    instituteId: session.institute.id,
    branchId: body.branchId ?? "",
    name: body.name ?? "",
    phone: body.phone ?? "",
    assignments: Array.isArray(body.assignments) ? body.assignments : [],
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ adminId: result.admin.id });
}
