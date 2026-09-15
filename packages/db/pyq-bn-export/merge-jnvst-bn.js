const fs = require("fs");
const path = require("path");

const withoutBn = require("./pyq-bn-export/without-bn.json");
const drafts = require("./pyq-bn-export/jnvst-bn-drafts.json");

const jnvstRows = withoutBn.filter((r) => r.examType === "JNVST");

const errors = [];
const merged = [];

for (const r of jnvstRows) {
  const draft = drafts[r.key];
  if (!draft) {
    errors.push(`${r.key}: no draft found`);
    continue;
  }
  if (!Array.isArray(draft.opts) || draft.opts.length !== r.optionsJson.length) {
    errors.push(`${r.key}: option count mismatch (expected ${r.optionsJson.length}, got ${draft.opts?.length})`);
    continue;
  }
  merged.push({
    key: r.key,
    examType: r.examType,
    paperNumber: r.paperNumber,
    section: r.section.key,
    year: r.year,
    difficulty: r.difficulty,
    correctAnswer: r.correctAnswer,
    question_en: r.questionJson.en,
    question_hi: r.questionJson.hi,
    question_mr: r.questionJson.mr,
    question_bn_draft: draft.q,
    options_en: r.optionsJson.map((o) => o.en),
    options_hi: r.optionsJson.map((o) => o.hi),
    options_mr: r.optionsJson.map((o) => o.mr),
    options_bn_draft: draft.opts,
    explanation_en: r.explanation.en,
    explanation_hi: r.explanation.hi,
    explanation_mr: r.explanation.mr,
    explanation_bn_draft: draft.exp,
  });
}

console.log("Total JNVST rows needing bn:", jnvstRows.length);
console.log("Merged successfully:", merged.length);
if (errors.length) {
  console.log("ERRORS:", errors.length);
  errors.forEach((e) => console.log(" -", e));
} else {
  console.log("No errors — every row has a matching, option-count-correct draft.");
}

// Also confirm coverage: every draft key must correspond to a real row (catches typos).
const rowKeys = new Set(jnvstRows.map((r) => r.key));
const extraDraftKeys = Object.keys(drafts).filter((k) => !rowKeys.has(k));
if (extraDraftKeys.length) {
  console.log("Draft keys with no matching DB row (possible typo):", extraDraftKeys);
}

fs.writeFileSync(path.join(__dirname, "pyq-bn-export", "jnvst-merged-for-review.json"), JSON.stringify(merged, null, 2));
console.log("Wrote jnvst-merged-for-review.json with", merged.length, "rows");
