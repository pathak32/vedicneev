import type { PyqSeedItem } from "./types";
import mathAudit from "./audit/class9-paper2/jnvst9-math.json";
import scienceAudit from "./audit/class9-paper2/jnvst9-science.json";
import socialScienceAudit from "./audit/class9-paper2/jnvst9-social-science.json";

// JNVST Class 9, Paper 2 — the first discrete admin-reviewed mock paper for
// this board/class (the original pool in jnvst-class-9.ts predates
// paperNumber/reviewStatus and defaults to Paper 1/PUBLISHED). Seeded as
// DRAFT — visible only on /admin/mock-papers until an admin publishes it;
// the mock-assembly pipeline in jnvstMockService.ts excludes DRAFT rows
// entirely. Sized to the jnvst-class-9 ExamTemplate's blueprint exactly
// (Mathematics 35, Science 35, Social Science 30 = 100). Original practice
// items modeled on NVS's known Class 9 lateral-entry pattern, NOT verbatim
// reproductions of any official paper. Drafted and verified in
// prisma/pyq-seed/audit/class9-paper2/.

interface AuditQuestion {
  key: string;
  year: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questionJson: PyqSeedItem["questionJson"];
  optionsJson: PyqSeedItem["optionsJson"];
  correctAnswer: 0 | 1 | 2 | 3;
  explanation: PyqSeedItem["explanation"];
  distractorAnalysis?: PyqSeedItem["distractorAnalysis"];
}

const sections: { sectionKey: string; questions: AuditQuestion[] }[] = [
  { sectionKey: mathAudit.sectionKey, questions: mathAudit.questions as unknown as AuditQuestion[] },
  { sectionKey: scienceAudit.sectionKey, questions: scienceAudit.questions as unknown as AuditQuestion[] },
  { sectionKey: socialScienceAudit.sectionKey, questions: socialScienceAudit.questions as unknown as AuditQuestion[] },
];

export const posts: PyqSeedItem[] = sections.flatMap(({ sectionKey, questions }) =>
  questions.map((q) => ({
    key: q.key,
    examType: "JNVST",
    classLevel: 9,
    paperNumber: 2,
    reviewStatus: "DRAFT",
    year: q.year,
    sectionKey,
    difficulty: q.difficulty,
    questionJson: q.questionJson,
    optionsJson: q.optionsJson,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    distractorAnalysis: q.distractorAnalysis,
  }))
);
