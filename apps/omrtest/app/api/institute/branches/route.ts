import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { createBranch } from "@/lib/institute/createBranch";

// Reads/writes InstituteBranch for the caller's own institute — never
// cache or statically collect this route.
export const dynamic = "force-dynamic";

interface RequestBody {
  name?: string;
  city?: string;
}

export async function GET() {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const branches = await prisma.instituteBranch.findMany({
    where: { instituteId: session.institute.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ branches });
}

export async function POST(request: Request) {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  // Branch management is director-only — a FACULTY session never reaches
  // this UI, but the route enforces it independently regardless.
  if (session.admin.role !== "OWNER") {
    return NextResponse.json({ error: "Only the institute owner can manage branches." }, { status: 403 });
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await createBranch({ instituteId: session.institute.id, name: body.name ?? "", city: body.city });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ branch: result.branch });
}
