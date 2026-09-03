import type { Metadata } from "next";

import { getDemoSession } from "@/lib/exam/mock-data";
import { SITE_NAME } from "@/lib/siteConfig";

// examId is already validated and noindex is already set by
// app/exam/[examId]/layout.tsx (inherited automatically) — this only adds a
// title distinct from the exam player's.
//
// The " | Vedic Neev" suffix is spelled out here rather than left to the
// root layout's title template: Next.js only applies a `title.template`
// to the segment immediately below the layout that defines it, not to
// further-nested segments — two levels down (root → exam/[examId] →
// results), the template no longer applies, so a plain string here would
// silently lose the suffix.
export function generateMetadata({ params }: { params: { examId: string } }): Metadata {
  const session = getDemoSession(params.examId);
  return { title: session ? `Results: ${session.templateName.en} | ${SITE_NAME}` : undefined };
}

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
