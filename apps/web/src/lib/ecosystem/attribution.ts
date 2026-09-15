const STORAGE_KEY = "vedicneev:from-vedic-mind-ai";

/**
 * Called once on app mount (see EcosystemReferralListener) to remember a
 * visitor arrived via a Vedic Mind AI ecosystem link (`utm_source=vedicmindai`),
 * so later screens — the dashboard's welcome message, the next auth sync —
 * can recognize them without re-reading the URL.
 */
export function captureVedicMindAiReferral(search: string): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(search);
  if (params.get("utm_source") !== "vedicmindai") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // Private browsing / blocked storage — nothing to fall back to, this is
    // best-effort attribution only.
  }
}

export function cameFromVedicMindAi(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
