import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

export const dynamic = "force-dynamic";

interface LeadCaptureBody {
  studentName?: string;
  targetClass?: number;
  mobileNumber?: string;
  score?: number;
  strikes?: number;
  questionCount?: number;
}

/**
 * Persists a completed Speed Challenge run as a real lead — upserts the
 * User by phone (the same phone-trusting pattern resolveCheckoutUser.ts
 * uses for other unauthenticated, phone-only flows) and logs the attempt
 * itself so /admin/speed-challenge/leads shows genuine captured leads,
 * not a client-side-only "submission" that goes nowhere.
 */
export async function POST(request: Request) {
  let body: LeadCaptureBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { studentName, targetClass, mobileNumber, score, strikes, questionCount } = body;

  if (!studentName?.trim()) {
    return NextResponse.json({ error: "Student name is required." }, { status: 400 });
  }
  if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
    return NextResponse.json({ error: "A valid 10-digit mobile number is required." }, { status: 400 });
  }
  if (!targetClass || (targetClass !== 6 && targetClass !== 9)) {
    return NextResponse.json({ error: "targetClass must be 6 or 9." }, { status: 400 });
  }
  if (typeof score !== "number" || typeof strikes !== "number" || typeof questionCount !== "number") {
    return NextResponse.json({ error: "score, strikes, and questionCount are required." }, { status: 400 });
  }

  // User.phone's convention is raw 10-digit Indian mobile digits, no
  // country code (see phoneFormat.ts) — mobileNumber is already in that
  // form after the regex check above.
  const phone = mobileNumber;

  const user = await prisma.user.upsert({
    where: { phone },
    update: { name: studentName.trim(), targetClass },
    create: { phone, name: studentName.trim(), targetClass, role: "STUDENT" },
  });

  const attempt = await prisma.speedChallengeAttempt.create({
    data: { userId: user.id, targetClass, score, strikes, questionCount },
  });

  return NextResponse.json({ success: true, attemptId: attempt.id }, { status: 201 });
}
