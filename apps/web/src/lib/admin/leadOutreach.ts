/**
 * Pure, framework-agnostic outreach copy for the /admin/leads pipeline. No
 * DB/env access, so it is safe to import from both the server (send route)
 * and the client (message previews in AdminLeadsManager) without pulling
 * Prisma into the browser bundle.
 *
 * Every template states only things that are true of the product (phone
 * camera grading, section-wise analysis, mistake report, 10 free credits)
 * and makes no statistics or personal claims.
 */

export const TRIAL_CREDIT_GRANT = 10;

export interface OutreachLead {
  instituteName: string;
  directorName: string;
  city: string;
  district: string;
  state: string;
}

/** "919876543210" -> "+91 98765 43210"; anything else just gets stripped to digits and a leading "+". */
export function formatLeadPhone(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, "");
  if (/^91\d{10}$/.test(digits)) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return `+${digits}`;
}

/**
 * Normalizes a director's raw phone input to the same "91XXXXXXXXXX" raw-
 * digit convention User.phone already uses elsewhere in this schema. A
 * bare 10-digit Indian mobile number is assumed local and gets the country
 * code prefixed; anything already carrying a country code (11+ digits) is
 * kept as-is.
 */
export function normalizeLeadPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName.trim();
}

/** First WhatsApp message, sent from "Approve & Send via WhatsApp". */
export function generateOutreachMessage(lead: OutreachLead): string {
  const director = lead.directorName.trim();
  const institute = lead.instituteName.trim();

  return [
    `Namaste ${director} ji,`,
    "",
    "I am from Vedic Neev. We built an OMR grading tool that works from a phone camera: scan a filled sheet, and the score, section-wise analysis and a mistake report for each student are ready in seconds.",
    "",
    `I think it could save ${institute} the evenings your teachers spend checking sheets by hand.`,
    "",
    `I would like to give you ${TRIAL_CREDIT_GRANT} free grading credits, enough to grade one real test batch. No payment, no card, no contract.`,
    "",
    'Reply "YES" and I will set it up on this number.',
    "",
    "Team Vedic Neev",
    "omrtest.vedicneev.com",
  ].join("\n");
}

/** WhatsApp nudge for a lead that has not replied to the first message. */
export function generateWhatsAppFollowUp(lead: OutreachLead): string {
  return [
    `Namaste ${lead.directorName.trim()} ji, a quick follow-up on my earlier message.`,
    "",
    `The ${TRIAL_CREDIT_GRANT} free grading credits are still reserved for ${lead.instituteName.trim()}. If you would like to try one real test batch, reply "YES" and I will set it up.`,
    "",
    "If this is not a good time, just tell me and I will not disturb you again.",
  ].join("\n");
}

/** LinkedIn connection note. Kept under LinkedIn's 300-character limit. */
export function generateLinkedInConnectionNote(lead: OutreachLead): string {
  const note = `Hi ${firstName(lead.directorName)}, I am connecting with coaching institute owners in ${lead.state.trim()}. We built a phone-based OMR grading tool and I would value your view on it. Happy to share a free trial batch, no pitch.`;
  return note.length <= 300 ? note : `${note.slice(0, 297)}...`;
}

/** First LinkedIn message after the lead accepts the connection. */
export function generateLinkedInFollowUp(lead: OutreachLead): string {
  return [
    `Thanks for connecting, ${firstName(lead.directorName)}.`,
    "",
    `One question, if you do not mind: how long do results take to reach your students after a mock test at ${lead.instituteName.trim()}?`,
    "",
    `We built a tool that grades OMR sheets from a phone camera, and I would like to learn whether it fits how you work. If it helps, I can set up ${TRIAL_CREDIT_GRANT} free grading credits so you can try one real batch.`,
    "",
    "No pressure either way.",
  ].join("\n");
}

/** Reply to someone who comments a keyword such as BATCH on a post. */
export function generateCommentReply(lead: OutreachLead): string {
  return [
    `Thanks ${firstName(lead.directorName)}. Here is how the free trial works:`,
    "",
    "1. Pick one real test batch.",
    `2. We set up your account with ${TRIAL_CREDIT_GRANT} grading credits.`,
    "3. You scan the sheets with a phone, and I will walk you through the first scan.",
    "",
    "Can I message you on WhatsApp to set it up? Send me your number or a message here.",
  ].join("\n");
}
