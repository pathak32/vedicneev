"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@vedicneev/ui";
import { formatDuration } from "@vedicneev/engine";
import type { AccessResult, MediaItem } from "@vedicneev/engine";
import { GraduationCap, Lock, Pause, Play, Sparkles } from "lucide-react";

import type { LanguageCode } from "@/lib/exam/types";

export interface ConceptClinicPlayerProps {
  item: MediaItem;
  language: LanguageCode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  access: AccessResult;
  onUnlockRequested: () => void;
}

export function ConceptClinicPlayer({
  item,
  language,
  open,
  onOpenChange,
  access,
  onUnlockRequested,
}: ConceptClinicPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      setPlaying(false);
      setProgress(0);
    }
  }, [open]);

  useEffect(() => {
    if (!playing || !access.allowed) return;
    const intervalId = window.setInterval(() => {
      setProgress((p) => Math.min(item.durationSeconds, p + 1));
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [playing, access.allowed, item.durationSeconds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            {item.title[language]}
          </DialogTitle>
          <DialogDescription>{item.description[language]}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-gradient-to-br from-primary/20 to-muted p-8 text-center">
          {!access.allowed ? (
            <>
              <Lock className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Concept clinics are part of Vedic All-Access.</p>
              <Button type="button" onClick={onUnlockRequested}>
                Unlock with All-Access
              </Button>
            </>
          ) : (
            <>
              <Sparkles className="h-8 w-8 text-primary" />
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Demo mode — no video file attached
              </p>
              <Button type="button" size="lg" onClick={() => setPlaying((p) => !p)}>
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {playing ? "Pause" : "Play"}
              </Button>
              <div className="w-full">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted-foreground/20">
                  <div
                    className="h-full bg-primary transition-[width]"
                    style={{ width: `${(progress / item.durationSeconds) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDuration(progress)} / {formatDuration(item.durationSeconds)}
                </p>
              </div>
            </>
          )}
        </div>

        {access.allowed ? (
          <Button asChild variant="outline">
            <Link href="/exam/demo-jnvst?mode=practice">Try Practice Question</Link>
          </Button>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
