import type { OmrBubblePosition, OmrSheetSpec } from "@vedicneev/engine";

export interface OmrPrintSheetProps {
  specs: OmrSheetSpec[]; // Supports multi-page array
  examName: string;
}

const BUBBLE_SIZE_MM = 4.2;
const ROLL_BUBBLE_SIZE_MM = 3.6;
const WATERMARK_TEXT = "CONFIDENTIAL — VEDIC NEEV EXCLUSIVE PROPERTY. UNAUTHORIZED REPRODUCTION PROHIBITED.";
const WATERMARK_ROWS = 18;

/** Groups a spec's flat bubble list into one entry per question, in question order. */
function groupBubblesByQuestion(bubbles: OmrBubblePosition[]): [number, OmrBubblePosition[]][] {
  const byQuestion = new Map<number, OmrBubblePosition[]>();
  for (const bubble of bubbles) {
    const list = byQuestion.get(bubble.questionNumber);
    if (list) list.push(bubble);
    else byQuestion.set(bubble.questionNumber, [bubble]);
  }
  return [...byQuestion.entries()].sort(([a], [b]) => a - b);
}

/**
 * Printable A4 OMR answer sheet, one physical page per spec. Every bubble,
 * roll-number cell, and fiducial is positioned from the engine's own
 * generateOmrSheetSpec coordinates (packages/engine/src/omr.ts) — the same
 * normalized [0,1] space the scanner (omrScan.ts) samples against, so print
 * and scan can never drift apart from each other.
 */
export function OmrPrintSheet({ specs, examName }: OmrPrintSheetProps) {
  return (
    <>
      {specs.map((spec, pageIndex) => {
        const questionsInOrder = groupBubblesByQuestion(spec.bubbles);

        return (
          <div
            key={pageIndex}
            className="relative mx-auto overflow-hidden bg-white text-black print:m-0 print:break-after-page mb-8 shadow-md"
            style={{ width: "210mm", height: "297mm", pageBreakAfter: "always" }}
          >
            {/* Security watermark — rendered first (behind every other
                layer, no z-index needed) at ~8% opacity. That's faint
                enough that even where it crosses a bubble or the fiducial
                search bands, the added darkness stays far under both
                detection thresholds (0.35 fiducial confidence, 0.42 bubble
                fill) — verified against sampleDarkness's math: a
                near-white (~pixel 250+) watermark stroke contributes
                (255-250)/255 ≈ 0.02, nowhere near either threshold. */}
            <div className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden="true">
              <div
                className="absolute left-1/2 top-1/2 whitespace-pre text-center text-[13px] font-bold uppercase leading-[40px] text-gray-300"
                style={{ transform: "translate(-50%, -50%) rotate(-30deg)", width: "380mm", opacity: 0.08 }}
              >
                {Array.from({ length: WATERMARK_ROWS }, () => WATERMARK_TEXT).join("\n")}
              </div>
            </div>

            {/* Fiducial corner markers — scanner homography anchors */}
            {spec.fiducials.map((f) => (
              <div
                key={f.id}
                className="absolute bg-black"
                style={{
                  left: `${f.x * 100}%`,
                  top: `${f.y * 100}%`,
                  width: "10mm",
                  height: "10mm",
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}

            {/* Header strip */}
            <div className="absolute left-0 right-0 top-0 flex items-center justify-between border-b border-black px-8 py-2">
              <span className="text-sm font-bold">{examName} — OMR Sheet</span>
              {specs.length > 1 ? (
                <span className="text-xs font-semibold text-gray-600 print:text-black">
                  Page {pageIndex + 1} of {specs.length}
                </span>
              ) : null}
            </div>

            {/* Roll number grid — one digit column per rollNumberDigits, values 0-9 */}
            <div
              className="absolute text-[6px] font-bold tracking-wide"
              style={{ left: "6%", top: "4.2%" }}
            >
              ROLL NUMBER
            </div>
            {spec.rollNumberGrid.map((digit) => (
              <div
                key={`roll-${digit.digitIndex}-${digit.value}`}
                className="absolute flex items-center justify-center rounded-full border border-black text-[6px] leading-none"
                style={{
                  left: `${digit.x * 100}%`,
                  top: `${digit.y * 100}%`,
                  width: `${ROLL_BUBBLE_SIZE_MM}mm`,
                  height: `${ROLL_BUBBLE_SIZE_MM}mm`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {digit.value}
              </div>
            ))}

            {/* Answer bubbles — one question-number label plus 4 option bubbles per row */}
            {questionsInOrder.map(([questionNumber, bubbles]) => {
              const rowAnchor = bubbles[0]!;
              return (
                <div key={`q-${questionNumber}`}>
                  {/* Right-aligned, ending a full 1mm before option A's own
                      left edge (bubble center - BUBBLE_SIZE_MM/2) — wide
                      enough for 3-digit question numbers (AISSEE Class 9
                      runs to 150) without ever touching the bubble. */}
                  <div
                    className="absolute w-[9mm] whitespace-nowrap text-right text-[6.5px] font-bold leading-none"
                    style={{
                      left: `calc(${rowAnchor.x * 100}% - 12mm)`,
                      top: `${rowAnchor.y * 100}%`,
                      transform: "translateY(-50%)",
                    }}
                  >
                    {questionNumber}.
                  </div>
                  {bubbles.map((bubble) => (
                    <div
                      key={`${questionNumber}-${bubble.option}`}
                      className="absolute flex items-center justify-center rounded-full border border-black text-[6px] leading-none"
                      style={{
                        left: `${bubble.x * 100}%`,
                        top: `${bubble.y * 100}%`,
                        width: `${BUBBLE_SIZE_MM}mm`,
                        height: `${BUBBLE_SIZE_MM}mm`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {bubble.option}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
