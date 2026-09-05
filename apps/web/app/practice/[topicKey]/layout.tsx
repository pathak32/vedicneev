import type { Metadata } from "next";
import type { ReactNode } from "react";

// Same noindex reasoning as app/exam/live/layout.tsx — every page under
// /practice/* is a session-specific topic drill, never worth indexing.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function PracticeLayout({ children }: { children: ReactNode }) {
  return children;
}
