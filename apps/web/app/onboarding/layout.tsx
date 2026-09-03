import type { Metadata } from "next";

// Mid-signup account setup — never meant to rank; see app/parent/layout.tsx
// for why this is noindex rather than a robots.txt disallow.
export const metadata: Metadata = {
  title: "Add a Student Profile",
  robots: { index: false, follow: true },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
