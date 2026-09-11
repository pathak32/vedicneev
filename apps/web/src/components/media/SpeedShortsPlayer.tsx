"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Badge, Button, cn } from "@vedicneev/ui";
import { localizeMediaText, parseMediaEmbedUrl } from "@vedicneev/engine";
import type { AccessResult, MediaItem } from "@vedicneev/engine";
import { Lock, Sparkles, X } from "lucide-react";

import type { LanguageCode } from "@/lib/exam/types";

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

/**
 * TikTok-style vertical swipe reel — real playback via a YouTube/Vimeo
 * iframe (mounted only for the active item, so swiping away naturally stops
 * it, no provider JS API needed). Video hosting is embed-only (see
 * parseMediaEmbedUrl), so this drops the old fake Play/Pause/Mute/Speed
 * buttons that only ever sat over a placeholder — the provider's own player
 * chrome (`controls=1`) replaces them; swipe/keyboard navigation and the
 * access-gating overlay stay real and unchanged.
 */
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
  const [lang, setLang] = useState<LanguageCode>(language);
  const consumedRef = useRef(new Set<string>());
  const touchStartY = useRef<number | null>(null);

  const item = items[index];
  const access = item ? getAccess(item) : { allowed: false, reason: "REQUIRES_ALL_ACCESS" as const, requiresUpgrade: true, suggestedPlans: [] };
  const embed = item?.videoUrl ? parseMediaEmbedUrl(item.videoUrl) : null;

  function goTo(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= items.length) return;
    setIndex(nextIndex);
  }

  useEffect(() => {
    if (item && access.allowed && !consumedRef.current.has(item.id)) {
      consumedRef.current.add(item.id);
      onConsumePreview(item);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, access.allowed]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        goTo(index - 1);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        goTo(index + 1);
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
        {/* Segmented position indicator, one segment per item — filled for visited/current, empty for upcoming. Real-time fill isn't available without each provider's postMessage JS API. */}
        <div className="absolute inset-x-2 top-2 z-10 flex gap-1">
          {items.map((it, i) => (
            <div key={it.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              <div className="h-full bg-white transition-[width]" style={{ width: i <= index ? "100%" : "0%" }} />
            </div>
          ))}
        </div>

        {/* Video surface */}
        <div className="relative flex flex-1 flex-col items-center justify-center bg-black">
          <Badge variant="secondary" className="absolute left-3 top-8 z-10">
            {item.mediaType === "SHORT_VIDEO" ? "Speed Short" : item.mediaType}
          </Badge>

          {!access.allowed ? (
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <Lock className="h-10 w-10 text-white/80" />
              <p className="text-sm text-white/80">You&apos;ve used your free preview short.</p>
              <Button type="button" onClick={() => onUnlockRequested(access)}>
                Unlock with All-Access
              </Button>
            </div>
          ) : embed ? (
            <iframe
              key={item.id}
              src={embed.embedUrl}
              title={localizeMediaText(item.title, lang)}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center gap-3 p-6 text-center">
              <Sparkles className="h-10 w-10 text-primary" />
              <p className="text-sm text-white/60">This short&apos;s video isn&apos;t available yet.</p>
            </div>
          )}
        </div>

        {/* Caption strip */}
        <div className="flex items-start justify-between gap-2 bg-black/60 p-3">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold">{localizeMediaText(item.title, lang)}</h2>
            <p className="line-clamp-2 text-xs text-white/70">{localizeMediaText(item.description, lang)}</p>
          </div>
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "hi" : "en")}
            className="shrink-0 rounded-md border border-white/30 px-2 py-1 text-xs font-semibold"
          >
            {lang === "en" ? "EN" : "हि"}
          </button>
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
