import { NextResponse } from "next/server";
import { prisma, type ExamType } from "@vedicneev/db";

export async function POST(req: Request) {
  try {
    const { phone, targetExam } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    // targetExam is optional and, when present, always the currently-active
    // student's — there's no per-student row in Postgres yet (see
    // apps/web/src/lib/auth/resolveDbUser.ts), so this mirrors the same
    // collapse-to-one-parent-row convention every other table already uses.
    const examUpdate: { targetExam?: ExamType } = targetExam ? { targetExam: targetExam as ExamType } : {};

    const user = await prisma.user.upsert({
      where: { phone },
      update: {
        phoneVerifiedAt: new Date(),
        ...examUpdate,
      },
      create: {
        phone,
        phoneVerifiedAt: new Date(),
        role: "PARENT",
        ...examUpdate,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Auth sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
