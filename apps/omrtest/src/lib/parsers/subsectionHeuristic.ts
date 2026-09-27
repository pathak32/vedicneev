export interface TaxonomySubsection {
  id: string;
  name: string;
  subjectId: string;
}

// Deliberately keyword-based, not ML/NLP — same spirit as
// documentParser.ts's own pattern-based parsing (see its comment): never
// authoritative, only ever a starting-point guess the tagging UI shows as
// an editable, overridable default before anything is saved.
const KEYWORD_RULES: { pattern: RegExp; subsectionName: string }[] = [
  { pattern: /\b(speed|distance|km\/hr|kmph|meters? per second|m\/s)\b/i, subsectionName: "Speed/Time/Distance" },
  { pattern: /\bfractions?\b|\bdecimals?\b/i, subsectionName: "Fractions & Decimals" },
  { pattern: /\bpercent/i, subsectionName: "Percentage" },
  { pattern: /\bsimplif/i, subsectionName: "Simplification" },
  { pattern: /\bprofit\b|\bloss\b|\bdiscount\b/i, subsectionName: "Profit & Loss" },
  { pattern: /\bratio\b|\bproportion\b/i, subsectionName: "Ratio & Proportion" },
  { pattern: /\barea\b|\bperimeter\b|sq\.?\s*units?/i, subsectionName: "Area & Perimeter" },
  { pattern: /\blcm\b|\bhcf\b|\bmultiples?\b|\bfactors?\b/i, subsectionName: "LCM & HCF" },
  { pattern: /\bcod(e|ing)\b|\bdecod(e|ing)\b|\bcipher\b/i, subsectionName: "Coding-Decoding" },
  { pattern: /mirror image|water image/i, subsectionName: "Mirror & Water Images" },
  { pattern: /\banalog(y|ous)\b/i, subsectionName: "Analogy" },
  { pattern: /\bseries\b|\bsequence\b/i, subsectionName: "Series Completion" },
  { pattern: /odd one out|does not belong/i, subsectionName: "Odd One Out" },
  { pattern: /\bpattern\b/i, subsectionName: "Pattern Completion" },
  { pattern: /\bpassage\b|\bcomprehension\b/i, subsectionName: "Reading Comprehension" },
  { pattern: /\bgrammar\b|\btense\b|\bverb\b|\bnoun\b|\badjective\b/i, subsectionName: "Grammar & Usage" },
  { pattern: /\bsynonym\b|\bantonym\b|meaning of the word|\bvocabulary\b/i, subsectionName: "Vocabulary" },
  { pattern: /correct(ed)? sentence|error in the sentence/i, subsectionName: "Sentence Correction" },
  { pattern: /capital of|\briver\b|\bmountain\b|\bcontinent\b/i, subsectionName: "Geography" },
  { pattern: /\bpresident\b|\bconstitution\b|\bparliament\b|\bindependence\b/i, subsectionName: "History & Civics" },
  { pattern: /\bplanet\b|photosynthesis|\bcell\b|\benergy\b|\bforce\b|\bgravity\b/i, subsectionName: "Science & Environment" },
  { pattern: /current affairs|\brecently\b|\bawarded?\b/i, subsectionName: "Current Affairs" },
];

/** First matching rule wins; returns null (never guessed) rather than a wrong subject's subsection with the same name. */
export function guessSubsectionId(questionText: string, subsections: TaxonomySubsection[]): string | null {
  for (const rule of KEYWORD_RULES) {
    if (rule.pattern.test(questionText)) {
      const match = subsections.find((s) => s.name === rule.subsectionName);
      if (match) return match.id;
    }
  }
  return null;
}
