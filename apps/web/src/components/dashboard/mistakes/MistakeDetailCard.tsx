"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  cn,
} from "@vedicneev/ui";
import {
  findMediaForSpeedHack,
  findMediaForTopic,
  type AccessResult,
  type MediaItem,
} from "@vedicneev/engine";
import { AlertTriangle, BookOpen, CheckCheck, Film, PlayCircle, Sparkles } from "lucide-react";

import { ConceptClinicPlayer } from "@/components/media/ConceptClinicPlayer";
import { SpeedShortsPlayer } from "@/components/media/SpeedShortsPlayer";
import { VedicSpeedTipModal } from "@/components/exam/VedicSpeedTipModal";
import type { MistakeLogEntry } from "@/lib/auth/types";
import { TOPIC_NAMES } from "@/lib/exam/mock-data";
import { MISTAKE_TAG_META } from "@/lib/exam/mistake-vault";
import type { ExamQuestion, ExamSessionData, LanguageCode } from "@/lib/exam/types";
import { mediaCatalog } from "@/lib/media/mock-data";

/** Reaching this card already required Vedic All-Access (gated by the page), so every media item it links to is unlocked by construction. */
const ALWAYS_ALLOWED: AccessResult = { allowed: true, reason: "ALL_ACCESS", requiresUpgrade: false, suggestedPlans: [] };

export interface MistakeDetailCardProps {
  entry: MistakeLogEntry;
  question: ExamQuestion;
  session: ExamSessionData;
  language: LanguageCode;
  onToggleReviewed: (id: string) => void;
}

export function MistakeDetailCard({ entry, question, session, language, onToggleReviewed }: MistakeDetailCardProps) {
  const [speedHackVideoItem, setSpeedHackVideoItem] = useState<MediaItem | null>(null);
  const [conceptClinicItem, setConceptClinicItem] = useState<MediaItem | null>(null);

  const meta = MISTAKE_TAG_META[entry.mistakeTag];
  const sectionName = session.sections.find((s) => s.key === question.sectionKey)?.name[language] ?? question.sectionKey;
  const topicName = TOPIC_NAMES[question.topicKey]?.[language] ?? question.topicKey;
  const speedHack = question.vedicSpeedHackId ? session.speedHacksById[question.vedicSpeedHackId] : undefined;
  const speedHackVideo = question.vedicSpeedHackId
    ? findMediaForSpeedHack(mediaCatalog, question.vedicSpeedHackId).find((m) => m.mediaType === "SHORT_VIDEO")
    : undefined;
  const conceptClinic = findMediaForTopic(mediaCatalog, question.topicKey).find((m) => m.mediaType === "CONCEPT_CLINIC");
  const selectedOptionText = entry.selectedOption
    ? question.options.find((o) => o.id === entry.selectedOption)?.text?.[language]
    : undefined;
  const correctOptionText = question.options.find((o) => o.id === question.correctOption)?.text?.[language];

  return (
    <Card className={cn(entry.reviewed && "opacity-70")}>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="text-[10px]">
            {sectionName}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {topicName}
          </Badge>
          <Badge variant="outline" className={cn("font-medium", meta.className)}>
            <AlertTriangle className="mr-1 h-3 w-3" />
            {meta.label}
          </Badge>
        </div>
        <Button
          type="button"
          variant={entry.reviewed ? "outline" : "secondary"}
          size="sm"
          onClick={() => onToggleReviewed(entry.id)}
        >
          <CheckCheck className="h-3.5 w-3.5" />
          {entry.reviewed ? "Reviewed" : "Mark Reviewed"}
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">{question.content[language]}</p>

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          {selectedOptionText ? (
            <span className="text-red-600 dark:text-red-400">Your answer: {selectedOptionText}</span>
          ) : null}
          <span className="text-emerald-600 dark:text-emerald-400">Correct answer: {correctOptionText ?? "—"}</span>
        </div>

        {question.explanation ? (
          <div className="flex items-start gap-2 rounded-md bg-muted/60 p-3 text-sm">
            <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>{question.explanation[language]}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-1">
          {speedHack ? <VedicSpeedTipModal hack={speedHack} language={language} /> : null}
          {speedHackVideo ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setSpeedHackVideoItem(speedHackVideo)}>
              <PlayCircle className="h-3.5 w-3.5" />
              Learn Speed Hack
            </Button>
          ) : null}
          {conceptClinic ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setConceptClinicItem(conceptClinic)}>
              <Film className="h-3.5 w-3.5" />
              Watch Concept Clinic
            </Button>
          ) : null}
          <Button asChild type="button" variant="outline" size="sm">
            <Link href={`/exam/${entry.examId}?mode=practice`}>
              <Sparkles className="h-3.5 w-3.5" />
              Try Similar Question
            </Link>
          </Button>
        </div>
      </CardContent>

      {speedHackVideoItem ? (
        <SpeedShortsPlayer
          items={[speedHackVideoItem]}
          initialIndex={0}
          language={language}
          onClose={() => setSpeedHackVideoItem(null)}
          getAccess={() => ALWAYS_ALLOWED}
          onConsumePreview={() => {}}
          onUnlockRequested={() => {}}
        />
      ) : null}

      {conceptClinicItem ? (
        <ConceptClinicPlayer
          item={conceptClinicItem}
          language={language}
          open={!!conceptClinicItem}
          onOpenChange={(open) => !open && setConceptClinicItem(null)}
          access={ALWAYS_ALLOWED}
          onUnlockRequested={() => {}}
        />
      ) : null}
    </Card>
  );
}
