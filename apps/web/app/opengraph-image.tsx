import { ImageResponse } from "next/og";

// The default (nodejs) runtime's ImageResponse fails to prerender this route
// during `next build` on Windows — its default-font loader resolves a
// `file://` URL via a codepath that chokes on Windows drive-letter paths
// (TypeError: Invalid URL, inside @vercel/og). The edge runtime doesn't hit
// that codepath and is Next's own documented default for this file type.
export const runtime = "edge";

export const alt = "Vedic Neev — JNVST, AISSEE & RMS Mock Tests";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Default OG/Twitter card image for every route that doesn't set its own
 * (App Router falls back to the nearest ancestor's opengraph-image). Fully
 * generated — no external asset or font fetch to fail at build/request time.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#ffffff",
          backgroundImage: "linear-gradient(135deg, #fff7ed 0%, #ffffff 55%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 32 32" fill="none">
            <path
              d="M16 2 L19.2 12.8 L30 16 L19.2 19.2 L16 30 L12.8 19.2 L2 16 L12.8 12.8 Z"
              fill="#f97316"
            />
          </svg>
          <span style={{ fontSize: 56, fontWeight: 700, color: "#1c1917" }}>Vedic Neev</span>
        </div>
        <div style={{ display: "flex", marginTop: 36, fontSize: 34, color: "#44403c", maxWidth: 920 }}>
          JNVST, AISSEE &amp; RMS mock tests with instant diagnostics and a Mistake Vault
        </div>
        <div style={{ display: "flex", marginTop: 48, fontSize: 26, color: "#f97316", fontWeight: 600 }}>
          vedicneev.com
        </div>
      </div>
    ),
    { ...size }
  );
}
