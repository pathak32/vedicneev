import type { PyqSeedItem } from "./types";
import mathematics from "./audit/class9-paper2/aissee9-math.json";
import mentalAbility from "./audit/class9-paper2/aissee9-mental-ability.json";
import science from "./audit/class9-paper2/aissee9-science.json";
import gk from "./audit/class9-paper2/aissee9-gk.json";

// AISSEE Class 9, Paper 2 — the existing pool seeded by aissee-rms-class-9.ts
// implicitly became "Paper 1" (already published) once paperNumber was
// added to the schema; this is the next new paper in the 20-paper target
// for this board/class (see PreviousYearQuestion.paperNumber/reviewStatus
// in schema.prisma). Seeded as DRAFT — visible only on /admin/mock-papers
// until an admin publishes it. Drafted and verified in
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
  { sectionKey: mathematics.sectionKey, questions: mathematics.questions as unknown as AuditQuestion[] },
  { sectionKey: mentalAbility.sectionKey, questions: mentalAbility.questions as unknown as AuditQuestion[] },
  { sectionKey: science.sectionKey, questions: science.questions as unknown as AuditQuestion[] },
  { sectionKey: gk.sectionKey, questions: gk.questions as unknown as AuditQuestion[] },
];

export const posts: PyqSeedItem[] = sections.flatMap(({ sectionKey, questions }) =>
  questions.map((q) => ({
    key: q.key,
    examType: "AISSEE",
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
