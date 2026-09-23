import type { MasterQuestionItem } from "@vedicneev/engine";

export interface SetQuestionPaperMeta {
  batchName: string;
  testCode: string;
  subject: string;
  setCode: string;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Renders this set's Question Paper — reordered per its permutation, and
 * deliberately never printing correctOption anywhere on the page (this
 * document is meant to reach students). Two content modes, chosen per
 * question independently:
 *
 * 1. Full text/options (masterQuestions[permutation[i]] has them) — the
 *    actual reordered question, same as any other set-shuffled paper.
 * 2. Text-less (the common case today — see TestBatch.masterQuestions'
 *    own comment on why an institute might supply only the master answer
 *    key) — a "New Q<n> -> Master Q<m>" assembly line instead. This is
 *    NOT a real exam paper in that case; it's what an institute's own
 *    printer/invigilator uses to physically reorder pages photocopied
 *    from their existing master question paper into this set's order,
 *    since this app has no question-bank content to render for them.
 */
export function renderSetQuestionPaperHtml(
  meta: SetQuestionPaperMeta,
  permutation: number[],
  masterQuestions: MasterQuestionItem[] | null
): string {
  const rowsHtml = permutation
    .map((masterIndex, i) => {
      const newQuestionNumber = i + 1;
      const masterQuestionNumber = masterIndex + 1;
      const item = masterQuestions?.find((q) => q.questionNumber === masterQuestionNumber);

      if (item?.text) {
        const optionsHtml = (["A", "B", "C", "D"] as const)
          .filter((option) => item.options?.[option])
          .map((option) => `<span class="option">${option}) ${escapeHtml(item.options![option]!)}</span>`)
          .join("");
        return `<div class="question">
    <p><strong>${newQuestionNumber}.</strong> ${escapeHtml(item.text)}</p>
    <div class="options">${optionsHtml}</div>
  </div>`;
      }

      return `<tr><td>${newQuestionNumber}</td><td>${masterQuestionNumber}</td></tr>`;
    })
    .join("\n");

  const hasFullText = masterQuestions?.some((q) => q.text);

  const body = hasFullText
    ? `<div class="questions">${rowsHtml}</div>`
    : `<p class="assembly-note">
        No question text is on file for this batch — this is an assembly order, not a printable exam paper:
        reorder photocopies of your own master question paper into this sequence before handing it out.
      </p>
      <table>
        <thead><tr><th>This Set's Question №</th><th>Master Question №</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(meta.batchName)} — ${escapeHtml(meta.setCode)} Question Paper</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; background: #e5e5e5; font-family: Arial, Helvetica, sans-serif; color: #000; }
  .toolbar { display: flex; justify-content: center; padding: 12px; }
  .toolbar button {
    padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer;
    border-radius: 6px; border: 1px solid #111; background: #111; color: #fff;
  }
  .page { margin: 16px auto; background: #fff; width: 210mm; min-height: 297mm; padding: 16mm; box-shadow: 0 2px 12px rgba(0,0,0,0.25); }
  .page h1 { font-size: 16px; text-transform: uppercase; letter-spacing: 0.04em; text-align: center; margin: 0 0 4px; }
  .page .meta-line { text-align: center; font-size: 12px; color: #444; margin: 0 0 20px; }
  .assembly-note { font-size: 12px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
  .question { margin-bottom: 14px; font-size: 13px; }
  .options { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 4px; padding-left: 20px; }
  @media print {
    body { background: #fff; }
    .toolbar { display: none; }
    .page { margin: 0; box-shadow: none; }
    @page { size: A4; margin: 0; }
  }
</style>
</head>
<body>
  <div class="toolbar"><button type="button" onclick="window.print()">Print / Save PDF</button></div>
  <div class="page">
    <h1>${escapeHtml(meta.batchName)} &mdash; ${escapeHtml(meta.setCode.replace("_", " "))}</h1>
    <p class="meta-line">Test Code: ${escapeHtml(meta.testCode)} &middot; ${escapeHtml(meta.subject)}</p>
    ${body}
  </div>
</body>
</html>`;
}
