import { Landmark, ShieldCheck, Swords } from "lucide-react";

/**
 * Static catalog config for the /pyq/class-9 pages — the URL-facing exam
 * key (lowercase, e.g. "jnvst") plus the matching ExamType enum value and
 * ExamTemplate.slug (see LIVE_MOCK_TEMPLATE_SLUGS in jnvstMockService.ts,
 * which already knows how to assemble a mock from PreviousYearQuestion for
 * all three of these). Tagline/icon match ExamSelectorModal.tsx for visual
 * consistency with the rest of the app.
 */
export const PYQ_CLASS9_EXAMS = [
  {
    key: "jnvst",
    examType: "JNVST" as const,
    templateSlug: "jnvst-class-9",
    title: "JNVST",
    board: "Navodaya Vidyalaya",
    tagline: "Jawahar Navodaya Vidyalaya",
    icon: Landmark,
  },
  {
    key: "aissee",
    examType: "AISSEE" as const,
    templateSlug: "aissee-class-9",
    title: "AISSEE",
    board: "Sainik School",
    tagline: "Sainik School Entrance",
    icon: ShieldCheck,
  },
  {
    key: "rms",
    examType: "RMS" as const,
    templateSlug: "rms-class-9",
    title: "RMS",
    board: "Military School",
    tagline: "Rashtriya Military School",
    icon: Swords,
  },
] as const;

export type PyqClass9ExamKey = (typeof PYQ_CLASS9_EXAMS)[number]["key"];

export function findPyqClass9Exam(key: string) {
  return PYQ_CLASS9_EXAMS.find((exam) => exam.key === key);
}

/** The 5-year window this practice bank pools content from (2022-2026) — see PreviousYearQuestion's doc comment in schema.prisma. */
export const PYQ_CLASS9_YEARS = [2022, 2023, 2024, 2025, 2026] as const;

export function isPyqClass9Year(value: string): value is `${(typeof PYQ_CLASS9_YEARS)[number]}` {
  return (PYQ_CLASS9_YEARS as readonly number[]).includes(Number(value));
}
