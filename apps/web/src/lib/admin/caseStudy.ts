import { randomBytes } from "crypto";

import type { OutreachLead } from "./leadOutreach";

/** Unguessable token for the public /feedback/<token> link. */
export function generateFeedbackToken(): string {
  return randomBytes(18).toString("base64url");
}

/** The WhatsApp message that carries the feedback link. Sent by hand, in the admin's own words if they like. */
export function generateFeedbackRequestMessage(lead: OutreachLead, link: string): string {
  return [
    `Namaste ${lead.directorName.trim()} ji,`,
    "",
    `Thank you for trying VedicNeev with ${lead.instituteName.trim()}. I would really like your honest feedback on how the grading went.`,
    "",
    `Three short questions, about 2 minutes: ${link}`,
    "",
    "Good or bad, I want to hear it. At the end there is a tick box if you are happy for us to share your words. That is entirely your choice.",
  ].join("\n");
}

export interface CaseStudySource {
  instituteName: string;
  contactName: string;
  state: string;
  answerBefore: string | null;
  answerExperience: string | null;
  answerMissing: string | null;
  consentQuote: boolean;
  consentName: boolean;
  publishQuote: string | null;
}

export interface CaseStudyDraft {
  hookText: string;
  bodyContent: string;
  ctaText: string;
}

/**
 * Builds a LinkedIn draft out of a pilot's own answers. Their words are
 * copied verbatim, never paraphrased, and the draft is refused unless the
 * contact consented to being quoted and an admin picked the featured quote.
 * The contact is named only if they separately ticked the name consent.
 */
export function composeCaseStudyDraft(source: CaseStudySource): CaseStudyDraft | { error: string } {
  if (!source.consentQuote) return { error: "The contact did not consent to being quoted." };
  const quote = source.publishQuote?.trim();
  if (!quote) return { error: "Pick the quote to feature first." };

  const who = source.consentName
    ? `${source.contactName.trim()} of ${source.instituteName.trim()}`
    : `The owner of a coaching institute${source.state.trim() ? ` in ${source.state.trim()}` : ""}`;

  const parts = [`${who} graded one real test batch with VedicNeev. Here is what they told us, in their own words.`];
  if (source.answerBefore?.trim()) parts.push(`Before: ${source.answerBefore.trim()}`);
  if (source.answerExperience?.trim()) parts.push(`What they noticed: ${source.answerExperience.trim()}`);
  if (source.answerMissing?.trim()) parts.push(`What was missing: ${source.answerMissing.trim()}`);
  parts.push("We are a young product. Feedback like this, good and bad, is how it gets better.");

  return {
    hookText: `"${quote}"`,
    bodyContent: parts.join("\n\n"),
    ctaText: 'Want to try one real batch free? Comment "BATCH".',
  };
}
