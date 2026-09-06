import type { Metadata } from "next";
import type { ReactNode } from "react";

// Same noindex reasoning as app/exam/live/layout.tsx — everything under
// /practice is either the topic catalog (this layout) or a session-specific
// drill (app/practice/[topicKey]/layout.tsx, nested under this one), and
// neither should be indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function PracticeCatalogLayout({ children }: { children: ReactNode }) {
  return children;
}
