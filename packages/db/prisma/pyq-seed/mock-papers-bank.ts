import { readdirSync, readFileSync } from "fs";
import { join } from "path";

import type { PyqSeedItem } from "./types";

// AISSEE / RMS discrete mock papers beyond the first one(s) per board/class:
//   Class 6 -> Papers 2-5, Class 9 -> Papers 3-5 (Class 6 P1 and Class 9 P1/P2
//   are loaded by their own *-paper1 / *-paper2 modules).
// Source JSON lives in audit/papers/<board><class>-p<N>-<section>[-a|-b].json
// (25 questions per file; the 50-question sections are split into -a / -b).
// Everything is seeded as DRAFT — visible only on /admin/mock-papers until an
// admin publishes it; the mock-assembly pipeline excludes DRAFT rows.

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

interface AuditFile {
  examType: "AISSEE" | "RMS";
  classLevel: number;
  paperNumber: number;
  sectionKey: string;
  questions: AuditQuestion[];
}

const PAPERS_DIR = join(__dirname, "audit", "papers");

export const posts: PyqSeedItem[] = readdirSync(PAPERS_DIR)
  .filter((file) => file.endsWith(".json"))
  .sort()
  .flatMap((file) => {
    const data = JSON.parse(readFileSync(join(PAPERS_DIR, file), "utf8")) as AuditFile;
    return data.questions.map(
      (q): PyqSeedItem => ({
        key: q.key,
        examType: data.examType,
        classLevel: data.classLevel,
        paperNumber: data.paperNumber,
        reviewStatus: "DRAFT",
        year: q.year,
        sectionKey: data.sectionKey,
        difficulty: q.difficulty,
        questionJson: q.questionJson,
        optionsJson: q.optionsJson,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        distractorAnalysis: q.distractorAnalysis,
      })
    );
  });
