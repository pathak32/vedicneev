import type { Metadata } from "next";

import { getDemoSession } from "@/lib/exam/mock-data";
import { SITE_NAME } from "@/lib/siteConfig";

// examId is already validated and noindex is already set by
// app/exam/[examId]/layout.tsx (inherited automatically) — this only adds a
// title distinct from the exam player and results routes. The suffix is
// spelled out explicitly rather than relying on the root layout's title
// template — see the comment in ../results/layout.tsx for why.
export function generateMetadata({ params }: { params: { examId: string } }): Metadata {
  const session = getDemoSession(params.examId);
  return { title: session ? `OMR Sheet: ${session.templateName.en} | ${SITE_NAME}` : undefined };
}

export default function OmrLayout({ children }: { children: React.ReactNode }) {
  return children;
}
