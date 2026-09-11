"use client";

import type { AccessResult } from "@vedicneev/engine";

import { useLanguageStore } from "@/lib/hooks/useLanguageStore";
import { useMediaPlayerStore } from "@/lib/hooks/useMediaPlayerStore";
import { AudioPodPlayer } from "./AudioPodPlayer";

/** Podcasts are free, always-accessible content across the app — no paywall gate here (unlike SHORT_VIDEO speed-hack clinics inside the paid Mistake Vault). */
const ALWAYS_ALLOWED: AccessResult = { allowed: true, reason: "ALL_ACCESS", requiresUpgrade: false, suggestedPlans: [] };

/** Mounted once at the root layout so the mini-player survives client-side navigation — see useMediaPlayerStore.ts. */
export function GlobalAudioPlayer() {
  const nowPlaying = useMediaPlayerStore((s) => s.nowPlaying);
  const close = useMediaPlayerStore((s) => s.close);
  const language = useLanguageStore((s) => s.languageCode);

  if (!nowPlaying) return null;

  return (
    <AudioPodPlayer
      item={nowPlaying}
      language={language}
      onClose={close}
      access={ALWAYS_ALLOWED}
      onConsumePreview={() => {}}
      onUnlockRequested={() => {}}
    />
  );
}
