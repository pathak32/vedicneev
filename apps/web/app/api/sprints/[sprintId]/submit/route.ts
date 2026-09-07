import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

export const dynamic = "force-dynamic";

interface SubmitBody {
  registrationId?: string;
  totalScore?: number;
  maxScore?: number;
  timeTakenSeconds?: number;
}

// A short grace window absorbs normal request latency around the exact
// close of the window — the client itself already gates entry/answering
// to [startTime, endTime]; this is a defensive server-side backstop, not
// the primary enforcement.
const GRACE_MS = 2 * 60 * 1000;

export async function POST(request: Request, { params }: { params: { sprintId: string } }) {
  let body: SubmitBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body.registrationId) {
    return NextResponse.json({ error: "registrationId is required." }, { status: 400 });
  }

  const registration = await prisma.sprintRegistration.findUnique({
    where: { id: body.registrationId },
    include: { sprint: true, submission: true },
  });

  if (!registration || registration.sprintId !== params.sprintId) {
    return NextResponse.json({ error: "Registration not found for this sprint." }, { status: 404 });
  }
  if (registration.submission) {
    return NextResponse.json({ error: "This registration has already submitted." }, { status: 409 });
  }

  const now = new Date();
  if (now < registration.sprint.startTime) {
    return NextResponse.json({ error: "This sprint hasn't started yet." }, { status: 400 });
  }
  if (now.getTime() > registration.sprint.endTime.getTime() + GRACE_MS) {
    return NextResponse.json({ error: "This sprint has closed." }, { status: 400 });
  }

  try {
    // @unique on registrationId — this is what actually enforces
    // single-attempt against a concurrent double-submit race, not just
    // the findUnique check above.
    const submission = await prisma.sprintSubmission.create({
      data: {
        registrationId: registration.id,
        totalScore: Number(body.totalScore ?? 0),
        maxScore: Number(body.maxScore ?? 0),
        timeTakenSeconds: Math.round(Number(body.timeTakenSeconds ?? 0)),
      },
    });
    return NextResponse.json({ success: true, submissionId: submission.id });
  } catch {
    return NextResponse.json({ error: "This registration has already submitted." }, { status: 409 });
  }
}
