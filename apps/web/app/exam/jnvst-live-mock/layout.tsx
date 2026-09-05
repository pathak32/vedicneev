import type { Metadata } from "next";
import type { ReactNode } from "react";

// This route's own page.tsx is a "use client" component and can't export
// `metadata` itself (only Server Components can) — its comment already
// states the intent ("same noindex reasoning as the rest of /exam/*"), but
// nothing was actually enforcing it, so the route was inheriting the root
// layout's default `index: true`. This layout is what actually applies it;
// see app/dashboard/layout.tsx for why noindex, not a robots.txt disallow.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function JnvstLiveMockLayout({ children }: { children: ReactNode }) {
  return children;
}
