import type { OmrSheetSpec } from "@vedicneev/engine";

export interface InstituteOmrPrintMeta {
  instituteName: string;
  instituteSlug: string;
  batchName: string;
  testCode: string;
  subject: string;
  /** Institute.brandColor — any non-hex value falls back to DEFAULT_BRAND_COLOR rather than reaching the page unsanitized. */
  brandColor?: string | null;
}

const DEFAULT_BRAND_COLOR = "#1E3A8A";
const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/**
 * Institute-supplied, so never trusted as-is: this is interpolated straight
 * into a <style> block, and an unvalidated value there is a CSS/HTML
 * injection vector (a value like `red}</style><script>...` breaks out of
 * the block entirely). Strict hex-only validation, not just escaping, is
 * what makes that impossible — anything else silently falls back to the
 * VedicNeev default rather than being escaped and rendered.
 */
function sanitizeBrandColor(color: string | null | undefined): string {
  return color && HEX_COLOR_PATTERN.test(color) ? color : DEFAULT_BRAND_COLOR;
}

/** `#1e3a8a` -> `30, 58, 138`, for use inside an rgba() tint — hex is already validated by the time this runs. */
function hexToRgbTriplet(hex: string): string {
  const normalized =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export interface InstituteOmrRosterEntry {
  sequenceNumber: number;
  rollNumber: string;
  sheetToken: string;
  studentName: string | null;
  /** "SET_1".."SET_5" — see TestBatchRosterEntry.setCode's own comment. Null/omitted renders no set-bubble marking at all, matching spec.setGrid being empty for a single-set batch. */
  setCode?: string | null;
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
  const brandColor = sanitizeBrandColor(meta.brandColor);
  const brandRgb = hexToRgbTriplet(brandColor);

  const bubblesByQuestion = new Map<number, typeof spec.bubbles>();
  for (const bubble of spec.bubbles) {
    const list = bubblesByQuestion.get(bubble.questionNumber) ?? [];
    list.push(bubble);
    bubblesByQuestion.set(bubble.questionNumber, list);
  }

  const fiducialsHtml = spec.fiducials
    .map((f) => `<div class="fiducial" style="left:${f.x * 100}%;top:${f.y * 100}%;"></div>`)
    .join("");

  // Decorative-only bounding box for the answer grid, derived from the
  // bubbles' own coordinates (not a copy of packages/engine's internal
  // gridLeft/gridTop/etc constants) so it can never drift out of sync with
  // them, then padded and clamped well clear of the fiducials at the 2%/98%
  // insets — this box is never used for detection, only for drawing a
  // brand-colored outline behind the real bubbles.
  const FRAME_PADDING = 0.02;
  const FRAME_MIN = 0.03;
  const FRAME_MAX = 0.97;
  const bubbleXs = spec.bubbles.map((b) => b.x);
  const bubbleYs = spec.bubbles.map((b) => b.y);
  const answerFrame = {
    left: Math.max(FRAME_MIN, Math.min(...bubbleXs) - BUBBLE_LABEL_OFFSET - FRAME_PADDING),
    top: Math.max(FRAME_MIN, Math.min(...bubbleYs) - FRAME_PADDING),
    right: Math.min(FRAME_MAX, Math.max(...bubbleXs) + FRAME_PADDING),
    bottom: Math.min(FRAME_MAX, Math.max(...bubbleYs) + FRAME_PADDING),
  };

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

  /** The set-code strip: one small labeled bubble per generated set, the one matching `setCode` (e.g. "SET_2" -> 2) marked filled. Renders nothing at all when spec.setGrid is empty (single-set batch). */
  function renderSetGrid(setCode: string | null | undefined): string {
    if (spec.setGrid.length === 0) return "";
    const targetSetNumber = setCode ? Number(setCode.replace(/^SET_/, "")) : null;
    const bubblesHtml = spec.setGrid
      .map(
        (cell) =>
          `<span class="set-bubble${cell.setNumber === targetSetNumber ? " filled" : ""}" style="left:${cell.x * 100}%;top:${cell.y * 100}%;">${cell.setNumber}</span>`
      )
      .join("");
    return `<div class="set-label" style="top:${(spec.setGrid[0]!.y - 0.014) * 100}%;">Set</div>${bubblesHtml}`;
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
    <!-- Decorative brand-colored section frames only — sized to sit just
         outside the real id/answer grids below, never sharing an element
         (or its coordinate system) with the fiducials or bubbles, so the
         scanner's homography and per-bubble sampling see exactly the same
         geometry as an unbranded sheet. -->
    <div class="id-frame"></div>
    <div class="answer-frame" style="left:${answerFrame.left * 100}%;top:${answerFrame.top * 100}%;width:${(answerFrame.right - answerFrame.left) * 100}%;height:${(answerFrame.bottom - answerFrame.top) * 100}%;"></div>
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
    ${renderSetGrid(entry.setCode)}
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
  :root { --brand: ${brandColor}; --brand-rgb: ${brandRgb}; }
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
  /* Fiducial anchors and every bubble stay pure black, unconditionally —
     these are the only elements the scanner's homography and per-bubble
     darkness sampling actually read, so brand color never touches them. */
  .fiducial { position: absolute; width: 10mm; height: 10mm; background: #000; transform: translate(-50%, -50%); }
  /* Purely decorative brand-colored outlines, painted behind the real
     content — see the comment above their markup for why they're separate
     elements from the grids/bubbles they frame. */
  .id-frame {
    position: absolute; left: 5%; top: 4.3%; width: 90%; height: 16.2%;
    border: 1.25px solid var(--brand); border-radius: 2px; pointer-events: none;
  }
  .answer-frame {
    position: absolute; border: 1.25px solid var(--brand); border-radius: 2px; pointer-events: none;
  }
  .serial { position: absolute; left: 5%; top: 1%; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: var(--brand); }
  .header {
    position: absolute; left: 5%; top: 2.5%; width: 90%; text-align: center;
    font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
    border: 1.25px solid var(--brand); border-radius: 3px; padding: 1.2mm 0;
    background: rgba(var(--brand-rgb), 0.06); color: var(--brand);
  }
  .meta { position: absolute; left: 54%; top: 6%; width: 40%; font-size: 9px; }
  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; row-gap: 4px; column-gap: 8px; }
  .meta-line { border-bottom: 1px solid #000; }
  .roll-label { position: absolute; left: 6%; top: 5%; font-size: 9px; font-weight: 600; color: var(--brand); }
  .roll-grid { position: absolute; left: 6%; top: 6%; width: 42%; height: 14%; }
  .token-label { position: absolute; left: 52%; top: 5%; font-size: 9px; font-weight: 600; color: var(--brand); }
  .token-grid { position: absolute; left: 52%; top: 6%; width: 42%; height: 14%; }
  .roll-col { position: absolute; top: 0; display: flex; flex-direction: column; align-items: center; }
  .roll-bubble, .bubble {
    display: inline-flex; align-items: center; justify-content: center;
    width: 3.2mm; height: 3.2mm; border-radius: 50%; border: 1px solid #000; font-size: 6px;
  }
  .roll-bubble { margin: 1px 0; }
  .roll-bubble.filled { background: #000; color: #fff; }
  .bubble { position: absolute; transform: translate(-50%, -50%); }
  .set-label { position: absolute; left: 6%; font-size: 7px; font-weight: 600; color: var(--brand); }
  .set-bubble {
    position: absolute; transform: translate(-50%, -50%); display: inline-flex; align-items: center;
    justify-content: center; width: 3.6mm; height: 3.6mm; border-radius: 50%; border: 1px solid #000; font-size: 6px;
  }
  .set-bubble.filled { background: #000; color: #fff; }
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
