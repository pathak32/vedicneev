"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Badge, Button, cn } from "@vedicneev/ui";
import { localizeMediaText } from "@vedicneev/engine";
import type { AccessResult, MediaItem } from "@vedicneev/engine";
import { Lock, Pause, Play, Sparkles, Volume2, VolumeX, X } from "lucide-react";

import type { LanguageCode } from "@/lib/exam/types";

const SPEEDS = [1, 1.25] as const;
const SWIPE_THRESHOLD_PX = 50;

export interface SpeedShortsPlayerProps {
  items: MediaItem[];
  initialIndex: number;
  language: LanguageCode;
  onClose: () => void;
  /** Per-item entitlement check — some shorts may be free-preview-available while others aren't. */
  getAccess: (item: MediaItem) => AccessResult;
  /** Called once, the first time a free-preview item actually starts playing. */
  onConsumePreview: (item: MediaItem) => void;
  onUnlockRequested: (access: AccessResult) => void;
}

export function SpeedShortsPlayer({
  items,
  initialIndex,
  language,
  onClose,
  getAccess,
  onConsumePreview,
  onUnlockRequested,
}: SpeedShortsPlayerProps) {
  const [index, setIndex] = useState(initialIndex);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [lang, setLang] = useState<LanguageCode>(language);
  const consumedRef = useRef(new Set<string>());
  const touchStartY = useRef<number | null>(null);

  const item = items[index];
  const access = item ? getAccess(item) : { allowed: false, reason: "REQUIRES_ALL_ACCESS" as const, requiresUpgrade: true, suggestedPlans: [] };

  function goTo(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= items.length) return;
    setIndex(nextIndex);
    setProgress(0);
    setPlaying(true);
  }

  // Simulated playback timer (no real media asset in this demo — see mock-data.ts).
  useEffect(() => {
    if (!item || !playing || !access.allowed) return;
    const intervalId = window.setInterval(() => {
      setProgress((p) => {
        const next = p + 0.2 * speed;
        if (next >= item.durationSeconds) {
          goTo(index + 1 < items.length ? index + 1 : index);
          return item.durationSeconds;
        }
        return next;
      });
    }, 200);
    return () => window.clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, playing, access.allowed, speed]);

  useEffect(() => {
    if (item && playing && access.allowed && !consumedRef.current.has(item.id)) {
      consumedRef.current.add(item.id);
      onConsumePreview(item);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, playing, access.allowed]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        goTo(index - 1);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        goTo(index + 1);
      } else if (event.key === " ") {
        event.preventDefault();
        setPlaying((p) => !p);
      } else if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-20 rounded-full bg-black/50 p-2 text-white"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        className="relative flex h-full max-h-[812px] w-full max-w-[420px] flex-col overflow-hidden bg-neutral-900 text-white sm:rounded-2xl"
        onTouchStart={(e) => {
          touchStartY.current = e.touches[0]?.clientY ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStartY.current === null) return;
          const deltaY = (e.changedTouches[0]?.clientY ?? touchStartY.current) - touchStartY.current;
          if (deltaY > SWIPE_THRESHOLD_PX) goTo(index - 1);
          else if (deltaY < -SWIPE_THRESHOLD_PX) goTo(index + 1);
          touchStartY.current = null;
        }}
      >
        {/* Segmented progress bar, one segment per item */}
        <div className="absolute inset-x-2 top-2 z-10 flex gap-1">
          {items.map((it, i) => (
            <div key={it.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full bg-white transition-[width]"
                style={{
                  width:
                    i < index ? "100%" : i === index ? `${(progress / item.durationSeconds) * 100}%` : "0%",
                }}
              />
            </div>
          ))}
        </div>

        {/* "Video" surface — placeholder in this demo (see module doc comment) */}
        <div className="relative flex flex-1 flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/30 to-neutral-900 p-6 text-center">
          <Badge variant="secondary" className="absolute left-3 top-8">
            {item.mediaType === "SHORT_VIDEO" ? "Speed Short" : item.mediaType}
          </Badge>

          {!access.allowed ? (
            <div className="flex flex-col items-center gap-3">
              <Lock className="h-10 w-10 text-white/80" />
              <p className="text-sm text-white/80">You&apos;ve used your free preview short.</p>
              <Button type="button" onClick={() => onUnlockRequested(access)}>
                Unlock with All-Access
              </Button>
            </div>
          ) : (
            <>
              <Sparkles className="h-10 w-10 text-primary" />
              <h2 className="text-xl font-bold">{localizeMediaText(item.title, lang)}</h2>
              <p className="text-sm text-white/80">{localizeMediaText(item.description, lang)}</p>
              <p className="text-xs uppercase tracking-wide text-white/50">Demo mode — no video file attached</p>
            </>
          )}
        </div>

        {/* Overlay controls */}
        <div className="flex items-center justify-between gap-2 bg-black/60 p-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10"
              disabled={!access.allowed}
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="rounded-md border border-white/30 px-2 py-1 text-xs font-semibold"
            >
              {lang === "en" ? "EN" : "हि"}
            </button>
          </div>

          <div className="flex items-center gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSpeed(s)}
                className={cn(
                  "rounded-md border px-2 py-1 text-xs font-semibold",
                  speed === s ? "border-primary bg-primary text-primary-foreground" : "border-white/30 text-white"
                )}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {access.allowed ? (
          <Button asChild className="m-3 mt-0" size="lg">
            <Link href="/exam/demo-jnvst?mode=practice">Try Practice Question</Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
