import type { OmrSheetSpec } from "@vedicneev/engine";

export interface OmrPrintSheetProps {
  spec: OmrSheetSpec;
  examName: string;
}

const BUBBLE_LABEL_OFFSET = 0.055;

/**
 * Printable A4 OMR answer sheet, laid out purely from the sheet spec's
 * normalized [0,1] coordinates — the exact same numbers the scanner later
 * uses (through its detected-corner homography) to sample each bubble, so
 * the printed sheet and the scan pipeline can never drift apart.
 */
export function OmrPrintSheet({ spec, examName }: OmrPrintSheetProps) {
  const bubblesByQuestion = new Map<number, typeof spec.bubbles>();
  for (const bubble of spec.bubbles) {
    const list = bubblesByQuestion.get(bubble.questionNumber) ?? [];
    list.push(bubble);
    bubblesByQuestion.set(bubble.questionNumber, list);
  }

  return (
    <div
      className="relative mx-auto bg-white text-black print:m-0"
      style={{ width: "210mm", height: "297mm" }}
    >
      {/* Fiducial corner markers — solid black squares the scanner searches for. */}
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

      {/* Header: exam name + candidate metadata blocks */}
      <div className="absolute left-[5%] top-[2%] w-[90%] text-center text-sm font-bold uppercase tracking-wide">
        {examName} — OMR Answer Sheet
      </div>

      <div className="absolute left-[54%] top-[6%] w-[40%] text-[9px]">
        <div className="mb-2 grid grid-cols-2 gap-x-2 gap-y-1">
          <span className="font-semibold">Roll Number:</span>
          <span className="border-b border-black" />
          <span className="font-semibold">Booklet Code:</span>
          <span className="flex gap-2">
            {["A", "B", "C", "D"].map((code) => (
              <span key={code} className="flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded-full border border-black" />
                {code}
              </span>
            ))}
          </span>
          <span className="font-semibold">State Quota:</span>
          <span className="border-b border-black" />
          <span className="font-semibold">Exam Category:</span>
          <span className="border-b border-black" />
          <span className="font-semibold">Candidate Name:</span>
          <span className="border-b border-black" />
        </div>
      </div>

      {/* Roll number bubble grid */}
      <div className="absolute left-[6%] top-[6%] w-[42%]">
        <p className="mb-1 text-[9px] font-semibold">Roll Number (bubble each digit)</p>
        <div className="relative" style={{ height: "14%" }}>
          {Array.from({ length: spec.rollNumberDigits }).map((_, digitIndex) => (
            <div
              key={digitIndex}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${(digitIndex / spec.rollNumberDigits) * 100}%` }}
            >
              {Array.from({ length: 10 }).map((_, value) => (
                <span
                  key={value}
                  className="my-[1px] flex h-[3.2mm] w-[3.2mm] items-center justify-center rounded-full border border-black text-[6px]"
                >
                  {value}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Question bubble grid */}
      {Array.from(bubblesByQuestion.entries()).map(([questionNumber, bubbles]) => {
        const optionA = bubbles.find((b) => b.option === "A")!;
        return (
          <div key={questionNumber}>
            <span
              className="absolute text-[7px] font-semibold"
              style={{
                left: `${(optionA.x - BUBBLE_LABEL_OFFSET) * 100}%`,
                top: `${optionA.y * 100}%`,
                transform: "translate(-100%, -50%)",
              }}
            >
              {questionNumber}
            </span>
            {bubbles.map((bubble) => (
              <span
                key={`${questionNumber}-${bubble.option}`}
                className="absolute flex h-[3.2mm] w-[3.2mm] items-center justify-center rounded-full border border-black text-[6px]"
                style={{
                  left: `${bubble.x * 100}%`,
                  top: `${bubble.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                {bubble.option}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}
