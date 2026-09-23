import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getInstituteSession } from "@/lib/institute/session";
import { hashSecret, validateSecretShape } from "@/lib/auth/password";

// Writes InstituteAdmin.passwordHash — never cache or statically collect
// this route.
export const dynamic = "force-dynamic";

interface RequestBody {
  password?: string;
}

export async function POST(request: Request) {
  const session = await getInstituteSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const password = body.password?.trim() ?? "";
  const shapeError = validateSecretShape(password);
  if (shapeError) {
    return NextResponse.json({ error: shapeError }, { status: 400 });
  }

  const passwordHash = await hashSecret(password);
  await prisma.instituteAdmin.update({ where: { id: session.admin.id }, data: { passwordHash } });

  return NextResponse.json({ success: true });
}
