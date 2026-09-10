import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";

export const dynamic = "force-dynamic";

/** Real captured leads from the homepage Speed Challenge widget — the "student user log" admins review. */
export async function GET() {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const attempts = await prisma.speedChallengeAttempt.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true, phone: true } } },
  });

  return NextResponse.json({ success: true, attempts });
}
