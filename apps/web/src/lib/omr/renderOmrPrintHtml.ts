import type { OmrSheetSpec } from "@vedicneev/engine";

export interface OmrPrintHtmlMeta {
  serialCode: string;
  examLabel: string;
  classLevel: number;
}

const BUBBLE_LABEL_OFFSET = 0.055;

export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Renders a self-contained, printable OMR answer sheet as a raw HTML
 * document — no React/Tailwind runtime involved, so it can be served
 * directly from an API route and opened straight in a plain browser tab
 * (e.g. GET /api/omr/generate?...&format=html). Bubble/fiducial positions
 * come straight from `spec`'s normalized [0,1] coordinates — the exact same
 * numbers apps/web/src/components/omr/OmrPrintSheet.tsx (the in-app React
 * renderer used by /exam/[examId]/omr/print) and the scanner
 * (packages/engine/src/omrScan.ts) use, so this standalone document can
 * never drift out of alignment with either.
 */
export function renderOmrPrintHtml(spec: OmrSheetSpec, meta: OmrPrintHtmlMeta): string {
  const bubblesByQuestion = new Map<number, typeof spec.bubbles>();
  for (const bubble of spec.bubbles) {
    const list = bubblesByQuestion.get(bubble.questionNumber) ?? [];
    list.push(bubble);
    bubblesByQuestion.set(bubble.questionNumber, list);
  }

  const fiducialsHtml = spec.fiducials
    .map((f) => `<div class="fiducial" style="left:${f.x * 100}%;top:${f.y * 100}%;"></div>`)
    .join("");

  const rollDigitsHtml = Array.from({ length: spec.rollNumberDigits })
    .map((_, digitIndex) => {
      const valuesHtml = Array.from({ length: 10 })
        .map((_v, value) => `<span class="roll-bubble">${value}</span>`)
        .join("");
      return `<div class="roll-col" style="left:${(digitIndex / spec.rollNumberDigits) * 100}%;">${valuesHtml}</div>`;
    })
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

  const serialCode = escapeHtml(meta.serialCode);
  const examLabel = escapeHtml(meta.examLabel);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${examLabel} OMR Sheet — ${serialCode}</title>
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
    width: 210mm; height: 297mm; box-shadow: 0 2px 12px rgba(0,0,0,0.25);
  }
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
  .roll-col { position: absolute; top: 0; display: flex; flex-direction: column; align-items: center; }
  .roll-bubble, .bubble {
    display: inline-flex; align-items: center; justify-content: center;
    width: 3.2mm; height: 3.2mm; border-radius: 50%; border: 1px solid #000; font-size: 6px;
  }
  .roll-bubble { margin: 1px 0; }
  .bubble { position: absolute; transform: translate(-50%, -50%); }
  .q-label { position: absolute; font-size: 7px; font-weight: 600; transform: translate(-100%, -50%); }
  @media print {
    body { background: #fff; }
    .toolbar { display: none; }
    .sheet { margin: 0; box-shadow: none; }
    @page { size: A4; margin: 0; }
  }
</style>
</head>
<body>
  <div class="toolbar"><button type="button" onclick="window.print()">Print / Save PDF</button></div>
  <div class="sheet">
    ${fiducialsHtml}
    <div class="serial">Serial: ${serialCode}</div>
    <div class="header">${examLabel} &mdash; Class ${meta.classLevel} &mdash; OMR Answer Sheet</div>
    <div class="meta">
      <div class="meta-grid">
        <span><strong>Roll Number:</strong></span><span class="meta-line"></span>
        <span><strong>Candidate Name:</strong></span><span class="meta-line"></span>
        <span><strong>Set Serial:</strong></span><span>${serialCode}</span>
      </div>
    </div>
    <div class="roll-label">Roll Number (bubble each digit)</div>
    <div class="roll-grid">${rollDigitsHtml}</div>
    ${questionsHtml}
  </div>
</body>
</html>`;
}
