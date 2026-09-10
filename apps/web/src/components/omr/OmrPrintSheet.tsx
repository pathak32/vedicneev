import type { OmrBubblePosition, OmrSheetSpec } from "@vedicneev/engine";

export interface OmrPrintSheetProps {
  specs: OmrSheetSpec[]; // Supports multi-page array
  examName: string;
}

const BUBBLE_SIZE_MM = 4.2;
const ROLL_BUBBLE_SIZE_MM = 3.6;

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
            className="relative mx-auto bg-white text-black print:m-0 print:break-after-page mb-8 shadow-md"
            style={{ width: "210mm", height: "297mm", pageBreakAfter: "always" }}
          >
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
                  <div
                    className="absolute w-[6mm] text-right text-[6.5px] font-bold leading-none"
                    style={{
                      left: `calc(${rowAnchor.x * 100}% - 7mm)`,
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
