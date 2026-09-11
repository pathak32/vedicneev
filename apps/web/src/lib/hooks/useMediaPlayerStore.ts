import { create } from "zustand";
import type { MediaItem } from "@vedicneev/engine";

export interface MediaPlayerStoreState {
  nowPlaying: MediaItem | null;
  play: (item: MediaItem) => void;
  close: () => void;
}

/**
 * The single "now playing" audio pod, shared across the whole app so a
 * student can start a podcast on one page and keep listening while they
 * navigate elsewhere — the actual <audio> element lives in
 * apps/web/src/components/media/GlobalAudioPlayer.tsx, mounted once at the
 * root layout, subscribed to this store. Deliberately NOT persisted (unlike
 * useLanguageStore.ts) — now-playing shouldn't survive a full reload, only
 * client-side navigation.
 */
export const useMediaPlayerStore = create<MediaPlayerStoreState>((set) => ({
  nowPlaying: null,
  play: (item) => set({ nowPlaying: item }),
  close: () => set({ nowPlaying: null }),
}));
