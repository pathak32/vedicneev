import type { Metadata } from "next";

const title = "The Coaching Operational Efficiency & Time-Waste Calculator";
const description =
  "Slide to see how many hours and how much faculty money manual paper checking drains from your coaching academy every month — versus automated OMR scanning.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/coaching-calculator" },
  openGraph: { title, description, url: "/coaching-calculator" },
  twitter: { title, description },
};

export default function CoachingCalculatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
