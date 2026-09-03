import type { Metadata } from "next";

const title = "The Vedic Neev Blog";
const description =
  "Practical, honest guidance on JNVST, AISSEE, and RMS preparation — eligibility, syllabus, Vedic speed-math, exam-day strategy, and real talk for parents.";

export const metadata: Metadata = {
  title: { default: title, template: "%s | Vedic Neev Blog" },
  description,
  alternates: { canonical: "/blog" },
  openGraph: { title, description, url: "/blog", type: "website" },
  twitter: { title, description },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
