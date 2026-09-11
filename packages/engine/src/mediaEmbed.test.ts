import { describe, expect, it } from "vitest";

import { parseMediaEmbedUrl } from "./mediaEmbed";

describe("parseMediaEmbedUrl", () => {
  it("parses a standard youtube watch URL", () => {
    expect(parseMediaEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toEqual({
      provider: "youtube",
      sourceId: "dQw4w9WgXcQ",
      embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1",
    });
  });

  it("parses a youtu.be short link", () => {
    expect(parseMediaEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toEqual({
      provider: "youtube",
      sourceId: "dQw4w9WgXcQ",
      embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1",
    });
  });

  it("parses a youtube /shorts/ URL", () => {
    expect(parseMediaEmbedUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ")?.sourceId).toBe("dQw4w9WgXcQ");
  });

  it("parses a youtube /embed/ URL", () => {
    expect(parseMediaEmbedUrl("https://www.youtube.com/embed/dQw4w9WgXcQ")?.sourceId).toBe("dQw4w9WgXcQ");
  });

  it("parses a standard vimeo URL", () => {
    expect(parseMediaEmbedUrl("https://vimeo.com/76979871")).toEqual({
      provider: "vimeo",
      sourceId: "76979871",
      embedUrl: "https://player.vimeo.com/video/76979871",
    });
  });

  it("parses a vimeo player embed URL", () => {
    expect(parseMediaEmbedUrl("https://player.vimeo.com/video/76979871")?.sourceId).toBe("76979871");
  });

  it("rejects an unrelated host", () => {
    expect(parseMediaEmbedUrl("https://evil.example.com/watch?v=dQw4w9WgXcQ")).toBeNull();
  });

  it("rejects a malformed URL", () => {
    expect(parseMediaEmbedUrl("not a url")).toBeNull();
  });

  it("rejects a youtube URL with no video id", () => {
    expect(parseMediaEmbedUrl("https://www.youtube.com/watch")).toBeNull();
  });

  it("rejects a javascript: URL", () => {
    expect(parseMediaEmbedUrl("javascript:alert(1)")).toBeNull();
  });
});
