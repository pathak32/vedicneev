/**
 * Turns an admin-pasted YouTube/Vimeo URL into a safe iframe embed src.
 * Video hosting for this project is YouTube/Vimeo embeds, not self-hosted
 * files (see MediaItem.videoUrl) — this is the one place that URL is ever
 * parsed, shared by the admin form's live preview and the student player,
 * so both agree on exactly what counts as a valid, embeddable link.
 *
 * `embedUrl` is always reconstructed from the validated provider + id, the
 * raw pasted string is never passed into an iframe `src` itself — that's
 * the guard against an arbitrary/malicious URL ending up in a `src`
 * attribute.
 */

export type MediaEmbedProvider = "youtube" | "vimeo";

export interface MediaEmbed {
  provider: MediaEmbedProvider;
  embedUrl: string;
  sourceId: string;
}

const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "youtube-nocookie.com", "www.youtube-nocookie.com"]);
const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{6,20}$/;
const VIMEO_ID_PATTERN = /^\d+$/;

function extractYoutubeId(parsed: URL): string | null {
  if (parsed.hostname === "youtu.be") {
    const id = parsed.pathname.slice(1);
    return YOUTUBE_ID_PATTERN.test(id) ? id : null;
  }
  if (parsed.pathname.startsWith("/shorts/") || parsed.pathname.startsWith("/embed/")) {
    const id = parsed.pathname.split("/")[2];
    return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
  }
  const id = parsed.searchParams.get("v");
  return id && YOUTUBE_ID_PATTERN.test(id) ? id : null;
}

function extractVimeoId(parsed: URL): string | null {
  const segments = parsed.pathname.split("/").filter(Boolean);
  const id = segments[0] === "video" ? segments[1] : segments[segments.length - 1];
  return id && VIMEO_ID_PATTERN.test(id) ? id : null;
}

export function parseMediaEmbedUrl(url: string): MediaEmbed | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;

  if (YOUTUBE_HOSTS.has(parsed.hostname)) {
    const id = extractYoutubeId(parsed);
    if (!id) return null;
    return { provider: "youtube", sourceId: id, embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` };
  }

  if (VIMEO_HOSTS.has(parsed.hostname)) {
    const id = extractVimeoId(parsed);
    if (!id) return null;
    return { provider: "vimeo", sourceId: id, embedUrl: `https://player.vimeo.com/video/${id}` };
  }

  return null;
}
