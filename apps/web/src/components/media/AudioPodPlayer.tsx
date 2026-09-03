"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Button, cn } from "@vedicneev/ui";
import { formatDuration, localizeMediaText } from "@vedicneev/engine";
import type { AccessResult, MediaItem } from "@vedicneev/engine";
import { ChevronDown, ChevronUp, Lock, Pause, Play, RotateCcw, RotateCw, X } from "lucide-react";

import type { LanguageCode } from "@/lib/exam/types";

const RATES = [1, 1.25, 1.5] as const;
const SKIP_SECONDS = 10;
const WAVEFORM_BARS = 40;

export interface AudioPodPlayerProps {
  item: MediaItem;
  language: LanguageCode;
  onClose: () => void;
  access: AccessResult;
  onConsumePreview: () => void;
  onUnlockRequested: () => void;
}

export function AudioPodPlayer({ item, language, onClose, access, onConsumePreview, onUnlockRequested }: AudioPodPlayerProps) {
  const [expanded, setExpanded] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rate, setRate] = useState<(typeof RATES)[number]>(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [lang, setLang] = useState<LanguageCode>(language);
  const [consumed, setConsumed] = useState(false);

  const waveform = useMemo(
    () => Array.from({ length: WAVEFORM_BARS }, (_, i) => 30 + Math.round(40 * Math.abs(Math.sin(i * 0.7)))),
    []
  );

  useEffect(() => {
    if (!playing || !access.allowed) return;
    const intervalId = window.setInterval(() => {
      setProgress((p) => Math.min(item.durationSeconds, p + 0.2 * rate));
    }, 200);
    return () => window.clearInterval(intervalId);
  }, [playing, access.allowed, rate, item.durationSeconds]);

  useEffect(() => {
    if (progress >= item.durationSeconds) setPlaying(false);
  }, [progress, item.durationSeconds]);

  function handlePlayToggle() {
    if (!access.allowed) {
      onUnlockRequested();
      return;
    }
    if (!consumed) {
      setConsumed(true);
      onConsumePreview();
    }
    setPlaying((p) => !p);
  }

  const progressPercent = (progress / item.durationSeconds) * 100;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background shadow-2xl">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex w-full items-center gap-3 p-3 text-left"
        >
          <Button
            type="button"
            size="icon"
            variant={access.allowed ? "default" : "outline"}
            onClick={(e) => {
              e.stopPropagation();
              handlePlayToggle();
            }}
            aria-label={playing ? "Pause" : "Play"}
          >
            {!access.allowed ? <Lock className="h-4 w-4" /> : playing ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{localizeMediaText(item.title, lang)}</p>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {formatDuration(item.durationSeconds)}
          </Badge>
          {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close player"
            className="rounded-md p-1 text-muted-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </span>
        </button>

        {expanded ? (
          <div className="flex flex-col gap-3 border-t border-border p-4">
            {!access.allowed ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <Lock className="h-6 w-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Audio pods are part of Vedic All-Access.</p>
                <Button type="button" size="sm" onClick={onUnlockRequested}>
                  Unlock with All-Access
                </Button>
              </div>
            ) : (
              <>
                <div className="flex h-12 items-end gap-[2px]">
                  {waveform.map((height, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-full rounded-sm",
                        i / WAVEFORM_BARS < progress / item.durationSeconds ? "bg-primary" : "bg-muted"
                      )}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>

                <input
                  type="range"
                  min={0}
                  max={item.durationSeconds}
                  step={1}
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full accent-primary"
                  aria-label="Seek"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatDuration(progress)}</span>
                  <span>{formatDuration(item.durationSeconds)}</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => setProgress((p) => Math.max(0, p - SKIP_SECONDS))}
                    aria-label="Back 10 seconds"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button type="button" onClick={handlePlayToggle}>
                    {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => setProgress((p) => Math.min(item.durationSeconds, p + SKIP_SECONDS))}
                    aria-label="Forward 10 seconds"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  {RATES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRate(r)}
                      className={cn(
                        "rounded-md border px-2 py-1 text-xs font-semibold",
                        rate === r ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
                      )}
                    >
                      {r}x
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setLang(lang === "en" ? "hi" : "en")}
                    className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-muted-foreground"
                  >
                    {lang === "en" ? "EN" : "हि"}
                  </button>
                </div>

                {item.transcript ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowTranscript((t) => !t)}
                      className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                    >
                      {showTranscript ? "Hide transcript" : "Show transcript"}
                    </button>
                    {showTranscript ? (
                      <p className="mt-2 rounded-md bg-muted/60 p-3 text-sm text-foreground">
                        {localizeMediaText(item.transcript, lang)}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
