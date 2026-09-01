import type {
  AdmissionProbabilityResult,
  DiagnosticReportForWhatsApp,
  StudentProfileForReport,
} from "@vedicneev/engine";

import type { StudentProfile } from "@/lib/auth/types";
import type { DiagnosticReport, MistakeReport } from "@/lib/exam/diagnostics";

const TAG_LABELS: Record<string, string> = {
  CARELESS_RUSHED: "Careless / Rushed error",
  CONCEPT_GAP: "Concept Gap",
  CALCULATION_GAP: "Calculation Gap",
};

export function summarizeTopMistakeTag(
  mistakes: Pick<MistakeReport, "mistakeTag">[]
): { label: string; count: number } | null {
  if (mistakes.length === 0) return null;
  const counts = new Map<string, number>();
  for (const m of mistakes) counts.set(m.mistakeTag, (counts.get(m.mistakeTag) ?? 0) + 1);
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]!;
  const [tag, count] = top;
  return { label: TAG_LABELS[tag] ?? tag, count };
}

/**
 * Bridges apps/web's live diagnostic report into the engine's WhatsApp
 * formatter input. `reportUrl` should be an absolute link back into this
 * app — note it only resolves within the browser that took the test, since
 * nothing here persists to a real server the link could be opened from
 * elsewhere.
 */
export function buildDiagnosticReportForWhatsApp(
  report: DiagnosticReport,
  admissionProbability: AdmissionProbabilityResult,
  reportUrl: string
): DiagnosticReportForWhatsApp {
  return {
    totalMarks: report.totalMarks,
    maxMarks: report.maxMarks,
    accuracyPercent: report.accuracyPercent,
    admissionChance: admissionProbability.selectionChance,
    topMistakeTag: summarizeTopMistakeTag(report.mistakes),
    reportUrl,
  };
}

export function studentToWhatsAppProfile(student: StudentProfile): StudentProfileForReport {
  return { fullName: student.fullName, targetExam: student.targetExam };
}
