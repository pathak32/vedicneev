import type { PyqSeedItem } from "./types";
import arithmetic from "./audit/class6-paper1/rms6-arithmetic.json";
import mentalAbility from "./audit/class6-paper1/rms6-mental-ability.json";
import language from "./audit/class6-paper1/rms6-language.json";
import gk from "./audit/class6-paper1/rms6-gk.json";

// RMS Class 6, Paper 1 — the first of 20 planned discrete mock papers for
// this board/class (see PreviousYearQuestion.paperNumber/reviewStatus in
// schema.prisma). Seeded as DRAFT — visible only on /admin/mock-papers
// until an admin publishes it; the mock-assembly pipeline in
// jnvstMockService.ts excludes DRAFT rows entirely. Independently
// authored from AISSEE's Class 6 Paper 1, not shared content. Drafted and
// verified in prisma/pyq-seed/audit/class6-paper1/.

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
  { sectionKey: arithmetic.sectionKey, questions: arithmetic.questions as unknown as AuditQuestion[] },
  { sectionKey: mentalAbility.sectionKey, questions: mentalAbility.questions as unknown as AuditQuestion[] },
  { sectionKey: language.sectionKey, questions: language.questions as unknown as AuditQuestion[] },
  { sectionKey: gk.sectionKey, questions: gk.questions as unknown as AuditQuestion[] },
];

export const posts: PyqSeedItem[] = sections.flatMap(({ sectionKey, questions }) =>
  questions.map((q) => ({
    key: q.key,
    examType: "RMS",
    classLevel: 6,
    paperNumber: 1,
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
