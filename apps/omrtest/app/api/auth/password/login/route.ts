import { NextResponse } from "next/server";

import { loginWithPassword } from "@/lib/auth/passwordLogin";

// Establishes a real Supabase session (mutates the response's cookie jar
// via bridgeToSupabaseSession) — never cache or statically collect this
// route, and must stay public: an unauthenticated visitor logging in is
// exactly what this route is for. See middleware.ts's PUBLIC_PATHS.
export const dynamic = "force-dynamic";

interface RequestBody {
  phone?: string;
  password?: string;
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
  }

  return loginWithPassword(body.phone ?? "", body.password);
}
