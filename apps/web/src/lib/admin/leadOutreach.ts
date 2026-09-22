/**
 * Pure, framework-agnostic outreach copy for the /admin/leads pipeline — no
 * DB/env access, so it's safe to import from both the server (send route)
 * and the client (live message preview in AdminLeadsManager) without
 * pulling Prisma into the browser bundle.
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
 * digit convention User.phone already uses elsewhere in this schema — a
 * bare 10-digit Indian mobile number is assumed local and gets the country
 * code prefixed; anything already carrying a country code (11+ digits) is
 * kept as-is.
 */
export function normalizeLeadPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  return digits.length === 10 ? `91${digits}` : digits;
}

/**
 * High-converting, personalized WhatsApp outreach copy for a coaching
 * director prepping students for JNVST/Sainik/RMS entrance exams — leads
 * with the director's own institute name, pitches the 3-second smartphone
 * OMR scan as the time-saving hook, and closes on the 10 free trial credits
 * as a zero-risk call to action.
 */
export function generateOutreachMessage(lead: OutreachLead): string {
  const director = lead.directorName.trim();
  const institute = lead.instituteName.trim();
  const locality = [lead.city, lead.district].filter(Boolean).join(", ");

  return [
    `Namaste ${director} ji,`,
    "",
    `I run the OMR grading desk at Vedic Neev, and I came across ${institute}'s work preparing students for JNVST, Sainik School, and RMS entrance exams${locality ? ` in ${locality}` : ""}.`,
    "",
    `Most coaching institutes lose 2-3 days every mock test just manually checking OMR sheets. Our app grades a full OMR sheet in under 3 seconds — straight from any teacher's smartphone camera, no scanner hardware needed. Section-wise analytics and a Mistake Vault for every student are generated instantly.`,
    "",
    `I'd like to gift ${institute} 10 FREE trial grading credits — no payment, no card, zero commitment. Enough to grade one full mock test batch and see the report quality yourself.`,
    "",
    `Reply "YES" and I'll activate your 10 free credits on this WhatsApp number right away.`,
    "",
    "— Team Vedic Neev (omrtest.vedicneev.com)",
  ].join("\n");
}
