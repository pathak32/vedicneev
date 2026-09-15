import type { OmrSheetSpec } from "@vedicneev/engine";

export interface InstituteOmrPrintMeta {
  instituteName: string;
  instituteSlug: string;
  batchName: string;
  testCode: string;
  subject: string;
}

export interface InstituteOmrRosterEntry {
  sequenceNumber: number;
  rollNumber: string;
  sheetToken: string;
  studentName: string | null;
}

const BUBBLE_LABEL_OFFSET = 0.055;

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Renders one self-contained, printable multi-page HTML document — one
 * page per roster entry — for an institute's TestBatch. Reuses the exact
 * same bubble/fiducial geometry apps/web's renderOmrPrintHtml.ts renders
 * from (packages/engine's generateOmrSheetSpec), computed ONCE for the
 * whole batch since every sheet in it shares the same
 * totalQuestions/columns/rollNumberDigits/sheetTokenDigits.
 *
 * Three things this renderer adds that the consumer version doesn't need:
 *  1. A diagonal repeating watermark of the test code + institute slug
 *     across the whole page body — present regardless of any crop, so
 *     photocopying a sheet can't remove it (though photocopying is already
 *     self-defeating on its own: see point 3).
 *  2. The roll-number grid PRE-FILLED for this student's sequenceNumber —
 *     since it's assigned up front (see createTestBatch.ts), there's no
 *     reason to make a student bubble their own roll number by hand, and
 *     pre-filling it removes a transcription-error class entirely.
 *  3. A second digit-grid (sheetTokenGrid), also pre-filled, encoding this
 *     entry's sheetToken — the value ingestion actually matches against
 *     (see TestBatchRosterEntry's own comment on why rollNumber alone
 *     isn't the anti-fraud key).
 */
export function renderInstituteOmrPrintHtml(
  spec: OmrSheetSpec,
  meta: InstituteOmrPrintMeta,
  rosterEntries: InstituteOmrRosterEntry[]
): string {
  const bubblesByQuestion = new Map<number, typeof spec.bubbles>();
  for (const bubble of spec.bubbles) {
    const list = bubblesByQuestion.get(bubble.questionNumber) ?? [];
    list.push(bubble);
    bubblesByQuestion.set(bubble.questionNumber, list);
  }

  const fiducialsHtml = spec.fiducials
    .map((f) => `<div class="fiducial" style="left:${f.x * 100}%;top:${f.y * 100}%;"></div>`)
    .join("");

  const questionsHtml = Array.from(bubblesByQuestion.entries())
    .map(([questionNumber, bubbles]) => {
      const optionA = bubbles.find((b) => b.option === "A")!;
      const labelLeft = (optionA.x - BUBBLE_LABEL_OFFSET) * 100;
      const bubblesHtml = bubbles
        .map((b) => `<span class="bubble" style="left:${b.x * 100}%;top:${b.y * 100}%;">${b.option}</span>`)
        .join("");
      return `<div><span class="q-label" style="left:${labelLeft}%;top:${optionA.y * 100}%;">${questionNumber}</span>${bubblesHtml}</div>`;
    })
    .join("");

  /** A pre-filled digit grid: one column per digit of `digits`, the matching value bubble marked "filled". */
  function renderPrefilledDigitGrid(grid: OmrSheetSpec["rollNumberGrid"], digitCount: number, digits: string): string {
    const columns: string[] = [];
    for (let d = 0; d < digitCount; d++) {
      const targetValue = Number(digits[d]);
      const valuesHtml = grid
        .filter((cell) => cell.digitIndex === d)
        .map((cell) => `<span class="roll-bubble${cell.value === targetValue ? " filled" : ""}">${cell.value}</span>`)
        .join("");
      const left = grid.find((cell) => cell.digitIndex === d)?.x ?? 0;
      columns.push(`<div class="roll-col" style="left:${left * 100}%;">${valuesHtml}</div>`);
    }
    return columns.join("");
  }

  const watermarkText = `${escapeHtml(meta.testCode)} · ${escapeHtml(meta.instituteSlug)}`;
  const watermarkTilesHtml = Array.from({ length: 30 })
    .map(() => `<span>${watermarkText}</span>`)
    .join("");

  const pagesHtml = rosterEntries
    .map((entry) => {
      const rollDigits = String(entry.sequenceNumber).padStart(spec.rollNumberDigits, "0");
      const rollGridHtml = renderPrefilledDigitGrid(spec.rollNumberGrid, spec.rollNumberDigits, rollDigits);
      const tokenGridHtml = renderPrefilledDigitGrid(spec.sheetTokenGrid, spec.sheetTokenDigits, entry.sheetToken);

      return `<div class="sheet">
    <div class="watermark">${watermarkTilesHtml}</div>
    ${fiducialsHtml}
    <div class="serial">${escapeHtml(meta.testCode)}</div>
    <div class="header">${escapeHtml(meta.instituteName)} &mdash; ${escapeHtml(meta.batchName)} &mdash; ${escapeHtml(meta.subject)}</div>
    <div class="meta">
      <div class="meta-grid">
        <span><strong>Roll Number:</strong></span><span>${escapeHtml(entry.rollNumber)}</span>
        <span><strong>Candidate Name:</strong></span><span class="meta-line"></span>
      </div>
    </div>
    <div class="roll-label">Roll Number</div>
    <div class="roll-grid">${rollGridHtml}</div>
    <div class="token-label">Sheet ID (office use)</div>
    <div class="token-grid">${tokenGridHtml}</div>
    ${questionsHtml}
  </div>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(meta.batchName)} OMR Sheets — ${escapeHtml(meta.testCode)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; background: #e5e5e5; font-family: Arial, Helvetica, sans-serif; }
  .toolbar { display: flex; justify-content: center; padding: 12px; }
  .toolbar button {
    padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer;
    border-radius: 6px; border: 1px solid #111; background: #111; color: #fff;
  }
  .sheet {
    position: relative; margin: 16px auto; background: #fff; color: #000;
    width: 210mm; height: 297mm; box-shadow: 0 2px 12px rgba(0,0,0,0.25); overflow: hidden;
  }
  .watermark {
    position: absolute; inset: 0; display: flex; flex-wrap: wrap; align-content: space-between;
    justify-content: space-between; transform: rotate(-30deg) scale(1.4); opacity: 0.08;
    pointer-events: none; font-size: 13px; font-weight: 700; letter-spacing: 0.05em;
  }
  .watermark span { width: 33%; text-align: center; }
  .fiducial { position: absolute; width: 10mm; height: 10mm; background: #000; transform: translate(-50%, -50%); }
  .serial { position: absolute; left: 5%; top: 1%; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; }
  .header {
    position: absolute; left: 5%; top: 2.5%; width: 90%; text-align: center;
    font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
  }
  .meta { position: absolute; left: 54%; top: 6%; width: 40%; font-size: 9px; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; row-gap: 4px; column-gap: 8px; }
  .meta-line { border-bottom: 1px solid #000; }
  .roll-label { position: absolute; left: 6%; top: 5%; font-size: 9px; font-weight: 600; }
  .roll-grid { position: absolute; left: 6%; top: 6%; width: 42%; height: 14%; }
  .token-label { position: absolute; left: 52%; top: 5%; font-size: 9px; font-weight: 600; }
  .token-grid { position: absolute; left: 52%; top: 6%; width: 42%; height: 14%; }
  .roll-col { position: absolute; top: 0; display: flex; flex-direction: column; align-items: center; }
  .roll-bubble, .bubble {
    display: inline-flex; align-items: center; justify-content: center;
    width: 3.2mm; height: 3.2mm; border-radius: 50%; border: 1px solid #000; font-size: 6px;
  }
  .roll-bubble { margin: 1px 0; }
  .roll-bubble.filled { background: #000; color: #fff; }
  .bubble { position: absolute; transform: translate(-50%, -50%); }
  .q-label { position: absolute; font-size: 7px; font-weight: 600; transform: translate(-100%, -50%); }
  @media print {
    body { background: #fff; }
    .toolbar { display: none; }
    .sheet { margin: 0; box-shadow: none; page-break-after: always; }
    @page { size: A4; margin: 0; }
  }
</style>
</head>
<body>
  <div class="toolbar"><button type="button" onclick="window.print()">Print / Save PDF (${rosterEntries.length} sheets)</button></div>
  ${pagesHtml}
</body>
</html>`;
}
