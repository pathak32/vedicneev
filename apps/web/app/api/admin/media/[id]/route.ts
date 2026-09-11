import { NextResponse } from "next/server";
import { Prisma, prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";

export const dynamic = "force-dynamic";

const MEDIA_TYPES = ["SHORT_VIDEO", "AUDIO_POD", "CONCEPT_CLINIC"] as const;
const EXAM_TYPES = ["JNVST", "AISSEE", "RMS", "DPS", "OTHER"] as const;
const CLASS_LEVELS = ["CLASS_6", "CLASS_9"] as const;

interface UpdateBody {
  mediaType?: string;
  titleEn?: string;
  titleHi?: string;
  descriptionEn?: string;
  descriptionHi?: string;
  durationSeconds?: number;
  videoUrl?: string | null;
  audioUrl?: string | null;
  thumbnailUrl?: string | null;
  transcriptEn?: string;
  transcriptHi?: string;
  topicId?: string | null;
  vedicSpeedHackId?: string | null;
  targetExams?: string[];
  targetClass?: string | null;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: UpdateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (body.mediaType && !MEDIA_TYPES.includes(body.mediaType as (typeof MEDIA_TYPES)[number])) {
    return NextResponse.json({ error: "mediaType must be one of SHORT_VIDEO, AUDIO_POD, CONCEPT_CLINIC." }, { status: 400 });
  }
  if (body.titleEn !== undefined && !body.titleEn.trim()) {
    return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
  }
  if (body.durationSeconds !== undefined && (typeof body.durationSeconds !== "number" || body.durationSeconds <= 0)) {
    return NextResponse.json({ error: "durationSeconds must be a positive number." }, { status: 400 });
  }
  if (body.targetExams?.some((e) => !EXAM_TYPES.includes(e as (typeof EXAM_TYPES)[number]))) {
    return NextResponse.json({ error: "targetExams contains an invalid exam type." }, { status: 400 });
  }
  if (body.targetClass && !CLASS_LEVELS.includes(body.targetClass as (typeof CLASS_LEVELS)[number])) {
    return NextResponse.json({ error: "targetClass must be CLASS_6 or CLASS_9." }, { status: 400 });
  }

  try {
    const item = await prisma.mediaItem.update({
      where: { id: params.id },
      data: {
        mediaType: body.mediaType as (typeof MEDIA_TYPES)[number] | undefined,
        title: body.titleEn !== undefined ? { en: body.titleEn.trim(), hi: body.titleHi?.trim() || body.titleEn.trim() } : undefined,
        description:
          body.descriptionEn !== undefined
            ? { en: body.descriptionEn.trim(), hi: body.descriptionHi?.trim() || body.descriptionEn.trim() }
            : undefined,
        durationSeconds: body.durationSeconds,
        videoUrl: body.videoUrl !== undefined ? body.videoUrl?.trim() || null : undefined,
        audioUrl: body.audioUrl !== undefined ? body.audioUrl?.trim() || null : undefined,
        thumbnailUrl: body.thumbnailUrl !== undefined ? body.thumbnailUrl?.trim() || null : undefined,
        transcript:
          body.transcriptEn !== undefined
            ? body.transcriptEn.trim()
              ? { en: body.transcriptEn.trim(), hi: body.transcriptHi?.trim() || body.transcriptEn.trim() }
              : Prisma.JsonNull
            : undefined,
        topicId: body.topicId !== undefined ? body.topicId || null : undefined,
        vedicSpeedHackId: body.vedicSpeedHackId !== undefined ? body.vedicSpeedHackId || null : undefined,
        targetExams: body.targetExams as (typeof EXAM_TYPES)[number][] | undefined,
        targetClass: body.targetClass !== undefined ? (body.targetClass as (typeof CLASS_LEVELS)[number]) || null : undefined,
      },
    });
    return NextResponse.json({ success: true, item });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") return NextResponse.json({ error: "Media item not found." }, { status: 404 });
      if (error.code === "P2003") return NextResponse.json({ error: "The selected topic or speed hack doesn't exist." }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not update the media item." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  try {
    await prisma.mediaItem.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Media item not found." }, { status: 404 });
    }
    throw error;
  }
}
