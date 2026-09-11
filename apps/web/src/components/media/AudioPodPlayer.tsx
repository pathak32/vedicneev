"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

/**
 * A persistent bottom mini-player — real playback via a hidden <audio>
 * element, driven by its own timeupdate/play/pause/ended events (not a
 * simulated timer). Mounted once at the root layout by
 * apps/web/src/lib/hooks/useMediaPlayerStore.ts, so it survives
 * client-side navigation — the "background-play" experience the request
 * asked for. The decorative waveform bars stay Math.sin-generated (real
 * waveform analysis needs decoding the audio, out of scope).
 */
export function AudioPodPlayer({ item, language, onClose, access, onConsumePreview, onUnlockRequested }: AudioPodPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(item.durationSeconds);
  const [rate, setRate] = useState<(typeof RATES)[number]>(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [lang, setLang] = useState<LanguageCode>(language);
  const [consumed, setConsumed] = useState(false);

  const waveform = useMemo(
    () => Array.from({ length: WAVEFORM_BARS }, (_, i) => 30 + Math.round(40 * Math.abs(Math.sin(i * 0.7)))),
    []
  );

  // A new item swapped in while the mini-player stays mounted (e.g. the
  // student taps a different podcast without closing the bar first) —
  // reset local playback state so it doesn't carry over from the last item.
  useEffect(() => {
    setProgress(0);
    setDuration(item.durationSeconds);
    setPlaying(false);
    setConsumed(false);
    if (audioRef.current) audioRef.current.playbackRate = rate;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only resets on item change, not on every rate change
  }, [item.id]);

  function handlePlayToggle() {
    if (!access.allowed) {
      onUnlockRequested();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (!consumed) {
      setConsumed(true);
      onConsumePreview();
    }
    if (audio.paused) void audio.play();
    else audio.pause();
  }

  function skip(deltaSeconds: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + deltaSeconds));
  }

  function handleRateChange(nextRate: (typeof RATES)[number]) {
    setRate(nextRate);
    if (audioRef.current) audioRef.current.playbackRate = nextRate;
  }

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background shadow-2xl">
      {item.audioUrl ? (
        <audio
          ref={audioRef}
          src={item.audioUrl}
          onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || item.durationSeconds)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
        />
      ) : null}
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
            {formatDuration(duration)}
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
                      className={cn("w-full rounded-sm", duration > 0 && i / WAVEFORM_BARS < progress / duration ? "bg-primary" : "bg-muted")}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>

                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={1}
                  value={progress}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setProgress(next);
                    if (audioRef.current) audioRef.current.currentTime = next;
                  }}
                  className="w-full accent-primary"
                  aria-label="Seek"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatDuration(progress)}</span>
                  <span>{formatDuration(duration)}</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Button type="button" size="icon" variant="outline" onClick={() => skip(-SKIP_SECONDS)} aria-label="Back 10 seconds">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button type="button" onClick={handlePlayToggle}>
                    {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button type="button" size="icon" variant="outline" onClick={() => skip(SKIP_SECONDS)} aria-label="Forward 10 seconds">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  {RATES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRateChange(r)}
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
