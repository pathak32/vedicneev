import type { Metadata } from "next";

const title = "Learn Vedic Speed-Math & Concept Clinics";
const description =
  "Free previews of Vedic speed-math shortcuts, concept clinic videos, and audio pods for JNVST, AISSEE, and RMS aspirants — mental ability, arithmetic, and language, section by section.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/learn" },
  openGraph: { title, description, url: "/learn" },
  twitter: { title, description },
};

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return children;
}
