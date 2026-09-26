import { NextResponse } from "next/server";

import { getAuthenticatedSupabaseUserId } from "@/lib/institute/session";
import { createInstitute } from "@/lib/institute/createInstitute";

// Writes Institute/InstituteBranch/InstituteAdmin rows and updates the User
// row — never cache or statically collect this route.
export const dynamic = "force-dynamic";

interface RequestBody {
  instituteName?: string;
  examCategory?: string;
  branchCity?: string;
  adminName?: string;
  password?: string;
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

  let result;
  try {
    result = await createInstitute({
      userId,
      instituteName: body.instituteName ?? "",
      examCategory: body.examCategory ?? "",
      branchCity: body.branchCity ?? "",
      adminName: body.adminName ?? "",
      password: body.password,
    });
  } catch (error) {
    // An uncaught exception here previously reached the browser as a bare
    // "Network error" (a non-JSON 500 that res.json() then throws on) with
    // no diagnosable cause — this at least gives the client a real,
    // parseable error and puts the actual cause in server logs.
    // eslint-disable-next-line no-console
    console.error("POST /api/institutes: unexpected error from createInstitute:", error);
    return NextResponse.json({ error: "Could not create your institute — please try again." }, { status: 500 });
  }

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ instituteId: result.institute.id });
}
