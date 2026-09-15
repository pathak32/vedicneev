import { ImageResponse } from "next/og";

// Same runtime-choice rationale as app/opengraph-image.tsx: the nodejs
// runtime's ImageResponse font loader breaks on Windows `file://` paths
// during `next build`; edge doesn't hit that codepath.
export const runtime = "edge";

// 192/512 back the PWA manifest (packages/db has no say here — this is
// pure app-shell branding); 180 is Apple's documented apple-touch-icon size.
const VALID_SIZES = [180, 192, 512] as const;

export async function GET(_request: Request, { params }: { params: { size: string } }) {
  const size = Number(params.size);
  if (!VALID_SIZES.includes(size as (typeof VALID_SIZES)[number])) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f97316",
        }}
      >
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 32 32" fill="none">
          <path
            d="M16 2 L19.2 12.8 L30 16 L19.2 19.2 L16 30 L12.8 19.2 L2 16 L12.8 12.8 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    ),
    { width: size, height: size }
  );
}
