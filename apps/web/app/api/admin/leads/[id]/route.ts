import { NextResponse } from "next/server";
import { prisma, CoachingLeadStatus } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<string>(Object.values(CoachingLeadStatus));

interface UpdateBody {
  status?: string;
  notes?: string;
  linkedinUrl?: string | null;
  // ISO date-time, or null to clear the follow-up.
  nextFollowUpAt?: string | null;
}

/** Accepts a pasted profile link; the lead's own LinkedIn page, nothing more. */
function isLinkedInUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "linkedin.com" || url.hostname.endsWith(".linkedin.com"));
  } catch {
    return false;
  }
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

  const linkedinUrl = body.linkedinUrl?.trim();
  if (linkedinUrl && !isLinkedInUrl(linkedinUrl)) {
    return NextResponse.json({ error: "Enter a full https://www.linkedin.com/... profile link." }, { status: 400 });
  }
  if (body.nextFollowUpAt && Number.isNaN(new Date(body.nextFollowUpAt).getTime())) {
    return NextResponse.json({ error: "Invalid follow-up date." }, { status: 400 });
  }

  const lead = await prisma.coachingLead.findUnique({ where: { id: params.id } });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  const updated = await prisma.coachingLead.update({
    where: { id: params.id },
    data: {
      ...(body.status !== undefined ? { status: body.status as CoachingLeadStatus } : {}),
      ...(body.notes !== undefined ? { notes: body.notes.trim() || null } : {}),
      ...(body.linkedinUrl !== undefined ? { linkedinUrl: linkedinUrl || null } : {}),
      ...(body.nextFollowUpAt !== undefined
        ? { nextFollowUpAt: body.nextFollowUpAt ? new Date(body.nextFollowUpAt) : null }
        : {}),
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
