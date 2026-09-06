import type { PyqSeedItem } from "./types";
import mathAudit from "./audit/class9/jnvst-math.json";
import scienceAudit from "./audit/class9/jnvst-science.json";
import socialScienceAudit from "./audit/class9/jnvst-social-science.json";

// JNVST Class 9 lateral-entry PYQ practice bank: Mathematics (35),
// Science (35), Social Science (30) — one full paper's worth per
// section, matching the jnvst-class-9 ExamTemplate's blueprint exactly
// (see prisma/seed.ts), pooled from 5 year-labeled cohorts (2022-2026)
// for catalog/browsing purposes. Original practice items modeled on
// NVS's known Class 9 lateral-entry pattern, NOT verbatim reproductions
// of any official paper — see PreviousYearQuestion's doc comment in
// schema.prisma. Drafted and verified in prisma/pyq-seed/audit/class9/.

function fromAudit(audit: typeof mathAudit): PyqSeedItem[] {
  return audit.questions.map((q) => ({
    key: q.key,
    examType: "JNVST",
    classLevel: 9,
    year: q.year,
    sectionKey: audit.sectionKey,
    difficulty: q.difficulty as PyqSeedItem["difficulty"],
    questionJson: q.questionJson,
    optionsJson: q.optionsJson as PyqSeedItem["optionsJson"],
    correctAnswer: q.correctAnswer as 0 | 1 | 2 | 3,
    explanation: q.explanation,
    distractorAnalysis: q.distractorAnalysis as unknown as PyqSeedItem["distractorAnalysis"],
  }));
}

export const posts: PyqSeedItem[] = [
  ...fromAudit(mathAudit),
  ...fromAudit(scienceAudit),
  ...fromAudit(socialScienceAudit),
];
