import type { OmrBubblePosition, OmrSheetSpec } from "@vedicneev/engine";

export interface OmrPrintSheetProps {
  specs: OmrSheetSpec[]; // Supports multi-page array
  examName: string;
  /** e.g. "VN104213" — apps/web/src/lib/exam/omr-bridge.ts's generateVedicNeevRollNumber(). */
  vedicNeevRollNumber: string;
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
export function OmrPrintSheet({ specs, examName, vedicNeevRollNumber }: OmrPrintSheetProps) {
  // Each spec numbers its own bubbles 1..totalQuestions locally — that
  // stays untouched (it's the contract OmrScanner.tsx's own pageOffsets
  // logic relies on for scanning). This is purely a *display* offset so
  // page 2 of a multi-page sheet reads "51." instead of restarting at "1.",
  // matching what the scanner already treats as the global question number.
  let runningOffset = 0;
  const pageOffsets = specs.map((spec) => {
    const offset = runningOffset;
    runningOffset += spec.totalQuestions;
    return offset;
  });

  return (
    <>
      {specs.map((spec, pageIndex) => {
        const questionsInOrder = groupBubblesByQuestion(spec.bubbles);
        const displayOffset = pageOffsets[pageIndex] ?? 0;

        return (
          <div
            key={pageIndex}
            className="relative mx-auto overflow-hidden bg-white text-black print:m-0 print:break-after-page mb-8 shadow-md"
            style={{ width: "210mm", height: "297mm", pageBreakAfter: "always" }}
          >
            {/* Security watermark — rendered first (behind every other
                layer, no z-index needed). At 18% opacity on gray-400 text
                the blended pixel is still ~239/255 (darkness ≈0.06) even
                directly on a stroke — 5-6x under both detection thresholds
                (0.35 fiducial confidence, 0.42 bubble fill), and a thin
                diagonal stroke only covers a fraction of any 6-8px sample
                circle's area besides, diluting that further. Clearly
                visible to the eye without risking a false bubble/fiducial
                read. */}
            <div className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden="true">
              <div
                className="absolute left-1/2 top-1/2 whitespace-pre text-center text-[15px] font-black uppercase leading-[36px] text-gray-400"
                style={{ transform: "translate(-50%, -50%) rotate(-30deg)", width: "380mm", opacity: 0.18 }}
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
            <div className="absolute left-0 right-0 top-0 flex items-center justify-between border-b border-black px-8 py-1.5">
              <span className="text-xs font-bold">{examName} — OMR Sheet</span>
              {specs.length > 1 ? (
                <span className="text-[10px] font-semibold text-gray-600 print:text-black">
                  Page {pageIndex + 1} of {specs.length}
                </span>
              ) : null}
            </div>

            {/* Identity band — roll-number bubble grid (left, unchanged,
                what the scanner reads) plus the human-readable Vedic Neev
                roll number and write-in fields (right, blank space this
                band already had). Both sit above gridTop (0.24) so the
                answer-bubble grid below is untouched. */}
            <div
              className="absolute text-[6px] font-bold tracking-wide"
              style={{ left: "6%", top: "4%" }}
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

            <div className="absolute flex flex-col gap-[3px]" style={{ left: "52%", right: "3%", top: "4%" }}>
              <div className="flex items-baseline gap-1.5 border-b border-black pb-[2px]">
                <span className="text-[6px] font-bold tracking-wide">VEDIC NEEV ID</span>
                <span className="font-mono text-[9px] font-black tracking-wider">{vedicNeevRollNumber}</span>
              </div>
              {["Name", "School", "Class", "Code", "State"].map((field) => (
                <div key={field} className="flex items-baseline gap-1.5">
                  <span className="w-[9mm] shrink-0 text-[6px] font-bold">{field}:</span>
                  <span className="flex-1 border-b border-dotted border-black" style={{ height: "3mm" }} />
                </div>
              ))}
            </div>

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
                    {questionNumber + displayOffset}.
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
