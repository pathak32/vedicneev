import type { PyqSeedItem } from "./types";
import mathAudit from "./audit/class9/aissee-rms-math.json";
import mentalAbilityAudit from "./audit/class9/aissee-rms-mental-ability.json";
import scienceAudit from "./audit/class9/aissee-rms-science.json";
import gkAudit from "./audit/class9/aissee-rms-gk.json";

// AISSEE/RMS Class 9 PYQ practice bank. AISSEE and RMS Class 6 already
// share one structural pattern in prisma/seed.ts (the Class 6 template
// literally reuses `aisseeSections` as `rmsSections`) — this file follows
// the same convention for Class 9: one base content pool (Mathematics 50,
// Mental Ability 25, Science 25, General Knowledge 25 — matching the
// aissee-class-9/rms-class-9 ExamTemplate blueprints, which are
// identical), seeded twice under each board's own examType/key so the two
// boards' PYQ pools stay independent rows even though the content is
// shared. Original practice items, NOT verbatim reproductions of any
// official paper — see PreviousYearQuestion's doc comment in
// schema.prisma. Drafted and verified in prisma/pyq-seed/audit/class9/.

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
const basePool: { sectionKey: string; questions: AuditQuestion[] }[] = [mathAudit, mentalAbilityAudit, scienceAudit, gkAudit].map((audit) => ({
  sectionKey: audit.sectionKey,
  questions: audit.questions as unknown as AuditQuestion[],
}));

function toItems(examType: "AISSEE" | "RMS"): PyqSeedItem[] {
  return basePool.flatMap(({ sectionKey, questions }) =>
    questions.map((q) => ({
      key: examType === "AISSEE" ? q.key : q.key.replace(/^aissee9-/, "rms9-"),
      examType,
      classLevel: 9,
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
}

export const posts: PyqSeedItem[] = [...toItems("AISSEE"), ...toItems("RMS")];
