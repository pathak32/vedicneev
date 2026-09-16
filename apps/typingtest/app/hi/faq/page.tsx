import type { Metadata } from "next";

import { FaqPageContent } from "@/components/FaqPageContent";

const title = "सामान्य प्रश्न — सरकारी परीक्षा टंकण अभ्यास";
const description =
  "लक्ष्य परीक्षा, इंस्क्रिप्ट/रेमिंगटन लेआउट, बैकस्पेस नियम, ग्रॉस/नेट गति स्कोरिंग, और व्हाट्सएप स्कोरकार्ड के बारे में उत्तर।";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/hi/faq", languages: { en: "/faq", hi: "/hi/faq" } },
  openGraph: { title, description, url: "/hi/faq" },
};

export default function FaqPageHindi() {
  return <FaqPageContent lang="hi" />;
}
