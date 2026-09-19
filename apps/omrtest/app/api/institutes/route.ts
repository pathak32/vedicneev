import { NextResponse } from "next/server";

import { getAuthenticatedSupabaseUserId } from "@/lib/institute/session";
import { createInstitute } from "@/lib/institute/createInstitute";

// Writes Institute/InstituteBranch/InstituteAdmin/InstituteCreditLedger rows
// and updates the User row — never cache or statically collect this route.
export const dynamic = "force-dynamic";

interface RequestBody {
  instituteName?: string;
  examCategory?: string;
  branchCity?: string;
  adminName?: string;
}

export async function POST(request: Request) {
  const userId = await getAuthenticatedSupabaseUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const result = await createInstitute({
    userId,
    instituteName: body.instituteName ?? "",
    examCategory: body.examCategory ?? "",
    branchCity: body.branchCity ?? "",
    adminName: body.adminName ?? "",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ instituteId: result.institute.id });
}
