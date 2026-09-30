/**
 * Client-facing shape + pure lookup helper for TopicNotePdf (see that
 * model's schema comment) — the externally-authored handwritten-style
 * per-topic PDF registry, mirrors media.ts's findMediaForTopic pattern.
 */

export interface StudyNoteTopicPdf {
  id: string;
  classLevel: number;
  topicNumber: number;
  sectionKey: string;
  titleEn: string;
  titleHi: string | null;
  /** The matched Topic's stable `key` (e.g. "fractions_decimals"), never its DB cuid — null when this note hasn't been confidently matched to a specific Topic (see TopicNotePdf.matchedTopicId's schema comment). */
  matchedTopicKey: string | null;
  pdfUrlEn: string | null;
  pdfUrlHi: string | null;
}

/** Exact match only — a topic with no confidently-matched note returns undefined rather than a section-level guess, so a caller never shows a misleading link. */
export function findStudyNoteForTopic(items: StudyNoteTopicPdf[], topicKey: string): StudyNoteTopicPdf | undefined {
  return items.find((item) => item.matchedTopicKey === topicKey);
}
