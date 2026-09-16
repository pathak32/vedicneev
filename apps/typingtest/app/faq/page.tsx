import type { Metadata } from "next";

import { FaqPageContent } from "@/components/FaqPageContent";

const title = "FAQ — Government Exam Typing Practice";
const description =
  "Answers about target exams, Inscript/Remington layouts, backspace rules, Gross/Net Speed scoring, and WhatsApp scorecards on VedicNeev Typing Test.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/faq", languages: { en: "/faq", hi: "/hi/faq" } },
  openGraph: { title, description, url: "/faq" },
};

export default function FaqPage() {
  return <FaqPageContent lang="en" />;
}
