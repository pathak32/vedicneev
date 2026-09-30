import { NextResponse } from "next/server";

import { listStudyNoteTopicPdfs } from "@/lib/notes/studyNoteService";

export const dynamic = "force-dynamic";

/**
 * Read-only, no-auth study-note-PDF catalog listing — mirrors /api/media's
 * shape. The actual entitlement gate lives where this is consumed (e.g. the
 * Mistake Vault page already requires Vedic All-Access before it renders
 * any card that would use this), same pattern as /api/media's MediaItem
 * catalog.
 */
export async function GET() {
  const items = await listStudyNoteTopicPdfs();
  return NextResponse.json({ success: true, items });
}
