import { NextResponse } from "next/server";
import { prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";

export const dynamic = "force-dynamic";

interface ConceptNoteBody {
  explanation?: string;
  workedExample?: string;
  commonMistake?: string;
}

interface PatchBody {
  title?: string;
  body?: ConceptNoteBody;
  action?: "publish" | "unpublish";
}

/**
 * The one gate between an AI-drafted ConceptNote and a student seeing it —
 * only a real, authenticated admin (a teammate, see ConceptNote's own
 * schema comment) can edit content or flip status. Editing content and
 * publishing are independent: saving edits never implicitly publishes, and
 * publishing never silently changes content — same separation the answer
 * key's own save/confirm split already established elsewhere in this
 * codebase.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const note = await prisma.conceptNote.findUnique({ where: { id: params.id } });
  if (!note) return NextResponse.json({ error: "Concept note not found." }, { status: 404 });

  let payload: PatchBody;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const existingTitle = (note.title as Record<string, string>) ?? {};
  const existingBody = (note.body as Record<string, ConceptNoteBody>) ?? {};

  const updated = await prisma.conceptNote.update({
    where: { id: params.id },
    data: {
      ...(payload.title !== undefined ? { title: { ...existingTitle, en: payload.title } } : {}),
      ...(payload.body !== undefined
        ? { body: { ...existingBody, en: { ...existingBody.en, ...payload.body } } }
        : {}),
      ...(payload.action === "publish"
        ? { status: "PUBLISHED", reviewedByUserId: admin.id, reviewedAt: new Date() }
        : {}),
      ...(payload.action === "unpublish" ? { status: "DRAFT" } : {}),
    },
  });

  return NextResponse.json({ note: updated });
}
