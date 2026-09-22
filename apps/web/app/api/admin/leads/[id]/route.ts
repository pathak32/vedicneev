import { NextResponse } from "next/server";
import { prisma, CoachingLeadStatus } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<string>(Object.values(CoachingLeadStatus));

interface UpdateBody {
  status?: string;
  notes?: string;
}

/** Manual status/notes edits — e.g. marking a CONTACTED lead TRIAL_ACTIVE or CONVERTED once the director actually engages, tracked outside the automated send flow. */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: UpdateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.status !== undefined && !VALID_STATUSES.has(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const lead = await prisma.coachingLead.findUnique({ where: { id: params.id } });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  const updated = await prisma.coachingLead.update({
    where: { id: params.id },
    data: {
      ...(body.status !== undefined ? { status: body.status as CoachingLeadStatus } : {}),
      ...(body.notes !== undefined ? { notes: body.notes.trim() || null } : {}),
    },
  });

  return NextResponse.json({ success: true, lead: updated });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const lead = await prisma.coachingLead.findUnique({ where: { id: params.id } });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  await prisma.coachingLead.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
