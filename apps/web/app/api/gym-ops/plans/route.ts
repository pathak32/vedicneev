import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";

export const dynamic = "force-dynamic";

interface PlanBody {
  memberId?: string;
  title?: string;
  assignedBy?: string;
  details?: unknown;
}

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: PlanBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { memberId, title, assignedBy, details } = body;
  if (!memberId?.trim()) return NextResponse.json({ error: "memberId is required." }, { status: 400 });
  if (!title?.trim()) return NextResponse.json({ error: "title is required." }, { status: 400 });
  if (!assignedBy?.trim()) return NextResponse.json({ error: "assignedBy is required." }, { status: 400 });

  const member = await prisma.gymMember.findUnique({ where: { id: memberId } });
  if (!member) return NextResponse.json({ error: "Member not found." }, { status: 404 });

  const plan = await prisma.gymDietPlan.create({
    data: {
      gymId: member.gymId,
      memberId: member.id,
      title: title.trim(),
      assignedBy: assignedBy.trim(),
      details: details ?? {},
    },
    include: { member: { select: { name: true } } },
  });

  return NextResponse.json({ success: true, plan }, { status: 201 });
}
