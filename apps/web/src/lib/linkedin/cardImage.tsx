import { ImageResponse } from "next/og";

import type { CardContent } from "./cardContent";

export const CARD_SIZE = { width: 1080, height: 1350 } as const;

const NAVY = "#0B1426";
const PANEL = "#12203A";
const BLUE = "#4C8DFF";
const AMBER = "#FFB020";
const TEXT = "#EAF0FF";
const MUTED = "#9FB3D9";

/** Shrinks type as the content grows, so long examples stay inside the card. */
function titleSize(title: string): number {
  if (title.length <= 40) return 84;
  if (title.length <= 70) return 70;
  return 58;
}

function bodySize(lines: string[]): number {
  const chars = lines.reduce((sum, l) => sum + l.length, 0);
  if (chars <= 160) return 46;
  if (chars <= 260) return 40;
  return 35;
}

/** A 1080x1350 (4:5) image card for a maths post: hook as title, worked example as steps, CTA as the challenge. */
export function renderMathsCard(content: CardContent): ImageResponse {
  const body = bodySize(content.lines);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 72px 64px 72px",
          backgroundColor: NAVY,
          color: TEXT,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  backgroundColor: PANEL,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: BLUE,
                  fontSize: 38,
                  fontWeight: 800,
                }}
              >
                V
              </div>
              <div style={{ display: "flex", marginLeft: 18, fontSize: 30, fontWeight: 700, letterSpacing: 4 }}>
                VEDIC MIND AI
              </div>
            </div>
            <div
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                backgroundColor: PANEL,
                color: AMBER,
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              Vedic Maths
            </div>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 64,
              fontSize: titleSize(content.title),
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: -1,
            }}
          >
            {content.title}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 52,
              padding: "36px 40px",
              borderRadius: 28,
              backgroundColor: PANEL,
              borderLeft: `10px solid ${BLUE}`,
            }}
          >
            {content.lines.map((line, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  fontSize: body,
                  lineHeight: 1.3,
                  marginTop: i === 0 ? 0 : 20,
                  color: i === 0 ? TEXT : "#D3DEF7",
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", padding: "30px 40px", borderRadius: 28, backgroundColor: AMBER, color: NAVY }}>
            <div style={{ display: "flex", fontSize: 26, fontWeight: 800, letterSpacing: 4 }}>YOUR TURN</div>
            <div style={{ display: "flex", marginTop: 10, fontSize: 48, fontWeight: 800, lineHeight: 1.15 }}>
              {content.challenge}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 36, fontSize: 27, color: MUTED }}>
            Try the free speed-math test: vedicmindai.in/tools/speed-math-test
          </div>
        </div>
      </div>
    ),
    { ...CARD_SIZE }
  );
}
