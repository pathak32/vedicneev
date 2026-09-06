import { isLiveMockTemplateSlug, type LiveMockTemplateSlug } from "@/lib/exam/jnvstMockService";

/**
 * MOCK_SERIES/LIVE_BOOTCAMP products aren't tied to one specific
 * ExamTemplate — fulfillment resolves the concrete template from the
 * *buyer's own* targetExam/targetClass (same source the rest of the
 * dashboard already uses), same convention as LIVE_MOCK_TEMPLATE_SLUGS'
 * `${exam}-class-${level}` naming. Only Class 6/9 templates exist today,
 * so a student's raw targetClass (5/6/8/9) rounds to whichever of those
 * two it's closer to. Returns null when no template exists at all for
 * this exam (e.g. DPS has none yet).
 */
export function resolveLiveMockSlug(targetExam: string, targetClass: number): LiveMockTemplateSlug | null {
  const examLower = targetExam.toLowerCase();
  const level = targetClass <= 6 ? 6 : 9;
  const slug = `${examLower}-class-${level}`;
  return isLiveMockTemplateSlug(slug) ? slug : null;
}
