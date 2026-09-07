import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { resolveCheckoutUser } from "@/lib/auth/resolveCheckoutUser";

export const dynamic = "force-dynamic";

interface RegisterBody {
  participantName?: string;
  phone?: string;
  email?: string;
  state?: string;
}

export async function POST(request: Request, { params }: { params: { sprintId: string } }) {
  let body: RegisterBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const participantName = body.participantName?.trim();
  const phone = body.phone?.trim();
  const state = body.state?.trim();
  if (!participantName || !phone || !state) {
    return NextResponse.json({ error: "participantName, phone, and state are required." }, { status: 400 });
  }

  const sprint = await prisma.nationalSprint.findUnique({ where: { id: params.sprintId } });
  if (!sprint || !sprint.isActive) {
    return NextResponse.json({ error: "Sprint not found." }, { status: 404 });
  }
  if (new Date() > sprint.endTime) {
    return NextResponse.json({ error: "Registration for this sprint has closed." }, { status: 400 });
  }

  // Links a real account only when one already exists for this phone (a
  // Supabase session, or a verified match when Supabase isn't configured)
  // — a pure guest never gets a User row fabricated just from registering
  // for a free sprint. `ok: false` here means "no linked account," which
  // is the normal, expected guest path, not an error.
  const userResult = await resolveCheckoutUser(phone, false);
  const userId = userResult.ok ? userResult.user.id : null;

  const registration = await prisma.sprintRegistration.upsert({
    where: { sprintId_phone: { sprintId: sprint.id, phone } },
    update: { participantName, email: body.email?.trim() || null, state },
    create: {
      sprintId: sprint.id,
      userId,
      participantName,
      phone,
      email: body.email?.trim() || null,
      state,
    },
  });

  return NextResponse.json({ registrationId: registration.id, sprintId: sprint.id });
}
