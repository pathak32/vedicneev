"use client";

import { Badge, Card, CardContent } from "@vedicneev/ui";
import { formatDuration } from "@vedicneev/engine";
import type { MediaItem, MediaType } from "@vedicneev/engine";
import { Headphones, Lock, PlayCircle, Sparkles } from "lucide-react";

import type { LanguageCode } from "@/lib/exam/types";

const TYPE_META: Record<MediaType, { label: string; icon: React.ReactNode; gradient: string }> = {
  SHORT_VIDEO: {
    label: "Speed Short",
    icon: <PlayCircle className="h-8 w-8" />,
    gradient: "from-orange-400/40 to-orange-600/20",
  },
  AUDIO_POD: {
    label: "Audio Pod",
    icon: <Headphones className="h-8 w-8" />,
    gradient: "from-blue-400/40 to-blue-600/20",
  },
  CONCEPT_CLINIC: {
    label: "Concept Clinic",
    icon: <Sparkles className="h-8 w-8" />,
    gradient: "from-purple-400/40 to-purple-600/20",
  },
};

export interface MediaCardProps {
  item: MediaItem;
  language: LanguageCode;
  locked: boolean;
  onClick: () => void;
}

export function MediaCard({ item, language, locked, onClick }: MediaCardProps) {
  const meta = TYPE_META[item.mediaType];

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${meta.gradient} text-foreground/70`}>
        {meta.icon}
        {locked ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Lock className="h-6 w-6 text-white" />
          </div>
        ) : null}
        <Badge variant="secondary" className="absolute left-2 top-2 text-[10px]">
          {meta.label}
        </Badge>
        <Badge variant="outline" className="absolute bottom-2 right-2 bg-background/80 text-[10px]">
          {formatDuration(item.durationSeconds)}
        </Badge>
      </div>
      <CardContent className="p-3">
        <p className="line-clamp-1 text-sm font-semibold text-foreground">{item.title[language]}</p>
        <p className="line-clamp-2 text-xs text-muted-foreground">{item.description[language]}</p>
      </CardContent>
    </Card>
  );
}
