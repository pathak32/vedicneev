import { NextResponse } from "next/server";
import { Prisma, prisma, ContentBlockStatus } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";

export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<string>(Object.values(ContentBlockStatus));

interface UpdateBody {
  hookText?: string;
  bodyContent?: string;
  ctaText?: string;
  status?: string;
  scheduledFor?: string | null;
}

/** Edits text/status/scheduledFor from the /admin/content dashboard — covers both inline text edits and the "Schedule" action ({status: "SCHEDULED", scheduledFor: <ISO date>}). */
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
  if (body.status === "SCHEDULED" && !body.scheduledFor) {
    return NextResponse.json({ error: "scheduledFor is required to schedule a block." }, { status: 400 });
  }
  for (const field of ["hookText", "bodyContent", "ctaText"] as const) {
    if (body[field] !== undefined && !body[field]!.trim()) {
      return NextResponse.json({ error: `${field} cannot be empty.` }, { status: 400 });
    }
  }

  try {
    const updated = await prisma.contentBlock.update({
      where: { id: params.id },
      data: {
        ...(body.hookText !== undefined ? { hookText: body.hookText.trim() } : {}),
        ...(body.bodyContent !== undefined ? { bodyContent: body.bodyContent.trim() } : {}),
        ...(body.ctaText !== undefined ? { ctaText: body.ctaText.trim() } : {}),
        ...(body.status !== undefined ? { status: body.status as ContentBlockStatus } : {}),
        ...(body.scheduledFor !== undefined ? { scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null } : {}),
      },
    });
    return NextResponse.json({ success: true, block: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Content block not found." }, { status: 404 });
    }
    throw error;
  }
}
