import { FAQ_GROUPS } from "@/lib/faqContent";
import { FaqAccordion, buildFaqJsonLd, type PlainFaqItem } from "./FaqAccordion";

const COPY = {
  en: {
    title: "Frequently Asked Questions",
    subtitle: "Common questions about target exams, layouts, backspace rules, scoring, and WhatsApp scorecards.",
  },
  hi: {
    title: "अक्सर पूछे जाने वाले प्रश्न",
    subtitle: "लक्ष्य परीक्षा, लेआउट, बैकस्पेस नियम, स्कोरिंग और व्हाट्सएप स्कोरकार्ड के बारे में सामान्य प्रश्न।",
  },
};

/** Server-rendered, real per-language URL (app/faq/page.tsx + app/hi/faq/page.tsx both call this) — so the JSON-LD and visible content match the URL a crawler actually indexes, unlike the homepage's client-toggled FaqSection. */
export function FaqPageContent({ lang }: { lang: "en" | "hi" }) {
  const copy = COPY[lang];
  const allItems: PlainFaqItem[] = FAQ_GROUPS.flatMap((group) =>
    group.items.map((item) => ({ question: item.question[lang], answer: item.answer[lang] }))
  );

  return (
    <div className="container mx-auto flex max-w-2xl flex-col gap-8 px-4 py-12">
      {/* eslint-disable-next-line @next/next/no-sync-scripts -- static JSON-LD, not a loaded script */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(allItems)) }} />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">{copy.title}</h1>
        <p className="text-muted-foreground">{copy.subtitle}</p>
      </div>

      {FAQ_GROUPS.map((group) => (
        <section key={group.heading.en} className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-foreground">{group.heading[lang]}</h2>
          <FaqAccordion items={group.items.map((item) => ({ question: item.question[lang], answer: item.answer[lang] }))} />
        </section>
      ))}
    </div>
  );
}
