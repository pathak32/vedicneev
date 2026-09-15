import { NextResponse } from "next/server";
import { prisma, type ExamType } from "@vedicneev/db";

export async function POST(req: Request) {
  try {
    const { phone, targetExam, completedVedicMindBasics } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    // targetExam is optional and, when present, always the currently-active
    // student's — there's no per-student row in Postgres yet (see
    // apps/web/src/lib/auth/resolveDbUser.ts), so this mirrors the same
    // collapse-to-one-parent-row convention every other table already uses.
    const examUpdate: { targetExam?: ExamType } = targetExam ? { targetExam: targetExam as ExamType } : {};
    // Set-once flag from the Vedic Mind AI ecosystem referral (see
    // src/lib/ecosystem/attribution.ts) — only ever written `true`, never
    // cleared back to `false` by a later sync that lacks it.
    const vedicMindUpdate =
      completedVedicMindBasics === true ? { completedVedicMindBasics: true } : {};

    const user = await prisma.user.upsert({
      where: { phone },
      update: {
        phoneVerifiedAt: new Date(),
        ...examUpdate,
        ...vedicMindUpdate,
      },
      create: {
        phone,
        phoneVerifiedAt: new Date(),
        role: "PARENT",
        ...examUpdate,
        ...vedicMindUpdate,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Auth sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
