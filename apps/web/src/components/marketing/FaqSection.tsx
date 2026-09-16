"use client";

import Link from "next/link";

import { useT } from "@/lib/i18n/useT";
import { DICTIONARY, type DictionaryKey } from "@/lib/i18n/dictionary";

const ITEMS: { q: DictionaryKey; a: DictionaryKey }[] = [
  { q: "faqQLanguages", a: "faqALanguages" },
  { q: "faqQFree", a: "faqAFree" },
  { q: "faqQWhatsapp", a: "faqAWhatsapp" },
  { q: "faqQNegativeMarking", a: "faqANegativeMarking" },
  { q: "faqQSiblings", a: "faqASiblings" },
];

/**
 * Condensed homepage FAQ teaser — same native <details>/<summary> pattern
 * as the full /faq page. JSON-LD always describes the English content: a
 * crawler sees this single un-prefixed homepage URL regardless of a
 * visitor's client-side language toggle, so the structured data matches
 * what's actually indexed there; the full bilingual set lives at its own
 * /faq + /hi/faq URLs (see app/faq/page.tsx, app/hi/faq/page.tsx).
 */
export function FaqSection() {
  const t = useT();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ITEMS.map(({ q, a }) => ({
      "@type": "Question",
      name: DICTIONARY[q].en,
      acceptedAnswer: { "@type": "Answer", text: DICTIONARY[a].en },
    })),
  };

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-16 md:px-8">
      {/* eslint-disable-next-line @next/next/no-sync-scripts -- static JSON-LD, not a loaded script */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <h2 className="text-2xl font-extrabold text-foreground">{t("faqSectionTitle")}</h2>

      <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {ITEMS.map(({ q, a }) => (
          <details key={q} className="group p-4 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground md:text-base">
              {t(q)}
              <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t(a)}</p>
          </details>
        ))}
      </div>

      <Link href="/faq" className="text-sm text-primary underline-offset-2 hover:underline">
        {t("faqSectionSeeMore")} →
      </Link>
    </section>
  );
}
