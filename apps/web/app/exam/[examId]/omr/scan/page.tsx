"use client";

import { notFound } from "next/navigation";
import type { MarkingScheme } from "@vedicneev/engine";

import { OmrScanner } from "@/components/omr/OmrScanner";
import { getDemoSession } from "@/lib/exam/mock-data";
import { buildAnswerKeyForSession, buildOmrSpecForSession } from "@/lib/exam/omr-bridge";

// Drives a live camera feed (navigator.mediaDevices) and demo session
// data — nothing to prerender. Force dynamic so the build never attempts
// static collection.
export const dynamic = "force-dynamic";

export default function OmrScanPage({ params }: { params: { examId: string } }) {
  const session = getDemoSession(params.examId);
  if (!session) notFound();

  const spec = buildOmrSpecForSession(session);
  const answerKey = buildAnswerKeyForSession(session);
  const scheme: MarkingScheme = {
    correctMarks: 1,
    negativeMarks: session.negativeMarkingRatio,
    unattemptedMarks: 0,
  };

  return (
    <OmrScanner examId={params.examId} session={session} spec={spec} answerKey={answerKey} scheme={scheme} />
  );
}
