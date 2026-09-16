export interface PlainFaqItem {
  question: string;
  answer: string;
}

/** Pure, lang-agnostic renderer — native <details>/<summary> disclosures, same accessible zero-dependency pattern apps/web/app/faq/page.tsx already uses. Callers pass already-localized strings. */
export function FaqAccordion({ items }: { items: PlainFaqItem[] }) {
  return (
    <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
      {items.map((item) => (
        <details key={item.question} className="group p-4 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground md:text-base">
            {item.question}
            <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function buildFaqJsonLd(items: PlainFaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
