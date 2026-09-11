import { NextResponse } from "next/server";
import { Prisma, prisma } from "@vedicneev/db";

import { getAuthenticatedAdmin } from "@/lib/admin/user";

export const dynamic = "force-dynamic";

const MEDIA_TYPES = ["SHORT_VIDEO", "AUDIO_POD", "CONCEPT_CLINIC"] as const;
const EXAM_TYPES = ["JNVST", "AISSEE", "RMS", "DPS", "OTHER"] as const;
const CLASS_LEVELS = ["CLASS_6", "CLASS_9"] as const;

interface CreateBody {
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

export async function POST(request: Request) {
  const admin = await getAuthenticatedAdmin();
  if (!admin) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  let body: CreateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body.mediaType || !MEDIA_TYPES.includes(body.mediaType as (typeof MEDIA_TYPES)[number])) {
    return NextResponse.json({ error: "mediaType must be one of SHORT_VIDEO, AUDIO_POD, CONCEPT_CLINIC." }, { status: 400 });
  }
  if (!body.titleEn?.trim() || !body.descriptionEn?.trim()) {
    return NextResponse.json({ error: "An English title and description are required." }, { status: 400 });
  }
  if (typeof body.durationSeconds !== "number" || body.durationSeconds <= 0) {
    return NextResponse.json({ error: "durationSeconds must be a positive number." }, { status: 400 });
  }
  if (body.targetExams?.some((e) => !EXAM_TYPES.includes(e as (typeof EXAM_TYPES)[number]))) {
    return NextResponse.json({ error: "targetExams contains an invalid exam type." }, { status: 400 });
  }
  if (body.targetClass && !CLASS_LEVELS.includes(body.targetClass as (typeof CLASS_LEVELS)[number])) {
    return NextResponse.json({ error: "targetClass must be CLASS_6 or CLASS_9." }, { status: 400 });
  }

  try {
    const item = await prisma.mediaItem.create({
      data: {
        mediaType: body.mediaType as (typeof MEDIA_TYPES)[number],
        title: { en: body.titleEn.trim(), hi: body.titleHi?.trim() || body.titleEn.trim() },
        description: { en: body.descriptionEn.trim(), hi: body.descriptionHi?.trim() || body.descriptionEn.trim() },
        durationSeconds: body.durationSeconds,
        videoUrl: body.videoUrl?.trim() || null,
        audioUrl: body.audioUrl?.trim() || null,
        thumbnailUrl: body.thumbnailUrl?.trim() || null,
        transcript: body.transcriptEn?.trim() ? { en: body.transcriptEn.trim(), hi: body.transcriptHi?.trim() || body.transcriptEn.trim() } : undefined,
        topicId: body.topicId || null,
        vedicSpeedHackId: body.vedicSpeedHackId || null,
        targetExams: (body.targetExams as (typeof EXAM_TYPES)[number][]) ?? [],
        targetClass: (body.targetClass as (typeof CLASS_LEVELS)[number]) || null,
      },
    });
    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json({ error: "The selected topic or speed hack doesn't exist." }, { status: 400 });
    }
    return NextResponse.json({ error: "Could not create the media item." }, { status: 500 });
  }
}
