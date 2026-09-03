export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

/**
 * PLACEHOLDER CONTENT — Vedic Neev has no real customers yet (the whole
 * payment/auth/WhatsApp stack runs in mock mode; see CLAUDE.md and
 * apps/web/src/lib/payments/CheckoutFlow.tsx). These are illustrative
 * sample quotes to demonstrate the testimonial carousel's design, kept
 * deliberately generic (no fabricated scores, ranks, or specific outcomes).
 *
 * Replace every entry here with real, consented quotes from actual
 * students/parents before this ships to production — do not deploy this
 * array as-is to a public site.
 */
export const SAMPLE_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "The Mistake Vault changed how my daughter reviews mock tests — she's not just re-reading questions, she can see exactly which ones were careless mistakes versus things she needs to actually relearn.",
    name: "A parent",
    role: "Class 6 JNVST aspirant",
    initials: "P",
  },
  {
    quote:
      "The ×11 shortcut alone shaved real time off my arithmetic section. Having the speed-hack pop up right on the question where it applies made it click instantly, not just as a rule I'd memorized.",
    name: "A student",
    role: "AISSEE aspirant",
    initials: "S",
  },
  {
    quote:
      "I liked seeing the admission probability against real cutoff data for our state and category instead of a generic percentile — it made the prep feel targeted instead of guesswork.",
    name: "A parent",
    role: "RMS aspirant",
    initials: "P",
  },
];
