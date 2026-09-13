import type { PyqSeedItem } from "./types";
import mentalAbility from "./audit/class6-paper2/jnvst6-mental-ability.json";
import arithmetic from "./audit/class6-paper2/jnvst6-arithmetic.json";
import language from "./audit/class6-paper2/jnvst6-language.json";

// JNVST Class 6, Paper 2 — the first discrete admin-reviewed mock paper for
// this board/class (the original pool in jnvst-2021.ts..jnvst-2025.ts
// predates paperNumber/reviewStatus and defaults to Paper 1/PUBLISHED).
// Seeded as DRAFT — visible only on /admin/mock-papers until an admin
// publishes it; the mock-assembly pipeline in jnvstMockService.ts excludes
// DRAFT rows entirely. Sized to the jnvst-class-6 ExamTemplate's blueprint
// exactly (Mental Ability 40, Arithmetic 20, Language 20 = 80). Original
// practice items modeled on JNVST's known Class 6 pattern, NOT verbatim
// reproductions of any official paper. Drafted and verified in
// prisma/pyq-seed/audit/class6-paper2/.

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
  { sectionKey: mentalAbility.sectionKey, questions: mentalAbility.questions as unknown as AuditQuestion[] },
  { sectionKey: arithmetic.sectionKey, questions: arithmetic.questions as unknown as AuditQuestion[] },
  { sectionKey: language.sectionKey, questions: language.questions as unknown as AuditQuestion[] },
];

export const posts: PyqSeedItem[] = sections.flatMap(({ sectionKey, questions }) =>
  questions.map((q) => ({
    key: q.key,
    examType: "JNVST",
    classLevel: 6,
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
