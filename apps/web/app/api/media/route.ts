import { NextResponse } from "next/server";
import type { ContentClassLevel, ExamType, MediaType } from "@vedicneev/db";

import { listMedia } from "@/lib/media/mediaService";

export const dynamic = "force-dynamic";

/**
 * Read-only, no-auth media catalog listing — mirrors /api/practice's shape.
 * See lib/media/mediaService.ts for the query/filter semantics.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const items = await listMedia({
    mediaType: (searchParams.get("mediaType") as MediaType | null) ?? undefined,
    topicKey: searchParams.get("topicKey") ?? undefined,
    vedicSpeedHackId: searchParams.get("vedicSpeedHackId") ?? undefined,
    targetExam: (searchParams.get("targetExam") as ExamType | null) ?? undefined,
    targetClass: (searchParams.get("targetClass") as ContentClassLevel | null) ?? undefined,
  });

  return NextResponse.json({ success: true, items });
}
