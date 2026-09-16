"use client";

import Link from "next/link";

import { useLanguageStore } from "@/lib/i18n/useLanguageStore";
import { useT } from "@/lib/i18n/useT";
import { FAQ_GROUPS, HOMEPAGE_FAQ_COUNT, flattenFaqItems } from "@/lib/faqContent";
import { FaqAccordion, buildFaqJsonLd } from "./FaqAccordion";

/**
 * Condensed homepage FAQ teaser. The JSON-LD always describes the English
 * content — it's what a crawler actually sees on this single, un-prefixed
 * homepage URL (this app's Hindi support is a client-side visual toggle
 * here, not a separate /hi/ URL — only /faq itself gets a dedicated
 * bilingual URL pair, see app/hi/faq/page.tsx). The visible text below
 * still switches with the toggle for a human visitor.
 */
export function FaqSection() {
  const languageCode = useLanguageStore((s) => s.languageCode);
  const t = useT();

  const items = flattenFaqItems(FAQ_GROUPS)
    .slice(0, HOMEPAGE_FAQ_COUNT)
    .map((item) => ({ question: item.question[languageCode], answer: item.answer[languageCode] }));

  const jsonLdItems = flattenFaqItems(FAQ_GROUPS)
    .slice(0, HOMEPAGE_FAQ_COUNT)
    .map((item) => ({ question: item.question.en, answer: item.answer.en }));

  return (
    <section className="flex flex-col gap-4">
      {/* eslint-disable-next-line @next/next/no-sync-scripts -- static JSON-LD, not a loaded script */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildFaqJsonLd(jsonLdItems)) }} />
      <h2 className="text-xl font-bold text-foreground">
        {languageCode === "hi" ? "अक्सर पूछे जाने वाले प्रश्न" : "Frequently Asked Questions"}
      </h2>
      <FaqAccordion items={items} />
      <Link href="/faq" className="text-sm text-primary underline-offset-2 hover:underline">
        {t("navFaq")} →
      </Link>
    </section>
  );
}
