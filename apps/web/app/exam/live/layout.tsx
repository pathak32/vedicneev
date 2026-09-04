import type { Metadata } from "next";
import type { ReactNode } from "react";

// Same noindex reasoning as app/exam/jnvst-live-mock/layout.tsx — every
// page under /exam/live/* is either a session-specific live mock or a
// catalog of them, neither of which should be indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function ExamLiveLayout({ children }: { children: ReactNode }) {
  return children;
}
